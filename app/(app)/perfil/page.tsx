"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import type { UsageInfo, Wallet, CreditLedgerEntry } from "@/types";

export default function PerfilPage() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => {
        setUsage(d.usage);
        setWallet(d.wallet);
        setLedger(d.ledger || []);
      })
      .catch(() => {});
  }, []);

  const handleDeleteAccount = async () => {
    if (!confirm("Estas seguro? Se eliminaran todos tus cuentos y datos. Esta accion no se puede deshacer.")) return;
    if (!confirm("Ultima confirmacion: Realmente quieres eliminar tu cuenta y todos tus datos?")) return;
    setDeleting(true);
    alert("Funcion de eliminacion disponible proximamente. Contacta soporte para eliminar tu cuenta.");
    setDeleting(false);
  };

  const isPremium = usage?.planType === "premium";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="icon-container-sm">
          <User className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-display font-bold text-gradient">Mi perfil</h1>
      </div>

      <div className="card mb-6">
        <h2 className="font-display font-bold text-lg text-gray-800 mb-4">Informacion de cuenta</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-xs text-gray-400 font-heading">Nombre</span>
              <p className="font-heading font-bold text-gray-700">{session?.user?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-xs text-gray-400 font-heading">Correo</span>
              <p className="font-heading font-bold text-gray-700">{session?.user?.email || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-gray-800">
            {isPremium ? "Plan Premium" : "Plan Gratuito"}
          </h2>
          {isPremium ? (
            <span className="badge-premium">
              <Crown className="w-3.5 h-3.5" />
              Premium
            </span>
          ) : (
            <span className="badge">Free</span>
          )}
        </div>

        {usage ? (
          <div className="space-y-4">
            {isPremium ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-premium !p-4 text-center">
                    <p className="text-xs text-brand-500 font-heading mb-1">Creditos mensuales</p>
                    <p className="text-2xl font-display font-bold text-brand-700">{usage.monthlyCreditsRemaining}</p>
                  </div>
                  <div className="card-premium !p-4 text-center">
                    <p className="text-xs text-brand-500 font-heading mb-1">Creditos comprados</p>
                    <p className="text-2xl font-display font-bold text-brand-700">{usage.purchasedCreditsBalance}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-heading">
                  Total disponible: <strong className="text-brand-700">{usage.totalCreditsAvailable} creditos</strong>
                </p>
                {wallet?.renewal_date && (
                  <p className="text-xs text-gray-400">
                    Renovacion: {new Date(wallet.renewal_date).toLocaleDateString("es-CL")}
                  </p>
                )}
                <Link
                  href="/precios#topup"
                  className="btn-secondary text-sm !py-2 inline-flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Comprar creditos
                </Link>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cuentos esta semana:</span>
                    <span className="font-heading font-bold">{usage.storiesThisWeek} de {usage.weeklyLimit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Disponibles:</span>
                    <span className="font-heading font-bold text-emerald-600">{usage.freeRemaining}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Biblioteca:</span>
                    <span className="font-heading font-bold">{usage.libraryCount} de {usage.libraryLimit} cuentos</span>
                  </div>
                </div>
                <div className="card-premium !p-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-brand-600" />
                    <p className="text-sm text-brand-700 font-heading font-bold">
                      Desbloquea todo con Premium
                    </p>
                  </div>
                  <p className="text-xs text-brand-600/70 mb-3">
                    Cuentos ilimitados, todos los estilos, sin marca de agua en PDF, y mas.
                  </p>
                  <Link href="/precios" className="btn-primary text-sm !py-2 !px-4">
                    Ver planes
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        )}
      </div>

      {isPremium && ledger.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-4">Ultimas transacciones</h2>
          <div className="space-y-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2.5 border-b border-gray-100/60 last:border-0">
                <div className="flex items-center gap-3">
                  {entry.amount > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <p className="text-sm font-heading font-bold text-gray-700">{entry.description || entry.source}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString("es-CL", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-heading font-bold ${entry.amount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {entry.amount > 0 ? "+" : ""}{entry.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ borderColor: "rgba(239, 68, 68, 0.15)" }}>
        <h2 className="font-display font-bold text-lg text-red-600 mb-4">Zona de peligro</h2>
        <p className="text-sm text-gray-500 mb-4">
          Al eliminar tu cuenta se borraran permanentemente todos tus cuentos, datos y configuracion.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDeleteAccount} className="btn-danger flex items-center gap-1.5" disabled={deleting}>
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar mi cuenta
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesion
          </button>
        </div>
      </div>
    </div>
  );
}
