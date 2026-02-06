"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import type { UsageInfo } from "@/types";

export default function PerfilPage() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  const handleDeleteAccount = async () => {
    if (!confirm("¿Estás seguro? Se eliminarán todos tus cuentos y datos. Esta acción no se puede deshacer.")) return;
    if (!confirm("Última confirmación: ¿Realmente quieres eliminar tu cuenta y todos tus datos?")) return;
    setDeleting(true);
    // In a real app, would call a delete account endpoint
    alert("Función de eliminación disponible próximamente. Contacta soporte para eliminar tu cuenta.");
    setDeleting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-800 mb-8">Mi perfil</h1>

      <div className="card mb-6">
        <h2 className="font-bold text-lg text-purple-700 mb-4">Información de cuenta</h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-500">Nombre:</span>
            <p className="font-medium">{session?.user?.name || "—"}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Correo:</span>
            <p className="font-medium">{session?.user?.email || "—"}</p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-bold text-lg text-purple-700 mb-4">Uso</h2>
        {usage ? (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-500">Plan:</span>{" "}
              <span className="font-medium">{usage.isSubscribed ? "Premium" : "Gratuito"}</span>
            </p>
            {!usage.isSubscribed && (
              <>
                <p className="text-sm">
                  <span className="text-gray-500">Cuentos usados hoy:</span>{" "}
                  <span className="font-medium">{usage.storiesUsedToday} de {usage.limit}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Disponibles:</span>{" "}
                  <span className="font-medium text-green-600">{usage.remaining}</span>
                </p>
                <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-700 font-medium mb-1">
                    ¿Quieres más cuentos?
                  </p>
                  <p className="text-xs text-purple-600">
                    La suscripción premium estará disponible próximamente. ¡Gracias por tu paciencia!
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Cargando...</p>
        )}
      </div>

      <div className="card border-red-100">
        <h2 className="font-bold text-lg text-red-600 mb-4">Zona de peligro</h2>
        <p className="text-sm text-gray-500 mb-4">
          Al eliminar tu cuenta se borrarán permanentemente todos tus cuentos, datos y configuración.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDeleteAccount} className="btn-danger" disabled={deleting}>
            Eliminar mi cuenta
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-secondary text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
