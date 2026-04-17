import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BrainCircuit, Zap, ShieldAlert } from 'lucide-react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 5000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-7"
      initial={{ opacity: 0, scale: 1.15, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 80, scale: 0.92 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="w-full text-center mb-7"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-[11vw] font-display font-black leading-none uppercase">
          Analiza <span className="text-primary">AI</span>
        </h2>
        <p className="text-[4vw] font-body text-white/50 mt-2">
          22 algorytmy · Archetyp · Tilt
        </p>
      </motion.div>

      <motion.div
        className="w-full bg-white/5 border border-primary/30 rounded-3xl p-6 relative overflow-hidden mb-5"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BrainCircuit className="w-28 h-28 text-primary" />
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div>
            <div className="text-primary font-body text-[3.5vw] tracking-widest uppercase mb-1">Ocena AI</div>
            <div className="text-[22vw] font-display font-black text-yellow-400 leading-none drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
              S+
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg font-body text-[4vw] inline-flex items-center gap-2">
              <Zap className="w-4 h-4" /> Agresywny Carry
            </div>
            <p className="font-body text-[3.5vw] text-white/60">
              Dominuje wczesną fazę. Rekomendacja: graj skrzydłem w mid-game.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="w-full flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex flex-col items-center justify-center text-center flex-1">
          <ShieldAlert className="w-8 h-8 text-red-400 mb-2" />
          <div className="text-red-400 font-body text-[3.5vw] uppercase tracking-wider">Wskaźnik Tiltu</div>
          <div className="text-[8vw] font-display font-bold text-white">Niski</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex-1">
          <div className="text-white/50 font-body text-[3vw] uppercase tracking-wider mb-4">Atuty</div>
          <div className="space-y-3">
            {[['Wizja', 92], ['Farm', 87], ['Teamfighty', 78]].map(([skill, val], i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <div className="font-body text-[3.5vw] text-white/80">{skill}</div>
                  <div className="font-body text-[3.5vw] text-primary">{val}%</div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-primary h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={phase >= 3 ? { width: `${val}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
