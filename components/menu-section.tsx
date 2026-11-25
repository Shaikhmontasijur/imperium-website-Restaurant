"use client";

import React, { useState, useMemo } from "react";
import { Search, Flame, Utensils, Award, Coffee, Sandwich, Sparkles } from "lucide-react";
import { DishCard } from "./dish-card";
import { DishItem } from "./dish-options-modal";
import en from "@/locales/en.json";

interface MenuSectionProps {
  dishes: DishItem[];
  onOpenOptions: (dish: DishItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  dishes,
  onOpenOptions,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", name: en.menu.all, icon: Sparkles },
    { id: "biryani", name: en.menu.biryani, icon: Flame },
    { id: "grills", name: en.menu.grills, icon: Utensils },
    { id: "mains", name: en.menu.mains, icon: Award },
    { id: "chinese", name: en.menu.chinese, icon: Utensils },
    { id: "burgers", name: en.menu.burgers, icon: Sandwich },
    { id: "drinks", name: en.menu.drinks, icon: Coffee },
  ];

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCategory =
        activeCategory === "all" || dish.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        dish.name_en.toLowerCase().includes(q) ||
        dish.description_en.toLowerCase().includes(q) ||
        (dish.badge && dish.badge.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [dishes, activeCategory, searchQuery]);

  return (
    <section id="menu" className="py-24 bg-imperium-surface/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-imperium-goldMuted border border-imperium-gold/30 text-imperium-gold text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{en.menu.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-imperium-ivory tracking-tight">
            {en.menu.title}
          </h2>
          <div className="ornament-divider">
            <div className="w-2.5 h-2.5 rotate-45 border border-imperium-gold bg-imperium-gold/30" />
          </div>
          <p className="text-sm sm:text-base text-imperium-creamMuted">
            {en.menu.subtitle}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute top-1/2 start-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={en.menu.searchPlaceholder}
            className="w-full ps-11 pe-4 py-3 rounded-full bg-imperium-card border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 end-3 -translate-y-1/2 text-xs text-neutral-400 hover:text-white bg-neutral-800 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* Sticky Category Bar for Mobile & Desktop Tabs */}
        <div className="sticky top-16 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-imperium-surface/90 backdrop-blur-md border-y sm:border-y-0 sm:border-b border-imperium-border/80 mb-10 overflow-x-auto scrollbar-none flex items-center gap-2 sm:justify-center">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-gold-gradient text-imperium-charcoal shadow-gold-sm"
                    : "bg-imperium-card border border-neutral-800 text-imperium-creamMuted hover:text-white hover:border-neutral-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Cards Grid */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-16 bg-imperium-card/50 rounded-2xl border border-neutral-800">
            <p className="text-imperium-creamMuted text-sm">
              {en.menu.noDishesFound}
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-full bg-imperium-goldMuted border border-imperium-gold/30 text-imperium-gold text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onOpenOptions={onOpenOptions}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
export default MenuSection;
