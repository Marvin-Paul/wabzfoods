"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { mapFoodProduct, mapOrder } from "@/lib/supabase-data";
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
  Loader2,
  Save,
  AlertCircle,
  Shield,
  UserPlus,
  Mail,
  UserCheck,
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

function GreenButton({
  children,
  onClick,
  disabled,
  className = "",
  small = false,
  icon: Icon,
  type = "button",
}) {
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

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-[22px] font-medium text-ink tracking-tight">{title}</h2>
      {description && <p className="text-sm text-ink-mute mt-1">{description}</p>}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const nameMapRef = useRef({});

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

  // Guard the admin panel — only signed-in users may access it.
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setAuthChecked(true);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => router.replace("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const loadItemNames = () =>
      supabase
        .from("food_items")
        .select("item_id, name")
        .then(({ data }) => {
          const m = {};
          (data || []).forEach((f) => {
            m[f.item_id] = f.name;
          });
          nameMapRef.current = m;
        })
        .catch(() => {});

    Promise.all([
      loadItemNames(),
      supabase
        .from("food_items")
        .select("*, categories!inner(category_code)")
        .order("item_id", { ascending: true })
        .then(({ data }) => {
          if (data) setProducts((data || []).map(mapFoodProduct));
        })
        .catch(() => {}),
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(100)
        .then(({ data }) => {
          if (data) setOrders((data || []).map((o) => mapOrder(o, nameMapRef.current)));
        })
        .catch(() => {}),
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
        const allOrders = (data || []).map((o) => mapOrder(o, nameMapRef.current));
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
      // There is no settings table yet — these values are compiled into the
      // site (lib/supabase-data.js), so this form only edits local state.
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } finally {
      setSettingsSaving(false);
    }
  };

  const setSetting = (k, v) => setSettings((f) => ({ ...f, [k]: v }));

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-ink-mute" />
      </div>
    );
  }

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
                    isActive
                      ? "border-emerald text-ink"
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
            <SectionHeader
              title="Menu Items"
              description="Add, edit, or remove dishes from your menu."
            />
            <AdminMenu />
          </div>
        )}

        {/* ════════════════════════════════════════
            MENU MANAGEMENT
        ════════════════════════════════════════ */}
        {activeTab === "menu-management" && <MenuManagement />}

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
            <SectionHeader
              title="Registered Users"
              description="View all registered customer accounts."
            />
            <div className="bg-canvas border border-hairline rounded-sm p-6">
              <p className="text-sm text-ink-mute leading-relaxed">
                Customer accounts live in Supabase Auth, which the anon key used by this site
                cannot read. To view or manage users, sign in to the{" "}
                <a
                  href="https://supabase.com/dashboard/project/apnxvhjlpahiepwntpmn/auth/users"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-deep underline underline-offset-2 hover:text-ink transition-colors"
                >
                  Supabase dashboard
                </a>{" "}
                — users can&apos;t be listed from the admin panel with the current permissions.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            FEEDBACK
        ════════════════════════════════════════ */}
        {activeTab === "feedback" && (
          <div>
            <SectionHeader
              title="Customer Feedback"
              description="Reviews and ratings left by customers."
            />
            <div className="bg-canvas border border-hairline rounded-sm p-6">
              <p className="text-sm text-ink-mute leading-relaxed">
                Reviews aren&apos;t collected on the site yet, so there&apos;s nothing to display
                here. Once a feedback table is added, this tab will show real submissions.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            SETTINGS
        ════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <SectionHeader
              title="Restaurant Settings"
              description="Manage your restaurant's contact info, hours, and delivery details."
            />

            {settingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-ink-mute" />
              </div>
            ) : (
              <form onSubmit={saveSettings} className="space-y-5">
                <InputField
                  label="Restaurant Name"
                  value={settings.name}
                  onChange={(v) => setSetting("name", v)}
                  placeholder="Wabz Foods"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField
                    label="Phone Number"
                    value={settings.phone}
                    onChange={(v) => setSetting("phone", v)}
                    placeholder="+256 700 000 000"
                  />
                  <InputField
                    label="Delivery Fee (UGX)"
                    value={settings.delivery_fee}
                    onChange={(v) => setSetting("delivery_fee", v)}
                    type="number"
                    placeholder="5000"
                  />
                </div>
                <TextareaField
                  label="Address"
                  value={settings.address}
                  onChange={(v) => setSetting("address", v)}
                  placeholder="123 Kampala Road, Kampala, Uganda"
                />
                <InputField
                  label="Delivery Radius (km)"
                  value={settings.delivery_radius}
                  onChange={(v) => setSetting("delivery_radius", v)}
                  type="number"
                  placeholder="10"
                />

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-2 block">
                    Operating Hours
                  </label>
                  <div className="grid grid-cols-2 gap-5">
                    <InputField
                      label="Opening"
                      value={settings.opening_time}
                      onChange={(v) => setSetting("opening_time", v)}
                      type="time"
                    />
                    <InputField
                      label="Closing"
                      value={settings.closing_time}
                      onChange={(v) => setSetting("closing_time", v)}
                      type="time"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-3 block">
                    Home Page Statistics
                  </label>
                  <p className="text-xs text-ink-mute mb-4 leading-relaxed">
                    Customize the numbers shown in the stats bar on the home page.
                  </p>
                  <div className="grid grid-cols-2 gap-5">
                    <InputField
                      label="Menu Items"
                      value={settings.stat_menu_items}
                      onChange={(v) => setSetting("stat_menu_items", v)}
                      placeholder="150+"
                    />
                    <InputField
                      label="Orders Delivered"
                      value={settings.stat_orders_delivered}
                      onChange={(v) => setSetting("stat_orders_delivered", v)}
                      placeholder="12K+"
                    />
                    <InputField
                      label="Avg. Delivery Time"
                      value={settings.stat_avg_delivery_time}
                      onChange={(v) => setSetting("stat_avg_delivery_time", v)}
                      placeholder="30m"
                    />
                    <InputField
                      label="Expert Chefs"
                      value={settings.stat_expert_chefs}
                      onChange={(v) => setSetting("stat_expert_chefs", v)}
                      placeholder="15+"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-hairline">
                  {settingsError && (
                    <span className="text-xs text-accent-tomato flex items-center gap-1">
                      <AlertCircle size={12} />
                      {settingsError}
                    </span>
                  )}
                  {settingsSaved && (
                    <span className="text-xs text-accent-yellow flex items-center gap-1">
                      <AlertCircle size={12} /> Preview only — defaults are compiled in
                      lib/supabase-data.js until a settings table is added.
                    </span>
                  )}
                  <GreenButton
                    type="submit"
                    disabled={settingsSaving}
                    icon={settingsSaving ? null : Save}
                  >
                    {settingsSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Save Settings"
                    )}
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
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-1.5 block">
          {label}
        </label>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder }) {
  return (
    <div>
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-1.5 block">
          {label}
        </label>
      )}
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
      // No admin-role table exists yet, so promotion can't be persisted.
      setResult({
        type: "error",
        message:
          "Admin promotion isn't available yet — there's no roles table to write to. Manage admins directly in Supabase.",
      });
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handlePromote();
              }
            }}
            placeholder="user@example.com"
            type="email"
            className="w-full pl-9 pr-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
          />
        </div>
        <GreenButton
          onClick={handlePromote}
          disabled={promoting || !email.trim()}
          icon={promoting ? null : UserPlus}
        >
          {promoting ? <Loader2 size={14} className="animate-spin" /> : "Make Admin"}
        </GreenButton>
      </div>
      {result && (
        <div
          className={`mt-3 flex items-center gap-2 text-sm rounded-sm px-4 py-2.5 border ${
            result.type === "success"
              ? "bg-emerald/5 text-emerald-deep border-emerald/20"
              : "bg-accent-tomato/5 text-accent-tomato border-accent-tomato/20"
          }`}
        >
          {result.type === "success" ? <UserCheck size={14} /> : <AlertCircle size={14} />}
          {result.message}
        </div>
      )}
    </div>
  );
}
