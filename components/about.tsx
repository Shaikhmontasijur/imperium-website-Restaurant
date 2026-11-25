import React from "react";
import Image from "next/image";
import { Flame, Sparkles, UtensilsCrossed, Award } from "lucide-react";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

interface AboutProps {
  lang?: string;
}

export const About: React.FC<AboutProps> = ({ lang = "en" }) => {
  return (
    <section id="about" className="py-24 bg-imperium-surface/60 relative overflow-hidden border-t border-imperium-border">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 start-0 w-96 h-96 bg-imperium-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Brand Story & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-imperium-goldMuted border border-imperium-gold/30 text-imperium-gold text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{en.about.sectionTag}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-imperium-ivory tracking-tight leading-tight">
              {en.about.title}
            </h2>

            <div className="w-16 h-1 bg-imperium-gold rounded-full" />

            <div className="space-y-4 text-imperium-creamMuted text-sm sm:text-base leading-relaxed">
              <p>{en.about.p1}</p>
              <p>{en.about.p2}</p>
            </div>

            {/* 3 Cuisine Highlights with Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* Highlight 1: Biryani */}
              <div className="p-4 rounded-xl bg-imperium-card border border-imperium-border hover:border-imperium-gold/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-imperium-goldMuted border border-imperium-gold/30 flex items-center justify-center text-imperium-gold mb-3">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-imperium-ivory mb-1">
                  {en.about.highlight1Title}
                </h3>
                <p className="text-xs text-imperium-creamMuted leading-normal">
                  {en.about.highlight1Desc}
                </p>
              </div>

              {/* Highlight 2: Charcoal Grills */}
              <div className="p-4 rounded-xl bg-imperium-card border border-imperium-border hover:border-imperium-gold/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-imperium-ivory mb-1">
                  {en.about.highlight2Title}
                </h3>
                <p className="text-xs text-imperium-creamMuted leading-normal">
                  {en.about.highlight2Desc}
                </p>
              </div>

              {/* Highlight 3: Indo-Chinese */}
              <div className="p-4 rounded-xl bg-imperium-card border border-imperium-border hover:border-imperium-gold/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-imperium-goldMuted border border-imperium-gold/30 flex items-center justify-center text-imperium-gold mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-imperium-ivory mb-1">
                  {en.about.highlight3Title}
                </h3>
                <p className="text-xs text-imperium-creamMuted leading-normal">
                  {en.about.highlight3Desc}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Verified Storefront Image with Signboard aesthetic */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-imperium-gold/40 shadow-2xl group">
              <Image
                src="/images/storefront.jpg"
                alt="IMPERIUM Restaurant Storefront and Dining Facade in Qatar"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover img-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-imperium-charcoal via-transparent to-black/30" />

              {/* Storefront Floating Tag */}
              <div className="absolute bottom-4 start-4 end-4 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-neutral-700/80 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-imperium-ivory">
                    {businessConfig.restaurant.name}
                  </h4>
                  <p className="text-xs text-imperium-gold">
                    CR No: {businessConfig.restaurant.crNumber} • Al Rayyan, Qatar
                  </p>
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981] animate-pulse" />
              </div>
            </div>

            {/* Decorative Gold Backdrop Corner */}
            <div className="absolute -bottom-4 -end-4 w-32 h-32 border-2 border-imperium-gold/30 rounded-2xl -z-10 hidden sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
};
export default About;
