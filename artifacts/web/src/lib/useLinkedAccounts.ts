import { useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface LinkedAccount {
  id: string;
  userId: string;
  gameName: string;
  tagLine: string;
  region: string;
  createdAt: string;
}

export function useLinkedAccounts(isAuthenticated: boolean) {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!isAuthenticated) { setAccounts([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/user/linked-accounts`, { credentials: "include" });
      if (res.ok) setAccounts(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const addAccount = useCallback(async (gameName: string, tagLine: string, region: string) => {
    const res = await fetch(`${BASE_URL}/api/user/linked-accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ gameName, tagLine, region }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Błąd dodawania konta");
    }
    await fetchAccounts();
  }, [fetchAccounts]);

  const removeAccount = useCallback(async (id: string) => {
    await fetch(`${BASE_URL}/api/user/linked-accounts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, addAccount, removeAccount, refetch: fetchAccounts };
}
