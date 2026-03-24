import { Router, type IRouter } from "express";
import { GetSummonerAnalysisResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const RIOT_API_KEY = process.env.RIOT_API_KEY ?? "";

const REGION_TO_CLUSTER: Record<string, string> = {
  NA1: "americas",
  BR1: "americas",
  LA1: "americas",
  LA2: "americas",
  KR: "asia",
  JP1: "asia",
  EUW1: "europe",
  EUN1: "europe",
  TR1: "europe",
  RU: "europe",
  OC1: "sea",
  PH2: "sea",
  SG2: "sea",
  TH2: "sea",
  TW2: "sea",
  VN2: "sea",
};

interface MatchData {
  matchId: string;
  gameMode: string;
  gameDuration: number;
  gameEndTimestamp: number;
  win: boolean;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealt: number;
  goldEarned: number;
  cs: number;
  visionScore: number;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  const variance = arr.reduce((sum, val) => sum + (val - avg) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function rateValue(value: number, thresholds: [number, string][]): string {
  for (const [threshold, label] of thresholds) {
    if (value >= threshold) return label;
  }
  return thresholds[thresholds.length - 1][1];
}

function computeKda(kills: number, deaths: number, assists: number): number {
  if (deaths === 0) return kills + assists;
  return (kills + assists) / deaths;
}

function computeAnalysis(matches: MatchData[]) {
  const totalGames = matches.length;

  if (totalGames === 0) {
    return {
      overallScore: 0,
      overallRating: "Insufficient Data",
      totalGamesAnalyzed: 0,
      winRate: 0,
      metrics: [],
      championBreakdown: [],
      formTrend: {
        recentWinRate: 0,
        overallWinRate: 0,
        recentKda: 0,
        overallKda: 0,
        trend: "neutral",
        trendDescription: "Not enough data to determine trend",
        recentGames: 0,
      },
      strengths: [],
      weaknesses: [],
    };
  }

  const wins = matches.filter((m) => m.win).length;
  const winRate = (wins / totalGames) * 100;

  const kdas = matches.map((m) => computeKda(m.kills, m.deaths, m.assists));
  const csPerMin = matches.map((m) => (m.gameDuration > 0 ? (m.cs / m.gameDuration) * 60 : 0));
  const dmgPerMin = matches.map((m) => (m.gameDuration > 0 ? (m.totalDamageDealt / m.gameDuration) * 60 : 0));
  const goldPerMin = matches.map((m) => (m.gameDuration > 0 ? (m.goldEarned / m.gameDuration) * 60 : 0));
  const visionPerMin = matches.map((m) => (m.gameDuration > 0 ? (m.visionScore / m.gameDuration) * 60 : 0));
  const deathsArr = matches.map((m) => m.deaths);
  const dmgPerGold = matches.map((m) => (m.goldEarned > 0 ? m.totalDamageDealt / m.goldEarned : 0));

  const avgKda = mean(kdas);
  const avgCsPerMin = mean(csPerMin);
  const avgDmgPerMin = mean(dmgPerMin);
  const avgGoldPerMin = mean(goldPerMin);
  const avgVisionPerMin = mean(visionPerMin);
  const avgDeaths = mean(deathsArr);
  const avgDmgPerGold = mean(dmgPerGold);

  // --- KDA Score (0-100) ---
  // KDA of 2.0 = ~40, 3.0 = ~60, 5.0 = ~80, 8.0+ = ~95+
  const kdaScore = clamp(Math.log2(avgKda + 1) * 30, 0, 100);
  const kdaRating = rateValue(avgKda, [
    [8, "Legendary"],
    [5, "Excellent"],
    [3, "Good"],
    [2, "Average"],
    [1.5, "Below Average"],
    [0, "Poor"],
  ]);

  // --- CS Efficiency (0-100) ---
  // 6 cs/min = ~50, 8 cs/min = ~75, 10+ cs/min = ~95+
  const csScore = clamp((avgCsPerMin / 10) * 100, 0, 100);
  const csRating = rateValue(avgCsPerMin, [
    [9, "Elite"],
    [7.5, "Excellent"],
    [6, "Good"],
    [5, "Average"],
    [4, "Below Average"],
    [0, "Poor"],
  ]);

  // --- Vision Control (0-100) ---
  // 0.5/min = ~33, 1.0/min = ~67, 1.5+/min = ~100
  const visionScore = clamp((avgVisionPerMin / 1.5) * 100, 0, 100);
  const visionRating = rateValue(avgVisionPerMin, [
    [1.5, "Elite"],
    [1.0, "Good"],
    [0.7, "Average"],
    [0.4, "Below Average"],
    [0, "Poor"],
  ]);

  // --- Damage Output (0-100) ---
  // 500 dmg/min = ~33, 1000 = ~67, 1500+ = ~100
  const dmgScore = clamp((avgDmgPerMin / 1500) * 100, 0, 100);
  const dmgRating = rateValue(avgDmgPerMin, [
    [1200, "Dominant"],
    [900, "High"],
    [600, "Average"],
    [400, "Below Average"],
    [0, "Low"],
  ]);

  // --- Gold Efficiency (0-100) ---
  // How well they convert gold into damage
  const goldEffScore = clamp((avgDmgPerGold / 2.0) * 100, 0, 100);
  const goldEffRating = rateValue(avgDmgPerGold, [
    [1.8, "Highly Efficient"],
    [1.4, "Efficient"],
    [1.0, "Average"],
    [0.7, "Inefficient"],
    [0, "Poor"],
  ]);

  // --- Survival (0-100) - lower deaths = better ---
  const survivalScore = clamp(100 - avgDeaths * 12, 0, 100);
  const survivalRating = rateValue(100 - avgDeaths * 12, [
    [80, "Exceptional"],
    [60, "Good"],
    [40, "Average"],
    [20, "Risky"],
    [0, "Reckless"],
  ]);

  // --- Consistency (0-100) ---
  // Based on coefficient of variation of KDA: low variance = high consistency
  const kdaStdDev = stdDev(kdas);
  const coeffOfVariation = avgKda > 0 ? kdaStdDev / avgKda : 1;
  const consistencyScore = clamp(100 - coeffOfVariation * 80, 0, 100);
  const consistencyRating = rateValue(consistencyScore, [
    [80, "Rock Solid"],
    [60, "Reliable"],
    [40, "Variable"],
    [20, "Inconsistent"],
    [0, "Unpredictable"],
  ]);

  // --- Win Impact (carry score) ---
  // Compare stats in wins vs losses
  const winMatches = matches.filter((m) => m.win);
  const lossMatches = matches.filter((m) => !m.win);
  const winKda = winMatches.length > 0 ? mean(winMatches.map((m) => computeKda(m.kills, m.deaths, m.assists))) : 0;
  const lossKda = lossMatches.length > 0 ? mean(lossMatches.map((m) => computeKda(m.kills, m.deaths, m.assists))) : 0;
  const kdaDiff = winKda - lossKda;
  const carryScore = clamp(50 + kdaDiff * 10, 0, 100);
  const carryRating = rateValue(carryScore, [
    [80, "Hard Carry"],
    [60, "Impact Player"],
    [40, "Team Player"],
    [20, "Dependent"],
    [0, "Low Impact"],
  ]);

  // --- Overall Score ---
  const weights = {
    kda: 0.22,
    cs: 0.12,
    vision: 0.10,
    dmg: 0.15,
    goldEff: 0.08,
    survival: 0.12,
    consistency: 0.08,
    carry: 0.08,
    winRate: 0.05,
  };

  const winRateScore = winRate;

  const overallScore = Math.round(
    kdaScore * weights.kda +
    csScore * weights.cs +
    visionScore * weights.vision +
    dmgScore * weights.dmg +
    goldEffScore * weights.goldEff +
    survivalScore * weights.survival +
    consistencyScore * weights.consistency +
    carryScore * weights.carry +
    winRateScore * weights.winRate
  );

  const overallRating = rateValue(overallScore, [
    [85, "S+"],
    [75, "S"],
    [65, "A"],
    [55, "B"],
    [45, "C"],
    [35, "D"],
    [0, "F"],
  ]);

  // --- Metrics array ---
  const metrics = [
    {
      name: "KDA Rating",
      value: Math.round(kdaScore),
      maxValue: 100,
      rating: kdaRating,
      description: `Average KDA of ${avgKda.toFixed(2)} across ${totalGames} games`,
    },
    {
      name: "CS Efficiency",
      value: Math.round(csScore),
      maxValue: 100,
      rating: csRating,
      description: `${avgCsPerMin.toFixed(1)} CS/min average`,
    },
    {
      name: "Vision Control",
      value: Math.round(visionScore),
      maxValue: 100,
      rating: visionRating,
      description: `${avgVisionPerMin.toFixed(2)} vision score/min`,
    },
    {
      name: "Damage Output",
      value: Math.round(dmgScore),
      maxValue: 100,
      rating: dmgRating,
      description: `${avgDmgPerMin.toFixed(0)} damage/min to champions`,
    },
    {
      name: "Gold Efficiency",
      value: Math.round(goldEffScore),
      maxValue: 100,
      rating: goldEffRating,
      description: `${avgDmgPerGold.toFixed(2)} damage per gold earned`,
    },
    {
      name: "Survival",
      value: Math.round(survivalScore),
      maxValue: 100,
      rating: survivalRating,
      description: `${avgDeaths.toFixed(1)} average deaths per game`,
    },
    {
      name: "Consistency",
      value: Math.round(consistencyScore),
      maxValue: 100,
      rating: consistencyRating,
      description: `Performance variance: ${(coeffOfVariation * 100).toFixed(0)}%`,
    },
    {
      name: "Carry Potential",
      value: Math.round(carryScore),
      maxValue: 100,
      rating: carryRating,
      description: `KDA in wins: ${winKda.toFixed(2)} vs losses: ${lossKda.toFixed(2)}`,
    },
  ];

  // --- Champion Breakdown ---
  const champMap = new Map<string, MatchData[]>();
  for (const m of matches) {
    const arr = champMap.get(m.championName) ?? [];
    arr.push(m);
    champMap.set(m.championName, arr);
  }

  const championBreakdown = Array.from(champMap.entries())
    .map(([championName, games]) => {
      const champWins = games.filter((g) => g.win).length;
      const champLosses = games.length - champWins;
      const champWinRate = (champWins / games.length) * 100;
      const champKills = mean(games.map((g) => g.kills));
      const champDeaths = mean(games.map((g) => g.deaths));
      const champAssists = mean(games.map((g) => g.assists));
      const champCs = mean(games.map((g) => g.cs));
      const champCsPerMin = mean(games.map((g) => (g.gameDuration > 0 ? (g.cs / g.gameDuration) * 60 : 0)));
      const champDmg = mean(games.map((g) => g.totalDamageDealt));
      const champGold = mean(games.map((g) => g.goldEarned));
      const champVision = mean(games.map((g) => g.visionScore));
      const champKda = computeKda(champKills, champDeaths, champAssists);

      const champPerfScore = Math.round(
        clamp(Math.log2(champKda + 1) * 30, 0, 100) * 0.35 +
        clamp((champCsPerMin / 10) * 100, 0, 100) * 0.15 +
        champWinRate * 0.3 +
        clamp(100 - champDeaths * 12, 0, 100) * 0.2
      );

      return {
        championName,
        gamesPlayed: games.length,
        wins: champWins,
        losses: champLosses,
        winRate: Math.round(champWinRate * 10) / 10,
        avgKills: Math.round(champKills * 10) / 10,
        avgDeaths: Math.round(champDeaths * 10) / 10,
        avgAssists: Math.round(champAssists * 10) / 10,
        avgCs: Math.round(champCs),
        avgCsPerMin: Math.round(champCsPerMin * 10) / 10,
        avgDamage: Math.round(champDmg),
        avgGold: Math.round(champGold),
        avgVisionScore: Math.round(champVision * 10) / 10,
        kda: Math.round(champKda * 100) / 100,
        performanceScore: champPerfScore,
      };
    })
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  // --- Form Trend ---
  const recentCount = Math.min(5, totalGames);
  const recentMatches = matches.slice(0, recentCount);
  const recentWins = recentMatches.filter((m) => m.win).length;
  const recentWinRate = (recentWins / recentCount) * 100;
  const recentKda = mean(recentMatches.map((m) => computeKda(m.kills, m.deaths, m.assists)));

  let trend: string;
  let trendDescription: string;

  const winRateDiff = recentWinRate - winRate;
  const kdaDiffTrend = recentKda - avgKda;

  if (winRateDiff > 10 && kdaDiffTrend > 0.5) {
    trend = "hot";
    trendDescription = "On fire! Recent performance significantly above average";
  } else if (winRateDiff > 5 || kdaDiffTrend > 0.3) {
    trend = "improving";
    trendDescription = "Trending upward — performing better than usual";
  } else if (winRateDiff < -10 && kdaDiffTrend < -0.5) {
    trend = "cold";
    trendDescription = "In a slump — recent games significantly below average";
  } else if (winRateDiff < -5 || kdaDiffTrend < -0.3) {
    trend = "declining";
    trendDescription = "Slight decline in recent performance";
  } else {
    trend = "stable";
    trendDescription = "Performing consistently at their usual level";
  }

  const formTrend = {
    recentWinRate: Math.round(recentWinRate * 10) / 10,
    overallWinRate: Math.round(winRate * 10) / 10,
    recentKda: Math.round(recentKda * 100) / 100,
    overallKda: Math.round(avgKda * 100) / 100,
    trend,
    trendDescription,
    recentGames: recentCount,
  };

  // --- Strengths & Weaknesses ---
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (kdaScore >= 70) strengths.push("Exceptional KDA — rarely dies without trading back");
  if (csScore >= 70) strengths.push("Strong farming — maximizes gold income through CS");
  if (visionScore >= 70) strengths.push("Excellent vision control — keeps the map lit up");
  if (dmgScore >= 70) strengths.push("High damage output — carries fights consistently");
  if (survivalScore >= 70) strengths.push("Great survival — rarely gives away free kills");
  if (consistencyScore >= 70) strengths.push("Very consistent — delivers reliable performance every game");
  if (carryScore >= 70) strengths.push("High carry potential — dramatically better in wins");
  if (winRate >= 55) strengths.push("Above-average win rate — contributes to team success");

  if (kdaScore < 40) weaknesses.push("Low KDA — needs to reduce deaths or increase participation");
  if (csScore < 40) weaknesses.push("Below-average farming — missing too much gold from minions");
  if (visionScore < 40) weaknesses.push("Weak vision control — should buy more control wards");
  if (dmgScore < 40) weaknesses.push("Low damage output — not maximizing damage in fights");
  if (survivalScore < 40) weaknesses.push("Dies too often — needs better positioning and map awareness");
  if (consistencyScore < 40) weaknesses.push("Inconsistent performance — large game-to-game variance");
  if (carryScore < 40) weaknesses.push("Low carry potential — stats don't scale well with wins");
  if (winRate < 45) weaknesses.push("Below-average win rate — may need to adjust playstyle or champion pool");

  if (strengths.length === 0) strengths.push("Balanced player — no extreme strengths or weaknesses");
  if (weaknesses.length === 0) weaknesses.push("No major weaknesses identified");

  return {
    overallScore,
    overallRating,
    totalGamesAnalyzed: totalGames,
    winRate: Math.round(winRate * 10) / 10,
    metrics,
    championBreakdown,
    formTrend,
    strengths,
    weaknesses,
  };
}

// GET /api/summoner/:puuid/analysis?region=&count=
router.get("/:puuid/analysis", async (req, res) => {
  const { puuid } = req.params;
  const { region, count } = req.query as { region: string; count?: string };

  if (!region) {
    res.status(400).json({ error: "bad_request", message: "region is required" });
    return;
  }

  const cluster = REGION_TO_CLUSTER[region.toUpperCase()] ?? "europe";
  const matchCount = Math.min(Number(count ?? 20), 20);

  try {
    // Fetch match IDs
    const matchListUrl = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${matchCount}`;
    const matchListRes = await fetch(matchListUrl, {
      headers: { "X-Riot-Token": RIOT_API_KEY },
    });

    if (!matchListRes.ok) {
      res.status(500).json({ error: "riot_api_error", message: "Failed to fetch match list" });
      return;
    }

    const matchIds = (await matchListRes.json()) as string[];

    // Fetch each match
    const matchDataArr: MatchData[] = [];

    for (const matchId of matchIds) {
      try {
        const matchUrl = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const matchRes = await fetch(matchUrl, {
          headers: { "X-Riot-Token": RIOT_API_KEY },
        });

        if (!matchRes.ok) continue;

        const matchData = (await matchRes.json()) as any;
        const participant = matchData.info?.participants?.find(
          (p: any) => p.puuid === puuid
        );

        if (!participant) continue;

        matchDataArr.push({
          matchId,
          gameMode: matchData.info.gameMode,
          gameDuration: matchData.info.gameDuration,
          gameEndTimestamp: matchData.info.gameEndTimestamp,
          win: participant.win,
          championName: participant.championName,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          totalDamageDealt: participant.totalDamageDealtToChampions,
          goldEarned: participant.goldEarned,
          cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
          visionScore: participant.visionScore,
        });
      } catch {
        continue;
      }
    }

    const analysis = computeAnalysis(matchDataArr);
    const validated = GetSummonerAnalysisResponse.parse(analysis);
    res.json(validated);
  } catch (err: any) {
    req.log.error({ err }, "Analysis error");
    res.status(500).json({ error: "analysis_error", message: err?.message ?? "Unknown error" });
  }
});

export default router;
