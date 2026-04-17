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
      setTimeout(() => setPhase(4), 3200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full max-w-4xl px-8 flex flex-col items-center">
        <motion.h1 
          className="text-[6vw] font-display font-black leading-none text-center tracking-tighter uppercase mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Sprawdź swoje <br/>
          <span className="text-primary">statystyki</span>
        </motion.h1>

        <motion.div 
          className="relative w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Search className="w-8 h-8 text-primary ml-2" />
          <div className="flex-1 font-body text-3xl text-white/50 tracking-wide">
            Faker#KR1
          </div>
          <div className="bg-primary px-6 py-3 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        <motion.div 
          className="flex gap-4 mt-8"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="px-6 py-2 rounded-full border border-primary/30 text-primary/80 font-body text-xl bg-primary/5">
            EUW
          </div>
          <div className="px-6 py-2 rounded-full border border-white/10 text-white/50 font-body text-xl bg-white/5">
            EUNE
          </div>
          <div className="px-6 py-2 rounded-full border border-white/10 text-white/50 font-body text-xl bg-white/5">
            NA
          </div>
          <div className="px-6 py-2 rounded-full border border-white/10 text-white/50 font-body text-xl bg-white/5">
            KR
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
