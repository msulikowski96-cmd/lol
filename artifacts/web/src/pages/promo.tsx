import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Activity, Zap } from 'lucide-react';

const SCENE_DURATIONS = [3000, 4000, 5000, 5000, 3000];
const BASE = import.meta.env.BASE_URL;

const springSnappy = { type: "spring" as const, stiffness: 400, damping: 30 };
const springBouncy = { type: "spring" as const, stiffness: 300, damping: 15 };

function Scene0({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 0;
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ ...springBouncy, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <h1 className="text-6xl md:text-8xl font-display font-bold text-center text-gradient-gold tracking-tight leading-none mb-6 relative z-10 glow-gold">
              NEXUS<br />SIGHT
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springSnappy, delay: 1.2 }}
            className="text-2xl md:text-3xl text-center text-white font-medium"
          >
            Chcesz wiedzieć <span className="text-primary font-bold">KIM</span> grasz?
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Scene1({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 1;
  const [text, setText] = useState("");
  const fullText = "Faker#KR1";

  useEffect(() => {
    if (isActive) {
      let currentText = "";
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setText(currentText);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 150);
      return () => clearInterval(interval);
    } else {
      setText("");
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springSnappy, delay: 0.3 }}
            className="w-full max-w-sm glass-panel p-6 rounded-2xl glow-purple relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
            <h2 className="text-xl font-display text-white mb-4 flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Znajdź Przywoływacza
            </h2>
            <div className="flex gap-2 mb-6">
              <div className="bg-background/80 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-2">
                <span className="font-bold text-white">EUNE</span>
                <ChevronDown className="w-4 h-4 text-white/50" />
              </div>
              <div className="flex-1 bg-background/80 border border-white/10 rounded-lg px-4 py-3 flex items-center relative overflow-hidden">
                <span className="text-xl font-bold text-white tracking-wide">{text}</span>
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-[2px] h-6 bg-primary ml-1"
                />
                {text === fullText && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-sm"
                  >
                    <Activity className="w-6 h-6 text-primary animate-spin" />
                  </motion.div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="h-12 bg-white/5 rounded-lg flex items-center px-4"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 mr-3" />
                  <div className="space-y-2 flex-1">
                    <div className="h-2 w-1/3 bg-white/20 rounded" />
                    <div className="h-2 w-1/4 bg-white/10 rounded" />
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

function Scene2({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 2;
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ y: 100, opacity: 0, rotateX: -20 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ ...springSnappy, delay: 0.1 }}
            className="w-full glass-panel rounded-2xl p-6 flex flex-col items-center relative mb-6"
            style={{ transformPerspective: 1000 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full" />
            <motion.img
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...springBouncy, delay: 0.4 }}
              src={`${BASE}images/diamond-rank.png`}
              className="w-32 h-32 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] z-10"
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-4 z-10"
            >
              <h3 className="text-3xl font-display font-bold text-white tracking-wide">DIAMENT I</h3>
              <p className="text-primary font-medium">85 LP &bull; 65% Winrate</p>
            </motion.div>
          </motion.div>

          <div className="w-full space-y-3">
            {[
              { res: "WIN", kda: "12/2/8", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", color: "text-green-400" },
              { res: "WIN", kda: "8/1/15", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", color: "text-green-400" },
              { res: "LOSS", kda: "4/5/2", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", color: "text-red-400" }
            ].map((match, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springSnappy, delay: 1.0 + i * 0.15 }}
                className="w-full flex items-center justify-between p-4 rounded-xl backdrop-blur-md"
                style={{ backgroundColor: match.bg, border: `1px solid ${match.border}` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden relative border border-white/10">
                    <img src={`${BASE}images/champion-portrait.png`} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div>
                    <div className={`font-bold text-lg ${match.color}`}>{match.res}</div>
                    <div className="text-white/70 text-sm font-medium">{match.kda} KDA</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="w-6 h-6 rounded-full bg-black/40 border border-white/5" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Scene3({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 3;
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-bold text-center text-white mb-8"
          >
            Głęboka Analiza
          </motion.h2>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springBouncy, delay: 0.2 }}
            className="relative w-64 h-64 mb-10 flex items-center justify-center"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-white/10">
              <polygon points="50,5 95,38 78,95 22,95 5,38" fill="none" stroke="currentColor" strokeWidth="1" />
              <polygon points="50,25 75,45 65,75 35,75 25,45" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="95" y2="38" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="78" y2="95" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="22" y2="95" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="5" y2="38" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            <motion.svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-primary z-10" style={{ filter: "drop-shadow(0 0 10px rgba(202,138,4,0.5))" }}>
              <motion.polygon
                initial={{ points: "50,50 50,50 50,50 50,50 50,50" }}
                animate={{ points: "50,15 85,42 70,85 30,80 15,35" }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                fill="currentColor"
                fillOpacity="0.4"
                stroke="currentColor"
                strokeWidth="2"
              />
            </motion.svg>
            <div className="absolute -top-6 text-sm font-bold text-primary">Agresja</div>
            <div className="absolute -right-12 top-1/3 text-sm font-bold text-white/70">Wizja</div>
            <div className="absolute -right-4 bottom-0 text-sm font-bold text-white/70">Walki</div>
            <div className="absolute -left-6 bottom-0 text-sm font-bold text-white/70">Carry</div>
            <div className="absolute -left-16 top-1/3 text-sm font-bold text-white/70">Farmienie</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springSnappy, delay: 1.5 }}
            className="w-full glass-panel p-5 rounded-2xl border-primary/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-primary uppercase mb-1">Szacowana ranga AI</div>
                <div className="text-2xl font-display font-bold text-white">MASTER</div>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Zap className="w-7 h-7 text-primary" />
              </div>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 2 }}
              className="h-1 mt-4 bg-gradient-to-r from-primary to-purple-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Scene4({ currentScene }: { currentScene: number }) {
  const isActive = currentScene === 4;
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springBouncy }}
            className="mb-8 relative"
          >
            <div className="absolute inset-0 bg-primary/40 blur-[80px] rounded-full" />
            <h1 className="text-5xl md:text-7xl font-display font-bold text-center text-white tracking-tight leading-none relative z-10">
              NEXUS<br /><span className="text-primary">SIGHT</span>
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ...springSnappy }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl font-medium text-white/90 mb-4">
              Twoja przewaga na<br />Summoner's Rift
            </p>
            <div className="inline-block px-6 py-3 rounded-full bg-primary text-background font-bold tracking-wide shadow-[0_0_20px_rgba(202,138,4,0.5)]">
              SPRAWDŹ TERAZ
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Promo() {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENE_DURATIONS.length);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timeout);
  }, [currentScene]);

  return (
    <div className="w-full h-screen bg-background overflow-hidden relative flex items-center justify-center font-sans select-none">
      <div className="relative w-full max-w-[450px] h-full max-h-[850px] aspect-[9/16] bg-background shadow-2xl overflow-hidden md:rounded-3xl border border-white/5">

        <div className="absolute inset-0 z-0">
          <img
            src={`${BASE}images/bg-orbs.png`}
            alt=""
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

          <motion.div
            animate={{
              x: currentScene % 2 === 0 ? "10vw" : "-10vw",
              y: currentScene % 3 === 0 ? "5vh" : "-5vh",
              scale: currentScene === 3 ? 1.5 : 1,
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              x: currentScene % 2 !== 0 ? "15vw" : "-15vw",
              scale: currentScene === 1 ? 1.5 : 1,
            }}
            transition={{ duration: 5, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]"
          />
        </div>

        <Scene0 currentScene={currentScene} />
        <Scene1 currentScene={currentScene} />
        <Scene2 currentScene={currentScene} />
        <Scene3 currentScene={currentScene} />
        <Scene4 currentScene={currentScene} />

        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-50">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: SCENE_DURATIONS.reduce((a, b) => a + b, 0) / 1000,
              ease: "linear",
              repeat: Infinity,
            }}
            key="progress"
          />
        </div>
      </div>
    </div>
  );
}
