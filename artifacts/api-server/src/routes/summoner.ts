import { Router, type IRouter } from "express";
import {
  SearchSummonerResponse,
  GetSummonerRankedResponse,
  GetSummonerMatchesResponse,
  GetSummonerMasteryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const RIOT_API_KEY = process.env.RIOT_API_KEY ?? "";

// Region to routing value mapping for account API (uses regional clusters)
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

async function riotFetch(url: string, req: any): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    req.log.error({ url, status: res.status, body: text }, "Riot API error");
    throw { status: res.status, message: text };
  }

  return res;
}

// GET /api/summoner/search?gameName=&tagLine=&region=
router.get("/search", async (req, res) => {
  const { gameName, tagLine, region } = req.query as {
    gameName: string;
    tagLine: string;
    region: string;
  };

  if (!gameName || !tagLine || !region) {
    res.status(400).json({ error: "bad_request", message: "gameName, tagLine, and region are required" });
    return;
  }

  const cluster = REGION_TO_CLUSTER[region.toUpperCase()] ?? "europe";
  const regionLower = region.toLowerCase();

  try {
    // Step 1: Get account by Riot ID
    const accountUrl = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const accountRes = await riotFetch(accountUrl, req);
    const account = (await accountRes.json()) as { puuid: string; gameName: string; tagLine: string };

    // Step 2: Get summoner by PUUID (optional — Riot is phasing this out)
    let summonerId = "";
    let summonerLevel = 0;
    let profileIconId = 29; // default icon

    try {
      const summonerUrl = `https://${regionLower}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`;
      const summonerRes = await fetch(summonerUrl, {
        headers: { "X-Riot-Token": RIOT_API_KEY },
      });
      if (summonerRes.ok) {
        const summoner = (await summonerRes.json()) as {
          id: string;
          profileIconId: number;
          summonerLevel: number;
        };
        summonerId = summoner.id ?? "";
        summonerLevel = summoner.summonerLevel ?? 0;
        profileIconId = summoner.profileIconId ?? 29;
      }
    } catch {
      // summoner v4 lookup failed — continue with defaults
    }

    const profile = SearchSummonerResponse.parse({
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      summonerId,
      summonerLevel,
      profileIconId,
      region: region.toUpperCase(),
    });

    res.json(profile);
  } catch (err: any) {
    if (err?.status === 404) {
      res.status(404).json({ error: "not_found", message: "Summoner not found" });
    } else {
      res.status(500).json({ error: "riot_api_error", message: err?.message ?? "Unknown error" });
    }
  }
});

// GET /api/summoner/:puuid/ranked?region=
router.get("/:puuid/ranked", async (req, res) => {
  const { puuid } = req.params;
  const { region } = req.query as { region: string };

  if (!region) {
    res.status(400).json({ error: "bad_request", message: "region is required" });
    return;
  }

  const regionLower = region.toLowerCase();

  try {
    const url = `https://${regionLower}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
    const apiRes = await riotFetch(url, req);
    const data = (await apiRes.json()) as Array<{
      queueType: string;
      tier: string;
      rank: string;
      leaguePoints: number;
      wins: number;
      losses: number;
      hotStreak: boolean;
      veteran: boolean;
      freshBlood: boolean;
      inactive: boolean;
    }>;

    const ranked = GetSummonerRankedResponse.parse(data);
    res.json(ranked);
  } catch (err: any) {
    res.status(500).json({ error: "riot_api_error", message: err?.message ?? "Unknown error" });
  }
});

// GET /api/summoner/:puuid/matches?region=&count=
router.get("/:puuid/matches", async (req, res) => {
  const { puuid } = req.params;
  const { region, count } = req.query as { region: string; count?: string };

  if (!region) {
    res.status(400).json({ error: "bad_request", message: "region is required" });
    return;
  }

  const cluster = REGION_TO_CLUSTER[region.toUpperCase()] ?? "europe";
  const matchCount = Math.min(Number(count ?? 20), 20);

  try {
    // Get match IDs
    const matchListUrl = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${matchCount}`;
    const matchListRes = await riotFetch(matchListUrl, req);
    const matchIds = (await matchListRes.json()) as string[];

    // Fetch each match in parallel
    const matches = await Promise.all(
      matchIds.map(async (matchId) => {
        const matchUrl = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const matchRes = await riotFetch(matchUrl, req);
        const matchData = (await matchRes.json()) as any;

        const participant = matchData.info.participants.find(
          (p: any) => p.puuid === puuid
        );

        if (!participant) return null;

        return {
          matchId,
          gameMode: matchData.info.gameMode as string,
          gameDuration: matchData.info.gameDuration as number,
          gameEndTimestamp: matchData.info.gameEndTimestamp as number,
          win: participant.win as boolean,
          championName: participant.championName as string,
          championId: participant.championId as number,
          kills: participant.kills as number,
          deaths: participant.deaths as number,
          assists: participant.assists as number,
          totalDamageDealt: participant.totalDamageDealtToChampions as number,
          goldEarned: participant.goldEarned as number,
          cs: (participant.totalMinionsKilled + participant.neutralMinionsKilled) as number,
          visionScore: participant.visionScore as number,
          items: [
            participant.item0,
            participant.item1,
            participant.item2,
            participant.item3,
            participant.item4,
            participant.item5,
            participant.item6,
          ] as number[],
          summoner1Id: participant.summoner1Id as number,
          summoner2Id: participant.summoner2Id as number,
          perks: {
            primaryStyleId: participant.perks?.styles?.[0]?.style ?? 0,
            subStyleId: participant.perks?.styles?.[1]?.style ?? 0,
          },
        };
      })
    );

    const filtered = matches.filter(Boolean);
    const validated = GetSummonerMatchesResponse.parse(filtered);
    res.json(validated);
  } catch (err: any) {
    res.status(500).json({ error: "riot_api_error", message: err?.message ?? "Unknown error" });
  }
});

// GET /api/summoner/:puuid/mastery?region=&count=
router.get("/:puuid/mastery", async (req, res) => {
  const { puuid } = req.params;
  const { region, count } = req.query as { region: string; count?: string };

  if (!region) {
    res.status(400).json({ error: "bad_request", message: "region is required" });
    return;
  }

  const regionLower = region.toLowerCase();
  const masteryCount = Math.min(Number(count ?? 7), 10);

  try {
    const url = `https://${regionLower}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${masteryCount}`;
    const apiRes = await riotFetch(url, req);
    const data = (await apiRes.json()) as Array<{
      championId: number;
      championLevel: number;
      championPoints: number;
      lastPlayTime: number;
    }>;

    // Get champion name from Data Dragon
    const ddVersion = "14.24.1";
    const championsRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/champion.json`
    );
    const championsData = (await championsRes.json()) as { data: Record<string, { key: string; name: string }> };
    const championsByKey: Record<string, string> = {};
    for (const [name, champ] of Object.entries(championsData.data)) {
      championsByKey[champ.key] = name;
    }

    const mastery = data.map((entry) => ({
      championId: entry.championId,
      championName: championsByKey[String(entry.championId)] ?? "Unknown",
      championLevel: entry.championLevel,
      championPoints: entry.championPoints,
      lastPlayTime: entry.lastPlayTime,
    }));

    const validated = GetSummonerMasteryResponse.parse(mastery);
    res.json(validated);
  } catch (err: any) {
    res.status(500).json({ error: "riot_api_error", message: err?.message ?? "Unknown error" });
  }
});

export default router;
