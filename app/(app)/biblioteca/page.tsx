"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Story, UsageInfo } from "@/types";

export default function BibliotecaPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  const fetchStories = async (q = "") => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    const res = await fetch(`/api/stories?${params}`);
    const data = await res.json();
    setStories(data.stories || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStories(search);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-CL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "ready": return { text: "Listo", color: "bg-green-100 text-green-700" };
      case "generating_text":
      case "generating_images": return { text: "Generando...", color: "bg-yellow-100 text-yellow-700" };
      case "queued": return { text: "En cola", color: "bg-blue-100 text-blue-700" };
      case "failed": return { text: "Error", color: "bg-red-100 text-red-700" };
      default: return { text: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  const isFree = usage?.planType === "free";
  const nearLimit = isFree && usage && usage.libraryCount >= (usage.libraryLimit - 2);
  const atLimit = isFree && usage && usage.libraryCount >= usage.libraryLimit;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-800">Mi biblioteca</h1>
          <p className="text-gray-500 mt-1">
            {stories.length} cuento{stories.length !== 1 ? "s" : ""}
            {isFree && usage ? ` de ${usage.libraryLimit} max` : ""}
          </p>
        </div>
        <Link href="/crear" className="btn-primary">
          + Nuevo cuento
        </Link>
      </div>

      {/* Library limit warning */}
      {nearLimit && !atLimit && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 text-sm text-orange-700">
          Te quedan pocos espacios en tu biblioteca ({usage!.libraryCount}/{usage!.libraryLimit}).{" "}
          <Link href="/precios" className="font-medium underline">Upgrade a Premium</Link> para almacenar cuentos ilimitados.
        </div>
      )}
      {atLimit && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
          Tu biblioteca esta llena ({usage!.libraryCount}/{usage!.libraryLimit}). Elimina algun cuento o{" "}
          <Link href="/precios" className="font-medium underline">upgrade a Premium</Link> para continuar.
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por nombre o titulo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-secondary">
            Buscar
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full" />
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Tu biblioteca esta vacia</h2>
          <p className="text-gray-500 mb-6">Crea tu primer cuento y aparecera aqui.</p>
          <Link href="/crear" className="btn-primary">
            Crear mi primer cuento
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => {
            const st = statusLabel(story.status);
            return (
              <Link
                key={story.id}
                href={story.status === "ready" ? `/cuento/${story.id}` : story.status === "failed" ? `/crear` : `/generando/${story.id}`}
                className="card hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-purple-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {story.title || "Sin titulo"}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                    {st.text}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Para <span className="font-medium">{story.child_name}</span>
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{story.theme}</span>
                  <span>&middot;</span>
                  <span>{story.tone}</span>
                  <span>&middot;</span>
                  <span>{formatDate(story.created_at)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
