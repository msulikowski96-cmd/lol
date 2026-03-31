import { useState, useRef, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { User, LogOut, Settings, ChevronDown, Gamepad2 } from "lucide-react";
import AccountModal from "./AccountModal";

export default function UserMenu() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading) return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: "hsl(220,15%,92%)", animation: "pulse 1.5s infinite" }} />
  );

  if (!isAuthenticated) return (
    <button
      onClick={login}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        background: "hsl(200,90%,95%)", border: "1px solid hsl(200,80%,82%)",
        borderRadius: 7, padding: "6px 12px", color: "hsl(200,90%,38%)",
        fontSize: 12, fontWeight: 700, cursor: "pointer",
        fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.04em",
      }}
    >
      <User style={{ width: 13, height: 13 }} /> Zaloguj się
    </button>
  );

  return (
    <>
      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "white", border: "1px solid hsl(220,15%,88%)",
            borderRadius: 8, padding: "4px 10px 4px 4px", cursor: "pointer",
          }}
        >
          {user?.profileImageUrl
            ? <img src={user.profileImageUrl} style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} alt="" />
            : <div style={{ width: 24, height: 24, borderRadius: 6, background: "hsl(200,90%,90%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User style={{ width: 13, height: 13, color: "hsl(200,90%,38%)" }} />
              </div>
          }
          <span style={{ fontSize: 12, fontWeight: 700, color: "hsl(220,25%,12%)", fontFamily: "'Rajdhani',sans-serif", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.firstName ?? user?.email?.split("@")[0] ?? "Konto"}
          </span>
          <ChevronDown style={{ width: 12, height: 12, color: "hsl(220,10%,55%)", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
        </button>

        {open && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
            background: "white", border: "1px solid hsl(220,15%,88%)", borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: 180, overflow: "hidden",
          }}>
            <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid hsl(220,15%,92%)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "hsl(220,25%,12%)" }}>
                {user?.firstName ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}` : "Użytkownik"}
              </div>
              {user?.email && <div style={{ fontSize: 10, color: "hsl(220,10%,55%)", marginTop: 1 }}>{user.email}</div>}
            </div>
            <button
              onClick={() => { setOpen(false); setModalOpen(true); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", width: "100%",
                background: "none", border: "none", cursor: "pointer", fontSize: 12,
                color: "hsl(220,25%,12%)", fontWeight: 600,
              }}
            >
              <Gamepad2 style={{ width: 13, height: 13, color: "hsl(200,90%,38%)" }} />
              Moje konta LoL
            </button>
            <button
              onClick={() => { setOpen(false); logout(); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", width: "100%",
                background: "none", border: "none", borderTop: "1px solid hsl(220,15%,92%)",
                cursor: "pointer", fontSize: 12, color: "hsl(350,65%,48%)", fontWeight: 600,
              }}
            >
              <LogOut style={{ width: 13, height: 13 }} />
              Wyloguj się
            </button>
          </div>
        )}
      </div>

      <AccountModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
