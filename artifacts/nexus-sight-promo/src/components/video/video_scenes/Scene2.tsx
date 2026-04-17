import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Trophy, Activity, Target } from 'lucide-react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 3600),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-16"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full flex justify-between items-start gap-12">
        <motion.div 
          className="flex-1 flex flex-col gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[4vw] font-display font-black leading-none uppercase">
            Profil <span className="text-primary">Gracza</span>
          </h2>
          <p className="text-2xl font-body text-white/60">
            Szczegółowa historia, rangi i statystyki
          </p>

          <div className="flex gap-6 mt-4">
            <motion.div 
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={phase >= 2 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Trophy className="w-8 h-8 text-yellow-400 mb-4" />
              <div className="text-sm text-white/50 font-body uppercase tracking-wider">Solo/Duo</div>
              <div className="text-4xl font-display font-bold text-white mt-1">Master</div>
              <div className="text-primary font-body text-lg">240 LP</div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400/20 blur-3xl rounded-full" />
            </motion.div>

            <motion.div 
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={phase >= 2 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            >
              <Activity className="w-8 h-8 text-primary mb-4" />
              <div className="text-sm text-white/50 font-body uppercase tracking-wider">KDA Ratio</div>
              <div className="text-4xl font-display font-bold text-white mt-1">3.84</div>
              <div className="text-green-400 font-body text-lg">Wysokie</div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="w-[45%] flex flex-col gap-4 mt-8"
          initial={{ opacity: 0, x: 30 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.6 }}
        >
          {[
            { res: "Victory", kda: "12 / 2 / 8", champ: "Ahri", score: "S+" },
            { res: "Victory", kda: "8 / 1 / 14", champ: "Azir", score: "S" },
            { res: "Defeat", kda: "4 / 5 / 3", champ: "Sylas", score: "A-" },
          ].map((match, i) => (
            <motion.div 
              key={i}
              className={`p-4 rounded-xl flex items-center justify-between border ${match.res === 'Victory' ? 'bg-primary/10 border-primary/30' : 'bg-red-500/10 border-red-500/30'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-xl font-display font-bold">
                  {match.champ[0]}
                </div>
                <div>
                  <div className={`font-display font-bold text-xl ${match.res === 'Victory' ? 'text-primary' : 'text-red-400'}`}>
                    {match.res}
                  </div>
                  <div className="font-body text-white/60">{match.champ}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-xl">{match.kda}</div>
                <div className="font-body text-yellow-400 font-bold">{match.score}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
