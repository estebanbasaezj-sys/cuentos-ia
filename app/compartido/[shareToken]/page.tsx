import db, { initializeDb } from "@/lib/db";
import { isShareValid } from "@/lib/share";
import type { Share, Story, Page } from "@/types";
import Link from "next/link";
import SharedStoryViewer from "./SharedStoryViewer";

export default async function SharedStoryPage({ params }: { params: { shareToken: string } }) {
  await initializeDb();

  const share = await db.get<Share>("SELECT * FROM shares WHERE share_token = ?", params.shareToken);

  if (!share || !isShareValid(share)) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-gray-700 mb-2">Link no disponible</h1>
          <p className="text-gray-500 text-sm mb-6">
            Este link ha expirado o fue revocado.
          </p>
          <Link href="/" className="btn-primary">
            Ir a Cuentos IA
          </Link>
        </div>
      </div>
    );
  }

  const story = await db.get<Story>("SELECT * FROM stories WHERE id = ?", share.story_id);
  const pages = await db.all<Page>("SELECT * FROM pages WHERE story_id = ? ORDER BY page_number", share.story_id);

  if (!story || !pages.length) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="text-gray-500">Cuento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <span className="font-bold text-xl text-purple-700">Cuentos IA</span>
          </Link>
          <Link href="/register" className="btn-primary text-sm !py-2 !px-4">
            Crear mi cuento
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800">{story.title}</h1>
          <p className="text-gray-500 mt-1">Un cuento para {story.child_name}</p>
        </div>

        <SharedStoryViewer pages={pages} />
      </main>
    </div>
  );
}
