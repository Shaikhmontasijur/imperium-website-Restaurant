import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Utensils, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import en from "@/locales/en.json";

interface HeroProps {
  lang?: string;
}

export const Hero: React.FC<HeroProps> = ({ lang = "en" }) => {
  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Food Photography with Dark Regal Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-banner.jpg"
          alt="IMPERIUM Restaurant Royal Feast of Indian and Arabic Grills"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Layered dark charcoal gradients and emerald green ambiance from signboard */}
        <div className="absolute inset-0 bg-gradient-to-t from-imperium-charcoal via-imperium-charcoal/75 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(31,61,46,0.45)_0%,_transparent_75%)] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Top Gold Foil Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-imperium-surface/90 border border-imperium-gold/40 shadow-gold-sm mb-6 animate-fade-in backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-imperium-gold animate-pulse" />
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-imperium-ivory">
            {en.hero.badge}
          </span>
        </div>

        {/* Regal Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black text-imperium-ivory tracking-tight leading-[1.1] max-w-4xl drop-shadow-lg">
          {en.hero.titlePrefix}{" "}
          <span className="bg-gradient-to-r from-imperium-gold via-[#F7E7B4] to-imperium-gold bg-clip-text text-transparent">
            {en.hero.titleHighlight}
          </span>
        </h1>

        {/* Arabesque geometric divider */}
        <div className="ornament-divider my-6">
          <div className="w-2.5 h-2.5 rotate-45 border border-imperium-gold bg-imperium-gold/30" />
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-imperium-creamMuted max-w-2xl font-light leading-relaxed mb-10 drop-shadow">
          {en.hero.subtitle}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href={`/${lang}#menu`}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold-gradient text-imperium-charcoal font-bold text-sm uppercase tracking-wider shadow-gold-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
          >
            <Flame className="w-4 h-4 text-imperium-charcoal" />
            <span>{en.hero.ctaOrder}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href={`/${lang}#signature`}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-imperium-surface/80 border border-imperium-gold/50 text-imperium-ivory hover:text-imperium-gold hover:border-imperium-gold hover:bg-neutral-900/90 font-bold text-sm uppercase tracking-wider backdrop-blur-sm transition-all flex items-center justify-center gap-2"
          >
            <Utensils className="w-4 h-4 text-imperium-gold" />
            <span>{en.hero.ctaMenu}</span>
          </Link>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-14 pt-8 border-t border-neutral-800/80 w-full max-w-3xl flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-imperium-creamMuted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-imperium-ivory">{en.hero.trustDine}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-imperium-gold" />
            <span className="font-semibold text-imperium-ivory">{en.hero.trustTakeaway}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-imperium-ivory">{en.hero.trustDelivery}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-imperium-gold" />
            <span>100% Halal Certified</span>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
