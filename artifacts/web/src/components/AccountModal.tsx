import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Gamepad2, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLinkedAccounts } from "@/lib/useLinkedAccounts";
import { Link } from "wouter";

const REGIONS = [
  "EUW1", "NA1", "KR", "EUN1", "BR1", "LA1", "LA2", "OC1", "TR1", "RU", "JP1", "PH2", "SG2", "TW2", "TH2", "VN2"
];

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AccountModal({ open, onClose }: Props) {
  const { isAuthenticated } = useAuth();
  const { accounts, loading, addAccount, removeAccount } = useLinkedAccounts(isAuthenticated);

  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState("EUW1");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!gameName.trim() || !tagLine.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await addAccount(gameName.trim(), tagLine.trim(), region);
      setGameName(""); setTagLine(""); setShowForm(false);
    } catch (err: any) {
      setError(err.message ?? "Błąd dodawania konta");
    } finally {
      setAdding(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              zIndex: 201, width: "min(440px, 94vw)",
              background: "white", borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid hsl(220,15%,88%)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 12px", borderBottom: "1px solid hsl(220,15%,92%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "hsl(200,90%,95%)", border: "1px solid hsl(200,80%,82%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Gamepad2 style={{ width: 15, height: 15, color: "hsl(200,90%,38%)" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "hsl(220,25%,12%)", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.02em" }}>Moje konta LoL</div>
                  <div style={{ fontSize: 10, color: "hsl(220,10%,55%)" }}>Przypisane do twojego konta Nexus Sight</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(220,10%,55%)", padding: 4 }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "14px 18px 18px" }}>
              {/* Accounts list */}
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
                  <Loader2 style={{ width: 20, height: 20, color: "hsl(200,90%,38%)", animation: "spin 1s linear infinite" }} />
                </div>
              ) : accounts.length === 0 && !showForm ? (
                <div style={{ textAlign: "center", padding: "16px 0 8px", color: "hsl(220,10%,55%)", fontSize: 13 }}>
                  Nie masz jeszcze przypisanego konta LoL.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: accounts.length > 0 ? 10 : 0 }}>
                  {accounts.map((acc) => (
                    <div key={acc.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 12px", borderRadius: 9,
                      background: "hsl(200,90%,97%)", border: "1px solid hsl(200,80%,86%)",
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "hsl(220,25%,12%)", fontFamily: "'Rajdhani',sans-serif" }}>
                          {acc.gameName}
                        </span>
                        <span style={{ fontSize: 12, color: "hsl(220,10%,55%)" }}>
                          #{acc.tagLine}
                        </span>
                        <span style={{
                          marginLeft: 6, fontSize: 9, fontWeight: 700, padding: "1px 5px",
                          background: "white", border: "1px solid hsl(200,80%,82%)",
                          borderRadius: 4, color: "hsl(200,90%,38%)", fontFamily: "'Rajdhani',sans-serif",
                        }}>
                          {acc.region}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <Link href={`${BASE_URL}/profile/${acc.region}/${encodeURIComponent(acc.gameName)}/${encodeURIComponent(acc.tagLine)}`}>
                          <button onClick={onClose} style={{ background: "none", border: "1px solid hsl(200,80%,82%)", borderRadius: 6, padding: "3px 7px", cursor: "pointer", color: "hsl(200,90%,38%)" }}>
                            <ExternalLink style={{ width: 11, height: 11 }} />
                          </button>
                        </Link>
                        <button
                          onClick={() => removeAccount(acc.id)}
                          style={{ background: "none", border: "1px solid hsl(350,55%,82%)", borderRadius: 6, padding: "3px 7px", cursor: "pointer", color: "hsl(350,65%,48%)" }}
                        >
                          <Trash2 style={{ width: 11, height: 11 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add form */}
              {showForm ? (
                <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "hsl(350,50%,97%)", border: "1px solid hsl(350,55%,82%)", borderRadius: 8, fontSize: 12, color: "hsl(350,65%,48%)" }}>
                      <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />{error}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ flex: 1, background: "hsl(220,15%,97%)", border: "1px solid hsl(220,15%,88%)", borderRadius: 8, display: "flex", alignItems: "center", padding: "0 8px" }}>
                      <input
                        value={gameName} onChange={e => setGameName(e.target.value)}
                        placeholder="Nazwa gracza"
                        style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "hsl(220,25%,12%)", padding: "8px 0", fontFamily: "inherit" }}
                        required
                      />
                      <span style={{ color: "hsl(220,15%,70%)", fontWeight: 300, fontSize: 16 }}>#</span>
                      <input
                        value={tagLine} onChange={e => setTagLine(e.target.value)}
                        placeholder="TAG"
                        style={{ width: 55, background: "none", border: "none", outline: "none", fontSize: 13, color: "hsl(200,90%,38%)", padding: "8px 4px", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}
                        required
                      />
                    </div>
                    <select
                      value={region} onChange={e => setRegion(e.target.value)}
                      style={{ background: "hsl(220,15%,97%)", border: "1px solid hsl(220,15%,88%)", borderRadius: 8, padding: "0 8px", fontSize: 12, fontWeight: 700, color: "hsl(200,90%,38%)", fontFamily: "'Rajdhani',sans-serif", cursor: "pointer" }}
                    >
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" onClick={() => { setShowForm(false); setError(null); }} style={{ flex: 1, padding: "8px", border: "1px solid hsl(220,15%,88%)", borderRadius: 8, background: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "hsl(220,10%,55%)", fontFamily: "'Rajdhani',sans-serif" }}>
                      Anuluj
                    </button>
                    <button type="submit" disabled={adding} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, background: "hsl(200,90%,38%)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'Rajdhani',sans-serif", opacity: adding ? 0.7 : 1 }}>
                      {adding ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <Plus style={{ width: 12, height: 12 }} />}
                      {adding ? "Dodawanie..." : "Dodaj"}
                    </button>
                  </div>
                </form>
              ) : accounts.length < 5 && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    width: "100%", padding: "9px", border: "1px dashed hsl(200,80%,78%)", borderRadius: 9,
                    background: "hsl(200,90%,98%)", color: "hsl(200,90%,38%)", cursor: "pointer",
                    fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 5, fontFamily: "'Rajdhani',sans-serif",
                  }}
                >
                  <Plus style={{ width: 13, height: 13 }} />
                  Dodaj konto LoL
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
