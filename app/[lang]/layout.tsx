import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { getQatarOperatingStatus } from "@/lib/opening-hours";

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;
  const status = getQatarOperatingStatus();

  return (
    <div className="min-h-screen flex flex-col bg-imperium-charcoal text-imperium-ivory selection:bg-imperium-gold/30">
      <Navbar lang={lang} isOpenNow={status.isOpen} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} />
      <CartDrawer lang={lang} />
      <MobileBottomBar />
    </div>
  );
}
