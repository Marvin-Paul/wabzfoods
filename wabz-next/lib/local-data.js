/* ── Local in-memory data store for development without base44 API ── */
import {
  FEATURED_FAST_ITEMS,
  FEATURED_LOCAL_ITEMS,
} from "./featured-data";

/* ── Generate a unique ID ── */
let _counter = Date.now();
const uid = () => `local_${++_counter}_${Math.random().toString(36).slice(2, 8)}`;

/* ── Seed products from featured-data ── */
const seedProducts = () => {
  const items = [];
  let idx = 0;
  for (const item of [...FEATURED_FAST_ITEMS, ...FEATURED_LOCAL_ITEMS]) {
    items.push({
      id: uid(),
      ...item,
    });
  }
  return items;
};

/* ── Extra items not in featured-data but with available images ── */
const EXTRA_ITEMS = [
  {
    id: uid(),
    name: "Ugandan Kikomando",
    description:
      "Classic Ugandan street food: layers of chapati sliced and served with steamed beans, sliced avocado, and a drizzle of spicy sauce.",
    price: 8000,
    image_url: "/images/fast/ugandan-kikomando.jpg",
    category: "fast",
    subcategory: "local",
    featured: true,
    available: true,
  },
  {
    id: uid(),
    name: "Ugandan Local Food Mega Combo",
    description:
      "The ultimate Ugandan feast: matooke, groundnut stew, steamed chicken luwombo, fresh kachumbari, and a side of irish potatoes. Feeds the whole family!",
    price: 45000,
    image_url: "/images/local/mega-combo.jpg",
    category: "local",
    subcategory: "local",
    featured: true,
    available: true,
  },
];

/* ── In-memory store ── */
let products = [...seedProducts(), ...EXTRA_ITEMS];

let settings = {
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

let users = [
  {
    id: "local_user_admin",
    email: "admin@wabzfoods.com",
    password_hash: "admin123",
    name: "Admin",
    phone_number: "+256700123456",
    role: "admin",
  },
];

let orders = [];

/* ── Notify subscribers ── */
const orderSubscribers = new Set();
let orderPollTimer = null;

const notifyOrderSubscribers = () => {
  for (const cb of orderSubscribers) {
    try {
      cb([...orders]);
    } catch {
      // ignore subscriber errors
    }
  }
};

/* ── Exported data layer ── */
export const localData = {
  /* ── Products ── */
  listProducts: () => [...products],

  createProduct: (payload) => {
    const product = {
      id: uid(),
      name: payload.name || "",
      description: payload.description || "",
      category: payload.category || "local",
      price: Number(payload.price) || 0,
      image_url: payload.image_url || "",
      available: payload.available !== false,
      featured: !!payload.featured,
      subcategory: payload.subcategory || "",
    };
    products.push(product);
    return product;
  },

  updateProduct: (id, payload) => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Product ${id} not found`);
    products[idx] = { ...products[idx], ...payload, id };
    return products[idx];
  },

  deleteProduct: (id) => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Product ${id} not found`);
    products.splice(idx, 1);
    return { success: true };
  },

  /* ── Settings ── */
  getSettings: () => ({ ...settings }),

  updateSettings: (payload) => {
    settings = { ...settings, ...payload };
    return { ...settings };
  },

  /* ── Auth ── */
  register: ({ email, password }) => {
    const existing = users.find((u) => u.email === email);
    if (existing) {
      throw new Error("An account with this email already exists.");
    }
    const user = {
      id: uid(),
      email,
      password_hash: password,
      name: email.split("@")[0],
      phone_number: "",
      role: "user",
    };
    users.push(user);
    return { success: true, message: "Verification code sent to your email." };
  },

  loginViaEmailPassword: (email, password) => {
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error("Invalid email or password");
    if (user.password_hash !== password) throw new Error("Invalid email or password");
    const accessToken = `local_token_${user.id}_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("base44_access_token", accessToken);
      localData._saveUserToStorage(user);
    }
    return { access_token: accessToken, user };
  },

  verifyOtp: ({ email, otpCode }) => {
    // In local dev, any 6-digit code is accepted
    if (!otpCode || otpCode.length < 6) {
      throw new Error("Invalid verification code");
    }
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error("User not found");
    const accessToken = `local_token_${user.id}_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("base44_access_token", accessToken);
      localData._saveUserToStorage(user);
    }
    return { access_token: accessToken, user };
  },

  resendOtp: (email) => {
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error("User not found");
    return { success: true, message: "New code sent." };
  },

  loginWithProvider: (provider, redirect) => {
    // For local dev, simulate Google login with a demo account
    const email = `${provider}_user@example.com`;
    let user = users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: uid(),
        email,
        password_hash: "",
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        phone_number: "",
      };
      users.push(user);
    }
    const accessToken = `local_token_${user.id}_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("base44_access_token", accessToken);
      localData._saveUserToStorage(user);
      if (redirect) window.location.href = redirect;
    }
    return { access_token: accessToken, user };
  },

  setToken: (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("base44_access_token", token);
    }
  },

  /* ── Orders ── */
  listOrders: (sort = "-created_date", limit = 100) => {
    let result = [...orders];
    const desc = sort.startsWith("-");
    const field = desc ? sort.slice(1) : sort;
    result.sort((a, b) => {
      const va = a[field] || "";
      const vb = b[field] || "";
      return desc ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
    });
    return result.slice(0, limit);
  },

  createOrder: (payload) => {
    const order = {
      id: uid(),
      ...payload,
      created_date: new Date().toISOString(),
      status: payload.status || "pending",
      payment_status: payload.payment_status || "unpaid",
    };
    orders.push(order);
    notifyOrderSubscribers();
    return order;
  },

  updateOrder: (id, payload) => {
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error(`Order ${id} not found`);
    orders[idx] = { ...orders[idx], ...payload, id };
    notifyOrderSubscribers();
    return orders[idx];
  },

  deleteOrder: (id) => {
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error(`Order ${id} not found`);
    orders.splice(idx, 1);
    notifyOrderSubscribers();
    return { success: true };
  },

  /* ── Order polling (subscribe to changes) ── */
  subscribeOrders: (callback) => {
    orderSubscribers.add(callback);
    // Send initial data
    try {
      callback([...orders]);
    } catch {
      // ignore
    }
    return () => {
      orderSubscribers.delete(callback);
      if (orderSubscribers.size === 0 && orderPollTimer) {
        clearInterval(orderPollTimer);
        orderPollTimer = null;
      }
    };
  },

  /* ── Persist user data to localStorage so it survives page reloads ── */
  _saveUserToStorage: (user) => {
    if (typeof window === "undefined") return;
    const { password_hash, ...safeUser } = user;
    try {
      localStorage.setItem("base44_user_data", JSON.stringify(safeUser));
    } catch {
      // Storage full or unavailable — silent fallback
    }
  },

  _loadUserFromStorage: () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("base44_user_data");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /* ── Admin ── */
  promoteToAdmin: (email) => {
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error(`No user found with email "${email}".`);
    if (user.role === "admin") throw new Error(`User "${email}" is already an admin.`);
    user.role = "admin";
    const { password_hash, ...safeUser } = user;
    return { success: true, user: safeUser };
  },

  /* ── Auth ── */
  me: () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("base44_access_token")
        : null;
    if (!token) throw new Error("Not authenticated");
    // Token format: local_token_${user.id}_${timestamp}
    // Extract the user id from the token
    const parts = token.split("_");
    // token = "local", "token", <userId>, <timestamp>
    // userId could contain underscores too, so it's everything between "token" and the last part
    const timestamp = parts[parts.length - 1];
    const userId = parts.slice(2, -1).join("_");
    const user = users.find((u) => u.id === userId);
    if (user) {
      // Found in memory — return it
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
    // User not found in memory (page reload reset the in-memory store)
    // Fall back to localStorage
    const storedUser = localData._loadUserFromStorage();
    if (storedUser && storedUser.id === userId) {
      return storedUser;
    }
    throw new Error("User not found");
  },
};
