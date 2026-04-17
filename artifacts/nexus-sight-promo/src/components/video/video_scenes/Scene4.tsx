import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

const LANES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 5000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-7"
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="flex items-center gap-3 mb-7"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-red-500 rounded-full p-2 animate-pulse flex-shrink-0">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-[10vw] font-display font-black leading-none uppercase">
          Live <span className="text-primary">Game</span>
        </h2>
      </motion.div>

      {/* Blue Team */}
      <motion.div
        className="w-full mb-4"
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="font-display font-bold text-[4vw] text-primary uppercase tracking-wider mb-2 text-center">
          Niebieska Drużyna
        </div>
        <div className="flex flex-col gap-2">
          {LANES.map((lane, i) => (
            <motion.div
              key={`b${i}`}
              className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center justify-between"
              initial={{ opacity: 0, x: -25 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -25 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/20 rounded border border-primary/30 flex items-center justify-center font-display font-bold text-[3.5vw] text-primary flex-shrink-0">
                  {lane[0]}
                </div>
                <div>
                  <div className="font-body text-[3.5vw] text-white/50">{lane}</div>
                  <div className="font-body text-[4vw]">Gracz {i + 1}</div>
                </div>
              </div>
              <div className="text-primary font-display font-bold text-[4vw]">Diamond</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* VS Divider */}
      <motion.div
        className="font-display font-black text-[10vw] text-white/15 italic my-2"
        initial={{ opacity: 0, scale: 0 }}
        animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        VS
      </motion.div>

      {/* Red Team */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="font-display font-bold text-[4vw] text-red-400 uppercase tracking-wider mb-2 text-center">
          Czerwona Drużyna
        </div>
        <div className="flex flex-col gap-2">
          {LANES.map((lane, i) => (
            <motion.div
              key={`r${i}`}
              className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between"
              initial={{ opacity: 0, x: 25 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 25 }}
              transition={{ delay: i * 0.08 + 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-500/20 rounded border border-red-500/30 flex items-center justify-center font-display font-bold text-[3.5vw] text-red-400 flex-shrink-0">
                  {lane[0]}
                </div>
                <div>
                  <div className="font-body text-[3.5vw] text-white/50">{lane}</div>
                  <div className="font-body text-[4vw]">Wróg {i + 1}</div>
                </div>
              </div>
              <div className="text-red-400 font-display font-bold text-[4vw]">Gold</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
