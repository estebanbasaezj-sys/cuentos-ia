"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Coins, Clock, X } from "lucide-react";
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
  premium_narration: {
    title: "Narracion Premium",
    description: "La narracion de cuentos con voces de IA esta disponible exclusivamente para usuarios Premium.",
  },
  daily_limit: {
    title: "Limite diario alcanzado",
    description: "Has alcanzado el maximo de 3 cuentos por dia. Vuelve manana para crear mas historias.",
  },
  monthly_limit: {
    title: "Limite mensual alcanzado",
    description: "Has alcanzado el maximo de 15 cuentos este mes. Tu limite se reinicia el proximo mes.",
  },
};

export default function Paywall({ gate, onClose }: PaywallProps) {
  const reason = gate.reason || "premium_feature";
  const msg = REASON_MESSAGES[reason] || REASON_MESSAGES.premium_feature;
  const isTopup = gate.paywallType === "topup";
  const isInfo = gate.paywallType === "info";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="card max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="icon-container-lg mx-auto mb-4" style={
              isTopup
                ? { background: "linear-gradient(135deg, #f59e0b, #d97706)" }
                : isInfo
                  ? { background: "linear-gradient(135deg, #6366f1, #4f46e5)" }
                  : undefined
            }>
              {isTopup ? (
                <Coins className="w-9 h-9" />
              ) : isInfo ? (
                <Clock className="w-9 h-9" />
              ) : (
                <Crown className="w-9 h-9" />
              )}
            </div>
            <h2 className="text-xl font-display font-bold text-brand-800 mb-2">{msg.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{msg.description}</p>
          </div>

          <div className="space-y-3">
            {isInfo ? (
              <button
                onClick={onClose}
                className="btn-primary w-full"
              >
                Entendido
              </button>
            ) : isTopup ? (
              <>
                <Link
                  href="/precios#topup"
                  className="btn-primary w-full text-center block"
                >
                  Comprar creditos
                </Link>
                <button
                  onClick={onClose}
                  className="btn-secondary w-full"
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/precios"
                  className="btn-primary w-full text-center block"
                >
                  Ver planes Premium
                </Link>
                <button
                  onClick={onClose}
                  className="btn-secondary w-full"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
