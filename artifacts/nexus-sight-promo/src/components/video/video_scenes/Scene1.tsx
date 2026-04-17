import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8"
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -60, scale: 0.92, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h1
        className="text-[13vw] font-display font-black leading-none text-center tracking-tighter uppercase mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        Sprawdź<br />swoje<br />
        <span className="text-primary">statystyki</span>
      </motion.h1>

      <motion.p
        className="text-[4.5vw] font-body text-white/50 text-center mb-10"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        Wszystkie regiony. Darmowo.
      </motion.p>

      <motion.div
        className="relative w-full bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-md mb-8"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Search className="w-7 h-7 text-primary ml-1 flex-shrink-0" />
        <div className="flex-1 font-body text-[5vw] text-white/50 tracking-wide">
          Faker#KR1
        </div>
        <div className="bg-primary px-5 py-3 rounded-xl flex items-center justify-center flex-shrink-0">
          <ChevronRight className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-3 justify-center"
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {['EUW', 'EUNE', 'NA', 'KR', 'BR'].map((r) => (
          <div key={r} className={`px-5 py-2 rounded-full border font-body text-[4vw] ${r === 'EUW' ? 'border-primary/40 text-primary/90 bg-primary/10' : 'border-white/10 text-white/40 bg-white/5'}`}>
            {r}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
