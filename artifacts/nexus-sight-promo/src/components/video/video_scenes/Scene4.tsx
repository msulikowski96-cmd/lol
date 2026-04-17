import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 3200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-16"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full max-w-5xl">
        <motion.div 
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-red-500 rounded-full p-2 animate-pulse">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-[3.5vw] font-display font-black leading-none uppercase text-white">
            Live <span className="text-primary">Game</span>
          </h2>
        </motion.div>

        <div className="flex justify-between gap-12 relative">
          {/* VS Divider */}
          <motion.div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-black text-4xl text-white/20 italic"
            initial={{ opacity: 0, scale: 0 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            VS
          </motion.div>

          {/* Blue Team */}
          <div className="flex-1 space-y-3">
            <motion.div 
              className="font-display font-bold text-xl text-primary uppercase tracking-wider mb-4"
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            >
              Niebieska Drużyna
            </motion.div>
            
            {[1, 2, 3, 4, 5].map((player, i) => (
              <motion.div 
                key={`b${i}`}
                className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between"
                initial={{ opacity: 0, x: -30 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded border border-primary/30 flex items-center justify-center font-display font-bold">
                    C
                  </div>
                  <div className="font-body text-lg">Gracz {player}</div>
                </div>
                <div className="text-primary font-display font-bold text-lg">Diamond</div>
              </motion.div>
            ))}
          </div>

          {/* Red Team */}
          <div className="flex-1 space-y-3">
            <motion.div 
              className="font-display font-bold text-xl text-red-400 uppercase tracking-wider mb-4 text-right"
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            >
              Czerwona Drużyna
            </motion.div>
            
            {[1, 2, 3, 4, 5].map((player, i) => (
              <motion.div 
                key={`r${i}`}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-between flex-row-reverse"
                initial={{ opacity: 0, x: 30 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className="w-10 h-10 bg-red-500/20 rounded border border-red-500/30 flex items-center justify-center font-display font-bold text-red-400">
                    C
                  </div>
                  <div className="font-body text-lg">Przeciwnik {player}</div>
                </div>
                <div className="text-red-400 font-display font-bold text-lg">Diamond</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
