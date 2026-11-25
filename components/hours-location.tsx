"use client";

import React, { useState, useEffect } from "react";
import { Clock, MapPin, Phone, MessageSquare, ExternalLink, Sparkles, Navigation } from "lucide-react";
import businessConfig from "@/config/business-config.json";
import { getQatarOperatingStatus, OperatingStatus } from "@/lib/opening-hours";
import en from "@/locales/en.json";

export const HoursLocation: React.FC = () => {
  const [status, setStatus] = useState<OperatingStatus | null>(null);

  useEffect(() => {
    setStatus(getQatarOperatingStatus());
    const interval = setInterval(() => {
      setStatus(getQatarOperatingStatus());
    }, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const daysOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;

  const currentDayLower = status?.currentDay.toLowerCase() || "";

  return (
    <section id="location" className="py-24 bg-imperium-charcoal relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-imperium-goldMuted border border-imperium-gold/30 text-imperium-gold text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{en.locationHours.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-imperium-ivory tracking-tight">
            {en.locationHours.title}
          </h2>
          <div className="ornament-divider">
            <div className="w-2.5 h-2.5 rotate-45 border border-imperium-gold bg-imperium-gold/30" />
          </div>
          <p className="text-sm sm:text-base text-imperium-creamMuted">
            {en.locationHours.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Address, Hours & Action Buttons */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Status Card */}
            <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full animate-pulse ${
                      status?.isOpen
                        ? "bg-emerald-500 shadow-[0_0_10px_#10B981]"
                        : "bg-red-500 shadow-[0_0_10px_#EF4444]"
                    }`}
                  />
                  <span className="font-serif font-bold text-lg text-imperium-ivory">
                    {status?.statusBadge || "Loading..."}
                  </span>
                </div>
                {status?.currentTimeInQatar && (
                  <span className="text-xs text-neutral-400 font-mono">
                    Qatar: {status.currentTimeInQatar}
                  </span>
                )}
              </div>

              {/* Weekly Schedule */}
              <div className="pt-4 space-y-2.5 text-xs">
                {daysOrder.map((dayKey) => {
                  const dayData = (businessConfig.openingHours.schedule as any)[dayKey];
                  const isToday = currentDayLower === dayKey;

                  return (
                    <div
                      key={dayKey}
                      className={`flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors ${
                        isToday
                          ? "bg-imperium-goldMuted border border-imperium-gold/40 text-imperium-ivory font-bold"
                          : "text-neutral-400"
                      }`}
                    >
                      <span className="capitalize flex items-center gap-1.5">
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold" />}
                        {en.locationHours.days[dayKey]}
                      </span>
                      <span className={isToday ? "text-imperium-gold" : "text-neutral-300"}>
                        {dayData.display}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Address & CR Info Card */}
            <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-imperium-goldMuted border border-imperium-gold/30 flex items-center justify-center text-imperium-gold shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-imperium-ivory">
                    {en.locationHours.addressTitle}
                  </h4>
                  <p className="text-xs text-imperium-creamMuted mt-1 leading-relaxed">
                    {businessConfig.restaurant.address}
                  </p>
                  <p className="text-[11px] text-imperium-gold font-mono mt-1">
                    GPS: {businessConfig.restaurant.coordinates.lat},{" "}
                    {businessConfig.restaurant.coordinates.lng}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Commercial Registration: CR {businessConfig.restaurant.crNumber}
                  </p>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`tel:${businessConfig.restaurant.phone}`}
                  className="py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-imperium-gold text-imperium-ivory text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-imperium-gold" />
                  <span>{en.locationHours.callStore}</span>
                </a>

                <a
                  href={`https://wa.me/${businessConfig.restaurant.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-950/70 border border-emerald-600/40 hover:border-emerald-500 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{en.locationHours.chatWhatsApp}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Google Maps Interactive Embed */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden border border-imperium-gold/30 shadow-2xl bg-neutral-900">
              <iframe
                title="IMPERIUM Restaurant Google Maps Location"
                src={`https://www.google.com/maps?q=${businessConfig.restaurant.coordinates.lat},${businessConfig.restaurant.coordinates.lng}&hl=en&z=16&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(100%)" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Gradient border vignette */}
              <div className="absolute inset-0 border border-imperium-gold/30 rounded-2xl pointer-events-none" />
            </div>

            {/* Get Directions Button */}
            <a
              href={businessConfig.restaurant.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-6 rounded-xl bg-gold-gradient text-imperium-charcoal font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-sm hover:brightness-110 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>{en.locationHours.getDirections}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HoursLocation;
