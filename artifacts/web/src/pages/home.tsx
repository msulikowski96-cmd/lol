import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, BarChart3, Zap, Shield, Users, Clock, X, Activity } from "lucide-react";

const HISTORY_KEY = "nexus_sight_history";
const MAX_HISTORY = 8;

type HistoryEntry = { gameName: string; tagLine: string; region: string; ts: number };

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}
function saveHistory(entries: HistoryEntry[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
}
export function pushHistory(gameName: string, tagLine: string, region: string) {
  const existing = loadHistory().filter(
    e => !(e.gameName.toLowerCase() === gameName.toLowerCase() && e.tagLine.toLowerCase() === tagLine.toLowerCase() && e.region === region)
  );
  const updated: HistoryEntry[] = [{ gameName, tagLine, region, ts: Date.now() }, ...existing].slice(0, MAX_HISTORY);
  saveHistory(updated);
}

const REGIONS = [
  "EUW1", "NA1", "KR", "EUN1", "BR1", "LA1", "LA2", "OC1", "TR1", "RU", "JP1", "PH2", "SG2", "TW2", "TH2", "VN2"
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Głęboka analiza",
    desc: "12 wskaźników, archetyp stylu gry, early game, obiektywy, wskaźnik tiltu",
    color: "hsl(196,100%,55%)",
    glow: "rgba(0,212,255,0.15)",
    border: "rgba(0,212,255,0.14)",
    bg: "rgba(0,212,255,0.04)",
  },
  {
    icon: Zap,
    title: "Live w meczu",
    desc: "Aktywna gra w czasie rzeczywistym — rangi, runy, czarownie i bany",
    color: "hsl(142,68%,50%)",
    glow: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.14)",
    bg: "rgba(34,197,94,0.04)",
  },
  {
    icon: Shield,
    title: "Historia meczy",
    desc: "KDA, OP Score, skład drużyn i porównanie z oponentem z lane",
    color: "hsl(45,95%,58%)",
    glow: "rgba(202,138,4,0.15)",
    border: "rgba(202,138,4,0.14)",
    bg: "rgba(202,138,4,0.04)",
  },
  {
    icon: Users,
    title: "Szacowana ranga",
    desc: "Algorytm AI oblicza realną rangę gracza na podstawie stylu gry",
    color: "hsl(258,80%,68%)",
    glow: "rgba(139,92,246,0.15)",
    border: "rgba(139,92,246,0.14)",
    bg: "rgba(139,92,246,0.04)",
  },
];

const QUICK_SEARCH = [
  { name: "Faker", tag: "T1", region: "KR" },
  { name: "Caps", tag: "EUW", region: "EUW1" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [region, setRegion] = useState("EUW1");
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !tagLine) return;
    const name = gameName.trim();
    const tag = tagLine.trim().replace(/^#/, "");
    pushHistory(name, tag, region);
    setHistory(loadHistory());
    setLocation(`/profile/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
  };

  const handleQuick = (q: typeof QUICK_SEARCH[number]) => {
    setLocation(`/profile/${q.region}/${encodeURIComponent(q.name)}/${q.tag}`);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 bg-background/70 z-5" />
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt=""
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none z-5"
          style={{ background: "radial-gradient(circle, rgba(0,180,220,0.1) 0%, transparent 65%)" }}
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 35, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none z-5"
          style={{ background: "radial-gradient(circle, rgba(88,28,220,0.09) 0%, transparent 65%)" }}
        />
        <motion.div
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-32 pointer-events-none z-5"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.3), transparent)" }}
        />
      </div>

      <div className="z-10 w-full max-w-2xl flex flex-col items-center">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="relative">
              <div className="w-14 h-14 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,150,220,0.06))",
                  border: "1px solid rgba(0,212,255,0.25)",
                  borderRadius: "8px",
                  boxShadow: "0 0 24px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.06)",
                }}>
                <Activity className="w-7 h-7" style={{ color: "hsl(196,100%,55%)" }} />
              </div>
              <div className="corner-accent corner-accent-tl" />
              <div className="corner-accent corner-accent-br" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-[0.08em] leading-none text-gradient-cyan"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}>
                NEXUS SIGHT
              </h1>
              <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground mt-1"
                style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>
                League of Legends · Analiza Statystyk
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-md mx-auto">
            Sprawdź statystyki każdego gracza — analiza gry, historia meczy, live game i szacowana ranga AI.
          </p>
        </motion.div>

        {/* Search */}
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSearch}
          className="w-full mb-5"
        >
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 overflow-hidden"
            style={{
              background: "rgba(5,10,22,0.85)",
              border: focused ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(0,212,255,0.12)",
              borderRadius: "8px",
              backdropFilter: "blur(20px)",
              boxShadow: focused
                ? "0 0 0 3px rgba(0,212,255,0.08), 0 24px 60px rgba(0,0,0,0.5)"
                : "0 24px 60px rgba(0,0,0,0.4)",
              transition: "all 0.2s",
              padding: "6px",
            }}
          >
            <div className="border-b sm:border-b-0 sm:border-r border-white/[0.06] pb-2 sm:pb-0 sm:pr-3 sm:mr-2 mb-2 sm:mb-0">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full sm:w-auto bg-transparent border-none focus:ring-0 cursor-pointer outline-none py-3 px-3 text-sm font-semibold appearance-none"
                style={{ color: "hsl(196,100%,62%)", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex flex-1 items-center gap-1 px-2">
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(0,212,255,0.5)" }} />
              <input
                type="text"
                placeholder="Nazwa gracza"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground/50 focus:ring-0 outline-none py-3 px-2 text-base min-w-0"
                required
              />
              <span className="text-muted-foreground/30 font-light text-xl select-none">#</span>
              <input
                type="text"
                placeholder="TAG"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-20 bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 focus:ring-0 outline-none py-3 px-2 text-base"
                style={{ fontFamily: "'Rajdhani',sans-serif" }}
                required
              />
            </div>

            <button type="submit" className="search-btn flex items-center justify-center gap-2 px-7 py-3.5 rounded-[4px] text-sm group">
              SZUKAJ
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.form>

        {/* History / Quick Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10 w-full"
        >
          {history.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Clock className="w-3 h-3" style={{ color: "rgba(0,212,255,0.4)" }} />
                <span className="data-label">Ostatnio wyszukiwani</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {history.map((h) => (
                    <motion.div
                      key={`${h.gameName}-${h.tagLine}-${h.region}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="flex items-center gap-0 rounded-[4px] overflow-hidden"
                      style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)" }}
                    >
                      <button
                        onClick={() => setLocation(`/profile/${h.region}/${encodeURIComponent(h.gameName)}/${encodeURIComponent(h.tagLine)}`)}
                        className="text-[11px] px-3 py-1.5 text-left transition-colors"
                        style={{ color: "rgba(148,163,184,0.85)", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}
                      >
                        <span className="font-bold text-foreground/80">{h.gameName}</span>
                        <span style={{ color: "rgba(0,212,255,0.5)" }}>#{h.tagLine}</span>
                        <span className="ml-2 text-[9px] tracking-wider" style={{ color: "rgba(0,212,255,0.4)" }}>{h.region}</span>
                      </button>
                      <button
                        onClick={() => {
                          const updated = history.filter(e => !(e.gameName === h.gameName && e.tagLine === h.tagLine && e.region === h.region));
                          setHistory(updated);
                          saveHistory(updated);
                        }}
                        className="pr-2.5 pl-1 text-muted-foreground/30 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="data-label">Szybki podgląd:</span>
              {QUICK_SEARCH.map(q => (
                <button
                  key={q.name}
                  onClick={() => handleQuick(q)}
                  className="text-[11px] px-3 py-1.5 rounded-[4px] transition-all hover:scale-105"
                  style={{
                    background: "rgba(0,212,255,0.04)",
                    border: "1px solid rgba(0,212,255,0.12)",
                    color: "rgba(148,163,184,0.8)",
                    fontFamily: "'Rajdhani',sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {q.name}<span style={{ color: "rgba(0,212,255,0.45)" }}>#{q.tag}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08 }}
              className="flex flex-col items-start gap-3 px-3.5 py-4 relative overflow-hidden"
              style={{
                background: f.bg,
                border: `1px solid ${f.border}`,
                borderRadius: "8px",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${f.glow.replace('0.15','0.5')}, transparent)` }} />
              <div className="w-8 h-8 rounded-[4px] flex items-center justify-center"
                style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                <f.icon className="w-4 h-4" style={{ color: f.color }} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-foreground/95 tracking-wide mb-1"
                  style={{ fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.06em", color: f.color }}>
                  {f.title}
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 flex items-center gap-3"
        >
          <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(to right, transparent, rgba(0,212,255,0.2))" }} />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(0,212,255,0.35)", fontFamily: "'Rajdhani',sans-serif" }}>
            Powered by Riot API
          </span>
          <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(to left, transparent, rgba(0,212,255,0.2))" }} />
        </motion.div>
      </div>
    </div>
  );
}
