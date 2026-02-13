"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { UsageInfo } from "@/types";

const FEATURES_FREE = [
  "1 cuento por semana",
  "2 estilos de ilustracion",
  "Cuentos cortos (4 paginas)",
  "Biblioteca hasta 10 cuentos",
  "PDF con marca de agua",
];

const FEATURES_PREMIUM = [
  "Cuentos ilimitados",
  "5 estilos de ilustracion",
  "Cuentos cortos, medios y largos",
  "Biblioteca ilimitada",
  "PDF sin marca de agua",
  "Imagenes en alta calidad",
  "60 creditos mensuales incluidos",
];

const TOPUP_PACKS = [
  { id: "pack_30", credits: 30, price: "$2.990", description: "Perfecto para 1 cuento" },
  { id: "pack_80", credits: 80, price: "$6.990", description: "3-4 cuentos aprox." },
  { id: "pack_200", credits: 200, price: "$14.990", description: "Mejor valor - 6+ cuentos" },
];

export default function PreciosPage() {
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  const isPremium = usage?.planType === "premium";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-purple-800 mb-3">Planes y precios</h1>
        <p className="text-gray-500">Elige el plan que mejor se adapte a tu familia</p>
      </div>

      {/* Plans comparison */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Free plan */}
        <div className="card border-2 border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-700">Plan Gratuito</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">$0</p>
            <p className="text-sm text-gray-500">Para siempre</p>
          </div>
          <ul className="space-y-3 mb-6">
            {FEATURES_FREE.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
          {!isPremium && (
            <div className="text-center text-sm text-gray-400 font-medium py-2">
              Tu plan actual
            </div>
          )}
        </div>

        {/* Premium plan */}
        <div className="card border-2 border-purple-400 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
            Recomendado
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-purple-700">Plan Premium</h2>
            <p className="text-3xl font-bold text-purple-800 mt-2">
              $4.990 <span className="text-base font-normal text-gray-500">/mes</span>
            </p>
            <p className="text-sm text-gray-500">o $39.990/ano (ahorra 33%)</p>
          </div>
          <ul className="space-y-3 mb-6">
            {FEATURES_PREMIUM.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-purple-500 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
          {isPremium ? (
            <div className="text-center text-sm text-purple-600 font-medium py-2">
              Tu plan actual
            </div>
          ) : (
            <button
              className="btn-primary w-full"
              onClick={() => alert("Pagos con Stripe estaran disponibles proximamente.")}
            >
              Suscribirme a Premium
            </button>
          )}
        </div>
      </div>

      {/* Top-up packs */}
      <div id="topup" className="mb-12">
        <h2 className="text-2xl font-bold text-purple-800 text-center mb-2">Packs de creditos</h2>
        <p className="text-gray-500 text-center mb-8">Para usuarios Premium que necesitan mas creditos</p>

        <div className="grid md:grid-cols-3 gap-4">
          {TOPUP_PACKS.map((pack) => (
            <div key={pack.id} className="card text-center">
              <p className="text-3xl font-bold text-purple-700 mb-1">{pack.credits}</p>
              <p className="text-sm text-gray-500 mb-3">creditos</p>
              <p className="text-xl font-bold text-gray-800 mb-1">{pack.price}</p>
              <p className="text-xs text-gray-400 mb-4">{pack.description}</p>
              <button
                className="btn-secondary w-full text-sm"
                disabled={!isPremium}
                onClick={() => alert("Pagos con Stripe estaran disponibles proximamente.")}
              >
                {isPremium ? "Comprar" : "Solo Premium"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <h2 className="text-xl font-bold text-purple-700 mb-4">Preguntas frecuentes</h2>
        <div className="space-y-4">
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-700">Que son los creditos?</summary>
            <p className="mt-2 text-sm text-gray-500 pl-4">
              Los creditos se usan para generar cuentos en el plan Premium. Cada cuento consume creditos
              por el texto (5 cr) y las imagenes (8-12 cr cada una). Un cuento corto cuesta aprox. 37 creditos.
            </p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-700">Puedo cancelar mi suscripcion?</summary>
            <p className="mt-2 text-sm text-gray-500 pl-4">
              Si, puedes cancelar en cualquier momento. Tu plan Premium seguira activo hasta el fin del periodo pagado.
            </p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-700">Los creditos comprados expiran?</summary>
            <p className="mt-2 text-sm text-gray-500 pl-4">
              Los creditos comprados no expiran mientras mantengas tu suscripcion Premium activa.
              Los creditos mensuales se renuevan cada mes.
            </p>
          </details>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/crear" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
          ← Volver a crear cuento
        </Link>
      </div>
    </div>
  );
}
