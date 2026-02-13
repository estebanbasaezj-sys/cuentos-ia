"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { UsageInfo } from "@/types";

export default function CreditCounter() {
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  if (!usage) return null;

  if (usage.planType === "premium") {
    return (
      <Link
        href="/perfil"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200 transition-colors"
      >
        <span>⭐</span>
        <span>{usage.totalCreditsAvailable} cr</span>
      </Link>
    );
  }

  return (
    <Link
      href="/perfil"
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity ${
        usage.freeRemaining > 0
          ? "bg-green-100 text-green-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      <span>{usage.freeRemaining > 0 ? "✨" : "⏳"}</span>
      <span>
        {usage.freeRemaining > 0
          ? `${usage.freeRemaining} gratis`
          : "Limite alcanzado"}
      </span>
    </Link>
  );
}
