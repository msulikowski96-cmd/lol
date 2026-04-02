import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Swords, ChevronRight, RotateCcw, Info } from "lucide-react";
import { getDDBase, getDDVersion } from "@/lib/constants";
import {
  calculateBuild,
  CLASS_LABEL,
  getChampProfile,
  type BuildResult,
  type ItemRec,
} from "@/lib/buildAlgorithm";

interface ChampEntry {
  id: string;
  name: string;
}

const RUNE_PATH_IMG = (icon: string) =>
  `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${icon}.png`;

function ItemIcon({ item, size = 36 }: { item: ItemRec; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="relative group flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {!err ? (
        <img
          src={`${getDDBase()}/item/${item.id}.png`}
          alt={item.name}
          className="rounded-md object-cover border border-border"
          style={{ width: size, height: size }}
          onError={() => setErr(true)}
        />
      ) : (
        <div
          className="rounded-md flex items-center justify-center text-[8px] text-muted-foreground bg-muted border border-border text-center leading-tight p-0.5"
          style={{ width: size, height: size }}
        >
          {item.name.slice(0, 6)}
        </div>
      )}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          className="text-[10px] whitespace-nowrap rounded-md px-2 py-1 shadow-xl"
          style={{ background: "hsl(220,20%,10%)", color: "white", border: "1px solid hsl(220,15%,25%)" }}
        >
          <p className="font-bold">{item.name}</p>
          {item.reason && <p className="text-[9px] opacity-70 max-w-[160px] whitespace-normal">{item.reason}</p>}
        </div>
      </div>
    </div>
  );
}

function RuneIcon({ imgPath, name, size = 32 }: { imgPath: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div className="relative group flex-shrink-0" style={{ width: size, height: size }}>
      {!err ? (
        <img
          src={imgPath}
          alt={name}
          className="object-contain"
          style={{ width: size, height: size }}
          onError={() => setErr(true)}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center text-[8px] text-muted-foreground bg-muted border border-border text-center"
          style={{ width: size, height: size }}
        >
          R
        </div>
      )}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          className="text-[10px] whitespace-nowrap rounded-md px-2 py-1 shadow-xl"
          style={{ background: "hsl(220,20%,10%)", color: "white", border: "1px solid hsl(220,15%,25%)" }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}

function ChampionPickerModal({
  allChampions,
  selected,
  onSelect,
  onClose,
  title,
}: {
  allChampions: ChampEntry[];
  selected: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  title: string;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const filtered = allChampions.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "white", border: "1px solid hsl(220,15%,85%)", maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, color: "hsl(220,25%,12%)" }}>
              {title}
            </p>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj bohatera..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: "hsl(220,15%,96%)", border: "1px solid hsl(220,15%,88%)" }}
            />
          </div>
        </div>
        <div
          className="overflow-y-auto p-3"
          style={{ maxHeight: "55vh" }}
        >
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
            {filtered.map((champ) => (
              <button
                key={champ.id}
                onClick={() => { onSelect(champ.id); onClose(); }}
                className="flex flex-col items-center gap-1 p-1 rounded-lg transition-all hover:bg-muted group"
                style={selected === champ.id ? { background: "hsl(200,90%,90%)", outline: "2px solid hsl(200,90%,50%)" } : {}}
              >
                <img
                  src={`${getDDBase()}/champion/${champ.id}.png`}
                  alt={champ.name}
                  className="w-10 h-10 rounded-lg border border-border group-hover:border-primary/30 transition-colors object-cover"
                  onError={(e) => { e.currentTarget.src = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png"; }}
                />
                <span className="text-[8px] text-center leading-tight text-muted-foreground group-hover:text-foreground transition-colors truncate w-full">{champ.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-7 py-8 text-center text-sm text-muted-foreground">
                Nie znaleziono bohatera "{query}"
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ChampSlot({
  label,
  championId,
  allChampions,
  onSelect,
  small,
}: {
  label: string;
  championId: string | null;
  allChampions: ChampEntry[];
  onSelect: (id: string) => void;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const champ = allChampions.find((c) => c.id === championId);
  const sz = small ? 40 : 52;

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => setOpen(true)}
          className="relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 flex-shrink-0"
          style={{
            width: sz, height: sz,
            borderColor: championId ? "hsl(200,70%,50%)" : "hsl(220,15%,82%)",
            background: championId ? "transparent" : "hsl(220,15%,96%)",
            boxShadow: championId ? "0 0 0 2px hsl(200,70%,85%)" : "none",
          }}
        >
          {champ ? (
            <img
              src={`${getDDBase()}/champion/${champ.id}.png`}
              alt={champ.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground/40 text-lg">+</span>
            </div>
          )}
          {champ && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(""); }}
              className="absolute top-0 right-0 w-4 h-4 rounded-bl-md flex items-center justify-center transition-colors hover:bg-red-400"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          )}
        </button>
        <span className="text-[8px] text-muted-foreground text-center leading-tight" style={{ maxWidth: sz }}>
          {champ ? champ.name : label}
        </span>
      </div>
      <AnimatePresence>
        {open && (
          <ChampionPickerModal
            allChampions={allChampions}
            selected={championId}
            onSelect={onSelect}
            onClose={() => setOpen(false)}
            title={label}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function TeamThreatBar({ label, value, max = 5, color }: { label: string; value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <div className="flex gap-1 flex-shrink-0">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{
              background: i < value ? color : "hsl(220,15%,90%)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono font-bold" style={{ color }}>{value}/{max}</span>
    </div>
  );
}

function BuildResultPanel({ result, myChampId }: { result: BuildResult; myChampId: string }) {
  const profile = getChampProfile(myChampId);
  const ta = result.teamAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-4"
    >
      <div className="rounded-xl p-4 space-y-3" style={{ background: "hsl(220,15%,97%)", border: "1px solid hsl(220,15%,88%)" }}>
        <p className="text-[9px] uppercase tracking-[0.18em] font-bold flex items-center gap-1" style={{ color: "hsl(200,90%,35%)", fontFamily: "'Rajdhani',sans-serif" }}>
          <Info className="w-3 h-3" /> Analiza Drużyny Wroga
        </p>
        <div className="space-y-1.5">
          <TeamThreatBar label="Zagrożenie AP" value={ta.apThreat} color="hsl(270,70%,55%)" />
          <TeamThreatBar label="Zagrożenie AD" value={ta.adThreat} color="hsl(30,85%,50%)" />
          <TeamThreatBar label="Tanki" value={ta.tankCount} color="hsl(200,70%,45%)" />
          <TeamThreatBar label="Squishie" value={ta.squishyCount} color="hsl(350,70%,55%)" />
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {ta.healingPresence && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: "hsl(152,50%,90%)", color: "hsl(152,55%,30%)", border: "1px solid hsl(152,40%,75%)" }}>
              ⚕ Leczenie u wroga
            </span>
          )}
          {ta.heavyCC && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: "hsl(220,60%,92%)", color: "hsl(220,70%,40%)", border: "1px solid hsl(220,50%,78%)" }}>
              ❄ Dużo CC
            </span>
          )}
          {ta.engageHeavy && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: "hsl(0,60%,94%)", color: "hsl(0,65%,42%)", border: "1px solid hsl(0,50%,80%)" }}>
              ⚡ Engage Heavy
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-4" style={{ background: "white", border: "1px solid hsl(220,15%,88%)" }}>
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-3 flex items-center gap-1" style={{ color: "hsl(200,90%,35%)", fontFamily: "'Rajdhani',sans-serif" }}>
            🗡 Buty
          </p>
          <div className="flex items-center gap-3">
            <ItemIcon item={result.boots} size={44} />
            <div>
              <p className="text-sm font-bold text-foreground/90">{result.boots.name}</p>
              <p className="text-[10px] text-muted-foreground">Dobór pod skład przeciwników</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-3 flex items-center gap-1" style={{ color: "hsl(200,90%,35%)", fontFamily: "'Rajdhani',sans-serif" }}>
            ⚔ Build główny
          </p>
          <div className="flex flex-wrap gap-2">
            {result.coreItems.map((item, i) => (
              <ItemIcon key={i} item={item} size={44} />
            ))}
          </div>
          <div className="mt-2 space-y-1">
            {result.coreItems.filter(i => i.reason).map((item, i) => (
              <p key={i} className="text-[10px] text-muted-foreground flex gap-1.5">
                <span className="flex-shrink-0 text-primary/60">→</span>
                <span><span className="font-medium text-foreground/80">{item.name}:</span> {item.reason}</span>
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-3 flex items-center gap-1" style={{ color: "hsl(200,90%,35%)", fontFamily: "'Rajdhani',sans-serif" }}>
            🛡 Itemy Sytuacyjne
          </p>
          <div className="flex flex-wrap gap-2">
            {result.situationalItems.map((item, i) => (
              <div key={i} className="relative">
                <ItemIcon item={item} size={38} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[7px] font-bold flex items-center justify-center" style={{ background: "hsl(220,15%,75%)", color: "white" }}>?</span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-1">
            {result.situationalItems.filter(i => i.reason).slice(0, 3).map((item, i) => (
              <p key={i} className="text-[10px] text-muted-foreground flex gap-1.5">
                <span className="flex-shrink-0 text-yellow-500/70">→</span>
                <span><span className="font-medium text-foreground/80">{item.name}:</span> {item.reason}</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-4" style={{ background: "linear-gradient(135deg, hsl(240,30%,97%), white)", border: "1px solid hsl(240,25%,85%)" }}>
        <p className="text-[9px] uppercase tracking-[0.18em] font-bold flex items-center gap-1" style={{ color: "hsl(240,60%,45%)", fontFamily: "'Rajdhani',sans-serif" }}>
          ✦ Runy
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src={RUNE_PATH_IMG(result.runes.primaryPath.icon)}
                alt={result.runes.primaryPath.name}
                className="w-5 h-5 object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <p className="text-[10px] font-bold text-foreground/80">{result.runes.primaryPath.name}</p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                <RuneIcon imgPath={result.runes.keystone.imgPath} name={result.runes.keystone.name} size={40} />
                <div>
                  <p className="text-[11px] font-bold text-foreground/90">{result.runes.keystone.name}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight max-w-[120px]">{result.runes.keystone.description}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {result.runes.primaryRunes.map((r, i) => (
                  <RuneIcon key={i} imgPath={r.imgPath} name={r.name} size={26} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src={RUNE_PATH_IMG(result.runes.secondaryPath.icon)}
                alt={result.runes.secondaryPath.name}
                className="w-5 h-5 object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <p className="text-[10px] font-bold text-foreground/80">{result.runes.secondaryPath.name}</p>
            </div>
            <div className="flex gap-2 flex-wrap mt-1">
              {result.runes.secondaryRunes.map((r, i) => (
                <RuneIcon key={i} imgPath={r.imgPath} name={r.name} size={30} />
              ))}
            </div>
            <div className="mt-4">
              <p className="text-[9px] text-muted-foreground mb-1.5">Fragmenty:</p>
              <div className="space-y-1">
                {result.runes.shards.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? "hsl(40,90%,55%)" : i === 1 ? "hsl(40,90%,55%)" : "hsl(200,60%,55%)" }} />
                    <span className="text-[9px] text-foreground/70">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-2" style={{ background: "hsl(220,15%,97%)", border: "1px solid hsl(220,15%,88%)" }}>
        <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-2 flex items-center gap-1" style={{ color: "hsl(200,90%,35%)", fontFamily: "'Rajdhani',sans-serif" }}>
          💡 Uzasadnienie
        </p>
        {result.reasoning.map((r, i) => (
          <p key={i} className="text-[10px] text-foreground/75 flex gap-2 leading-relaxed">
            <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-primary/50" />
            {r}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

export default function BuildCalculator() {
  const [allChampions, setAllChampions] = useState<ChampEntry[]>([]);
  const [myChamp, setMyChamp] = useState<string | null>(null);
  const [enemies, setEnemies] = useState<(string | null)[]>([null, null, null, null, null]);
  const [result, setResult] = useState<BuildResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [champLoading, setChampLoading] = useState(true);

  useEffect(() => {
    const version = getDDVersion();
    fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`)
      .then((r) => r.json())
      .then((data) => {
        const champs: ChampEntry[] = Object.values(data.data as Record<string, { id: string; name: string }>)
          .map((c) => ({ id: c.id, name: c.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setAllChampions(champs);
      })
      .catch(() => {})
      .finally(() => setChampLoading(false));
  }, []);

  const setEnemy = (index: number, id: string) => {
    setEnemies((prev) => {
      const next = [...prev];
      next[index] = id || null;
      return next;
    });
    setResult(null);
  };

  const handleCalculate = () => {
    if (!myChamp) return;
    setLoading(true);
    setTimeout(() => {
      const validEnemies = enemies.filter(Boolean) as string[];
      const res = calculateBuild(myChamp, validEnemies);
      setResult(res);
      setLoading(false);
    }, 300);
  };

  const handleReset = () => {
    setMyChamp(null);
    setEnemies([null, null, null, null, null]);
    setResult(null);
  };

  const myProfile = myChamp ? getChampProfile(myChamp) : null;
  const filledEnemies = enemies.filter(Boolean).length;
  const canCalculate = !!myChamp && filledEnemies >= 1;

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 space-y-5" style={{ background: "white", border: "1px solid hsl(220,15%,88%)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-3 flex items-center gap-1" style={{ color: "hsl(200,90%,35%)", fontFamily: "'Rajdhani',sans-serif" }}>
            <Swords className="w-3 h-3" /> Twój Bohater
          </p>
          <div className="flex items-center gap-4">
            <ChampSlot
              label="Wybierz bohatera"
              championId={myChamp}
              allChampions={allChampions}
              onSelect={(id) => { setMyChamp(id || null); setResult(null); }}
            />
            {myChamp && myProfile && (
              <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-1">
                <p className="text-sm font-bold text-foreground/90">
                  {allChampions.find(c => c.id === myChamp)?.name ?? myChamp}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(200,60%,92%)", color: "hsl(200,80%,35%)", border: "1px solid hsl(200,50%,80%)" }}>
                    {CLASS_LABEL[myProfile.class]}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{
                    background: myProfile.damageType === "AD" ? "hsl(30,80%,92%)" : myProfile.damageType === "AP" ? "hsl(270,60%,92%)" : "hsl(50,80%,90%)",
                    color: myProfile.damageType === "AD" ? "hsl(30,80%,38%)" : myProfile.damageType === "AP" ? "hsl(270,60%,40%)" : "hsl(50,80%,35%)",
                    border: `1px solid ${myProfile.damageType === "AD" ? "hsl(30,70%,78%)" : myProfile.damageType === "AP" ? "hsl(270,50%,78%)" : "hsl(50,70%,75%)"}`,
                  }}>
                    {myProfile.damageType}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-3 flex items-center gap-1" style={{ color: "hsl(0,70%,45%)", fontFamily: "'Rajdhani',sans-serif" }}>
            ⚡ Drużyna Przeciwnika <span className="text-muted-foreground normal-case tracking-normal font-normal">({filledEnemies}/5)</span>
          </p>
          {champLoading ? (
            <div className="flex gap-2">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-xl animate-pulse" style={{ background: "hsl(220,15%,92%)" }} />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {enemies.map((e, i) => (
                <ChampSlot
                  key={i}
                  label={`Przeciwnik ${i + 1}`}
                  championId={e}
                  allChampions={allChampions}
                  onSelect={(id) => setEnemy(i, id)}
                  small
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCalculate}
            disabled={!canCalculate || loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: canCalculate ? "linear-gradient(135deg, hsl(200,90%,35%), hsl(220,80%,45%))" : "hsl(220,15%,90%)",
              color: canCalculate ? "white" : "hsl(220,10%,60%)",
              fontFamily: "'Rajdhani',sans-serif",
              letterSpacing: "0.05em",
              fontSize: 13,
              cursor: canCalculate ? "pointer" : "not-allowed",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Swords className="w-4 h-4" />
            )}
            {loading ? "Analizuję..." : "Oblicz Build"}
          </button>
          {(myChamp || filledEnemies > 0 || result) && (
            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded-xl transition-all hover:bg-muted text-muted-foreground hover:text-foreground"
              style={{ border: "1px solid hsl(220,15%,88%)" }}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {!myChamp && !result && (
          <p className="text-[10px] text-muted-foreground text-center py-1">
            Wybierz swojego bohatera i co najmniej 1 wroga, aby zobaczyć rekomendacje buildu.
          </p>
        )}
      </div>

      <AnimatePresence>
        {result && myChamp && (
          <BuildResultPanel result={result} myChampId={myChamp} />
        )}
      </AnimatePresence>
    </div>
  );
}
