"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MediaItem {
  url: string;
  title: string;
}

interface CarouselProps {
  items: MediaItem[];
  initialIndex: number;
  type: "image" | "video";
  onClose: () => void;
}

export default function Carousel({ items, initialIndex, type, onClose }: CarouselProps) {
  const [index, setIndex] = useState(initialIndex);
  const [loaded, setLoaded] = useState(false);

  const goTo = useCallback((dir: number) => {
    setIndex(prev => {
      let next = prev + dir;
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      return next;
    });
    setLoaded(false);
  }, [items.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    };
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) goTo(1);
      else if (e.deltaY < 0) goTo(-1);
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [goTo, onClose]);

  const item = items[index];
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 z-10 p-2 bg-dark-800/80 rounded-full hover:bg-dark-600 transition-colors">
        <X size={24} className="text-white" />
      </button>

      <button onClick={(e) => { e.stopPropagation(); goTo(-1); }}
        className="absolute left-4 z-10 p-3 bg-dark-800/80 rounded-full hover:bg-dark-600 transition-colors">
        <ChevronLeft size={28} className="text-white" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); goTo(1); }}
        className="absolute right-4 z-10 p-3 bg-dark-800/80 rounded-full hover:bg-dark-600 transition-colors">
        <ChevronRight size={28} className="text-white" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-dark-800/80 rounded-full px-4 py-1.5 text-sm text-white">
        {index + 1} / {items.length}
        {item.title && ` · ${item.title}`}
      </div>

      <div className="max-w-full max-h-full p-8" onClick={(e) => e.stopPropagation()}>
        {type === "video" ? (
          <video src={item.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg" />
        ) : (
          <img src={item.url} alt={item.title || ""}
            className={`max-w-full max-h-[80vh] rounded-lg object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)} />
        )}
      </div>
    </div>
  );
}
