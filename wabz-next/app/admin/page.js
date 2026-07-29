"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { base44 } from "@/lib/base44Client";
import AdminMenu from "@/components/AdminMenu";
import AdminOrders from "@/components/AdminOrders";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  Users,
  MessageSquareText,
  ArrowLeft,
  Flame,
  TrendingUp,
  ShoppingBag,
  Clock,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  UserPlus,
  Mail,
  UserCheck,
  Star,
  Trash2,
} from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "users", label: "Users", icon: Users },
  { id: "feedback", label: "Feedback", icon: MessageSquareText },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    name: "",
    phone: "",
    address: "",
    delivery_radius: "",
    delivery_fee: "",
    opening_time: "",
    closing_time: "",
    footer_accent: "#e34234",
    footer_accent_secondary: "#fbbf24",
    stat_menu_items: "150+",
    stat_orders_delivered: "12K+",
    stat_avg_delivery_time: "30m",
    stat_expert_chefs: "15+",
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  /* ── Notification sound using Web Audio API ── */
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      // Two-tone chime: C5 (523 Hz) then E5 (659 Hz)
      [523, 659].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.3, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.35);
      });

      // Clean up the context after the sound finishes
      setTimeout(() => ctx.close(), 1000);
    } catch {
      // Audio not available — silent fallback
    }
  }, []);

  /* ── Badging API helpers ── */
  const updateBadge = useCallback((count) => {
    try {
      if (navigator.setAppBadge) {
        if (count > 0) navigator.setAppBadge(count);
        else navigator.clearAppBadge();
      }
    } catch {
      // Badging API not supported or permission denied
    }
  }, []);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.list(true).then(setProducts).catch(() => {}),
      base44.entities.Order.list("-created_date", 100).then(setOrders).catch(() => {}),
      base44.apiClient.get("/api/users").then((r) => {
        if (r.data) setUsers(r.data);
      }).catch(() => {}),
      base44.apiClient.get("/api/reviews").then((r) => {
        if (r.data) setReviews(r.data);
      }).catch(() => {}),
      base44.apiClient.get("/api/settings").then((r) => {
        if (r.data) setSettings((prev) => ({ ...prev, ...r.data }));
      }).catch(() => {}),
    ]).finally(() => {
      setLoading(false);
      setSettingsLoading(false);
    });
  }, []);

  /* ── Poll for new pending orders & notify ── */
  const prevPendingRef = useRef(0);
  const hasPolledRef = useRef(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const allOrders = await base44.entities.Order.list("-created_date", 100);
        const currentPending = allOrders.filter((o) => o.status === "pending").length;
        const prevPending = prevPendingRef.current;

        setOrders(allOrders);

        if (currentPending > prevPending) {
          // Only play sound for NEW orders (not the initial batch)
          if (hasPolledRef.current) playNotificationSound();
          updateBadge(currentPending);
        } else if (currentPending === 0) {
          updateBadge(0);
        }

        prevPendingRef.current = currentPending;
        hasPolledRef.current = true;
      } catch {
        // Poll error — will retry next interval
      }
    };

    const interval = setInterval(poll, 5000);
    return () => {
      clearInterval(interval);
      updateBadge(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSaved(false);
    setSettingsError("");
    try {
      const payload = {
        ...settings,
        delivery_fee: Number(settings.delivery_fee) || 0,
        delivery_radius: Number(settings.delivery_radius) || 0,
      };
      await base44.apiClient.put("/api/settings", payload);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      setSettingsError(err?.message || "Failed to save settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const setSetting = (k, v) => setSettings((f) => ({ ...f, [k]: v }));

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const inProgressOrders = orders.filter((o) =>
    ["preparing", "ready"].includes(o.status)
  ).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
                aria-label="Back to website"
              >
                <ArrowLeft size={18} />
              </Link>
              <div className="w-px h-6 bg-stone-200" />
              <div>
                <h1 className="text-base font-semibold text-stone-900">Admin</h1>
                <p className="text-[11px] text-stone-400">Manage your restaurant</p>
              </div>
            </div>

            <Link
              href="/"
              className="text-xs text-stone-400 hover:text-persimmon transition-colors"
            >
              View Site &rarr;
            </Link>
          </div>

          {/* Tabs - responsive: scrollable on mobile */}
          <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-3 text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "border-persimmon text-persimmon"
                      : "border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">
        {/* ════════════════════════════════════════════
            DASHBOARD TAB
        ════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={24} className="animate-spin text-stone-400" />
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-10">
                  {[
                    {
                      label: "Total Dishes",
                      value: products.length,
                      icon: ShoppingBag,
                      color: "text-amber-600",
                      bg: "bg-amber-50",
                    },
                    {
                      label: "Pending Orders",
                      value: pendingOrders,
                      icon: Clock,
                      color: "text-blue-600",
                      bg: "bg-blue-50",
                    },
                    {
                      label: "In Progress",
                      value: inProgressOrders,
                      icon: Flame,
                      color: "text-persimmon",
                      bg: "bg-persimmon/10",
                    },
                    {
                      label: "Revenue",
                      value: `UGX ${totalRevenue.toLocaleString()}`,
                      icon: TrendingUp,
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 hover:shadow-md hover:shadow-stone-900/5 transition-shadow"
                      >
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                          <Icon size={20} className={stat.color} />
                        </div>                          <p className="text-xl md:text-2xl font-bold text-stone-900 tabular-nums">
                          {stat.value}
                        </p>
                        <p className="text-xs text-stone-500 mt-1">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-persimmon/10 flex items-center justify-center">
                        <UtensilsCrossed size={18} className="text-persimmon" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-stone-900">
                          Menu Management
                        </h3>
                        <p className="text-xs text-stone-400">
                          {products.length} dishes &middot;{" "}
                          {products.filter((p) => p.available).length} visible
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("menu")}
                      className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-persimmon transition-colors"
                    >
                      Manage Menu
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <ClipboardList size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-stone-900">
                          Order Management
                        </h3>
                        <p className="text-xs text-stone-400">
                          {orders.length} total &middot; {pendingOrders} pending
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-persimmon transition-colors"
                    >
                      View Orders
                    </button>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="mt-10">
                  <h3 className="font-display text-xl font-semibold text-stone-900 mb-4">
                    Recent Orders
                  </h3>
                  {orders.length === 0 ? (
                    <p className="text-stone-400 text-sm py-8 text-center bg-white rounded-xl border border-stone-200">
                      No orders yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((o) => (
                        <div
                          key={o.id}
                          className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-stone-900">
                              {o.customer_name || "Guest"}
                            </p>
                            <p className="text-xs text-stone-400">
                              {o.items?.length || 0} items &middot;{" "}
                              {new Date(o.created_date).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-base font-semibold text-stone-900">
                              UGX {Number(o.total).toLocaleString()}
                            </p>
                            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {orders.length > 5 && (
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="w-full py-2.5 text-sm text-stone-500 hover:text-persimmon transition-colors"
                        >
                          View all {orders.length} orders &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════
            MENU TAB
        ════════════════════════════════════════════ */}
        {activeTab === "menu" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-stone-900">
                Menu Items
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Add, edit, or remove dishes from your menu.
              </p>
            </div>
            <AdminMenu />
          </div>
        )}

        {/* ════════════════════════════════════════════
            ORDERS TAB
        ════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-stone-900">
                Orders
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                View, filter, and update order statuses.
              </p>
            </div>
            <AdminOrders />
          </div>
        )}

        {/* ════════════════════════════════════════════
            USERS TAB
        ════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-stone-900">
                Registered Users
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                View all registered customer accounts.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-stone-400" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-stone-400 text-sm py-12 text-center bg-white rounded-xl border border-stone-200">
                No registered users yet.
              </p>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">ID</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">Phone Number</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">Email Address</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-stone-900">#{u.id}</td>
                        <td className="px-5 py-4 text-sm text-stone-700">{u.phone_number || "—"}</td>
                        <td className="px-5 py-4 text-sm text-stone-700">{u.email || "—"}</td>
                        <td className="px-5 py-4 text-sm text-stone-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════
            FEEDBACK TAB
        ════════════════════════════════════════════ */}
        {activeTab === "feedback" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-stone-900">
                Customer Feedback
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Reviews and ratings left by customers.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-stone-400" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-stone-400 text-sm py-12 text-center bg-white rounded-xl border border-stone-200">
                No reviews yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md hover:shadow-stone-900/5 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 uppercase">
                          {r.author?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{r.author}</p>
                          <p className="text-[10px] text-stone-400">
                            {r.date ? new Date(r.date).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= (r.rating || 0) ? "text-amber-400 fill-amber-400" : "text-stone-200"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════
            SETTINGS TAB
        ════════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-semibold text-stone-900">
                Restaurant Settings
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Manage your restaurant&apos;s contact info, hours, and delivery details.
              </p>
            </div>

            {settingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-stone-400" />
              </div>
            ) : (
              <form onSubmit={saveSettings} className="space-y-6">
                {/* Restaurant Name */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5 block">
                    Restaurant Name
                  </label>
                  <input
                    value={settings.name}
                    onChange={(e) => setSetting("name", e.target.value)}
                    placeholder="Wabz Foods"
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                  />
                </div>

                {/* Phone & Delivery Fee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5 block">
                      Phone Number
                    </label>
                    <input
                      value={settings.phone}
                      onChange={(e) => setSetting("phone", e.target.value)}
                      placeholder="+256 700 000 000"
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5 block">
                      Delivery Fee (UGX)
                    </label>
                    <input
                      value={settings.delivery_fee}
                      onChange={(e) => setSetting("delivery_fee", e.target.value)}
                      type="number"
                      placeholder="5000"
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5 block">
                    Address
                  </label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => setSetting("address", e.target.value)}
                    rows={2}
                    placeholder="123 Kampala Road, Kampala, Uganda"
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all resize-none"
                  />
                </div>

                {/* Delivery Radius */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5 block">
                    Delivery Radius (km)
                  </label>
                  <input
                    value={settings.delivery_radius}
                    onChange={(e) => setSetting("delivery_radius", e.target.value)}
                    type="number"
                    placeholder="10"
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                  />
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5 block">
                    Operating Hours
                  </label>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] text-stone-400 mb-1 block">Opening Time</label>
                      <input
                        value={settings.opening_time}
                        onChange={(e) => setSetting("opening_time", e.target.value)}
                        type="time"
                        className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 mb-1 block">Closing Time</label>
                      <input
                        value={settings.closing_time}
                        onChange={(e) => setSetting("closing_time", e.target.value)}
                        type="time"
                        className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Home Page Stats */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 block">
                    Home Page Statistics
                  </label>
                  <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                    Customize the numbers shown in the stats bar on the home page. These appear between the hero section and the menu.
                  </p>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] text-stone-400 mb-1 block">Menu Items</label>
                      <input
                        value={settings.stat_menu_items}
                        onChange={(e) => setSetting("stat_menu_items", e.target.value)}
                        placeholder="150+"
                        className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 mb-1 block">Orders Delivered</label>
                      <input
                        value={settings.stat_orders_delivered}
                        onChange={(e) => setSetting("stat_orders_delivered", e.target.value)}
                        placeholder="12K+"
                        className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 mb-1 block">Avg. Delivery Time</label>
                      <input
                        value={settings.stat_avg_delivery_time}
                        onChange={(e) => setSetting("stat_avg_delivery_time", e.target.value)}
                        placeholder="30m"
                        className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 mb-1 block">Expert Chefs</label>
                      <input
                        value={settings.stat_expert_chefs}
                        onChange={(e) => setSetting("stat_expert_chefs", e.target.value)}
                        placeholder="15+"
                        className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Accent Colors */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 block">
                    Footer Brand Colors
                  </label>
                  <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                    Choose the accent colors used for the brand name and highlighted words in the footer.
                  </p>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] text-stone-400 mb-1.5 block flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: settings.footer_accent || "#e34234" }}
                        />
                        Primary Accent
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          value={settings.footer_accent}
                          onChange={(e) => setSetting("footer_accent", e.target.value)}
                          type="color"
                          className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer bg-white p-0.5"
                        />
                        <input
                          value={settings.footer_accent}
                          onChange={(e) => setSetting("footer_accent", e.target.value)}
                          placeholder="#e34234"
                          className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 font-mono focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 mb-1.5 block flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: settings.footer_accent_secondary || "#fbbf24" }}
                        />
                        Secondary Accent
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          value={settings.footer_accent_secondary}
                          onChange={(e) => setSetting("footer_accent_secondary", e.target.value)}
                          type="color"
                          className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer bg-white p-0.5"
                        />
                        <input
                          value={settings.footer_accent_secondary}
                          onChange={(e) => setSetting("footer_accent_secondary", e.target.value)}
                          placeholder="#fbbf24"
                          className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 font-mono focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {settingsError && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {settingsError}
                    </span>
                  )}
                  {settingsSaved && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Settings saved!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-xl hover:bg-persimmon disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {settingsSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    Save Settings
                  </button>
                </div>
              </form>
            )}

            {/* ── Make Admin Section ── */}
            <div className="mt-12 pt-10 border-t border-stone-200">
              <h3 className="font-display text-lg font-semibold text-stone-900 flex items-center gap-2">
                <Shield size={18} className="text-persimmon" />
                Admin Management
              </h3>
              <p className="text-sm text-stone-500 mt-1 mb-6 leading-relaxed">
                Promote an existing user to admin so they can access this panel. The user must have already created an account.
              </p>

              <MakeAdminForm />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

/* ── Make Admin Form (separate component to isolate state) ── */
function MakeAdminForm() {
  const [email, setEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [result, setResult] = useState(null); // { type: "success" | "error", message }

  const handlePromote = async () => {
    if (!email.trim()) return;
    setPromoting(true);
    setResult(null);
    try {
      const res = await base44.apiClient.post("/api/admin/promote", { email: email.trim() });
      if (res?.data?.success) {
        const userName = res.data.user?.name || email.trim();
        setResult({ type: "success", message: `${userName} is now an admin!` });
        setEmail("");
      }
    } catch (err) {
      setResult({ type: "error", message: err?.message || "Failed to promote user." });
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handlePromote(); } }}
            placeholder="user@example.com"
            type="email"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all"
          />
        </div>
        <button
          onClick={handlePromote}
          disabled={promoting || !email.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-persimmon text-white text-sm font-semibold rounded-xl hover:bg-persimmon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shrink-0 shadow-lg shadow-persimmon/20"
        >
          {promoting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Promoting&hellip;
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Make Admin
            </>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${
            result.type === "success"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {result.type === "success" ? (
            <UserCheck size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          {result.message}
        </div>
      )}
    </div>
  );
}
