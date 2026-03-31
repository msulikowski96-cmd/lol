import { useParams, Link } from "wouter";
import { useState, useEffect, useRef, Component } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Brain, Star, TrendingUp, TrendingDown,
  Shield, Swords, Eye, Target, Zap, BookOpen,
  Award, AlertTriangle, CheckCircle2, Lightbulb,
  RefreshCw, Sparkles, BarChart3, Users, Trophy,
  ArrowRight, Clock, Activity
} from "lucide-react";
import { useSearchSummoner, useGetSummonerRanked, useGetSummonerMastery } from "@workspace/api-client-react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const RATING_COLOR: Record<string, string> = {
  "S+": "#FFD700", S: "#FFD700", "A+": "#00C853", A: "#00C853",
  "B+": "#2979FF", B: "#2979FF", "C+": "#FF6D00", C: "#FF6D00",
  "D": "#F44336",
};

const PRIORITY_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "rgba(244,67,54,0.12)", text: "#F44336", label: "Wysoki" },
  medium: { bg: "rgba(255,152,0,0.12)", text: "#FF9800", label: "Średni" },
  low: { bg: "rgba(76,175,80,0.12)", text: "#4CAF50", label: "Niski" },
};

const CATEGORY_ICON: Record<string, any> = {
  macro: Target, micro: Swords, mental: Brain,
  vision: Eye, champion_pool: BookOpen,
};

const FORM_COLOR: Record<string, string> = {
  "Świetna forma": "#00C853", "Dobra forma": "#4CAF50",
  "Stabilna": "#2979FF", "Zmienna": "#FF9800",
  "Słaba forma": "#FF6D00", "Kryzys": "#F44336",
};

function Section({ icon: Icon, title, children, delay = 0 }: {
  icon: any; title: string; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0,90,150,0.12)",
        borderRadius: 16,
        padding: "20px 20px 18px",
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(135deg,#0A1628,#1a3a6b)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon style={{ width: 16, height: 16, color: "#C89B3C" }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0A1628", letterSpacing: 0.2 }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function Prose({ text }: { text: string }) {
  return <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#1a2a4a", margin: 0 }}>{text}</p>;
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "#C89B3C", display: "inline-block" }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

function GeneratingCard({ step }: { step: string }) {
  const steps = [
    { icon: BarChart3, label: "Pobieranie statystyk gracza..." },
    { icon: Brain, label: "Analiza stylu gry i archetypów..." },
    { icon: Target, label: "Ocena mikro i makro umiejętności..." },
    { icon: Lightbulb, label: "Generowanie wskazówek coachingowych..." },
    { icon: Sparkles, label: "Finalizowanie raportu AI..." },
  ];
  const currentIdx = steps.findIndex((s) => s.label === step);
  return (
    <div style={{
      background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(0,90,150,0.15)", borderRadius: 18, padding: 28,
      textAlign: "center",
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ display: "inline-flex", marginBottom: 16 }}
      >
        <Brain style={{ width: 44, height: 44, color: "#C89B3C" }} />
      </motion.div>
      <div style={{ fontWeight: 700, fontSize: 17, color: "#0A1628", marginBottom: 8 }}>
        Nexus AI generuje raport <LoadingDots />
      </div>
      <div style={{ fontSize: 13, color: "#5a7a9a", marginBottom: 22 }}>
        Analizujemy {" "}
        <span style={{ color: "#C89B3C", fontWeight: 600 }}>30 ostatnich meczy</span>{" "}
        i wszystkie Twoje dane statystyczne
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = currentIdx > i;
          const active = currentIdx === i;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              borderRadius: 10,
              background: active ? "rgba(200,155,60,0.12)" : done ? "rgba(0,200,83,0.08)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${active ? "rgba(200,155,60,0.3)" : done ? "rgba(0,200,83,0.2)" : "transparent"}`,
              transition: "all 0.3s",
              opacity: i > currentIdx + 1 ? 0.4 : 1,
            }}>
              <Icon style={{ width: 15, height: 15, color: active ? "#C89B3C" : done ? "#4CAF50" : "#aaa", flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: active ? "#C89B3C" : done ? "#4CAF50" : "#888", fontWeight: active ? 600 : 400 }}>
                {s.label}
              </span>
              {done && <CheckCircle2 style={{ width: 13, height: 13, color: "#4CAF50", marginLeft: "auto" }} />}
              {active && <span style={{ marginLeft: "auto" }}><LoadingDots /></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

class AiErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0A1628 0%,#0d1f3c 60%,#162040 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", borderRadius: 16, padding: 28, textAlign: "center", maxWidth: 360 }}>
            <AlertTriangle style={{ width: 36, height: 36, color: "#F44336", margin: "0 auto 12px" }} />
            <div style={{ color: "#fff", fontWeight: 700, marginBottom: 8 }}>Błąd ładowania strony</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 16 }}>{this.state.error}</div>
            <button onClick={() => window.location.reload()} style={{ background: "rgba(244,67,54,0.2)", border: "1px solid rgba(244,67,54,0.4)", borderRadius: 8, padding: "8px 18px", color: "#F44336", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Odśwież stronę
            </button>
          </div>
        </div>
      );
    }
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

  const { data: rankedData } = useGetSummonerRanked(
    puuid ?? "",
    { region } as any,
    { query: { enabled: !!puuid } }
  );
  const { data: masteryData } = useGetSummonerMastery(
    puuid ?? "",
    { region, count: 7 } as any,
    { query: { enabled: !!puuid } }
  );

  const soloQ = (rankedData as any[])?.find((e: any) => e.queueType === "RANKED_SOLO_5x5");
  const tierColors: Record<string, string> = {
    IRON: "#8d9fa9", BRONZE: "#cd7f32", SILVER: "#c0c0c0", GOLD: "#FFD700",
    PLATINUM: "#00e5bb", EMERALD: "#00C853", DIAMOND: "#88ccff",
    MASTER: "#9c59d1", GRANDMASTER: "#ff4655", CHALLENGER: "#f4c874",
  };
  const tierColor = soloQ ? (tierColors[soloQ.tier] ?? "#aaa") : "#aaa";

  const steps = [
    "Pobieranie statystyk gracza...",
    "Analiza stylu gry i archetypów...",
    "Ocena mikro i makro umiejętności...",
    "Generowanie wskazówek coachingowych...",
    "Finalizowanie raportu AI...",
  ];

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
      const res = await fetch(
        `${BASE_URL}/api/summoner/${puuid}/ai-report?region=${region}&gameName=${encodeURIComponent(gameName)}`
      );
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
    if (puuid && !fetchedRef.current) {
      generateReport();
    }
  }, [puuid]);

  const profileLink = `${BASE_URL}/profile/${region}/${gameName}/${tagLine}`;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0A1628 0%,#0d1f3c 60%,#162040 100%)" }}>
      <div style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={profileLink}>
            <button style={{
              display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 12px",
              color: "#C89B3C", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              <ChevronLeft style={{ width: 15, height: 15 }} />
              Profil
            </button>
          </Link>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <Brain style={{ width: 18, height: 18, color: "#C89B3C" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>AI Analiza Gracza</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 60px" }}>
        {/* Player Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 18,
            marginBottom: 18, display: "flex", alignItems: "center", gap: 14,
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/profileicon/${summonerData?.profileIconId ?? 1}.png`}
              style={{ width: 52, height: 52, borderRadius: 12, border: `2px solid ${tierColor}`, objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).src = "https://ddragon.leagueoflegends.com/cdn/profileicon/1.png"; }}
            />
            {summonerData?.summonerLevel && (
              <div style={{
                position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                background: "#0A1628", border: "1px solid rgba(200,155,60,0.5)",
                borderRadius: 6, padding: "1px 6px", fontSize: 10, fontWeight: 700, color: "#C89B3C",
              }}>
                {summonerData.summonerLevel}
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: 0.3 }}>
              {gameName}<span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>#{tagLine}</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{region}</div>
            {soloQ && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <img src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${soloQ.tier.toLowerCase()}.png`}
                  style={{ width: 20, height: 20, objectFit: "contain" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <span style={{ color: tierColor, fontWeight: 700, fontSize: 13 }}>
                  {soloQ.tier} {soloQ.rank} {soloQ.leaguePoints} LP
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                  {soloQ.wins}W {soloQ.losses}L
                </span>
              </div>
            )}
          </div>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg,rgba(200,155,60,0.2),rgba(200,155,60,0.05))",
            border: "1px solid rgba(200,155,60,0.25)", borderRadius: 12, padding: "10px 14px",
          }}>
            <Brain style={{ width: 22, height: 22, color: "#C89B3C", marginBottom: 4 }} />
            <span style={{ color: "#C89B3C", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>NEXUS AI</span>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && <GeneratingCard step={loadingStep} />}

        {/* Error */}
        {error && !loading && (
          <div style={{
            background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)",
            borderRadius: 14, padding: 20, textAlign: "center",
          }}>
            <AlertTriangle style={{ width: 28, height: 28, color: "#F44336", margin: "0 auto 10px" }} />
            <div style={{ color: "#F44336", fontWeight: 600, marginBottom: 6 }}>Błąd generowania raportu</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 14 }}>{error}</div>
            <button onClick={generateReport} style={{
              background: "rgba(244,67,54,0.2)", border: "1px solid rgba(244,67,54,0.4)",
              borderRadius: 8, padding: "8px 18px", color: "#F44336", fontSize: 13,
              fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <RefreshCw style={{ width: 13, height: 13 }} /> Spróbuj ponownie
            </button>
          </div>
        )}

        {/* Report */}
        {report && !loading && !report.error && (
          <div>
            {/* Regenerate button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12, gap: 8 }}>
              {generatedAt && (
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, alignSelf: "center" }}>
                  <Clock style={{ width: 10, height: 10, display: "inline", marginRight: 3 }} />
                  {new Date(generatedAt).toLocaleTimeString("pl-PL")}
                </span>
              )}
              <button onClick={generateReport} style={{
                background: "rgba(200,155,60,0.1)", border: "1px solid rgba(200,155,60,0.3)",
                borderRadius: 8, padding: "6px 14px", color: "#C89B3C", fontSize: 12,
                fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              }}>
                <RefreshCw style={{ width: 12, height: 12 }} /> Odśwież raport
              </button>
            </div>

            {/* Overall Rating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                background: "linear-gradient(135deg,rgba(200,155,60,0.15) 0%,rgba(10,22,40,0.9) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(200,155,60,0.3)",
                borderRadius: 18, padding: "24px 20px", marginBottom: 14, textAlign: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 16 }}>
                <div>
                  <div style={{
                    fontSize: 52, fontWeight: 900, lineHeight: 1,
                    color: RATING_COLOR[report.overall_rating] ?? "#C89B3C",
                    textShadow: `0 0 20px ${RATING_COLOR[report.overall_rating] ?? "#C89B3C"}66`,
                  }}>
                    {report.overall_rating ?? "?"}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 2 }}>OCENA</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
                <div>
                  <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: "#fff" }}>
                    {report.overall_score ?? "–"}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 2 }}>WYNIK</div>
                </div>
                {report.consistency_score != null && (
                  <>
                    <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
                    <div>
                      <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: "#88ccff" }}>
                        {report.consistency_score}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 2 }}>KONSEKWENCJA</div>
                    </div>
                  </>
                )}
              </div>
              {report.form_assessment && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(0,0,0,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 14,
                }}>
                  <Activity style={{ width: 12, height: 12, color: FORM_COLOR[report.form_assessment] ?? "#aaa" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: FORM_COLOR[report.form_assessment] ?? "#aaa" }}>
                    {report.form_assessment}
                  </span>
                </div>
              )}
              {report.playstyle_archetype && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  background: "rgba(200,155,60,0.12)", border: "1px solid rgba(200,155,60,0.25)",
                  borderRadius: 20, padding: "6px 16px", marginBottom: 14,
                }}>
                  <Zap style={{ width: 13, height: 13, color: "#C89B3C" }} />
                  <span style={{ color: "#C89B3C", fontWeight: 700, fontSize: 13 }}>{report.playstyle_archetype}</span>
                </div>
              )}
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
                {report.executive_summary}
              </p>
            </motion.div>

            {/* Strengths & Weaknesses */}
            {(report.strengths?.length > 0 || report.weaknesses?.length > 0) && (
              <Section icon={Award} title="Mocne i słabe strony" delay={0.05}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                      <TrendingUp style={{ width: 13, height: 13, color: "#4CAF50" }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#4CAF50" }}>MOCNE STRONY</span>
                    </div>
                    {(report.strengths ?? []).map((s: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 7, marginBottom: 7 }}>
                        <CheckCircle2 style={{ width: 13, height: 13, color: "#4CAF50", flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12, color: "#1a2a4a", lineHeight: 1.55 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                      <TrendingDown style={{ width: 13, height: 13, color: "#F44336" }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#F44336" }}>SŁABE STRONY</span>
                    </div>
                    {(report.weaknesses ?? []).map((w: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 7, marginBottom: 7 }}>
                        <AlertTriangle style={{ width: 13, height: 13, color: "#FF9800", flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12, color: "#1a2a4a", lineHeight: 1.55 }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* Playstyle */}
            {report.playstyle_description && (
              <Section icon={Zap} title="Styl Gry i Archetyp" delay={0.1}>
                <Prose text={report.playstyle_description} />
              </Section>
            )}

            {/* Champion Pool */}
            {report.champion_pool_analysis && (
              <Section icon={BookOpen} title="Analiza Champion Poola" delay={0.15}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {(masteryData as any[])?.slice(0, 5).map((m: any) => (
                    <div key={m.championId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${m.championName ?? "Annie"}_0.jpg`}
                        style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid rgba(0,90,150,0.2)", objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span style={{ fontSize: 9, color: "#5a7a9a", fontWeight: 600, textAlign: "center", maxWidth: 44, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.championName}
                      </span>
                    </div>
                  ))}
                </div>
                <Prose text={report.champion_pool_analysis} />
              </Section>
            )}

            {/* Macro */}
            {report.macro_analysis && (
              <Section icon={Target} title="Makro — Zarządzanie Mapą" delay={0.2}>
                <Prose text={report.macro_analysis} />
              </Section>
            )}

            {/* Micro */}
            {report.micro_analysis && (
              <Section icon={Swords} title="Mikro — Mechanika i Walka" delay={0.25}>
                <Prose text={report.micro_analysis} />
              </Section>
            )}

            {/* Lane Phase */}
            {report.lane_phase_analysis && (
              <Section icon={Shield} title="Faza Laningowa" delay={0.3}>
                <Prose text={report.lane_phase_analysis} />
              </Section>
            )}

            {/* Teamfight */}
            {report.teamfight_analysis && (
              <Section icon={Users} title="Teamfighty i Starcia Drużynowe" delay={0.35}>
                <Prose text={report.teamfight_analysis} />
              </Section>
            )}

            {/* Deaths */}
            {report.death_analysis && (
              <Section icon={AlertTriangle} title="Analiza Zgonów" delay={0.38}>
                <Prose text={report.death_analysis} />
              </Section>
            )}

            {/* Vision */}
            {report.vision_analysis && (
              <Section icon={Eye} title="Vision Control i Świadomość Mapy" delay={0.4}>
                <Prose text={report.vision_analysis} />
              </Section>
            )}

            {/* Mental */}
            {report.mental_game && (
              <Section icon={Brain} title="Aspekt Mentalny i Forma" delay={0.43}>
                <Prose text={report.mental_game} />
                {report.consistency_comment && (
                  <div style={{
                    marginTop: 10, padding: "8px 12px", borderRadius: 10,
                    background: "rgba(41,121,255,0.08)", border: "1px solid rgba(41,121,255,0.15)",
                  }}>
                    <span style={{ fontSize: 12, color: "#2979FF" }}>{report.consistency_comment}</span>
                  </div>
                )}
              </Section>
            )}

            {/* Coaching Tips */}
            {report.coaching_tips?.length > 0 && (
              <Section icon={Lightbulb} title="Wskazówki Coachingowe" delay={0.48}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {report.coaching_tips.map((tip: any, i: number) => {
                    const pStyle = PRIORITY_COLOR[tip.priority] ?? PRIORITY_COLOR.medium;
                    const Icon = CATEGORY_ICON[tip.category] ?? Lightbulb;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.48 + i * 0.04 }}
                        style={{
                          borderRadius: 12, padding: "12px 14px",
                          background: pStyle.bg, border: `1px solid ${pStyle.text}30`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <Icon style={{ width: 13, height: 13, color: pStyle.text, flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#0A1628", flex: 1 }}>{tip.title}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: pStyle.text,
                            background: `${pStyle.text}18`, borderRadius: 6, padding: "2px 7px",
                          }}>
                            {pStyle.label}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#1a2a4a", lineHeight: 1.65 }}>{tip.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Champion Recommendations */}
            {report.champion_recommendations?.length > 0 && (
              <Section icon={Star} title="Polecane Championy" delay={0.55}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {report.champion_recommendations.map((rec: any, i: number) => (
                    <div key={i} style={{
                      display: "flex", gap: 12, padding: "10px 12px", borderRadius: 12,
                      background: "rgba(200,155,60,0.06)", border: "1px solid rgba(200,155,60,0.15)",
                    }}>
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${rec.champion}_0.jpg`}
                        style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(200,155,60,0.3)" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0A1628", marginBottom: 3 }}>{rec.champion}</div>
                        <div style={{ fontSize: 12, color: "#1a3a6b", lineHeight: 1.55, marginBottom: 4 }}>{rec.reason}</div>
                        {rec.synergy && (
                          <div style={{ fontSize: 11, color: "#5a7a9a" }}>
                            <ArrowRight style={{ width: 10, height: 10, display: "inline", marginRight: 3 }} />
                            {rec.synergy}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Rank Prediction */}
            {report.rank_prediction && (
              <Section icon={Trophy} title="Prognoza Rankingowa" delay={0.6}>
                <Prose text={report.rank_prediction} />
              </Section>
            )}

            {/* Motivation Quote */}
            {report.motivation_quote && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                style={{
                  background: "linear-gradient(135deg,rgba(200,155,60,0.18),rgba(200,155,60,0.06))",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(200,155,60,0.35)",
                  borderRadius: 16, padding: "20px 22px", textAlign: "center",
                }}
              >
                <Sparkles style={{ width: 22, height: 22, color: "#C89B3C", margin: "0 auto 10px" }} />
                <p style={{ fontStyle: "italic", fontSize: 14, color: "#1a2a4a", lineHeight: 1.7, margin: 0, fontWeight: 600 }}>
                  "{report.motivation_quote}"
                </p>
                <div style={{ marginTop: 10, fontSize: 11, color: "#C89B3C", fontWeight: 700 }}>— Nexus AI</div>
              </motion.div>
            )}
          </div>
        )}

        {/* Parse error fallback */}
        {report?.error && !loading && (
          <div style={{
            background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(0,90,150,0.12)", borderRadius: 16, padding: 20,
          }}>
            <p style={{ color: "#1a2a4a", fontSize: 13, lineHeight: 1.7 }}>{report.raw}</p>
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
