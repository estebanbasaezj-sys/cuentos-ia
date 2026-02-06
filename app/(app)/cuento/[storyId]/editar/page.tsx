"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
      <div className="flex justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full" />
      </div>
    );
  }

  if (!story) {
    return <p className="text-center py-20 text-gray-500">Cuento no encontrado</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-800">Editar cuento</h1>
          <p className="text-gray-500 text-sm">{story.title}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="btn-secondary text-sm !py-2">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-primary text-sm !py-2" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {story.pages.map((page) => (
          <div key={page.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-700">Página {page.page_number}</h3>
              <button
                onClick={() => handleRegenerateImage(page.id)}
                disabled={regenerating === page.id}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                {regenerating === page.id ? "Regenerando..." : "Regenerar imagen"}
              </button>
            </div>

            {page.image_url && (
              <img
                src={page.image_url}
                alt={`Página ${page.page_number}`}
                className="w-full h-48 object-cover rounded-xl mb-3"
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
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? "Guardando..." : "Guardar todos los cambios"}
        </button>
      </div>
    </div>
  );
}
