/* ── Supabase Data Layer for wabz-next storefront ──
 * Replaces base44.entities.Product.list() and base44.apiClient.get("/api/settings")
 * Maps actual DB columns (item_id, category_code, base_price) to the
 * Next.js expected shape (id, category, price, image_url, etc.).
 */

import { supabase } from "./supabaseClient";

/* ── Category mapping: Supabase category_code → Next.js category ── */
function mapCategory(code) {
  if (code === "local") return "local";
  return "fast"; // breakfast, lunch, dinner, junk, drinks → "fast"
}

/* ── Subcategory mapping for /local and /fast filter tabs ── */
function mapSubcategory(code) {
  switch (code) {
    case "breakfast":
      return "sides";
    case "lunch":
      return "sides";
    case "dinner":
      return "grilled";
    case "local":
      return "local";
    case "junk":
      return "fried";
    case "drinks":
      return "sides";
    default:
      return "sides";
  }
}

/* ── Default prep time based on category ── */
function defaultPrep(code) {
  if (code === "local") return "20-25 mins";
  if (code === "breakfast") return "10-15 mins";
  if (code === "drinks") return "5 mins";
  return "15-20 mins";
}

/* ── Default calorie estimate ── */
function defaultKcal(code) {
  if (code === "drinks") return "~180 kcal";
  if (code === "local") return "~580 kcal";
  if (code === "breakfast") return "~350 kcal";
  return "~450 kcal";
}

/* ── Fetch all active menu items from Supabase ── */
export async function listProducts() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("item_id, category_code, name, description, base_price, image, badge, is_active")
    .eq("is_active", true)
    .order("item_id", { ascending: true });

  if (error) {
    console.error("Supabase menu fetch failed:", error);
    return [];
  }

  return (data || []).map((item, idx) => ({
    id: item.item_id,
    name: item.name,
    description: item.description,
    price: Number(item.base_price),
    image_url: item.image || "/images/fast/plain-chips.webp",
    category: mapCategory(item.category_code),
    subcategory: mapSubcategory(item.category_code),
    featured: !!item.badge, // items with a badge are "Chef's Pick"
    available: item.is_active !== false,
    prep: defaultPrep(item.category_code),
    kcal: defaultKcal(item.category_code),
  }));
}

/* ── Convenience filters ── */
export async function listLocalProducts() {
  const all = await listProducts();
  return all.filter((p) => p.category === "local");
}

export async function listFastProducts() {
  const all = await listProducts();
  return all.filter((p) => p.category === "fast");
}

/* ── Settings (static defaults — no site_settings table in DB) ── */
export async function getSettings() {
  return {
    name: "Wabz Foods",
    phone: "+256 700 123 456",
    address: "Plot 15, Kampala Road, Kampala, Uganda",
    delivery_fee: "5000",
    delivery_radius: "10",
    opening_time: "08:00",
    closing_time: "22:00",
    footer_accent: "#e34234",
    footer_accent_secondary: "#fbbf24",
    stat_menu_items: "150+",
    stat_orders_delivered: "12K+",
    stat_avg_delivery_time: "30m",
    stat_expert_chefs: "15+",
  };
}
