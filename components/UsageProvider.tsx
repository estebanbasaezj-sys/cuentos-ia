"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { UsageInfo } from "@/types";

interface UsageContextType {
  usage: UsageInfo | null;
  loading: boolean;
  refresh: () => void;
}

const UsageContext = createContext<UsageContextType>({
  usage: null,
  loading: true,
  refresh: () => {},
});

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data) => { setUsage(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <UsageContext.Provider value={{ usage, loading, refresh }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  return useContext(UsageContext);
}
