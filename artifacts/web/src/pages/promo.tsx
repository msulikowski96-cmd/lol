import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, Activity, Zap, Video, Download, Loader2,
  Star, Flame, Users, TrendingUp, Shield, Trophy, Eye
} from 'lucide-react';

// 8 scenes = 35 seconds total
const SCENE_DURATIONS = [3000, 4000, 5000, 4000, 5000, 5000, 4000, 5000];
const BASE = import.meta.env.BASE_URL;

const springSnappy = { type: "spring" as const, stiffness: 400, damping: 30 };
const springBouncy = { type: "spring" as const, stiffness: 300, damping: 15 };
const springSmooth = { type: "spring" as const, stiffness: 120, damping: 25 };

// ── Scene 0 – Logo hook (3s) ─────────────────────────────────────────────────
function Scene0({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 0;
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.15, filter: "blur(12px)" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ ...springBouncy, delay: 0.15 }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 bg-primary/25 blur-[60px] rounded-full scale-150" />
            <h1 className="text-7xl font-display font-bold text-center text-gradient-gold tracking-tight leading-none relative z-10">
              NEXUS<br />SIGHT
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springSnappy, delay: 1.1 }}
            className="text-2xl text-center text-white font-medium"
          >
            Chcesz wiedzieć{' '}
            <span className="text-primary font-bold">KIM</span> grasz?
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 1.8 }}
            className="h-px w-40 mt-4 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Scene 1 – Search animation (4s) ──────────────────────────────────────────
function Scene1({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 1;
  const [text, setText] = useState('');
  const fullText = 'Faker#KR1';

  useEffect(() => {
    if (!isActive) { setText(''); return; }
    let i = 0;
    let buf = '';
    const iv = setInterval(() => {
      if (i < fullText.length) { buf += fullText[i]; setText(buf); i++; }
      else clearInterval(iv);
    }, 140);
    return () => clearInterval(iv);
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40, filter: "blur(6px)" }}
          transition={{ duration: 0.55 }}
        >
          <motion.p
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-primary font-bold tracking-widest uppercase mb-4"
          >
            Szukaj gracza z dowolnego regionu
          </motion.p>
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springSnappy, delay: 0.3 }}
            className="w-full max-w-sm glass-panel p-6 rounded-2xl glow-purple relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
            <h2 className="text-lg font-display text-white mb-4 flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Znajdź Przywoływacza
            </h2>
            <div className="flex gap-2 mb-5">
              <div className="bg-background/80 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-2">
                <span className="font-bold text-primary text-sm">EUNE</span>
                <ChevronDown className="w-3 h-3 text-white/40" />
              </div>
              <div className="flex-1 bg-background/80 border border-white/10 rounded-lg px-4 py-3 flex items-center relative overflow-hidden">
                <span className="text-base font-bold text-white tracking-wide">{text}</span>
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.75, repeat: Infinity }}
                  className="w-[2px] h-5 bg-primary ml-1"
                />
                {text === fullText && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-sm"
                  >
                    <Activity className="w-6 h-6 text-primary animate-spin" />
                  </motion.div>
                )}
              </div>
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="h-11 bg-white/5 rounded-lg flex items-center px-4"
                >
                  <div className="w-7 h-7 rounded-full bg-white/10 mr-3" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 w-1/3 bg-white/20 rounded" />
                    <div className="h-1.5 w-1/4 bg-white/10 rounded" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Scene 2 – Rank + match history (5s) ──────────────────────────────────────
function Scene2({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 2;
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.55 }}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, rotateX: -15 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ ...springSnappy, delay: 0.1 }}
            className="w-full glass-panel rounded-2xl p-5 flex items-center gap-5 relative mb-4"
            style={{ transformPerspective: 1000 }}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/20 blur-[40px] rounded-full" />
            <motion.img
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...springBouncy, delay: 0.35 }}
              src={`${BASE}images/diamond-rank.png`}
              className="w-24 h-24 object-contain drop-shadow-[0_0_14px_rgba(139,92,246,0.6)] flex-shrink-0 z-10"
            />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className="z-10"
            >
              <div className="text-xs font-bold tracking-widest text-primary uppercase mb-1">Solo/Duo</div>
              <h3 className="text-2xl font-display font-bold text-white tracking-wide">DIAMENT I</h3>
              <p className="text-primary/80 text-sm font-medium">85 LP &bull; 65% WR &bull; 🔥 7W streak</p>
            </motion.div>
          </motion.div>

          <div className="w-full space-y-2.5">
            {[
              { res: 'WIN', kda: '12/2/8', score: '9.2', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', col: 'text-green-400' },
              { res: 'WIN', kda: '8/1/15', score: '8.7', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', col: 'text-green-400' },
              { res: 'LOSS', kda: '4/5/2', score: '4.1', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', col: 'text-red-400' },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springSnappy, delay: 1.0 + i * 0.14 }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl backdrop-blur-md"
                style={{ backgroundColor: m.bg, border: `1px solid ${m.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black/50 overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={`${BASE}images/champion-portrait.png`} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div>
                    <span className={`font-bold text-base ${m.col}`}>{m.res}</span>
                    <div className="text-white/60 text-xs">{m.kda} KDA</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">OP Score</div>
                  <div className={`text-lg font-bold font-display ${m.col}`}>{m.score}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Scene 3 – Champion mastery (4s) ──────────────────────────────────────────
function Scene3({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 3;
  const champs = [
    { name: 'Ahri', level: 7, pts: '248K', pct: 88 },
    { name: 'Syndra', level: 7, pts: '201K', pct: 74 },
    { name: 'Azir', level: 6, pts: '156K', pct: 58 },
  ];
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 mb-6"
          >
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-display font-bold text-white">Mastery Mistrzów</h2>
          </motion.div>

          <div className="w-full space-y-4">
            {champs.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springSmooth, delay: 0.3 + i * 0.18 }}
                className="w-full glass-panel p-4 rounded-2xl relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 overflow-hidden flex-shrink-0">
                    <img src={`${BASE}images/champion-portrait.png`} className="w-full h-full object-cover opacity-90" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-white">{c.name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: c.level === 7 ? 3 : c.level === 6 ? 2 : 1 }).map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                        ))}
                        <span className="text-xs text-primary font-bold ml-1">Lv.{c.level}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{c.pts} pkt</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.pct}%` }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.18, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-yellow-300"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Top 0.3% gracze na serwerze
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Scene 4 – Radar chart + AI rank (5s) ─────────────────────────────────────
function Scene4({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 4;
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.55 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 mb-6"
          >
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <h2 className="text-2xl font-display font-bold text-white">Głęboka Analiza</h2>
          </motion.div>

          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springBouncy, delay: 0.2 }}
            className="relative w-56 h-56 mb-8 flex items-center justify-center"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-white/10">
              <polygon points="50,5 95,38 78,95 22,95 5,38" fill="none" stroke="currentColor" strokeWidth="1" />
              <polygon points="50,27 73,44 65,73 35,73 27,44" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="95" y2="38" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="78" y2="95" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="22" y2="95" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="5" y2="38" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            <motion.svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-primary z-10"
              style={{ filter: "drop-shadow(0 0 10px rgba(202,138,4,0.55))" }}>
              <motion.polygon
                initial={{ points: "50,50 50,50 50,50 50,50 50,50" }}
                animate={{ points: "50,14 86,41 71,84 29,79 14,34" }}
                transition={{ duration: 1.4, delay: 0.4, ease: "easeOut" }}
                fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="2"
              />
            </motion.svg>
            <div className="absolute -top-7 text-[11px] font-bold text-primary">Agresja</div>
            <div className="absolute -right-14 top-[30%] text-[11px] font-bold text-white/60">Wizja</div>
            <div className="absolute -right-3 bottom-1 text-[11px] font-bold text-white/60">Walki</div>
            <div className="absolute -left-5 bottom-1 text-[11px] font-bold text-white/60">Carry</div>
            <div className="absolute -left-16 top-[30%] text-[11px] font-bold text-white/60">Farmienie</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springSnappy, delay: 1.4 }}
            className="w-full glass-panel p-5 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-violet-500/20" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-widest text-primary uppercase mb-1">Szacowana ranga AI</div>
                <div className="text-2xl font-display font-bold text-white">MASTER</div>
                <div className="text-xs text-muted-foreground mt-0.5">Archetyp: <span className="text-violet-400 font-semibold">Carry Mechaniczny</span></div>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/8 flex items-center justify-center border border-white/15">
                <Zap className="w-7 h-7 text-primary" />
              </div>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.1, delay: 2.0 }}
              className="h-1 mt-4 bg-gradient-to-r from-primary to-violet-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Scene 5 – Live game detection (5s) ───────────────────────────────────────
function Scene5({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 5;
  const team1 = ['Ahri', 'Lee Sin', 'Garen', 'Caitlyn', 'Thresh'];
  const team2 = ['Syndra', 'Graves', 'Darius', 'Jinx', 'Nautilus'];

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springBouncy, delay: 0.2 }}
            className="flex items-center gap-2 mb-5 px-4 py-2 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <span className="pulse-dot" />
            <Eye className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-bold text-sm tracking-wide">LIVE W MECZU</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full glass-panel rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Drużyna Niebieska</span>
              <span className="text-xs font-bold text-muted-foreground">vs</span>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Drużyna Czerwona</span>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                {team1.map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 overflow-hidden flex-shrink-0">
                      <img src={`${BASE}images/champion-portrait.png`} className="w-full h-full object-cover opacity-80" />
                    </div>
                    <span className="text-xs text-white/80 truncate">{name}</span>
                  </motion.div>
                ))}
              </div>

              <div className="w-px bg-white/8 mx-1" />

              <div className="flex-1 space-y-2">
                {team2.map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2 flex-row-reverse"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 overflow-hidden flex-shrink-0">
                      <img src={`${BASE}images/champion-portrait.png`} className="w-full h-full object-cover opacity-80" />
                    </div>
                    <span className="text-xs text-white/80 truncate text-right">{name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between"
            >
              <span className="text-[10px] text-muted-foreground">Czas gry</span>
              <span className="text-sm font-bold font-display text-primary">14:32</span>
              <span className="text-[10px] text-muted-foreground">Ranga przeciwnika</span>
              <span className="text-sm font-bold text-violet-400">Platyna I</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Scene 6 – Coaching tips + champion recs (4s) ─────────────────────────────
function Scene6({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 6;
  const tips = [
    { icon: Shield, text: 'Twój vision score jest za niski — kupuj więcej wardów', col: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', br: 'rgba(59,130,246,0.2)' },
    { icon: Flame, text: 'Seryjny zabójca — wiesz jak wygrywać walki 1v1', col: 'text-orange-400', bg: 'rgba(249,115,22,0.08)', br: 'rgba(249,115,22,0.2)' },
    { icon: Trophy, text: 'Polecany bohater: Irelia — idealny do Twojego stylu', col: 'text-primary', bg: 'rgba(202,138,4,0.08)', br: 'rgba(202,138,4,0.2)' },
  ];

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 mb-6"
          >
            <Users className="w-5 h-5 text-violet-400" />
            <h2 className="text-2xl font-display font-bold text-white">Coaching AI</h2>
          </motion.div>

          <div className="w-full space-y-3.5">
            {tips.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ ...springSmooth, delay: 0.3 + i * 0.22 }}
                className="w-full flex items-start gap-3.5 p-4 rounded-2xl"
                style={{ background: t.bg, border: `1px solid ${t.br}` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.bg, border: `1px solid ${t.br}` }}>
                  <t.icon className={`w-4 h-4 ${t.col}`} />
                </div>
                <p className={`text-sm font-medium leading-snug ${t.col}`}>{t.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-5 text-center"
          >
            <p className="text-xs text-muted-foreground">
              Spersonalizowane wskazówki na podstawie{' '}
              <span className="text-primary font-semibold">ostatnich 50 gier</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Scene 7 – CTA finale (5s) ─────────────────────────────────────────────────
function Scene7({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 7;
  const features = ['Ranga ranked', 'Historia meczy', 'Analiza stylu', 'Live game', 'Coaching AI'];

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springBouncy, delay: 0.1 }}
            className="mb-6 relative z-10"
          >
            <div className="absolute inset-0 bg-primary/50 blur-[90px] rounded-full scale-150" />
            <h1 className="text-6xl font-display font-bold text-center leading-tight relative z-10">
              <span className="text-white">NEXUS</span><br />
              <span className="text-gradient-gold">SIGHT</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, ...springSnappy }}
            className="text-xl font-medium text-white/90 text-center mb-6 relative z-10"
          >
            Twoja przewaga na<br />
            <span className="text-primary font-bold">Summoner's Rift</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-2 mb-7 relative z-10"
          >
            {features.map((f, i) => (
              <motion.span
                key={f}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 + i * 0.09, ...springBouncy }}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(202,138,4,0.12)', border: '1px solid rgba(202,138,4,0.25)', color: 'hsl(42,92%,65%)' }}
              >
                {f}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, ...springBouncy }}
            className="relative z-10"
          >
            <div className="px-8 py-4 rounded-2xl font-display font-bold tracking-widest text-lg uppercase text-background shadow-[0_0_30px_rgba(202,138,4,0.5)]"
              style={{ background: "linear-gradient(135deg, hsl(42,92%,56%), hsl(38,85%,46%))" }}>
              SPRAWDŹ TERAZ
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const TOTAL_DURATION = SCENE_DURATIONS.reduce((a, b) => a + b, 0);
const SCENE_COUNT = SCENE_DURATIONS.length;

type RecordState = 'idle' | 'waiting' | 'recording' | 'done';

export default function Promo() {
  const [currentScene, setCurrentScene] = useState(0);
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [countdown, setCountdown] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENE_COUNT);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timeout);
  }, [currentScene]);

  const handleRecord = async () => {
    try {
      setRecordState('waiting');
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nexus-sight-promo.webm';
        a.click();
        URL.revokeObjectURL(url);
        setRecordState('done');
        setTimeout(() => setRecordState('idle'), 4000);
      };
      setCurrentScene(0);
      setRecordState('recording');
      setCountdown(TOTAL_DURATION / 1000);
      recorder.start(100);
      const tick = setInterval(() => {
        setCountdown(c => { if (c <= 1) { clearInterval(tick); return 0; } return c - 1; });
      }, 1000);
      setTimeout(() => { recorder.stop(); clearInterval(tick); }, TOTAL_DURATION + 400);
    } catch {
      setRecordState('idle');
    }
  };

  return (
    <div className="w-full h-screen bg-background overflow-hidden relative flex flex-col items-center justify-center font-sans select-none gap-4">

      {/* Controls bar */}
      <div className="flex items-center gap-3 z-20 flex-wrap justify-center px-4">
        {recordState === 'idle' && (
          <button
            onClick={handleRecord}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, hsl(42,92%,52%), hsl(38,85%,44%))", color: "hsl(228,32%,4%)", boxShadow: "0 4px 20px rgba(202,138,4,0.3)" }}
          >
            <Video className="w-4 h-4" />
            Nagraj wideo (35s)
          </button>
        )}
        {recordState === 'waiting' && (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-muted-foreground"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Wybierz kartę / okno w przeglądarce…
          </div>
        )}
        {recordState === 'recording' && (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Nagrywanie… {countdown}s
          </div>
        )}
        {recordState === 'done' && (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}>
            <Download className="w-4 h-4" />
            Pobrano! Plik .webm gotowy do TikToka
          </div>
        )}
        <span className="text-[11px] text-muted-foreground/50">Scena {currentScene + 1}/{SCENE_COUNT}</span>
      </div>

      {/* 9:16 TikTok container */}
      <div className="relative w-full max-w-[420px] h-full max-h-[780px] aspect-[9/16] bg-background shadow-2xl overflow-hidden md:rounded-3xl border border-white/5">

        {/* Persistent animated background */}
        <div className="absolute inset-0 z-0">
          <img src={`${BASE}images/bg-orbs.png`} alt="" className="w-full h-full object-cover opacity-55 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/45 to-background" />
          <motion.div
            animate={{ x: currentScene % 2 === 0 ? "8vw" : "-8vw", y: currentScene % 3 === 0 ? "4vh" : "-4vh", scale: currentScene === 4 ? 1.4 : 1 }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[90px]"
          />
          <motion.div
            animate={{ x: currentScene % 2 !== 0 ? "12vw" : "-12vw", scale: currentScene === 1 ? 1.4 : 1 }}
            transition={{ duration: 4.5, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-[110px]"
          />
          <motion.div
            animate={{ opacity: [5, 6].includes(currentScene) ? 0.15 : 0.06, scale: [5, 6].includes(currentScene) ? 1.2 : 1 }}
            transition={{ duration: 2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"
          />
        </div>

        {/* Scenes */}
        <Scene0 currentScene={currentScene} />
        <Scene1 currentScene={currentScene} />
        <Scene2 currentScene={currentScene} />
        <Scene3 currentScene={currentScene} />
        <Scene4 currentScene={currentScene} />
        <Scene5 currentScene={currentScene} />
        <Scene6 currentScene={currentScene} />
        <Scene7 currentScene={currentScene} />

        {/* TikTok-style progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/15 z-50">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-yellow-300"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: TOTAL_DURATION / 1000, ease: "linear", repeat: Infinity }}
            key="progress"
          />
        </div>

        {/* Scene dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-50">
          {SCENE_DURATIONS.map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: i === currentScene ? 1 : 0.3, scale: i === currentScene ? 1.3 : 1 }}
              transition={{ duration: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
