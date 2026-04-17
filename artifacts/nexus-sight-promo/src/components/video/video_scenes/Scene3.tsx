import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BrainCircuit, Zap, ShieldAlert } from 'lucide-react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 3600),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-16"
      initial={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center mb-12">
        <motion.h2 
          className="text-[5vw] font-display font-black leading-none uppercase"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          Analiza <span className="text-primary">AI</span>
        </motion.h2>
        <motion.p 
          className="text-2xl font-body text-white/60 mt-4"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          22 autorskie algorytmy. Archetyp gracza. Wskaźnik tiltu.
        </motion.p>
      </div>

      <div className="flex gap-8 w-full max-w-6xl">
        <motion.div 
          className="flex-1 bg-white/5 border border-primary/30 rounded-3xl p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <BrainCircuit className="w-32 h-32 text-primary" />
          </div>
          
          <div className="relative z-10">
            <div className="text-primary font-body text-xl tracking-widest uppercase mb-2">Ocena AI</div>
            <div className="text-[6rem] font-display font-black text-yellow-400 leading-none drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              S+
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg font-body text-xl inline-flex items-center gap-2">
                <Zap className="w-5 h-5" /> Agresywny Carry
              </div>
              <p className="font-body text-lg text-white/70">
                Dominuje wczesną fazę gry, doskonały farm. Rekomendacja: graj na skraju mapy w mid-game.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="w-1/3 flex flex-col gap-6"
          initial={{ opacity: 0, x: 30 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <ShieldAlert className="w-10 h-10 text-red-400 mb-3" />
            <div className="text-red-400 font-body text-lg uppercase tracking-wider">Wskaźnik Tiltu</div>
            <div className="text-4xl font-display font-bold text-white mt-1">Niski</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-white/50 font-body text-sm uppercase tracking-wider mb-4">Główne atuty</div>
            <div className="space-y-3">
              {['Wizja', 'Farm', 'Teamfighty'].map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-primary h-full"
                      initial={{ width: 0 }}
                      animate={phase >= 3 ? { width: `${80 + Math.random() * 15}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  </div>
                  <div className="font-body text-sm text-white/80 w-24">{skill}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
