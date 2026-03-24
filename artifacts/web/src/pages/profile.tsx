import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { 
  ChevronLeft, Trophy, Target, Shield, AlertCircle, 
  TrendingUp, TrendingDown, Minus, Flame, Snowflake, 
  BarChart3, Swords, Eye, Coins, Activity, Award, 
  ChevronUp, ChevronDown, Check, AlertTriangle 
} from "lucide-react";
import { 
  useSearchSummoner, 
  useGetSummonerRanked, 
  useGetSummonerMatches, 
  useGetSummonerMastery,
  useGetSummonerAnalysis 
} from "@workspace/api-client-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Component to render individual matches
function MatchRow({ match, index }: { match: any, index: number }) {
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
        <div className="absolute -bottom-2 -right-2 bg-background border border-border text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">
          {match.championLevel || '?'}
        </div>
      </div>

      <div className="flex flex-col items-center px-4 w-32">
        <div className="font-mono text-lg font-bold tracking-tight">
          <span>{match.kills}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-destructive">{match.deaths}</span>
          <span className="text-muted-foreground mx-1">/</span>
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
            {item !== 0 && (
              <img src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/${item}.png`} alt="item" className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>
      
      <div className="absolute top-2 right-4 text-[10px] text-muted-foreground/60 uppercase">
        {timeAgo}
      </div>
    </motion.div>
  );
}

// Component to render Ranked Stats
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
        <h3 className="font-display text-2xl text-gradient-gold">
          {tier} {entry?.rank}
        </h3>
        {!isUnranked ? (
          <>
            <span className="text-lg font-bold text-foreground mt-1">{entry.leaguePoints} LP</span>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-muted-foreground">{entry.wins}W {entry.losses}L</span>
              <span className={`font-semibold ${winrate >= 50 ? 'text-win' : 'text-loss'}`}>
                {winrate}% WR
              </span>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground mt-2">Brak rozegranych meczy</span>
        )}
      </div>
    </div>
  );
}

function PlayerAnalysisSection({ data, isLoading }: { data: any, isLoading: boolean }) {
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

  const { overallScore, overallRating, totalGamesAnalyzed, winRate, metrics, championBreakdown, formTrend, strengths, weaknesses } = data;

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 mb-8 w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="font-display text-xl text-white mb-6">Ogólne wyniki</h3>
          
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="stroke-muted/30 stroke-[8px] fill-transparent" />
              <circle 
                cx="50" cy="50" r="45" 
                className={`${scoreRingColor} stroke-[8px] fill-transparent`} 
                strokeDasharray={`${overallScore * 2.827} 282.7`}
                strokeLinecap="round" 
              />
            </svg>
            <div className="text-center">
              <span className={`text-4xl font-bold font-display ${scoreColor}`}>{overallRating}</span>
              <span className="block text-xs text-muted-foreground">{overallScore}/100</span>
            </div>
          </div>
          
          <div className="flex gap-6 mt-2 text-center w-full justify-center">
            <div>
              <span className="block text-xl font-bold text-white">{totalGamesAnalyzed}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Mecze</span>
            </div>
            <div>
              <span className={`block text-xl font-bold ${winRate >= 50 ? 'text-win' : 'text-loss'}`}>{winRate}%</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">% Wygranych</span>
            </div>
          </div>
        </div>

        {/* Form Trend */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl text-white">Forma</h3>
            {getTrendIcon(formTrend?.trend)}
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <p className="text-sm text-muted-foreground mb-2">{formTrend?.trendDescription}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 p-4 rounded-xl border border-border/50 text-center">
                <span className="text-xs text-muted-foreground block mb-1">Ostatnie % wygranych</span>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-lg font-bold ${formTrend?.recentWinRate >= formTrend?.overallWinRate ? 'text-green-500' : 'text-red-500'}`}>
                    {formTrend?.recentWinRate}%
                  </span>
                  {formTrend?.recentWinRate > formTrend?.overallWinRate ? <ChevronUp className="w-4 h-4 text-green-500" /> : formTrend?.recentWinRate < formTrend?.overallWinRate ? <ChevronDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              
              <div className="bg-background/50 p-4 rounded-xl border border-border/50 text-center">
                <span className="text-xs text-muted-foreground block mb-1">Ostatnie KDA</span>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-lg font-bold ${formTrend?.recentKda >= formTrend?.overallKda ? 'text-green-500' : 'text-red-500'}`}>
                    {formTrend?.recentKda?.toFixed(2)}
                  </span>
                  {formTrend?.recentKda > formTrend?.overallKda ? <ChevronUp className="w-4 h-4 text-green-500" /> : formTrend?.recentKda < formTrend?.overallKda ? <ChevronDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="glass-panel rounded-2xl flex flex-col overflow-hidden">
          <div className="flex-1 p-4 border-b border-border/50 bg-green-950/10">
            <h4 className="flex items-center text-green-500 font-bold mb-3 text-sm uppercase tracking-wider">
              <Check className="w-4 h-4 mr-2" /> Mocne strony
            </h4>
            <ul className="space-y-2">
              {strengths?.map((str: string, i: number) => (
                <li key={i} className="text-sm text-foreground/80 flex items-start">
                  <span className="text-green-500 mr-2">•</span> {str}
                </li>
              ))}
              {(!strengths || strengths.length === 0) && (
                <li className="text-sm text-muted-foreground italic">Brak wyraźnych mocnych stron.</li>
              )}
            </ul>
          </div>
          <div className="flex-1 p-4 bg-red-950/10">
            <h4 className="flex items-center text-red-500 font-bold mb-3 text-sm uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 mr-2" /> Słabe strony
            </h4>
            <ul className="space-y-2">
              {weaknesses?.map((wk: string, i: number) => (
                <li key={i} className="text-sm text-foreground/80 flex items-start">
                  <span className="text-red-500 mr-2">•</span> {wk}
                </li>
              ))}
              {(!weaknesses || weaknesses.length === 0) && (
                <li className="text-sm text-muted-foreground italic">Brak wyraźnych słabych stron.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-display text-xl text-white mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary" /> Kluczowe wskaźniki
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics?.map((metric: any, i: number) => {
            const pct = Math.min(100, (metric.value / metric.maxValue) * 100);
            const barColor = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
            const badgeColor = pct >= 70 ? 'text-green-500 bg-green-500/10 border-green-500/20' : pct >= 40 ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20';
            
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={i} 
                className="bg-background/40 border border-border/50 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{metric.name}</h4>
                    <span className="text-xs text-muted-foreground">{metric.description}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border font-bold ${badgeColor}`}>{metric.rating}</span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-mono mb-1">
                    <span>{metric.value.toFixed(1)}</span>
                    <span className="text-muted-foreground">{metric.maxValue.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl overflow-hidden">
        <h3 className="font-display text-xl text-white mb-6 flex items-center">
          <Swords className="w-5 h-5 mr-2 text-primary" /> Wyniki na bohaterach
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-semibold px-2">Bohater</th>
                <th className="pb-3 font-semibold px-2 text-center">Mecze</th>
                <th className="pb-3 font-semibold px-2 text-center">% Wygranych</th>
                <th className="pb-3 font-semibold px-2 text-center">KDA</th>
                <th className="pb-3 font-semibold px-2 text-center">CS/min</th>
                <th className="pb-3 font-semibold px-2 text-center">Wynik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {championBreakdown?.sort((a: any, b: any) => b.gamesPlayed - a.gamesPlayed).map((champ: any, i: number) => {
                 const perfColor = champ.performanceScore >= 70 ? 'bg-green-500' : champ.performanceScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                 return (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 flex items-center gap-3">
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champ.championName}.png`}
                        alt={champ.championName}
                        className="w-8 h-8 rounded-full border border-border"
                        onError={(e) => { e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png' }}
                      />
                      <span className="font-bold text-sm text-white">{champ.championName}</span>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-sm">{champ.gamesPlayed}</td>
                    <td className={`py-3 px-2 text-center font-mono text-sm font-semibold ${champ.winRate >= 50 ? 'text-win' : 'text-loss'}`}>{champ.winRate}%</td>
                    <td className="py-3 px-2 text-center font-mono text-sm">{champ.kda.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center font-mono text-sm">{champ.avgCsPerMin.toFixed(1)}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 justify-center">
                        <span className="font-mono text-xs text-muted-foreground w-6 text-right">{champ.performanceScore}</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${perfColor}`} style={{ width: `${champ.performanceScore}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!championBreakdown || championBreakdown.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted-foreground">Brak danych o bohaterach</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const params = useParams();
  const region = params.region as string;
  const gameName = decodeURIComponent(params.gameName || "");
  const tagLine = decodeURIComponent(params.tagLine || "");

  // 1. Fetch Summoner Profile to get PUUID
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useSearchSummoner({
    region,
    gameName,
    tagLine
  });

  const puuid = profile?.puuid || "";

  // 2. Fetch related data (enabled only if puuid exists)
  const { data: rankedStats, isLoading: isLoadingRanked } = useGetSummonerRanked(
    puuid, 
    { region }, 
    { query: { enabled: !!puuid } }
  );

  const { data: matches, isLoading: isLoadingMatches } = useGetSummonerMatches(
    puuid, 
    { region, count: 10 }, 
    { query: { enabled: !!puuid } }
  );

  const { data: mastery, isLoading: isLoadingMastery } = useGetSummonerMastery(
    puuid, 
    { region, count: 5 }, 
    { query: { enabled: !!puuid } }
  );

  const { data: analysis, isLoading: isLoadingAnalysis } = useGetSummonerAnalysis(
    puuid,
    { region, count: 20 },
    { query: { enabled: !!puuid } }
  );

  if (profileError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="font-display text-3xl mb-2">Nie znaleziono gracza</h2>
        <p className="text-muted-foreground mb-8">Nie znaleźliśmy {gameName}#{tagLine} w regionie {region}.</p>
        <Link href="/">
          <a className="px-6 py-3 rounded-lg bg-card border border-border hover:bg-muted transition flex items-center">
            <ChevronLeft className="w-4 h-4 mr-2" /> Wróć do wyszukiwania
          </a>
        </Link>
      </div>
    );
  }

  if (isLoadingProfile) return <LoadingSpinner text="Wyszukiwanie gracza..." />;

  const soloQ = rankedStats?.find((r: any) => r.queueType === 'RANKED_SOLO_5x5');
  const flexQ = rankedStats?.find((r: any) => r.queueType === 'RANKED_FLEX_SR');

  return (
    <div className="min-h-screen pb-20">
      {/* Header Profile Section */}
      <header className="relative pt-24 pb-12 overflow-hidden border-b border-border/50 bg-card/30">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/40 via-background to-background"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <Link href="/">
            <a className="absolute top-0 left-4 text-muted-foreground hover:text-primary transition flex items-center text-sm uppercase tracking-wider font-semibold py-4">
              <ChevronLeft className="w-4 h-4 mr-1" /> Szukaj
            </a>
          </Link>
          
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl hextech-glow animate-pulse"></div>
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
              {profile?.gameName}
              <span className="text-xl text-muted-foreground font-sans font-medium">#{profile?.tagLine}</span>
            </h1>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-bold tracking-widest uppercase">
              {region}
            </div>
          </div>
        </div>
      </header>

      {/* Performance Analysis Section (Full Width) */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <PlayerAnalysisSection data={analysis} isLoading={isLoadingAnalysis} />
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & Mastery */}
        <div className="lg:col-span-4 space-y-8">
          <section>
            <h2 className="text-xl font-display text-white mb-4 flex items-center border-b border-border pb-2">
              <Trophy className="w-5 h-5 mr-2 text-primary" /> Rankingowe
            </h2>
            <div className="space-y-4">
              {isLoadingRanked ? (
                <div className="h-32 glass-panel rounded-2xl animate-pulse"></div>
              ) : (
                <>
                  <RankedBadge entry={soloQ} />
                  {flexQ && <RankedBadge entry={flexQ} />}
                </>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-display text-white mb-4 flex items-center border-b border-border pb-2">
              <Target className="w-5 h-5 mr-2 text-primary" /> Najlepsi bohaterowie
            </h2>
            <div className="glass-panel rounded-2xl p-4 space-y-3">
              {isLoadingMastery ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />)
              ) : mastery?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Brak danych o mistrzostwie</p>
              ) : (
                mastery?.map((champ: any, i: number) => (
                  <div key={champ.championId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition">
                    <span className="text-muted-foreground/50 font-display w-4">{i + 1}</span>
                    <img 
                      src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champ.championName}.png`}
                      className="w-10 h-10 rounded-full border border-card-border"
                      onError={(e) => { e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png' }}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white">{champ.championName}</h4>
                      <p className="text-xs text-muted-foreground">{(champ.championPoints).toLocaleString()} pts</p>
                    </div>
                    <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                      {champ.championLevel}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Match History */}
        <div className="lg:col-span-8">
          <h2 className="text-xl font-display text-white mb-4 flex items-center border-b border-border pb-2">
            <Shield className="w-5 h-5 mr-2 text-primary" /> Ostatnie mecze
          </h2>
          
          <div className="space-y-3">
            {isLoadingMatches ? (
               Array(5).fill(0).map((_, i) => <div key={i} className="h-28 glass-panel rounded-xl animate-pulse" />)
            ) : matches?.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl">
                <p className="text-muted-foreground text-lg">Brak ostatnich meczy.</p>
              </div>
            ) : (
              matches?.map((match: any, i: number) => (
                <MatchRow key={match.matchId} match={match} index={i} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
