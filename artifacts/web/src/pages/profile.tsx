import { useParams, Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ChevronLeft, Trophy, Target, Shield, AlertCircle,
  TrendingUp, TrendingDown, Minus, Flame, Snowflake,
  BarChart3, Swords, Eye, Award,
  ChevronUp, ChevronDown, Check, AlertTriangle,
  Brain, Zap, BookOpen, XCircle,
  Wifi, Clock, Star, GraduationCap, Timer,
  Layers, ArrowUpRight, ArrowDownRight, Info, Users,
  Share2, Copy, CheckCheck, ChevronRight, RefreshCw
} from "lucide-react";
import {
  useSearchSummoner,
  useGetSummonerRanked,
  useGetSummonerMatches,
  useGetSummonerMastery,
  useGetSummonerAnalysis,
  useGetLiveGame,
} from "@workspace/api-client-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const ROLE_EMOJI: Record<string, string> = { Top: "⚔️", Jungler: "🌿", Mid: "✨", ADC: "🏹", Support: "🛡️", Nieznana: "❓" };
const DD = "https://ddragon.leagueoflegends.com/cdn/14.24.1/img";
const FALLBACK_ICON = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png";

function InfoTooltip({ text, align = "left" }: { text: string; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        className="text-muted-foreground/40 hover:text-primary/80 transition-colors cursor-help flex-shrink-0"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
      >
        <Info className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: -3, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -3, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className={`absolute top-5 z-[100] w-64 text-[11px] text-foreground/85 leading-relaxed shadow-2xl pointer-events-none ${align === "right" ? "right-0" : "left-0"}`}
            style={{ background: "rgba(5,10,22,0.98)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "6px", padding: "10px 12px" }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function SparklineChart({ matches }: { matches: any[] }) {
  if (!matches || matches.length < 3) return null;
  const rev = [...matches].reverse();
  const kdas = rev.map((m: any) => Math.min(m.deaths === 0 ? m.kills + m.assists : (m.kills + m.assists) / m.deaths, 12));
  const max = Math.max(...kdas, 4);
  const w = 280, h = 44, px = 6, py = 4;
  const iw = w - px * 2, ih = h - py * 2;
  const pts = kdas.map((k, i) => ({ x: px + (i / Math.max(kdas.length - 1, 1)) * iw, y: py + (1 - k / max) * ih, win: rev[i].win }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const gradientId = "sparkGrad";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,212,255,0.18)" />
          <stop offset="100%" stopColor="rgba(0,212,255,0)" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`} fill={`url(#${gradientId})`} />
      <path d={d} fill="none" stroke="rgba(0,212,255,0.55)" strokeWidth="1.5" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={p.win ? "#22c55e" : "#ef4444"} />)}
    </svg>
  );
}

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

const TIER_ABBR: Record<string, string> = {
  CHALLENGER: "C", GRANDMASTER: "GM", MASTER: "M",
  DIAMOND: "D", EMERALD: "E", PLATINUM: "P",
  GOLD: "G", SILVER: "S", BRONZE: "B", IRON: "I",
};

function LiveGameBanner({ data, selfPuuid }: { data: any; selfPuuid?: string }) {
  if (!data) return null;

  const [elapsed, setElapsed] = useState<number>(data.gameLength ?? 0);
  useEffect(() => {
    setElapsed(data.gameLength ?? 0);
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [data.gameLength]);

  const t1 = (data.participants ?? []).filter((p: any) => p.teamId === 100);
  const t2 = (data.participants ?? []).filter((p: any) => p.teamId === 200);
  const b1 = (data.bans ?? []).filter((b: any) => b.teamId === 100).sort((a: any, b: any) => a.pickTurn - b.pickTurn);
  const b2 = (data.bans ?? []).filter((b: any) => b.teamId === 200).sort((a: any, b: any) => a.pickTurn - b.pickTurn);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const modeLabel: Record<string, string> = {
    CLASSIC: "Rankingowa", ARAM: "ARAM", URF: "URF", ONEFORALL: "OFA", TUTORIAL: "Tutorial",
  };

  function SpellIcon({ id }: { id: number }) {
    const name = SPELL_IMG[id];
    if (!name) return <div className="w-4 h-4 rounded bg-muted/30" />;
    return <img src={`${DD}/spell/${name}.png`} alt={name} className="w-4 h-4 rounded border border-black/30" onError={(e) => { e.currentTarget.style.display = "none"; }} />;
  }

  function RuneStyleIcon({ styleId, size = 14 }: { styleId: number; size?: number }) {
    const name = RUNE_STYLE_ICON[styleId];
    if (!name) return <div style={{ width: size, height: size }} className="rounded-full bg-muted/20" />;
    return (
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${name}.png`}
        alt=""
        style={{ width: size, height: size }}
        className="rounded-full"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }

  function RankBadge({ tier, division }: { tier: string; division: string }) {
    const color = TIER_COLOR[tier] ?? "#6B6B6B";
    const abbr = TIER_ABBR[tier] ?? "?";
    const showDiv = !["CHALLENGER", "GRANDMASTER", "MASTER"].includes(tier) && division;
    return (
      <div
        className="flex-shrink-0 flex items-center justify-center rounded text-[8px] font-extrabold leading-none"
        style={{ color, border: `1px solid ${color}40`, background: `${color}12`, minWidth: 22, height: 16, padding: "0 3px" }}
        title={tier + (showDiv ? ` ${division}` : "")}
      >
        {abbr}{showDiv ? ` ${division}` : ""}
      </div>
    );
  }

  function BanRow({ bans, color }: { bans: any[]; color: string }) {
    if (!bans.length) return null;
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {bans.map((b: any, i: number) => (
          <div key={i} title={b.championName === "Brak" ? "Brak bana" : b.championName}
            className={`relative rounded overflow-hidden ${b.championName === "Brak" ? "opacity-30" : ""}`}>
            {b.championName !== "Brak" ? (
              <>
                <img src={`${DD}/champion/${b.championName}.png`} alt={b.championName}
                  className="w-6 h-6 object-cover grayscale opacity-60" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div className={`absolute inset-0 ${color === "blue" ? "bg-blue-950/40" : "bg-red-950/40"}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/60 text-[8px] font-bold">✕</span>
                </div>
              </>
            ) : (
              <div className="w-6 h-6 rounded bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <span className="text-muted-foreground/30 text-[9px]">?</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden mb-5 border"
      style={{ background: "linear-gradient(135deg, rgba(21,128,61,0.08) 0%, rgba(13,18,38,0.9) 100%)", borderColor: "rgba(34,197,94,0.2)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "rgba(34,197,94,0.12)", background: "rgba(21,128,61,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          <span className="text-sm font-bold text-green-400 tracking-wide">LIVE</span>
          <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.8)" }}>
            {modeLabel[data.gameMode] ?? data.gameMode}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-green-300">
          <Clock className="w-3.5 h-3.5" />
          {fmt(elapsed)}
        </div>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-2 divide-x" style={{ divideColor: "rgba(255,255,255,0.05)" }}>
        {[{ participants: t1, bans: b1, color: "blue", label: "Niebiescy" }, { participants: t2, bans: b2, color: "red", label: "Czerwoni" }].map(({ participants, bans, color, label }) => (
          <div key={color} className="p-3">
            <p className={`text-[9px] uppercase tracking-[0.18em] font-bold mb-2 ${color === "blue" ? "text-blue-400" : "text-red-400"}`}>{label}</p>
            <div className="space-y-1.5">
              {participants.map((pl: any, i: number) => {
                const isSelf = pl.puuid === selfPuuid;
                return (
                  <div key={i} className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors ${isSelf ? (color === "blue" ? "bg-blue-500/10 ring-1 ring-blue-500/25" : "bg-red-500/10 ring-1 ring-red-500/25") : "hover:bg-white/[0.03]"}`}>
                    {/* Champion icon */}
                    <img src={`${DD}/champion/${pl.championName}.png`} alt={pl.championName}
                      className="w-7 h-7 rounded-md border flex-shrink-0"
                      style={{ borderColor: color === "blue" ? "rgba(59,130,246,0.2)" : "rgba(239,68,68,0.2)" }}
                      onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }} />
                    {/* Name + champion */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] truncate font-medium leading-tight ${isSelf ? (color === "blue" ? "text-blue-300" : "text-red-300") : "text-foreground/80"}`}>
                        {isSelf ? "▶ " : ""}{pl.summonerName}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 truncate leading-tight">{pl.championName}</p>
                    </div>
                    {/* Rank badge */}
                    {pl.rankedTier && pl.rankedTier !== "UNRANKED" && (
                      <RankBadge tier={pl.rankedTier} division={pl.rankedDivision ?? ""} />
                    )}
                    {/* Rune path icons */}
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <RuneStyleIcon styleId={pl.perks?.perkStyle ?? 0} size={14} />
                      <RuneStyleIcon styleId={pl.perks?.perkSubStyle ?? 0} size={12} />
                    </div>
                    {/* Summoner spells */}
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <SpellIcon id={pl.spell1Id} />
                      <SpellIcon id={pl.spell2Id} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bans */}
            {bans.length > 0 && (
              <div className="mt-2.5 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <p className="text-[8px] uppercase tracking-widest text-muted-foreground/40 mb-1.5">Bany</p>
                <BanRow bans={bans} color={color} />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OpScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? "text-green-400 bg-green-500/10 border-green-500/20"
    : score >= 6 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color} flex-shrink-0`}>{score.toFixed(1)}</span>
  );
}

function RadarChart({ data }: { data: { aggression: number; farming: number; vision: number; teamfighting: number; carry: number } }) {
  const cx = 100, cy = 100, r = 70;
  const labels = [
    { key: "aggression", label: "Agresja" },
    { key: "farming", label: "Farmienie" },
    { key: "vision", label: "Wizja" },
    { key: "teamfighting", label: "Walki" },
    { key: "carry", label: "Carry" },
  ];
  const angles = labels.map((_, i) => (i * 72 - 90) * (Math.PI / 180));
  const values = labels.map((l) => (data as any)[l.key] / 100);
  const pts = (fracs: number[]) => fracs.map((f, i) => ({
    x: cx + f * r * Math.cos(angles[i]),
    y: cy + f * r * Math.sin(angles[i]),
  }));
  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const axisEndPts = pts(Array(5).fill(1));
  const dataPts = pts(values);
  const labelPts = pts(Array(5).fill(1.28));
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {gridLevels.map((lvl) => {
        const gPts = pts(Array(5).fill(lvl));
        return <path key={lvl} d={toPath(gPts)} fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="1" />;
      })}
      {axisEndPts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
      ))}
      <path d={toPath(dataPts)} fill="rgba(0,212,255,0.12)" stroke="rgba(0,212,255,0.6)" strokeWidth="1.5" />
      {dataPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(196,100%,50%)" />)}
      {labelPts.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
          className="fill-muted-foreground" style={{ fontSize: "9px", fill: "rgba(148,163,184,0.9)", fontFamily: "inherit" }}>
          {labels[i].label}
          <tspan x={p.x} dy="10" style={{ fontSize: "8px", fill: "rgba(0,212,255,0.9)", fontWeight: "bold" }}>
            {Math.round((data as any)[labels[i].key])}
          </tspan>
        </text>
      ))}
    </svg>
  );
}

function MatchParticipantRow({ p, isSelf }: { p: any; isSelf: boolean }) {
  const kda = p.deaths === 0 ? "Perf" : ((p.kills + p.assists) / p.deaths).toFixed(1);
  const dmgK = Math.round(p.totalDamageDealt / 1000);
  const goldK = (p.goldEarned / 1000).toFixed(1);
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isSelf ? (p.win ? "bg-win/10 ring-1 ring-win/30" : "bg-loss/10 ring-1 ring-loss/30") : "hover:bg-white/[0.03]"}`}>
      <img
        src={`${DD}/champion/${p.championName}.png`}
        alt={p.championName}
        className="w-7 h-7 rounded-md border border-border flex-shrink-0"
        onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }}
      />
      <div className="flex-1 min-w-0">
        <span className={`text-xs truncate block font-medium ${isSelf ? "text-primary" : "text-foreground/80"}`}>
          {p.summonerName || p.championName}
        </span>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground w-16 text-center flex-shrink-0">
        {p.kills}/<span className="text-loss">{p.deaths}</span>/{p.assists}
      </span>
      <span className="text-[10px] text-muted-foreground w-8 text-right flex-shrink-0">{kda}</span>
      <span className="text-[10px] text-muted-foreground w-10 text-right flex-shrink-0">{p.cs} CS</span>
      <span className="text-[10px] text-muted-foreground w-10 text-right flex-shrink-0">{dmgK}K</span>
      <span className="text-[10px] text-yellow-500/80 w-10 text-right flex-shrink-0">{goldK}K</span>
      <OpScoreBadge score={p.opScore} />
    </div>
  );
}

function MatchRow({ match, index, selfPuuid }: { match: any; index: number; selfPuuid?: string }) {
  const [expanded, setExpanded] = useState(false);
  const w = match.win;
  const kda = match.deaths === 0 ? "Perf" : ((match.kills + match.assists) / match.deaths).toFixed(1);
  const dur = `${Math.floor(match.gameDuration / 60)}:${(match.gameDuration % 60).toString().padStart(2, "0")}`;
  const timeAgo = formatDistanceToNow(new Date(match.gameEndTimestamp), { addSuffix: true, locale: pl });

  const participants: any[] = match.participants ?? [];
  const team1 = participants.filter((p: any) => p.teamId === 100);
  const team2 = participants.filter((p: any) => p.teamId === 200);
  const hasParticipants = participants.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}>
      {/* Main row — click to expand */}
      <div
        title={timeAgo}
        onClick={() => hasParticipants && setExpanded(v => !v)}
        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border-l-2 transition-colors
          ${w ? "border-l-win bg-win-bg/30" : "border-l-loss bg-loss-bg/30"}
          ${hasParticipants ? "cursor-pointer hover:bg-muted/20" : ""}
          ${expanded ? (w ? "rounded-b-none" : "rounded-b-none") : ""}`}
      >
        <div className="relative flex-shrink-0">
          <img src={`${DD}/champion/${match.championName}.png`} alt={match.championName} className="w-8 h-8 rounded-lg border border-border"
            onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }} />
          {match.opponent && (
            <img src={`${DD}/champion/${match.opponent.championName}.png`} alt={match.opponent.championName}
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-border bg-card"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold ${w ? "text-win" : "text-loss"}`}>{w ? "W" : "L"}</span>
            <span className="font-mono text-xs font-semibold">
              {match.kills}<span className="text-muted-foreground/50">/</span><span className="text-loss">{match.deaths}</span><span className="text-muted-foreground/50">/</span>{match.assists}
            </span>
            <span className="text-[10px] text-muted-foreground">{kda}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">{match.cs} CS · {dur}</div>
        </div>
        {match.opScore !== undefined && <OpScoreBadge score={match.opScore} />}
        {hasParticipants && (
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
          </motion.div>
        )}
      </div>

      {/* Expanded participants panel */}
      <AnimatePresence>
        {expanded && hasParticipants && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`border border-t-0 rounded-b-lg px-3 pb-3 pt-2 ${w ? "border-win/20 bg-win/5" : "border-loss/20 bg-loss/5"}`}>
              {/* Header row */}
              <div className="flex items-center gap-2 px-2 pb-1.5 mb-1 border-b border-white/[0.06]">
                <div className="w-7 flex-shrink-0" />
                <div className="flex-1" />
                <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider w-16 text-center flex-shrink-0">KDA</span>
                <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider w-8 text-right flex-shrink-0">Ratio</span>
                <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider w-10 text-right flex-shrink-0">CS</span>
                <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider w-10 text-right flex-shrink-0">DMG</span>
                <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider w-10 text-right flex-shrink-0">Złoto</span>
                <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider w-8 text-right flex-shrink-0">OP</span>
              </div>

              {/* Team 1 */}
              <div className="mb-2">
                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-2 mb-1">
                  {w && team1.some((p: any) => p.puuid === selfPuuid) ? "✓ " : ""}Drużyna Niebieska
                  <span className={`ml-1.5 ${team1[0]?.win ? "text-win" : "text-loss"}`}>
                    {team1[0]?.win ? "WYGRANA" : "PRZEGRANA"}
                  </span>
                </p>
                <div className="space-y-0.5">
                  {team1.map((p: any, i: number) => (
                    <MatchParticipantRow key={i} p={p} isSelf={p.puuid === selfPuuid} />
                  ))}
                </div>
              </div>

              {/* Team 2 */}
              <div>
                <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest px-2 mb-1">
                  {!w && team2.some((p: any) => p.puuid === selfPuuid) ? "✓ " : ""}Drużyna Czerwona
                  <span className={`ml-1.5 ${team2[0]?.win ? "text-win" : "text-loss"}`}>
                    {team2[0]?.win ? "WYGRANA" : "PRZEGRANA"}
                  </span>
                </p>
                <div className="space-y-0.5">
                  {team2.map((p: any, i: number) => (
                    <MatchParticipantRow key={i} p={p} isSelf={p.puuid === selfPuuid} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RankedCard({ entry }: { entry: any }) {
  const tier = entry?.tier ?? "UNRANKED";
  const wr = entry ? Math.round((entry.wins / (entry.wins + entry.losses)) * 100) : 0;
  const queueLabel = entry?.queueType === "RANKED_SOLO_5x5" ? "Solo / Duo" : entry?.queueType === "RANKED_FLEX_SR" ? "Flex 5v5" : "Rankingowe";
  const wrBarColor = wr >= 55 ? "#22c55e" : wr >= 50 ? "#eab308" : "#ef4444";
  const tierColor = TIER_COLOR[tier] ?? "#6B6B6B";
  return (
    <div className="relative overflow-hidden p-3 gradient-border-cyan"
      style={{
        background: "rgba(5,10,22,0.85)",
        border: "1px solid rgba(0,212,255,0.1)",
        borderRadius: "8px",
        borderLeft: `2px solid ${tierColor}`,
      }}>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${tier.toLowerCase()}.png`}
            alt={tier} className="w-12 h-12 object-contain drop-shadow-lg" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="data-label mb-0.5">{queueLabel}</p>
          <p className="text-sm font-bold leading-tight" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, color: tierColor }}>
            {tier}{entry?.rank ? ` ${entry.rank}` : ""}
          </p>
          {entry && (
            <>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="text-foreground font-bold" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
                  {entry.leaguePoints} <span className="text-muted-foreground font-normal text-[10px]">LP</span>
                </span>
                <span className="text-muted-foreground text-[10px]">·</span>
                <span className="text-muted-foreground text-[10px]">{entry.wins}W {entry.losses}L</span>
                <span className={`font-bold text-[10px] ml-auto ${wr >= 50 ? "text-win" : "text-loss"}`}>{wr}%</span>
              </div>
              <div className="mt-1.5 w-full h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(0,212,255,0.08)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${wr}%`, background: wrBarColor, opacity: 0.8 }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisSection({ data, isLoading, recentMatches }: { data: any; isLoading: boolean; recentMatches?: any[] }) {
  if (isLoading) return <div className="glass-panel p-8 flex items-center justify-center min-h-[200px]"><LoadingSpinner text="Analizowanie wyników..." /></div>;
  if (!data || data.totalGamesAnalyzed === 0) return (
    <div className="glass-panel p-6 text-center">
      <AlertTriangle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
      <p className="text-sm text-muted-foreground">Za mało danych do analizy. Zagraj więcej meczy.</p>
    </div>
  );

  const { overallScore, overallRating, totalGamesAnalyzed, winRate, metrics, championBreakdown, formTrend, strengths, weaknesses,
    playstyleArchetype, playstyleDescription, criticalMistakes, gameplayPatterns, primaryRole, roleDistribution, currentStreak,
    bestGame, worstGame, coachingTips, championRecommendations, performanceByGameLength, damageTypeBreakdown,
    predictedTier, playstyleRadar, lanePhaseStats, objectiveStats, deathAnalysis, tiltIndicator } = data;

  const sc = overallScore >= 70 ? "text-green-400" : overallScore >= 50 ? "text-yellow-400" : "text-red-400";
  const sr = overallScore >= 70 ? "stroke-green-400" : overallScore >= 50 ? "stroke-yellow-400" : "stroke-red-400";
  const trendIcon = (t: string) => {
    if (t === "hot") return <Flame className="w-4 h-4 text-orange-400" />;
    if (t === "improving") return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    if (t === "declining") return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    if (t === "cold") return <Snowflake className="w-4 h-4 text-blue-300" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">

      {/* Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="stat-card flex items-center gap-3 col-span-1">
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" className="stroke-muted/30" strokeWidth="3" fill="transparent" />
              <circle cx="18" cy="18" r="15" className={sr} strokeWidth="3" fill="transparent" strokeDasharray={`${overallScore * 0.942} 94.2`} strokeLinecap="round" />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${sc}`}>{overallRating}</span>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Wynik</p>
            <p className={`text-lg font-bold ${sc}`}>{overallScore}</p>
          </div>
        </div>

        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">% wygranych</p>
          <p className={`text-lg font-bold ${winRate >= 50 ? "text-win" : "text-loss"}`}>{winRate}%</p>
          <p className="text-[10px] text-muted-foreground">{totalGamesAnalyzed} meczy</p>
        </div>

        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Rola</p>
          <p className="text-lg font-bold text-foreground flex items-center gap-1.5">{ROLE_EMOJI[primaryRole] ?? "❓"} {primaryRole}</p>
          <p className="text-[10px] text-muted-foreground">
            {Object.entries(roleDistribution ?? {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2).map(([r, p]) => `${r} ${p}%`).join(" · ")}
          </p>
        </div>

        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Streak</p>
          <p className={`text-lg font-bold flex items-center gap-1 ${currentStreak?.type === "win" ? "text-win" : "text-loss"}`}>
            {currentStreak?.type === "win" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {currentStreak?.count}×{currentStreak?.type === "win" ? "W" : "L"}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Forma</p>
            {trendIcon(formTrend?.trend)}
          </div>
          <p className="text-xs text-foreground mt-1">{formTrend?.trendDescription}</p>
        </div>

        <div className="stat-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Trend KDA</p>
          <div className="h-8"><SparklineChart matches={recentMatches ?? []} /></div>
        </div>
      </div>

      {/* Playstyle + Radar + Strengths/Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display text-sm text-white">{playstyleArchetype}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{playstyleDescription}</p>
            </div>
          </div>
          {gameplayPatterns?.length > 0 && (
            <div className="border-t border-border/50 pt-3 mt-3">
              <p className="section-title text-[10px]"><BookOpen className="w-3 h-3" /> Wzorce gry</p>
              <div className="space-y-1">
                {gameplayPatterns.map((p: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground/75"><Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />{p}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel p-4 flex flex-col items-center">
          <p className="section-title self-start"><BarChart3 className="w-3.5 h-3.5 text-primary" /> Pajęczyna stylów <InfoTooltip text="Wykres 5 osi (0–100): Agresja = zabójstwa+asysty na minutę, Farmienie = CS/min, Wizja = wynik wizji, Walki = KP% (udział w zabójstwach drużyny), Carry = różnica KDA wygrane vs porażki." /></p>
          <div className="w-48 h-48 mt-1">
            {playstyleRadar && <RadarChart data={playstyleRadar} />}
          </div>
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="p-3 border-b border-border/30">
            <p className="text-[10px] uppercase tracking-widest font-bold text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> Mocne strony</p>
            <ul className="mt-2 space-y-1">
              {strengths?.slice(0, 4).map((s: string, i: number) => <li key={i} className="text-xs text-foreground/75 flex items-start gap-1.5"><span className="text-green-500 mt-0.5">•</span>{s}</li>)}
            </ul>
          </div>
          <div className="p-3">
            <p className="text-[10px] uppercase tracking-widest font-bold text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Słabe strony</p>
            <ul className="mt-2 space-y-1">
              {weaknesses?.slice(0, 4).map((w: string, i: number) => <li key={i} className="text-xs text-foreground/75 flex items-start gap-1.5"><span className="text-red-400 mt-0.5">•</span>{w}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Coaching Tips */}
      {coachingTips?.length > 0 && (
        <div className="glass-panel p-4">
          <p className="section-title"><GraduationCap className="w-3.5 h-3.5 text-primary" /> Plan poprawy <InfoTooltip text="Spersonalizowane porady treningowe wygenerowane przez silnik analizy na podstawie Twoich najsłabszych wskaźników wydajności. Skupienie się na tych punktach da najszybszy wzrost rangi." /></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {coachingTips.map((tip: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 stat-card">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                <p className="text-xs text-foreground/80 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Champion Recommendations */}
      {championRecommendations?.length > 0 && (
        <div className="glass-panel p-4">
          <p className="section-title"><Star className="w-3.5 h-3.5 text-yellow-400" /> Rekomendowane postacie <InfoTooltip text="Bohaterowie dobrani do Twojego stylu gry. Silnik analizy porównuje Twój archetyp (agresja, farmienie, wizja, walki drużynowe) z profilem każdej postaci i wybiera najlepiej pasujące." /></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {championRecommendations.map((rec: any, i: number) => (
              <div key={i} className="stat-card flex items-start gap-3">
                <img src={`${DD}/champion/${rec.championName}.png`} alt={rec.championName}
                  className="w-11 h-11 rounded-lg border border-border flex-shrink-0"
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{rec.championName}</p>
                  <p className="text-[10px] text-primary leading-snug">{rec.playstyleMatch}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="glass-panel p-4">
        <p className="section-title"><BarChart3 className="w-3.5 h-3.5 text-primary" /> Wskaźniki wydajności <InfoTooltip text="11 wskaźników obliczanych z ostatnich 20 meczy: KDA, KP% (udział w zabójstwach), CS/min, obrażenia/min, udział w obrażeniach drużyny, multikille, wizja, efektywność złota, przeżywalność, konsekwencja, potencjał carry. Wartości 0–100 skalowane do wzorca Twojej rangi." /></p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {metrics?.map((m: any, i: number) => {
            const pct = Math.min(100, (m.value / m.maxValue) * 100);
            const c = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";
            const tc = pct >= 70 ? "text-green-400 bg-green-500/10" : pct >= 40 ? "text-yellow-400 bg-yellow-500/10" : "text-red-400 bg-red-500/10";
            return (
              <div key={i} className="stat-card">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-white truncate">{m.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${tc}`}>{m.rating}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug mb-2 line-clamp-1">{m.description}</p>
                <div className="flex items-center gap-2">
                  <div className="metric-bar flex-1"><div className={`h-full ${c} rounded-full`} style={{ width: `${pct}%` }} /></div>
                  <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{m.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Game Length + Damage + Best/Worst */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <p className="section-title"><Timer className="w-3.5 h-3.5 text-primary" /> Długość meczu <InfoTooltip text="Wyniki podzielone na 3 kategorie: krótkie (<25 min), średnie (25–35 min), długie (>35 min). Pokazuje w jakich typach gier osiągasz najlepsze wyniki — pomocne przy wyborze bohaterów z silnym early lub late game." /></p>
          <div className="space-y-2">
            {[performanceByGameLength?.short, performanceByGameLength?.medium, performanceByGameLength?.long].map((gl: any, i: number) => {
              if (!gl || gl.gamesPlayed === 0) return null;
              const wc = gl.winRate >= 55 ? "text-win" : gl.winRate >= 45 ? "text-yellow-400" : "text-loss";
              return (
                <div key={i} className="stat-card flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{gl.label}</p>
                    <p className="text-[10px] text-muted-foreground">{gl.gamesPlayed} meczy</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${wc}`}>{gl.winRate}% WR</p>
                    <p className="text-[10px] text-muted-foreground">{gl.avgKda} KDA · {gl.avgCsPerMin} CS</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel p-4">
          <p className="section-title"><Layers className="w-3.5 h-3.5 text-primary" /> Typ obrażeń <InfoTooltip text="Rozkład procentowy zadanych obrażeń: fizyczne (AD — postacie atakujące), magiczne (AP — postacie magii), prawdziwe (penetrują pancerz i odporność magiczną — np. Garen, Vayne). Odzwierciedla rodzaj granych bohaterów." /></p>
          {damageTypeBreakdown && (
            <div className="space-y-3">
              {[
                { l: "Fizyczne", p: damageTypeBreakdown.physicalPct, c: "bg-orange-500", t: "text-orange-400" },
                { l: "Magiczne", p: damageTypeBreakdown.magicPct, c: "bg-blue-500", t: "text-blue-400" },
                { l: "Prawdziwe", p: damageTypeBreakdown.truePct, c: "bg-gray-400", t: "text-gray-300" },
              ].map((d) => (
                <div key={d.l}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{d.l}</span>
                    <span className={`text-xs font-bold ${d.t}`}>{d.p}%</span>
                  </div>
                  <div className="metric-bar"><div className={`h-full ${d.c} rounded-full`} style={{ width: `${d.p}%` }} /></div>
                </div>
              ))}
              <div className="flex rounded-lg overflow-hidden h-3 mt-1">
                <div className="bg-orange-500" style={{ width: `${damageTypeBreakdown.physicalPct}%` }} />
                <div className="bg-blue-500" style={{ width: `${damageTypeBreakdown.magicPct}%` }} />
                <div className="bg-gray-400" style={{ width: `${damageTypeBreakdown.truePct}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {bestGame && (
            <div className="stat-card border-green-900/30 bg-green-950/10">
              <p className="text-[10px] uppercase tracking-widest text-green-400 font-bold flex items-center gap-1 mb-2"><Award className="w-3 h-3" /> Najlepszy mecz</p>
              <div className="flex items-center gap-2.5">
                <img src={`${DD}/champion/${bestGame.championName}.png`} alt="" className="w-10 h-10 rounded-lg border border-border"
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div>
                  <p className="text-sm font-semibold text-white">{bestGame.championName}</p>
                  <p className="text-xs font-mono text-green-400">{bestGame.kills}/{bestGame.deaths}/{bestGame.assists} <span className="text-muted-foreground">({bestGame.kda} KDA)</span></p>
                </div>
                <span className="ml-auto text-xs font-bold text-green-400">{bestGame.performanceScore}</span>
              </div>
            </div>
          )}
          {worstGame && (
            <div className="stat-card border-red-900/30 bg-red-950/10">
              <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold flex items-center gap-1 mb-2"><AlertTriangle className="w-3 h-3" /> Najgorszy mecz</p>
              <div className="flex items-center gap-2.5">
                <img src={`${DD}/champion/${worstGame.championName}.png`} alt="" className="w-10 h-10 rounded-lg border border-border"
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div>
                  <p className="text-sm font-semibold text-white">{worstGame.championName}</p>
                  <p className="text-xs font-mono text-red-400">{worstGame.kills}/{worstGame.deaths}/{worstGame.assists} <span className="text-muted-foreground">({worstGame.kda} KDA)</span></p>
                </div>
                <span className="ml-auto text-xs font-bold text-red-400">{worstGame.performanceScore}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Critical Mistakes */}
      {criticalMistakes?.length > 0 && (
        <div className="glass-panel p-4 border-red-900/15">
          <p className="section-title"><XCircle className="w-3.5 h-3.5 text-red-400" /> Krytyczne błędy <InfoTooltip text="Najczęściej powtarzające się szkodliwe nawyki wykryte w Twoich meczach: nadmierna liczba śmierci, słabe farmienie, brak wizji i inne. Wyeliminowanie tych nawyków da najszybszy wzrost rangi." /></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {criticalMistakes.map((m: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-foreground/80 stat-card bg-red-950/10 border-red-900/20">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />{m}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep Analysis: Lane Phase + Objectives + Deaths + Tilt */}
      {(lanePhaseStats || objectiveStats || deathAnalysis || tiltIndicator) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Lane Phase */}
          {lanePhaseStats && (
            <div className="glass-panel p-4">
              <p className="section-title"><Swords className="w-3.5 h-3.5 text-yellow-400" /> Faza linii (Early game) <InfoTooltip text="Analiza agresywności i dominacji w fazie lining. Uwzględnia first blood rate, solo kills, przewagę CS nad oponentem i presję wywieraną na wrogiej linii." /></p>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-3xl font-black ${lanePhaseStats.grade === "S+" || lanePhaseStats.grade === "S" ? "text-yellow-400" : lanePhaseStats.grade === "A" || lanePhaseStats.grade === "B" ? "text-green-400" : lanePhaseStats.grade === "C" ? "text-yellow-400" : "text-red-400"}`}>{lanePhaseStats.grade}</span>
                <div className="flex-1">
                  <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${lanePhaseStats.earlyPressureScore}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Wynik presji: {lanePhaseStats.earlyPressureScore}/100</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center stat-card py-2">
                  <p className="text-sm font-bold text-yellow-400">{lanePhaseStats.firstBloodRate.toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground">First blood</p>
                </div>
                <div className="text-center stat-card py-2">
                  <p className="text-sm font-bold text-orange-400">{lanePhaseStats.avgEarlyKills.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">Kills/mecz</p>
                </div>
                <div className="text-center stat-card py-2">
                  <p className="text-sm font-bold text-blue-400">{lanePhaseStats.avgCsAdvantage.toFixed(0)}</p>
                  <p className="text-[10px] text-muted-foreground">Przewaga CS</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{lanePhaseStats.description}</p>
            </div>
          )}

          {/* Objective Stats */}
          {objectiveStats && (
            <div className="glass-panel p-4">
              <p className="section-title"><Star className="w-3.5 h-3.5 text-blue-400" /> Kontrola obiektywów <InfoTooltip text="Twój wpływ na smoki, wieże, inhibitory i cele kluczowe. Gracze wygrywający rankingi konwertują walkowe przewagi na trwałe obiektywy mapy." /></p>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-3xl font-black ${objectiveStats.grade === "S+" || objectiveStats.grade === "S" ? "text-blue-400" : objectiveStats.grade === "A" || objectiveStats.grade === "B" ? "text-green-400" : objectiveStats.grade === "C" ? "text-yellow-400" : "text-red-400"}`}>{objectiveStats.grade}</span>
                <div className="flex-1">
                  <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${objectiveStats.objectiveControlScore}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Wynik: {objectiveStats.objectiveControlScore}/100</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {[
                  { label: "🐉 Smoki", val: objectiveStats.avgDragonKills.toFixed(1) },
                  { label: "🏰 Wieże", val: objectiveStats.avgTurretKills.toFixed(1) },
                  { label: "🔴 Inhibit.", val: objectiveStats.avgInhibitorKills.toFixed(1) },
                  { label: "⚡ Kradz.", val: objectiveStats.avgObjectivesStolen.toFixed(2) },
                ].map((item, i) => (
                  <div key={i} className="text-center stat-card py-2 px-1">
                    <p className="text-xs font-bold text-white">{item.val}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{objectiveStats.description}</p>
            </div>
          )}

          {/* Death Analysis */}
          {deathAnalysis && (
            <div className="glass-panel p-4">
              <p className="section-title"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Analiza śmierci <InfoTooltip text="Szczegółowa analiza wzorców śmierci: kiedy umierasz, jak długo jesteś martwy i jak to wpływa na Twoje mecze. Czas spędzony martwym to czas bez wpływu na grę." /></p>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-3xl font-black ${deathAnalysis.grade === "S+" || deathAnalysis.grade === "S" ? "text-green-400" : deathAnalysis.grade === "A" || deathAnalysis.grade === "B" ? "text-green-400" : deathAnalysis.grade === "C" ? "text-yellow-400" : "text-red-400"}`}>{deathAnalysis.grade}</span>
                <div className="flex-1">
                  <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${deathAnalysis.deathScore >= 70 ? "bg-green-500" : deathAnalysis.deathScore >= 45 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${deathAnalysis.deathScore}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Wynik przeżycia: {deathAnalysis.deathScore}/100</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center stat-card py-2">
                  <p className={`text-sm font-bold ${deathAnalysis.avgDeaths < 3 ? "text-green-400" : deathAnalysis.avgDeaths < 5 ? "text-yellow-400" : "text-red-400"}`}>{deathAnalysis.avgDeaths.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">Śmierci/mecz</p>
                </div>
                <div className="text-center stat-card py-2">
                  <p className={`text-sm font-bold ${deathAnalysis.avgTimeDeadPct < 8 ? "text-green-400" : deathAnalysis.avgTimeDeadPct < 16 ? "text-yellow-400" : "text-red-400"}`}>{deathAnalysis.avgTimeDeadPct.toFixed(1)}%</p>
                  <p className="text-[10px] text-muted-foreground">Czas martwy</p>
                </div>
                <div className="text-center stat-card py-2">
                  <p className={`text-sm font-bold ${deathAnalysis.deathSpikeRate < 15 ? "text-green-400" : deathAnalysis.deathSpikeRate < 30 ? "text-yellow-400" : "text-red-400"}`}>{deathAnalysis.deathSpikeRate.toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground">Mecze 7+ śmierci</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{deathAnalysis.description}</p>
            </div>
          )}

          {/* Tilt Indicator */}
          {tiltIndicator && (
            <div className={`glass-panel p-4 ${tiltIndicator.isTilted ? "border-orange-900/20" : ""}`}>
              <p className="section-title"><Flame className="w-3.5 h-3.5 text-orange-400" /> Wskaźnik tiltu <InfoTooltip text="Mierzy jak bardzo Twoja gra pogarsza się po seriach porażek. Wysoki tilt = duży spadek KDA i jakości decyzji podczas strat z rzędu. Kluczowy wskaźnik zdrowia psychicznego w rankingach." /></p>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" className="stroke-muted/30" strokeWidth="3.5" fill="transparent" />
                    <circle cx="18" cy="18" r="14" strokeWidth="3.5" fill="transparent" strokeLinecap="round"
                      strokeDasharray={`${tiltIndicator.score * 0.88} 88`}
                      className={tiltIndicator.score >= 75 ? "stroke-red-500" : tiltIndicator.score >= 55 ? "stroke-orange-400" : tiltIndicator.score >= 35 ? "stroke-yellow-400" : "stroke-green-500"} />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xs font-black ${tiltIndicator.score >= 55 ? "text-orange-400" : "text-green-400"}`}>{tiltIndicator.score}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${tiltIndicator.score >= 75 ? "text-red-400" : tiltIndicator.score >= 55 ? "text-orange-400" : tiltIndicator.score >= 35 ? "text-yellow-400" : "text-green-400"}`}>
                    {tiltIndicator.score >= 75 ? "Silny tilt" : tiltIndicator.score >= 55 ? "Umiarkowany tilt" : tiltIndicator.score >= 35 ? "Lekkie wahania" : "Mentalnie stabilny"}
                  </p>
                  {tiltIndicator.lossStreakKdaDrop > 0.2 && (
                    <p className="text-[10px] text-muted-foreground">KDA spada o {tiltIndicator.lossStreakKdaDrop.toFixed(2)} podczas serii porażek</p>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{tiltIndicator.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Champion Breakdown Table */}
      <div className="glass-panel p-4 overflow-hidden">
        <p className="section-title"><Swords className="w-3.5 h-3.5 text-primary" /> Wyniki na bohaterach <InfoTooltip text="Statystyki z ostatnich 20 meczy pogrupowane po bohaterach. KDA = (Zabójstwa+Asysty)/Śmierci. KP% = udział w zabójstwach drużyny. CS/min = minionki na minutę. Dmg% = Twój procent obrażeń całej drużyny. Wynik = ogólna ocena 0–100." /></p>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 px-2 font-medium">Bohater</th>
                <th className="pb-2 px-2 text-center font-medium">Mecze</th>
                <th className="pb-2 px-2 text-center font-medium">WR</th>
                <th className="pb-2 px-2 text-center font-medium">KDA</th>
                <th className="pb-2 px-2 text-center font-medium">KP%</th>
                <th className="pb-2 px-2 text-center font-medium">CS/min</th>
                <th className="pb-2 px-2 text-center font-medium">Dmg%</th>
                <th className="pb-2 px-2 text-center font-medium">Wynik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {championBreakdown?.sort((a: any, b: any) => b.gamesPlayed - a.gamesPlayed).map((ch: any, i: number) => {
                const pc = ch.performanceScore >= 70 ? "bg-green-500" : ch.performanceScore >= 50 ? "bg-yellow-500" : "bg-red-500";
                return (
                  <tr key={i} className="hover:bg-muted/15 transition-colors">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <img src={`${DD}/champion/${ch.championName}.png`} alt="" className="w-6 h-6 rounded-full border border-border"
                          onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }} />
                        <span className="text-xs font-semibold text-white">{ch.championName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center text-xs font-mono">{ch.gamesPlayed}</td>
                    <td className={`py-2 px-2 text-center text-xs font-mono font-semibold ${ch.winRate >= 50 ? "text-win" : "text-loss"}`}>{ch.winRate}%</td>
                    <td className="py-2 px-2 text-center text-xs font-mono">{ch.kda.toFixed(2)}</td>
                    <td className="py-2 px-2 text-center text-xs font-mono">
                      <span className={ch.killParticipation >= 60 ? "text-green-400" : ch.killParticipation >= 40 ? "text-yellow-400" : "text-red-400"}>
                        {(ch.killParticipation ?? 0).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-xs font-mono">{ch.avgCsPerMin.toFixed(1)}</td>
                    <td className="py-2 px-2 text-center text-xs font-mono">
                      <span className={(ch.damageShare ?? 0) >= 25 ? "text-orange-400" : "text-muted-foreground"}>{(ch.damageShare ?? 0).toFixed(0)}%</span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="text-[10px] font-mono text-muted-foreground w-5 text-right">{ch.performanceScore}</span>
                        <div className="w-12 h-1 bg-muted/60 rounded-full overflow-hidden"><div className={`h-full ${pc}`} style={{ width: `${ch.performanceScore}%` }} /></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type MobileTab = "analiza" | "rang" | "mecze" | "live";

const MOBILE_TABS: { id: MobileTab; label: string; icon: React.ElementType }[] = [
  { id: "analiza", label: "Analiza", icon: BarChart3 },
  { id: "rang", label: "Rang", icon: Trophy },
  { id: "mecze", label: "Mecze", icon: Shield },
  { id: "live", label: "Live", icon: Wifi },
];

function pushHistory(gameName: string, tagLine: string, region: string) {
  try {
    const raw = JSON.parse(localStorage.getItem("nexus_sight_history") ?? "[]") as any[];
    const filtered = raw.filter((e: any) => !(
      e.gameName?.toLowerCase() === gameName.toLowerCase() &&
      e.tagLine?.toLowerCase() === tagLine.toLowerCase() &&
      e.region === region
    ));
    const updated = [{ gameName, tagLine, region, ts: Date.now() }, ...filtered].slice(0, 8);
    localStorage.setItem("nexus_sight_history", JSON.stringify(updated));
  } catch { /* ignore */ }
}

export default function Profile() {
  const params = useParams();
  const region = params.region as string;
  const gameName = decodeURIComponent(params.gameName || "");
  const tagLine = decodeURIComponent(params.tagLine || "");
  const [, navigate] = useLocation();
  const [mobileTab, setMobileTab] = useState<MobileTab>("analiza");
  const [matchCount, setMatchCount] = useState(10);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const handleTabClick = (tabId: MobileTab) => {
    if (tabId === "live") {
      navigate(`/live/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
      return;
    }
    setMobileTab(tabId);
  };

  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useSearchSummoner({ region, gameName, tagLine });
  const puuid = profile?.puuid ?? "";
  const summonerId = profile?.summonerId ?? "";

  const { data: rankedStats, isLoading: isLoadingRanked } = useGetSummonerRanked(puuid, { region }, { query: { enabled: !!puuid } });
  const { data: matches, isLoading: isLoadingMatches } = useGetSummonerMatches(puuid, { region, count: matchCount }, { query: { enabled: !!puuid } });
  const { data: mastery, isLoading: isLoadingMastery } = useGetSummonerMastery(puuid, { region, count: 5 }, { query: { enabled: !!puuid } });
  const { data: analysis, isLoading: isLoadingAnalysis } = useGetSummonerAnalysis(puuid, { region, count: 20 }, { query: { enabled: !!puuid } });
  const { data: liveGame, refetch: refetchLiveGame } = useGetLiveGame(puuid, { region, summonerId }, { query: { enabled: !!puuid, retry: false } });
  useEffect(() => {
    if (!puuid) return;
    const id = setInterval(() => { refetchLiveGame(); }, 30000);
    return () => clearInterval(id);
  }, [puuid, refetchLiveGame]);

  useEffect(() => {
    if (profile?.gameName) pushHistory(profile.gameName, profile.tagLine ?? tagLine, region);
  }, [profile?.gameName]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    });
  };

  if (profileError) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AlertCircle className="w-12 h-12 text-destructive mb-3" />
      <h2 className="font-display text-2xl mb-1">Nie znaleziono gracza</h2>
      <p className="text-sm text-muted-foreground mb-6">{gameName}#{tagLine} nie istnieje w regionie {region}.</p>
      <Link href="/" className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted transition text-sm flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Wróć
      </Link>
    </div>
  );

  if (isLoadingProfile) return <LoadingSpinner text="Wyszukiwanie gracza..." />;

  const soloQ = rankedStats?.find((r: any) => r.queueType === "RANKED_SOLO_5x5");
  const flexQ = rankedStats?.find((r: any) => r.queueType === "RANKED_FLEX_SR");

  return (
    <div className="min-h-screen pb-16">

      {/* Header */}
      <header className="relative border-b overflow-hidden" style={{ borderColor: "rgba(0,212,255,0.08)" }}>
        <div className="absolute inset-0 pointer-events-none grid-bg opacity-40" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(0,180,220,0.05) 0%, transparent 50%, rgba(88,28,220,0.04) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)" }} />

        <div className="relative max-w-7xl mx-auto px-4 py-4 sm:py-5 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 p-1.5 rounded-[4px] hover:bg-white/[0.05]"
            style={{ border: "1px solid rgba(0,212,255,0.1)" }}>
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[8px] overflow-hidden"
              style={{ border: "1.5px solid rgba(0,212,255,0.25)", boxShadow: "0 0 20px rgba(0,212,255,0.14), 0 0 0 0 rgba(0,212,255,0)" }}>
              <img src={`${DD}/profileicon/${profile?.profileIconId}.png`} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-[3px] whitespace-nowrap"
              style={{
                background: "rgba(5,10,22,0.98)",
                border: "1px solid rgba(0,212,255,0.2)",
                color: "hsl(196,100%,60%)",
                fontFamily: "'Rajdhani',sans-serif",
                letterSpacing: "0.05em",
              }}>
              Lv. {profile?.summonerLevel}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none"
                style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, letterSpacing: "0.02em" }}>
                {profile?.gameName}
              </h1>
              <span className="text-sm text-muted-foreground font-sans font-normal">#{profile?.tagLine}</span>
              <span className="tag-chip flex-shrink-0">{region}</span>
              <button
                onClick={handleShare}
                title="Kopiuj link"
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-[4px] transition-all flex-shrink-0"
                style={shareState === "copied"
                  ? { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }
                  : { background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", color: "rgba(148,163,184,0.7)", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}
              >
                {shareState === "copied" ? <CheckCheck className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                {shareState === "copied" ? "Skopiowano!" : "Udostępnij"}
              </button>
              {liveGame && (
                <Link to={`/live/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`}>
                  <span className="text-[9px] px-2 py-0.5 rounded-[3px] font-bold tracking-wider flex items-center gap-1.5 flex-shrink-0 cursor-pointer hover:brightness-125 transition-all"
                    style={{ background: "rgba(34,197,94,0.1)", color: "hsl(152,62%,50%)", border: "1px solid rgba(34,197,94,0.2)", fontFamily: "'Rajdhani',sans-serif" }}>
                    <span className="pulse-dot" />
                    LIVE — ZOBACZ MECZ
                  </span>
                </Link>
              )}
            </div>
            {!isLoadingRanked && (
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                {soloQ && (
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-3 h-3" style={{ color: "rgba(0,212,255,0.5)" }} />
                    <span className="font-bold" style={{ color: "hsl(196,100%,65%)" }}>{soloQ.tier} {soloQ.rank}</span>
                    <span className="text-muted-foreground/60">{soloQ.leaguePoints} LP</span>
                  </span>
                )}
                {flexQ && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-muted-foreground/40" />
                    <span className="text-muted-foreground/70">{flexQ.tier} {flexQ.rank}</span>
                  </span>
                )}
                {!soloQ && !flexQ && <span className="text-muted-foreground/50">Unranked</span>}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-5">
        {liveGame && <LiveGameBanner data={liveGame} selfPuuid={puuid} />}

        {/* Mobile tab navigation */}
        <div className="lg:hidden mb-4 sticky top-0 z-30 py-2"
          style={{ background: "linear-gradient(180deg, hsl(218,60%,3%) 80%, transparent)" }}>
          <div className="mobile-tab-bar">
            {MOBILE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`mobile-tab ${tab.id === "live" ? (liveGame ? "mobile-tab-live" : "mobile-tab-inactive") : (mobileTab === tab.id ? "mobile-tab-active" : "mobile-tab-inactive")}`}
              >
                {tab.id === "live" && liveGame && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Content */}
          <div className={`lg:col-span-9 ${mobileTab !== "analiza" ? "hidden lg:block" : ""}`}>
            <AnalysisSection data={analysis} isLoading={isLoadingAnalysis} recentMatches={matches} />
          </div>

          {/* Sidebar */}
          <aside className={`lg:col-span-3 space-y-4 ${mobileTab === "analiza" ? "hidden lg:flex lg:flex-col" : ""}`}>

            {/* Live Game Button (desktop) */}
            <Link to={`/live/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`}>
              <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-all hover:brightness-110"
                style={{
                  background: liveGame ? "rgba(34,197,94,0.08)" : "rgba(0,212,255,0.04)",
                  border: liveGame ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(0,212,255,0.08)",
                }}>
                {liveGame && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />}
                <Wifi className="w-3.5 h-3.5 flex-shrink-0" style={{ color: liveGame ? "#4ade80" : "rgba(0,212,255,0.5)" }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] flex-1" style={{ fontFamily: "'Rajdhani',sans-serif", color: liveGame ? "#4ade80" : "rgba(0,212,255,0.6)" }}>
                  {liveGame ? "W GRZE — ZOBACZ MECZ" : "LIVE GAME"}
                </span>
                <ChevronRight className="w-3 h-3" style={{ color: liveGame ? "#4ade80" : "rgba(0,212,255,0.3)" }} />
              </div>
            </Link>

            {/* Rang + Predicted */}
            <div className={mobileTab === "mecze" ? "hidden lg:block" : ""}>
              <p className="section-title">
                <Trophy className="w-3.5 h-3.5 text-primary" /> Rang
                <InfoTooltip align="right" text="Twoja liga rankingowa Solo/Duo i Flex. LP (League Points) to punkty do awansu — po 100 LP promujesz do wyższego podziału. WR% = procent wygranych gier w tej kolejce." />
              </p>
              <div className="space-y-2">
                {isLoadingRanked
                  ? <div className="h-20 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
                  : <><RankedCard entry={soloQ} />{flexQ && <RankedCard entry={flexQ} />}</>
                }
                {!isLoadingAnalysis && analysis?.predictedTier && (
                  <div className="rounded-xl p-3 relative overflow-hidden" style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(13,18,38,0.8))",
                    border: "1px solid rgba(139,92,246,0.2)",
                  }}>
                    <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-2 flex items-center gap-1" style={{ color: "#a78bfa" }}>
                      <Brain className="w-3 h-3" /> Szacowana ranga AI
                    </p>
                    <div className="flex items-center gap-2.5">
                      <img src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${analysis.predictedTier.tier.toLowerCase()}.png`}
                        alt={analysis.predictedTier.tier} className="w-11 h-11 object-contain drop-shadow"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      <div>
                        <p className="text-sm font-bold text-gradient-purple">
                          {analysis.predictedTier.tier} {analysis.predictedTier.division}
                        </p>
                        <p className="text-[10px] text-muted-foreground">~{analysis.predictedTier.lp} LP · {analysis.predictedTier.confidence}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mastery */}
            <div className={mobileTab === "mecze" ? "hidden lg:block" : ""}>
              <p className="section-title">
                <Target className="w-3.5 h-3.5 text-primary" /> Mistrzostwo
                <InfoTooltip align="right" text="Oficjalny system Riot Games pokazujący ile gier zagrałeś danym bohaterem. Lv. 7 = najwyższy poziom mistrzostwa. Liczba po prawej (K) = tysiące punktów mistrzostwa zdobytych łącznie." />
              </p>
              <div className="glass-panel p-2 space-y-0.5">
                {isLoadingMastery
                  ? Array(3).fill(0).map((_, i) => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />)
                  : mastery?.length === 0
                    ? <p className="text-xs text-muted-foreground text-center py-3">Brak danych</p>
                    : mastery?.map((ch: any, i: number) => (
                      <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-default">
                        <span className="text-[10px] text-muted-foreground/50 font-mono w-3 text-right">{i + 1}</span>
                        <img src={`${DD}/champion/${ch.championName}.png`} alt="" className="w-8 h-8 rounded-lg"
                          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                          onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/90 truncate">{ch.championName}</p>
                          <p className="text-[10px] text-muted-foreground">Lv. {ch.championLevel}</p>
                        </div>
                        <span className="text-[10px] font-bold" style={{ color: "hsl(196,100%,55%)", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700 }}>
                          {(ch.championPoints / 1000).toFixed(0)}K
                        </span>
                      </div>
                    ))
                }
              </div>
            </div>

            {/* Champion Pool Analysis */}
            {!isLoadingMatches && matches && matches.length >= 3 && (() => {
              const champMap: Record<string, { games: number; wins: number }> = {};
              for (const m of matches as any[]) {
                if (!champMap[m.championName]) champMap[m.championName] = { games: 0, wins: 0 };
                champMap[m.championName].games++;
                if (m.win) champMap[m.championName].wins++;
              }
              const champs = Object.entries(champMap).sort((a, b) => b[1].games - a[1].games);
              const total = matches.length;
              const top1Pct = Math.round((champs[0]?.[1]?.games ?? 0) / total * 100);
              const top3Pct = Math.round(champs.slice(0, 3).reduce((s, c) => s + c[1].games, 0) / total * 100);
              const poolLabel = champs.length === 1 ? "Mono-main" : champs.length <= 2 ? "Duo-main" : champs.length <= 4 ? "Wąska pula" : champs.length <= 7 ? "Zrównoważona" : "Szeroka pula";
              const poolColor = champs.length <= 2 ? "text-yellow-400" : champs.length <= 5 ? "text-green-400" : "text-blue-400";
              return (
                <div className={mobileTab === "mecze" ? "hidden lg:block" : ""}>
                  <p className="section-title">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Pula postaci
                    <InfoTooltip align="right" text="Analiza puli bohaterów z ostatnich meczy. Top1% = ile % gier grasz główną postacią. Top3% = ile % pokrywa 3 najpopularniejsze. Mono-main = 1 postać, Szeroka pula = 8+ postaci." />
                  </p>
                  <div className="glass-panel p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className={`text-sm font-bold ${poolColor}`}>{poolLabel}</p>
                        <p className="text-[10px] text-muted-foreground">{champs.length} {champs.length === 1 ? "bohater" : "bohaterów"} w {total} meczach</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Top1 · Top3</p>
                        <p className="text-xs font-mono font-bold">{top1Pct}% · <span className="text-muted-foreground">{top3Pct}%</span></p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {champs.slice(0, 5).map(([name, stat]) => {
                        const wr = Math.round(stat.wins / stat.games * 100);
                        const pct = Math.round(stat.games / total * 100);
                        return (
                          <div key={name} className="flex items-center gap-2">
                            <img src={`${DD}/champion/${name}.png`} alt={name}
                              className="w-6 h-6 rounded-md border border-border flex-shrink-0"
                              onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between mb-0.5">
                                <span className="text-[10px] text-white/80 font-medium truncate">{name}</span>
                                <span className={`text-[10px] font-mono font-bold ${wr >= 50 ? "text-win" : "text-loss"}`}>{wr}%</span>
                              </div>
                              <div className="h-1 rounded-full overflow-hidden bg-white/[0.06]">
                                <div className={`h-full rounded-full ${wr >= 50 ? "bg-win" : "bg-loss"}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground w-4 text-right flex-shrink-0">{stat.games}g</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Match History */}
            <div className={mobileTab === "rang" ? "hidden lg:block" : ""}>
              <p className="section-title">
                <Shield className="w-3.5 h-3.5 text-primary" /> Ostatnie mecze
                <InfoTooltip align="right" text="Ostatnie gry rankingowe. W/L = wynik meczu. K/D/A = Zabójstwa/Śmierci/Asysty. CS = zabite minionki. Mała ikona na portrecie = bohater przeciwnika z Twojej linii. Liczba z prawej = OP Score (0–10). Kliknij mecz żeby zobaczyć wszystkich graczy." />
              </p>
              <div className="space-y-1.5">
                {isLoadingMatches
                  ? Array(5).fill(0).map((_, i) => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.025)" }} />)
                  : matches?.length === 0
                    ? <p className="text-xs text-muted-foreground text-center py-3">Brak historii</p>
                    : matches?.map((m: any, i: number) => <MatchRow key={m.matchId} match={m} index={i} selfPuuid={puuid} />)
                }
              </div>
              {!isLoadingMatches && (matches?.length ?? 0) > 0 && (
                <div className="mt-2 flex gap-2">
                  {matchCount < 30 && (
                    <button
                      onClick={() => setMatchCount(c => Math.min(c + 10, 30))}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-muted-foreground transition-all hover:text-primary hover:bg-white/[0.04]"
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      Załaduj {Math.min(matchCount + 10, 30) - matchCount} więcej
                    </button>
                  )}
                  {matchCount > 10 && (
                    <button
                      onClick={() => setMatchCount(10)}
                      className="py-2 px-3 rounded-lg text-xs text-muted-foreground/50 transition-all hover:text-muted-foreground hover:bg-white/[0.03]"
                      style={{ border: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      Zwiń
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
