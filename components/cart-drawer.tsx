"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

interface CartDrawerProps {
  lang?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ lang = "en" }) => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    getItemCount,
    clearCart,
  } = useCartStore();

  const drawerRef = useRef<HTMLDivElement>(null);
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee("delivery");
  const total = getTotal("delivery");
  const count = getItemCount();

  const freeThreshold = businessConfig.ordering.freeDeliveryThreshold;
  const remainingForFree = Math.max(0, freeThreshold - subtotal);
  const freeProgress = Math.min(100, (subtotal / freeThreshold) * 100);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label={en.cart.title}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 end-0 flex max-w-full ps-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md transform bg-imperium-surface border-s border-imperium-gold/30 shadow-2xl flex flex-col transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-imperium-border bg-imperium-charcoal/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-imperium-goldMuted flex items-center justify-center border border-imperium-gold/40 text-imperium-gold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-imperium-ivory tracking-wide">
                  {en.cart.title}
                </h2>
                <span className="text-xs text-imperium-gold font-medium">
                  {count} {en.nav.items}
                </span>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-imperium-gold"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          {items.length > 0 && (
            <div className="px-5 py-3 bg-imperium-greenDark/40 border-b border-imperium-green/40">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-imperium-ivory font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-imperium-gold" />
                  {remainingForFree > 0
                    ? en.cart.freeDeliveryNotice.replace("{amount}", remainingForFree.toString())
                    : en.cart.freeDeliveryEarned}
                </span>
                <span className="font-bold text-imperium-gold">
                  {Math.round(freeProgress)}%
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gold-gradient h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${freeProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-imperium-goldMuted flex items-center justify-center text-imperium-gold/60 mb-4 border border-imperium-gold/20">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-xl font-bold text-imperium-ivory mb-2">
                  {en.cart.emptyTitle}
                </h3>
                <p className="text-sm text-imperium-creamMuted max-w-xs mb-6">
                  {en.cart.emptySubtitle}
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-full bg-gold-gradient text-imperium-charcoal font-bold text-sm tracking-wide shadow-gold-sm hover:brightness-110 transition-all"
                >
                  {en.cart.browseMenu}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-xl bg-imperium-card border border-imperium-border flex gap-3.5 relative group hover:border-imperium-gold/40 transition-colors"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif font-bold text-sm text-imperium-ivory truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Selected Options */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[11px] text-imperium-gold/80 mt-0.5 truncate">
                          {item.selectedOptions.map((o) => o.choiceName).join(", ")}
                        </p>
                      )}

                      {/* Item note if any */}
                      {item.note && (
                        <p className="text-[11px] text-neutral-400 italic mt-0.5 truncate">
                          Note: {item.note}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800">
                      <span className="font-bold text-imperium-gold text-sm">
                        {item.unitPrice * item.quantity} {businessConfig.restaurant.currency}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="text-neutral-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-imperium-ivory">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="text-neutral-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-imperium-border bg-imperium-charcoal space-y-3">
              <div className="space-y-1.5 text-xs text-imperium-creamMuted">
                <div className="flex justify-between">
                  <span>{en.cart.subtotal}</span>
                  <span className="text-imperium-ivory font-medium">
                    {subtotal} {businessConfig.restaurant.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{en.cart.deliveryFee}</span>
                  <span className="text-imperium-ivory font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">{en.cart.free}</span>
                    ) : (
                      `${deliveryFee} ${businessConfig.restaurant.currency}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-imperium-ivory pt-2 border-t border-neutral-800">
                  <span className="font-serif">{en.cart.total}</span>
                  <span className="text-imperium-gold">
                    {total} {businessConfig.restaurant.currency}
                  </span>
                </div>
              </div>

              <Link
                href={`/${lang}/checkout`}
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gold-gradient text-imperium-charcoal font-bold tracking-wider uppercase text-sm shadow-gold-glow hover:brightness-110 active:scale-[0.99] transition-all"
              >
                <span>{en.cart.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
