"use client";

import React, { useState, useEffect } from "react";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { SignatureDishes } from "@/components/signature-dishes";
import { MenuSection } from "@/components/menu-section";
import { Gallery } from "@/components/gallery";
import { ReviewsSection } from "@/components/reviews-section";
import { HoursLocation } from "@/components/hours-location";
import { DishOptionsModal, DishItem } from "@/components/dish-options-modal";
import defaultMenu from "@/config/menu-data.json";

export default function HomePage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;
  const [dishes, setDishes] = useState<DishItem[]>(defaultMenu as DishItem[]);
  const [selectedDish, setSelectedDish] = useState<DishItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch latest menu from /api/menu on mount to reflect real-time price & availability changes
  useEffect(() => {
    let isMounted = true;
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.menu;
          if (isMounted && items && items.length > 0) {
            setDishes(items);
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic menu, using fallback menu:", err);
      }
    }
    loadMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenOptions = (dish: DishItem) => {
    setSelectedDish(dish);
    setModalOpen(true);
  };

  const handleCloseOptions = () => {
    setModalOpen(false);
    setSelectedDish(null);
  };

  return (
    <>
      <Hero lang={lang} />
      <About lang={lang} />
      <SignatureDishes
        dishes={dishes}
        onOpenOptions={handleOpenOptions}
        lang={lang}
      />
      <MenuSection
        dishes={dishes}
        onOpenOptions={handleOpenOptions}
      />
      <Gallery />
      <ReviewsSection />
      <HoursLocation />

      {/* Dish Options Customization Modal */}
      <DishOptionsModal
        dish={selectedDish}
        isOpen={modalOpen}
        onClose={handleCloseOptions}
      />
    </>
  );
}
