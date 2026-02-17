"use client";

import Link from "next/link";
import { Crown, Sparkles, Clock } from "lucide-react";
import { useUsage } from "@/components/UsageProvider";

export default function CreditCounter() {
  const { usage } = useUsage();

  if (!usage) return null;

  if (usage.planType === "premium") {
    return (
      <Link
        href="/perfil"
        className="badge-premium hover:shadow-colored transition-all duration-200"
      >
        <Crown className="w-3.5 h-3.5" />
        <span>{usage.totalCreditsAvailable} cr</span>
      </Link>
    );
  }

  return (
    <Link
      href="/perfil"
      className={`badge hover:shadow-sm transition-all duration-200 ${
        usage.freeRemaining > 0
          ? "badge-success"
          : "badge-warning"
      }`}
    >
      {usage.freeRemaining > 0 ? (
        <Sparkles className="w-3.5 h-3.5" />
      ) : (
        <Clock className="w-3.5 h-3.5" />
      )}
      <span>
        {usage.freeRemaining > 0
          ? `${usage.freeRemaining} gratis`
          : "Limite alcanzado"}
      </span>
    </Link>
  );
}
