import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { cache } from "../lib/cache";

const nvidiaClient = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY ?? "",
});

const router: IRouter = Router();

const TIER_PL: Record<string, string> = {
  IRON: "Żelazo", BRONZE: "Brąz", SILVER: "Srebro", GOLD: "Złoto",
  PLATINUM: "Platyna", EMERALD: "Szmaragd", DIAMOND: "Diament",
  MASTER: "Mistrz", GRANDMASTER: "Arcymistrz", CHALLENGER: "Challenger",
  UNRANKED: "Bez rangi",
};

const TIER_SCORE: Record<string, number> = {
  IRON: 400, BRONZE: 800, SILVER: 1200, GOLD: 1600, PLATINUM: 2000,
  EMERALD: 2400, DIAMOND: 2800, MASTER: 3200, GRANDMASTER: 3500,
  CHALLENGER: 3800, UNRANKED: 1200,
};
const DIV_SCORE: Record<string, number> = { IV: 0, III: 100, II: 200, I: 300 };

function rankScore(tier: string, division: string, lp: number): number {
  const base = TIER_SCORE[tier] ?? 1200;
  const div = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier) ? 0 : (DIV_SCORE[division] ?? 0);
  return base + div + Math.min(lp, 100);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function r1(n: number): number { return Math.round(n * 10) / 10; }

async function callAI(prompt: string, signal?: AbortSignal, maxTokens = 1500): Promise<string> {
  try {
    const stream = await nvidiaClient.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      top_p: 0.7,
      max_tokens: maxTokens,
      stream: true,
    }, { signal }) as any;

    let full = "";
    for await (const chunk of stream) {
      if (signal?.aborted) throw new Error("aborted");
      const c = chunk?.choices?.[0]?.delta?.content;
      if (c) full += c;
    }
    return full;
  } catch (e: any) {
    console.error("[ai-coach/callAI] error:", e?.name, e?.message, e?.cause);
    throw e;
  }
}

function extractJSON(text: string): any {
  const cleaned = text.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("no JSON in response");
  return JSON.parse(m[0]);
}

// =========================================================================
// COUNTER-BUILD OPTIMIZER
// POST /api/coach/optimizer
// Body: { myChampion: string, lane: string, allies: string[], enemies: string[] }
// =========================================================================

router.post("/optimizer", async (req, res) => {
  const { myChampion, lane, allies = [], enemies = [] } = req.body ?? {};

  if (!myChampion || typeof myChampion !== "string") {
    res.status(400).json({ error: "bad_request", message: "myChampion is required" });
    return;
  }
  if (!Array.isArray(enemies) || enemies.length === 0) {
    res.status(400).json({ error: "bad_request", message: "at least one enemy required" });
    return;
  }

  const enemyList = enemies.filter(Boolean).join(", ");
  const allyList = allies.filter(Boolean).join(", ") || "brak danych";
  const laneStr = (lane ?? "MID").toUpperCase();

  const cacheKey = `optimizer:${myChampion}:${laneStr}:${enemyList}:${allyList}`.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 60_000);
  const onClose = () => {
    if (req.socket?.destroyed && !res.headersSent) controller.abort();
  };
  res.on("close", onClose);

  const prompt = `Jesteś coachem League of Legends. Generuj rekomendację runy + sumony + buildu w formacie JSON, po polsku.

KONTEKST:
- Mój bohater: ${myChampion}
- Linia: ${laneStr}
- Sojusznicy: ${allyList}
- Wrogowie: ${enemyList}

WAŻNE:
1. Bierz pod uwagę KONKRETNYCH wrogów — np. jeśli wróg ma dużo CC, rekomenduj Mercurial/QSS; przeciw poke → Maw/Edge of Night; przeciw assassinom → Zhonya/GA.
2. Item names MUSZĄ być prawdziwymi przedmiotami z LoL patcha 14.X (np. "Liandry's Anguish", "Eclipse", "Trinity Force", "Rabadon's Deathcap", "Stormsurge", "Sundered Sky", "Hubris", "Voltaic Cyclosword").
3. Runes: główna ścieżka (Precision/Domination/Sorcery/Resolve/Inspiration) + 4 runy + sub-ścieżka + 2 runy + 3 fragmenty.
4. Summoners: Flash + jeden z (Ignite/Teleport/Heal/Exhaust/Cleanse/Smite/Barrier/Ghost).
5. Build: 6 itemów w kolejności kupowania + buty.
6. Każdy item/runa MUSI mieć short reason (po polsku, max 80 znaków).

TYLKO JSON:
{
  "myChampion": "${myChampion}",
  "lane": "${laneStr}",
  "summary": "1-2 zdania: kim jesteś w tym matchupie (carry/peel/split etc), kluczowe zagrożenia",
  "summoners": {
    "primary": "Flash",
    "secondary": "Ignite",
    "reason": "dlaczego ten zestaw vs ten team"
  },
  "runes": {
    "primary_path": "Precision",
    "primary_keystone": "Conqueror",
    "primary_runes": ["Triumph", "Legend: Tenacity", "Last Stand"],
    "secondary_path": "Resolve",
    "secondary_runes": ["Second Wind", "Unflinching"],
    "shards": ["Adaptive Force", "Adaptive Force", "Health Scaling"],
    "reason": "dlaczego ten setup vs ten team"
  },
  "build": {
    "boots": "Plated Steelcaps",
    "boots_reason": "vs 4 AD na wrogu",
    "core_items": [
      {"name":"Eclipse","reason":"early burst i shield vs poke"},
      {"name":"Sundered Sky","reason":"sustain vs assassinów"},
      {"name":"Death's Dance","reason":"reduce burst od ${enemies[0] ?? "wroga"}"}
    ],
    "situational_items": [
      {"name":"Maw of Malmortius","reason":"vs 2 AP na wrogu"},
      {"name":"Guardian Angel","reason":"vs dive comp"}
    ]
  },
  "matchup_tips": [
    "tip 1 z konkretną odniesieniem do wroga (max 100 znaków)",
    "tip 2",
    "tip 3"
  ],
  "spike_timing": "kiedy jesteś najsilniejszy (np. po 2 itemach, level 11)",
  "win_condition": "1 zdanie: jak wygrać tego matchupa"
}`;

  try {
    const t0 = Date.now();
    const text = await callAI(prompt, controller.signal, 1500);
    console.log(`[ai-coach/optimizer] ${myChampion} vs [${enemyList}] in ${Date.now() - t0}ms`);
    const parsed = extractJSON(text);
    const result = { ...parsed, generatedAt: Date.now() };
    cache.set(cacheKey, result, 3600); // cache 1h
    res.json(result);
  } catch (err: any) {
    if (res.headersSent) return;
    const isTimeout = timedOut || err?.message?.includes("timeout") || err?.name === "AbortError";
    res.status(isTimeout ? 408 : 500).json({
      error: isTimeout ? "timeout" : "ai_error",
      message: err?.message ?? "Unknown error",
    });
  } finally {
    clearTimeout(timeout);
    res.off("close", onClose);
  }
});

// =========================================================================
// LIVE GAME AI INSIGHTS — Win Prediction + Win Conditions + Threats
// POST /api/coach/live-insights
// Body: {
//   gameId, mySide ("blue"|"red"), gameMode,
//   participants: [{teamId, championName, summonerName, rankedTier, rankedDivision, rankedLP, rankedWins, rankedLosses}],
// }
// =========================================================================

router.post("/live-insights", async (req, res) => {
  const { gameId, mySide, gameMode, participants } = req.body ?? {};

  if (!gameId || !Array.isArray(participants) || participants.length === 0) {
    res.status(400).json({ error: "bad_request", message: "gameId and participants required" });
    return;
  }
  const side = mySide === "red" ? "red" : "blue";

  const cacheKey = `live-insights:${gameId}:${side}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  // === DETERMINISTIC WIN PREDICTION (rank + winrate based) ===
  const blue = participants.filter((p: any) => p.teamId === 100);
  const red = participants.filter((p: any) => p.teamId === 200);
  if (blue.length === 0 || red.length === 0) {
    res.status(400).json({ error: "bad_request", message: "missing team participants" });
    return;
  }

  const teamScore = (team: any[]) => {
    const ranks = team.map((p: any) => rankScore(p.rankedTier ?? "UNRANKED", p.rankedDivision ?? "", p.rankedLP ?? 0));
    const avgRank = ranks.reduce((s, n) => s + n, 0) / ranks.length;

    const wrs = team
      .map((p: any) => {
        const games = (p.rankedWins ?? 0) + (p.rankedLosses ?? 0);
        return games >= 10 ? (p.rankedWins / games) * 100 : 50;
      });
    const avgWR = wrs.reduce((s, n) => s + n, 0) / wrs.length;

    const exp = team.reduce((s: number, p: any) => s + ((p.rankedWins ?? 0) + (p.rankedLosses ?? 0)), 0) / team.length;
    return { avgRank, avgWR, avgExp: exp };
  };

  const blueScore = teamScore(blue);
  const redScore = teamScore(red);

  const rankDiff = (blueScore.avgRank - redScore.avgRank) / 400;
  const wrDiff = (blueScore.avgWR - redScore.avgWR) / 8;
  const expDiff = Math.tanh((blueScore.avgExp - redScore.avgExp) / 200) * 0.3;

  const blueWinProb = sigmoid(rankDiff * 1.4 + wrDiff * 0.9 + expDiff);
  const blueP = Math.round(Math.max(15, Math.min(85, blueWinProb * 100)));
  const redP = 100 - blueP;
  const myProb = side === "blue" ? blueP : redP;

  const myTeam = side === "blue" ? blue : red;
  const enemyTeam = side === "blue" ? red : blue;
  const teamComp = (team: any[]) =>
    team.map((p: any) => `${p.championName} (${TIER_PL[p.rankedTier] ?? "Bez rangi"} ${p.rankedDivision ?? ""}, WR: ${
      ((p.rankedWins ?? 0) + (p.rankedLosses ?? 0)) >= 10
        ? Math.round((p.rankedWins / (p.rankedWins + p.rankedLosses)) * 100) + "%"
        : "n/d"
    })`).join(", ");

  const prompt = `Jesteś coachem League of Legends. Analiza meczu live, po polsku, zwięźle. Tylko JSON.

DRUŻYNA MOJA (${side === "blue" ? "Niebiescy" : "Czerwoni"}): ${teamComp(myTeam)}
DRUŻYNA WROGA (${side === "blue" ? "Czerwoni" : "Niebiescy"}): ${teamComp(enemyTeam)}
TRYB: ${gameMode ?? "CLASSIC"}
PREDYKCJA SYSTEMOWA: Moja drużyna ma ${myProb}% szans na wygraną (na podstawie rang i winrate).

ZASADY:
1. Win conditions = konkretne, taktyczne (np. "wygraj early game na top przed 14 min", "uniknij teamfightów do 25 min").
2. Threats = TYP zagrożenia z championa wroga (np. "Zed - dive na carry po 6 lvl", "Malphite ulti = 5-man wombo").
3. Power spikes = WHEN moja drużyna jest najsilniejsza (np. "drugi item u midlanera, 25 min").
4. Mowa codzienna, bez ogólników typu "graj dobrze".
5. Wszystko po POLSKU.

JSON:
{
  "team_archetype": "1-2 słowa: np. Skalujący poke, Engage burst, Pick comp, Splitpush",
  "enemy_archetype": "1-2 słowa: archetyp wrogów",
  "game_plan": "2-3 zdania: główny plan na mecz",
  "win_conditions": [
    "win condition 1 (max 90 znaków, konkretny)",
    "win condition 2",
    "win condition 3"
  ],
  "threats": [
    {"champion": "nazwa wroga", "threat": "co robi groźnego", "counter": "jak temu zapobiec"},
    {"champion": "nazwa wroga", "threat": "...", "counter": "..."},
    {"champion": "nazwa wroga", "threat": "...", "counter": "..."}
  ],
  "power_spikes": {
    "early": "co robić przed 15 min (1 zdanie)",
    "mid": "co robić 15-25 min (1 zdanie)",
    "late": "co robić po 25 min (1 zdanie)"
  },
  "key_objective": "który obiekt jest kluczowy (Drake/Herald/Baron/Wieże) i dlaczego",
  "mvp_pick": "który gracz w mojej drużynie jest kluczowy i czemu"
}`;

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 60_000);
  const onClose = () => {
    if (req.socket?.destroyed && !res.headersSent) controller.abort();
  };
  res.on("close", onClose);

  try {
    const t0 = Date.now();
    const text = await callAI(prompt, controller.signal, 1200);
    console.log(`[ai-coach/live-insights] gameId=${gameId} in ${Date.now() - t0}ms`);
    const insights = extractJSON(text);

    const result = {
      prediction: {
        blue_win_pct: blueP,
        red_win_pct: redP,
        my_win_pct: myProb,
        my_side: side,
        confidence: Math.abs(blueP - 50) > 15 ? "high" : Math.abs(blueP - 50) > 7 ? "medium" : "low",
        breakdown: {
          blue: { avg_rank_score: Math.round(blueScore.avgRank), avg_wr: r1(blueScore.avgWR), avg_games: Math.round(blueScore.avgExp) },
          red: { avg_rank_score: Math.round(redScore.avgRank), avg_wr: r1(redScore.avgWR), avg_games: Math.round(redScore.avgExp) },
        },
      },
      ai: insights,
      generatedAt: Date.now(),
    };
    cache.set(cacheKey, result, 600); // cache 10 min
    res.json(result);
  } catch (err: any) {
    if (res.headersSent) return;
    const isTimeout = timedOut || err?.message?.includes("timeout") || err?.name === "AbortError";
    res.status(isTimeout ? 408 : 500).json({
      error: isTimeout ? "timeout" : "ai_error",
      message: err?.message ?? "Unknown error",
    });
  } finally {
    clearTimeout(timeout);
    res.off("close", onClose);
  }
});

export default router;
