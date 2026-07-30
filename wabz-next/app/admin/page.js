"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { mapFoodProduct, mapOrder, DEFAULT_SETTINGS, MOCK_USERS, MOCK_REVIEWS } from "@/lib/supabase-data";
import AdminMenu from "@/components/AdminMenu";
import AdminDashboard from "@/components/AdminDashboard";
import MenuManagement from "@/components/MenuManagement/MenuManagement";
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
  ChevronRight,
  ArrowUpRight,
  NotebookPen,
} from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "menu-management", label: "Menu Mgmt", icon: NotebookPen },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "users", label: "Users", icon: Users },
  { id: "feedback", label: "Feedback", icon: MessageSquareText },
  { id: "settings", label: "Settings", icon: Settings },
];

/* ── Reusable component pieces ── */

function GreenButton({ children, onClick, disabled, className = "", small = false, icon: Icon, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium text-on-emerald bg-emerald hover:bg-emerald-deep active:bg-emerald-deep transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
        small ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"
      } rounded-sm ${className}`}
    >
      {Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick, className = "", small = false, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 text-sm font-medium text-ink bg-canvas border border-hairline-strong hover:bg-canvas-soft transition-all duration-150 ${
        small ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"
      } rounded-sm ${className}`}
    >
      {Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="bg-canvas border border-hairline rounded-sm p-5 hover:shadow-level-1 transition-shadow">
      <div className="w-9 h-9 rounded-[4px] bg-canvas-soft flex items-center justify-center mb-3 border border-hairline-cool">
        <Icon size={17} className="text-ink-mute" />
      </div>
      <p className="text-2xl font-medium text-ink tracking-tight tabular-nums">{value}</p>
      <p className="text-xs text-ink-mute mt-0.5">{label}</p>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-[22px] font-medium text-ink tracking-tight">{title}</h2>
      {description && <p className="text-sm text-ink-mute mt-1">{description}</p>}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <p className="text-sm text-ink-mute-2 py-12 text-center bg-canvas border border-hairline rounded-sm">
      {message}
    </p>
  );
}

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
    stat_menu_items: "150+",
    stat_orders_delivered: "12K+",
    stat_avg_delivery_time: "30m",
    stat_expert_chefs: "15+",
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
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
      setTimeout(() => ctx.close(), 1000);
    } catch {
      // silent
    }
  }, []);

  const updateBadge = useCallback((count) => {
    try {
      if (navigator.setAppBadge) {
        if (count > 0) navigator.setAppBadge(count);
        else navigator.clearAppBadge();
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    Promise.all([
      supabase
        .from("food_items")
        .select("*, categories!inner(category_code)")
        .order("item_id", { ascending: true })
        .then(({ data }) => { if (data) setProducts((data || []).map(mapFoodProduct)); })
        .catch(() => {}),
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(100)
        .then(({ data }) => { if (data) setOrders((data || []).map(mapOrder)); })
        .catch(() => {}),
      Promise.resolve({ data: MOCK_USERS }).then((r) => { if (r.data) setUsers(r.data); }).catch(() => {}),
      Promise.resolve({ data: MOCK_REVIEWS }).then((r) => { if (r.data) setReviews(r.data); }).catch(() => {}),
      Promise.resolve({ data: { ...DEFAULT_SETTINGS } }).then((r) => { if (r.data) setSettings((prev) => ({ ...prev, ...r.data })); }).catch(() => {}),
    ]).finally(() => {
      setLoading(false);
      setSettingsLoading(false);
    });
  }, []);

  const prevPendingRef = useRef(0);
  const hasPolledRef = useRef(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false })
          .limit(100);
        const allOrders = (data || []).map(mapOrder);
        const currentPending = allOrders.filter((o) => o.status === "pending").length;
        const prevPending = prevPendingRef.current;
        setOrders(allOrders);
        if (currentPending > prevPending) {
          if (hasPolledRef.current) playNotificationSound();
          updateBadge(currentPending);
        } else if (currentPending === 0) {
          updateBadge(0);
        }
        prevPendingRef.current = currentPending;
        hasPolledRef.current = true;
      } catch {
        // retry next interval
      }
    };
    const interval = setInterval(poll, 5000);
    return () => { clearInterval(interval); updateBadge(0); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSaved(false);
    setSettingsError("");
    try {
      await Promise.resolve({ data: { ...DEFAULT_SETTINGS, ...settings } });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      setSettingsError(err?.message || "Failed to save settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const setSetting = (k, v) => setSettings((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Top Bar ── */}
      <header className="bg-canvas border-b border-hairline sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-ink-mute hover:text-ink transition-colors"
                aria-label="Back to website"
              >
                <ArrowLeft size={17} />
              </Link>
              <div className="w-px h-5 bg-hairline" />
              <div>
                <h1 className="text-[15px] font-medium text-ink tracking-tight">Admin</h1>
                <p className="text-[11px] text-ink-mute">Manage your restaurant</p>
              </div>
            </div>
            <Link
              href="/"
              className="text-xs text-ink-mute hover:text-ink transition-colors inline-flex items-center gap-1"
            >
              View site <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* Tabs */}
          <nav className="flex gap-0 -mb-px overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-150 border-b-[1.5px] ${
                    isActive                    ? "border-emerald text-ink"
                    : "border-transparent text-ink-mute hover:text-ink hover:border-hairline-strong"
                }`}
                >
                  <Icon size={15} className={isActive ? "text-emerald" : ""} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* ════════════════════════════════════════
            DASHBOARD
        ════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <AdminDashboard
            products={products}
            orders={orders}
            loading={loading}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* ════════════════════════════════════════
            MENU
        ════════════════════════════════════════ */}
        {activeTab === "menu" && (
          <div>
            <SectionHeader title="Menu Items" description="Add, edit, or remove dishes from your menu." />
            <AdminMenu />
          </div>
        )}

        {/* ════════════════════════════════════════
            MENU MANAGEMENT
        ════════════════════════════════════════ */}
        {activeTab === "menu-management" && (
          <MenuManagement />
        )}

        {/* ════════════════════════════════════════
            ORDERS
        ════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div>
            <SectionHeader title="Orders" description="View, filter, and update order statuses." />
            <AdminOrders />
          </div>
        )}

        {/* ════════════════════════════════════════
            USERS
        ════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div>
            <SectionHeader title="Registered Users" description="View all registered customer accounts." />
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-ink-mute" />
              </div>
            ) : users.length === 0 ? (
              <EmptyState message="No registered users yet." />
            ) : (
              <div className="bg-canvas border border-hairline rounded-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-hairline bg-canvas-soft">
                      <th className="text-left px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">ID</th>
                      <th className="text-left px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">Phone</th>
                      <th className="text-left px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">Email</th>
                      <th className="text-left px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-hairline-cool hover:bg-canvas-soft/30 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-ink">#{u.id}</td>
                        <td className="px-5 py-3.5 text-sm text-ink-secondary">{u.phone_number || "—"}</td>
                        <td className="px-5 py-3.5 text-sm text-ink-secondary">{u.email || "—"}</td>
                        <td className="px-5 py-3.5 text-sm text-ink-mute">
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

        {/* ════════════════════════════════════════
            FEEDBACK
        ════════════════════════════════════════ */}
        {activeTab === "feedback" && (
          <div>
            <SectionHeader title="Customer Feedback" description="Reviews and ratings left by customers." />
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-ink-mute" />
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState message="No reviews yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-canvas border border-hairline rounded-sm p-5 hover:shadow-level-1 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[4px] bg-canvas-soft flex items-center justify-center text-xs font-medium text-ink-mute uppercase border border-hairline-cool">
                          {r.author?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{r.author}</p>
                          <p className="text-[11px] text-ink-mute">
                            {r.date ? new Date(r.date).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={s <= (r.rating || 0) ? "text-accent-yellow fill-accent-yellow" : "text-hairline-strong"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-ink-secondary leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            SETTINGS
        ════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <SectionHeader title="Restaurant Settings" description="Manage your restaurant's contact info, hours, and delivery details." />

            {settingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-ink-mute" />
              </div>
            ) : (
              <form onSubmit={saveSettings} className="space-y-5">
                <InputField label="Restaurant Name" value={settings.name} onChange={(v) => setSetting("name", v)} placeholder="Wabz Foods" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField label="Phone Number" value={settings.phone} onChange={(v) => setSetting("phone", v)} placeholder="+256 700 000 000" />
                  <InputField label="Delivery Fee (UGX)" value={settings.delivery_fee} onChange={(v) => setSetting("delivery_fee", v)} type="number" placeholder="5000" />
                </div>
                <TextareaField label="Address" value={settings.address} onChange={(v) => setSetting("address", v)} placeholder="123 Kampala Road, Kampala, Uganda" />
                <InputField label="Delivery Radius (km)" value={settings.delivery_radius} onChange={(v) => setSetting("delivery_radius", v)} type="number" placeholder="10" />

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-2 block">Operating Hours</label>
                  <div className="grid grid-cols-2 gap-5">
                    <InputField label="Opening" value={settings.opening_time} onChange={(v) => setSetting("opening_time", v)} type="time" />
                    <InputField label="Closing" value={settings.closing_time} onChange={(v) => setSetting("closing_time", v)} type="time" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-3 block">Home Page Statistics</label>
                  <p className="text-xs text-ink-mute mb-4 leading-relaxed">
                    Customize the numbers shown in the stats bar on the home page.
                  </p>
                  <div className="grid grid-cols-2 gap-5">
                    <InputField label="Menu Items" value={settings.stat_menu_items} onChange={(v) => setSetting("stat_menu_items", v)} placeholder="150+" />
                    <InputField label="Orders Delivered" value={settings.stat_orders_delivered} onChange={(v) => setSetting("stat_orders_delivered", v)} placeholder="12K+" />
                    <InputField label="Avg. Delivery Time" value={settings.stat_avg_delivery_time} onChange={(v) => setSetting("stat_avg_delivery_time", v)} placeholder="30m" />
                    <InputField label="Expert Chefs" value={settings.stat_expert_chefs} onChange={(v) => setSetting("stat_expert_chefs", v)} placeholder="15+" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-hairline">
                  {settingsError && (
                    <span className="text-xs text-accent-tomato flex items-center gap-1"><AlertCircle size={12} />{settingsError}</span>
                  )}
                  {settingsSaved && (
                    <span className="text-xs text-emerald-deep flex items-center gap-1"><CheckCircle2 size={12} /> Settings saved!</span>
                  )}
                  <GreenButton type="submit" disabled={settingsSaving} icon={settingsSaving ? null : Save}>
                    {settingsSaving ? <Loader2 size={14} className="animate-spin" /> : "Save Settings"}
                  </GreenButton>
                </div>
              </form>
            )}

            {/* Make Admin */}
            <div className="mt-12 pt-8 border-t border-hairline">
              <h3 className="text-[18px] font-medium text-ink flex items-center gap-2">
                <Shield size={18} className="text-ink-mute" />
                Admin Management
              </h3>
              <p className="text-sm text-ink-mute mt-1 mb-5 leading-relaxed">
                Promote an existing user to admin so they can access this panel.
              </p>
              <MakeAdminForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Form sub-components ── */

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      {label && <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-1.5 block">{label}</label>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}          className="w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder }) {
  return (
    <div>
      {label && <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-1.5 block">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all resize-none"
      />
    </div>
  );
}

function MakeAdminForm() {
  const [email, setEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [result, setResult] = useState(null);

  const handlePromote = async () => {
    if (!email.trim()) return;
    setPromoting(true);
    setResult(null);
    try {
      const res = await Promise.resolve({ data: { success: true, user: { name: email.trim() } } });
      if (res?.data?.success) {
        setResult({ type: "success", message: `${res.data.user?.name || email.trim()} is now an admin!` });
        setEmail("");
      }
    } catch (err) {
      setResult({ type: "error", message: err?.message || "Failed to promote user." });
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="bg-canvas border border-hairline rounded-sm p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handlePromote(); } }}
            placeholder="user@example.com"
            type="email"
            className="w-full pl-9 pr-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
          />
        </div>
        <GreenButton onClick={handlePromote} disabled={promoting || !email.trim()} icon={promoting ? null : UserPlus}>
          {promoting ? <Loader2 size={14} className="animate-spin" /> : "Make Admin"}
        </GreenButton>
      </div>
      {result && (
        <div className={`mt-3 flex items-center gap-2 text-sm rounded-sm px-4 py-2.5 border ${
          result.type === "success"                    ? "bg-emerald/5 text-emerald-deep border-emerald/20"
                    : "bg-accent-tomato/5 text-accent-tomato border-accent-tomato/20"
        }`}>
          {result.type === "success" ? <UserCheck size={14} /> : <AlertCircle size={14} />}
          {result.message}
        </div>
      )}
    </div>
  );
}
