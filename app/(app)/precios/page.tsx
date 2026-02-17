"use client";

import Link from "next/link";
import { Check, Crown, ChevronDown, Coins } from "lucide-react";
import { useUsage } from "@/components/UsageProvider";

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
  const { usage } = useUsage();

  const isPremium = usage?.planType === "premium";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-3">Planes y precios</h1>
        <p className="text-gray-500 font-heading">Elige el plan que mejor se adapte a tu familia</p>
      </div>

      {/* Plans comparison */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Free plan */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-gray-700">Plan Gratuito</h2>
            <p className="text-3xl font-display font-bold text-gray-800 mt-2">$0</p>
            <p className="text-sm text-gray-400 font-heading">Para siempre</p>
          </div>
          <ul className="space-y-3 mb-6">
            {FEATURES_FREE.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                {f}
              </li>
            ))}
          </ul>
          {!isPremium && (
            <div className="text-center text-sm text-gray-400 font-heading font-bold py-2">
              Tu plan actual
            </div>
          )}
        </div>

        {/* Premium plan */}
        <div className="gradient-border">
          <div className="card relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="badge-premium !py-1 !px-4 shadow-colored">
                <Crown className="w-3 h-3" />
                Recomendado
              </span>
            </div>
            <div className="mb-6 pt-2">
              <h2 className="text-xl font-display font-bold text-gray-800">Plan Premium</h2>
              <p className="text-3xl font-display font-bold text-brand-800 mt-2">
                $4.990 <span className="text-base font-heading font-normal text-gray-500">/mes</span>
              </p>
              <p className="text-sm text-gray-400 font-heading">o $39.990/ano (ahorra 33%)</p>
            </div>
            <ul className="space-y-3 mb-6">
              {FEATURES_PREMIUM.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-brand-600" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <div className="text-center text-sm text-brand-600 font-heading font-bold py-2">
                Tu plan actual
              </div>
            ) : (
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={() => alert("Pagos con Stripe estaran disponibles proximamente.")}
              >
                <Crown className="w-4 h-4" />
                Suscribirme a Premium
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top-up packs */}
      <div id="topup" className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient mb-2">Packs de creditos</h2>
          <p className="text-gray-500 font-heading">Para usuarios Premium que necesitan mas creditos</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {TOPUP_PACKS.map((pack) => (
            <div key={pack.id} className="card-hover text-center">
              <div className="icon-container-sm mx-auto mb-3" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                <Coins className="w-5 h-5" />
              </div>
              <p className="text-3xl font-display font-bold text-brand-700 mb-1">{pack.credits}</p>
              <p className="text-sm text-gray-400 font-heading mb-3">creditos</p>
              <p className="text-xl font-display font-bold text-gray-800 mb-1">{pack.price}</p>
              <p className="text-xs text-gray-400 mb-4">{pack.description}</p>
              <button
                className={`w-full text-sm font-heading font-bold py-2.5 px-4 rounded-2xl transition-all ${
                  isPremium
                    ? "btn-primary"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
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
        <h2 className="text-xl font-display font-bold text-gray-800 mb-4">Preguntas frecuentes</h2>
        <div className="space-y-2">
          {[
            {
              q: "Que son los creditos?",
              a: "Los creditos se usan para generar cuentos en el plan Premium. Cada cuento consume creditos por el texto (5 cr) y las imagenes (8-12 cr cada una). Un cuento corto cuesta aprox. 37 creditos.",
            },
            {
              q: "Puedo cancelar mi suscripcion?",
              a: "Si, puedes cancelar en cualquier momento. Tu plan Premium seguira activo hasta el fin del periodo pagado.",
            },
            {
              q: "Los creditos comprados expiran?",
              a: "Los creditos comprados no expiran mientras mantengas tu suscripcion Premium activa. Los creditos mensuales se renuevan cada mes.",
            },
          ].map((item) => (
            <details key={item.q} className="group">
              <summary className="cursor-pointer font-heading font-bold text-gray-700 py-2.5 flex items-center justify-between">
                {item.q}
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-3 text-sm text-gray-500 pl-0 leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/crear" className="text-brand-600 hover:text-brand-800 text-sm font-heading font-bold transition-colors">
          ← Volver a crear cuento
        </Link>
      </div>
    </div>
  );
}
