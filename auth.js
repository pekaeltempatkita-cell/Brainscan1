// auth.js — status login (dibaca dari token JWT di localStorage) + render navbar bersama.
(function () {
  "use strict";

  function decodeJwtPayload(token) {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
      return null;
    }
  }

  function getSession() {
    const token = NeuroCheckAPI.getToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem("neurocheck_token");
      return null;
    }
    return payload; // { email, name, role, username }
  }

  function requireLogin(redirectTo) {
    const session = getSession();
    if (!session) { window.location.href = redirectTo || "index.html"; return null; }
    return session;
  }

  function requireAdmin(redirectTo) {
    const session = requireLogin(redirectTo || "admin_login.html");
    if (session && session.role !== "admin") { window.location.href = "index.html"; return null; }
    return session;
  }

  function logout() {
    localStorage.removeItem("neurocheck_token");
    window.location.href = "index.html";
  }

  function renderNav() {
    const el = document.getElementById("nav-placeholder");
    if (!el) return;
    const session = getSession();

    let right = "";
    if (session && session.role === "admin") {
      right = `<a href="admin_dashboard.html" class="btn btn-outline btn-sm">Dashboard Admin</a>
               <a href="#" id="navLogout" class="btn btn-outline btn-sm">Logout</a>`;
    } else if (session) {
      right = `<span style="color:var(--text-muted); font-size:0.88rem;">${session.email || ""}</span>
               <a href="#" id="navLogout" class="btn btn-outline btn-sm">Logout</a>`;
    } else {
      right = `<a href="admin_login.html" class="btn btn-outline btn-sm">Login Admin</a>
               <a href="index.html#login" class="btn btn-primary btn-sm">Masuk dengan Google &rarr;</a>`;
    }

    el.innerHTML = `
      <nav class="navbar">
        <div class="brand">
          <a href="index.html" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit;">
            <img src="logo.png" alt="NeuroCheck Logo" style="height:36px; width:auto; object-fit:contain;">
            <span>NeuroCheck</span>
          </a>
        </div>
        <div class="nav-right">${right}</div>
      </nav>`;

    const logoutBtn = document.getElementById("navLogout");
    if (logoutBtn) logoutBtn.addEventListener("click", (e) => { e.preventDefault(); logout(); });
  }

  window.NeuroCheckAuth = { getSession, requireLogin, requireAdmin, logout, renderNav };
})();
