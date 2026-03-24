import { Router, type IRouter } from "express";
import { GetSummonerAnalysisResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const RIOT_API_KEY = process.env.RIOT_API_KEY ?? "";

const REGION_TO_CLUSTER: Record<string, string> = {
  NA1: "americas", BR1: "americas", LA1: "americas", LA2: "americas",
  KR: "asia", JP1: "asia",
  EUW1: "europe", EUN1: "europe", TR1: "europe", RU: "europe",
  OC1: "sea", PH2: "sea", SG2: "sea", TH2: "sea", TW2: "sea", VN2: "sea",
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
  // Extended fields
  teamKills: number;
  teamDamageDealt: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
  wardsPlaced: number;
  wardsKilled: number;
  controlWardsPlaced: number;
  damageTaken: number;
  selfMitigatedDamage: number;
  soloKills: number;
  turretKills: number;
  firstBloodKill: boolean;
  firstBloodAssist: boolean;
  objectivesStolen: number;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  return Math.sqrt(arr.reduce((sum, val) => sum + (val - avg) ** 2, 0) / arr.length);
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
      overallRating: "Niewystarczające dane",
      totalGamesAnalyzed: 0,
      winRate: 0,
      metrics: [],
      championBreakdown: [],
      formTrend: {
        recentWinRate: 0, overallWinRate: 0, recentKda: 0, overallKda: 0,
        trend: "neutral", trendDescription: "Za mało danych, aby określić trend", recentGames: 0,
      },
      strengths: [],
      weaknesses: [],
      playstyleArchetype: "Nieznany",
      playstyleDescription: "Za mało meczy do określenia profilu gracza.",
      criticalMistakes: [],
      gameplayPatterns: [],
    };
  }

  const wins = matches.filter((m) => m.win).length;
  const winRate = (wins / totalGames) * 100;

  // --- Core stat arrays ---
  const kdas = matches.map((m) => computeKda(m.kills, m.deaths, m.assists));
  const csPerMin = matches.map((m) => m.gameDuration > 0 ? (m.cs / m.gameDuration) * 60 : 0);
  const dmgPerMin = matches.map((m) => m.gameDuration > 0 ? (m.totalDamageDealt / m.gameDuration) * 60 : 0);
  const goldPerMin = matches.map((m) => m.gameDuration > 0 ? (m.goldEarned / m.gameDuration) * 60 : 0);
  const visionPerMin = matches.map((m) => m.gameDuration > 0 ? (m.visionScore / m.gameDuration) * 60 : 0);
  const deathsArr = matches.map((m) => m.deaths);
  const dmgPerGold = matches.map((m) => m.goldEarned > 0 ? m.totalDamageDealt / m.goldEarned : 0);

  // Extended stat arrays
  const killParticipation = matches.map((m) =>
    m.teamKills > 0 ? ((m.kills + m.assists) / m.teamKills) * 100 : 0
  );
  const damageShare = matches.map((m) =>
    m.teamDamageDealt > 0 ? (m.totalDamageDealt / m.teamDamageDealt) * 100 : 0
  );
  const multikillScore = matches.map((m) =>
    m.doubleKills * 1 + m.tripleKills * 2 + m.quadraKills * 4 + m.pentaKills * 8
  );
  const wardScore = matches.map((m) => m.wardsPlaced + m.wardsKilled * 1.5 + m.controlWardsPlaced * 2);
  const dmgTakenPerMin = matches.map((m) => m.gameDuration > 0 ? (m.damageTaken / m.gameDuration) * 60 : 0);
  const dmgEfficiency = matches.map((m) => m.damageTaken > 0 ? m.totalDamageDealt / m.damageTaken : 1);
  const soloKillArr = matches.map((m) => m.soloKills);
  const firstBloods = matches.filter((m) => m.firstBloodKill || m.firstBloodAssist).length;

  // Averages
  const avgKda = mean(kdas);
  const avgCsPerMin = mean(csPerMin);
  const avgDmgPerMin = mean(dmgPerMin);
  const avgGoldPerMin = mean(goldPerMin);
  const avgVisionPerMin = mean(visionPerMin);
  const avgDeaths = mean(deathsArr);
  const avgDmgPerGold = mean(dmgPerGold);
  const avgKillParticipation = mean(killParticipation);
  const avgDamageShare = mean(damageShare);
  const avgMultikillScore = mean(multikillScore);
  const avgWardScore = mean(wardScore);
  const avgDmgEfficiency = mean(dmgEfficiency);
  const avgSoloKills = mean(soloKillArr);
  const firstBloodRate = (firstBloods / totalGames) * 100;

  // ─── METRIC 1: KDA Rating ───
  const kdaScore = clamp(Math.log2(avgKda + 1) * 30, 0, 100);
  const kdaRating = rateValue(avgKda, [
    [8, "Legendarny"], [5, "Doskonały"], [3, "Dobry"],
    [2, "Przeciętny"], [1.5, "Poniżej przeciętnej"], [0, "Słaby"],
  ]);

  // ─── METRIC 2: CS Efficiency ───
  const csScore = clamp((avgCsPerMin / 10) * 100, 0, 100);
  const csRating = rateValue(avgCsPerMin, [
    [9, "Elitarny"], [7.5, "Doskonały"], [6, "Dobry"],
    [5, "Przeciętny"], [4, "Poniżej przeciętnej"], [0, "Słaby"],
  ]);

  // ─── METRIC 3: Vision Control (comprehensive: vision score + ward placement + control wards) ───
  const visionScore = clamp((avgVisionPerMin / 1.5) * 100, 0, 100);
  const wardScore100 = clamp((avgWardScore / 15) * 100, 0, 100);
  const combinedVisionScore = visionScore * 0.6 + wardScore100 * 0.4;
  const visionRating = rateValue(avgVisionPerMin, [
    [1.5, "Elitarny"], [1.0, "Dobry"], [0.7, "Przeciętny"],
    [0.4, "Poniżej przeciętnej"], [0, "Słaby"],
  ]);

  // ─── METRIC 4: Damage Output ───
  const dmgScore = clamp((avgDmgPerMin / 1500) * 100, 0, 100);
  const dmgRating = rateValue(avgDmgPerMin, [
    [1200, "Dominujący"], [900, "Wysoki"], [600, "Przeciętny"],
    [400, "Poniżej przeciętnej"], [0, "Niski"],
  ]);

  // ─── METRIC 5: Gold Efficiency ───
  const goldEffScore = clamp((avgDmgPerGold / 2.0) * 100, 0, 100);
  const goldEffRating = rateValue(avgDmgPerGold, [
    [1.8, "Bardzo wydajny"], [1.4, "Wydajny"], [1.0, "Przeciętny"],
    [0.7, "Niewydajny"], [0, "Słaby"],
  ]);

  // ─── METRIC 6: Survival (deaths + damage taken balance) ───
  const survivalDeathScore = clamp(100 - avgDeaths * 12, 0, 100);
  const survivalEffScore = clamp(avgDmgEfficiency * 40, 0, 50);
  const survivalScore = clamp(survivalDeathScore * 0.7 + survivalEffScore, 0, 100);
  const survivalRating = rateValue(survivalScore, [
    [80, "Wyjątkowy"], [60, "Dobry"], [40, "Przeciętny"],
    [20, "Ryzykowny"], [0, "Lekkomyślny"],
  ]);

  // ─── METRIC 7: Consistency ───
  const kdaStdDev = stdDev(kdas);
  const coeffOfVariation = avgKda > 0 ? kdaStdDev / avgKda : 1;
  const consistencyScore = clamp(100 - coeffOfVariation * 80, 0, 100);
  const consistencyRating = rateValue(consistencyScore, [
    [80, "Niezawodny"], [60, "Solidny"], [40, "Zmienny"],
    [20, "Niestały"], [0, "Nieprzewidywalny"],
  ]);

  // ─── METRIC 8: Carry Potential ───
  const winMatches = matches.filter((m) => m.win);
  const lossMatches = matches.filter((m) => !m.win);
  const winKda = winMatches.length > 0 ? mean(winMatches.map((m) => computeKda(m.kills, m.deaths, m.assists))) : 0;
  const lossKda = lossMatches.length > 0 ? mean(lossMatches.map((m) => computeKda(m.kills, m.deaths, m.assists))) : 0;
  const kdaDiff = winKda - lossKda;
  const carryScore = clamp(50 + kdaDiff * 10, 0, 100);
  const carryRating = rateValue(carryScore, [
    [80, "Twardy carry"], [60, "Kluczowy gracz"], [40, "Gracz zespołowy"],
    [20, "Zależny"], [0, "Mały wpływ"],
  ]);

  // ─── METRIC 9: Kill Participation ───
  const kpScore = clamp((avgKillParticipation / 70) * 100, 0, 100);
  const kpRating = rateValue(avgKillParticipation, [
    [80, "Dominujący"], [65, "Wysoki"], [50, "Przeciętny"],
    [35, "Niski"], [0, "Bierny"],
  ]);

  // ─── METRIC 10: Multikill Rate ───
  const multikillMax = 5;
  const multikillScoreNorm = clamp((avgMultikillScore / multikillMax) * 100, 0, 100);
  const pentaRate = matches.filter((m) => m.pentaKills > 0).length;
  const quadraRate = matches.filter((m) => m.quadraKills > 0).length;
  const tripleRate = matches.filter((m) => m.tripleKills > 0).length;
  const multikillRating = rateValue(avgMultikillScore, [
    [4, "Masowy zabójca"], [2, "Zabójca"], [1, "Aktywny"],
    [0.3, "Okazjonalny"], [0, "Rzadki"],
  ]);

  // ─── METRIC 11: Damage Share ───
  const dmgShareScore = clamp((avgDamageShare / 30) * 100, 0, 100);
  const dmgShareRating = rateValue(avgDamageShare, [
    [30, "Dominujący"], [22, "Wysoki"], [16, "Przeciętny"],
    [10, "Niski"], [0, "Minimalny"],
  ]);

  // ─── METRIC 12: Ward Score (comprehensive vision) ───
  const wardRatingScore = wardScore100;
  const wardRating = rateValue(avgWardScore, [
    [12, "Strażnik mapy"], [8, "Aktywny"], [5, "Przeciętny"],
    [3, "Pasywny"], [0, "Ślepy"],
  ]);

  // ─── Overall Score (weighted) ───
  const winRateScore = winRate;
  const overallScore = Math.round(
    kdaScore * 0.18 +
    csScore * 0.10 +
    combinedVisionScore * 0.08 +
    dmgScore * 0.12 +
    goldEffScore * 0.07 +
    survivalScore * 0.10 +
    consistencyScore * 0.07 +
    carryScore * 0.08 +
    kpScore * 0.10 +
    dmgShareScore * 0.05 +
    multikillScoreNorm * 0.03 +
    winRateScore * 0.02
  );

  const overallRating = rateValue(overallScore, [
    [85, "S+"], [75, "S"], [65, "A"], [55, "B"], [45, "C"], [35, "D"], [0, "F"],
  ]);

  // ─── Metrics Array ───
  const metrics = [
    {
      name: "Ocena KDA",
      value: Math.round(kdaScore), maxValue: 100, rating: kdaRating,
      description: `Średnie KDA ${avgKda.toFixed(2)} przez ${totalGames} meczy`,
    },
    {
      name: "Uczestnictwo w zabójstwach",
      value: Math.round(kpScore), maxValue: 100, rating: kpRating,
      description: `Średni KP% wynosi ${avgKillParticipation.toFixed(1)}% — udział w zabójstwach drużyny`,
    },
    {
      name: "Efektywność CS",
      value: Math.round(csScore), maxValue: 100, rating: csRating,
      description: `Średnio ${avgCsPerMin.toFixed(1)} CS/min`,
    },
    {
      name: "Zadawane obrażenia",
      value: Math.round(dmgScore), maxValue: 100, rating: dmgRating,
      description: `${avgDmgPerMin.toFixed(0)} obrażeń/min na bohaterów`,
    },
    {
      name: "Udział w obrażeniach drużyny",
      value: Math.round(dmgShareScore), maxValue: 100, rating: dmgShareRating,
      description: `Średnio ${avgDamageShare.toFixed(1)}% obrażeń całej drużyny`,
    },
    {
      name: "Multikille",
      value: Math.round(multikillScoreNorm), maxValue: 100, rating: multikillRating,
      description: `${tripleRate}× potrójne, ${quadraRate}× quadra, ${pentaRate}× penta w ${totalGames} meczach`,
    },
    {
      name: "Kontrola wizji",
      value: Math.round(combinedVisionScore), maxValue: 100, rating: visionRating,
      description: `${avgVisionPerMin.toFixed(2)} pkt wizji/min, śr. ${avgWardScore.toFixed(1)} wardów/mecz`,
    },
    {
      name: "Efektywność złota",
      value: Math.round(goldEffScore), maxValue: 100, rating: goldEffRating,
      description: `${avgDmgPerGold.toFixed(2)} obrażeń na złoto`,
    },
    {
      name: "Przeżywalność",
      value: Math.round(survivalScore), maxValue: 100, rating: survivalRating,
      description: `Średnio ${avgDeaths.toFixed(1)} śmierci/mecz | wskaźnik efektywności: ${avgDmgEfficiency.toFixed(2)}x`,
    },
    {
      name: "Konsekwencja",
      value: Math.round(consistencyScore), maxValue: 100, rating: consistencyRating,
      description: `Wariancja KDA: ${(coeffOfVariation * 100).toFixed(0)}% — niższa = bardziej stabilna gra`,
    },
    {
      name: "Potencjał carry",
      value: Math.round(carryScore), maxValue: 100, rating: carryRating,
      description: `KDA w wygranych: ${winKda.toFixed(2)} vs porażkach: ${lossKda.toFixed(2)}`,
    },
  ];

  // ─── Champion Breakdown ───
  const champMap = new Map<string, MatchData[]>();
  for (const m of matches) {
    const arr = champMap.get(m.championName) ?? [];
    arr.push(m);
    champMap.set(m.championName, arr);
  }

  const championBreakdown = Array.from(champMap.entries()).map(([championName, games]) => {
    const champWins = games.filter((g) => g.win).length;
    const champLosses = games.length - champWins;
    const champWinRate = (champWins / games.length) * 100;
    const champKills = mean(games.map((g) => g.kills));
    const champDeaths = mean(games.map((g) => g.deaths));
    const champAssists = mean(games.map((g) => g.assists));
    const champCs = mean(games.map((g) => g.cs));
    const champCsPerMin = mean(games.map((g) => g.gameDuration > 0 ? (g.cs / g.gameDuration) * 60 : 0));
    const champDmg = mean(games.map((g) => g.totalDamageDealt));
    const champGold = mean(games.map((g) => g.goldEarned));
    const champVision = mean(games.map((g) => g.visionScore));
    const champKda = computeKda(champKills, champDeaths, champAssists);
    const champKP = mean(games.map((g) => g.teamKills > 0 ? ((g.kills + g.assists) / g.teamKills) * 100 : 0));
    const champDmgShare = mean(games.map((g) => g.teamDamageDealt > 0 ? (g.totalDamageDealt / g.teamDamageDealt) * 100 : 0));

    const champPerfScore = Math.round(
      clamp(Math.log2(champKda + 1) * 30, 0, 100) * 0.3 +
      clamp((champCsPerMin / 10) * 100, 0, 100) * 0.1 +
      champWinRate * 0.25 +
      clamp(100 - champDeaths * 12, 0, 100) * 0.15 +
      clamp((champKP / 70) * 100, 0, 100) * 0.2
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
      killParticipation: Math.round(champKP * 10) / 10,
      damageShare: Math.round(champDmgShare * 10) / 10,
      performanceScore: champPerfScore,
    };
  }).sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  // ─── Form Trend ───
  const recentCount = Math.min(5, totalGames);
  const recentMatches = matches.slice(0, recentCount);
  const recentWins = recentMatches.filter((m) => m.win).length;
  const recentWinRate = (recentWins / recentCount) * 100;
  const recentKda = mean(recentMatches.map((m) => computeKda(m.kills, m.deaths, m.assists)));
  const recentKp = mean(recentMatches.map((m) => m.teamKills > 0 ? ((m.kills + m.assists) / m.teamKills) * 100 : 0));

  const winRateDiff = recentWinRate - winRate;
  const kdaDiffTrend = recentKda - avgKda;

  let trend: string;
  let trendDescription: string;
  if (winRateDiff > 10 && kdaDiffTrend > 0.5) {
    trend = "hot"; trendDescription = "Rozpalony! Ostatnie wyniki znacznie powyżej średniej";
  } else if (winRateDiff > 5 || kdaDiffTrend > 0.3) {
    trend = "improving"; trendDescription = "Rosnący trend — gra lepiej niż zwykle";
  } else if (winRateDiff < -10 && kdaDiffTrend < -0.5) {
    trend = "cold"; trendDescription = "Dołek — ostatnie mecze znacznie poniżej średniej";
  } else if (winRateDiff < -5 || kdaDiffTrend < -0.3) {
    trend = "declining"; trendDescription = "Lekki spadek w ostatnich wynikach";
  } else {
    trend = "stable"; trendDescription = "Gra konsekwentnie na swoim zwykłym poziomie";
  }

  const formTrend = {
    recentWinRate: Math.round(recentWinRate * 10) / 10,
    overallWinRate: Math.round(winRate * 10) / 10,
    recentKda: Math.round(recentKda * 100) / 100,
    overallKda: Math.round(avgKda * 100) / 100,
    trend, trendDescription, recentGames: recentCount,
  };

  // ─── Strengths & Weaknesses ───
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (kdaScore >= 70) strengths.push("Wyjątkowe KDA — rzadko umiera bez zabrania czegoś w zamian");
  if (csScore >= 70) strengths.push("Silne farmienie — maksymalizuje dochód złota przez CS");
  if (combinedVisionScore >= 70) strengths.push("Doskonała kontrola wizji — utrzymuje mapę oświetloną");
  if (dmgScore >= 70) strengths.push("Wysokie obrażenia — stale prowadzi walki");
  if (survivalScore >= 70) strengths.push("Świetna przeżywalność — rzadko oddaje darmowe zabójstwa");
  if (consistencyScore >= 70) strengths.push("Bardzo konsekwentny — niezawodne wyniki w każdym meczu");
  if (carryScore >= 70) strengths.push("Wysoki potencjał carry — znacznie lepszy w wygranych");
  if (winRate >= 55) strengths.push("Ponadprzeciętny % wygranych — przyczynia się do sukcesu drużyny");
  if (kpScore >= 70) strengths.push("Wysokie uczestnictwo w zabójstwach — zawsze tam gdzie walka");
  if (multikillScoreNorm >= 60) strengths.push("Regularnie zdobywa multikille — potrafi dominować w walce");
  if (avgDamageShare >= 25) strengths.push(`Wysoki udział w obrażeniach drużyny — średnio ${avgDamageShare.toFixed(0)}%`);
  if (firstBloodRate >= 30) strengths.push(`Agresywna wczesna gra — pierwsza krew w ${firstBloodRate.toFixed(0)}% meczy`);
  if (avgSoloKills >= 1.5) strengths.push("Silny w starciach 1v1 — regularnie zdobywa solo kills");

  if (kdaScore < 40) weaknesses.push("Niskie KDA — wymaga ograniczenia śmierci lub zwiększenia uczestnictwa");
  if (csScore < 40) weaknesses.push("Poniżej przeciętne farmienie — traci za dużo złota z minionów");
  if (combinedVisionScore < 40) weaknesses.push("Słaba kontrola wizji — powinien kupować więcej ward kontrolnych");
  if (dmgScore < 40) weaknesses.push("Niskie obrażenia — nie maksymalizuje obrażeń w walce");
  if (survivalScore < 40) weaknesses.push("Za często umiera — potrzebuje lepszego pozycjonowania i świadomości mapy");
  if (consistencyScore < 40) weaknesses.push("Niestałe wyniki — duże różnice między meczami");
  if (carryScore < 40) weaknesses.push("Niski potencjał carry — statystyki nie rosną z wygraniami");
  if (winRate < 45) weaknesses.push("Poniżej przeciętny % wygranych — może wymagać zmiany stylu gry lub puli bohaterów");
  if (kpScore < 40) weaknesses.push("Niskie uczestnictwo w zabójstwach — zbyt izolowana gra, poza walkę drużynową");
  if (avgDamageShare < 10 && dmgScore < 50) weaknesses.push("Minimalny udział w obrażeniach drużyny — niewystarczający wpływ na walki");

  if (strengths.length === 0) strengths.push("Zrównoważony gracz — brak ekstremalnych mocnych ani słabych stron");
  if (weaknesses.length === 0) weaknesses.push("Brak zidentyfikowanych większych słabości");

  // ─── Critical Mistakes Detection ───
  const criticalMistakes: string[] = [];

  const deathSpikes = matches.filter((m) => m.deaths >= 7).length;
  if (deathSpikes / totalGames > 0.3) {
    criticalMistakes.push(`Katastrofalne śmierci: ${deathSpikes} meczach miał 7+ śmierci (${((deathSpikes/totalGames)*100).toFixed(0)}% meczy) — poważny problem z bezpieczeństwem pozycji`);
  }

  if (avgKillParticipation < 40) {
    criticalMistakes.push(`Izolowana gra: KP% = ${avgKillParticipation.toFixed(1)}% — gracz zbyt często jest z dala od drużynowych walk`);
  }

  const poorFarmGames = matches.filter((m, i) => csPerMin[i] < 4).length;
  if (poorFarmGames / totalGames > 0.4) {
    criticalMistakes.push(`Problemy z farmą: w ${poorFarmGames} meczach (${((poorFarmGames/totalGames)*100).toFixed(0)}%) poniżej 4 CS/min — traci dużo złota`);
  }

  if (avgWardScore < 3 && totalGames >= 5) {
    criticalMistakes.push(`Ignorowanie wardów: śr. ${avgWardScore.toFixed(1)} punktów wizji/mecz — prawie żadna kontrola mapy`);
  }

  const zeroVisionGames = matches.filter((m) => m.wardsPlaced === 0).length;
  if (zeroVisionGames > 0) {
    criticalMistakes.push(`${zeroVisionGames} meczy bez postawienia żadnego warda — całkowita ślepota na mapę`);
  }

  const lateDeathMatches = matches.filter((m) => m.deaths > 5 && m.gameDuration > 2400).length;
  if (lateDeathMatches / totalGames > 0.25) {
    criticalMistakes.push("Za dużo śmierci w późnej fazie gry — zwiększone ryzyko przegranej przez fatal mistakes");
  }

  if (avgDmgEfficiency < 0.5 && avgDeaths > 5) {
    criticalMistakes.push(`Zbyt dużo obrażeń przyjmuje: stosunek obrażeń zadanych do przyjętych = ${avgDmgEfficiency.toFixed(2)}x — zła pozycja w walkach`);
  }

  const noControlWardGames = matches.filter((m) => m.controlWardsPlaced === 0).length;
  if (noControlWardGames / totalGames > 0.5 && totalGames >= 5) {
    criticalMistakes.push(`W ${noControlWardGames} meczach (${((noControlWardGames/totalGames)*100).toFixed(0)}%) bez pink warda — słaba kontrola punktów kluczowych`);
  }

  // ─── Gameplay Patterns ───
  const gameplayPatterns: string[] = [];

  if (avgKillParticipation >= 65 && avgDamageShare >= 20) {
    gameplayPatterns.push(`Centralny gracz drużyny — angażuje się w ${avgKillParticipation.toFixed(0)}% walk i zadaje ${avgDamageShare.toFixed(0)}% obrażeń`);
  }

  if (avgCsPerMin >= 7 && avgKillParticipation < 55) {
    gameplayPatterns.push("Pasywny farmiarz — priorytetyzuje farm ponad aktywne walki drużynowe");
  }

  if (avgSoloKills >= 1.2) {
    gameplayPatterns.push(`Solowy łowca — śr. ${avgSoloKills.toFixed(1)} solo kills/mecz — preferuje indywidualne rozegrania`);
  }

  if (firstBloodRate >= 25) {
    gameplayPatterns.push(`Agresywna wczesna gra — uczestniczy w pierwszej krwi w ${firstBloodRate.toFixed(0)}% meczy`);
  }

  const avgGameDuration = mean(matches.map((m) => m.gameDuration));
  const shortGames = matches.filter((m) => m.gameDuration < 1800).length;
  const longGames = matches.filter((m) => m.gameDuration > 2700).length;
  if (shortGames / totalGames > 0.4) {
    const shortWinRate = (matches.filter((m) => m.gameDuration < 1800 && m.win).length / shortGames) * 100;
    gameplayPatterns.push(`Preferuje krótkie mecze (śr. ${(avgGameDuration/60).toFixed(0)} min) — wygrywa ${shortWinRate.toFixed(0)}% meczy < 30 min`);
  }
  if (longGames / totalGames > 0.4) {
    const longWinRate = (matches.filter((m) => m.gameDuration > 2700 && m.win).length / longGames) * 100;
    gameplayPatterns.push(`Lepsza gra w długich meczach — wygrywa ${longWinRate.toFixed(0)}% meczy > 45 min`);
  }

  if (avgWardScore >= 10) {
    gameplayPatterns.push(`Aktywny w kontroli mapy — ${avgWardScore.toFixed(1)} pkt wizji/mecz (warding + niszczenie)`);
  }

  if (gameplayPatterns.length === 0) {
    gameplayPatterns.push("Styl gry trudny do sklasyfikowania — różnorodne wzorce w różnych meczach");
  }

  // ─── Playstyle Archetype ───
  let playstyleArchetype: string;
  let playstyleDescription: string;

  const isCarry = kdaScore >= 65 && dmgScore >= 65 && carryScore >= 65;
  const isTeamFighter = kpScore >= 65 && avgKillParticipation >= 60;
  const isFarmer = csScore >= 70 && avgCsPerMin >= 7;
  const isVisionStar = combinedVisionScore >= 70;
  const isAggressive = avgSoloKills >= 1.2 || firstBloodRate >= 25 || avgKillParticipation >= 70;
  const isInconsistent = consistencyScore < 40;
  const isSafe = survivalScore >= 75 && avgDeaths < 3;

  if (isInconsistent && consistencyScore < 30) {
    playstyleArchetype = "Gracz niestały";
    playstyleDescription = "Wyniki wahają się drastycznie — od geniusza do fatalnych błędów. Kluczem do poprawy jest mentalne podejście i eliminacja złych nawyków.";
  } else if (isCarry && isAggressive) {
    playstyleArchetype = "Dominujący carry";
    playstyleDescription = "Pełni rolę głównej siły napędowej drużyny — wysokie KDA, duże obrażenia i aktywne szukanie zwycięskich starć. Gra wokół własnej przewagi.";
  } else if (isCarry && isSafe) {
    playstyleArchetype = "Metodyczny carry";
    playstyleDescription = "Cierpliwy i ostrożny carry — minimalizuje błędy, zadaje duże obrażenia bez nadmiernego ryzyka. Skuteczny, gdy gra na swoich warunkach.";
  } else if (isTeamFighter && !isCarry) {
    playstyleArchetype = "Gracz drużynowy";
    playstyleDescription = "Zawsze przy drużynie, obecny w każdej walce. Skuteczność zależy od tego, czy team gra dobrze — silny w coordinated teamfight.";
  } else if (isFarmer && !isTeamFighter) {
    playstyleArchetype = "Izolowany farmiarz";
    playstyleDescription = "Skupia się na zbieraniu zasobów kosztem obecności na mapie. Dobry CS, ale niska aktywność w teamfightach może kosztować wygraną.";
  } else if (isVisionStar) {
    playstyleArchetype = "Strażnik mapy";
    playstyleDescription = "Wyjątkowa kontrola wizji i świadomość mapy. Daje drużynie informacje, ale powinien też zwiększyć bezpośredni wpływ na walki.";
  } else if (isSafe && !isCarry) {
    playstyleArchetype = "Ostrożny gracz";
    playstyleDescription = "Gra bezpiecznie, unika ryzyka i rzadko ginie. Brakuje jednak agresji i inicjatywy do decydujących rozegrań.";
  } else if (isAggressive && !isCarry) {
    playstyleArchetype = "Agresywny ryzykant";
    playstyleDescription = "Szuka walkę wszędzie, często inicjuje, ale agresja nie zawsze przynosi efekty. Wysokie ryzyko, nieregularna nagroda.";
  } else {
    playstyleArchetype = "Wszechstronny gracz";
    playstyleDescription = "Wyważony styl bez wyraźnej specjalizacji. Solidna baza — poprawa w jednym obszarze mogłaby wynieść go na wyższy poziom.";
  }

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
    playstyleArchetype,
    playstyleDescription,
    criticalMistakes,
    gameplayPatterns,
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
    const matchListUrl = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${matchCount}`;
    const matchListRes = await fetch(matchListUrl, { headers: { "X-Riot-Token": RIOT_API_KEY } });

    if (!matchListRes.ok) {
      res.status(500).json({ error: "riot_api_error", message: "Failed to fetch match list" });
      return;
    }

    const matchIds = (await matchListRes.json()) as string[];
    const matchDataArr: MatchData[] = [];

    for (const matchId of matchIds) {
      try {
        const matchUrl = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const matchRes = await fetch(matchUrl, { headers: { "X-Riot-Token": RIOT_API_KEY } });
        if (!matchRes.ok) continue;

        const matchData = (await matchRes.json()) as any;
        const participant = matchData.info?.participants?.find((p: any) => p.puuid === puuid);
        if (!participant) continue;

        const teamParticipants = matchData.info.participants.filter(
          (p: any) => p.teamId === participant.teamId
        );
        const teamKills = teamParticipants.reduce((sum: number, p: any) => sum + (p.kills ?? 0), 0);
        const teamDamageDealt = teamParticipants.reduce(
          (sum: number, p: any) => sum + (p.totalDamageDealtToChampions ?? 0), 0
        );

        matchDataArr.push({
          matchId,
          gameMode: matchData.info.gameMode,
          gameDuration: matchData.info.gameDuration,
          gameEndTimestamp: matchData.info.gameEndTimestamp,
          win: participant.win,
          championName: participant.championName,
          kills: participant.kills ?? 0,
          deaths: participant.deaths ?? 0,
          assists: participant.assists ?? 0,
          totalDamageDealt: participant.totalDamageDealtToChampions ?? 0,
          goldEarned: participant.goldEarned ?? 0,
          cs: (participant.totalMinionsKilled ?? 0) + (participant.neutralMinionsKilled ?? 0),
          visionScore: participant.visionScore ?? 0,
          // Extended
          teamKills,
          teamDamageDealt,
          doubleKills: participant.doubleKills ?? 0,
          tripleKills: participant.tripleKills ?? 0,
          quadraKills: participant.quadraKills ?? 0,
          pentaKills: participant.pentaKills ?? 0,
          wardsPlaced: participant.wardsPlaced ?? 0,
          wardsKilled: participant.wardsKilled ?? 0,
          controlWardsPlaced: participant.detectorWardsPlaced ?? 0,
          damageTaken: participant.totalDamageTaken ?? 0,
          selfMitigatedDamage: participant.damageSelfMitigated ?? 0,
          soloKills: participant.challenges?.soloKills ?? 0,
          turretKills: participant.turretKills ?? 0,
          firstBloodKill: participant.firstBloodKill ?? false,
          firstBloodAssist: participant.firstBloodAssist ?? false,
          objectivesStolen: participant.objectivesStolen ?? 0,
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
