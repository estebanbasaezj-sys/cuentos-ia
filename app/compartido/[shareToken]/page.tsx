import db, { initializeDb } from "@/lib/db";
import { isShareValid } from "@/lib/share";
import type { Share, Story, Page } from "@/types";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import SofiaLogo from "@/components/SofiaLogo";
import SharedStoryViewer from "./SharedStoryViewer";

export default async function SharedStoryPage({ params }: { params: { shareToken: string } }) {
  await initializeDb();

  const share = await db.get<Share>("SELECT * FROM shares WHERE share_token = ?", params.shareToken);

  if (!share || !isShareValid(share)) {
    return (
      <div className="min-h-screen bg-cream-50 bg-mesh flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <div className="flex justify-center mb-5">
            <SofiaLogo size="large" />
          </div>
          <h1 className="text-xl font-display font-bold text-brand-800 mb-2">Link no disponible</h1>
          <p className="text-gray-500 text-sm mb-6">
            Este link ha expirado o fue revocado.
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Ir a Sofia
          </Link>
        </div>
      </div>
    );
  }

  const story = await db.get<Story>("SELECT * FROM stories WHERE id = ?", share.story_id);
  const pages = await db.all<Page>("SELECT * FROM pages WHERE story_id = ? ORDER BY page_number", share.story_id);

  if (!story || !pages.length) {
    return (
      <div className="min-h-screen bg-cream-50 bg-mesh flex items-center justify-center">
        <p className="text-gray-500">Cuento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 bg-mesh">
      <nav className="sticky top-0 z-50">
        <div className="h-1 bg-gradient-to-r from-brand-600 via-amber-400 to-brand-400" />
        <div className="glass border-b border-white/40">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <SofiaLogo size="small" />
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Crear mi cuento
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gradient">{story.title}</h1>
          <p className="text-gray-500 mt-1 font-heading">Un cuento para {story.child_name}</p>
        </div>

        <SharedStoryViewer
          pages={pages}
          title={story.title || "Mi Cuento"}
          childName={story.child_name}
          authorName={(() => { try { return story.traits ? JSON.parse(story.traits).authorName : undefined; } catch { return undefined; } })()}
          dedication={(() => { try { return story.traits ? JSON.parse(story.traits).dedication : undefined; } catch { return undefined; } })()}
        />
      </main>
    </div>
  );
}
