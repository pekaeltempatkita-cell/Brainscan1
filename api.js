// Cloud Run API helper for NeuroCheck / BrainScan2
(function () {
  "use strict";

  window.NeuroCheckAPI = {
    baseUrl: window.API_BASE_URL || "https://brainscan2-349786493495.asia-southeast1.run.app",

    getToken() {
      return localStorage.getItem("neurocheck_token") || "";
    },
    setToken(token) {
      localStorage.setItem("neurocheck_token", token);
    },

    async request(path, options = {}) {
      const headers = new Headers(options.headers || {});
      if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      const token = this.getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const response = await fetch(this.baseUrl + path, { ...options, headers });
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

    googleLogin(credential) {
      return this.request("/api/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
    },
    demoLogin() {
      return this.request("/api/auth/demo", { method: "POST" });
    },
    adminLogin(username, password) {
      return this.request("/api/auth/admin/login", { method: "POST", body: JSON.stringify({ username, password }) });
    },

    listPatients() { return this.request("/api/patients"); },
    createPatient(data) { return this.request("/api/patients", { method: "POST", body: JSON.stringify(data) }); },
    getPatient(nik) { return this.request(`/api/patients/${encodeURIComponent(nik)}`); },

    uploadScan(nik, file, extra = {}) {
      const form = new FormData();
      form.append("file", file);
      Object.entries(extra).forEach(([k, v]) => form.append(k, v ?? ""));
      return this.request(`/api/patients/${encodeURIComponent(nik)}/upload`, { method: "POST", body: form });
    },

    reportUrl(nik, predictionId) {
      return `${this.baseUrl}/api/patients/${encodeURIComponent(nik)}/report/${predictionId}?token=${encodeURIComponent(this.getToken())}`;
    },

    adminOverview() { return this.request("/api/admin/overview"); },
  };
})();
