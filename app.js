// FlightDrop shared client logic.
// Set this to your deployed Worker URL. Left as a relative "/api" path
// works if you proxy Pages -> Worker on the same domain; otherwise set the
// absolute URL (e.g. https://flightdrop-worker.yourname.workers.dev).
window.FLIGHTDROP_API_BASE = window.FLIGHTDROP_API_BASE || localStorage.getItem("fd_api_base") || "";

const FD = (() => {
  function apiBase() {
    return window.FLIGHTDROP_API_BASE || "";
  }

  async function api(path, options = {}) {
    const base = apiBase();
    if (!base) throw new Error("Set your Worker API URL in Settings first.");
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json() : await res.text();
    if (!res.ok) {
      const message = (data && data.error) || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data;
  }

  function escapeHtml(value) {
    if (value == null) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Wires a text input up to a searchable dropdown of known airports (see
  // airports.js). Selecting a suggestion stores the 3-letter code on
  // input.dataset.code and displays "City (CODE)"; typing without picking
  // one clears dataset.code, and losing focus without a valid selection
  // resets the field - this forces the user to actually pick a recognized
  // airport rather than typing free text the parser might not match later.
  function initAirportPicker(input) {
    const wrapper = input.closest(".airport-picker") || input.parentElement;
    let dropdown = wrapper.querySelector(".airport-suggestions");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "airport-suggestions";
      dropdown.hidden = true;
      wrapper.appendChild(dropdown);
    }

    function renderSuggestions(query) {
      const airports = window.FLIGHTDROP_AIRPORTS || [];
      const q = query.trim().toLowerCase();
      const matches = q
        ? airports.filter((a) => a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)).slice(0, 8)
        : airports.slice(0, 8);

      dropdown.innerHTML = "";
      if (matches.length === 0) {
        const empty = document.createElement("div");
        empty.className = "airport-suggestions-empty";
        empty.textContent = "No matching airports - try a different city or code.";
        dropdown.appendChild(empty);
        dropdown.hidden = false;
        return;
      }

      matches.forEach((a) => {
        const item = document.createElement("div");
        item.className = "airport-suggestion-item";
        item.innerHTML = `${escapeHtml(a.city)}<span class="code">${escapeHtml(a.code)}</span>`;
        // mousedown (not click) fires before the input's blur, so we can
        // preventDefault() to keep focus and commit the selection cleanly -
        // this also works for touch taps on iOS Safari.
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          input.value = `${a.city} (${a.code})`;
          input.dataset.code = a.code;
          dropdown.hidden = true;
        });
        dropdown.appendChild(item);
      });
      dropdown.hidden = false;
    }

    input.addEventListener("focus", () => renderSuggestions(input.value));
    input.addEventListener("input", () => {
      input.dataset.code = "";
      renderSuggestions(input.value);
    });
    input.addEventListener("blur", () => {
      setTimeout(() => {
        dropdown.hidden = true;
        if (!input.dataset.code) input.value = "";
      }, 200);
    });
  }

  function toast(message, kind = "") {
    let el = document.getElementById("fd-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "fd-toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = `toast show ${kind}`;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return null;
    return navigator.serviceWorker.register("/sw.js");
  }

  async function pushSupported() {
    return "serviceWorker" in navigator && "PushManager" in window;
  }

  const FIREBASE_SDK_VERSION = "10.12.2";

  async function getFirebaseConfig() {
    const cached = localStorage.getItem("fd_firebase_config");
    if (cached) return JSON.parse(cached);
    const config = await api("/api/firebase-config");
    localStorage.setItem("fd_firebase_config", JSON.stringify(config));
    return config;
  }

  // Uses Firebase Cloud Messaging for push instead of raw Web Push. We still
  // register our own /sw.js (which already has a generic `push` handler) and
  // just hand that registration to Firebase, so there's no separate
  // firebase-messaging-sw.js to maintain.
  async function enablePush() {
    if (!(await pushSupported())) {
      throw new Error("Push isn't supported in this browser. On iPhone, add FlightDrop to your Home Screen first (Share -> Add to Home Screen), then open it from there and try again.");
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Notification permission was not granted.");

    const reg = await registerServiceWorker();
    await navigator.serviceWorker.ready;

    const config = await getFirebaseConfig();
    if (!config.apiKey || !config.vapidKey) {
      throw new Error("Firebase isn't configured yet - check FIREBASE_* secrets on the Worker.");
    }

    const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`);
    const { getMessaging, getToken } = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-messaging.js`);

    const app = initializeApp(config);
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: config.vapidKey, serviceWorkerRegistration: reg });
    if (!token) throw new Error("Couldn't get a push token from Firebase.");

    await api("/api/push/subscribe", { method: "POST", body: JSON.stringify({ token }) });
    localStorage.setItem("fd_push_enabled", "1");
    return token;
  }

  function isPushEnabled() {
    return localStorage.getItem("fd_push_enabled") === "1";
  }

  function setApiBase(url) {
    window.FLIGHTDROP_API_BASE = url;
    localStorage.setItem("fd_api_base", url);
  }

  function formatMoney(amount, currency) {
    if (amount == null) return "—";
    const symbol = { USD: "$", AUD: "A$", GBP: "£", EUR: "€", NZD: "NZ$", CAD: "C$", JPY: "¥" }[currency] || (currency ? currency + " " : "$");
    const value = Number(amount);
    const formatted = Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2);
    return `${symbol}${formatted}`;
  }

  function watchStatus(watch) {
    if (watch.last_seen_price == null) return "unchanged";
    if (watch.target_price != null && watch.last_seen_price <= watch.target_price) return "below-target";
    if (watch.previous_price != null && watch.last_seen_price < watch.previous_price) return "dropped";
    if (watch.target_price != null && watch.last_seen_price > watch.target_price) return "above-target";
    return "unchanged";
  }

  function statusLabel(status) {
    return {
      "below-target": "Below target",
      dropped: "Price dropped",
      "above-target": "Above target",
      unchanged: "Unchanged",
    }[status] || "Unchanged";
  }

  function renderFlap(text) {
    const span = document.createElement("span");
    span.className = "flap";
    [...String(text)].forEach((ch) => {
      const d = document.createElement("span");
      d.className = "digit";
      d.textContent = ch === " " ? "\u00A0" : ch;
      span.appendChild(d);
    });
    return span;
  }

  function highlightNav() {
    const page = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".bottom-nav a").forEach((a) => {
      a.classList.toggle("active", a.dataset.page === page);
    });
  }

  return {
    api,
    apiBase,
    setApiBase,
    toast,
    escapeHtml,
    initAirportPicker,
    enablePush,
    isPushEnabled,
    pushSupported,
    registerServiceWorker,
    formatMoney,
    watchStatus,
    statusLabel,
    renderFlap,
    highlightNav,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  FD.highlightNav();
  FD.registerServiceWorker().catch(() => {});
});
