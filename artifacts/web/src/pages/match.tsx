import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Clock, Sword, Shield, Eye, Coins } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { getDDBase } from "@/lib/constants";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const FALLBACK_ICON = `${BASE_URL}/images/fallback-champion.png`;

const PERK_ICONS: Record<number, string> = {
  8000: "Precision", 8100: "Domination", 8200: "Sorcery",
  8300: "Inspiration", 8400: "Resolve",
};

function ItemSlot({ id }: { id: number }) {
  const dd = getDDBase();
  if (!id) return <div className="w-7 h-7 rounded bg-muted/50 border border-border/40 flex-shrink-0" />;
  return (
    <img
      src={`${dd}/item/${id}.png`}
      alt=""
      className="w-7 h-7 rounded border border-border/60 flex-shrink-0"
      onError={(e) => { e.currentTarget.style.opacity = "0"; }}
    />
  );
}

function DamageBar({ value, max, win }: { value: number; max: number; win: boolean }) {
  const pct = Math.round((value / Math.max(max, 1)) * 100);
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-muted/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: win ? "hsl(200,90%,45%)" : "hsl(0,80%,55%)" }}
        />
      </div>
      <span className="text-[9px] font-mono text-muted-foreground w-8 text-right flex-shrink-0">
        {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
      </span>
    </div>
  );
}

function ParticipantRow({ p, selfPuuid, maxDmg }: { p: any; selfPuuid?: string; maxDmg: number }) {
  const dd = getDDBase();
  const isSelf = p.puuid === selfPuuid;
  const kda = p.deaths === 0 ? "Perf" : ((p.kills + p.assists) / p.deaths).toFixed(1);

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isSelf ? (p.win ? "bg-win/10 border border-win/20" : "bg-loss/10 border border-loss/20") : "hover:bg-muted/30"}`}>
      <div className="relative flex-shrink-0">
        <img
          src={`${dd}/champion/${p.championName}.png`}
          alt={p.championName}
          className="w-8 h-8 rounded-lg border border-border"
          onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }}
        />
      </div>
      <div className="w-28 min-w-0 flex-shrink-0">
        <p className={`text-xs font-semibold truncate ${isSelf ? "text-primary" : "text-foreground/90"}`}>
          {p.summonerName}
        </p>
        <p className="text-[9px] text-muted-foreground truncate">{p.championName}</p>
      </div>
      <div className="flex-shrink-0 w-20 text-center">
        <span className="text-xs font-mono font-semibold">
          {p.kills}<span className="text-muted-foreground/40">/</span>
          <span className="text-loss">{p.deaths}</span>
          <span className="text-muted-foreground/40">/</span>{p.assists}
        </span>
        <p className="text-[9px] text-muted-foreground">{kda} KDA</p>
      </div>
      <div className="hidden sm:flex flex-shrink-0 w-14 text-right flex-col">
        <span className="text-xs font-mono">{p.cs}</span>
        <span className="text-[9px] text-muted-foreground">{p.csPerMin}/min</span>
      </div>
      <div className="hidden md:block flex-1 min-w-[80px]">
        <DamageBar value={p.totalDamageDealt} max={maxDmg} win={p.win} />
      </div>
      <div className="hidden sm:flex flex-shrink-0 w-14 text-right flex-col">
        <span className="text-xs font-mono">{(p.goldEarned / 1000).toFixed(1)}k</span>
        <span className="text-[9px] text-muted-foreground">złoto</span>
      </div>
      <div className="hidden lg:flex flex-shrink-0 w-10 text-right flex-col">
        <span className="text-xs font-mono">{p.visionScore}</span>
        <span className="text-[9px] text-muted-foreground">wzrok</span>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {p.items.map((id: number, i: number) => <ItemSlot key={i} id={id} />)}
      </div>
      {(p.pentaKills > 0 || p.quadraKills > 0 || p.tripleKills > 0) && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0"
          style={{ background: p.pentaKills > 0 ? "hsl(42,90%,45%)" : p.quadraKills > 0 ? "hsl(30,90%,45%)" : "hsl(200,90%,40%)" }}>
          {p.pentaKills > 0 ? "PENTA" : p.quadraKills > 0 ? "QUADRA" : "TRIPLE"}
        </span>
      )}
    </div>
  );
}

function TeamSection({ participants, team, maxDmg, selfPuuid, label, color }: { participants: any[]; team: any; maxDmg: number; selfPuuid?: string; label: string; color: string }) {
  const kills = participants.reduce((s: number, p: any) => s + p.kills, 0);
  const deaths = participants.reduce((s: number, p: any) => s + p.deaths, 0);
  const assists = participants.reduce((s: number, p: any) => s + p.assists, 0);

  return (
    <div className="glass-panel p-3">
      <div className="flex items-center gap-3 mb-2 pb-2 border-b border-border/30">
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{label}</span>
        <span className={`text-xs font-bold ${team?.win ? "text-win" : "text-loss"}`}>{team?.win ? "WYGRANA" : "PRZEGRANA"}</span>
        <span className="text-xs font-mono text-muted-foreground ml-auto">{kills}/{deaths}/{assists}</span>
        {team?.objectives && (
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>🐉 {team.objectives.dragon}</span>
            <span>🔴 {team.objectives.baron}</span>
            <span>🗼 {team.objectives.tower}</span>
          </div>
        )}
      </div>
      <div className="hidden md:flex items-center gap-2 px-2 pb-1.5 mb-1 text-[9px] uppercase tracking-wider text-muted-foreground/50">
        <div className="w-8 flex-shrink-0" />
        <div className="w-28 flex-shrink-0">Gracz</div>
        <div className="w-20 text-center flex-shrink-0">KDA</div>
        <div className="w-14 text-right flex-shrink-0">CS</div>
        <div className="flex-1 min-w-[80px]">Obrażenia</div>
        <div className="w-14 text-right flex-shrink-0">Złoto</div>
        <div className="w-10 text-right flex-shrink-0">Wzrok</div>
        <div className="flex-shrink-0">Przedmioty</div>
      </div>
      <div className="space-y-0.5">
        {participants.map((p: any, i: number) => (
          <ParticipantRow key={i} p={p} selfPuuid={selfPuuid} maxDmg={maxDmg} />
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export default function MatchPage() {
  const params = useParams();
  const region = params.region as string;
  const gameName = decodeURIComponent(params.gameName || "");
  const tagLine = decodeURIComponent(params.tagLine || "");
  const matchId = params.matchId as string;
  const selfPuuid = params.selfPuuid as string | undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["match", matchId, region],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/match/${matchId}?region=${region}`);
      if (!r.ok) throw new Error("Błąd pobierania danych meczu");
      return r.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const backUrl = `/profile/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href={backUrl} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Powrót do profilu
      </Link>
      <LoadingSpinner text="Wczytywanie szczegółów meczu..." />
    </div>
  );

  if (error || !data) return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-center">
      <Link href={backUrl} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Powrót
      </Link>
      <p className="text-muted-foreground">Nie można załadować danych meczu.</p>
    </div>
  );

  const participants: any[] = data.participants ?? [];
  const team1 = participants.filter((p: any) => p.teamId === 100);
  const team2 = participants.filter((p: any) => p.teamId === 200);
  const team1Data = data.teams?.find((t: any) => t.teamId === 100);
  const team2Data = data.teams?.find((t: any) => t.teamId === 200);
  const maxDmg = Math.max(...participants.map((p: any) => p.totalDamageDealt ?? 0), 1);

  const dur = `${Math.floor(data.gameDuration / 60)}m ${data.gameDuration % 60}s`;
  const timeAgo = data.gameEndTimestamp
    ? formatDistanceToNow(new Date(data.gameEndTimestamp), { addSuffix: true, locale: pl })
    : "";

  const modeLabel: Record<string, string> = {
    CLASSIC: "Summoner's Rift", ARAM: "ARAM", URF: "URF", CHERRY: "Arena",
  };

  const winTeamId = participants.find((p: any) => p.win)?.teamId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href={backUrl} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {gameName}#{tagLine}
        </Link>

        {/* Match header */}
        <div className="glass-panel p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                {modeLabel[data.gameMode] ?? data.gameMode}
              </p>
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
                Szczegóły meczu
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {dur}</span>
              <span className="text-[11px]">{timeAgo}</span>
            </div>
          </div>

          {/* Bans */}
          {(team1Data?.bans?.length > 0 || team2Data?.bans?.length > 0) && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Bany</p>
              <div className="flex flex-wrap gap-1">
                {[...(team1Data?.bans ?? []), ...(team2Data?.bans ?? [])].map((b: any, i: number) => {
                  if (!b.championId || b.championId === -1) return null;
                  return (
                    <div key={i} className="relative">
                      <img
                        src={`${getDDBase()}/champion/${b.championName}.png`}
                        alt={b.championName}
                        className="w-6 h-6 rounded border border-border opacity-50 grayscale"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45 rounded" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-4">
          <TeamSection
            participants={team1}
            team={team1Data}
            maxDmg={maxDmg}
            selfPuuid={selfPuuid}
            label="Drużyna Niebieska"
            color="hsl(220,90%,55%)"
          />
          <TeamSection
            participants={team2}
            team={team2Data}
            maxDmg={maxDmg}
            selfPuuid={selfPuuid}
            label="Drużyna Czerwona"
            color="hsl(0,80%,55%)"
          />
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { icon: Sword, label: "Zabójstwa", v1: team1.reduce((s: number, p: any) => s + p.kills, 0), v2: team2.reduce((s: number, p: any) => s + p.kills, 0) },
            { icon: Shield, label: "Złoto", v1: Math.round(team1.reduce((s: number, p: any) => s + p.goldEarned, 0) / 1000) + "k", v2: Math.round(team2.reduce((s: number, p: any) => s + p.goldEarned, 0) / 1000) + "k" },
            { icon: Eye, label: "Wzrok", v1: team1.reduce((s: number, p: any) => s + p.visionScore, 0), v2: team2.reduce((s: number, p: any) => s + p.visionScore, 0) },
            { icon: Coins, label: "CS", v1: team1.reduce((s: number, p: any) => s + p.cs, 0), v2: team2.reduce((s: number, p: any) => s + p.cs, 0) },
          ].map(({ icon: Icon, label, v1, v2 }) => (
            <div key={label} className="glass-panel p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-bold ${winTeamId === 100 ? "text-primary" : "text-foreground"}`}>{v1}</span>
                <span className="text-muted-foreground/30 text-xs">–</span>
                <span className={`text-sm font-bold ${winTeamId === 200 ? "text-primary" : "text-foreground"}`}>{v2}</span>
              </div>
              <div className="flex gap-0.5 mt-1.5 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-400/60 rounded-full" style={{ width: `${typeof v1 === "number" && typeof v2 === "number" ? Math.round(v1 / Math.max(v1 + v2, 1) * 100) : 50}%` }} />
                <div className="bg-red-400/60 flex-1 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
