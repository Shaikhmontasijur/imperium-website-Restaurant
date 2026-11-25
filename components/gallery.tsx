"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Sparkles, Maximize2 } from "lucide-react";
import en from "@/locales/en.json";

interface GalleryImage {
  src: string;
  title: string;
  category: string;
}

export const Gallery: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const galleryItems: GalleryImage[] = [
    { src: "/images/dining-ambience.jpg", title: "Royal Dining Hall & Warm Ambiance", category: "Interior" },
    { src: "/images/chicken-biryani.jpg", title: "Royal Chicken Dum Biryani Platter", category: "Dum Biryani" },
    { src: "/images/grilled-chicken.jpg", title: "Charcoal Flame-Kissed Half Chicken", category: "Charcoal Grills" },
    { src: "/images/kabsa.jpg", title: "Traditional Mandi & Kabsa Feast", category: "Arabian Specialties" },
    { src: "/images/bbq-fish.jpg", title: "Whole BBQ Charred Arabian Gulf Fish", category: "Seafood" },
    { src: "/images/black-pepper-beef.jpg", title: "Kerala Black Pepper Beef Dry Roast", category: "Mains" },
    { src: "/images/shrimp-noodles.jpg", title: "Wok-Tossed Hakka Gulf Shrimp Noodles", category: "Indo-Chinese" },
    { src: "/images/burger.jpg", title: "Loaded Double Chicken Cheese Burger", category: "Burgers" },
    { src: "/images/mojito.jpg", title: "Hand-Crushed Fresh Mint Lime Mojito", category: "Beverages" },
  ];

  // Handle keyboard arrow navigation & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === "Escape") setSelectedIdx(null);
      if (e.key === "ArrowRight") setSelectedIdx((prev) => (prev! + 1) % galleryItems.length);
      if (e.key === "ArrowLeft") setSelectedIdx((prev) => (prev! - 1 + galleryItems.length) % galleryItems.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx, galleryItems.length]);

  return (
    <section id="gallery" className="py-24 bg-imperium-charcoal relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-imperium-goldMuted border border-imperium-gold/30 text-imperium-gold text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{en.gallery.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-imperium-ivory tracking-tight">
            {en.gallery.title}
          </h2>
          <div className="ornament-divider">
            <div className="w-2.5 h-2.5 rotate-45 border border-imperium-gold bg-imperium-gold/30" />
          </div>
          <p className="text-sm sm:text-base text-imperium-creamMuted">
            {en.gallery.subtitle}
          </p>
        </div>

        {/* Masonry / Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-imperium-border cursor-pointer hover:border-imperium-gold/60 transition-all duration-300 shadow-md"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover img-zoom"
              />
              {/* Dark subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {/* Hover overlay content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <span className="text-[10px] uppercase font-bold tracking-widest text-imperium-gold">
                  {item.category}
                </span>
                <h3 className="font-serif text-base font-bold text-imperium-ivory">
                  {item.title}
                </h3>
              </div>

              {/* Zoom Icon indicator */}
              <div className="absolute top-4 end-4 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedIdx(null)}
            className="absolute top-6 end-6 p-3 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-imperium-gold"
            aria-label="Close image lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          <button
            onClick={() => setSelectedIdx((selectedIdx - 1 + galleryItems.length) % galleryItems.length)}
            className="absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={() => setSelectedIdx((selectedIdx + 1) % galleryItems.length)}
            className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors z-20"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Centered Image */}
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden border border-imperium-gold/30">
              <Image
                src={galleryItems[selectedIdx].src}
                alt={galleryItems[selectedIdx].title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-imperium-gold uppercase tracking-widest">
                {galleryItems[selectedIdx].category}
              </span>
              <h3 className="font-serif text-lg font-bold text-imperium-ivory mt-0.5">
                {galleryItems[selectedIdx].title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
export default Gallery;
