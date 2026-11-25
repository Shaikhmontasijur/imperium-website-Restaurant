"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, Check, Sparkles } from "lucide-react";
import { useCartStore, SelectedOptionChoice } from "@/lib/cart-store";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

export interface DishOptionChoice {
  id: string;
  name: string;
  price: number;
}

export interface DishOptionGroup {
  id: string;
  name: string;
  type: "single" | "multiple";
  required?: boolean;
  choices: DishOptionChoice[];
}

export interface DishItem {
  id: string;
  category: string;
  name_en: string;
  name_ar?: string;
  description_en: string;
  price: number;
  pricePlaceholder?: string;
  image: string;
  badge?: string;
  isSignature?: boolean;
  available: boolean;
  calories?: string;
  options?: DishOptionGroup[];
}

interface DishOptionsModalProps {
  dish: DishItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DishOptionsModal: React.FC<DishOptionsModalProps> = ({
  dish,
  isOpen,
  onClose,
}) => {
  const { addItem } = useCartStore();
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  // Initialize defaults when modal opens with a new dish
  useEffect(() => {
    if (dish && dish.options) {
      const defaults: Record<string, string[]> = {};
      dish.options.forEach((group) => {
        if (group.type === "single" && group.choices.length > 0) {
          defaults[group.id] = [group.choices[0].id];
        } else {
          defaults[group.id] = [];
        }
      });
      setSelectedChoices(defaults);
      setQuantity(1);
      setNote("");
    }
  }, [dish]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dish) return null;

  // Single choice selection (e.g. portion or spice)
  const handleSingleSelect = (groupId: string, choiceId: string) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [groupId]: [choiceId],
    }));
  };

  // Multiple choice selection (e.g. add-ons)
  const handleMultiSelect = (groupId: string, choiceId: string) => {
    setSelectedChoices((prev) => {
      const current = prev[groupId] || [];
      const exists = current.includes(choiceId);
      return {
        ...prev,
        [groupId]: exists
          ? current.filter((id) => id !== choiceId)
          : [...current, choiceId],
      };
    });
  };

  // Calculate total price with chosen options
  let optionsExtra = 0;
  const flattenedChoices: SelectedOptionChoice[] = [];

  dish.options?.forEach((group) => {
    const chosenIds = selectedChoices[group.id] || [];
    chosenIds.forEach((cId) => {
      const foundChoice = group.choices.find((c) => c.id === cId);
      if (foundChoice) {
        optionsExtra += foundChoice.price;
        flattenedChoices.push({
          groupId: group.id,
          groupName: group.name,
          choiceId: foundChoice.id,
          choiceName: foundChoice.name,
          price: foundChoice.price,
        });
      }
    });
  });

  const unitPrice = dish.price + optionsExtra;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addItem(dish, flattenedChoices, quantity, note);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-imperium-surface border border-imperium-gold/40 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Header Image */}
        <div className="relative h-56 w-full bg-neutral-900">
          <Image
            src={dish.image}
            alt={dish.name_en}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-imperium-surface via-transparent to-black/40" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          {dish.badge && (
            <div className="absolute top-4 start-4 px-3 py-1 rounded-full bg-imperium-gold text-imperium-charcoal font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>{dish.badge}</span>
            </div>
          )}

          {/* Title on image bottom */}
          <div className="absolute bottom-3 start-5 end-5">
            <h3 id="dish-modal-title" className="font-serif text-2xl font-bold text-imperium-ivory">
              {dish.name_en}
            </h3>
            <p className="text-sm text-imperium-gold font-medium mt-0.5">
              Base: {dish.price} {businessConfig.restaurant.currency}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-6">
          <p className="text-sm text-imperium-creamMuted leading-relaxed">
            {dish.description_en}
          </p>

          {/* Render Option Groups */}
          {dish.options && dish.options.length > 0 && (
            <div className="space-y-6 pt-2">
              {dish.options.map((group) => {
                const isSingle = group.type === "single";
                const selected = selectedChoices[group.id] || [];

                return (
                  <div key={group.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-imperium-ivory text-base">
                        {group.name}
                      </h4>
                      <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-medium">
                        {group.required ? en.optionsModal.required : en.optionsModal.optional}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {group.choices.map((choice) => {
                        const isChecked = selected.includes(choice.id);

                        return (
                          <div
                            key={choice.id}
                            onClick={() =>
                              isSingle
                                ? handleSingleSelect(group.id, choice.id)
                                : handleMultiSelect(group.id, choice.id)
                            }
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? "bg-imperium-goldMuted border-imperium-gold text-imperium-ivory shadow-sm"
                                : "bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-${
                                  isSingle ? "full" : "md"
                                } flex items-center justify-center border transition-colors ${
                                  isChecked
                                    ? "bg-imperium-gold border-imperium-gold text-imperium-charcoal"
                                    : "border-neutral-600 bg-neutral-800"
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className="text-sm font-medium">{choice.name}</span>
                            </div>

                            <span className="text-xs font-bold text-imperium-gold">
                              {choice.price > 0
                                ? `+${choice.price} ${businessConfig.restaurant.currency}`
                                : "Included"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Kitchen Special Notes */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold">
              {en.optionsModal.specialInstructions}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={en.optionsModal.instructionsPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors"
            />
          </div>
        </div>

        {/* Modal Footer with Stepper & Add Button */}
        <div className="p-5 border-t border-imperium-border bg-imperium-charcoal flex items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-imperium-ivory w-5 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-xl bg-gold-gradient text-imperium-charcoal font-bold tracking-wide uppercase text-sm shadow-gold-glow hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>{en.optionsModal.addWithTotal} {totalPrice} {businessConfig.restaurant.currency}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default DishOptionsModal;
