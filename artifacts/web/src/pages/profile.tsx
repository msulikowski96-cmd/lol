import { useParams, Link } from "wouter";
import { useState } from "react";
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
  Layers, ArrowUpRight, ArrowDownRight, Info
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
            className={`absolute top-5 z-[100] w-64 text-[11px] text-foreground/85 leading-relaxed bg-card border border-border/70 rounded-xl p-3 shadow-2xl pointer-events-none ${align === "right" ? "right-0" : "left-0"}`}
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
          <stop offset="0%" stopColor="rgba(139,92,246,0.15)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`} fill={`url(#${gradientId})`} />
      <path d={d} fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={p.win ? "#22c55e" : "#ef4444"} />)}
    </svg>
  );
}

function LiveGameBanner({ data }: { data: any }) {
  if (!data) return null;
  const t1 = data.participants?.filter((p: any) => p.teamId === 100) ?? [];
  const t2 = data.participants?.filter((p: any) => p.teamId === 200) ?? [];
  const mins = Math.floor((data.gameLength ?? 0) / 60);
  const secs = (data.gameLength ?? 0) % 60;
  return (
    <div className="glass-panel bg-green-950/10 border-green-500/20 p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold text-green-400 uppercase tracking-wider">W meczu</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />{mins}:{secs.toString().padStart(2, "0")}
          <span className="bg-muted/40 px-1.5 py-0.5 rounded text-[10px]">{data.gameMode}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[{ p: t1, c: "blue" }, { p: t2, c: "red" }].map(({ p, c }) => (
          <div key={c} className="space-y-1">
            <p className={`text-[10px] uppercase tracking-widest font-bold ${c === "blue" ? "text-blue-400" : "text-red-400"} mb-1`}>
              {c === "blue" ? "Niebiescy" : "Czerwoni"}
            </p>
            {p.map((pl: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <img src={`${DD}/champion/${pl.championName}.png`} alt="" className="w-5 h-5 rounded-full" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <span className="text-foreground/70 truncate flex-1">{pl.summonerName}</span>
                <span className="text-muted-foreground text-[10px]">{pl.championName}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
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
        return <path key={lvl} d={toPath(gPts)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
      })}
      {axisEndPts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      <path d={toPath(dataPts)} fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.7)" strokeWidth="1.5" />
      {dataPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#8b5cf6" />)}
      {labelPts.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
          className="fill-muted-foreground" style={{ fontSize: "9px", fill: "rgba(148,163,184,0.9)", fontFamily: "inherit" }}>
          {labels[i].label}
          <tspan x={p.x} dy="10" style={{ fontSize: "8px", fill: "rgba(139,92,246,0.9)", fontWeight: "bold" }}>
            {Math.round((data as any)[labels[i].key])}
          </tspan>
        </text>
      ))}
    </svg>
  );
}

function MatchRow({ match, index }: { match: any; index: number }) {
  const w = match.win;
  const kda = match.deaths === 0 ? "Perf" : ((match.kills + match.assists) / match.deaths).toFixed(1);
  const dur = `${Math.floor(match.gameDuration / 60)}:${(match.gameDuration % 60).toString().padStart(2, "0")}`;
  const timeAgo = formatDistanceToNow(new Date(match.gameEndTimestamp), { addSuffix: true, locale: pl });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
      title={timeAgo}
      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border-l-2 ${w ? "border-l-win bg-win-bg/30" : "border-l-loss bg-loss-bg/30"} hover:bg-muted/20 transition-colors`}>
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
    </motion.div>
  );
}

function RankedCard({ entry }: { entry: any }) {
  const tier = entry?.tier ?? "UNRANKED";
  const wr = entry ? Math.round((entry.wins / (entry.wins + entry.losses)) * 100) : 0;
  return (
    <div className="stat-card flex items-center gap-3">
      <img src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${tier.toLowerCase()}.png`}
        alt={tier} className="w-14 h-14 object-contain flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          {entry?.queueType === "RANKED_SOLO_5x5" ? "Solo/Duo" : entry?.queueType === "RANKED_FLEX_SR" ? "Flex" : "Rankingowe"}
        </p>
        <p className="font-display text-base text-gradient-gold">{tier} {entry?.rank}</p>
        {entry && (
          <div className="flex items-center gap-2 text-xs mt-0.5">
            <span className="text-foreground font-semibold">{entry.leaguePoints} LP</span>
            <span className="text-muted-foreground">{entry.wins}W {entry.losses}L</span>
            <span className={`font-semibold ${wr >= 50 ? "text-win" : "text-loss"}`}>{wr}%</span>
          </div>
        )}
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
    predictedTier, playstyleRadar } = data;

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

export default function Profile() {
  const params = useParams();
  const region = params.region as string;
  const gameName = decodeURIComponent(params.gameName || "");
  const tagLine = decodeURIComponent(params.tagLine || "");

  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useSearchSummoner({ region, gameName, tagLine });
  const puuid = profile?.puuid ?? "";
  const summonerId = profile?.summonerId ?? "";

  const { data: rankedStats, isLoading: isLoadingRanked } = useGetSummonerRanked(puuid, { region }, { query: { enabled: !!puuid } });
  const { data: matches, isLoading: isLoadingMatches } = useGetSummonerMatches(puuid, { region, count: 10 }, { query: { enabled: !!puuid } });
  const { data: mastery, isLoading: isLoadingMastery } = useGetSummonerMastery(puuid, { region, count: 5 }, { query: { enabled: !!puuid } });
  const { data: analysis, isLoading: isLoadingAnalysis } = useGetSummonerAnalysis(puuid, { region, count: 20 }, { query: { enabled: !!puuid } });
  const { data: liveGame } = useGetLiveGame(puuid, { region, summonerId }, { query: { enabled: !!puuid, retry: false } });

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
      <header className="border-b border-border/50 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-5">
          <Link href="/" className="text-muted-foreground hover:text-primary transition mr-1">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="relative flex-shrink-0">
            <img src={`${DD}/profileicon/${profile?.profileIconId}.png`} alt=""
              className="w-16 h-16 rounded-xl border-2 border-primary/30 object-cover" />
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-0.5 rounded text-[10px] font-bold">{profile?.summonerLevel}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white tracking-tight">{profile?.gameName}</h1>
              <span className="text-sm text-muted-foreground font-sans font-normal">#{profile?.tagLine}</span>
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold tracking-widest uppercase">{region}</span>
              {liveGame && (
                <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold tracking-wider flex items-center gap-1 animate-pulse">
                  <Wifi className="w-2.5 h-2.5" /> LIVE
                </span>
              )}
            </div>
            {!isLoadingRanked && (
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {soloQ && <span>Solo/Duo: <span className="text-foreground font-semibold">{soloQ.tier} {soloQ.rank} {soloQ.leaguePoints} LP</span></span>}
                {flexQ && <span>Flex: <span className="text-foreground font-semibold">{flexQ.tier} {flexQ.rank} {flexQ.leaguePoints} LP</span></span>}
                {!soloQ && !flexQ && <span>Unranked</span>}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-5">
        {liveGame && <LiveGameBanner data={liveGame} />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnalysisSection data={analysis} isLoading={isLoadingAnalysis} recentMatches={matches} />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            <div>
              <p className="section-title"><Trophy className="w-3.5 h-3.5 text-primary" /> Rang <InfoTooltip align="right" text="Twoja liga rankingowa Solo/Duo i Flex. LP (League Points) to punkty do awansu — po 100 LP promujesz do wyższego podziału. WR% = procent wygranych gier w tej kolejce." /></p>
              <div className="space-y-2">
                {isLoadingRanked ? <div className="stat-card h-20 animate-pulse" /> : (<><RankedCard entry={soloQ} />{flexQ && <RankedCard entry={flexQ} />}</>)}
                {!isLoadingAnalysis && analysis?.predictedTier && (
                  <div className="stat-card border-primary/20 bg-primary/5">
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1.5 flex items-center gap-1">
                      <Brain className="w-3 h-3" /> Szacowana ranga
                    </p>
                    <div className="flex items-center gap-2">
                      <img src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${analysis.predictedTier.tier.toLowerCase()}.png`}
                        alt={analysis.predictedTier.tier} className="w-10 h-10 object-contain"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      <div>
                        <p className="text-sm font-bold text-gradient-gold">
                          {analysis.predictedTier.tier} {analysis.predictedTier.division}
                        </p>
                        <p className="text-[10px] text-muted-foreground">~{analysis.predictedTier.lp} LP · {analysis.predictedTier.confidence}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="section-title"><Target className="w-3.5 h-3.5 text-primary" /> Mistrzostwo <InfoTooltip align="right" text="Oficjalny system Riot Games pokazujący ile gier zagrałeś danym bohaterem. Lv. 7 = najwyższy poziom mistrzostwa. Liczba po prawej (K) = tysiące punktów mistrzostwa zdobytych łącznie." /></p>
              <div className="glass-panel p-2 space-y-0.5">
                {isLoadingMastery ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-muted/30 rounded animate-pulse" />)
                ) : mastery?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">Brak danych</p>
                ) : (
                  mastery?.map((ch: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                      <span className="text-[10px] text-muted-foreground font-mono w-3">{i + 1}</span>
                      <img src={`${DD}/champion/${ch.championName}.png`} alt="" className="w-8 h-8 rounded-lg border border-border"
                        onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{ch.championName}</p>
                        <p className="text-[10px] text-muted-foreground">Lv. {ch.championLevel}</p>
                      </div>
                      <span className="text-[10px] font-mono text-primary">{(ch.championPoints / 1000).toFixed(0)}K</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="section-title"><Shield className="w-3.5 h-3.5 text-primary" /> Ostatnie mecze <InfoTooltip align="right" text="10 ostatnich gier rankingowych. W/L = wynik meczu. K/D/A = Zabójstwa/Śmierci/Asysty. CS = zabite minionki. Mała ikona na portrecie = bohater przeciwnika z Twojej linii. Liczba z prawej = OP Score (0–10): ogólna ocena Twojej wydajności w meczu." /></p>
              <div className="space-y-1.5">
                {isLoadingMatches ? (
                  Array(5).fill(0).map((_, i) => <div key={i} className="h-14 bg-muted/20 rounded-lg animate-pulse" />)
                ) : matches?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">Brak historii</p>
                ) : (
                  matches?.map((m: any, i: number) => <MatchRow key={m.matchId} match={m} index={i} />)
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
