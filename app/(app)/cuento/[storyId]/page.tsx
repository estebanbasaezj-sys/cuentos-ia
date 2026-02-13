"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { StoryWithPages, Page, UsageInfo } from "@/types";

export default function CuentoPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const router = useRouter();
  const [story, setStory] = useState<StoryWithPages | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  useEffect(() => {
    fetch(`/api/stories/${storyId}`)
      .then((r) => r.json())
      .then((d) => { setStory(d.story); setLoading(false); })
      .catch(() => setLoading(false));
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, [storyId]);

  const isPremium = usage?.planType === "premium";

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/stories/${storyId}/pdf`, { method: "POST" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${story?.title || "cuento"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    setPdfLoading(false);
  };

  const handleShare = async (days: number) => {
    const res = await fetch(`/api/stories/${storyId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresInDays: days }),
    });
    const data = await res.json();
    if (data.shareUrl) {
      setShareUrl(data.shareUrl);
    }
  };

  const handleReport = async () => {
    if (reportReason.length < 5) return;
    await fetch(`/api/stories/${storyId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason }),
    });
    setShowReport(false);
    setReportReason("");
    alert("Reporte enviado. Gracias por tu feedback.");
  };

  const handleDelete = async () => {
    if (!confirm("Estas seguro de que quieres eliminar este cuento?")) return;
    await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
    router.push("/biblioteca");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full" />
      </div>
    );
  }

  if (!story || !story.pages?.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Cuento no encontrado</p>
        <Link href="/biblioteca" className="btn-primary mt-4 inline-block">
          Ir a mi biblioteca
        </Link>
      </div>
    );
  }

  const page: Page = story.pages[currentPage];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-purple-800">{story.title}</h1>
          <p className="text-gray-500 text-sm">Para {story.child_name} &middot; {story.theme} &middot; {story.tone}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/cuento/${storyId}/editar`} className="btn-secondary !py-2 !px-4 text-sm">
            Editar
          </Link>
          <button onClick={handleDownloadPDF} className="btn-secondary !py-2 !px-4 text-sm" disabled={pdfLoading}>
            {pdfLoading
              ? "Generando..."
              : isPremium
                ? "PDF (3 cr)"
                : "PDF (con marca de agua)"}
          </button>
          <button onClick={() => setShowShare(!showShare)} className="btn-secondary !py-2 !px-4 text-sm">
            Compartir
          </button>
        </div>
      </div>

      {/* Share panel */}
      {showShare && (
        <div className="card mb-6">
          <h3 className="font-semibold text-purple-700 mb-3">Compartir cuento</h3>
          {shareUrl ? (
            <div className="space-y-2">
              <input
                type="text"
                className="input-field text-sm"
                value={shareUrl}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Link copiado!"); }}
                className="btn-primary text-sm !py-2"
              >
                Copiar link
              </button>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {[1, 3, 7, 14, 30].map((d) => (
                <button key={d} onClick={() => handleShare(d)} className="btn-secondary text-sm !py-1.5 !px-3">
                  {d} dia{d > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Story page */}
      <div className="card overflow-hidden !p-0">
        {page.image_url && (
          <div className="relative w-full aspect-square bg-purple-50">
            <img
              src={page.image_url}
              alt={`Pagina ${page.page_number}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <p className="text-lg leading-relaxed text-gray-800">{page.text}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="btn-secondary !py-2 disabled:opacity-30"
        >
          ← Anterior
        </button>
        <span className="text-sm text-gray-500">
          Pagina {currentPage + 1} de {story.pages.length}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(story.pages.length - 1, currentPage + 1))}
          disabled={currentPage === story.pages.length - 1}
          className="btn-secondary !py-2 disabled:opacity-30"
        >
          Siguiente →
        </button>
      </div>

      {/* Page dots */}
      <div className="flex justify-center gap-2 mt-4">
        {story.pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentPage ? "bg-purple-600 scale-125" : "bg-purple-200"
            }`}
          />
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex justify-between mt-8 text-sm">
        <button
          onClick={() => setShowReport(!showReport)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          Reportar contenido
        </button>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          Eliminar cuento
        </button>
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="card mt-4">
          <h3 className="font-semibold text-red-600 mb-2">Reportar contenido inapropiado</h3>
          <textarea
            className="input-field text-sm"
            rows={3}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe por que el contenido es inapropiado..."
          />
          <div className="flex gap-2 mt-3">
            <button onClick={handleReport} className="btn-danger text-sm">Enviar reporte</button>
            <button onClick={() => setShowReport(false)} className="btn-secondary text-sm !py-2">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
