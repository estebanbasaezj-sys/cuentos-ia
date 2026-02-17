"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { Page } from "@/types";

const StoryBook = dynamic(() => import("@/components/stories/StoryBook"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
    </div>
  ),
});

interface SharedStoryViewerProps {
  pages: Page[];
  title: string;
  childName: string;
  authorName?: string;
  dedication?: string;
}

export default function SharedStoryViewer({
  pages,
  title,
  childName,
  authorName,
  dedication,
}: SharedStoryViewerProps) {
  return (
    <StoryBook
      title={title}
      childName={childName}
      authorName={authorName}
      dedication={dedication}
      pages={pages}
      coverImageUrl={pages[0]?.image_url || undefined}
    />
  );
}
