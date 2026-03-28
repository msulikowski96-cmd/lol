import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Shield, Swords, Eye, RefreshCw, ChevronRight, AlertTriangle } from "lucide-react";
import {
  useSearchSummoner,
  useGetLiveGame,
} from "@workspace/api-client-react";

const DD = "https://ddragon.leagueoflegends.com/cdn/14.24.1/img";
const FALLBACK_ICON = `${DD}/profileicon/29.png`;

const SPELL_IMG: Record<number, string> = {
  1: "SummonerBoost", 3: "SummonerExhaust", 4: "SummonerFlash",
  6: "SummonerHaste", 7: "SummonerHeal", 11: "SummonerSmite",
  12: "SummonerTeleport", 13: "SummonerMana", 14: "SummonerDot",
  21: "SummonerBarrier", 32: "SummonerSnowball", 55: "SummonerPoroRecall",
  39: "SummonerSnowURFSnowball_Mark", 2: "SummonerOldRecall",
};

const RUNE_STYLE_ICON: Record<number, string> = {
  8000: "7201_Precision", 8100: "7200_Domination",
  8200: "7202_Sorcery", 8300: "7203_Whimsy", 8400: "7204_Resolve",
};

const TIER_COLOR: Record<string, string> = {
  CHALLENGER: "#F4C874", GRANDMASTER: "#E84057", MASTER: "#9D5FDB",
  DIAMOND: "#576BCE", EMERALD: "#2AD8A4", PLATINUM: "#22A6B3",
  GOLD: "#C8AA6E", SILVER: "#A0A8BC", BRONZE: "#8D6845", IRON: "#6B6B6B",
};

const TIER_LABEL: Record<string, string> = {
  CHALLENGER: "Challenger", GRANDMASTER: "Grandmaster", MASTER: "Master",
  DIAMOND: "Diament", EMERALD: "Szmaragd", PLATINUM: "Platyna",
  GOLD: "Złoto", SILVER: "Srebro", BRONZE: "Brąz", IRON: "Żelazo",
};

const ROLE_ICONS = ["TOP", "JNG", "MID", "ADC", "SUP"];
const ROLE_LABELS: Record<string, string> = {
  TOP: "Top", JNG: "Jungler", MID: "Mid", ADC: "ADC", SUP: "Support",
};

const GAME_MODE_LABEL: Record<string, string> = {
  CLASSIC: "Rankingowa Solo/Duo", ARAM: "ARAM", URF: "URF",
  ONEFORALL: "Jeden za wszystkich", TUTORIAL: "Tutorial",
  CHERRY: "Arena",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SpellIcon({ id, size = 24 }: { id: number; size?: number }) {
  const name = SPELL_IMG[id];
  if (!name) return <div style={{ width: size, height: size }} className="bg-black/40 border border-white/5" />;
  return (
    <img src={`${DD}/spell/${name}.png`} alt={name}
      style={{ width: size, height: size }}
      className="border border-black/40"
      onError={(e) => { e.currentTarget.style.display = "none"; }} />
  );
}

function RuneIcon({ styleId, size = 20 }: { styleId: number; size?: number }) {
  const name = RUNE_STYLE_ICON[styleId];
  if (!name) return <div style={{ width: size, height: size }} className="rounded-full bg-white/5" />;
  return (
    <img
      src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${name}.png`}
      alt="" style={{ width: size, height: size }} className="rounded-full"
      onError={(e) => { e.currentTarget.style.display = "none"; }} />
  );
}

function WinrateBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  if (total === 0) return <span className="text-[10px] text-white/30">Brak gier</span>;
  const wr = (wins / total) * 100;
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-red-500/30 overflow-hidden" style={{ borderRadius: 1 }}>
        <div className="h-full bg-cyan-400/70" style={{ width: `${wr}%` }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: wr >= 50 ? "#00d4ff" : "#ef4444" }}>
        {wr.toFixed(0)}%
      </span>
      <span className="text-[9px] text-white/30 tabular-nums" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
        {wins}W {losses}L
      </span>
    </div>
  );
}

function RankDisplay({ tier, division, lp }: { tier: string; division: string; lp: number }) {
  const color = TIER_COLOR[tier] ?? "#6B6B6B";
  const label = TIER_LABEL[tier] ?? tier;
  const showDiv = !["CHALLENGER", "GRANDMASTER", "MASTER", "UNRANKED"].includes(tier) && division;

  if (tier === "UNRANKED") {
    return <span className="text-[10px] text-white/25 font-medium">Unranked</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center justify-center text-[9px] font-black tracking-wide px-1.5 py-0.5"
        style={{ color, border: `1px solid ${color}50`, background: `${color}15`, minWidth: 28 }}
      >
        {label.substring(0, 1)}{showDiv ? division : ""}
      </div>
      <span className="text-[10px] tabular-nums" style={{ color, fontFamily: "'Barlow Condensed', sans-serif" }}>
        {lp} LP
      </span>
    </div>
  );
}

function PlayerRow({ player, side, isSelf, position, region }: { player: any; side: "blue" | "red"; isSelf: boolean; position: number; region: string }) {
  const borderColor = side === "blue" ? "rgba(59,130,246,0.2)" : "rgba(239,68,68,0.2)";
  const highlightBg = side === "blue" ? "rgba(59,130,246,0.08)" : "rgba(239,68,68,0.08)";
  const sideAccent = side === "blue" ? "#3B82F6" : "#EF4444";
  const total = (player.rankedWins ?? 0) + (player.rankedLosses ?? 0);
  const wr = total > 0 ? ((player.rankedWins ?? 0) / total * 100) : 0;
  const riotId = player.summonerName ?? "";
  const parts = riotId.split("#");
  const pName = parts[0] ?? riotId;
  const pTag = parts[1] ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "blue" ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: position * 0.05 }}
      className="group relative flex items-center gap-3 px-3 py-2.5 transition-colors"
      style={{
        background: isSelf ? highlightBg : "transparent",
        borderLeft: side === "blue" ? `2px solid ${isSelf ? sideAccent : "transparent"}` : "none",
        borderRight: side === "red" ? `2px solid ${isSelf ? sideAccent : "transparent"}` : "none",
      }}
    >
      <div className="relative flex-shrink-0">
        <img
          src={`${DD}/champion/${player.championName}.png`}
          alt={player.championName}
          className="w-10 h-10 border"
          style={{ borderColor }}
          onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }}
        />
        <div className="absolute -bottom-1 -right-1 flex gap-px">
          <SpellIcon id={player.spell1Id} size={14} />
          <SpellIcon id={player.spell2Id} size={14} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isSelf && <span className="text-[9px] font-bold px-1 py-px" style={{ background: `${sideAccent}25`, color: sideAccent, border: `1px solid ${sideAccent}40` }}>TY</span>}
          {pName && pTag ? (
            <Link to={`/profile/${region}/${encodeURIComponent(pName)}/${encodeURIComponent(pTag)}`}>
              <span className="text-xs font-bold truncate cursor-pointer hover:underline" style={{ color: isSelf ? sideAccent : "rgba(255,255,255,0.85)", fontFamily: "'Barlow Condensed', sans-serif" }}>
                {pName}<span className="text-white/30">#{pTag}</span>
              </span>
            </Link>
          ) : (
            <span className="text-xs font-bold truncate" style={{ color: isSelf ? sideAccent : "rgba(255,255,255,0.85)", fontFamily: "'Barlow Condensed', sans-serif" }}>
              {riotId}
            </span>
          )}
        </div>
        <p className="text-[10px] text-white/40 truncate">{player.championName}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <RuneIcon styleId={player.perks?.perkStyle ?? 0} size={18} />
        <RuneIcon styleId={player.perks?.perkSubStyle ?? 0} size={14} />
      </div>

      <div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[80px]">
        <RankDisplay tier={player.rankedTier} division={player.rankedDivision} lp={player.rankedLP} />
        {total > 0 && (
          <div className="w-full">
            <WinrateBar wins={player.rankedWins ?? 0} losses={player.rankedLosses ?? 0} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BansList({ bans, side }: { bans: any[]; side: "blue" | "red" }) {
  if (!bans.length) return null;
  const color = side === "blue" ? "rgba(59,130,246,0.12)" : "rgba(239,68,68,0.12)";
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <span className="text-[8px] uppercase tracking-[0.2em] text-white/25 font-bold mr-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>BANY</span>
      {bans.map((b: any, i: number) => (
        <div key={i} title={b.championName === "Brak" ? "Brak bana" : b.championName}
          className="relative overflow-hidden" style={{ width: 28, height: 28 }}>
          {b.championName !== "Brak" ? (
            <>
              <img src={`${DD}/champion/${b.championName}.png`} alt={b.championName}
                className="w-full h-full object-cover grayscale opacity-40" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <div className="absolute inset-0" style={{ background: color }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-red-400/70 text-xs font-bold">✕</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
              <span className="text-white/15 text-[9px]">—</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TeamAvgRank(participants: any[]) {
  const tierValues: Record<string, number> = {
    IRON: 1, BRONZE: 2, SILVER: 3, GOLD: 4, PLATINUM: 5,
    EMERALD: 6, DIAMOND: 7, MASTER: 8, GRANDMASTER: 9, CHALLENGER: 10,
  };
  const ranked = participants.filter(p => p.rankedTier && p.rankedTier !== "UNRANKED");
  if (ranked.length === 0) return { label: "Unranked", color: "#6B6B6B" };
  const avg = ranked.reduce((s, p) => s + (tierValues[p.rankedTier] ?? 0), 0) / ranked.length;
  const tiers = Object.entries(tierValues).sort((a, b) => a[1] - b[1]);
  const closest = tiers.reduce((best, t) => Math.abs(t[1] - avg) < Math.abs(best[1] - avg) ? t : best);
  return { label: TIER_LABEL[closest[0]] ?? closest[0], color: TIER_COLOR[closest[0]] ?? "#6B6B6B" };
}

function TeamPanel({ participants, bans, side, selfPuuid, region }: { participants: any[]; bans: any[]; side: "blue" | "red"; selfPuuid?: string; region: string }) {
  const color = side === "blue" ? "#3B82F6" : "#EF4444";
  const label = side === "blue" ? "NIEBIESCY" : "CZERWONI";
  const avg = TeamAvgRank(participants);
  const totalWins = participants.reduce((s, p) => s + (p.rankedWins ?? 0), 0);
  const totalLosses = participants.reduce((s, p) => s + (p.rankedLosses ?? 0), 0);
  const totalGames = totalWins + totalLosses;
  const teamWr = totalGames > 0 ? (totalWins / totalGames * 100) : 0;
  const sortedBans = [...bans].sort((a, b) => a.pickTurn - b.pickTurn);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4" style={{ background: color }} />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color, fontFamily: "'Rajdhani', sans-serif" }}>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-bold" style={{ color: avg.color, fontFamily: "'Rajdhani', sans-serif" }}>
            Śr. {avg.label}
          </span>
          {totalGames > 0 && (
            <span className="text-[9px] tabular-nums" style={{ color: teamWr >= 50 ? "#00d4ff" : "#ef4444", fontFamily: "'Barlow Condensed', sans-serif" }}>
              {teamWr.toFixed(0)}% WR
            </span>
          )}
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
        {participants.map((p: any, i: number) => (
          <PlayerRow key={i} player={p} side={side} isSelf={p.puuid === selfPuuid} position={i} region={region} />
        ))}
      </div>

      <BansList bans={sortedBans} side={side} />
    </div>
  );
}

function NotInGameView({ gameName, tagLine, region }: { gameName: string; tagLine: string; region: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <Eye className="w-7 h-7 text-white/20" />
      </div>
      <h2 className="text-lg font-bold text-white/60 mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
        GRACZ NIE JEST W MECZU
      </h2>
      <p className="text-sm text-white/30 mb-6">
        {gameName}#{tagLine} aktualnie nie gra na serwerze {region}
      </p>
      <p className="text-[10px] text-white/20 mb-6 flex items-center gap-1.5">
        <RefreshCw className="w-3 h-3" />
        Automatyczne sprawdzanie co 15 sekund
      </p>
      <Link to={`/profile/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`}>
        <span className="text-xs font-bold px-4 py-2 cursor-pointer transition-colors" style={{
          background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
          color: "#00d4ff", fontFamily: "'Rajdhani', sans-serif"
        }}>
          ZOBACZ PROFIL <ChevronRight className="w-3 h-3 inline" />
        </span>
      </Link>
    </motion.div>
  );
}

export default function LiveGame() {
  const params = useParams<{ region: string; gameName: string; tagLine: string }>();
  const region = params.region ?? "";
  const gameName = decodeURIComponent(params.gameName ?? "");
  const tagLine = decodeURIComponent(params.tagLine ?? "");

  const { data: summoner, isLoading: isSummonerLoading, error: summonerError } = useSearchSummoner({ gameName, tagLine, region }, {
    query: { enabled: !!gameName && !!tagLine && !!region },
  });

  const puuid = summoner?.puuid ?? "";
  const summonerId = summoner?.summonerId ?? "";

  const { data: liveGame, error: liveError, refetch, isLoading, isFetching, status } = useGetLiveGame(
    puuid,
    { region, summonerId },
    { query: { enabled: !!puuid, retry: false } }
  );

  useEffect(() => {
    if (!puuid) return;
    const id = setInterval(() => { refetch(); }, 15000);
    return () => clearInterval(id);
  }, [puuid, refetch]);

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!liveGame) return;
    setElapsed((liveGame as any).gameLength ?? 0);
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [(liveGame as any)?.gameLength]);

  const inGame = !!liveGame && !liveError;

  const t1 = useMemo(() => (inGame ? ((liveGame as any).participants ?? []).filter((p: any) => p.teamId === 100) : []), [liveGame, inGame]);
  const t2 = useMemo(() => (inGame ? ((liveGame as any).participants ?? []).filter((p: any) => p.teamId === 200) : []), [liveGame, inGame]);
  const b1 = useMemo(() => (inGame ? ((liveGame as any).bans ?? []).filter((b: any) => b.teamId === 100) : []), [liveGame, inGame]);
  const b2 = useMemo(() => (inGame ? ((liveGame as any).bans ?? []).filter((b: any) => b.teamId === 200) : []), [liveGame, inGame]);

  return (
    <div className="min-h-screen" style={{ background: "hsl(218,60%,3%)" }}>
      <div className="grid-bg" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-3 py-4 sm:px-6">
        <div className="flex items-center gap-3 mb-5">
          <Link to={`/profile/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`}>
            <span className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors" style={{ border: "1px solid rgba(0,212,255,0.15)", color: "#00d4ff" }}>
              <ArrowLeft className="w-4 h-4" />
            </span>
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-wide" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#00d4ff" }}>
              LIVE GAME
            </h1>
            <p className="text-[11px] text-white/40">
              {gameName}<span className="text-white/20">#{tagLine}</span>
              <span className="ml-2 text-[9px] px-1.5 py-0.5 font-bold" style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", color: "#00d4ff", fontFamily: "'Rajdhani', sans-serif" }}>
                {region}
              </span>
            </p>
          </div>

          {inGame && (
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>W GRZE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-medium px-2 py-0.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                  {GAME_MODE_LABEL[(liveGame as any)?.gameMode] ?? (liveGame as any)?.gameMode}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-sm font-bold" style={{ color: "#00d4ff" }}>
                <Clock className="w-3.5 h-3.5" />
                {formatTime(elapsed)}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {summonerError ? (
            <motion.div key="summoner-error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-4">
              <AlertTriangle className="w-10 h-10 text-red-400/60 mb-3" />
              <h2 className="text-lg font-bold text-white/60 mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>NIE ZNALEZIONO GRACZA</h2>
              <p className="text-sm text-white/30">{gameName}#{tagLine} nie istnieje na serwerze {region}</p>
            </motion.div>
          ) : isSummonerLoading || (isFetching && !liveGame && status !== "error") ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-3" />
              <p className="text-sm text-white/40">Szukam meczu...</p>
            </motion.div>
          ) : !inGame ? (
            <NotInGameView key="not-in-game" gameName={gameName} tagLine={tagLine} region={region} />
          ) : (
            <motion.div key="game" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="overflow-hidden" style={{ background: "rgba(5,10,22,0.8)", border: "1px solid rgba(0,212,255,0.08)" }}>
                <div className="flex divide-x" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <TeamPanel participants={t1} bans={b1} side="blue" selfPuuid={puuid} region={region} />

                  <div className="hidden sm:flex flex-col items-center justify-center px-3 py-2" style={{ minWidth: 48, background: "rgba(0,0,0,0.3)" }}>
                    <Swords className="w-4 h-4 text-white/15 mb-1" />
                    <span className="text-[8px] text-white/15 font-bold tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>VS</span>
                  </div>

                  <TeamPanel participants={t2} bans={b2} side="red" selfPuuid={puuid} region={region} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Tryb gry", value: GAME_MODE_LABEL[(liveGame as any)?.gameMode] ?? (liveGame as any)?.gameMode, icon: Shield },
                  { label: "Czas gry", value: formatTime(elapsed), icon: Clock },
                  { label: "Mapa", value: (liveGame as any)?.mapId === 11 ? "Summoner's Rift" : (liveGame as any)?.mapId === 12 ? "Howling Abyss" : `Mapa ${(liveGame as any)?.mapId}`, icon: Eye },
                  { label: "Bany", value: `${b1.length + b2.length} / 10`, icon: AlertTriangle },
                ].map((stat, i) => (
                  <div key={i} className="px-3 py-2.5" style={{ background: "rgba(5,10,22,0.6)", border: "1px solid rgba(0,212,255,0.06)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <stat.icon className="w-3 h-3 text-cyan-500/40" />
                      <span className="text-[9px] uppercase tracking-[0.2em] text-white/25 font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{stat.label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "#00d4ff", fontFamily: "'Barlow Condensed', sans-serif" }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 px-3 py-2 flex items-center justify-between" style={{ background: "rgba(5,10,22,0.4)", border: "1px solid rgba(255,255,255,0.03)" }}>
                <span className="text-[9px] text-white/20 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" /> Automatyczne odświeżanie co 15s
                </span>
                <button onClick={() => refetch()} className="text-[10px] font-bold px-3 py-1 transition-colors cursor-pointer" style={{ color: "#00d4ff", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)", fontFamily: "'Rajdhani', sans-serif" }}>
                  ODŚWIEŻ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
