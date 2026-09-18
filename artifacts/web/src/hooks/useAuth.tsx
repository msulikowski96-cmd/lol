import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { authApi, type AuthUser, type UsageInfo } from "@/lib/auth-api";
import {
  auth as firebaseAuth,
  googleProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  syncUserDoc,
  onAuthStateChanged,
  type FirebaseUser,
} from "@/lib/firebase";

interface AuthContextValue {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  usage: UsageInfo | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me.user);
      setUsage(me.usage);
    } catch {
      setUser(null);
      setUsage(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          await syncUserDoc(fUser);
        } catch (e) {
          console.warn("[Firebase] syncUserDoc error:", e);
        }
      }
    });

    void (async () => {
      await refresh();
      setLoading(false);
    })();

    return () => unsubscribe();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setUser(res.user);
    await refresh();
  }, [refresh]);

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(firebaseAuth, googleProvider);
    if (cred.user) {
      setFirebaseUser(cred.user);
      await syncUserDoc(cred.user);
      if (cred.user.email) {
        const res = await authApi.loginWithFirebase(
          cred.user.email,
          cred.user.displayName || undefined
        );
        setUser(res.user);
      }
      await refresh();
    }
  }, [refresh]);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    const res = await authApi.register(email, password, displayName);
    setUser(res.user);
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch {}
    try {
      await authApi.logout();
    } catch {}
    setUser(null);
    setFirebaseUser(null);
    setUsage(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        usage,
        loading,
        refresh,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
