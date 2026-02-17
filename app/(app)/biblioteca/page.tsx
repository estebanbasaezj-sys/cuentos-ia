"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Library, Plus, Search, BookOpen, AlertTriangle } from "lucide-react";
import type { Story } from "@/types";
import { useUsage } from "@/components/UsageProvider";

export default function BibliotecaPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { usage } = useUsage();

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
      case "ready": return { text: "Listo", cls: "badge-success" };
      case "generating_text":
      case "generating_images": return { text: "Generando...", cls: "badge-warning" };
      case "queued": return { text: "En cola", cls: "badge-info" };
      case "failed": return { text: "Error", cls: "badge-danger" };
      default: return { text: status, cls: "badge" };
    }
  };

  const isFree = usage?.planType === "free";
  const nearLimit = isFree && usage && usage.libraryCount >= (usage.libraryLimit - 2);
  const atLimit = isFree && usage && usage.libraryCount >= usage.libraryLimit;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-container-sm">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Mi biblioteca</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {stories.length} cuento{stories.length !== 1 ? "s" : ""}
              {isFree && usage ? ` de ${usage.libraryLimit} max` : ""}
            </p>
          </div>
        </div>
        <Link href="/crear" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo cuento
        </Link>
      </div>

      {nearLimit && !atLimit && (
        <div className="flex items-center gap-3 bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>
            Te quedan pocos espacios ({usage!.libraryCount}/{usage!.libraryLimit}).{" "}
            <Link href="/precios" className="font-heading font-bold underline">Upgrade a Premium</Link> para almacenar ilimitados.
          </span>
        </div>
      )}
      {atLimit && (
        <div className="flex items-center gap-3 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl px-4 py-3 mb-6 text-sm text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>
            Biblioteca llena ({usage!.libraryCount}/{usage!.libraryLimit}). Elimina algun cuento o{" "}
            <Link href="/precios" className="font-heading font-bold underline">upgrade a Premium</Link>.
          </span>
        </div>
      )}

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field !pl-10"
              placeholder="Buscar por nombre o titulo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary">
            Buscar
          </button>
        </div>
      </form>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-3/4 mb-3" />
              <div className="skeleton h-4 w-1/2 mb-2" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="icon-container-lg mx-auto mb-5">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-display font-bold text-brand-800 mb-2">Tu biblioteca esta vacia</h2>
          <p className="text-gray-500 mb-6">Crea tu primer cuento y aparecera aqui.</p>
          <Link href="/crear" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
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
                className="card-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading font-bold text-brand-800 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {story.title || "Sin titulo"}
                  </h3>
                  <span className={st.cls}>{st.text}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Para <span className="font-heading font-bold">{story.child_name}</span>
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
