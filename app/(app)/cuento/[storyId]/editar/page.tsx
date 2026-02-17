"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PenTool, RefreshCw, Save, ArrowLeft } from "lucide-react";
import type { StoryWithPages } from "@/types";

export default function EditarCuentoPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const router = useRouter();
  const [story, setStory] = useState<StoryWithPages | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stories/${storyId}`)
      .then((r) => r.json())
      .then((d) => {
        setStory(d.story);
        const texts: Record<string, string> = {};
        d.story?.pages?.forEach((p: { id: string; text: string }) => {
          texts[p.id] = p.text;
        });
        setEditedTexts(texts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [storyId]);

  const handleSave = async () => {
    if (!story) return;
    setSaving(true);
    const pages = story.pages.map((p) => ({
      id: p.id,
      text: editedTexts[p.id] || p.text,
    }));

    await fetch(`/api/stories/${storyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages }),
    });

    setSaving(false);
    router.push(`/cuento/${storyId}`);
  };

  const handleRegenerateImage = async (pageId: string) => {
    setRegenerating(pageId);
    try {
      const res = await fetch(`/api/stories/${storyId}/regenerate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.imageUrl && story) {
        setStory({
          ...story,
          pages: story.pages.map((p) =>
            p.id === pageId ? { ...p, image_url: data.imageUrl } : p
          ),
        });
      }
    } catch { /* ignore */ }
    setRegenerating(null);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="card">
          <div className="skeleton h-8 w-1/2 mb-4" />
          <div className="skeleton h-4 w-1/3 mb-8" />
          <div className="skeleton h-48 w-full mb-4" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!story) {
    return <p className="text-center py-20 text-gray-500">Cuento no encontrado</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="icon-container-sm">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">Editar cuento</h1>
            <p className="text-gray-500 text-sm">{story.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="btn-secondary text-sm !py-2 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="btn-primary text-sm !py-2 flex items-center gap-1.5"
            disabled={saving}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {story.pages.map((page) => (
          <div key={page.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-brand-700">Pagina {page.page_number}</h3>
              <button
                onClick={() => handleRegenerateImage(page.id)}
                disabled={regenerating === page.id}
                className="text-xs font-heading font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating === page.id ? "animate-spin" : ""}`} />
                {regenerating === page.id ? "Regenerando..." : "Regenerar imagen"}
              </button>
            </div>

            {page.image_url && (
              <img
                src={page.image_url}
                alt={`Pagina ${page.page_number}`}
                className="w-full h-48 object-cover rounded-2xl mb-3"
              />
            )}

            <textarea
              className="input-field text-sm"
              rows={4}
              value={editedTexts[page.id] || ""}
              onChange={(e) =>
                setEditedTexts({ ...editedTexts, [page.id]: e.target.value })
              }
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
          disabled={saving}
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar todos los cambios"}
        </button>
      </div>
    </div>
  );
}
