import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ChevronRight, Swords } from "lucide-react";

const REGIONS = [
  "EUW1", "NA1", "KR", "EUN1", "BR1", "LA1", "LA2", "OC1", "TR1", "RU", "JP1", "PH2", "SG2", "TW2", "TH2", "VN2"
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [region, setRegion] = useState("EUW1");
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !tagLine) return;
    
    // Clean inputs
    const cleanName = encodeURIComponent(gameName.trim());
    const cleanTag = encodeURIComponent(tagLine.trim().replace(/^#/, ''));
    
    setLocation(`/profile/${region}/${cleanName}/${cleanTag}`);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/80 z-10" />
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Hextech Atmosphere" 
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        />
      </div>

      <div className="z-10 w-full max-w-3xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Swords className="w-10 h-10 text-primary" />
            <h1 className="text-5xl md:text-7xl text-gradient-gold">NEXUS SIGHT</h1>
          </div>
          <p className="text-muted-foreground text-lg md:text-xl font-light tracking-wide max-w-xl mx-auto">
            Unveil player statistics, analyze match history, and scout your next opponent in the Rift.
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSearch}
          className="w-full glass-panel rounded-2xl p-2 pl-4 flex flex-col md:flex-row items-center gap-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300 hover:shadow-primary/10"
        >
          <div className="flex w-full md:w-auto items-center">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent text-foreground border-none focus:ring-0 cursor-pointer font-medium outline-none py-3"
            >
              {REGIONS.map(r => (
                <option key={r} value={r} className="bg-card text-foreground">{r}</option>
              ))}
            </select>
            <div className="w-px h-8 bg-border mx-3 hidden md:block" />
          </div>

          <div className="flex-1 flex w-full items-center">
            <Search className="w-5 h-5 text-muted-foreground ml-2 mr-3" />
            <input
              type="text"
              placeholder="Game Name"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:ring-0 outline-none py-3 text-lg"
              required
            />
            <span className="text-muted-foreground font-light text-xl mx-1">#</span>
            <input
              type="text"
              placeholder="TAG"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              className="w-24 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:ring-0 outline-none py-3 text-lg"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto mt-2 md:mt-0 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-yellow-600 text-primary-foreground font-bold font-display tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center justify-center group"
          >
            Inspect
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex gap-4 text-sm text-muted-foreground/60"
        >
          <span>Supported Regions: EUW, NA, KR, and more</span>
          <span>•</span>
          <span>Live API Data</span>
        </motion.div>
      </div>
    </div>
  );
}
