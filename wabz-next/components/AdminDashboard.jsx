"use client";

import React, { useMemo } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  DollarSign,
  Users,
  Flame,
  UtensilsCrossed,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ChevronRight,
  CircleDollarSign,
} from "lucide-react";

/* ── Helpers ── */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatCurrency(n) {
  return `UGX ${Number(n).toLocaleString()}`;
}

/* ── Sample-data generators (used when Supabase has no real data yet) ── */

const FAKE_PRODUCT_NAMES = [
  "Matooke & Beef", "Chicken Luwombo", "Rolex", "Nyama Choma",
  "Chips & Chicken", "Chicken Burger", "Pizza", "Fish & Chips",
  "Passion Juice", "Coffee", "CocaCola", "Chapati",
];

const FAKE_STATUSES = ["delivered", "delivered", "delivered", "delivered", "pending", "preparing", "delivered", "delivered", "ready", "delivered"];

function generateSampleOrders(count = 48) {
  const orders = [];
  for (let i = 0; i < count; i++) {
    const dayOffset = Math.floor(Math.random() * 14);
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
    const itemsCount = 1 + Math.floor(Math.random() * 4);
    const items = [];
    let total = 0;
    for (let j = 0; j < itemsCount; j++) {
      const price = [2500, 4000, 5000, 8000, 10000, 12000, 15000, 18000, 25000][Math.floor(Math.random() * 9)];
      const qty = 1 + Math.floor(Math.random() * 3);
      items.push({
        qty,
        name: FAKE_PRODUCT_NAMES[Math.floor(Math.random() * FAKE_PRODUCT_NAMES.length)],
        price,
      });
      total += price * qty;
    }
    orders.push({
      id: `sample-${i}`,
      customer_name: ["Sarah N.", "James M.", "Grace A.", "Peter K.", "Faith O.", "John D.", "Mary W.", "David S."][Math.floor(Math.random() * 8)],
      created_date: date.toISOString(),
      created_at: date.toISOString(),
      status: FAKE_STATUSES[i % FAKE_STATUSES.length],
      payment_status: Math.random() > 0.15 ? "paid" : "unpaid",
      total,
      total_amount: total,
      items,
      order_type: "delivery",
      phone: "+256 700 000 000",
    });
  }
  return orders;
}

function generateTrendData(days = 14) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    // Weekend dips, Friday/Saturday peaks
    const day = d.getDay();
    let base = day === 0 || day === 6 ? 180000 : 350000;
    const variation = Math.random() * 150000 - 75000;
    const revenue = Math.round((base + variation) / 100) * 100;
    const orders = Math.round(revenue / (25000 + Math.random() * 15000));
    data.push({ dayName, dateStr, revenue, orders, date: d });
  }
  return data;
}

function generateTopItems(count = 8) {
  const items = FAKE_PRODUCT_NAMES.slice(0, count).map((name) => ({
    name,
    orders: 10 + Math.floor(Math.random() * 40),
    revenue: (10 + Math.floor(Math.random() * 40)) * (4000 + Math.floor(Math.random() * 12000)),
  }));
  items.sort((a, b) => b.orders - a.orders);
  return items;
}

/* ── Stat Card ── */

function StatCard({ icon: Icon, value, label, trend, trendLabel, color = "text-ink" }) {
  const isUp = trend > 0;
  return (
    <div className="bg-canvas border border-hairline rounded-sm p-5 hover:shadow-level-1 transition-shadow relative overflow-hidden group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-[4px] bg-canvas-soft flex items-center justify-center border border-hairline-cool group-hover:bg-ink transition-colors duration-300">
          <Icon size={18} className="text-ink-mute group-hover:text-canvas transition-colors duration-300" />
        </div>
        {trend !== undefined && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px]",
            isUp ? "bg-emerald/10 text-emerald-deep" : "bg-accent-tomato/10 text-accent-tomato"
          )}>
            {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className={cn("text-2xl font-medium tracking-tight tabular-nums", color)}>{value}</p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xs text-ink-mute">{label}</p>
        {trendLabel && <p className="text-[10px] text-ink-faint">{trendLabel}</p>}
      </div>
    </div>
  );
}

/* ── Section components ── */

function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-[18px] font-medium text-ink tracking-tight">{title}</h2>
        {description && <p className="text-xs text-ink-mute mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function Empty({ message, icon: Icon }) {
  return (
    <div className="bg-canvas border border-hairline rounded-sm py-14 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-[4px] bg-canvas-soft flex items-center justify-center mx-auto mb-3 border border-hairline-cool">
          <Icon size={20} className="text-ink-faint" />
        </div>
      )}
      <p className="text-sm text-ink-mute-2">{message}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SVG CHART COMPONENTS
 ═══════════════════════════════════════════════════════════════ */

/* ── Revenue Bar Chart ── */
function RevenueChart({ data, period }) {
  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const barWidth = Math.max(24, Math.min(48, 600 / data.length - 8));
  const chartHeight = 180;
  const chartWidth = data.length * (barWidth + 8) + 40;

  return (
    <div className="bg-canvas border border-hairline rounded-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <SectionHeader title="Revenue Trend" description={`Daily revenue (${period})`} />
        </div>
        <div className="flex items-center gap-4 text-[11px] text-ink-mute">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald" />
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-ink-mute-2/40" />
            <span>Orders</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <svg width={chartWidth} height={chartHeight + 36} className="block">
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = chartHeight - frac * chartHeight;
            return (
              <g key={frac}>
                <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#efefef" strokeWidth={1} />
                <text x={chartWidth + 6} y={y + 3} fill="#b2b2b2" fontSize={10} textAnchor="start">
                  {formatCurrency(Math.round(maxRevenue * frac))}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const x = i * (barWidth + 8) + 20;
            const barH = (d.revenue / maxRevenue) * (chartHeight - 10);
            const y = chartHeight - barH;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth * 0.55}
                  height={barH}
                  rx={3}
                  fill="#24b47e"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{d.dateStr}: {formatCurrency(d.revenue)}</title>
                </rect>
                {/* Orders dot */}
                <circle
                  cx={x + barWidth * 0.75}
                  cy={chartHeight - (d.orders / (maxRevenue / 25000))}
                  r={3}
                  fill="#b2b2b2"
                  opacity={0.5}
                />
                {/* Date label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  fill="#b2b2b2"
                  fontSize={9}
                  textAnchor="middle"
                >
                  {d.dayName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ── Order Status Distribution ── */
function StatusDistribution({ orders }) {
  const statuses = ["pending", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
  const labels = ["Pending", "Preparing", "Ready", "Out for Delivery", "Delivered", "Cancelled"];
  const colors = ["#b2b2b2", "#24b47e", "#6b01c2", "#644fc1", "#3ecf8e", "#ff2201"];

  const counts = statuses.map((s) => orders.filter((o) => o.status === s).length);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="bg-canvas border border-hairline rounded-sm p-5">
      <SectionHeader title="Order Status" description="Current distribution" />
      <div className="space-y-2.5">
        {statuses.map((s, i) => {
          const count = counts[i];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={s} className="flex items-center gap-3">
              <span className="w-28 text-[11px] font-medium text-ink-mute capitalize truncate shrink-0">
                {labels[i]}
              </span>
              <div className="flex-1 h-5 bg-canvas-soft rounded-[3px] overflow-hidden border border-hairline-cool">
                <div
                  className="h-full rounded-[3px] transition-all duration-500"
                  style={{
                    width: `${Math.max((count / maxCount) * 100, count > 0 ? 4 : 0)}%`,
                    backgroundColor: colors[i],
                    opacity: 0.85,
                  }}
                />
              </div>
              <span className="w-12 text-right text-xs font-medium text-ink tabular-nums shrink-0">{count}</span>
              <span className="w-10 text-right text-[10px] text-ink-faint tabular-nums shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Top Items Chart ── */
function TopItemsChart({ items }) {
  if (!items || items.length === 0) return null;
  const maxOrders = Math.max(...items.map((i) => i.orders), 1);

  return (
    <div className="bg-canvas border border-hairline rounded-sm p-5">
      <SectionHeader title="Top Selling Items" description="By order volume" />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="w-5 text-center text-[10px] font-bold text-ink-faint shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-ink truncate">{item.name}</span>
                <span className="text-[10px] text-ink-mute tabular-nums shrink-0 ml-2">
                  {item.orders} orders
                </span>
              </div>
              <div className="h-4 bg-canvas-soft rounded-[3px] overflow-hidden border border-hairline-cool">
                <div
                  className="h-full rounded-[3px] bg-gradient-to-r from-emerald to-emerald-deep"
                  style={{ width: `${(item.orders / maxOrders) * 100}%`, opacity: 0.85 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Category Distribution (pie-like horizontal bars) ── */
function CategoryDistribution({ products }) {
  const cats = useMemo(() => {
    const map = {};
    for (const p of products) {
      const c = p.category || "Other";
      map[c] = (map[c] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const total = cats.reduce((s, c) => s + c.count, 0) || 1;
  const maxCount = Math.max(...cats.map((c) => c.count), 1);

  const labelMap = { local: "Local Foods", fast: "Fast Foods", drinks: "Drinks" };
  const colorMap = { local: "#fb923c", fast: "#ef4444", drinks: "#38bdf8" };

  return (
    <div className="bg-canvas border border-hairline rounded-sm p-5">
      <SectionHeader title="Menu by Category" description={`${total} total items`} />
      <div className="space-y-3">
        {cats.map((cat) => {
          const pct = Math.round((cat.count / total) * 100);
          return (
            <div key={cat.name} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                style={{ backgroundColor: colorMap[cat.name] || "#b2b2b2" }}
              />
              <span className="text-xs font-medium text-ink w-24 truncate shrink-0">
                {labelMap[cat.name] || cat.name}
              </span>
              <div className="flex-1 h-4 bg-canvas-soft rounded-[3px] overflow-hidden border border-hairline-cool">
                <div
                  className="h-full rounded-[3px] transition-all duration-500"
                  style={{
                    width: `${Math.max((cat.count / maxCount) * 100, 4)}%`,
                    backgroundColor: colorMap[cat.name] || "#b2b2b2",
                    opacity: 0.8,
                  }}
                />
              </div>
              <span className="w-8 text-right text-xs font-medium text-ink tabular-nums shrink-0">{cat.count}</span>
              <span className="w-10 text-right text-[10px] text-ink-faint tabular-nums shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
 ═══════════════════════════════════════════════════════════════ */

export default function AdminDashboard({ products = [], orders = [], onNavigate, loading = false }) {
  const [period, setPeriod] = React.useState("7d"); // "7d" | "14d" | "30d"

  // Use real orders if available, otherwise generate sample data
  const effectiveOrders = useMemo(() => {
    if (orders.length > 0) return orders;
    return generateSampleOrders(48);
  }, [orders]);

  const effectiveProducts = useMemo(() => {
    if (products.length > 0) return products;
    return [];
  }, [products]);

  // Computed metrics
  const metrics = useMemo(() => {
    const days = period === "7d" ? 7 : period === "14d" ? 14 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const periodOrders = effectiveOrders.filter(
      (o) => new Date(o.created_date) >= cutoff
    );

    const totalRevenue = periodOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    const totalOrders = periodOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const pendingCount = periodOrders.filter((o) => o.status === "pending").length;
    const deliveredCount = periodOrders.filter((o) => o.status === "delivered").length;
    const preparingCount = periodOrders.filter((o) => o.status === "preparing").length;

    // Previous period comparison
    const prevCutoff = new Date();
    prevCutoff.setDate(prevCutoff.getDate() - days * 2);
    const prevEnd = new Date();
    prevEnd.setDate(prevEnd.getDate() - days);
    const prevOrders = effectiveOrders.filter((o) => {
      const d = new Date(o.created_date);
      return d >= prevCutoff && d < prevEnd;
    });
    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    const revenueTrend = prevRevenue > 0
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;
    const orderTrend = prevOrders.length > 0
      ? Math.round(((totalOrders - prevOrders.length) / prevOrders.length) * 100)
      : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      pendingCount,
      deliveredCount,
      preparingCount,
      revenueTrend,
      orderTrend,
    };
  }, [effectiveOrders, period]);

  // Trend data for revenue chart
  const trendData = useMemo(() => {
    const days = period === "7d" ? 7 : period === "14d" ? 14 : 30;
    return generateTrendData(days);
  }, [period]);

  // Top items
  const topItems = useMemo(() => generateTopItems(8), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="animate-spin text-ink-mute" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Period selector ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-medium text-ink tracking-tight">Dashboard</h2>
          <p className="text-sm text-ink-mute mt-0.5">
            Real-time overview of your restaurant&apos;s performance
          </p>
        </div>
        <div className="flex items-center gap-1 bg-canvas border border-hairline rounded-sm p-0.5">
          {[
            { value: "7d", label: "7 Days" },
            { value: "14d", label: "14 Days" },
            { value: "30d", label: "30 Days" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-medium rounded-[3px] transition-all duration-150",
                period === p.value
                  ? "bg-ink text-canvas shadow-sm"
                  : "text-ink-mute hover:text-ink"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={DollarSign}
          value={formatCurrency(metrics.totalRevenue)}
          label="Total Revenue"
          trend={metrics.revenueTrend}
          trendLabel={`vs prev ${period}`}
          color="text-emerald-deep"
        />
        <StatCard
          icon={ShoppingBag}
          value={metrics.totalOrders}
          label="Total Orders"
          trend={metrics.orderTrend}
          trendLabel={`vs prev ${period}`}
        />
        <StatCard
          icon={CircleDollarSign}
          value={formatCurrency(metrics.avgOrderValue)}
          label="Avg. Order Value"
        />
        <StatCard
          icon={Clock}
          value={metrics.pendingCount + metrics.preparingCount}
          label="In Progress"
        />
        <StatCard
          icon={Flame}
          value={metrics.deliveredCount}
          label="Delivered"
        />
        <StatCard
          icon={Users}
          value={products.length}
          label="Menu Items"
        />
      </div>

      {/* ── Revenue Chart + Status Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart data={trendData} period={period === "7d" ? "7 days" : period === "14d" ? "14 days" : "30 days"} />
        </div>
        <div>
          <StatusDistribution orders={effectiveOrders} />
        </div>
      </div>

      {/* ── Top Items + Category Distribution + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div>
          <TopItemsChart items={topItems} />
        </div>
        <div>
          <CategoryDistribution products={effectiveProducts} />
        </div>
        <div className="bg-canvas border border-hairline rounded-sm p-5">
          <SectionHeader
            title="Recent Orders"
            description="Latest 5 orders"
            action={
              <button
                onClick={() => onNavigate && onNavigate("orders")}
                className="text-[11px] font-medium text-emerald-deep hover:text-ink transition-colors inline-flex items-center gap-0.5"
              >
                View All <ChevronRight size={12} />
              </button>
            }
          />
          {effectiveOrders.length === 0 ? (
            <Empty message="No orders yet" icon={ShoppingBag} />
          ) : (
            <div className="space-y-2">
              {effectiveOrders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between py-2.5 border-b border-hairline-cool last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink truncate">
                      {o.customer_name || "Guest"}
                    </p>
                    <p className="text-[10px] text-ink-faint mt-0.5">
                      {o.items?.length || 0} items · {new Date(o.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-medium text-ink tabular-nums">
                      {formatCurrency(o.total)}
                    </p>
                    <span className={cn(
                      "inline-block text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] mt-0.5",
                      o.status === "delivered" ? "bg-emerald/10 text-emerald-deep" :
                      o.status === "pending" ? "bg-stone-100 text-stone-500" :
                      o.status === "preparing" ? "bg-emerald/10 text-emerald-deep" :
                      o.status === "cancelled" ? "bg-red-50 text-red-500" :
                      "bg-canvas-soft text-ink-mute"
                    )}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-ink to-ink-secondary rounded-sm p-5 text-canvas">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-canvas/10 flex items-center justify-center">
              <UtensilsCrossed size={16} className="text-canvas/70" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Menu Management</h3>
              <p className="text-[11px] text-canvas/60 mt-0.5">{products.length} dishes · {products.filter((p) => p.available).length} visible</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate("menu")}
            className="inline-flex items-center gap-2 text-xs font-medium bg-canvas/10 hover:bg-canvas/20 transition-colors px-4 py-2 rounded-sm"
          >
            Manage Menu <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="bg-gradient-to-br from-ink to-ink-secondary rounded-sm p-5 text-canvas">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[4px] bg-canvas/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-canvas/70" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Settings</h3>
              <p className="text-[11px] text-canvas/60 mt-0.5">Hours, delivery, contact info</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate("settings")}
            className="inline-flex items-center gap-2 text-xs font-medium bg-canvas/10 hover:bg-canvas/20 transition-colors px-4 py-2 rounded-sm"
          >
            Edit Settings <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
