"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  LogOut,
  RefreshCw,
  Bell,
  BellOff,
  Clock,
  CheckCircle,
  Truck,
  Flame,
  XCircle,
  Phone,
  MapPin,
  ExternalLink,
  Sliders,
  DollarSign,
  Utensils,
  AlertCircle,
} from "lucide-react";
import { StoredOrder, OrderStatus } from "@/lib/order-schema";
import { DishItem } from "@/components/dish-options-modal";
import businessConfig from "@/config/business-config.json";
import en from "@/locales/en.json";

interface AdminPageProps {
  params: { lang: string };
}

export default function AdminPage({ params }: AdminPageProps) {
  const { lang } = params;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "settings">("orders");

  // Orders state
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);

  // Audio alerts for new orders
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastKnownCountRef = useRef(0);

  // Menu management state
  const [menuItems, setMenuItems] = useState<DishItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");

  // Synthesize pleasant kitchen chime sound using Web Audio API
  const playNewOrderSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error(en.errors.adminAuthFailed);
      }

      setIsAuthenticated(true);
      fetchOrders();
      fetchMenu();
    } catch (err: any) {
      setAuthError(err.message || en.errors.adminAuthFailed);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setIsAuthenticated(false);
    setPassword("");
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders", {
        headers: { "x-admin-key": password || "imperium2026" },
      });
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: StoredOrder[] = data.orders || [];
        if (typeof data.isDbConnected === "boolean") {
          setIsDbConnected(data.isDbConnected);
        }

        // Check if there are newly arrived orders
        const newOrdersCount = incomingOrders.filter((o) => o.status === "new").length;
        if (newOrdersCount > lastKnownCountRef.current && lastKnownCountRef.current !== 0) {
          playNewOrderSound();
        }
        lastKnownCountRef.current = newOrdersCount;

        setOrders(incomingOrders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch menu
  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        // /api/menu returns array or { menu: [] }
        setMenuItems(Array.isArray(data) ? data : data.menu || []);
      }
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Auto-refresh orders every 15 seconds (chime sounds if new orders arrive)
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchOrders, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, password, soundEnabled]);

  // Update order status
  const handleUpdateStatus = async (orderNumber: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": password || "imperium2026",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.orderNumber === orderNumber ? data.order : o))
        );
        if (selectedOrder?.orderNumber === orderNumber) {
          setSelectedOrder(data.order);
        }
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  // Toggle dish availability (Sold Out / In Stock)
  const handleToggleAvailability = async (dishId: string, currentAvailable: boolean) => {
    try {
      const res = await fetch("/api/menu", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": password || "imperium2026",
        },
        body: JSON.stringify({ dishId, available: !currentAvailable }),
      });

      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((d) => (d.id === dishId ? { ...d, available: !currentAvailable } : d))
        );
      }
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    }
  };

  // Save dish price
  const handleSavePrice = async (dishId: string) => {
    const numericPrice = parseFloat(tempPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) return;

    try {
      const res = await fetch("/api/menu", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": password || "imperium2026",
        },
        body: JSON.stringify({ dishId, price: numericPrice }),
      });

      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((d) => (d.id === dishId ? { ...d, price: numericPrice } : d))
        );
        setEditingPriceId(null);
      }
    } catch (err) {
      console.error("Failed to save price:", err);
    }
  };

  // If not logged in, render Admin Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md p-8 rounded-2xl bg-imperium-card border border-imperium-gold/40 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-imperium-goldMuted border border-imperium-gold/30 flex items-center justify-center text-imperium-gold mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-imperium-ivory">
              {en.admin.loginTitle}
            </h1>
            <p className="text-xs text-imperium-creamMuted">
              Authorized Kitchen Staff & Management Portal
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: imperium2026)"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-imperium-ivory placeholder-neutral-500 focus:outline-none focus:border-imperium-gold transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-imperium-charcoal font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:brightness-110 active:scale-95 transition-all"
            >
              {en.admin.loginBtn}
            </button>
          </form>

          <p className="text-[11px] text-neutral-500 text-center">
            Default credentials: <code className="text-imperium-gold">imperium2026</code>
          </p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  const newOrdersCount = orders.filter((o) => o.status === "new").length;

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-24">
      {/* Top Admin Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-imperium-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-imperium-goldMuted border border-imperium-gold/30 flex items-center justify-center text-imperium-gold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-imperium-ivory">
              {en.admin.title}
            </h1>
            <p className="text-xs text-imperium-gold font-medium">
              Live Dispatch • Commercial Registration: {businessConfig.restaurant.crNumber}
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? "bg-emerald-950/70 border-emerald-600/50 text-emerald-400"
                : "bg-neutral-900 border-neutral-800 text-neutral-500"
            }`}
            title="Toggle Audio Notifications"
          >
            {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? "Audio On" : "Audio Muted"}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchOrders();
              fetchMenu();
            }}
            disabled={loadingOrders}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingOrders ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">{en.admin.refresh}</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 hover:border-red-400 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">{en.admin.logout}</span>
          </button>
        </div>
      </div>

      {/* Database Not Connected Alert Banner */}
      {!isDbConnected && (
        <div className="mt-4 p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Database not connected: </span>
              Supabase credentials (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are missing in environment variables. New orders will still route via WhatsApp, but cannot be saved or modified in this admin board until configured.
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-900/80 border border-amber-600/50 text-[10px] font-bold tracking-wider uppercase shrink-0 text-amber-200">
            Offline Mode
          </span>
        </div>
      )}

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-3 my-6 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-gold-gradient text-imperium-charcoal shadow-gold-sm"
              : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          <span>{en.admin.tabOrders}</span>
          {newOrdersCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
              {newOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("menu")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
            activeTab === "menu"
              ? "bg-gold-gradient text-imperium-charcoal shadow-gold-sm"
              : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{en.admin.tabMenu}</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
            activeTab === "settings"
              ? "bg-gold-gradient text-imperium-charcoal shadow-gold-sm"
              : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{en.admin.tabSettings}</span>
        </button>
      </div>

      {/* TAB 1: LIVE ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: en.admin.filterAll },
              { id: "new", label: "New Orders", count: newOrdersCount },
              { id: "preparing", label: "Preparing" },
              { id: "out_for_delivery", label: "Out for Delivery" },
              { id: "completed", label: "Completed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  statusFilter === f.id
                    ? "bg-imperium-gold text-imperium-charcoal"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <span>{f.label}</span>
                {f.count !== undefined && f.count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Orders Layout: List + Details Panel */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-imperium-card border border-imperium-border text-neutral-400">
              <Clock className="w-10 h-10 mx-auto mb-3 text-neutral-600" />
              <p className="font-serif text-lg text-imperium-ivory">{en.admin.noOrders}</p>
              <p className="text-xs text-neutral-500 mt-1">Orders placed by customers will appear here in real time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Order Cards List (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {filteredOrders.map((ord) => {
                  const isNew = ord.status === "new";
                  const isSelected = selectedOrder?.orderNumber === ord.orderNumber;

                  return (
                    <div
                      key={ord.orderNumber}
                      onClick={() => setSelectedOrder(ord)}
                      className={`p-5 rounded-2xl bg-imperium-card border cursor-pointer transition-all ${
                        isSelected
                          ? "border-imperium-gold ring-1 ring-imperium-gold"
                          : isNew
                          ? "border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          : "border-imperium-border hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-black text-lg text-imperium-ivory">
                              #{ord.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                ord.status === "new"
                                  ? "bg-emerald-500 text-black animate-pulse"
                                  : ord.status === "preparing"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : ord.status === "out_for_delivery"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                                  : ord.status === "completed"
                                  ? "bg-neutral-800 text-neutral-400"
                                  : "bg-red-950 text-red-400"
                              }`}
                            >
                              {ord.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs text-imperium-creamMuted mt-0.5">
                            {ord.customerName} • {ord.customerPhone}
                          </p>
                        </div>

                        <span className="font-serif font-bold text-base text-imperium-gold">
                          {ord.total} {ord.currency}
                        </span>
                      </div>

                      {/* Summary of items */}
                      <p className="text-xs text-neutral-400 line-clamp-1 mb-3">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>

                      {/* Quick Status Action Buttons */}
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-neutral-800" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleUpdateStatus(ord.orderNumber, "preparing")}
                          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] font-bold text-amber-400 flex items-center gap-1"
                        >
                          <Flame className="w-3 h-3" />
                          <span>Preparing</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(ord.orderNumber, "out_for_delivery")}
                          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] font-bold text-blue-400 flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Out for Delivery</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(ord.orderNumber, "completed")}
                          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] font-bold text-emerald-400 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Completed</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(ord.orderNumber, "cancelled")}
                          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] font-bold text-red-400 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Detail Panel (5 cols) */}
              <div className="lg:col-span-5 sticky top-24">
                {selectedOrder ? (
                  <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-gold/40 shadow-xl space-y-5">
                    <div className="flex justify-between items-start pb-4 border-b border-neutral-800">
                      <div>
                        <span className="text-xs text-neutral-400 uppercase font-bold">
                          Selected Order Details
                        </span>
                        <h2 className="font-serif font-black text-xl text-imperium-ivory mt-0.5">
                          #{selectedOrder.orderNumber}
                        </h2>
                      </div>
                      <Link
                        href={`/${lang}/order/${selectedOrder.orderNumber}`}
                        target="_blank"
                        className="text-xs text-imperium-gold hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Customer Status Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Customer Contact */}
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-imperium-ivory">
                          {selectedOrder.customerName}
                        </span>
                        <a
                          href={`tel:${selectedOrder.customerPhone}`}
                          className="px-2.5 py-1 rounded bg-imperium-goldMuted border border-imperium-gold/30 text-imperium-gold font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      </div>
                      <p className="font-mono text-neutral-300">{selectedOrder.customerPhone}</p>
                      {selectedOrder.customerEmail && (
                        <p className="text-neutral-400">{selectedOrder.customerEmail}</p>
                      )}
                    </div>

                    {/* Delivery / Pickup address */}
                    <div className="text-xs space-y-1 text-neutral-300">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        {selectedOrder.orderType === "delivery" ? "Delivery Destination" : "Pickup Timing"}
                      </span>
                      {selectedOrder.orderType === "delivery" ? (
                        <>
                          <p className="font-bold text-imperium-ivory">
                            {selectedOrder.deliveryStreet}, {selectedOrder.deliveryArea}
                          </p>
                          {selectedOrder.deliveryBuilding && (
                            <p>Building/Villa: {selectedOrder.deliveryBuilding}</p>
                          )}
                          {selectedOrder.deliveryLandmark && (
                            <p className="text-neutral-400">Landmark: {selectedOrder.deliveryLandmark}</p>
                          )}
                          {selectedOrder.gpsLocation?.mapsUrl && (
                            <a
                              href={selectedOrder.gpsLocation.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-400 hover:underline pt-1 font-bold"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>View GPS Location on Google Maps</span>
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="font-bold text-imperium-ivory">{selectedOrder.pickupTime || "ASAP"}</p>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="space-y-3 pt-3 border-t border-neutral-800">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        Ordered Items
                      </span>
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <div>
                            <p className="font-bold text-imperium-ivory">
                              {item.quantity}x {item.name}
                            </p>
                            {item.selectedOptions.length > 0 && (
                              <p className="text-[10px] text-imperium-gold">
                                {item.selectedOptions.map((o) => `${o.groupName}: ${o.choiceName}`).join(", ")}
                              </p>
                            )}
                            {item.note && (
                              <p className="text-[10px] text-neutral-400 italic">Note: {item.note}</p>
                            )}
                          </div>
                          <span className="font-bold text-imperium-gold">
                            {item.totalPrice} {selectedOrder.currency}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-sm font-bold">
                      <span className="text-neutral-400">Total Payable ({selectedOrder.paymentMethod})</span>
                      <span className="font-serif text-lg text-imperium-gold">
                        {selectedOrder.total} {selectedOrder.currency}
                      </span>
                    </div>

                    {/* Kitchen Instructions */}
                    {selectedOrder.orderNotes && (
                      <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                          Special Instructions:
                        </span>
                        <p className="text-amber-200 italic">{selectedOrder.orderNotes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-imperium-card border border-neutral-800 text-center text-neutral-400">
                    <p className="text-xs">Click on any order on the left to inspect full kitchen details.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENU MANAGEMENT (Sold Out & Price Edits) */}
      {activeTab === "menu" && (
        <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
            <div>
              <h2 className="font-serif text-xl font-bold text-imperium-ivory">
                Dish Inventory & Pricing
              </h2>
              <p className="text-xs text-imperium-creamMuted">
                Instant toggles for kitchen stock and price adjustments without code edits.
              </p>
            </div>
            <span className="text-xs font-bold text-imperium-gold">
              {menuItems.length} dishes in catalog
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((dish) => (
              <div
                key={dish.id}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                    <Image
                      src={dish.image}
                      alt={dish.name_en}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-sm text-imperium-ivory truncate">
                      {dish.name_en}
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider text-imperium-gold">
                      {dish.category}
                    </span>

                    {/* Price edit */}
                    <div className="mt-1 flex items-center gap-1.5">
                      {editingPriceId === dish.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="w-16 px-1.5 py-0.5 rounded bg-black border border-imperium-gold text-xs text-imperium-ivory font-bold"
                          />
                          <button
                            onClick={() => handleSavePrice(dish.id)}
                            className="px-2 py-0.5 rounded bg-imperium-gold text-black text-[10px] font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs text-imperium-gold">
                            {dish.price} {businessConfig.restaurant.currency}
                          </span>
                          <button
                            onClick={() => {
                              setEditingPriceId(dish.id);
                              setTempPrice(dish.price.toString());
                            }}
                            className="text-[10px] text-neutral-400 hover:text-white underline ms-1"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Toggle Button */}
                <button
                  onClick={() => handleToggleAvailability(dish.id, dish.available)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                    dish.available
                      ? "bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 hover:bg-red-950/60 hover:text-red-300 hover:border-red-600/40"
                      : "bg-red-950/80 border border-red-600/50 text-red-400 hover:bg-emerald-950/80 hover:text-emerald-300 hover:border-emerald-600/50"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dish.available ? "bg-emerald-400" : "bg-red-500"
                    }`}
                  />
                  <span>{dish.available ? "In Stock (Available)" : "Marked Sold Out"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESTAURANT SETTINGS & HOURS */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-4">
            <h3 className="font-serif font-bold text-lg text-imperium-ivory">
              Operating Schedule (Asia/Qatar)
            </h3>
            <div className="space-y-2 text-xs">
              {Object.entries(businessConfig.openingHours.schedule).map(([day, val]: any) => (
                <div key={day} className="flex justify-between py-1.5 px-3 rounded-lg bg-neutral-900">
                  <span className="capitalize font-bold text-imperium-ivory">{day}</span>
                  <span className="text-imperium-gold">{val.display}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-imperium-card border border-imperium-border space-y-4">
            <h3 className="font-serif font-bold text-lg text-imperium-ivory">
              Business Rules & Thresholds
            </h3>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex justify-between py-2 border-b border-neutral-800">
                <span>Minimum Order Amount</span>
                <span className="font-bold text-imperium-gold">{businessConfig.ordering.minimumOrderAmount} QAR</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-800">
                <span>Standard Delivery Fee</span>
                <span className="font-bold text-imperium-gold">{businessConfig.ordering.deliveryFee} QAR</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-800">
                <span>Free Delivery Threshold</span>
                <span className="font-bold text-imperium-gold">{businessConfig.ordering.freeDeliveryThreshold} QAR</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-800">
                <span>Allow Pre-orders When Closed</span>
                <span className="font-bold text-emerald-400">
                  {businessConfig.ordering.allowPreordersWhenClosed ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span>Online Card Payment Gateway</span>
                <span className="font-bold text-neutral-400">Disabled (Ready for SkipCash)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
