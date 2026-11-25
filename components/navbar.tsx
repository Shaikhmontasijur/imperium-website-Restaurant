"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Phone, Clock, MapPin, Sparkles } from "lucide-react";
import { ImperiumLogo } from "./imperium-logo";
import { useCartStore } from "@/lib/cart-store";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

interface NavbarProps {
  lang?: string;
  isOpenNow?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ lang = "en", isOpenNow = true }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCart, getItemCount, getSubtotal } = useCartStore();

  const cartCount = getItemCount();
  const subtotal = getSubtotal();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: en.nav.home, href: `/${lang}#hero` },
    { name: en.nav.about, href: `/${lang}#about` },
    { name: en.nav.signature, href: `/${lang}#signature` },
    { name: en.nav.menu, href: `/${lang}#menu` },
    { name: en.nav.gallery, href: `/${lang}#gallery` },
    { name: en.nav.reviews, href: `/${lang}#reviews` },
    { name: en.nav.hoursLocation, href: `/${lang}#location` },
  ];

  return (
    <>
      <header
        className={`fixed top-0 start-0 end-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-imperium-charcoal/95 backdrop-blur-md border-b border-imperium-gold/20 py-3 shadow-xl"
            : "bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${lang}`} className="focus:outline-none focus:ring-2 focus:ring-imperium-gold rounded-lg">
            <ImperiumLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-semibold tracking-wider uppercase text-imperium-ivory/90 hover:text-imperium-gold transition-colors relative py-1 after:absolute after:bottom-0 after:start-0 after:w-0 after:h-[2px] after:bg-imperium-gold hover:after:w-full after:transition-all"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Open/Closed indicator (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-700/60 text-xs">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isOpenNow ? "bg-emerald-500 shadow-[0_0_8px_#10B981]" : "bg-red-500 shadow-[0_0_8px_#EF4444]"
                }`}
              />
              <span className="text-[11px] font-medium text-imperium-creamMuted">
                {isOpenNow ? en.nav.openNow : en.nav.closed}
              </span>
            </div>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-imperium-surface/90 border border-imperium-gold/40 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-charcoal transition-all duration-200 shadow-sm flex items-center gap-2"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-imperium-redAccent text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              {subtotal > 0 && (
                <span className="hidden md:inline font-bold text-xs tracking-tight">
                  {subtotal} {businessConfig.restaurant.currency}
                </span>
              )}
            </button>

            {/* Order Now CTA (Desktop) */}
            <Link
              href={`/${lang}#menu`}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-imperium-charcoal font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{en.nav.orderNow}</span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 end-0 w-3/4 max-w-xs bg-imperium-surface border-s border-imperium-gold/30 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center pb-6 border-b border-neutral-800">
                <ImperiumLogo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links */}
              <div className="flex flex-col gap-4 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-serif text-lg text-imperium-ivory hover:text-imperium-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom contact info inside mobile menu */}
            <div className="pt-6 border-t border-neutral-800 space-y-3">
              <a
                href={`tel:${businessConfig.restaurant.phone}`}
                className="flex items-center gap-2.5 text-xs text-imperium-creamMuted hover:text-imperium-gold"
              >
                <Phone className="w-4 h-4 text-imperium-gold" />
                <span>{businessConfig.restaurant.phone}</span>
              </a>
              <div className="flex items-center gap-2.5 text-xs text-imperium-creamMuted">
                <Clock className="w-4 h-4 text-imperium-gold" />
                <span>{isOpenNow ? "Open Today (11:00 AM - 1:00 AM)" : "Closed Now"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-imperium-creamMuted">
                <MapPin className="w-4 h-4 text-imperium-gold" />
                <span>Al Amir St, Al Rayyan, Qatar</span>
              </div>
              <p className="text-[10px] text-neutral-500 pt-2">CR No: {businessConfig.restaurant.crNumber}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Navbar;
