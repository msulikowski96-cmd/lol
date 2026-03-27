import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Swords, BarChart3, Zap, Shield, Users, Clock, X } from "lucide-react";

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
    desc: "11 wskaźników wydajności, archetyp stylu gry i pajęczyna statystyk",
    color: "text-violet-400",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.15)",
  },
  {
    icon: Zap,
    title: "Live w meczu",
    desc: "Wykrywa aktywną grę i pokazuje skład obu drużyn w czasie rzeczywistym",
    color: "text-green-400",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.15)",
  },
  {
    icon: Shield,
    title: "Historia meczy",
    desc: "Ostatnie gry z KDA, OP Score i ikoną bohatera naprzeciwko",
    color: "text-yellow-400",
    bg: "rgba(202,138,4,0.08)",
    border: "rgba(202,138,4,0.15)",
  },
  {
    icon: Users,
    title: "Szacowana ranga",
    desc: "AI oblicza rzeczywistą rangę gracza na podstawie stylu gry",
    color: "text-blue-400",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.15)",
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

  useEffect(() => { setHistory(loadHistory()); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !tagLine) return;
    const cleanName = encodeURIComponent(gameName.trim());
    const cleanTag = encodeURIComponent(tagLine.trim().replace(/^#/, ""));
    setLocation(`/profile/${region}/${cleanName}/${cleanTag}`);
  };

  const handleQuick = (q: typeof QUICK_SEARCH[number]) => {
    setLocation(`/profile/${q.region}/${encodeURIComponent(q.name)}/${q.tag}`);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 overflow-hidden">

      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-background/75 z-10" />
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt=""
          className="w-full h-full object-cover opacity-50 mix-blend-screen"
        />

        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none z-5"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none z-5"
          style={{ background: "radial-gradient(circle, rgba(30,64,175,0.1) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none z-5"
          style={{ background: "radial-gradient(circle, rgba(202,138,4,0.06) 0%, transparent 70%)" }}
        />
      </div>

      <div className="z-10 w-full max-w-2xl flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center glow-gold"
              style={{ background: "linear-gradient(135deg, rgba(202,138,4,0.2), rgba(202,138,4,0.05))", border: "1px solid rgba(202,138,4,0.3)" }}>
              <Swords className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl tracking-[0.12em] text-gradient-gold">NEXUS SIGHT</h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-lg mx-auto">
            Odkryj statystyki graczy League of Legends — analiza stylu gry, historia meczy i szacowana ranga AI.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          onSubmit={handleSearch}
          className="w-full mb-5"
          style={{
            background: "rgba(13,18,38,0.7)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            backdropFilter: "blur(16px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(202,138,4,0.05)",
            padding: "8px",
          }}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="sm:border-r sm:border-white/[0.07] sm:pr-3 sm:mr-1">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full sm:w-auto bg-transparent text-foreground/90 border-none focus:ring-0 cursor-pointer font-semibold outline-none py-3 px-3 text-sm appearance-none"
                style={{ color: "hsl(42,92%,65%)" }}
              >
                {REGIONS.map(r => (
                  <option key={r} value={r} className="bg-[#0d1228] text-white">{r}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-1 items-center gap-1 px-2">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Nazwa gracza"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground/60 focus:ring-0 outline-none py-3 px-2 text-base min-w-0"
                required
              />
              <span className="text-muted-foreground/40 font-light text-lg select-none">#</span>
              <input
                type="text"
                placeholder="TAG"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                className="w-20 bg-transparent border-none text-foreground placeholder:text-muted-foreground/60 focus:ring-0 outline-none py-3 px-2 text-base"
                required
              />
            </div>

            <button
              type="submit"
              className="sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold font-display tracking-widest uppercase text-sm group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, hsl(42,92%,52%), hsl(38,85%,44%))",
                color: "hsl(228,32%,4%)",
                boxShadow: "0 4px 20px rgba(202,138,4,0.25)",
              }}
            >
              Szukaj
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mb-10 w-full"
        >
          {history.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Clock className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">Ostatnio wyszukiwani</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {history.map((h) => (
                    <motion.div
                      key={`${h.gameName}-${h.tagLine}-${h.region}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="flex items-center gap-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <button
                        onClick={() => setLocation(`/profile/${h.region}/${encodeURIComponent(h.gameName)}/${encodeURIComponent(h.tagLine)}`)}
                        className="text-[11px] px-3 py-1.5 text-left transition-colors hover:text-primary"
                        style={{ color: "rgba(148,163,184,0.9)" }}
                      >
                        <span className="font-medium">{h.gameName}</span>
                        <span className="text-muted-foreground/40">#{h.tagLine}</span>
                        <span className="ml-1.5 text-[9px] text-muted-foreground/30 uppercase">{h.region}</span>
                      </button>
                      <button
                        onClick={() => {
                          const updated = history.filter(e => !(e.gameName === h.gameName && e.tagLine === h.tagLine && e.region === h.region));
                          setHistory(updated);
                          saveHistory(updated);
                        }}
                        className="pr-2.5 text-muted-foreground/30 hover:text-red-400 transition-colors"
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
              <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">Szybki podgląd:</span>
              {QUICK_SEARCH.map(q => (
                <button
                  key={q.name}
                  onClick={() => handleQuick(q)}
                  className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(148,163,184,0.8)",
                  }}
                >
                  {q.name}<span className="text-muted-foreground/40">#{q.tag}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.07 }}
              className="flex flex-col items-center text-center gap-2.5 px-3 py-4 rounded-xl"
              style={{ background: f.bg, border: `1px solid ${f.border}` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: f.bg }}>
                <f.icon className={`w-4 h-4 ${f.color}`} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-foreground/90 tracking-wide">{f.title}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
