"use client";

import React, { useRef, useCallback, useState, useEffect, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import type { Page as StoryPage } from "@/types";

interface StoryBookProps {
  title: string;
  childName: string;
  authorName?: string;
  dedication?: string;
  pages: StoryPage[];
  coverImageUrl?: string;
  onPageChange?: (storyPageIndex: number) => void;
  onBookPageChange?: (bookPageIndex: number) => void;
  /** When this changes, the book flips to the specified story page index */
  goToPage?: { page: number; id: number } | null;
}

// react-pageflip requires forwardRef components for each page
const BookPage = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ children, className = "" }, ref) => (
  <div ref={ref} className={`book-page ${className}`}>
    {children}
  </div>
));
BookPage.displayName = "BookPage";

export default function StoryBook({
  title,
  childName,
  authorName,
  dedication,
  pages,
  coverImageUrl,
  onPageChange,
  onBookPageChange,
  goToPage,
}: StoryBookProps) {
  const bookRef = useRef<typeof HTMLFlipBook>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 520 });
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((id: string) => {
    setBrokenImages((prev) => new Set(prev).add(id));
  }, []);

  // When goToPage changes, flip the book to that page
  useEffect(() => {
    if (!goToPage) return;
    const bookPage = goToPage.page + 2; // +2 for cover + endpaper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (bookRef.current as any)?.pageFlip()?.flip(bookPage);
  }, [goToPage]);

  // Responsive sizing — width is per-page (spread shows 2x on tablet/desktop)
  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      let w: number;
      if (vw < 640) {
        // Mobile (portrait): single page, nearly full width
        w = Math.min(vw - 32, 380);
      } else if (vw < 1024) {
        // Tablet: spread mode, each page ~40% of viewport
        w = Math.min(Math.round(vw * 0.38), 360);
      } else {
        // Desktop: spread mode, each page ~28% of viewport
        w = Math.min(Math.round(vw * 0.28), 400);
      }
      setDimensions({ width: w, height: Math.round(w * 1.38) });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Page flip sound
  const playFlipSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/page-flip.mp3");
        audioRef.current.volume = 0.3;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // Ignore audio errors
    }
  }, []);

  const handleFlip = useCallback(
    (e: { data: number }) => {
      playFlipSound();
      onBookPageChange?.(e.data);
      // e.data = book page index: 0=cover, 1=endpaper, 2+=content pages
      const storyIndex = Math.max(0, e.data - 2);
      onPageChange?.(storyIndex);
    },
    [playFlipSound, onBookPageChange, onPageChange]
  );

  const effectiveCoverImage = coverImageUrl || pages[0]?.image_url;
  const effectiveDedication =
    dedication || `Para ${childName}, con todo mi amor`;

  return (
    <div className="story-book-wrapper flex flex-col items-center">
      {/* @ts-expect-error react-pageflip has incomplete TS types */}
      <HTMLFlipBook
        ref={bookRef}
        width={dimensions.width}
        height={dimensions.height}
        size="stretch"
        minWidth={240}
        maxWidth={500}
        minHeight={340}
        maxHeight={700}
        showCover={true}
        startPage={0}
        maxShadowOpacity={0.5}
        mobileScrollSupport={true}
        onFlip={handleFlip}
        className="story-book"
        useMouseEvents={true}
        swipeDistance={30}
        showPageCorners={true}
        flippingTime={800}
        drawShadow={true}
        usePortrait={true}
      >
        {/* ===== FRONT COVER ===== */}
        <BookPage className="book-cover">
          <div className="relative w-full h-full overflow-hidden">
            {/* Full illustration — hero image, 100% clear */}
            {effectiveCoverImage && !brokenImages.has("cover") && (
              <img
                src={effectiveCoverImage}
                alt="Portada"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => handleImageError("cover")}
              />
            )}

            {/* Subtle bottom gradient so title plate blends with image */}
            <div className="cover-bottom-fade" />

            {/* Ornamental gold frame with corner decorations */}
            <div className="cover-frame">
              <span className="cover-corner cover-corner-tl">&#10022;</span>
              <span className="cover-corner cover-corner-tr">&#10022;</span>
              <span className="cover-corner cover-corner-bl">&#10022;</span>
              <span className="cover-corner cover-corner-br">&#10022;</span>
            </div>

            {/* Title plate — elegant floating card at the bottom */}
            <div className="cover-title-plate">
              <div className="cover-plate-ornament">&#10040; &#10040; &#10040;</div>
              <h1 className="cover-title">{title}</h1>
              <div className="cover-plate-divider" />
              {authorName && (
                <p className="cover-author">por {authorName}</p>
              )}
            </div>

            {/* Dedication — small elegant text at the very bottom */}
            <div className="cover-dedication">
              <p className="text-white/80 text-[8px] sm:text-[9px] font-heading italic leading-snug">
                {effectiveDedication}
              </p>
            </div>
          </div>
        </BookPage>

        {/* ===== FRONT ENDPAPER — decorative guard page ===== */}
        <BookPage className="book-endpaper">
          <div className="endpaper-inner">
            {/* Decorative pattern — like real children's book endpapers */}
            <div className="endpaper-pattern" />
            {/* Subtle dedication in the center */}
            <div className="endpaper-content">
              <div className="endpaper-ornament">&#10053;</div>
              {effectiveDedication && (
                <p className="endpaper-dedication">{effectiveDedication}</p>
              )}
              <div className="endpaper-ornament">&#10053;</div>
            </div>
          </div>
        </BookPage>

        {/* ===== CONTENT PAGES ===== */}
        {pages.map((page) => {
          const showImage = !!page.image_url && !brokenImages.has(page.id);
          return (
            <BookPage key={page.id} className="book-content-page">
              <div className="flex flex-col h-full content-page-inner">
                {showImage ? (
                  <div className="flex-1 min-h-0 relative content-page-image">
                    <img
                      src={page.image_url!}
                      alt={`Pagina ${page.page_number}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(page.id)}
                    />
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 relative content-page-image page-image-placeholder">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="page-placeholder-pattern" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="page-placeholder-icon-group">
                        <span className="page-placeholder-star" style={{ top: "20%", left: "25%" }}>&#10022;</span>
                        <span className="page-placeholder-star" style={{ top: "35%", right: "20%" }}>&#10040;</span>
                        <span className="page-placeholder-star" style={{ bottom: "30%", left: "30%" }}>&#10040;</span>
                        <span className="page-placeholder-star" style={{ bottom: "20%", right: "25%" }}>&#10022;</span>
                        <svg className="page-image-placeholder-icon w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 40 40" fill="currentColor">
                          <path d="M6 8C6 6.9 6.9 6 8 6h10c1.1 0 2 .45 2 1v24c0-.55-.9-1-2-1H8c-1.1 0-2-.9-2-2V8z" />
                          <path d="M34 8c0-1.1-.9-2-2-2H22c-1.1 0-2 .45-2 1v24c0-.55.9-1 2-1h10c1.1 0 2-.9 2-2V8z" />
                          <path d="M20 4l1.5 3.5L25 9l-3.5 1.5L20 14l-1.5-3.5L15 9l3.5-1.5L20 4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                <div className="content-page-text">
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-700 font-body">
                    {page.text}
                  </p>
                </div>
                <div className="text-center pb-1.5">
                  <span className="content-page-number">
                    {page.page_number}
                  </span>
                </div>
              </div>
            </BookPage>
          );
        })}

        {/* ===== BACK COVER ===== */}
        <BookPage className="book-back-cover">
          <div className="relative w-full h-full overflow-hidden">
            {effectiveCoverImage && !brokenImages.has("cover") && (
              <img
                src={effectiveCoverImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-15"
                onError={() => handleImageError("cover")}
              />
            )}
            <div className="absolute inset-0 back-cover-gradient" />

            {/* Frame */}
            <div className="cover-frame back-cover-frame">
              <span className="cover-corner cover-corner-tl">&#10022;</span>
              <span className="cover-corner cover-corner-tr">&#10022;</span>
              <span className="cover-corner cover-corner-bl">&#10022;</span>
              <span className="cover-corner cover-corner-br">&#10022;</span>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 py-8">
              <div className="back-cover-ornament">&#10040;</div>
              <p className="font-display text-2xl sm:text-3xl mb-2 text-white/90">Fin</p>
              <div className="back-cover-divider" />
              <p className="text-purple-200/50 text-[10px] sm:text-xs font-heading mt-3 tracking-widest uppercase">
                Creado con Sofia
              </p>
            </div>
          </div>
        </BookPage>
      </HTMLFlipBook>

      {/* Navigation hint */}
      <p className="text-xs text-gray-400 mt-4 font-heading text-center select-none">
        Arrastra las esquinas o haz clic en los bordes para pasar pagina
      </p>
    </div>
  );
}
