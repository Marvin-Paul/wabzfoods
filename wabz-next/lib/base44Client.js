const isBrowser = typeof window !== "undefined";

const storage = {
  getItem: (key) => {
    if (!isBrowser) return null;
    return localStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (!isBrowser) return;
    localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  },
};

/* ── Detect if we're running locally without a real base44 API ── */
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.") ||
    window.location.hostname.startsWith("10."));

/* ── Local data shim (only used when isLocalhost is true) ── */
let localData = null;

function getLocalData() {
  if (!localData) {
    // Dynamic import to avoid circular dependency issues
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const mod = require("./local-data");
    localData = mod.localData;
  }
  return localData;
}

/* ── HTTP API client (for production/real base44) ── */
const createApiClient = () => {
  if (!isBrowser) {
    return {
      get: () => Promise.resolve({ data: null, status: 200 }),
      post: () => Promise.resolve({ data: null, status: 200 }),
      put: () => Promise.resolve({ data: null, status: 200 }),
      delete: () => Promise.resolve({ data: null, status: 200 }),
    };
  }

  const token = storage.getItem("base44_access_token");

  const request = async (config) => {
    const url = config.url.startsWith("http")
      ? config.url
      : `${window.location.origin}${config.url}`;
    const headers = {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: config.method || "GET",
      headers,
      body: config.data ? JSON.stringify(config.data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { data: null, status: 404 };
      }
      const error = new Error(
        response.statusText || `Request failed with status ${response.status}`
      );
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch {
        error.data = null;
      }
      throw error;
    }

    const contentType = response.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    return { data, status: response.status };
  };

  return {
    get: (url, config = {}) => request({ ...config, method: "GET", url }),
    post: (url, data, config = {}) =>
      request({ ...config, method: "POST", url, data }),
    put: (url, data, config = {}) =>
      request({ ...config, method: "PUT", url, data }),
    delete: (url, config = {}) =>
      request({ ...config, method: "DELETE", url }),
  };
};

const apiClient = createApiClient();

/* ── Entities (Products, Orders) ── */
const createLocalEntities = () => {
  const d = () => getLocalData();
  return {
    Product: {
      list: () => Promise.resolve(d().listProducts()),
      create: (payload) => Promise.resolve(d().createProduct(payload)),
      update: (id, payload) => Promise.resolve(d().updateProduct(id, payload)),
      delete: (id) => Promise.resolve(d().deleteProduct(id)),
    },
    Order: {
      list: (sort = "-created_date", limit = 100) =>
        Promise.resolve(d().listOrders(sort, limit)),
      update: (id, payload) => Promise.resolve(d().updateOrder(id, payload)),
      subscribe: (callback) => {
        if (!isBrowser) return () => {};
        return d().subscribeOrders(callback);
      },
    },
  };
};

const createRemoteEntities = () => {
  return {
    Product: {
      list: () => apiClient.get("/api/products").then((r) => r.data || []),
      create: (payload) =>
        apiClient.post("/api/products", payload).then((r) => r.data),
      update: (id, payload) =>
        apiClient.put(`/api/products/${id}`, payload).then((r) => r.data),
      delete: (id) =>
        apiClient.delete(`/api/products/${id}`).then((r) => r.data),
    },
    Order: {
      list: (sort = "-created_date", limit = 100) =>
        apiClient
          .get(`/api/orders?sort=${sort}&limit=${limit}`)
          .then((r) => r.data || []),
      update: (id, payload) =>
        apiClient.put(`/api/orders/${id}`, payload).then((r) => r.data),
      subscribe: (callback) => {
        if (!isBrowser) return () => {};
        const interval = setInterval(async () => {
          try {
            const data = await entities.Order.list();
            callback(data);
          } catch {
            // ignore polling errors
          }
        }, 5000);
        return () => clearInterval(interval);
      },
    },
  };
};

/* ── Auth ── */
const createLocalAuth = () => {
  const d = () => getLocalData();
  return {
    me: async () => d().me(),
    logout: (redirect) => {
      storage.removeItem("base44_access_token");
      if (redirect && isBrowser) window.location.href = redirect;
    },
    redirectToLogin: (redirect) => {
      if (isBrowser) window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
    },
    register: async (payload) => d().register(payload),
    loginViaEmailPassword: async (email, password) => d().loginViaEmailPassword(email, password),
    verifyOtp: async (payload) => d().verifyOtp(payload),
    resendOtp: async (email) => d().resendOtp(email),
    loginWithProvider: (provider, redirect) => d().loginWithProvider(provider, redirect),
    setToken: (token) => d().setToken(token),
  };
};

const createRemoteAuth = () => ({
  me: async () => {
    const res = await apiClient.get("/api/auth/me");
    return res.data;
  },
  logout: (redirect) => {
    storage.removeItem("base44_access_token");
    if (redirect && isBrowser) window.location.href = redirect;
  },
  redirectToLogin: (redirect) => {
    if (isBrowser) window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
  },
  register: async (payload) => {
    const res = await apiClient.post("/api/auth/register", payload);
    return res.data;
  },
  loginViaEmailPassword: async (email, password) => {
    const res = await apiClient.post("/api/auth/login", { email, password });
    return res.data;
  },
  verifyOtp: async (payload) => {
    const res = await apiClient.post("/api/auth/verify-otp", payload);
    return res.data;
  },
  resendOtp: async (email) => {
    const res = await apiClient.post("/api/auth/resend-otp", { email });
    return res.data;
  },
  loginWithProvider: (provider, redirect) => {
    window.location.href = `/api/auth/${provider}?redirect=${encodeURIComponent(redirect)}`;
  },
  setToken: (token) => {
    storage.setItem("base44_access_token", token);
  },
});

/* ── Local API client (returns local data for settings) ── */
const createLocalApiClient = () => {
  const d = () => getLocalData();
  return {
    get: (url) => {
      if (url === "/api/settings" || url.startsWith("/api/settings")) {
        return Promise.resolve({ data: d().getSettings(), status: 200 });
      }
      // Default return for unknown routes
      return Promise.resolve({ data: null, status: 404 });
    },
    post: (url, data) => {
      if (url === "/api/admin/promote") {
        try {
          const result = d().promoteToAdmin(data?.email);
          return Promise.resolve({ data: result, status: 200 });
        } catch (err) {
          return Promise.reject(err);
        }
      }
      return Promise.resolve({ data: null, status: 200 });
    },
    put: (url, data) => {
      if (url === "/api/settings" || url.startsWith("/api/settings")) {
        return Promise.resolve({ data: d().updateSettings(data), status: 200 });
      }
      return Promise.resolve({ data: null, status: 200 });
    },
    delete: () => Promise.resolve({ data: null, status: 200 }),
  };
};

/* ── Build the correct implementation ── */
let entities;
let auth;
let activeApiClient;

if (isLocalhost) {
  entities = createLocalEntities();
  auth = createLocalAuth();
  activeApiClient = createLocalApiClient();
} else {
  entities = createRemoteEntities();
  auth = createRemoteAuth();
  activeApiClient = apiClient;
}

export const base44 = { entities, auth, apiClient: activeApiClient };
