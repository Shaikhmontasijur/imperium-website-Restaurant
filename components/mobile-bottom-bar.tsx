"use client";

import React from "react";
import { Phone, MessageSquare, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

export const MobileBottomBar: React.FC = () => {
  const { openCart, getItemCount, getSubtotal } = useCartStore();
  const count = getItemCount();
  const subtotal = getSubtotal();

  const phone = businessConfig.restaurant.phone;
  const whatsappNumber = businessConfig.restaurant.whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="fixed bottom-0 start-0 end-0 z-40 bg-imperium-charcoal/95 backdrop-blur-md border-t border-imperium-border px-4 py-2.5 sm:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-2.5">
        {/* Direct Call Button */}
        <a
          href={`tel:${phone}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-neutral-900 border border-neutral-700 active:bg-neutral-800 text-imperium-ivory text-xs font-bold transition-colors"
          aria-label={en.nav.callUs}
        >
          <Phone className="w-3.5 h-3.5 text-imperium-gold" />
          <span>{en.nav.callUs}</span>
        </a>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-950/80 border border-emerald-600/50 active:bg-emerald-900 text-emerald-400 text-xs font-bold transition-colors"
          aria-label={en.nav.whatsapp}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{en.nav.whatsapp}</span>
        </a>

        {/* View Cart Button */}
        <button
          onClick={openCart}
          className="flex-[1.4] flex items-center justify-between py-2.5 px-3 rounded-xl bg-gold-gradient text-imperium-charcoal text-xs font-bold shadow-gold-sm active:scale-95 transition-all"
          aria-label={`View Cart, ${count} items`}
        >
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span>{en.nav.cart}</span>
            {count > 0 && (
              <span className="w-4 h-4 rounded-full bg-imperium-charcoal text-imperium-gold text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          {subtotal > 0 && (
            <span className="font-mono text-[11px] font-black">
              {subtotal} {businessConfig.restaurant.currency}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
export default MobileBottomBar;
