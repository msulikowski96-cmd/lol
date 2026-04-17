import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sword, Shield, Zap } from 'lucide-react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-16"
      initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      >
        <h2 className="text-[4vw] font-display font-black leading-none uppercase">
          Kalkulator <span className="text-primary">Buildu</span>
        </h2>
        <p className="text-2xl font-body text-white/60 mt-4">
          Optymalny build przeciwko wybranemu składowi
        </p>
      </motion.div>

      <motion.div 
        className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
        initial={{ opacity: 0, y: 40 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="text-xl font-display font-bold uppercase text-white/50">Twój Bohater</div>
          <div className="w-16 h-16 bg-primary/20 border-2 border-primary rounded-xl flex items-center justify-center">
            <Sword className="w-8 h-8 text-primary" />
          </div>
          <div className="text-xl font-display font-bold uppercase text-white/50">Przeciwnicy</div>
        </div>

        <div className="grid grid-cols-6 gap-4 mb-10">
          <div className="col-span-1 border-r border-white/10 pr-4 flex items-center justify-center">
            <div className="font-display font-bold text-2xl text-primary">OPTYMALNE</div>
          </div>
          
          {[1, 2, 3, 4, 5].map((item, i) => (
            <motion.div 
              key={i}
              className="aspect-square bg-white/10 border border-white/20 rounded-xl relative overflow-hidden flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={phase >= 3 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ type: "spring", delay: i * 0.15 }}
            >
              {i % 2 === 0 ? <Shield className="w-10 h-10 text-white/40" /> : <Zap className="w-10 h-10 text-white/40" />}
              
              {/* Shine effect */}
              <motion.div 
                className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -rotate-45 translate-x-[-100%]"
                animate={phase >= 3 ? { translateX: ['-100%', '100%'] } : {}}
                transition={{ duration: 1.5, delay: i * 0.15 + 0.5, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center font-display font-bold text-3xl tracking-widest uppercase text-white"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
          transition={{ delay: 1 }}
        >
          NEXUS SIGHT
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
