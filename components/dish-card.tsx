"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Check, Sparkles, SlidersHorizontal } from "lucide-react";
import { DishItem } from "./dish-options-modal";
import { useCartStore } from "@/lib/cart-store";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

interface DishCardProps {
  dish: DishItem;
  onOpenOptions: (dish: DishItem) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onOpenOptions }) => {
  const { addItem, items } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);

  // Check how many of this base dish are in cart
  const inCartCount = items
    .filter((item) => item.dishId === dish.id)
    .reduce((total, i) => total + i.quantity, 0);

  const hasOptions = dish.options && dish.options.length > 0;

  const handleAction = () => {
    if (!dish.available) return;

    if (hasOptions) {
      onOpenOptions(dish);
    } else {
      addItem(dish, [], 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-imperium-card border border-imperium-border overflow-hidden transition-all duration-300 hover:border-imperium-gold/50 hover:shadow-gold-sm ${
        !dish.available ? "opacity-60 grayscale-[40%]" : ""
      }`}
    >
      {/* Dish Image Container with 4:3 Aspect Ratio and subtle gradient */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
        <Image
          src={dish.image}
          alt={dish.name_en}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover img-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-imperium-card via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 start-3 end-3 flex items-center justify-between pointer-events-none">
          {dish.badge ? (
            <span className="px-2.5 py-1 rounded-full bg-imperium-gold/90 backdrop-blur-sm text-imperium-charcoal font-bold text-[11px] uppercase tracking-wider shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {dish.badge}
            </span>
          ) : (
            <span />
          )}

          {!dish.available && (
            <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-md">
              {en.menu.soldOutBadge}
            </span>
          )}

          {inCartCount > 0 && dish.available && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md">
              {inCartCount} in cart
            </span>
          )}
        </div>

        {/* Calories / Portion meta if provided */}
        {dish.calories && (
          <span className="absolute bottom-2 end-3 text-[10px] text-neutral-300 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {dish.calories}
          </span>
        )}
      </div>

      {/* Dish Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 className="font-serif font-bold text-lg text-imperium-ivory group-hover:text-imperium-gold transition-colors leading-snug">
              {dish.name_en}
            </h3>
          </div>

          <p className="text-xs text-imperium-creamMuted line-clamp-2 leading-relaxed mb-4">
            {dish.description_en}
          </p>
        </div>

        {/* Bottom Bar: Price & CTA */}
        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif font-bold text-lg text-imperium-gold">
                {dish.price}
              </span>
              <span className="text-xs font-semibold text-imperium-gold/80">
                {businessConfig.restaurant.currency}
              </span>
            </div>
          </div>

          <button
            onClick={handleAction}
            disabled={!dish.available}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
              !dish.available
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                : justAdded
                ? "bg-emerald-600 text-white shadow-md"
                : hasOptions
                ? "bg-imperium-surface border border-imperium-gold text-imperium-gold hover:bg-imperium-gold hover:text-imperium-charcoal"
                : "bg-gold-gradient text-imperium-charcoal shadow-gold-sm hover:brightness-110"
            }`}
            aria-label={
              !dish.available
                ? `${dish.name_en} is sold out`
                : hasOptions
                ? `Customize ${dish.name_en}`
                : `Add ${dish.name_en} to cart`
            }
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added</span>
              </>
            ) : hasOptions ? (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{en.menu.customize}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{en.menu.quickAdd}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default DishCard;
