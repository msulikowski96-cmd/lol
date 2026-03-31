import { useParams, Link } from "wouter";
import { useState, useEffect, useRef, Component } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft, Brain, Star, TrendingUp, TrendingDown,
  Shield, Swords, Eye, Target, Zap, BookOpen,
  Award, AlertTriangle, CheckCircle2, Lightbulb,
  RefreshCw, Sparkles, Users, Trophy,
  ArrowRight, Clock, Activity
} from "lucide-react";
import { useSearchSummoner, useGetSummonerRanked, useGetSummonerMastery } from "@workspace/api-client-react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const CARD: React.CSSProperties = {
  background: "white",
  border: "1px solid hsl(220,15%,90%)",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const PRIMARY = "hsl(200,90%,38%)";
const FG = "hsl(220,25%,12%)";
const MUTED = "hsl(220,10%,46%)";

const RATING_COLOR: Record<string, string> = {
  "S+": "hsl(45,90%,44%)", S: "hsl(45,90%,44%)", "A+": "hsl(152,60%,38%)", A: "hsl(152,60%,38%)",
  "B+": PRIMARY, B: PRIMARY, "C+": "hsl(28,90%,50%)", C: "hsl(28,90%,50%)",
  "D": "hsl(350,65%,48%)",
};

const PRIORITY_COLOR: Record<string, { bg: string; border: string; text: string; label: string }> = {
  high: { bg: "hsl(350,50%,97%)", border: "hsl(350,55%,82%)", text: "hsl(350,65%,45%)", label: "Wysoki" },
  medium: { bg: "hsl(38,80%,96%)", border: "hsl(38,70%,78%)", text: "hsl(38,75%,40%)", label: "Średni" },
  low: { bg: "hsl(152,50%,96%)", border: "hsl(152,45%,78%)", text: "hsl(152,55%,36%)", label: "Niski" },
};

const CATEGORY_ICON: Record<string, any> = {
  macro: Target, micro: Swords, mental: Brain,
  vision: Eye, champion_pool: BookOpen,
};

const FORM_COLOR: Record<string, string> = {
  "Świetna forma": "hsl(152,60%,38%)", "Dobra forma": "hsl(152,55%,42%)",
  "Stabilna": PRIMARY, "Zmienna": "hsl(38,75%,40%)",
  "Słaba forma": "hsl(28,85%,48%)", "Kryzys": "hsl(350,65%,48%)",
};

const TIER_COLOR: Record<string, string> = {
  IRON: "#8d9fa9", BRONZE: "#cd7f32", SILVER: "#8FA3B1", GOLD: "#D4A839",
  PLATINUM: "#4CBFAA", EMERALD: "#3AC48B", DIAMOND: "#57A8E7",
  MASTER: "#9B5CE8", GRANDMASTER: "#CF4B4B", CHALLENGER: "#E9BE5C",
};

function SectionTitle({ icon: Icon, children }: { icon: any; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <Icon style={{ width: 13, height: 13, color: PRIMARY, flexShrink: 0 }} />
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
        color: PRIMARY, fontFamily: "'Rajdhani',sans-serif",
      }}>
        {children}
      </span>
    </div>
  );
}

function Card({ children, style, delay = 0, fullWidth = false }: {
  children: ReactNode; style?: React.CSSProperties; delay?: number; fullWidth?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{ ...CARD, padding: "14px 14px 12px", gridColumn: fullWidth ? "1 / -1" : undefined, ...style }}
    >
      {children}
    </motion.div>
  );
}

function Prose({ text }: { text: string }) {
  return <p style={{ fontSize: 12, lineHeight: 1.7, color: MUTED, margin: 0 }}>{text}</p>;
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: PRIMARY, display: "inline-block" }}
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </span>
  );
}

const STEPS = [
  { label: "Pobieranie statystyk gracza...", icon: Target },
  { label: "Analiza stylu gry i archetypów...", icon: Brain },
  { label: "Ocena mikro i makro umiejętności...", icon: Swords },
  { label: "Generowanie wskazówek coachingowych...", icon: Lightbulb },
  { label: "Finalizowanie raportu AI...", icon: Sparkles },
];

function GeneratingCard({ step }: { step: string }) {
  return (
    <div style={{ ...CARD, padding: 20, marginBottom: 12 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "hsl(200,90%,95%)", border: `1px solid hsl(200,80%,82%)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
          <Brain style={{ width: 20, height: 20, color: PRIMARY }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: FG, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.02em" }}>
          Nexus AI generuje raport <LoadingDots />
        </div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Analizujemy ostatnie mecze i wszystkie Twoje dane statystyczne</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {STEPS.map(({ label, icon: Icon }, i) => {
          const active = label === step;
          const done = STEPS.findIndex(s => s.label === step) > i;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", borderRadius: 8,
              background: active ? "hsl(200,90%,95%)" : done ? "hsl(152,50%,96%)" : "hsl(220,15%,97%)",
              border: `1px solid ${active ? "hsl(200,80%,82%)" : done ? "hsl(152,45%,82%)" : "hsl(220,15%,90%)"}`,
              opacity: done || active ? 1 : 0.5,
              transition: "all 0.3s",
            }}>
              <Icon style={{ width: 12, height: 12, color: active ? PRIMARY : done ? "hsl(152,60%,38%)" : MUTED, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, fontWeight: active ? 600 : 400, color: active ? FG : done ? "hsl(152,60%,35%)" : MUTED, flex: 1 }}>
                {label}
              </span>
              {active && <LoadingDots />}
              {done && <CheckCircle2 style={{ width: 12, height: 12, color: "hsl(152,60%,38%)" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

class AiErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; msg: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, msg: "" };
  }
  static getDerivedStateFromError(err: any) { return { hasError: true, msg: err?.message ?? "" }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ minHeight: "100vh", background: "hsl(220,20%,97%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ ...CARD, padding: 28, textAlign: "center", maxWidth: 340 }}>
          <AlertTriangle style={{ width: 28, height: 28, color: "hsl(350,65%,48%)", margin: "0 auto 10px" }} />
          <div style={{ fontWeight: 700, color: FG, marginBottom: 6 }}>Błąd strony</div>
          <div style={{ fontSize: 12, color: MUTED }}>{this.state.msg || "Odśwież stronę"}</div>
        </div>
      </div>
    );
    return this.props.children;
  }
}

function AiAnalysisInner() {
  const { region, gameName, tagLine } = useParams<{ region: string; gameName: string; tagLine: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<number | null>(null);
  const fetchedRef = useRef(false);

  const { data: summonerData } = useSearchSummoner({ region, gameName, tagLine });
  const puuid = (summonerData as any)?.puuid as string | undefined;

  const { data: rankedData } = useGetSummonerRanked(puuid ?? "", { region } as any, { query: { enabled: !!puuid } });
  const { data: masteryData } = useGetSummonerMastery(puuid ?? "", { region, count: 7 } as any, { query: { enabled: !!puuid } });

  const soloQ = (rankedData as any[])?.find((e: any) => e.queueType === "RANKED_SOLO_5x5");
  const tierColor = soloQ ? (TIER_COLOR[soloQ.tier] ?? MUTED) : MUTED;

  const steps = STEPS.map(s => s.label);

  async function generateReport() {
    if (!puuid) return;
    setLoading(true);
    setError(null);
    setReport(null);
    fetchedRef.current = true;
    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setLoadingStep(steps[stepIdx]);
    }, 4500);
    try {
      const res = await fetch(`${BASE_URL}/api/summoner/${puuid}/ai-report?region=${region}&gameName=${encodeURIComponent(gameName)}`);
      clearInterval(interval);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setReport(data.report);
      setGeneratedAt(data.generatedAt);
    } catch (e: any) {
      clearInterval(interval);
      setError(e.message ?? "Błąd generowania raportu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (puuid && !fetchedRef.current) generateReport();
  }, [puuid]);

  const profileLink = `${BASE_URL}/profile/${region}/${gameName}/${tagLine}`;

  return (
    <div style={{ minHeight: "100vh", background: "hsl(220,20%,97%)" }}>

      {/* Header — matches profile page style */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "white", borderBottom: "1px solid hsl(220,15%,90%)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <Link href={profileLink}>
            <button style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "hsl(220,15%,96%)", border: "1px solid hsl(220,15%,88%)",
              borderRadius: 6, padding: "5px 10px", color: MUTED, fontSize: 11,
              fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif",
            }}>
              <ChevronLeft style={{ width: 13, height: 13 }} /> Profil
            </button>
          </Link>

          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/profileicon/${(summonerData as any)?.profileIconId ?? 1}.png`}
              style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${tierColor}`, objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).src = "https://ddragon.leagueoflegends.com/cdn/profileicon/1.png"; }}
            />
            {(summonerData as any)?.summonerLevel && (
              <span style={{
                position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
                background: FG, borderRadius: 4, padding: "1px 4px",
                fontSize: 8, fontWeight: 700, color: "white", whiteSpace: "nowrap",
              }}>
                Lv. {(summonerData as any).summonerLevel}
              </span>
            )}
          </div>

          {/* Name + rank */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: FG, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.02em" }}>
                {gameName}
              </span>
              <span style={{ fontSize: 12, color: MUTED }}>#{tagLine}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", padding: "1px 6px",
                background: "hsl(200,90%,95%)", color: PRIMARY, border: "1px solid hsl(200,80%,82%)",
                borderRadius: 4, fontFamily: "'Rajdhani',sans-serif",
              }}>{region}</span>
            </div>
            {soloQ && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <img
                  src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${soloQ.tier.toLowerCase()}.png`}
                  style={{ width: 14, height: 14, objectFit: "contain" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: tierColor }}>{soloQ.tier} {soloQ.rank}</span>
                <span style={{ fontSize: 11, color: MUTED }}>{soloQ.leaguePoints} LP · {soloQ.wins}W {soloQ.losses}L</span>
              </div>
            )}
            {!soloQ && !loading && <span style={{ fontSize: 11, color: MUTED }}>Unranked</span>}
          </div>

          {/* AI Badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
            background: "linear-gradient(135deg,#0A1628,#1a3a6b)",
            border: "1px solid rgba(200,155,60,0.4)", borderRadius: 7, flexShrink: 0,
          }}>
            <Brain style={{ width: 13, height: 13, color: "#C89B3C" }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: "#C89B3C", letterSpacing: "0.08em", fontFamily: "'Rajdhani',sans-serif" }}>NEXUS AI</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px 14px 60px" }}>

        {/* Loading */}
        {loading && <GeneratingCard step={loadingStep} />}

        {/* Error */}
        {error && !loading && (
          <div style={{ ...CARD, padding: 20, textAlign: "center", marginBottom: 12 }}>
            <AlertTriangle style={{ width: 24, height: 24, color: "hsl(350,65%,48%)", margin: "0 auto 10px" }} />
            <div style={{ fontWeight: 700, color: FG, marginBottom: 6, fontSize: 14 }}>Błąd generowania raportu</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>{error}</div>
            <button onClick={generateReport} style={{
              background: "hsl(350,50%,97%)", border: "1px solid hsl(350,55%,82%)",
              borderRadius: 7, padding: "7px 16px", color: "hsl(350,65%,45%)", fontSize: 12,
              fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: "'Rajdhani',sans-serif",
            }}>
              <RefreshCw style={{ width: 12, height: 12 }} /> Spróbuj ponownie
            </button>
          </div>
        )}

        {/* Report */}
        {report && !loading && !report.error && (
          <div>
            {/* Refresh bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 10 }}>
              {generatedAt && (
                <span style={{ fontSize: 10, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock style={{ width: 9, height: 9 }} />
                  {new Date(generatedAt).toLocaleTimeString("pl-PL")}
                </span>
              )}
              <button onClick={generateReport} style={{
                background: "white", border: "1px solid hsl(220,15%,88%)",
                borderRadius: 7, padding: "5px 12px", color: MUTED, fontSize: 11,
                fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                fontFamily: "'Rajdhani',sans-serif",
              }}>
                <RefreshCw style={{ width: 11, height: 11 }} /> Odśwież raport
              </button>
            </div>

            {/* Overall Rating — accent card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "linear-gradient(135deg, hsl(200,90%,96%), white)",
                border: "1px solid hsl(200,80%,82%)",
                borderRadius: 14, padding: "18px 16px 16px", marginBottom: 10,
              }}
            >
              {/* Score row */}
              <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 12 }}>
                <div style={{ textAlign: "center", paddingRight: 16, borderRight: "1px solid hsl(220,15%,90%)" }}>
                  <div style={{
                    fontSize: 44, fontWeight: 900, lineHeight: 1, fontFamily: "'Barlow Condensed',sans-serif",
                    color: RATING_COLOR[report.overall_rating] ?? PRIMARY,
                  }}>
                    {report.overall_rating ?? "?"}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase", marginTop: 2, fontFamily: "'Rajdhani',sans-serif" }}>OCENA</div>
                </div>
                <div style={{ display: "flex", gap: 0, flex: 1 }}>
                  {report.overall_score != null && (
                    <div style={{ textAlign: "center", flex: 1, borderRight: report.consistency_score != null ? "1px solid hsl(220,15%,90%)" : "none" }}>
                      <div style={{ fontSize: 32, fontWeight: 800, color: FG, fontFamily: "'Barlow Condensed',sans-serif" }}>{report.overall_score}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase", fontFamily: "'Rajdhani',sans-serif" }}>WYNIK</div>
                    </div>
                  )}
                  {report.consistency_score != null && (
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 32, fontWeight: 800, color: PRIMARY, fontFamily: "'Barlow Condensed',sans-serif" }}>{report.consistency_score}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase", fontFamily: "'Rajdhani',sans-serif" }}>KONSEKWENCJA</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {report.form_assessment && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
                    background: "white", border: `1px solid hsl(220,15%,88%)`,
                    borderRadius: 20, fontSize: 11, fontWeight: 700, color: FORM_COLOR[report.form_assessment] ?? MUTED,
                    fontFamily: "'Rajdhani',sans-serif",
                  }}>
                    <Activity style={{ width: 10, height: 10 }} />
                    {report.form_assessment}
                  </span>
                )}
                {report.playstyle_archetype && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
                    background: "linear-gradient(135deg,#0A1628,#1a3a6b)",
                    borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#C89B3C",
                    fontFamily: "'Rajdhani',sans-serif",
                  }}>
                    <Zap style={{ width: 10, height: 10 }} />
                    {report.playstyle_archetype}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 12.5, lineHeight: 1.7, color: FG, margin: 0 }}>
                {report.executive_summary}
              </p>
            </motion.div>

            {/* Grid of sections */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

              {/* Strengths & Weaknesses — full width */}
              {(report.strengths?.length > 0 || report.weaknesses?.length > 0) && (
                <Card delay={0.05} fullWidth>
                  <SectionTitle icon={Award}>Mocne i słabe strony</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 7 }}>
                        <TrendingUp style={{ width: 11, height: 11, color: "hsl(152,60%,38%)" }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: "hsl(152,60%,38%)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Rajdhani',sans-serif" }}>MOCNE</span>
                      </div>
                      {(report.strengths ?? []).map((s: string, i: number) => (
                        <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                          <CheckCircle2 style={{ width: 11, height: 11, color: "hsl(152,60%,38%)", flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 11, color: FG, lineHeight: 1.55 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 7 }}>
                        <TrendingDown style={{ width: 11, height: 11, color: "hsl(350,65%,48%)" }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: "hsl(350,65%,48%)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Rajdhani',sans-serif" }}>SŁABE</span>
                      </div>
                      {(report.weaknesses ?? []).map((w: string, i: number) => (
                        <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                          <AlertTriangle style={{ width: 11, height: 11, color: "hsl(38,75%,40%)", flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 11, color: FG, lineHeight: 1.55 }}>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Playstyle */}
              {report.playstyle_description && (
                <Card delay={0.08}>
                  <SectionTitle icon={Zap}>Styl Gry</SectionTitle>
                  <Prose text={report.playstyle_description} />
                </Card>
              )}

              {/* Champion Pool */}
              {report.champion_pool_analysis && (
                <Card delay={0.1}>
                  <SectionTitle icon={BookOpen}>Champion Pool</SectionTitle>
                  <div style={{ display: "flex", gap: 5, marginBottom: 9, flexWrap: "wrap" }}>
                    {(masteryData as any[])?.slice(0, 5).map((m: any) => (
                      <div key={m.championId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${m.championName ?? "Annie"}_0.jpg`}
                          style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid hsl(220,15%,88%)", objectFit: "cover" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <span style={{ fontSize: 8, color: MUTED, fontWeight: 600, maxWidth: 34, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.championName}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Prose text={report.champion_pool_analysis} />
                </Card>
              )}

              {/* Macro */}
              {report.macro_analysis && (
                <Card delay={0.12}>
                  <SectionTitle icon={Target}>Makro — Mapa</SectionTitle>
                  <Prose text={report.macro_analysis} />
                </Card>
              )}

              {/* Micro */}
              {report.micro_analysis && (
                <Card delay={0.14}>
                  <SectionTitle icon={Swords}>Mikro — Mechanika</SectionTitle>
                  <Prose text={report.micro_analysis} />
                </Card>
              )}

              {/* Lane Phase */}
              {report.lane_phase_analysis && (
                <Card delay={0.16}>
                  <SectionTitle icon={Shield}>Faza Laningowa</SectionTitle>
                  <Prose text={report.lane_phase_analysis} />
                </Card>
              )}

              {/* Teamfight */}
              {report.teamfight_analysis && (
                <Card delay={0.18}>
                  <SectionTitle icon={Users}>Teamfighty</SectionTitle>
                  <Prose text={report.teamfight_analysis} />
                </Card>
              )}

              {/* Deaths */}
              {report.death_analysis && (
                <Card delay={0.20}>
                  <SectionTitle icon={AlertTriangle}>Analiza Zgonów</SectionTitle>
                  <Prose text={report.death_analysis} />
                </Card>
              )}

              {/* Vision */}
              {report.vision_analysis && (
                <Card delay={0.22}>
                  <SectionTitle icon={Eye}>Vision i Świadomość</SectionTitle>
                  <Prose text={report.vision_analysis} />
                </Card>
              )}

              {/* Mental */}
              {report.mental_game && (
                <Card delay={0.24}>
                  <SectionTitle icon={Brain}>Aspekt Mentalny</SectionTitle>
                  <Prose text={report.mental_game} />
                  {report.consistency_comment && (
                    <div style={{
                      marginTop: 8, padding: "6px 10px", borderRadius: 7,
                      background: "hsl(200,90%,96%)", border: "1px solid hsl(200,80%,82%)",
                    }}>
                      <span style={{ fontSize: 11, color: PRIMARY }}>{report.consistency_comment}</span>
                    </div>
                  )}
                </Card>
              )}

              {/* Rank Prediction */}
              {report.rank_prediction && (
                <Card delay={0.26}>
                  <SectionTitle icon={Trophy}>Prognoza Rankingowa</SectionTitle>
                  <Prose text={report.rank_prediction} />
                </Card>
              )}

              {/* Coaching Tips — full width */}
              {report.coaching_tips?.length > 0 && (
                <Card delay={0.3} fullWidth>
                  <SectionTitle icon={Lightbulb}>Wskazówki Coachingowe</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    {report.coaching_tips.map((tip: any, i: number) => {
                      const p = PRIORITY_COLOR[tip.priority] ?? PRIORITY_COLOR.medium;
                      const Icon = CATEGORY_ICON[tip.category] ?? Lightbulb;
                      return (
                        <div key={i} style={{
                          borderRadius: 9, padding: "10px 11px",
                          background: p.bg, border: `1px solid ${p.border}`,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <Icon style={{ width: 11, height: 11, color: p.text, flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, fontSize: 11.5, color: FG, flex: 1, fontFamily: "'Rajdhani',sans-serif" }}>{tip.title}</span>
                            <span style={{
                              fontSize: 8, fontWeight: 700, color: p.text,
                              background: "white", borderRadius: 4, padding: "1px 5px", border: `1px solid ${p.border}`,
                              fontFamily: "'Rajdhani',sans-serif",
                            }}>
                              {p.label}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 11, color: MUTED, lineHeight: 1.6 }}>{tip.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Champion Recommendations — full width */}
              {report.champion_recommendations?.length > 0 && (
                <Card delay={0.35} fullWidth>
                  <SectionTitle icon={Star}>Polecane Championy</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                    {report.champion_recommendations.map((rec: any, i: number) => (
                      <div key={i} style={{
                        padding: "9px 10px", borderRadius: 9,
                        background: "hsl(200,90%,97%)", border: "1px solid hsl(200,80%,86%)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${rec.champion}_0.jpg`}
                            style={{ width: 34, height: 34, borderRadius: 7, objectFit: "cover", flexShrink: 0, border: "1px solid hsl(200,80%,82%)" }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          <div style={{ fontWeight: 700, fontSize: 12, color: FG, fontFamily: "'Rajdhani',sans-serif" }}>{rec.champion}</div>
                        </div>
                        <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginBottom: rec.synergy ? 5 : 0 }}>{rec.reason}</div>
                        {rec.synergy && (
                          <div style={{ fontSize: 10, color: PRIMARY }}>
                            <ArrowRight style={{ width: 8, height: 8, display: "inline", marginRight: 3 }} />
                            {rec.synergy}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

            </div>

            {/* Motivation quote */}
            {report.motivation_quote && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  marginTop: 8, padding: "16px 18px",
                  background: "linear-gradient(135deg, hsl(45,90%,97%), white)",
                  border: "1px solid hsl(45,70%,84%)", borderRadius: 12, textAlign: "center",
                }}
              >
                <Sparkles style={{ width: 16, height: 16, color: "hsl(45,85%,45%)", margin: "0 auto 8px" }} />
                <p style={{ fontStyle: "italic", fontSize: 13, color: FG, lineHeight: 1.7, margin: "0 0 6px", fontWeight: 600 }}>
                  "{report.motivation_quote}"
                </p>
                <span style={{ fontSize: 10, color: "hsl(45,85%,45%)", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif" }}>— Nexus AI</span>
              </motion.div>
            )}
          </div>
        )}

        {/* Parse error fallback */}
        {report?.error && !loading && (
          <div style={{ ...CARD, padding: 22, textAlign: "center" }}>
            <AlertTriangle style={{ width: 28, height: 28, color: "hsl(350,65%,48%)", margin: "0 auto 10px" }} />
            <div style={{ fontWeight: 700, color: FG, marginBottom: 6, fontSize: 14 }}>Błąd generowania raportu</div>
            <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.6, margin: "0 0 14px" }}>
              AI nie mogło przetworzyć danych. Kliknij poniżej aby spróbować ponownie.
            </p>
            <button onClick={() => generateReport()} style={{
              background: "hsl(200,90%,96%)", border: "1px solid hsl(200,80%,82%)",
              borderRadius: 8, padding: "8px 18px", color: PRIMARY, fontSize: 12,
              fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "'Rajdhani',sans-serif",
            }}>
              <RefreshCw style={{ width: 12, height: 12 }} /> Spróbuj ponownie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiAnalysisPage() {
  return (
    <AiErrorBoundary>
      <AiAnalysisInner />
    </AiErrorBoundary>
  );
}
