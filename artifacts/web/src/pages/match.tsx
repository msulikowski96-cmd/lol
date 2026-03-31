import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, Clock, Sword, Shield, Eye, Coins, Brain, TrendingUp, TrendingDown, AlertTriangle, Check, Star, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { getDDBase } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

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

// ─── Match Analysis Algorithm ────────────────────────────────────────────────

type Insight = { text: string; type: "positive" | "negative" | "neutral" };

function isSupport(p: any) { return p.teamPosition === "UTILITY"; }
function isJungle(p: any) { return p.teamPosition === "JUNGLE"; }

function analyzePlayer(p: any, teamParticipants: any[], allParticipants: any[]): Insight[] {
  const insights: Insight[] = [];
  const { kills, deaths, assists, cs, csPerMin, killParticipation, totalDamageDealt,
    visionScore, wardsPlaced, firstBloodKill, pentaKills, quadraKills, tripleKills,
    win, kda, goldEarned } = p;

  const sup = isSupport(p);
  const jung = isJungle(p);

  const teamGold = teamParticipants.reduce((s: number, x: any) => s + x.goldEarned, 0);
  const avgTeamDmg = teamParticipants.reduce((s: number, x: any) => s + x.totalDamageDealt, 0) / teamParticipants.length;

  // ── Multikills & highlights ──
  if (pentaKills > 0) insights.push({ type: "positive", text: `Penta Kill! Absolutne zdominowanie meczu — ${pentaKills === 1 ? "jeden" : pentaKills} Penta Kill${pentaKills > 1 ? "s" : ""}.` });
  else if (quadraKills > 0) insights.push({ type: "positive", text: `Quadra Kill — wyjątkowy play teamfightowy.` });
  else if (tripleKills > 0) insights.push({ type: "positive", text: `Triple Kill — skuteczna walka 1v3 lub domination w teamfighcie.` });

  if (firstBloodKill) insights.push({ type: "positive", text: "First Blood — agresywny start gry, zdobycie psychologicznej przewagi nad lanem." });

  // ── Deaths ──
  if (deaths >= 10) insights.push({ type: "negative", text: `Krytyczna liczba śmierci (${deaths}) — gracz spędził znaczną część gry poza mapą. Priorytet: bezpieczniejsze pozycjonowanie.` });
  else if (deaths >= 7) insights.push({ type: "negative", text: `Bardzo wysoka liczba śmierci (${deaths}) — każda śmierć to utracone złoto dla przeciwnika i czas bez wpływu na grę.` });
  else if (deaths >= 5) insights.push({ type: "negative", text: `Podwyższona liczba śmierci (${deaths}) — warto przeanalizować momenty, w których gracz brał nadmiernie ryzykowne walki.` });
  else if (deaths === 0) insights.push({ type: "positive", text: "Bezbłędna gra — zero śmierci. Doskonała ocena ryzyka i pozycjonowanie przez cały mecz." });
  else if (deaths === 1) insights.push({ type: "positive", text: `Tylko ${deaths} śmierć — wyjątkowa przeżywalność.` });

  // ── CS (skip supports) ──
  if (!sup) {
    const csThresholdLow = jung ? 3.5 : 5.0;
    const csThresholdVeryLow = jung ? 2.5 : 3.5;
    const csThresholdGood = jung ? 5.5 : 7.0;
    const csThresholdElite = jung ? 7.0 : 8.5;
    if (csPerMin >= csThresholdElite) insights.push({ type: "positive", text: `Elitarne farmienie (${csPerMin} CS/min) — gracz skutecznie konwertował czas na przewagę złota.` });
    else if (csPerMin >= csThresholdGood) insights.push({ type: "positive", text: `Dobre farmienie powyżej normy (${csPerMin} CS/min).` });
    else if (csPerMin < csThresholdVeryLow) insights.push({ type: "negative", text: `Bardzo słabe farmienie (${csPerMin} CS/min). Norma dla tej roli to ${jung ? "5–7" : "6–9"} CS/min — stracono znaczną ilość złota.` });
    else if (csPerMin < csThresholdLow) insights.push({ type: "negative", text: `Farmienie poniżej normy (${csPerMin} CS/min). Poprawa regularności ostatnich hitów to najszybszy sposób na wzrost złota.` });
  }

  // ── Vision score ──
  if (sup) {
    if (visionScore >= 60) insights.push({ type: "positive", text: `Doskonała kontrola wzroku (${visionScore}) — support aktywnie zarządzał wizją całej mapy.` });
    else if (visionScore < 20) insights.push({ type: "negative", text: `Niski wynik wizji dla supporta (${visionScore}) — ta rola powinna dominować w wardowaniu i sweepowaniu.` });
    else if (visionScore < 35) insights.push({ type: "negative", text: `Wynik wizji poniżej oczekiwań dla supporta (${visionScore}) — warto wardować kluczowe miejsca po każdej walce.` });
  } else {
    if (visionScore >= 30) insights.push({ type: "positive", text: `Wyróżniający wynik wizji (${visionScore}) — gracz rozumiał jak ważna jest kontrola mapy.` });
    else if (visionScore < 5) insights.push({ type: "negative", text: `Prawie całkowity brak wardów (wynik wzroku: ${visionScore}) — brak informacji o mapie to prosta droga do śmierci z niewidocznych kątów.` });
    else if (visionScore < 12) insights.push({ type: "negative", text: `Niski wynik wizji (${visionScore}) — regularne wardowanie kluczowych obszarów pozwala unikać zasadzek i kontrolować obiektywy.` });
  }

  // ── Kill participation ──
  const kpNum = typeof killParticipation === "number" ? killParticipation : 0;
  if (kpNum >= 80) insights.push({ type: "positive", text: `Wyjątkowy udział w walkach drużyny (${kpNum.toFixed(0)}%) — gracz był obecny niemal przy każdym zabójstwie.` });
  else if (kpNum >= 65) insights.push({ type: "positive", text: `Wysoki udział w walkach (${kpNum.toFixed(0)}%) — aktywne wsparcie drużyny.` });
  else if (!sup && kpNum < 30 && deaths < 4) insights.push({ type: "negative", text: `Bardzo niski udział w walkach drużyny (${kpNum.toFixed(0)}%) — gracz spędził zbyt dużo czasu w izolacji od drużyny.` });
  else if (!sup && kpNum < 45) insights.push({ type: "negative", text: `Niski KP (${kpNum.toFixed(0)}%) — warto częściej dołączać do walki drużynowej zamiast farmić solo.` });

  // ── Damage ──
  if (!sup) {
    const dmgK = (totalDamageDealt / 1000).toFixed(1);
    if (totalDamageDealt < 6000 && !jung) insights.push({ type: "negative", text: `Bardzo niskie obrażenia zadane bohaterom (${dmgK}k) — postać nie wnosiła siły ognia do walk drużynowych.` });
    else if (totalDamageDealt < 10000 && !jung && deaths >= 5) insights.push({ type: "neutral", text: `Niskie obrażenia (${dmgK}k) w połączeniu z dużą liczbą śmierci — postać nie miała wpływu na przebieg walk.` });
    else if (totalDamageDealt > avgTeamDmg * 1.5) insights.push({ type: "positive", text: `Wiodący damage dealer drużyny — zadał ${dmgK}k obrażeń, znacznie powyżej średniej drużyny.` });
  }

  // ── KDA ──
  const kdaNum = typeof kda === "number" ? kda : 0;
  if (deaths > 0 && kdaNum >= 7) insights.push({ type: "positive", text: `Znakomite KDA (${kdaNum.toFixed(1)}) — gracz skutecznie eliminował i asystował minimalizując własne straty.` });
  else if (deaths > 0 && kdaNum < 1.0 && deaths >= 5) insights.push({ type: "negative", text: `Negatywne KDA (${kdaNum.toFixed(1)}) — liczba zabójstw i asyst nie rekompensowała ilości śmierci.` });

  // ── Gold efficiency ──
  const goldShare = teamGold > 0 ? (goldEarned / teamGold) * 100 : 0;
  if (!sup && goldShare < 15 && cs < 80) insights.push({ type: "negative", text: `Niski udział w złocie drużyny (${goldShare.toFixed(0)}%) — słabe farmienie i rzadki udział w walkach ograniczyły siłę postaci.` });

  return insights;
}

function computeMVP(participants: any[]): any {
  return [...participants].sort((a, b) => {
    const scoreA = (a.kills * 3 + a.assists * 1.5 - a.deaths * 2) + (a.damageShare / 5) + (a.visionScore / 5);
    const scoreB = (b.kills * 3 + b.assists * 1.5 - b.deaths * 2) + (b.damageShare / 5) + (b.visionScore / 5);
    return scoreB - scoreA;
  })[0];
}

function computeWeakLink(participants: any[]): any {
  return [...participants].sort((a, b) => {
    const scoreA = (a.kills + a.assists) - a.deaths * 2.5 + a.csPerMin;
    const scoreB = (b.kills + b.assists) - b.deaths * 2.5 + b.csPerMin;
    return scoreA - scoreB;
  })[0];
}

function generateGameInsights(participants: any[], teams: any[], duration: number): string[] {
  const insights: string[] = [];
  const team1 = participants.filter((p: any) => p.teamId === 100);
  const team2 = participants.filter((p: any) => p.teamId === 200);
  const t1 = teams.find((t: any) => t.teamId === 100);
  const t2 = teams.find((t: any) => t.teamId === 200);

  const durationMin = duration / 60;
  if (durationMin < 22) insights.push("Błyskawiczny mecz — jedna drużyna całkowicie zdominowała early game i nie pozwoliła rywalom na powrót do gry.");
  else if (durationMin < 28) insights.push("Szybkie rozstrzygnięcie — przewaga zbudowana w early/mid game została skutecznie skonwertowana na wygraną.");
  else if (durationMin > 40) insights.push("Bardzo długi mecz — obie drużyny były wyrównane; gra o obiektywy i skalowanie zadecydowało o wyniku.");
  else if (durationMin > 32) insights.push("Długi mecz — żadna drużyna nie zdominowała wczesnej gry, rozstrzygnięcie nastąpiło w late game.");

  const t1Kills = team1.reduce((s: number, p: any) => s + p.kills, 0);
  const t2Kills = team2.reduce((s: number, p: any) => s + p.kills, 0);
  const killRatio = Math.max(t1Kills, t2Kills) / Math.max(Math.min(t1Kills, t2Kills), 1);
  if (killRatio >= 2.5) {
    const dominantTeam = t1Kills > t2Kills ? "Niebieska" : "Czerwona";
    insights.push(`Drużyna ${dominantTeam} zdominowała walki (${Math.max(t1Kills, t2Kills)} vs ${Math.min(t1Kills, t2Kills)} zabójstw) — miażdżąca przewaga kill-by-kill.`);
  }

  if (t1 && t2) {
    const winTeam = t1.win ? t1 : t2;
    const loseTeam = t1.win ? t2 : t1;
    const dragonDiff = (winTeam.objectives?.dragon ?? 0) - (loseTeam.objectives?.dragon ?? 0);
    const baronDiff = (winTeam.objectives?.baron ?? 0) - (loseTeam.objectives?.baron ?? 0);
    if (baronDiff >= 2) insights.push(`Wygrywająca drużyna dominowała przy Baronie (${winTeam.objectives?.baron} vs ${loseTeam.objectives?.baron}) — kluczowa kontrola obiektywa późnej gry.`);
    if (dragonDiff >= 3) insights.push(`Znaczna przewaga smoków (${winTeam.objectives?.dragon} vs ${loseTeam.objectives?.dragon}) — buffy dragonów dały trwałą przewagę statystyczną.`);
  }

  const highDeathPlayers = participants.filter((p: any) => p.deaths >= 7);
  if (highDeathPlayers.length >= 2) insights.push(`Aż ${highDeathPlayers.length} graczy zginęło 7+ razy — mecz charakteryzował się bardzo chaotycznym, agresywnym stylem gry.`);

  const zeroDeathPlayers = participants.filter((p: any) => p.deaths === 0);
  if (zeroDeathPlayers.length > 0) insights.push(`${zeroDeathPlayers.map((p: any) => p.summonerName).join(", ")} zakończyło mecz bez ani jednej śmierci — wyjątkowa przeżywalność.`);

  return insights;
}

function PlayerInsightCard({ p, team, allParticipants }: { p: any; team: any[]; allParticipants: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const dd = getDDBase();
  const insights = analyzePlayer(p, team, allParticipants);
  const positives = insights.filter(i => i.type === "positive");
  const negatives = insights.filter(i => i.type === "negative");
  const neutrals = insights.filter(i => i.type === "neutral");

  if (insights.length === 0) return null;

  const score = positives.length - negatives.length;
  const overallColor = score >= 2 ? "border-green-200 bg-green-50" : score <= -2 ? "border-red-200 bg-red-50" : "border-border bg-card";

  return (
    <div className={`rounded-lg border ${overallColor} overflow-hidden`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        <img src={`${dd}/champion/${p.championName}.png`} alt={p.championName}
          className="w-7 h-7 rounded-lg border border-border flex-shrink-0"
          onError={(e) => { e.currentTarget.src = `${BASE_URL}/images/fallback-champion.png`; }} />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-foreground truncate block">{p.summonerName}</span>
          <span className="text-[9px] text-muted-foreground">{p.championName}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {positives.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600">
              <TrendingUp className="w-3 h-3" /> {positives.length}
            </span>
          )}
          {negatives.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-500">
              <TrendingDown className="w-3 h-3" /> {negatives.length}
            </span>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/50" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5 border-t border-border/20 pt-2.5">
              {positives.map((ins, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-foreground/80 leading-relaxed">{ins.text}</p>
                </div>
              ))}
              {negatives.map((ins, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-foreground/80 leading-relaxed">{ins.text}</p>
                </div>
              ))}
              {neutrals.map((ins, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Brain className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-foreground/80 leading-relaxed">{ins.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchAnalysisSection({ participants, teams, duration }: { participants: any[]; teams: any[]; duration: number }) {
  const team1 = participants.filter((p: any) => p.teamId === 100);
  const team2 = participants.filter((p: any) => p.teamId === 200);
  const mvp = computeMVP(participants);
  const weakLink = computeWeakLink(participants);
  const gameInsights = generateGameInsights(participants, teams, duration);
  const dd = getDDBase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-6 space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
          Analiza meczu
        </h2>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* Game-level insights */}
      {gameInsights.length > 0 && (
        <div className="glass-panel p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2.5">Kluczowe wnioski</p>
          <div className="space-y-2">
            {gameInsights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">{ins}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MVP and weak link */}
      <div className="grid grid-cols-2 gap-3">
        {mvp && (
          <div className="glass-panel p-3 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img src={`${dd}/champion/${mvp.championName}.png`} alt={mvp.championName}
                className="w-10 h-10 rounded-lg border border-border"
                onError={(e) => { e.currentTarget.src = `${BASE_URL}/images/fallback-champion.png`; }} />
              <Star className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-wider font-bold text-yellow-500">MVP meczu</p>
              <p className="text-xs font-bold text-foreground truncate">{mvp.summonerName}</p>
              <p className="text-[10px] text-muted-foreground">{mvp.kills}/{mvp.deaths}/{mvp.assists} · {mvp.championName}</p>
            </div>
          </div>
        )}
        {weakLink && weakLink !== mvp && (
          <div className="glass-panel p-3 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img src={`${dd}/champion/${weakLink.championName}.png`} alt={weakLink.championName}
                className="w-10 h-10 rounded-lg border border-border grayscale opacity-70"
                onError={(e) => { e.currentTarget.src = `${BASE_URL}/images/fallback-champion.png`; }} />
              <AlertTriangle className="absolute -top-1 -right-1 w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-wider font-bold text-red-400">Słabe ogniwo</p>
              <p className="text-xs font-bold text-foreground truncate">{weakLink.summonerName}</p>
              <p className="text-[10px] text-muted-foreground">{weakLink.kills}/{weakLink.deaths}/{weakLink.assists} · {weakLink.championName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Per-player breakdown */}
      <div className="glass-panel p-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Analiza graczów — kliknij, żeby rozwinąć</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-1 mb-1">Drużyna Niebieska</p>
            {team1.map((p: any, i: number) => (
              <PlayerInsightCard key={i} p={p} team={team1} allParticipants={participants} />
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest px-1 mb-1">Drużyna Czerwona</p>
            {team2.map((p: any, i: number) => (
              <PlayerInsightCard key={i} p={p} team={team2} allParticipants={participants} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
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

        {/* Analysis */}
        <MatchAnalysisSection
          participants={participants}
          teams={data.teams ?? []}
          duration={data.gameDuration}
        />
      </motion.div>
    </div>
  );
}
