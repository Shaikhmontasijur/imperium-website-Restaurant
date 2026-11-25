"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Flame,
  Truck,
  Phone,
  MessageSquare,
  Sparkles,
  MapPin,
  RefreshCw,
  AlertCircle,
  XCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { StoredOrder, OrderStatus } from "@/lib/order-schema";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

interface OrderStatusPageProps {
  params: {
    lang: string;
    orderNumber: string;
  };
}

export default function OrderStatusPage({ params }: OrderStatusPageProps) {
  const { lang, orderNumber } = params;
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Poll order status every 10 seconds
  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}`);
      if (!res.ok) {
        throw new Error("Order not found");
      }
      const data = await res.json();
      setOrder(data.order);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load order");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderNumber]);

  // Trigger celebration confetti on initial load
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#C9A24B", "#10B981", "#F5EFE0"],
      });
    } catch (e) {
      // Ignore if confetti is not available
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24 text-center">
        <RefreshCw className="w-8 h-8 text-imperium-gold animate-spin mb-4" />
        <p className="font-serif text-lg text-imperium-ivory">
          Loading order details #{orderNumber}...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24 text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="font-serif text-2xl font-bold text-imperium-ivory mb-2">
          Order Not Found
        </h2>
        <p className="text-sm text-imperium-creamMuted mb-6 max-w-sm">
          We could not find an order matching #{orderNumber}. Please check your order code or call us.
        </p>
        <Link
          href={`/${lang}`}
          className="px-6 py-2.5 rounded-xl bg-gold-gradient text-imperium-charcoal font-bold text-xs uppercase"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  const steps: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
    {
      key: "new",
      label: en.orderStatus.statusNew,
      desc: en.orderStatus.descNew,
      icon: Clock,
    },
    {
      key: "preparing",
      label: en.orderStatus.statusPreparing,
      desc: en.orderStatus.descPreparing,
      icon: Flame,
    },
    {
      key: "out_for_delivery",
      label: order.orderType === "delivery" ? en.orderStatus.statusOut : "Ready for Pickup",
      desc: order.orderType === "delivery" ? en.orderStatus.descOut : "Your feast is hot and ready at our counter.",
      icon: Truck,
    },
    {
      key: "completed",
      label: en.orderStatus.statusCompleted,
      desc: en.orderStatus.descCompleted,
      icon: CheckCircle,
    },
  ];

  const statusIndexMap: Record<OrderStatus, number> = {
    new: 0,
    preparing: 1,
    out_for_delivery: 2,
    completed: 3,
    cancelled: -1,
  };

  const currentStepIdx = statusIndexMap[order.status];
  const isCancelled = order.status === "cancelled";
  const whatsappUrl = getWhatsAppOrderUrl(order);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-24">
      {/* Top Banner */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{en.confirmation.title}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-black text-imperium-ivory tracking-tight">
          {en.confirmation.orderNumber.replace("{orderNumber}", order.orderNumber)}
        </h1>

        <p className="text-sm sm:text-base text-imperium-creamMuted max-w-md mx-auto">
          {en.confirmation.thankYou.replace("{name}", order.customerName)}
        </p>

        {/* WhatsApp Link CTA */}
        <div className="pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{en.confirmation.sendWhatsApp}</span>
          </a>
          <p className="text-[11px] text-neutral-400 mt-2 max-w-sm mx-auto">
            {en.confirmation.whatsappNotice}
          </p>
        </div>
      </div>

      {/* Live Status Tracker */}
      <div className="p-6 sm:p-8 rounded-2xl bg-imperium-card border border-imperium-border mb-8 shadow-xl">
        <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
          <div>
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold">
              {en.orderStatus.pageTitle}
            </span>
            <h2 className="font-serif text-xl font-bold text-imperium-ivory mt-0.5">
              {isCancelled ? en.orderStatus.statusCancelled : steps[currentStepIdx]?.label}
            </h2>
          </div>

          <div className="text-end">
            <span className="text-xs text-neutral-400 block font-medium">
              {order.orderType === "delivery" ? en.confirmation.estTime : en.confirmation.pickupReady}
            </span>
            <span className="font-serif font-bold text-lg text-imperium-gold">
              {order.orderType === "delivery"
                ? `~${businessConfig.ordering.estimatedDeliveryMinutes} ${en.confirmation.minutes}`
                : `~${businessConfig.ordering.estimatedPickupMinutes} ${en.confirmation.minutes}`}
            </span>
          </div>
        </div>

        {/* Status Step Indicator */}
        {isCancelled ? (
          <div className="py-8 text-center text-red-400">
            <XCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
            <p className="text-sm font-bold">{en.orderStatus.descCancelled}</p>
          </div>
        ) : (
          <div className="py-8">
            <div className="grid grid-cols-4 gap-2 relative">
              {/* Connecting line */}
              <div className="absolute top-5 start-8 end-8 h-[2px] bg-neutral-800 -z-0">
                <div
                  className="h-full bg-gold-gradient transition-all duration-700"
                  style={{ width: `${(currentStepIdx / 3) * 100}%` }}
                />
              </div>

              {steps.map((st, i) => {
                const Icon = st.icon;
                const isPassed = i <= currentStepIdx;
                const isCurrent = i === currentStepIdx;

                return (
                  <div key={st.key} className="flex flex-col items-center text-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCurrent
                          ? "bg-imperium-gold border-imperium-gold text-imperium-charcoal shadow-gold-glow animate-pulse"
                          : isPassed
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "bg-neutral-900 border-neutral-700 text-neutral-500"
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-3 leading-tight ${
                        isCurrent
                          ? "text-imperium-gold"
                          : isPassed
                          ? "text-imperium-ivory"
                          : "text-neutral-500"
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current Step Description Callout */}
            <div className="mt-8 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 text-center">
              <p className="text-xs text-imperium-creamMuted">
                {steps[currentStepIdx]?.desc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary Receipt */}
      <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-6">
        <h3 className="font-serif font-bold text-lg text-imperium-ivory pb-3 border-b border-neutral-800">
          Receipt Breakdown
        </h3>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-imperium-creamMuted">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
              Customer Details
            </span>
            <p className="font-bold text-imperium-ivory text-sm mt-0.5">{order.customerName}</p>
            <p className="font-mono text-neutral-400">{order.customerPhone}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
              {order.orderType === "delivery" ? "Delivery Address" : "Pickup Location"}
            </span>
            {order.orderType === "delivery" ? (
              <p className="mt-0.5 text-neutral-300">
                {order.deliveryStreet}, {order.deliveryArea}
                {order.deliveryBuilding && ` (Bldg: ${order.deliveryBuilding})`}
              </p>
            ) : (
              <p className="mt-0.5 text-neutral-300">
                Al Amir Street, Fereej Al Soudan, Al Rayyan
              </p>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3 pt-3 border-t border-neutral-800">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-xs">
              <div>
                <p className="font-bold text-imperium-ivory">
                  {item.quantity}x {item.name}
                </p>
                {item.selectedOptions.length > 0 && (
                  <p className="text-[11px] text-imperium-gold">
                    {item.selectedOptions.map((o) => `${o.groupName}: ${o.choiceName}`).join(", ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-[10px] text-neutral-400 italic">Note: {item.note}</p>
                )}
              </div>
              <span className="font-bold text-imperium-gold">
                {item.totalPrice} {order.currency}
              </span>
            </div>
          ))}
        </div>

        {/* Billing Calculations */}
        <div className="pt-4 border-t border-neutral-800 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-400">
            <span>Subtotal</span>
            <span>{order.subtotal} {order.currency}</span>
          </div>

          {order.orderType === "delivery" && (
            <div className="flex justify-between text-neutral-400">
              <span>Delivery Fee</span>
              <span>
                {order.deliveryFee === 0 ? (
                  <span className="text-emerald-400 font-bold">FREE</span>
                ) : (
                  `${order.deliveryFee} ${order.currency}`
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold text-imperium-ivory pt-2 border-t border-neutral-800">
            <span className="font-serif">Total Payable</span>
            <span className="text-imperium-gold font-bold">
              {order.total} {order.currency}
            </span>
          </div>
        </div>

        {/* Contact Restaurant Box */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-neutral-400">
            {en.confirmation.restaurantContact}
          </span>
          <a
            href={`tel:${businessConfig.restaurant.phone}`}
            className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-imperium-gold text-imperium-ivory font-bold flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-imperium-gold" />
            <span>Call Restaurant</span>
          </a>
        </div>
      </div>
    </div>
  );
}
