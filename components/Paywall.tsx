"use client";

import Link from "next/link";
import type { GateResult } from "@/types";

interface PaywallProps {
  gate: GateResult;
  onClose: () => void;
}

const REASON_MESSAGES: Record<string, { title: string; description: string }> = {
  weekly_limit: {
    title: "Limite semanal alcanzado",
    description: "Ya usaste tu cuento gratuito de esta semana. Upgrade a Premium para crear cuentos ilimitados.",
  },
  premium_length: {
    title: "Largo Premium",
    description: "Los cuentos medios y largos estan disponibles en el plan Premium.",
  },
  premium_style: {
    title: "Estilo Premium",
    description: "Este estilo de ilustracion esta disponible en el plan Premium.",
  },
  insufficient_credits: {
    title: "Creditos insuficientes",
    description: "No tienes suficientes creditos para esta accion. Compra un pack de creditos para continuar.",
  },
  premium_feature: {
    title: "Funcion Premium",
    description: "Esta funcion esta disponible exclusivamente para usuarios Premium.",
  },
  library_limit: {
    title: "Biblioteca llena",
    description: "Has alcanzado el limite de 10 cuentos en tu biblioteca. Upgrade a Premium para almacenar cuentos ilimitados.",
  },
};

export default function Paywall({ gate, onClose }: PaywallProps) {
  const reason = gate.reason || "premium_feature";
  const msg = REASON_MESSAGES[reason] || REASON_MESSAGES.premium_feature;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">
            {gate.paywallType === "topup" ? "💰" : "⭐"}
          </div>
          <h2 className="text-xl font-bold text-purple-800 mb-2">{msg.title}</h2>
          <p className="text-gray-600 text-sm">{msg.description}</p>
        </div>

        <div className="space-y-3">
          {gate.paywallType === "topup" ? (
            <Link
              href="/precios#topup"
              className="btn-primary w-full text-center block"
            >
              Comprar creditos
            </Link>
          ) : (
            <Link
              href="/precios"
              className="btn-primary w-full text-center block"
            >
              Ver planes Premium
            </Link>
          )}
          <button
            onClick={onClose}
            className="btn-secondary w-full"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
