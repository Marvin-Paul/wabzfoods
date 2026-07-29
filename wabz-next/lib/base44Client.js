/* ── Supabase Backed base44 Client Shim ──
 * Replaces the old local-data/remote API client with Supabase.
 * Preserves the same export shape so existing imports work:
 *   base44.entities.Product.list()
 *   base44.auth.loginViaEmailPassword()
 *   base44.apiClient.get("/api/settings")
 */

import { supabase } from "./supabaseClient";

/* ── Default settings (no site_settings table) ── */
const DEFAULT_SETTINGS = {
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

/* ── Mock data for empty tables ── */
const MOCK_USERS = [
  { id: "1", phone_number: "+256 700 000 001", email: "admin@wabzfoods.com", created_at: "2026-01-15T08:00:00Z" },
  { id: "2", phone_number: "+256 700 000 002", email: "sarah@example.com", created_at: "2026-02-20T10:30:00Z" },
  { id: "3", phone_number: "+256 700 000 003", email: "james@example.com", created_at: "2026-03-05T14:15:00Z" },
];

const MOCK_REVIEWS = [
  {
    id: "r1",
    author: "Sarah N.",
    rating: 5,
    text: "The Ugandan Rolex from Wabz Foods is absolutely incredible! Tastes just like home. Delivery is always on time and the food arrives hot.",
    date: "2026-03-10T18:30:00Z",
  },
  {
    id: "r2",
    author: "James M.",
    rating: 5,
    text: "I order from Wabz at least twice a week. The menu variety is fantastic — from local dishes to fast food, they have it all. Highly recommended!",
    date: "2026-03-12T12:00:00Z",
  },
  {
    id: "r3",
    author: "Grace A.",
    rating: 4,
    text: "Great online ordering experience. The tracking feature lets me know exactly when my food will arrive. The chicken and chips are a must-try!",
    date: "2026-03-15T09:45:00Z",
  },
  {
    id: "r4",
    author: "Peter K.",
    rating: 5,
    text: "Best Katogo in Kampala! The groundnut sauce is rich and authentic. My go-to breakfast place.",
    date: "2026-03-18T07:20:00Z",
  },
  {
    id: "r5",
    author: "Faith O.",
    rating: 4,
    text: "The Family Feast Bucket is amazing value. Feeds my whole family for under 70k. Will definitely order again!",
    date: "2026-03-22T19:00:00Z",
  },
];

/* ── Product helpers ── */
function mapCategory(code) {
  return code === "local" ? "local" : "fast";
}

function mapSubcategory(code) {
  switch (code) {
    case "breakfast": return "sides";
    case "lunch": return "sides";
    case "dinner": return "grilled";
    case "local": return "local";
    case "junk": return "fried";
    case "drinks": return "sides";
    default: return "sides";
  }
}

function defaultPrep(code) {
  if (code === "local") return "20-25 mins";
  if (code === "breakfast") return "10-15 mins";
  if (code === "drinks") return "5 mins";
  return "15-20 mins";
}

function defaultKcal(code) {
  if (code === "drinks") return "~180 kcal";
  if (code === "local") return "~580 kcal";
  if (code === "breakfast") return "~350 kcal";
  return "~450 kcal";
}

function mapProduct(item) {
  return {
    id: item.item_id,
    name: item.name,
    description: item.description,
    price: Number(item.base_price),
    image_url: item.image || "",
    category: mapCategory(item.category_code),
    subcategory: mapSubcategory(item.category_code),
    featured: !!item.badge,
    available: item.is_active !== false,
    prep: defaultPrep(item.category_code),
    kcal: defaultKcal(item.category_code),
  };
}

/* ── Export: base44 ── */
export const base44 = {
  entities: {
    Product: {
      list: async (includeHidden = false) => {
        let query = supabase
          .from("menu_items")
          .select("item_id, category_code, name, description, base_price, image, badge, is_active")
          .order("item_id", { ascending: true });

        // Storefront: only active items. Admin: all items.
        if (!includeHidden) {
          query = query.eq("is_active", true);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Supabase Product.list error:", error);
          return [];
        }
        return (data || []).map(mapProduct);
      },
      create: async (payload) => {
        const id = "custom_" + Date.now();
        const { error } = await supabase.from("menu_items").insert({
          item_id: id,
          category_code: payload.category || "fast",
          name: payload.name || "",
          description: payload.description || "",
          base_price: Number(payload.price) || 0,
          image: payload.image_url || "",
          is_active: payload.available !== false,
          badge: payload.featured ? "Featured" : null,
        });
        if (error) throw error;
        return { id, ...payload };
      },
      update: async (id, payload) => {
        const { error } = await supabase
          .from("menu_items")
          .update({
            name: payload.name,
            description: payload.description,
            base_price: Number(payload.price),
            image: payload.image_url,
            category_code: payload.category,
            is_active: payload.available,
          })
          .eq("item_id", id);
        if (error) throw error;
        return { id, ...payload };
      },
      delete: async (id) => {
        const { error } = await supabase.from("menu_items").delete().eq("item_id", id);
        if (error) throw error;
        return { success: true };
      },
    },
    Order: {
      list: async (sort = "-created_date", limit = 100) => {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          console.error("Supabase Order.list error:", error);
          return [];
        }
        return (data || []).map((o) => ({
          id: o.order_id,
          order_type: o.order_type,
          status: o.status || "pending",
          payment_status: o.payment_status || "unpaid",
          created_date: o.created_at,
          created_at: o.created_at,
          total: o.total_amount,
          total_amount: o.total_amount,
          // Fallback fields the admin UI expects
          customer_name: o.customer_name || "Guest",
          phone: o.phone || "",
          address: o.address || "",
          notes: o.notes || "",
          items: (o.order_items || []).map((i) => ({
            qty: i.quantity,
            name: i.item_id || "Item",
            price: i.price,
            customizations: i.customizations,
          })),
        }));
      },
      update: async (id, payload) => {
        const { error } = await supabase.from("orders").update(payload).eq("order_id", id);
        if (error) throw error;
        return payload;
      },
      subscribe: (callback) => {
        const interval = setInterval(async () => {
          try {
            const orders = await base44.entities.Order.list();
            callback(orders);
          } catch {}
        }, 5000);
        return () => clearInterval(interval);
      },
    },
  },

  auth: {
    me: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return null;
      return session.session.user;
    },
    logout: (redirect) => {
      supabase.auth.signOut();
      if (redirect && typeof window !== "undefined") {
        window.location.href = redirect;
      }
    },
    redirectToLogin: (redirect) => {
      if (typeof window !== "undefined") {
        window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
      }
    },
    register: async (payload) => {
      const { error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
      });
      if (error) throw error;
      return { success: true, message: "Verification email sent." };
    },
    loginViaEmailPassword: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { access_token: data.session?.access_token, user: data.user };
    },
    verifyOtp: async () => ({ success: true }),
    resendOtp: async () => ({ success: true }),
    loginWithProvider: (provider, redirect) => {
      if (typeof window !== "undefined") {
        window.location.href = `/?provider=${provider}&redirect=${encodeURIComponent(redirect)}`;
      }
    },
    setToken: () => {},
  },

  apiClient: {
    get: async (url) => {
      if (url === "/api/settings" || url.startsWith("/api/settings")) {
        return { data: { ...DEFAULT_SETTINGS }, status: 200 };
      }
      if (url === "/api/users" || url.startsWith("/api/users")) {
        return { data: MOCK_USERS, status: 200 };
      }
      if (url === "/api/reviews" || url.startsWith("/api/reviews")) {
        return { data: MOCK_REVIEWS, status: 200 };
      }
      if (url === "/api/admin/promote") {
        return { data: { success: true }, status: 200 };
      }
      return { data: null, status: 404 };
    },
    post: async (url, data) => {
      if (url === "/api/admin/promote") {
        return { data: { success: true }, status: 200 };
      }
      return { data: null, status: 200 };
    },
    put: async (url, data) => {
      if (url === "/api/settings" || url.startsWith("/api/settings")) {
        return { data: { ...DEFAULT_SETTINGS, ...data }, status: 200 };
      }
      return { data: null, status: 200 };
    },
    delete: async () => ({ data: null, status: 200 }),
  },
};
