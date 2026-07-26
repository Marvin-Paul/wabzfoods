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
    const url = config.url.startsWith("http") ? config.url : `${window.location.origin}${config.url}`;
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
      const error = new Error(response.statusText || `Request failed with status ${response.status}`);
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch {
        error.data = null;
      }
      throw error;
    }

    const contentType = response.headers.get("content-type");
    const data = contentType && contentType.includes("application/json") ? await response.json() : await response.text();
    return { data, status: response.status };
  };

  return {
    get: (url, config = {}) => request({ ...config, method: "GET", url }),
    post: (url, data, config = {}) => request({ ...config, method: "POST", url, data }),
    put: (url, data, config = {}) => request({ ...config, method: "PUT", url, data }),
    delete: (url, config = {}) => request({ ...config, method: "DELETE", url }),
  };
};

const apiClient = createApiClient();

const entities = {
  Product: {
    list: () => apiClient.get("/api/products").then((r) => r.data || []),
    create: (payload) => apiClient.post("/api/products", payload).then((r) => r.data),
    update: (id, payload) => apiClient.put(`/api/products/${id}`, payload).then((r) => r.data),
    delete: (id) => apiClient.delete(`/api/products/${id}`).then((r) => r.data),
  },
  Order: {
    list: (sort = "-created_date", limit = 100) =>
      apiClient.get(`/api/orders?sort=${sort}&limit=${limit}`).then((r) => r.data || []),
    update: (id, payload) => apiClient.put(`/api/orders/${id}`, payload).then((r) => r.data),
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

const auth = {
  me: async () => {
    const res = await apiClient.get("/api/auth/me");
    return res.data;
  },
  logout: (redirect) => {
    storage.removeItem("base44_access_token");
    if (redirect && isBrowser) {
      window.location.href = redirect;
    }
  },
  redirectToLogin: (redirect) => {
    if (isBrowser) {
      window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
    }
  },
};

export const base44 = { entities, auth, apiClient };
