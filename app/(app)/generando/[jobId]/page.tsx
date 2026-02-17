"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Clock, Pencil, Palette, CheckCircle2, AlertCircle } from "lucide-react";
import type { GenerationStatus } from "@/types";

const STEPS = [
  { key: "queued", label: "Preparando la historia...", icon: Clock },
  { key: "generating_text", label: "Escribiendo el cuento...", icon: Pencil },
  { key: "generating_images", label: "Creando ilustraciones...", icon: Palette },
  { key: "ready", label: "Listo!", icon: CheckCircle2 },
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
          // Preload story images before navigating for faster rendering
          try {
            const storyRes = await fetch(`/api/stories/${jobId}`);
            const storyData = await storyRes.json();
            storyData.story?.pages?.forEach((p: { image_url?: string }) => {
              if (p.image_url) {
                const img = new Image();
                img.src = p.image_url;
              }
            });
          } catch { /* ignore preload errors */ }
          setTimeout(() => router.push(`/cuento/${jobId}`), 1500);
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
    <div className="max-w-lg mx-auto text-center py-8 md:py-12 px-1">
      <div className="card">
        {status.status === "failed" ? (
          <>
            <div className="icon-container-lg mx-auto mb-5" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-gray-800 mb-2">Error al generar</h1>
            <p className="text-red-600 text-sm mb-6">{status.error || "Ocurrio un error inesperado"}</p>
            <button onClick={() => router.push("/crear")} className="btn-primary">
              Intentar de nuevo
            </button>
          </>
        ) : (
          <>
            <div className="icon-container-lg mx-auto mb-5">
              {(() => {
                const StepIcon = STEPS[Math.max(0, currentStepIndex)]?.icon || Clock;
                return <StepIcon className="w-10 h-10 animate-pulse" />;
              })()}
            </div>

            <h1 className="text-xl md:text-2xl font-display font-bold text-gradient mb-2">
              Generando tu cuento
            </h1>

            {status.title && (
              <p className="text-brand-600 font-heading font-bold mb-4">&ldquo;{status.title}&rdquo;</p>
            )}

            {/* Progress bar — warm gradient */}
            <div className="w-full rounded-full h-2.5 mb-6 overflow-hidden" style={{ background: "rgba(0,0,0,0.04)" }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${status.progress}%`,
                  background: "linear-gradient(90deg, #9333ea, #B45309)",
                }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-1.5 text-left">
              {STEPS.map((step, i) => {
                const Icon = i < currentStepIndex ? CheckCircle2 : step.icon;
                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
                      i < currentStepIndex
                        ? "text-emerald-600 bg-emerald-50/60"
                        : i === currentStepIndex
                          ? "text-brand-700 bg-brand-50/60 font-heading font-bold"
                          : "text-gray-400"
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${i === currentStepIndex ? "animate-pulse" : ""}`} />
                    <span className="text-sm">{step.label}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-gray-400 text-xs mt-6 font-heading">
              Esto puede tomar entre 30 segundos y 2 minutos...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
