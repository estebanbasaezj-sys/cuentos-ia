"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  PenTool,
  Download,
  Share2,
  Trash2,
  Flag,
  Copy,
  Volume2,
  Loader2,
} from "lucide-react";
import type { StoryWithPages, GateResult } from "@/types";
import { CREDIT_COSTS } from "@/lib/monetization";
import Paywall from "@/components/Paywall";
import VoicePickerModal from "@/components/stories/VoicePickerModal";
import StoryAudioPlayer from "@/components/stories/StoryAudioPlayer";

// Dynamic import to avoid SSR issues (react-pageflip uses window)
const StoryBook = dynamic(() => import("@/components/stories/StoryBook"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
    </div>
  ),
});

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
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [narrationLoading, setNarrationLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallGate, setPaywallGate] = useState<GateResult>({ allowed: false, reason: "premium_narration", paywallType: "upgrade" });
  const [goToPage, setGoToPage] = useState<{ page: number; id: number } | null>(null);
  const [currentBookPage, setCurrentBookPage] = useState(0);
  const flipIdRef = useRef(0);

  useEffect(() => {
    fetch(`/api/stories/${storyId}`)
      .then((r) => r.json())
      .then((d) => { setStory(d.story); setLoading(false); })
      .catch(() => setLoading(false));
  }, [storyId]);

  const hasNarration = story?.pages?.some((p) => p.audio_url) ?? false;
  const currentAudioUrl = story?.pages?.[currentPage]?.audio_url ?? null;

  // Parse traits for author/dedication
  const traits = useMemo(() => {
    if (!story?.traits) return {};
    try { return JSON.parse(story.traits as string); } catch { return {}; }
  }, [story?.traits]);

  const handleNarrate = () => {
    if (hasNarration) return;
    setShowVoicePicker(true);
  };

  const handleNarrateConfirm = async (voice: string) => {
    setShowVoicePicker(false);
    setNarrationLoading(true);
    try {
      const res = await fetch(`/api/stories/${storyId}/narrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice, speed: 1.0 }),
      });
      if (res.status === 403) {
        const data = await res.json();
        setPaywallGate(data.gate || { allowed: false, reason: data.reason || "premium_narration", paywallType: data.paywallType || "upgrade" });
        setShowPaywall(true);
        setNarrationLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Error al narrar");
      const data = await res.json();
      setStory((prev) => {
        if (!prev) return prev;
        const updatedPages = prev.pages.map((p) => {
          const audioPage = data.pages?.find((ap: { id: string; audio_url: string }) => ap.id === p.id);
          return audioPage ? { ...p, audio_url: audioPage.audio_url } : p;
        });
        return { ...prev, pages: updatedPages, narration_voice: voice };
      });
    } catch {
      alert("Error generando la narracion. Intenta de nuevo.");
    }
    setNarrationLoading(false);
  };

  // Audio player requests page change → flip the book visually.
  // Do NOT set currentPage here — the onFlip callback in StoryBook will
  // update it once the flip animation completes, which then triggers the new audio.
  const handleAudioPageChange = useCallback((page: number) => {
    const normalizedPage = currentBookPage < 2 ? 0 : page;
    setGoToPage({ page: normalizedPage, id: ++flipIdRef.current });
  }, [currentBookPage]);

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
      <div className="max-w-4xl mx-auto py-12">
        <div className="card">
          <div className="skeleton h-8 w-2/3 mb-4" />
          <div className="skeleton h-4 w-1/3 mb-8" />
          <div className="skeleton aspect-[3/4] w-full max-w-md mx-auto mb-4" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!story || !story.pages?.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Cuento no encontrado</p>
        <Link href="/biblioteca" className="btn-primary">
          Ir a mi biblioteca
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${hasNarration ? "pb-32" : "pb-20"}`}>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="mb-3">
          <h1 className="text-xl md:text-2xl font-display font-bold text-gradient">{story.title}</h1>
          <p className="text-gray-500 text-sm mt-1">Para {story.child_name} &middot; {story.theme} &middot; {story.tone}</p>
        </div>
        {/* Action bar — scrollable on mobile, wrapped on desktop */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:flex-wrap md:overflow-visible scrollbar-hide">
          <Link
            href={`/cuento/${storyId}/editar`}
            className="btn-secondary !py-2.5 !px-4 text-sm flex items-center gap-1.5 flex-shrink-0"
          >
            <PenTool className="w-4 h-4" />
            Editar
          </Link>
          <button
            onClick={handleDownloadPDF}
            className="btn-secondary !py-2.5 !px-4 text-sm flex items-center gap-1.5 flex-shrink-0"
            disabled={pdfLoading}
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? "Generando..." : "PDF"}
          </button>
          <button
            onClick={hasNarration ? undefined : handleNarrate}
            className={`btn-secondary !py-2.5 !px-4 text-sm flex items-center gap-1.5 flex-shrink-0 ${hasNarration ? "!border-green-300 !text-green-700 !bg-green-50" : ""}`}
            disabled={narrationLoading}
          >
            {narrationLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            {narrationLoading ? "Narrando..." : hasNarration ? "Narrado" : "Narrar"}
          </button>
          <button
            onClick={() => setShowShare(!showShare)}
            className="btn-secondary !py-2.5 !px-4 text-sm flex items-center gap-1.5 flex-shrink-0"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* Share panel */}
      {showShare && (
        <div className="card mb-6">
          <h3 className="font-heading font-bold text-gray-800 mb-3">Compartir cuento</h3>
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
                className="btn-primary text-sm !py-2 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
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

      {/* Story Book with page flip effect */}
      <div className="my-6">
        <StoryBook
          title={story.title || "Mi Cuento"}
          childName={story.child_name}
          authorName={traits?.authorName}
          dedication={traits?.dedication}
          pages={story.pages}
          coverImageUrl={story.pages[0]?.image_url || undefined}
          onPageChange={(storyIndex) => setCurrentPage(storyIndex)}
          onBookPageChange={setCurrentBookPage}
          goToPage={goToPage}
        />
      </div>

      {/* Footer actions */}
      <div className="flex justify-between mt-8 text-sm">
        <button
          onClick={() => setShowReport(!showReport)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          Reportar contenido
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar cuento
        </button>
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="card mt-4">
          <h3 className="font-heading font-bold text-red-600 mb-2">Reportar contenido inapropiado</h3>
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

      {/* Voice picker modal */}
      {showVoicePicker && story && (
        <VoicePickerModal
          pageCount={story.pages.length}
          creditCostPerPage={CREDIT_COSTS.narratePerPage}
          onConfirm={handleNarrateConfirm}
          onClose={() => setShowVoicePicker(false)}
        />
      )}

      {/* Paywall modal */}
      {showPaywall && (
        <Paywall gate={paywallGate} onClose={() => setShowPaywall(false)} />
      )}

      {/* Sticky audio player — always visible when narration exists */}
      {hasNarration && (
        <StoryAudioPlayer
          audioUrl={currentAudioUrl}
          currentPage={currentPage}
          totalPages={story.pages.length}
          onPageChange={handleAudioPageChange}
        />
      )}
    </div>
  );
}
