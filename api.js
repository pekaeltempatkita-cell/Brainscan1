// Cloud Run API helper for NeuroCheck / BrainScan2
(function () {
  "use strict";

  window.NeuroCheckAPI = {
    baseUrl: window.API_BASE_URL || "https://brainscan2-349786493495.asia-southeast1.run.app",

    getToken() {
      return localStorage.getItem("neurocheck_token") || localStorage.getItem("token") || "";
    },

    async request(path, options = {}) {
      const headers = new Headers(options.headers || {});
      if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const token = this.getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const response = await fetch(this.baseUrl + path, {
        ...options,
        headers
      });

      const text = await response.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; }
      catch { data = { raw: text }; }

      if (!response.ok) {
        const message = data.detail || data.message || data.error || `HTTP ${response.status}`;
        throw new Error(message);
      }
      return data;
    },

    health() { return this.request("/api/health"); },
    classes() { return this.request("/api/classes"); },

    async predict(file) {
      const form = new FormData();
      form.append("file", file);
      return this.request("/api/predict", { method: "POST", body: form });
    },

    async googleLogin(credential) {
      return this.request("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential })
      });
    },

    async demoLogin() {
      return this.request("/api/auth/demo", { method: "POST" });
    }
  };
})();
