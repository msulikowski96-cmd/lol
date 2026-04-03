import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { riotFetch } from "../lib/riot-fetch";
import { cache } from "../lib/cache";
import { getChampionName } from "../lib/ddragon";

const nvidiaClient = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY ?? "",
});

const router: IRouter = Router();

const REGION_TO_CLUSTER: Record<string, string> = {
  NA1: "americas", BR1: "americas", LA1: "americas", LA2: "americas",
  KR: "asia", JP1: "asia",
  EUW1: "europe", EUN1: "europe", TR1: "europe", RU: "europe",
  OC1: "sea", PH2: "sea", SG2: "sea", TH2: "sea", TW2: "sea", VN2: "sea",
};

const TIER_PL: Record<string, string> = {
  IRON: "Żelazo", BRONZE: "Brąz", SILVER: "Srebro", GOLD: "Złoto",
  PLATINUM: "Platyna", EMERALD: "Szmaragd", DIAMOND: "Diament",
  MASTER: "Mistrz", GRANDMASTER: "Arcymistrz", CHALLENGER: "Challenger",
  UNRANKED: "Bez rangi",
};

function r2(n: number) { return Math.round(n * 100) / 100; }
function pct(n: number) { return `${Math.round(n * 10) / 10}%`; }

async function fetchInternalData(puuid: string, region: string) {
  const cluster = REGION_TO_CLUSTER[region.toUpperCase()] ?? "europe";

  const [rankedRes, masteryRes, matchIdsRes] = await Promise.all([
    riotFetch(`https://${region.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`),
    riotFetch(`https://${region.toLowerCase()}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=7`),
    riotFetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=20&type=ranked`),
  ]);

  const ranked = (await rankedRes.json()) as any[];
  const masteryRaw = (await masteryRes.json()) as any[];
  const matchIds = (await matchIdsRes.json()) as string[];

  const soloQ = ranked.find((e: any) => e.queueType === "RANKED_SOLO_5x5");
  const flexQ = ranked.find((e: any) => e.queueType === "RANKED_FLEX_5x5");

  const mastery = masteryRaw.map((m: any) => ({
    championName: getChampionName(m.championId),
    championLevel: m.championLevel,
    championPoints: m.championPoints,
    lastPlayTime: m.lastPlayTime,
  }));

  const BATCH = 20;
  const matchDetails: any[] = [];
  for (let i = 0; i < matchIds.length; i += BATCH) {
    const batch = matchIds.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (id) => {
        try {
          const r = await riotFetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}`);
          return await r.json();
        } catch { return null; }
      })
    );
    matchDetails.push(...results.filter(Boolean));
  }

  const parsedMatches = matchDetails
    .map((md: any) => {
      const p = (md.info?.participants ?? []).find((x: any) => x.puuid === puuid);
      if (!p) return null;
      const all: any[] = md.info?.participants ?? [];
      const myTeam = all.filter((x: any) => x.teamId === p.teamId);
      const teamKills = myTeam.reduce((s: number, x: any) => s + (x.kills ?? 0), 0);
      const teamDmg = myTeam.reduce((s: number, x: any) => s + (x.totalDamageDealtToChampions ?? 0), 0);
      const cs = (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0);
      const gd = md.info.gameDuration as number;
      return {
        win: p.win,
        championName: p.championName,
        kills: p.kills ?? 0,
        deaths: p.deaths ?? 0,
        assists: p.assists ?? 0,
        cs,
        csPerMin: gd > 0 ? r2((cs / gd) * 60) : 0,
        visionScore: p.visionScore ?? 0,
        damage: p.totalDamageDealtToChampions ?? 0,
        damagePct: teamDmg > 0 ? r2(((p.totalDamageDealtToChampions ?? 0) / teamDmg) * 100) : 0,
        killParticipation: teamKills > 0 ? r2(((p.kills + p.assists) / teamKills) * 100) : 0,
        gold: p.goldEarned ?? 0,
        goldPerMin: gd > 0 ? r2((p.goldEarned / gd) * 60) : 0,
        gameDuration: gd,
        position: p.teamPosition ?? "",
        wardsPlaced: p.wardsPlaced ?? 0,
        controlWards: p.visionWardsBoughtInGame ?? 0,
        firstBlood: p.firstBloodKill ?? false,
        objectivesStolen: p.objectivesStolen ?? 0,
        doubleKills: p.doubleKills ?? 0,
        tripleKills: p.tripleKills ?? 0,
        pentaKills: p.pentaKills ?? 0,
        timeDeadPct: gd > 0 ? r2(((p.totalTimeSpentDead ?? 0) / gd) * 100) : 0,
        physicalDmgPct: p.physicalDamageDealtToChampions && p.totalDamageDealtToChampions > 0
          ? r2((p.physicalDamageDealtToChampions / p.totalDamageDealtToChampions) * 100) : 0,
        magicDmgPct: p.magicDamageDealtToChampions && p.totalDamageDealtToChampions > 0
          ? r2((p.magicDamageDealtToChampions / p.totalDamageDealtToChampions) * 100) : 0,
      };
    })
    .filter(Boolean) as any[];

  const N = parsedMatches.length;
  if (N === 0) return { soloQ, flexQ, mastery, parsedMatches, aggregated: null };

  const wins = parsedMatches.filter((m) => m.win).length;
  const avg = (key: string) => r2(parsedMatches.reduce((s, m) => s + m[key], 0) / N);

  const champMap: Record<string, { games: number; wins: number; kills: number; deaths: number; assists: number }> = {};
  for (const m of parsedMatches) {
    if (!champMap[m.championName]) champMap[m.championName] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 };
    champMap[m.championName].games++;
    if (m.win) champMap[m.championName].wins++;
    champMap[m.championName].kills += m.kills;
    champMap[m.championName].deaths += m.deaths;
    champMap[m.championName].assists += m.assists;
  }
  const champStats = Object.entries(champMap)
    .map(([name, s]) => ({
      name,
      games: s.games,
      winRate: r2((s.wins / s.games) * 100),
      kda: s.deaths === 0 ? r2(s.kills + s.assists) : r2((s.kills + s.assists) / s.deaths),
      avgKills: r2(s.kills / s.games),
      avgDeaths: r2(s.deaths / s.games),
      avgAssists: r2(s.assists / s.games),
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 5);

  const roleMap: Record<string, number> = {};
  for (const m of parsedMatches) if (m.position) roleMap[m.position] = (roleMap[m.position] ?? 0) + 1;
  const primaryRole = Object.entries(roleMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown";

  const streakArr = parsedMatches.map((m) => m.win ? "W" : "L");
  let streak = 1;
  for (let i = 1; i < streakArr.length; i++) {
    if (streakArr[i] === streakArr[0]) streak++;
    else break;
  }
  const streakStr = `${streak}× ${streakArr[0] === "W" ? "wygrana" : "przegrana"}`;

  const recent5 = parsedMatches.slice(0, 5);
  const recent5wr = r2((recent5.filter((m) => m.win).length / recent5.length) * 100);
  const recent10 = parsedMatches.slice(0, 10);
  const recent10wr = r2((recent10.filter((m) => m.win).length / Math.max(recent10.length, 1)) * 100);

  const tiltedGames = parsedMatches.filter((m) => m.deaths > 8).length;
  const pentasTotal = parsedMatches.reduce((s, m) => s + m.pentaKills, 0);
  const multiKills = parsedMatches.reduce((s, m) => s + m.doubleKills + m.tripleKills * 2 + m.pentaKills * 5, 0);

  const aggregated = {
    totalGames: N,
    winRate: r2((wins / N) * 100),
    avgKda: avg("kills") === 0 && avg("deaths") === 0 ? 0
      : avg("deaths") === 0 ? r2(avg("kills") + avg("assists"))
      : r2((avg("kills") + avg("assists")) / avg("deaths")),
    avgKills: avg("kills"),
    avgDeaths: avg("deaths"),
    avgAssists: avg("assists"),
    avgCsPerMin: avg("csPerMin"),
    avgVisionScore: avg("visionScore"),
    avgDamagePct: avg("damagePct"),
    avgKillParticipation: avg("killParticipation"),
    avgGoldPerMin: avg("goldPerMin"),
    avgTimeDeadPct: avg("timeDeadPct"),
    avgControlWards: avg("controlWards"),
    avgWardsPlaced: avg("wardsPlaced"),
    avgObjectivesStolen: avg("objectivesStolen"),
    primaryRole,
    roleDistribution: roleMap,
    champStats,
    streakStr,
    recent5wr,
    recent10wr,
    tiltedGames,
    pentasTotal,
    multiKills,
    physicalDmgPct: avg("physicalDmgPct"),
    magicDmgPct: avg("magicDmgPct"),
    lastResults: streakArr.slice(0, 15).join(""),
  };

  return { soloQ, flexQ, mastery, parsedMatches, aggregated };
}

function buildPrompt(data: Awaited<ReturnType<typeof fetchInternalData>>, gameName: string): string {
  const { soloQ, flexQ, mastery, aggregated } = data;

  const rankStr = soloQ
    ? `${TIER_PL[soloQ.tier] ?? soloQ.tier} ${soloQ.rank} ${soloQ.leaguePoints} LP (SoloQ, ${soloQ.wins}W ${soloQ.losses}L, WR: ${r2((soloQ.wins / (soloQ.wins + soloQ.losses)) * 100)}%)`
    : "Bez rangi w SoloQ";
  const flexStr = flexQ
    ? `${TIER_PL[flexQ.tier] ?? flexQ.tier} ${flexQ.rank} ${flexQ.leaguePoints} LP (Flex, ${flexQ.wins}W ${flexQ.losses}L)`
    : "Bez rangi w Flex";

  const masteryStr = mastery.slice(0, 5)
    .map((m) => `${m.championName} (poz. ${m.championLevel}, ${(m.championPoints / 1000).toFixed(0)}K pts)`)
    .join(", ");

  let statsStr = "Brak wystarczających danych ze starszych meczy.";
  let champPoolStr = "";
  let lastResultsStr = "";

  if (aggregated) {
    const a = aggregated;
    statsStr = `
Ostatnie ${a.totalGames} meczów rankingowych:
- Win Rate: ${pct(a.winRate)} (ostatnie 5: ${pct(a.recent5wr)}, ostatnie 10: ${pct(a.recent10wr)})
- Śr. KDA: ${a.avgKda} (${a.avgKills}/${a.avgDeaths}/${a.avgAssists})
- Śr. CS/min: ${a.avgCsPerMin}
- Śr. udział w zabójstwach: ${pct(a.avgKillParticipation)}
- Śr. % obrażeń w drużynie: ${pct(a.avgDamagePct)}
- Śr. złoto/min: ${a.avgGoldPerMin}
- Śr. vision score: ${a.avgVisionScore}
- Śr. % czasu martwym: ${pct(a.avgTimeDeadPct)}
- Śr. Control Wards/mecz: ${a.avgControlWards}
- Śr. Wards postawionych: ${a.avgWardsPlaced}
- Śr. skradzionych celów: ${a.avgObjectivesStolen}
- Obrażenia fizyczne/magiczne: ${pct(a.physicalDmgPct)} fiz. / ${pct(a.magicDmgPct)} mag.
- Główna rola: ${a.primaryRole} | Rozkład ról: ${JSON.stringify(a.roleDistribution)}
- Aktualna seria: ${a.streakStr}
- Mecze z tiltingiem (>8 zgonów): ${a.tiltedGames}/${a.totalGames}
- Multi-kills (penta: ${a.pentasTotal}, łącznie: ${a.multiKills})`;

    champPoolStr = a.champStats.map((c) =>
      `  ${c.name}: ${c.games}G, ${c.winRate}% WR, ${c.kda} KDA (${c.avgKills}/${c.avgDeaths}/${c.avgAssists})`
    ).join("\n");

    lastResultsStr = `Ostatnie wyniki (W=wygrana, L=przegrana): ${a.lastResults}`;
  }

  return `Analityk LoL. Raport gracza "${gameName}" po polsku. Odpowiedz TYLKO JSON (bez markdown).

DANE:
Rangi: SoloQ: ${rankStr} | Flex: ${flexStr}
Mastery: ${masteryStr || "brak"}
${statsStr}
Pool: ${champPoolStr || "brak"}
${lastResultsStr}

JSON (zwięzłe odpowiedzi, 1-2 zdań na pole, konkretne liczby):
{
  "executive_summary": "2 zdania: ranga, WR, forma",
  "overall_rating": "S+/S/A+/A/B+/B/C+/C/D",
  "overall_score": 0-100,
  "form_assessment": "Świetna forma/Dobra forma/Stabilna/Zmienna/Słaba forma/Kryzys",
  "playstyle_archetype": "np. Agresywny Carry",
  "playstyle_description": "1-2 zdania",
  "champion_pool_analysis": "1-2 zdania",
  "macro_analysis": "1-2 zdania z liczbami (vision, cele)",
  "micro_analysis": "1-2 zdania z liczbami (CS, dmg%)",
  "lane_phase_analysis": "1 zdanie",
  "teamfight_analysis": "1 zdanie",
  "death_analysis": "1 zdanie z liczbami",
  "vision_analysis": "1 zdanie",
  "mental_game": "1 zdanie",
  "strengths": ["mocna1","mocna2","mocna3"],
  "weaknesses": ["słaba1","słaba2","słaba3"],
  "coaching_tips": [{"title":"","description":"1 zdanie","priority":"high/medium/low","category":"macro/micro/mental/vision/champion_pool"}],
  "champion_recommendations": [{"champion":"","reason":"krótko","synergy":"krótko"}],
  "rank_prediction": "1 zdanie",
  "consistency_score": 0-100,
  "consistency_comment": "1 zdanie",
  "motivation_quote": "krótkie motto",
  "performance_radar": {"makro":0-100,"mikro":0-100,"wizja":0-100,"konsekwencja":0-100,"teamfight":0-100,"laning":0-100},
  "improvement_priorities": [{"rank":1,"area":"","current":"wartość","target":"cel","description":"1 zdanie","lp_gain_estimate":0}],
  "key_weaknesses_detailed": [{"title":"","stat":"","impact":"krótko","fix":"krótko"}],
  "biggest_mistake_pattern": "1 zdanie",
  "best_habit": "1 zdanie"
}
coaching_tips: 3, champion_recommendations: 2, improvement_priorities: 3, key_weaknesses_detailed: 2. Radar 0-100, zróżnicowany.`;
}

router.get("/:puuid/ai-report", async (req, res) => {
  const { puuid } = req.params;
  const { region, gameName } = req.query as { region: string; gameName?: string };

  if (!region) {
    res.status(400).json({ error: "bad_request", message: "region is required" });
    return;
  }

  const cacheKey = `ai-report:${region.toUpperCase()}:${puuid}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const timeoutMs = 120_000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timed out")), timeoutMs)
    );

    const mainPromise = (async () => {
      const t0 = Date.now();
      const data = await fetchInternalData(puuid, region.toUpperCase());
      console.log(`[ai-report] data fetch: ${Date.now() - t0}ms`);

      const prompt = buildPrompt(data, gameName ?? "Gracz");

      const t1 = Date.now();
      const nvidiaParams: any = {
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 4096,
        stream: true,
      };
      const stream = nvidiaClient.chat.completions.create(nvidiaParams) as any;

      let fullText = "";
      for await (const chunk of await stream) {
        const content = chunk?.choices?.[0]?.delta?.content;
        if (content) fullText += content;
      }
      console.log(`[ai-report] AI generation: ${Date.now() - t1}ms, tokens out: ~${Math.round(fullText.length / 4)}`);

      const rawText = fullText
        .replace(/^```(?:json)?\s*/m, "")
        .replace(/```\s*$/m, "")
        .trim();

      let parsed: any;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "parse_failed" };
      } catch {
        parsed = { error: "parse_failed" };
      }

      return { data, parsed };
    })();

    const { data, parsed } = await Promise.race([mainPromise, timeoutPromise]);

    if (res.headersSent || req.socket?.destroyed) return;

    const result = {
      report: parsed,
      generatedAt: Date.now(),
      stats: data.aggregated ? {
        totalGames: data.aggregated.totalGames,
        winRate: data.aggregated.winRate,
        avgKda: data.aggregated.avgKda,
        avgKills: data.aggregated.avgKills,
        avgDeaths: data.aggregated.avgDeaths,
        avgAssists: data.aggregated.avgAssists,
        avgCsPerMin: data.aggregated.avgCsPerMin,
        avgVisionScore: data.aggregated.avgVisionScore,
        avgDamagePct: data.aggregated.avgDamagePct,
        avgKillParticipation: data.aggregated.avgKillParticipation,
        avgGoldPerMin: data.aggregated.avgGoldPerMin,
        avgTimeDeadPct: data.aggregated.avgTimeDeadPct,
        avgControlWards: data.aggregated.avgControlWards,
        avgWardsPlaced: data.aggregated.avgWardsPlaced,
        tiltedGames: data.aggregated.tiltedGames,
        recent5wr: data.aggregated.recent5wr,
        recent10wr: data.aggregated.recent10wr,
        lastResults: data.aggregated.lastResults,
        champStats: data.aggregated.champStats,
        primaryRole: data.aggregated.primaryRole,
        streakStr: data.aggregated.streakStr,
        pentasTotal: data.aggregated.pentasTotal,
        multiKills: data.aggregated.multiKills,
        physicalDmgPct: data.aggregated.physicalDmgPct,
        magicDmgPct: data.aggregated.magicDmgPct,
      } : null,
    };
    cache.set(cacheKey, result, 300);
    res.json(result);
  } catch (err: any) {
    if (res.headersSent || req.socket?.destroyed) return;
    const isTimeout = err?.message?.includes("timed out");
    res.status(isTimeout ? 408 : 500).json({
      error: isTimeout ? "timeout" : "ai_error",
      message: err?.message ?? "Unknown error",
    });
  }
});

export default router;
