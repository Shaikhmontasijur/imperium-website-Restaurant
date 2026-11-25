"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Phone,
  User,
  Mail,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Navigation,
  CreditCard,
  Banknote,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

interface CheckoutPageProps {
  params: { lang: string };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { lang } = params;
  const router = useRouter();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();

  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState(businessConfig.ordering.deliveryZones[0] || "");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pickupTime, setPickupTime] = useState("ASAP");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card_on_delivery" | "online_card">("cash");

  // Geolocation state
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    mapsUrl: string;
  } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  // Honeypot spam field
  const [honeypot, setHoneypot] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee(orderType);
  const total = getTotal(orderType);
  const minOrder = businessConfig.ordering.minimumOrderAmount;

  // Analytics: begin_checkout event
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "begin_checkout", {
        currency: "QAR",
        value: total,
        items: items.map((i) => ({ item_id: i.dishId, item_name: i.name, quantity: i.quantity })),
      });
    }
  }, [total, items]);

  // Handle Browser Geolocation
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage(en.checkout.locationError);
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setGpsLocation({ latitude: lat, longitude: lng, mapsUrl });
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setGpsLoading(false);
        setErrorMessage(en.checkout.locationError);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage(en.errors.emptyCart);
      return;
    }

    if (!name.trim()) {
      setErrorMessage(en.errors.nameRequired);
      return;
    }

    // Validate Qatar phone number format
    const cleanedPhone = phone.replace(/[\s-]/g, "");
    const qatarPhoneRegex = /^(?:\+?974\s?)?[3567]\d{7}$/;
    if (!qatarPhoneRegex.test(cleanedPhone)) {
      setErrorMessage(en.errors.phoneInvalid);
      return;
    }

    if (orderType === "delivery") {
      if (!street.trim()) {
        setErrorMessage(en.errors.addressRequired);
        return;
      }
      if (!area) {
        setErrorMessage(en.errors.areaRequired);
        return;
      }
    }

    if (subtotal < minOrder) {
      setErrorMessage(
        en.checkout.minOrderNotice.replace("{amount}", minOrder.toString())
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = cleanedPhone.startsWith("+974")
        ? cleanedPhone
        : cleanedPhone.startsWith("974")
        ? `+${cleanedPhone}`
        : `+974 ${cleanedPhone}`;

      const payload = {
        orderType,
        customerName: name.trim(),
        customerPhone: formattedPhone,
        customerEmail: email.trim() || undefined,
        deliveryArea: orderType === "delivery" ? area : undefined,
        deliveryStreet: orderType === "delivery" ? street.trim() : undefined,
        deliveryBuilding: orderType === "delivery" ? building.trim() : undefined,
        deliveryLandmark: orderType === "delivery" ? landmark.trim() : undefined,
        gpsLocation: orderType === "delivery" && gpsLocation ? gpsLocation : undefined,
        pickupTime: orderType === "pickup" ? pickupTime : undefined,
        orderNotes: orderNotes.trim() || undefined,
        paymentMethod: paymentMethod === "online_card" ? "cash" : paymentMethod,
        items: items.map((i) => ({
          dishId: i.dishId,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions,
          note: i.note,
        })),
        company_website: honeypot, // Honeypot field
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || en.errors.serverError);
      }

      // Order placed successfully!
      // Analytics: order_placed event
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "purchase", {
          transaction_id: data.orderNumber,
          value: total,
          currency: "QAR",
          items: items.map((i) => ({ item_id: i.dishId, item_name: i.name, quantity: i.quantity })),
        });
      }

      // Open WhatsApp order notification in background/new tab if desired
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }

      // Clear the cart
      clearCart();

      // Redirect to customer tracking confirmation page
      router.push(`/${lang}/order/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || en.errors.serverError);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="w-16 h-16 rounded-full bg-imperium-goldMuted border border-imperium-gold/30 flex items-center justify-center text-imperium-gold mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-imperium-ivory mb-2">
          {en.cart.emptyTitle}
        </h2>
        <p className="text-sm text-imperium-creamMuted max-w-sm mb-6">
          {en.cart.emptySubtitle}
        </p>
        <Link
          href={`/${lang}#menu`}
          className="px-6 py-3 rounded-xl bg-gold-gradient text-imperium-charcoal font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:brightness-110"
        >
          {en.cart.browseMenu}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-24">
      {/* Top back link */}
      <Link
        href={`/${lang}#menu`}
        className="inline-flex items-center gap-2 text-xs font-bold text-imperium-gold hover:text-white mb-6 uppercase tracking-wider transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Menu</span>
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-imperium-ivory tracking-tight">
          {en.checkout.title}
        </h1>
        <p className="text-sm text-imperium-creamMuted mt-1">
          {en.checkout.subtitle}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Honeypot hidden input */}
          <input
            type="text"
            name="company_website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* 1. Order Type Toggle */}
          <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-4">
            <h2 className="font-serif font-bold text-base text-imperium-ivory">
              {en.checkout.orderTypeTitle}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  orderType === "delivery"
                    ? "bg-imperium-goldMuted border-imperium-gold text-imperium-ivory shadow-gold-sm"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <MapPin className="w-5 h-5 text-imperium-gold" />
                <span className="text-xs font-bold">{en.checkout.delivery}</span>
                <span className="text-[10px] text-imperium-gold">~45 mins</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  orderType === "pickup"
                    ? "bg-imperium-goldMuted border-imperium-gold text-imperium-ivory shadow-gold-sm"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <Clock className="w-5 h-5 text-imperium-gold" />
                <span className="text-xs font-bold">{en.checkout.pickup}</span>
                <span className="text-[10px] text-emerald-400">Ready in ~20 mins</span>
              </button>
            </div>
          </div>

          {/* 2. Customer Contact */}
          <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-4">
            <h2 className="font-serif font-bold text-base text-imperium-ivory">
              {en.checkout.customerDetails}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                  {en.checkout.nameLabel} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute top-1/2 start-3.5 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={en.checkout.namePlaceholder}
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                  {en.checkout.phoneLabel} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 start-3.5 -translate-y-1/2 text-xs font-bold text-imperium-gold">
                    +974
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={en.checkout.phonePlaceholder}
                    className="w-full ps-16 pe-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {en.checkout.phoneHelp}
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                  {en.checkout.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute top-1/2 start-3.5 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={en.checkout.emailPlaceholder}
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Delivery or Pickup Location Information */}
          {orderType === "delivery" ? (
            <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-base text-imperium-ivory">
                  {en.checkout.deliveryAddress}
                </h2>

                {/* Geolocation Button */}
                <button
                  type="button"
                  onClick={handleShareLocation}
                  disabled={gpsLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-600/50 text-emerald-400 hover:border-emerald-400 text-xs font-bold transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{gpsLoading ? "Acquiring GPS..." : en.checkout.shareLocationBtn}</span>
                </button>
              </div>

              {gpsSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{en.checkout.locationShared}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                    {en.checkout.areaLabel} <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory focus:outline-none focus:border-imperium-gold transition-colors"
                  >
                    {businessConfig.ordering.deliveryZones.map((z) => (
                      <option key={z} value={z} className="bg-neutral-900 text-white">
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                    {en.checkout.streetLabel} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder={en.checkout.streetPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                      {en.checkout.buildingLabel}
                    </label>
                    <input
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder={en.checkout.buildingPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                      {en.checkout.landmarkLabel}
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder={en.checkout.landmarkPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-4">
              <h2 className="font-serif font-bold text-base text-imperium-ivory">
                {en.checkout.pickupTiming}
              </h2>
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <p className="text-xs text-imperium-creamMuted">
                  Pick up at our restaurant counter:
                </p>
                <p className="text-sm font-serif font-bold text-imperium-ivory">
                  {businessConfig.restaurant.name}
                </p>
                <p className="text-xs text-neutral-400">
                  {businessConfig.restaurant.address}
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                  {en.checkout.pickupTimeLabel}
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory focus:outline-none focus:border-imperium-gold transition-colors"
                >
                  <option value="ASAP">As soon as possible (~20 mins)</option>
                  <option value="In 45 minutes">In 45 minutes</option>
                  <option value="In 1 hour">In 1 hour</option>
                  <option value="In 2 hours">In 2 hours</option>
                </select>
              </div>
            </div>
          )}

          {/* 4. Order Notes */}
          <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold">
              {en.checkout.orderNotes}
            </label>
            <textarea
              rows={3}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={en.checkout.orderNotesPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors"
            />
          </div>

          {/* 5. Payment Methods */}
          <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-4">
            <h2 className="font-serif font-bold text-base text-imperium-ivory">
              {en.checkout.paymentMethod}
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery / Pay at Counter */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "cash"
                    ? "bg-imperium-goldMuted border-imperium-gold text-imperium-ivory"
                    : "bg-neutral-900 border-neutral-800 text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="accent-imperium-gold w-4 h-4"
                  />
                  <Banknote className="w-5 h-5 text-imperium-gold" />
                  <span className="text-sm font-medium">
                    {orderType === "delivery" ? en.checkout.cod : en.checkout.payAtCounter}
                  </span>
                </div>
                <span className="text-xs text-imperium-gold font-bold">Default</span>
              </label>

              {/* Disabled Online Gateway module */}
              <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 opacity-70 cursor-not-allowed">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      disabled
                      className="accent-neutral-600 w-4 h-4"
                    />
                    <CreditCard className="w-5 h-5 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-400">
                      {en.checkout.onlineCard}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                    Launching Soon
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 ps-7">
                  {en.checkout.onlineCardDisabled}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary: Cart & Confirm CTA (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-5">
            <h3 className="font-serif font-bold text-lg text-imperium-ivory pb-3 border-b border-neutral-800">
              {en.checkout.orderSummary} ({items.length} {items.length === 1 ? "item" : "items"})
            </h3>

            {/* Item list in summary */}
            <div className="max-h-60 overflow-y-auto space-y-3 pe-1">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex items-center gap-3 text-xs">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-imperium-ivory truncate">{item.name}</p>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-[10px] text-imperium-gold truncate">
                        {item.selectedOptions.map((o) => o.choiceName).join(", ")}
                      </p>
                    )}
                    <p className="text-neutral-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-imperium-gold shrink-0">
                    {item.unitPrice * item.quantity} {businessConfig.restaurant.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>{en.cart.subtotal}</span>
                <span className="text-imperium-ivory font-medium">
                  {subtotal} {businessConfig.restaurant.currency}
                </span>
              </div>

              <div className="flex justify-between text-neutral-400">
                <span>{en.cart.deliveryFee}</span>
                <span className="text-imperium-ivory font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-bold">{en.cart.free}</span>
                  ) : (
                    `${deliveryFee} ${businessConfig.restaurant.currency}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-imperium-ivory pt-3 border-t border-neutral-800">
                <span className="font-serif">{en.cart.total}</span>
                <span className="text-imperium-gold">
                  {total} {businessConfig.restaurant.currency}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-gold-glow ${
                isSubmitting
                  ? "bg-neutral-800 text-neutral-500 cursor-wait"
                  : "bg-gold-gradient text-imperium-charcoal hover:brightness-110 active:scale-[0.99]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSubmitting ? en.checkout.placingOrder : en.checkout.placeOrderBtn}
              </span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 pt-2 text-center">
              <ShieldCheck className="w-4 h-4 text-imperium-gold" />
              <span>Direct Restaurant Dispatch • No Extra Commission</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
