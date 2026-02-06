"use client";

import { useState } from "react";
import type { Page } from "@/types";

export default function SharedStoryViewer({ pages }: { pages: Page[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const page = pages[currentPage];

  return (
    <>
      <div className="card overflow-hidden !p-0">
        {page.image_url && (
          <img
            src={page.image_url}
            alt={`Página ${page.page_number}`}
            className="w-full aspect-square object-cover"
          />
        )}
        <div className="p-6">
          <p className="text-lg leading-relaxed text-gray-800">{page.text}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="btn-secondary !py-2 disabled:opacity-30"
        >
          ← Anterior
        </button>
        <span className="text-sm text-gray-500">
          Página {currentPage + 1} de {pages.length}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
          className="btn-secondary !py-2 disabled:opacity-30"
        >
          Siguiente →
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentPage ? "bg-purple-600 scale-125" : "bg-purple-200"
            }`}
          />
        ))}
      </div>
    </>
  );
}
