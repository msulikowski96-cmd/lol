import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ChevronLeft, Trophy, Target, Shield, AlertCircle,
  TrendingUp, TrendingDown, Minus, Flame, Snowflake,
  BarChart3, Swords, Eye, Coins, Activity, Award,
  ChevronUp, ChevronDown, Check, AlertTriangle,
  UserRound, Brain, Zap, BookOpen, XCircle,
  Wifi, Clock, Star, GraduationCap, Timer,
  Crosshair, BarChart2, Layers
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

// ─── Sparkline Chart ───
function SparklineChart({ matches }: { matches: any[] }) {
  if (!matches || matches.length < 3) return null;
  const reversed = [...matches].reverse();
  const kdas = reversed.map((m: any) => m.deaths === 0 ? Math.min(m.kills + m.assists, 12) : Math.min((m.kills + m.assists) / m.deaths, 12));
  const wins = reversed.map((m: any) => m.win);
  const maxKda = Math.max(...kdas, 4);
  const w = 300; const h = 55; const padX = 8; const padY = 6;
  const innerW = w - padX * 2; const innerH = h - padY * 2;
  const pts = kdas.map((kda, i) => ({
    x: padX + (i / Math.max(kdas.length - 1, 1)) * innerW,
    y: padY + (1 - kda / maxKda) * innerH,
    win: wins[i],
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <path d={pathD} fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={p.win ? '#22c55e' : '#ef4444'} opacity="0.9" />
      ))}
    </svg>
  );
}

// ─── Live Game Banner ───
function LiveGameBanner({ data }: { data: any }) {
  if (!data) return null;
  const team1 = data.participants?.filter((p: any) => p.teamId === 100) ?? [];
  const team2 = data.participants?.filter((p: any) => p.teamId === 200) ?? [];
  const mins = Math.floor((data.gameLength ?? 0) / 60);
  const secs = (data.gameLength ?? 0) % 60;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel border border-green-500/40 bg-green-950/20 rounded-2xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-display text-lg text-green-400 font-bold">LIVE — Aktualnie w meczu</h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="w-4 h-4" />
          <span>{mins}:{secs.toString().padStart(2, '0')}</span>
          <span className="text-xs bg-muted/50 px-2 py-0.5 rounded ml-1">{data.gameMode}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[{ label: "Drużyna Niebieska", participants: team1, color: "blue" }, { label: "Drużyna Czerwona", participants: team2, color: "red" }].map((team) => (
          <div key={team.color}>
            <p className={`text-xs uppercase tracking-wider font-bold mb-2 ${team.color === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>{team.label}</p>
            <div className="space-y-1.5">
              {team.participants.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${p.championName}.png`}
                    alt={p.championName}
                    className="w-7 h-7 rounded-full border border-border"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <span className="text-sm text-foreground/80 truncate">{p.summonerName}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{p.championName}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Match Row ───
function MatchRow({ match, index }: { match: any; index: number }) {
  const isWin = match.win;
  const kda = match.deaths === 0 ? "Perfekcyjny" : ((match.kills + match.assists) / match.deaths).toFixed(2);
  const timeAgo = formatDistanceToNow(new Date(match.gameEndTimestamp), { addSuffix: true, locale: pl });
  const durationMins = Math.floor(match.gameDuration / 60);
  const durationSecs = match.gameDuration % 60;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative overflow-hidden rounded-xl border ${isWin ? 'border-[var(--color-win-bg)] bg-[var(--color-win-bg)]/20' : 'border-[var(--color-loss-bg)] bg-[var(--color-loss-bg)]/20'} p-4 flex items-center gap-4 hover:bg-card/60 transition-colors`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isWin ? 'bg-win' : 'bg-loss'}`} />
      <div className="flex flex-col w-24 text-center">
        <span className={`font-bold ${isWin ? 'text-win' : 'text-loss'}`}>{isWin ? 'WYGRANA' : 'PRZEGRANA'}</span>
        <span className="text-xs text-muted-foreground">{match.gameMode}</span>
        <span className="text-xs text-muted-foreground mt-1">{durationMins}:{durationSecs.toString().padStart(2, '0')}</span>
      </div>
      <div className="relative">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${match.championName}.png`}
          alt={match.championName}
          className="w-14 h-14 rounded-full border-2 border-card-border"
          onError={(e) => { e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png' }}
        />
      </div>
      <div className="flex flex-col items-center px-4 w-32">
        <div className="font-mono text-lg font-bold tracking-tight">
          <span>{match.kills}</span><span className="text-muted-foreground mx-1">/</span>
          <span className="text-destructive">{match.deaths}</span><span className="text-muted-foreground mx-1">/</span>
          <span>{match.assists}</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono mt-1">{kda} KDA</span>
      </div>
      <div className="flex flex-col items-center px-2 border-l border-border/50">
        <span className="text-sm font-semibold">{match.cs} CS</span>
        <span className="text-xs text-muted-foreground">Wizja: {match.visionScore}</span>
      </div>
      <div className="flex gap-1 ml-auto">
        {match.items.slice(0, 6).map((item: number, i: number) => (
          <div key={i} className="w-8 h-8 rounded bg-muted overflow-hidden border border-border/50">
            {item !== 0 && <img src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/${item}.png`} alt="item" className="w-full h-full object-cover" />}
          </div>
        ))}
      </div>
      <div className="absolute top-2 right-4 text-[10px] text-muted-foreground/60 uppercase">{timeAgo}</div>
    </motion.div>
  );
}

// ─── Ranked Badge ───
function RankedBadge({ entry }: { entry: any }) {
  const isUnranked = !entry;
  const tier = isUnranked ? 'UNRANKED' : entry.tier;
  const winrate = isUnranked ? 0 : Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center gap-6">
      <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
        <img
          src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${tier.toLowerCase()}.png`}
          alt={tier}
          className="w-full h-full object-contain filter drop-shadow-lg"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {entry?.queueType === 'RANKED_SOLO_5x5' ? 'Solo / Duo' : entry?.queueType === 'RANKED_FLEX_SR' ? 'Flex' : 'Rankingowe'}
        </span>
        <h3 className="font-display text-2xl text-gradient-gold">{tier} {entry?.rank}</h3>
        {!isUnranked ? (
          <>
            <span className="text-lg font-bold text-foreground mt-1">{entry.leaguePoints} LP</span>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-muted-foreground">{entry.wins}W {entry.losses}L</span>
              <span className={`font-semibold ${winrate >= 50 ? 'text-win' : 'text-loss'}`}>{winrate}% WR</span>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground mt-2">Brak rozegranych meczy</span>
        )}
      </div>
    </div>
  );
}

// ─── Player Analysis Section ───
function PlayerAnalysisSection({ data, isLoading, recentMatches }: { data: any; isLoading: boolean; recentMatches?: any[] }) {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-8 mb-8 animate-pulse">
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner text="Analizowanie danych gracza..." />
        </div>
      </div>
    );
  }
  if (!data || data.totalGamesAnalyzed === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 mb-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="font-display text-2xl mb-2 text-white">Za mało danych meczowych do analizy</h3>
        <p className="text-muted-foreground">Zagraj więcej meczy rankingowych, aby wygenerować analizę wyników.</p>
      </div>
    );
  }

  const {
    overallScore, overallRating, totalGamesAnalyzed, winRate,
    metrics, championBreakdown, formTrend, strengths, weaknesses,
    playstyleArchetype, playstyleDescription, criticalMistakes, gameplayPatterns,
    primaryRole, roleDistribution, currentStreak,
    bestGame, worstGame, coachingTips, championRecommendations,
    performanceByGameLength, damageTypeBreakdown,
  } = data;

  const scoreColor = overallScore >= 70 ? 'text-green-500' : overallScore >= 50 ? 'text-yellow-500' : 'text-red-500';
  const scoreRingColor = overallScore >= 70 ? 'stroke-green-500' : overallScore >= 50 ? 'stroke-yellow-500' : 'stroke-red-500';

  const getTrendIcon = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'hot': return <Flame className="w-6 h-6 text-orange-500" />;
      case 'improving': return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'declining': return <TrendingDown className="w-6 h-6 text-red-500" />;
      case 'cold': return <Snowflake className="w-6 h-6 text-blue-300" />;
      default: return <Minus className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const streakColor = currentStreak?.type === 'win' ? 'text-green-400 border-green-500/30 bg-green-950/20' : 'text-red-400 border-red-500/30 bg-red-950/20';

  const roleIcon: Record<string, string> = { Top: '⚔️', Jungler: '🌿', Mid: '✨', ADC: '🏹', Support: '🛡️', Nieznana: '❓' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 mb-8 w-full">

      {/* ROW 0: Sparkline + Streak + Role + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Trend KDA — ostatnie mecze
            </h3>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Wygrana</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Porażka</span>
            </div>
          </div>
          <div className="h-14">
            <SparklineChart matches={recentMatches ?? []} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Każdy punkt = jeden mecz (od najstarszego do najnowszego)</p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Streak */}
          <div className={`glass-panel p-4 rounded-2xl border flex items-center gap-3 ${streakColor}`}>
            <Flame className={`w-6 h-6 flex-shrink-0 ${currentStreak?.type === 'win' ? 'text-green-400' : 'text-red-400'}`} />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Aktualny streak</p>
              <p className="font-bold text-lg">{currentStreak?.count}× {currentStreak?.type === 'win' ? 'WYGRANA' : 'PRZEGRANA'}</p>
            </div>
          </div>
          {/* Primary Role */}
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">{roleIcon[primaryRole] ?? '❓'}</span>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Główna rola</p>
              <p className="font-bold text-lg text-white">{primaryRole}</p>
              <p className="text-xs text-muted-foreground">
                {Object.entries(roleDistribution ?? {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2).map(([role, pct]) => `${role} ${pct}%`).join(' · ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 1: Overall Score | Form Trend | Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center">
          <h3 className="font-display text-xl text-white mb-5">Ogólne wyniki</h3>
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="stroke-muted/30 stroke-[8px] fill-transparent" />
              <circle cx="50" cy="50" r="45" className={`${scoreRingColor} stroke-[8px] fill-transparent`} strokeDasharray={`${overallScore * 2.827} 282.7`} strokeLinecap="round" />
            </svg>
            <div className="text-center">
              <span className={`text-4xl font-bold font-display ${scoreColor}`}>{overallRating}</span>
              <span className="block text-xs text-muted-foreground">{overallScore}/100</span>
            </div>
          </div>
          <div className="flex gap-6 text-center w-full justify-center">
            <div><span className="block text-xl font-bold text-white">{totalGamesAnalyzed}</span><span className="text-xs text-muted-foreground uppercase tracking-wider">Mecze</span></div>
            <div><span className={`block text-xl font-bold ${winRate >= 50 ? 'text-win' : 'text-loss'}`}>{winRate}%</span><span className="text-xs text-muted-foreground uppercase tracking-wider">% Wygranych</span></div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-white">Forma</h3>
            {getTrendIcon(formTrend?.trend)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">{formTrend?.trendDescription}</p>
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div className="bg-background/50 p-3 rounded-xl border border-border/50 text-center">
              <span className="text-xs text-muted-foreground block mb-1">Ostatnie % wygranych</span>
              <div className="flex items-center justify-center gap-1">
                <span className={`text-lg font-bold ${formTrend?.recentWinRate >= formTrend?.overallWinRate ? 'text-green-500' : 'text-red-500'}`}>{formTrend?.recentWinRate}%</span>
                {formTrend?.recentWinRate > formTrend?.overallWinRate ? <ChevronUp className="w-4 h-4 text-green-500" /> : formTrend?.recentWinRate < formTrend?.overallWinRate ? <ChevronDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
            <div className="bg-background/50 p-3 rounded-xl border border-border/50 text-center">
              <span className="text-xs text-muted-foreground block mb-1">Ostatnie KDA</span>
              <div className="flex items-center justify-center gap-1">
                <span className={`text-lg font-bold ${formTrend?.recentKda >= formTrend?.overallKda ? 'text-green-500' : 'text-red-500'}`}>{formTrend?.recentKda?.toFixed(2)}</span>
                {formTrend?.recentKda > formTrend?.overallKda ? <ChevronUp className="w-4 h-4 text-green-500" /> : formTrend?.recentKda < formTrend?.overallKda ? <ChevronDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl flex flex-col overflow-hidden">
          <div className="flex-1 p-4 border-b border-border/50 bg-green-950/10">
            <h4 className="flex items-center text-green-500 font-bold mb-3 text-sm uppercase tracking-wider"><Check className="w-4 h-4 mr-2" /> Mocne strony</h4>
            <ul className="space-y-1.5">
              {strengths?.map((str: string, i: number) => <li key={i} className="text-sm text-foreground/80 flex items-start"><span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">•</span>{str}</li>)}
            </ul>
          </div>
          <div className="flex-1 p-4 bg-red-950/10">
            <h4 className="flex items-center text-red-500 font-bold mb-3 text-sm uppercase tracking-wider"><AlertTriangle className="w-4 h-4 mr-2" /> Słabe strony</h4>
            <ul className="space-y-1.5">
              {weaknesses?.map((wk: string, i: number) => <li key={i} className="text-sm text-foreground/80 flex items-start"><span className="text-red-500 mr-2 mt-0.5 flex-shrink-0">•</span>{wk}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* ROW 2: Playstyle Profile + Critical Mistakes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl">
          <h3 className="font-display text-xl text-white mb-4 flex items-center"><UserRound className="w-5 h-5 mr-2 text-primary" /> Profil gracza</h3>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-1">{playstyleArchetype}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{playstyleDescription}</p>
            </div>
          </div>
          {gameplayPatterns?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <h5 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center"><BookOpen className="w-3.5 h-3.5 mr-1.5" /> Wykryte wzorce gry</h5>
              <ul className="space-y-1.5">
                {gameplayPatterns.map((p: string, i: number) => <li key={i} className="text-sm text-foreground/80 flex items-start"><Zap className="w-3.5 h-3.5 text-primary mr-2 mt-0.5 flex-shrink-0" />{p}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="glass-panel p-6 rounded-2xl bg-red-950/5 border border-red-900/20">
          <h3 className="font-display text-xl text-white mb-4 flex items-center"><XCircle className="w-5 h-5 mr-2 text-red-500" /> Krytyczne błędy</h3>
          {(!criticalMistakes || criticalMistakes.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <Check className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Brak wykrytych krytycznych błędów</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {criticalMistakes.map((m: string, i: number) => (
                <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="text-sm text-foreground/85 flex items-start bg-red-950/20 rounded-lg p-2.5 border border-red-900/20">
                  <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />{m}
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ROW 3: Coaching Tips */}
      {coachingTips?.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl bg-primary/5 border border-primary/20">
          <h3 className="font-display text-xl text-white mb-4 flex items-center"><GraduationCap className="w-5 h-5 mr-2 text-primary" /> Plan poprawy — spersonalizowane wskazówki</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coachingTips.map((tip: string, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 bg-background/40 rounded-xl p-3 border border-border/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <p className="text-sm text-foreground/85 leading-relaxed">{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ROW 4: Champion Recommendations */}
      {championRecommendations?.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-display text-xl text-white mb-4 flex items-center"><Star className="w-5 h-5 mr-2 text-yellow-400" /> Rekomendowane postacie dla Twojego stylu gry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {championRecommendations.map((rec: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 bg-background/40 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${rec.championName}.png`}
                  alt={rec.championName}
                  className="w-14 h-14 rounded-xl border border-border flex-shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <div>
                  <h4 className="font-bold text-white">{rec.championName}</h4>
                  <p className="text-xs text-primary mt-0.5">{rec.playstyleMatch}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ROW 5: Key Metrics */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-display text-xl text-white mb-5 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-primary" /> Kluczowe wskaźniki</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics?.map((metric: any, i: number) => {
            const pct = Math.min(100, (metric.value / metric.maxValue) * 100);
            const barColor = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
            const badgeColor = pct >= 70 ? 'text-green-500 bg-green-500/10 border-green-500/20' : pct >= 40 ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20';
            return (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                className="bg-background/40 border border-border/50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-sm text-white">{metric.name}</h4>
                    <span className="text-xs text-muted-foreground">{metric.description}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border font-bold flex-shrink-0 ${badgeColor}`}>{metric.rating}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm font-mono mb-1">
                    <span>{metric.value}</span><span className="text-muted-foreground">{metric.maxValue}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ROW 6: Performance by Game Length + Damage Type + Best/Worst Game */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Performance by Game Length */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="font-display text-lg text-white mb-4 flex items-center"><Timer className="w-4 h-4 mr-2 text-primary" /> Wyniki wg długości meczu</h3>
          <div className="space-y-3">
            {[performanceByGameLength?.short, performanceByGameLength?.medium, performanceByGameLength?.long].map((gl: any, i: number) => {
              if (!gl) return null;
              const wrColor = gl.winRate >= 55 ? 'text-green-400' : gl.winRate >= 45 ? 'text-yellow-400' : 'text-red-400';
              return (
                <div key={i} className="bg-background/40 rounded-xl p-3 border border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-white">{gl.label}</span>
                    <span className="text-xs text-muted-foreground">{gl.gamesPlayed} meczy</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className={`font-bold ${wrColor}`}>{gl.winRate}% WR</span>
                    <span className="text-muted-foreground">KDA: {gl.avgKda}</span>
                    <span className="text-muted-foreground">{gl.avgCsPerMin} CS/min</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Damage Type Breakdown */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="font-display text-lg text-white mb-4 flex items-center"><Layers className="w-4 h-4 mr-2 text-primary" /> Rodzaj obrażeń</h3>
          {damageTypeBreakdown && (
            <div className="space-y-4">
              {[
                { label: "Fizyczne", pct: damageTypeBreakdown.physicalPct, color: "bg-orange-500", textColor: "text-orange-400" },
                { label: "Magiczne", pct: damageTypeBreakdown.magicPct, color: "bg-blue-500", textColor: "text-blue-400" },
                { label: "Prawdziwe", pct: damageTypeBreakdown.truePct, color: "bg-gray-300", textColor: "text-gray-300" },
              ].map((dt) => (
                <div key={dt.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{dt.label}</span>
                    <span className={`text-sm font-bold ${dt.textColor}`}>{dt.pct}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${dt.color} rounded-full`} style={{ width: `${dt.pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex mt-2 rounded-xl overflow-hidden h-5">
                <div className="bg-orange-500 h-full" style={{ width: `${damageTypeBreakdown.physicalPct}%` }} title={`Fizyczne ${damageTypeBreakdown.physicalPct}%`} />
                <div className="bg-blue-500 h-full" style={{ width: `${damageTypeBreakdown.magicPct}%` }} title={`Magiczne ${damageTypeBreakdown.magicPct}%`} />
                <div className="bg-gray-300 h-full" style={{ width: `${damageTypeBreakdown.truePct}%` }} title={`Prawdziwe ${damageTypeBreakdown.truePct}%`} />
              </div>
            </div>
          )}
        </div>

        {/* Best & Worst Game */}
        <div className="flex flex-col gap-3">
          {bestGame && (
            <div className="glass-panel p-4 rounded-2xl border border-green-900/30 bg-green-950/10 flex-1">
              <h4 className="text-xs uppercase tracking-wider text-green-400 font-bold mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Najlepszy mecz
              </h4>
              <div className="flex items-center gap-3">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${bestGame.championName}.png`}
                  alt={bestGame.championName}
                  className="w-12 h-12 rounded-xl border border-border"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <div>
                  <p className="font-bold text-white">{bestGame.championName}</p>
                  <p className="text-sm font-mono text-green-400">{bestGame.kills}/{bestGame.deaths}/{bestGame.assists}</p>
                  <p className="text-xs text-muted-foreground">{bestGame.kda} KDA · Wynik {bestGame.performanceScore}</p>
                </div>
              </div>
            </div>
          )}
          {worstGame && (
            <div className="glass-panel p-4 rounded-2xl border border-red-900/30 bg-red-950/10 flex-1">
              <h4 className="text-xs uppercase tracking-wider text-red-400 font-bold mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Najgorszy mecz
              </h4>
              <div className="flex items-center gap-3">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${worstGame.championName}.png`}
                  alt={worstGame.championName}
                  className="w-12 h-12 rounded-xl border border-border"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <div>
                  <p className="font-bold text-white">{worstGame.championName}</p>
                  <p className="text-sm font-mono text-red-400">{worstGame.kills}/{worstGame.deaths}/{worstGame.assists}</p>
                  <p className="text-xs text-muted-foreground">{worstGame.kda} KDA · Wynik {worstGame.performanceScore}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ROW 7: Champion Performance Table */}
      <div className="glass-panel p-6 rounded-2xl overflow-hidden">
        <h3 className="font-display text-xl text-white mb-5 flex items-center"><Swords className="w-5 h-5 mr-2 text-primary" /> Wyniki na bohaterach</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-semibold px-2">Bohater</th>
                <th className="pb-3 font-semibold px-2 text-center">Mecze</th>
                <th className="pb-3 font-semibold px-2 text-center">% Wyg.</th>
                <th className="pb-3 font-semibold px-2 text-center">KDA</th>
                <th className="pb-3 font-semibold px-2 text-center">KP%</th>
                <th className="pb-3 font-semibold px-2 text-center">CS/min</th>
                <th className="pb-3 font-semibold px-2 text-center">Udz. obrażeń</th>
                <th className="pb-3 font-semibold px-2 text-center">Wynik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {championBreakdown?.map((champ: any, i: number) => {
                const perfColor = champ.performanceScore >= 70 ? 'bg-green-500' : champ.performanceScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champ.championName}.png`}
                          alt={champ.championName}
                          className="w-8 h-8 rounded-full border border-border"
                          onError={(e) => { e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png' }}
                        />
                        <span className="font-bold text-sm text-white">{champ.championName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-sm">{champ.gamesPlayed}</td>
                    <td className={`py-3 px-2 text-center font-mono text-sm font-semibold ${champ.winRate >= 50 ? 'text-win' : 'text-loss'}`}>{champ.winRate}%</td>
                    <td className="py-3 px-2 text-center font-mono text-sm">{champ.kda.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center font-mono text-sm"><span className={`${(champ.killParticipation ?? 0) >= 60 ? 'text-green-400' : (champ.killParticipation ?? 0) >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{(champ.killParticipation ?? 0).toFixed(0)}%</span></td>
                    <td className="py-3 px-2 text-center font-mono text-sm">{champ.avgCsPerMin.toFixed(1)}</td>
                    <td className="py-3 px-2 text-center font-mono text-sm"><span className={`${(champ.damageShare ?? 0) >= 25 ? 'text-orange-400' : (champ.damageShare ?? 0) >= 15 ? 'text-foreground' : 'text-muted-foreground'}`}>{(champ.damageShare ?? 0).toFixed(0)}%</span></td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 justify-center">
                        <span className="font-mono text-xs text-muted-foreground w-6 text-right">{champ.performanceScore}</span>
                        <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${perfColor}`} style={{ width: `${champ.performanceScore}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!championBreakdown || championBreakdown.length === 0) && (
                <tr><td colSpan={8} className="text-center py-4 text-muted-foreground">Brak danych o bohaterach</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Profile Page ───
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

  if (profileError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="font-display text-3xl mb-2">Nie znaleziono gracza</h2>
        <p className="text-muted-foreground mb-8">Nie znaleźliśmy {gameName}#{tagLine} w regionie {region}.</p>
        <Link href="/"><a className="px-6 py-3 rounded-lg bg-card border border-border hover:bg-muted transition flex items-center"><ChevronLeft className="w-4 h-4 mr-2" /> Wróć do wyszukiwania</a></Link>
      </div>
    );
  }

  if (isLoadingProfile) return <LoadingSpinner text="Wyszukiwanie gracza..." />;

  const soloQ = rankedStats?.find((r: any) => r.queueType === 'RANKED_SOLO_5x5');
  const flexQ = rankedStats?.find((r: any) => r.queueType === 'RANKED_FLEX_SR');

  return (
    <div className="min-h-screen pb-20">
      <header className="relative pt-24 pb-12 overflow-hidden border-b border-border/50 bg-card/30">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/40 via-background to-background" />
        <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <Link href="/"><a className="absolute top-0 left-4 text-muted-foreground hover:text-primary transition flex items-center text-sm uppercase tracking-wider font-semibold py-4"><ChevronLeft className="w-4 h-4 mr-1" /> Szukaj</a></Link>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl hextech-glow animate-pulse" />
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${profile?.profileIconId}.png`}
              alt="Profile Icon"
              className="relative w-32 h-32 rounded-full border-4 border-primary/50 shadow-2xl object-cover"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card border border-primary/50 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {profile?.summonerLevel}
            </div>
          </div>
          <div className="text-center md:text-left mb-2">
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-white flex items-baseline gap-2 justify-center md:justify-start">
              {profile?.gameName}<span className="text-xl text-muted-foreground font-sans font-medium">#{profile?.tagLine}</span>
            </h1>
            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
              <div className="inline-flex items-center px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-bold tracking-widest uppercase">{region}</div>
              {liveGame && <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-bold animate-pulse"><Wifi className="w-3 h-3" /> LIVE</div>}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {liveGame && <LiveGameBanner data={liveGame} />}
        <PlayerAnalysisSection data={analysis} isLoading={isLoadingAnalysis} recentMatches={matches} />
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <section>
            <h2 className="text-xl font-display text-white mb-4 flex items-center border-b border-border pb-2"><Trophy className="w-5 h-5 mr-2 text-primary" /> Rankingowe</h2>
            <div className="space-y-4">
              {isLoadingRanked ? <div className="h-32 glass-panel rounded-2xl animate-pulse" /> : (<><RankedBadge entry={soloQ} />{flexQ && <RankedBadge entry={flexQ} />}</>)}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-display text-white mb-4 flex items-center border-b border-border pb-2"><Target className="w-5 h-5 mr-2 text-primary" /> Najlepsi bohaterowie</h2>
            <div className="glass-panel rounded-2xl p-4 space-y-3">
              {isLoadingMastery ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />)
              ) : mastery?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Brak danych o mistrzostwie</p>
              ) : (
                mastery?.map((champ: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground font-bold w-4 text-center text-sm">{i + 1}</span>
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champ.championName}.png`}
                      alt={champ.championName}
                      className="w-12 h-12 rounded-full border-2 border-border"
                      onError={(e) => { e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{champ.championName}</p>
                      <p className="text-xs text-muted-foreground">Poziom {champ.championLevel}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono text-primary">{(champ.championPoints / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-xl font-display text-white flex items-center border-b border-border pb-2"><Shield className="w-5 h-5 mr-2 text-primary" /> Ostatnie mecze</h2>
          {isLoadingMatches ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-24 glass-panel rounded-xl animate-pulse" />)
          ) : matches?.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center"><p className="text-muted-foreground">Brak historii meczy</p></div>
          ) : (
            matches?.map((match: any, i: number) => <MatchRow key={match.matchId} match={match} index={i} />)
          )}
        </div>
      </main>
    </div>
  );
}
