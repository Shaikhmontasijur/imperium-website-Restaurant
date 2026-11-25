"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { DishCard } from "./dish-card";
import { DishItem } from "./dish-options-modal";
import en from "@/locales/en.json";

interface SignatureDishesProps {
  dishes: DishItem[];
  onOpenOptions: (dish: DishItem) => void;
  lang?: string;
}

export const SignatureDishes: React.FC<SignatureDishesProps> = ({
  dishes,
  onOpenOptions,
  lang = "en",
}) => {
  // Filter the 6 signature dishes: biryani, kabsa, grilled chicken, bbq fish, black pepper beef, burger
  const signatureDishes = dishes.filter((d) => d.isSignature).slice(0, 6);

  return (
    <section id="signature" className="py-24 bg-imperium-charcoal relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-imperium-goldMuted border border-imperium-gold/30 text-imperium-gold text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{en.signature.sectionTag}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-imperium-ivory tracking-tight">
              {en.signature.title}
            </h2>
            <p className="text-sm sm:text-base text-imperium-creamMuted max-w-xl">
              {en.signature.subtitle}
            </p>
          </div>

          <Link
            href={`/${lang}#menu`}
            className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-imperium-gold hover:text-white transition-colors group"
          >
            <span>{en.signature.viewAll}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 6 Signature Dish Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {signatureDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onOpenOptions={onOpenOptions}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
export default SignatureDishes;
