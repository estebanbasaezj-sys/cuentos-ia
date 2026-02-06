"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { GenerationStatus } from "@/types";

const STEPS = [
  { key: "queued", label: "Preparando la historia...", icon: "⏳" },
  { key: "generating_text", label: "Escribiendo el cuento...", icon: "✍️" },
  { key: "generating_images", label: "Creando ilustraciones...", icon: "🎨" },
  { key: "ready", label: "¡Listo!", icon: "✅" },
];

export default function GenerandoPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<GenerationStatus>({
    status: "queued",
    progress: 0,
    title: null,
    error: null,
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate/status/${jobId}`);
        const data = await res.json();
        setStatus(data);

        if (data.status === "ready") {
          clearInterval(interval);
          setTimeout(() => router.push(`/cuento/${jobId}`), 1000);
        }
        if (data.status === "failed") {
          clearInterval(interval);
        }
      } catch {
        // Retry on next interval
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, router]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === status.status);

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="card">
        <div className="text-5xl mb-6 animate-bounce">
          {status.status === "failed" ? "😔" : STEPS[Math.max(0, currentStepIndex)]?.icon || "⏳"}
        </div>

        <h1 className="text-2xl font-bold text-purple-800 mb-2">
          {status.status === "failed" ? "Error al generar" : "Generando tu cuento"}
        </h1>

        {status.title && (
          <p className="text-purple-600 font-medium mb-4">&ldquo;{status.title}&rdquo;</p>
        )}

        {status.status === "failed" ? (
          <div className="space-y-4">
            <p className="text-red-600 text-sm">{status.error || "Ocurrió un error inesperado"}</p>
            <button onClick={() => router.push("/crear")} className="btn-primary">
              Intentar de nuevo
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="w-full bg-purple-100 rounded-full h-3 mb-6 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${status.progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-3 text-left">
              {STEPS.map((step, i) => (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                    i < currentStepIndex
                      ? "text-green-600 bg-green-50"
                      : i === currentStepIndex
                        ? "text-purple-700 bg-purple-50 font-semibold"
                        : "text-gray-400"
                  }`}
                >
                  <span className="text-lg">{i < currentStepIndex ? "✅" : step.icon}</span>
                  <span className="text-sm">{step.label}</span>
                </div>
              ))}
            </div>

            <p className="text-gray-400 text-xs mt-6">
              Esto puede tomar entre 30 segundos y 2 minutos...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
