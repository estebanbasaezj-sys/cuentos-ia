"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";

const SPEEDS = [0.75, 1.0, 1.25];

interface StoryAudioPlayerProps {
  audioUrl: string | null;
  currentPage: number;
  totalPages: number;
  autoPlay?: boolean;
  onPageChange?: (page: number) => void;
}

export default function StoryAudioPlayer({
  audioUrl,
  currentPage,
  totalPages,
  autoPlay = true,
  onPageChange,
}: StoryAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [muted, setMuted] = useState(false);
  // Track user interaction to unlock autoplay
  const [userInteracted, setUserInteracted] = useState(false);
  const lastAutoAdvanceKeyRef = useRef<string | null>(null);

  // Load new audio when URL changes (page flip)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioUrl) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    audio.src = audioUrl;
    audio.playbackRate = speed;
    setProgress(0);

    if (autoPlay && userInteracted) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  useEffect(() => {
    lastAutoAdvanceKeyRef.current = null;
  }, [audioUrl, currentPage]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    setUserInteracted(true);
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, audioUrl]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = pct * audio.duration;
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setUserInteracted(true);

    const advanceKey = `${currentPage}:${audioUrl ?? "no-audio"}`;
    if (lastAutoAdvanceKeyRef.current === advanceKey) {
      return;
    }
    lastAutoAdvanceKeyRef.current = advanceKey;

    // Auto-advance to next page when audio ends
    if (currentPage < totalPages - 1 && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const goToPrev = () => {
    if (currentPage > 0 && onPageChange) {
      setUserInteracted(true);
      onPageChange(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages - 1 && onPageChange) {
      setUserInteracted(true);
      onPageChange(currentPage + 1);
    }
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const nextIdx = (idx + 1) % SPEEDS.length;
    setSpeed(SPEEDS[nextIdx]);
  };

  return (
    <div className="fixed left-0 right-0 z-[51] bg-white/95 backdrop-blur-md border-t border-brand-100 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] bottom-14 md:bottom-0 md:pb-2">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      <div className="max-w-4xl mx-auto px-3 pt-2.5 sm:px-4">
        {/* Progress bar */}
        <div
          className="h-1.5 bg-brand-100 rounded-full cursor-pointer relative mb-2"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prev page */}
          <button
            onClick={goToPrev}
            disabled={currentPage <= 0}
            className="p-1.5 rounded-lg text-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={!audioUrl}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors flex-shrink-0 disabled:opacity-40 disabled:pointer-events-none shadow-md"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {/* Next page */}
          <button
            onClick={goToNext}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 rounded-lg text-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Page indicator */}
          <span className="text-xs font-heading font-bold text-brand-700 min-w-[4rem] text-center">
            Pag {currentPage + 1} / {totalPages}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            className="text-xs font-heading font-bold text-brand-500 hover:text-brand-700 min-w-[2.5rem] text-center"
          >
            {speed}x
          </button>

          {/* Mute */}
          <button onClick={toggleMute} className="p-1.5 text-brand-500 hover:text-brand-700">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
