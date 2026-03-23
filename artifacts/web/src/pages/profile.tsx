import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, Trophy, Target, Shield, AlertCircle } from "lucide-react";
import { 
  useSearchSummoner, 
  useGetSummonerRanked, 
  useGetSummonerMatches, 
  useGetSummonerMastery 
} from "@workspace/api-client-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Component to render individual matches
function MatchRow({ match, index }: { match: any, index: number }) {
  const isWin = match.win;
  const kda = match.deaths === 0 ? "Perfect" : ((match.kills + match.assists) / match.deaths).toFixed(2);
  const timeAgo = formatDistanceToNow(new Date(match.gameEndTimestamp), { addSuffix: true });
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
        <span className={`font-bold ${isWin ? 'text-win' : 'text-loss'}`}>{isWin ? 'VICTORY' : 'DEFEAT'}</span>
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
        <span className="text-xs text-muted-foreground">Vision: {match.visionScore}</span>
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
          {entry ? entry.queueType.replace('_', ' ') : 'RANKED'}
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
          <span className="text-muted-foreground mt-2">No matches played</span>
        )}
      </div>
    </div>
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

  if (profileError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="font-display text-3xl mb-2">Summoner Not Found</h2>
        <p className="text-muted-foreground mb-8">We couldn't find {gameName}#{tagLine} in {region}.</p>
        <Link href="/">
          <a className="px-6 py-3 rounded-lg bg-card border border-border hover:bg-muted transition flex items-center">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Search
          </a>
        </Link>
      </div>
    );
  }

  if (isLoadingProfile) return <LoadingSpinner text="Locating Summoner..." />;

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
              <ChevronLeft className="w-4 h-4 mr-1" /> Search
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

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & Mastery */}
        <div className="lg:col-span-4 space-y-8">
          <section>
            <h2 className="text-xl font-display text-white mb-4 flex items-center border-b border-border pb-2">
              <Trophy className="w-5 h-5 mr-2 text-primary" /> Ranked
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
              <Target className="w-5 h-5 mr-2 text-primary" /> Top Champions
            </h2>
            <div className="glass-panel rounded-2xl p-4 space-y-3">
              {isLoadingMastery ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />)
              ) : mastery?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No mastery data</p>
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
            <Shield className="w-5 h-5 mr-2 text-primary" /> Recent Matches
          </h2>
          
          <div className="space-y-3">
            {isLoadingMatches ? (
               Array(5).fill(0).map((_, i) => <div key={i} className="h-28 glass-panel rounded-xl animate-pulse" />)
            ) : matches?.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl">
                <p className="text-muted-foreground text-lg">No recent matches found.</p>
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
