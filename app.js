const DATA_URL = "https://jp-routes.vercel.app/public/routes.csv";
const CACHE_KEY = "japan-aip-routes-cache-v1";
const LANGUAGE_KEY = "japan-aip-route-language";

const messages = {
  en: {
    pageTitle: "Japan Route Finder",
    connecting: "Connecting to route data",
    liveData: (count) => `Live data \u00b7 ${count} routes`,
    offlineData: (count) => `Offline cache \u00b7 ${count} routes`,
    dataError: "Route data unavailable",
    heroLine1: "Find your route",
    heroLine2: "across Japan.",
    lead: "Enter departure and arrival ICAO codes to search published AIP routes across Japan.",
    departure: "Departure airport",
    arrival: "Arrival airport",
    swap: "Swap departure and arrival airports",
    search: "Search recommended routes",
    lateNight: "Late-night route",
    lateNightRange: "23:00\u201305:59 JST",
    examplesAria: "Route search examples",
    quickStart: "Quick start",
    exampleTokyoOsaka: "Tokyo \u2192 Osaka",
    exampleNaritaChitose: "Narita \u2192 New Chitose",
    exampleFukuokaNaha: "Fukuoka \u2192 Naha",
    results: "Search results",
    resultTitle: (dep, arr) => `${dep} to ${arr}`,
    resultCount: (count) => `${count} recommended`,
    noRoutes: "No routes",
    option: "Option",
    copy: "Copy",
    copyAria: (index) => `Copy route option ${index}`,
    copied: "Route copied",
    time: "Published time restriction",
    altitude: "Altitude restriction",
    aircraft: "Aircraft",
    remarks: "Remarks",
    unspecified: "Not specified",
    emptyTitle: "No matching route found",
    emptyText: (dep, arr) => `No recommended route from ${dep} to ${arr} is currently listed.`,
    emptyHint: "Check the ICAO codes or try the reverse direction.",
    aboutTitle: "Built for one clear purpose.",
    aboutText: "This web edition isolates and redesigns the AIP route search from Kevin's Japan Flight Dispatcher. Many thanks to Kevin for developing and maintaining the original application.",
    originalProject: "View the original project",
    footerRemix: "Redesigned by Jurina from Kevin's original application.",
    sourceLink: "Source code",
    footerNotice: "Route data is provided by jp-routes. For flight simulation and educational use only. Not for real-world navigation.",
    openSourceAt: "Source available at",
    required: "Enter both departure and arrival ICAO codes.",
    invalid: "ICAO codes must contain four letters or numbers.",
    same: "Departure and arrival airports must be different.",
    loading: "Route data is still loading. Please wait.",
    unavailable: "Route data could not be loaded. Check your connection and refresh the page.",
    nightTimeRequired: "Select an EOBT time for the late-night route filter.",
    nightTimeRange: "Late-night EOBT must be between 23:00 and 05:59 JST.",
    nightResultCount: (count, time) => `${count} recommended \u00b7 EOBT ${time} JST`
  },
  ja: {
    pageTitle: "Japan Route Finder",
    connecting: "\u30c7\u30fc\u30bf\u306b\u63a5\u7d9a\u4e2d",
    liveData: (count) => `\u6700\u65b0\u30c7\u30fc\u30bf \u00b7 ${count}\u4ef6`,
    offlineData: (count) => `\u30aa\u30d5\u30e9\u30a4\u30f3 \u00b7 ${count}\u4ef6`,
    dataError: "\u30c7\u30fc\u30bf\u63a5\u7d9a\u30a8\u30e9\u30fc",
    heroLine1: "\u65e5\u672c\u3092\u98db\u3076\u30eb\u30fc\u30c8\u3092",
    heroLine2: "\u3059\u3050\u306b\u898b\u3064\u3051\u308b\u3002",
    lead: "\u51fa\u767a\u30fb\u5230\u7740\u7a7a\u6e2f\u306e ICAO \u30b3\u30fc\u30c9\u304b\u3089\u3001\u65e5\u672c\u56fd\u5185\u306e\u516c\u958b AIP \u63a8\u5968\u30eb\u30fc\u30c8\u3092\u3059\u3070\u3084\u304f\u691c\u7d22\u3067\u304d\u307e\u3059\u3002",
    departure: "\u51fa\u767a\u7a7a\u6e2f",
    arrival: "\u5230\u7740\u7a7a\u6e2f",
    swap: "\u51fa\u767a\u7a7a\u6e2f\u3068\u5230\u7740\u7a7a\u6e2f\u3092\u5165\u308c\u66ff\u3048\u308b",
    search: "\u63a8\u5968\u30eb\u30fc\u30c8\u3092\u691c\u7d22",
    lateNight: "\u6df1\u591c\u30eb\u30fc\u30c8",
    lateNightRange: "23:00\u301c05:59 JST",
    examplesAria: "\u691c\u7d22\u4f8b",
    quickStart: "\u30af\u30a4\u30c3\u30af\u691c\u7d22",
    exampleTokyoOsaka: "\u6771\u4eac \u2192 \u5927\u962a",
    exampleNaritaChitose: "\u6210\u7530 \u2192 \u65b0\u5343\u6b73",
    exampleFukuokaNaha: "\u798f\u5ca1 \u2192 \u90a3\u8987",
    results: "\u691c\u7d22\u7d50\u679c",
    resultTitle: (dep, arr) => `${dep} \u304b\u3089 ${arr}`,
    resultCount: (count) => `${count}\u4ef6\u306e\u5019\u88dc`,
    noRoutes: "\u30eb\u30fc\u30c8\u306a\u3057",
    option: "\u5019\u88dc",
    copy: "\u30b3\u30d4\u30fc",
    copyAria: (index) => `${index}\u756a\u76ee\u306e\u30eb\u30fc\u30c8\u3092\u30b3\u30d4\u30fc`,
    copied: "\u30eb\u30fc\u30c8\u3092\u30b3\u30d4\u30fc\u3057\u307e\u3057\u305f",
    time: "\u516c\u793a\u6642\u9593\u5236\u9650",
    altitude: "\u9ad8\u5ea6\u5236\u9650",
    aircraft: "\u5bfe\u8c61\u6a5f\u7a2e",
    remarks: "\u5099\u8003",
    unspecified: "\u6307\u5b9a\u306a\u3057",
    emptyTitle: "\u8a72\u5f53\u3059\u308b\u30eb\u30fc\u30c8\u304c\u3042\u308a\u307e\u305b\u3093",
    emptyText: (dep, arr) => `${dep} \u304b\u3089 ${arr} \u306e\u63a8\u5968\u30eb\u30fc\u30c8\u306f\u73fe\u5728\u767b\u9332\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002`,
    emptyHint: "ICAO \u30b3\u30fc\u30c9\u3092\u78ba\u8a8d\u3059\u308b\u304b\u3001\u9006\u65b9\u5411\u3067\u691c\u7d22\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    aboutTitle: "\u3072\u3068\u3064\u306e\u76ee\u7684\u3092\u3001\u660e\u5feb\u306b\u3002",
    aboutText: "Kevin \u306e Japan Flight Dispatcher \u304b\u3089 AIP \u30eb\u30fc\u30c8\u691c\u7d22\u6a5f\u80fd\u3092\u72ec\u7acb\u3055\u305b\u3001Web \u5411\u3051\u306b\u518d\u8a2d\u8a08\u3057\u307e\u3057\u305f\u3002\u30aa\u30ea\u30b8\u30ca\u30eb\u30d7\u30ed\u30b0\u30e9\u30e0\u306e\u958b\u767a\u3068\u4fdd\u5b88\u306b\u611f\u8b1d\u3057\u307e\u3059\u3002",
    originalProject: "\u30aa\u30ea\u30b8\u30ca\u30eb\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u3092\u898b\u308b",
    footerRemix: "Kevin \u306e\u30d7\u30ed\u30b0\u30e9\u30e0\u3092\u57fa\u306b\u3001Jurina \u304c\u518d\u8a2d\u8a08\u3057\u307e\u3057\u305f\u3002",
    sourceLink: "\u30bd\u30fc\u30b9\u30b3\u30fc\u30c9",
    footerNotice: "\u30eb\u30fc\u30c8\u30c7\u30fc\u30bf\u306f jp-routes \u3088\u308a\u53d6\u5f97\u3057\u3066\u3044\u307e\u3059\u3002\u30d5\u30e9\u30a4\u30c8\u30b7\u30df\u30e5\u30ec\u30fc\u30b7\u30e7\u30f3\u304a\u3088\u3073\u5b66\u7fd2\u7528\u3067\u3042\u308a\u3001\u5b9f\u904b\u822a\u306b\u306f\u4f7f\u7528\u3067\u304d\u307e\u305b\u3093\u3002",
    openSourceAt: "\u30bd\u30fc\u30b9\u30b3\u30fc\u30c9\u306f\u3053\u3061\u3089",
    required: "\u51fa\u767a\u7a7a\u6e2f\u3068\u5230\u7740\u7a7a\u6e2f\u306e ICAO \u30b3\u30fc\u30c9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    invalid: "ICAO \u30b3\u30fc\u30c9\u306f4\u6587\u5b57\u306e\u82f1\u6570\u5b57\u3067\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    same: "\u51fa\u767a\u7a7a\u6e2f\u3068\u5230\u7740\u7a7a\u6e2f\u306b\u306f\u7570\u306a\u308b\u30b3\u30fc\u30c9\u3092\u6307\u5b9a\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    loading: "\u30eb\u30fc\u30c8\u30c7\u30fc\u30bf\u3092\u8aad\u307f\u8fbc\u3093\u3067\u3044\u307e\u3059\u3002\u3057\u3070\u3089\u304f\u304a\u5f85\u3061\u304f\u3060\u3055\u3044\u3002",
    unavailable: "\u30eb\u30fc\u30c8\u30c7\u30fc\u30bf\u306b\u63a5\u7d9a\u3067\u304d\u307e\u305b\u3093\u3002\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u3092\u78ba\u8a8d\u3057\u3066\u518d\u8aad\u307f\u8fbc\u307f\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    nightTimeRequired: "\u6df1\u591c\u30eb\u30fc\u30c8\u7528\u306e EOBT \u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    nightTimeRange: "\u6df1\u591c EOBT \u306f 23:00\u301c05:59 JST \u306e\u7bc4\u56f2\u3067\u6307\u5b9a\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    nightResultCount: (count, time) => `${count}\u4ef6\u306e\u5019\u88dc \u00b7 EOBT ${time} JST`
  }
};

const state = { routes: [], loading: true, language: "en", source: "loading", lastQuery: null };
const elements = {
  form: document.querySelector("#routeForm"), departure: document.querySelector("#departure"), arrival: document.querySelector("#arrival"), swap: document.querySelector("#swapButton"), search: document.querySelector("#searchButton"), lateNight: document.querySelector("#lateNight"), eobtTime: document.querySelector("#eobtTime"), error: document.querySelector("#formError"), dataLabel: document.querySelector("#dataLabel"), dataStatus: document.querySelector(".data-status"), section: document.querySelector("#resultsSection"), title: document.querySelector("#resultTitle"), count: document.querySelector("#resultCount"), results: document.querySelector("#results"), toast: document.querySelector("#toast"), jstTime: document.querySelector("#jstTime"), utcTime: document.querySelector("#utcTime"), header: document.querySelector(".site-header")
};

const t = (key, ...args) => {
  const value = messages[state.language][key];
  return typeof value === "function" ? value(...args) : value;
};

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index], next = text[index + 1];
    if (char === '"' && quoted && next === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(value.trim()); value = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") index += 1; row.push(value.trim()); if (row.some(Boolean)) rows.push(row); row = []; value = ""; }
    else value += char;
  }
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeRows(rows) {
  if (!rows.length) return [];
  const header = rows[0].map((cell) => cell.replace(/^\uFEFF/, "").trim().toLowerCase());
  const hasHeader = header.includes("dep") && (header.includes("dest") || header.includes("destination"));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const indexOf = (...names) => names.map((name) => header.indexOf(name)).find((index) => index >= 0) ?? -1;
  const indexes = hasHeader ? { dep: indexOf("dep", "departure"), arr: indexOf("dest", "destination", "arr", "arrival"), time: indexOf("time restriction", "time"), altitude: indexOf("altitude"), aircraft: indexOf("aircraft"), route: indexOf("route"), remarks: indexOf("remarks", "remark") } : { dep: 0, arr: 1, time: 2, altitude: 3, aircraft: 4, route: 5, remarks: 6 };
  return dataRows.filter((row) => row.length >= 2).map((row) => ({ dep: (row[indexes.dep] || "").trim().toUpperCase(), arr: (row[indexes.arr] || "").trim().toUpperCase(), time: (row[indexes.time] || "").trim(), altitude: (row[indexes.altitude] || "").trim(), aircraft: (row[indexes.aircraft] || "").trim(), route: (row[indexes.route] || "").trim(), remarks: (row[indexes.remarks] || "").trim() })).filter((route) => route.dep && route.arr && route.route);
}

async function loadRoutes() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const routes = normalizeRows(parseCsv(text));
    if (!routes.length) throw new Error("Empty route data");
    state.routes = routes;
    state.source = "live";
    try { localStorage.setItem(CACHE_KEY, text); } catch (_) { /* Storage may be unavailable. */ }
  } catch (_) {
    let cached = "";
    try { cached = localStorage.getItem(CACHE_KEY) || ""; } catch (_) { /* Ignore unavailable storage. */ }
    state.routes = cached ? normalizeRows(parseCsv(cached)) : [];
    state.source = state.routes.length ? "offline" : "error";
  } finally {
    state.loading = false;
    elements.search.disabled = false;
    updateDataStatus();
  }
}

function updateDataStatus() {
  const label = state.source === "live" ? t("liveData", state.routes.length) : state.source === "offline" ? t("offlineData", state.routes.length) : state.source === "error" ? t("dataError") : t("connecting");
  elements.dataLabel.textContent = label;
  elements.dataStatus.classList.toggle("is-ready", state.source === "live" || state.source === "offline");
  elements.dataStatus.classList.toggle("is-error", state.source === "error");
}

function applyLanguage(language) {
  state.language = language;
  document.documentElement.lang = language === "ja" ? "ja" : "en";
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => { element.setAttribute("aria-label", t(element.dataset.i18nAria)); });
  document.querySelectorAll(".language-button").forEach((button) => { const active = button.dataset.language === language; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); });
  elements.error.textContent = "";
  updateDataStatus();
  try { localStorage.setItem(LANGUAGE_KEY, language); } catch (_) { /* Ignore unavailable storage. */ }
  if (state.lastQuery) renderResults(state.lastQuery.dep, state.lastQuery.arr, state.lastQuery.matches, false);
}

function normalizeIcao(value) { return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4); }
function parseClock(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return null;
  const hours = Number(match[1]), minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
}

function isLateNight(minutes) { return minutes !== null && (minutes >= 23 * 60 || minutes < 6 * 60); }

function validate(dep, arr) {
  if (!dep || !arr) return t("required");
  if (dep.length !== 4 || arr.length !== 4) return t("invalid");
  if (dep === arr) return t("same");
  if (state.loading) return t("loading");
  if (!state.routes.length) return t("unavailable");
  if (elements.lateNight.checked) {
    const eobt = parseClock(elements.eobtTime.value);
    if (eobt === null) return t("nightTimeRequired");
    if (!isLateNight(eobt)) return t("nightTimeRange");
  }
  return "";
}
function escapeHtml(value) { return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function metaItem(label, value, extraClass = "") { return `<div class="meta-item ${extraClass}"><span>${label}</span><p>${escapeHtml(value || t("unspecified"))}</p></div>`; }

function formatMinutes(minutes) {
  const normalized = (minutes + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

function formatTimeRestriction(restriction) {
  const windows = [];
  const pattern = /(EOBT|ETA)\s*(\d{2})(\d{2})\s*-\s*(\d{2})(\d{2})/gi;
  let match;
  while ((match = pattern.exec(restriction || ""))) {
    windows.push({
      kind: match[1].toUpperCase(),
      start: Number(match[2]) * 60 + Number(match[3]),
      end: Number(match[4]) * 60 + Number(match[5])
    });
  }
  if (!windows.length) return restriction;
  const utc = windows.map(({ kind, start, end }) => `${kind} ${formatMinutes(start)}\u2013${formatMinutes(end)} UTC (Z)`).join(" \u00b7 ");
  const jst = windows.map(({ kind, start, end }) => `${kind} ${formatMinutes(start + 540)}\u2013${formatMinutes(end + 540)} JST`).join(" \u00b7 ");
  return `${utc}\n${jst}`;
}

function routeCard(route, index) {
  return `<article class="route-card" style="animation-delay:${Math.min(index * 70, 280)}ms"><div class="route-card-head"><div><span class="route-number">${t("option")} ${String(index + 1).padStart(2, "0")}</span><div class="route-pair"><strong>${escapeHtml(route.dep)}</strong><svg viewBox="0 0 40 16" aria-hidden="true"><path d="M1 8h36m-7-6 7 6-7 6"/></svg><strong>${escapeHtml(route.arr)}</strong></div></div><button class="copy-button" type="button" data-copy="${escapeHtml(route.route)}" aria-label="${t("copyAria", index + 1)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h10v11H8zM6 16H5V5h10v1"/></svg><span>${t("copy")}</span></button></div><div class="route-string">${escapeHtml(route.route)}</div><div class="route-meta">${metaItem(t("time"), formatTimeRestriction(route.time), "time-meta")}${metaItem(t("altitude"), route.altitude)}${metaItem(t("aircraft"), route.aircraft)}${route.remarks ? metaItem(t("remarks"), route.remarks, "remarks") : ""}</div></article>`;
}

function renderResults(dep, arr, matches, shouldScroll = true) {
  state.lastQuery = { dep, arr, matches };
  elements.section.hidden = false;
  elements.title.textContent = t("resultTitle", dep, arr);
  elements.count.textContent = matches.length ? (elements.lateNight.checked ? t("nightResultCount", matches.length, elements.eobtTime.value) : t("resultCount", matches.length)) : t("noRoutes");
  elements.results.innerHTML = matches.length ? matches.map(routeCard).join("") : `<div class="empty-state liquid-glass"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="21" cy="21" r="12"/><path d="m30 30 9 9M15 21h12"/></svg><h3>${t("emptyTitle")}</h3><p>${t("emptyText", escapeHtml(dep), escapeHtml(arr))}<br>${t("emptyHint")}</p></div>`;
  if (shouldScroll) requestAnimationFrame(() => elements.section.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function searchRoutes() {
  const dep = normalizeIcao(elements.departure.value), arr = normalizeIcao(elements.arrival.value);
  elements.departure.value = dep; elements.arrival.value = arr;
  const error = validate(dep, arr); elements.error.textContent = error;
  if (error) return;
  let matches = state.routes.filter((route) => route.dep === dep && route.arr === arr);
  if (elements.lateNight.checked) matches = filterByEobt(matches, parseClock(elements.eobtTime.value));
  renderResults(dep, arr, matches);
  history.replaceState(null, "", `?dep=${encodeURIComponent(dep)}&arr=${encodeURIComponent(arr)}`);
}

function parseEobtWindows(restriction) {
  const windows = [];
  const pattern = /EOBT\s*(\d{2})(\d{2})\s*-\s*(\d{2})(\d{2})/gi;
  let match;
  while ((match = pattern.exec(restriction || ""))) {
    windows.push([Number(match[1]) * 60 + Number(match[2]), Number(match[3]) * 60 + Number(match[4])]);
  }
  return windows;
}

function isInWindow(time, start, end) { return start <= end ? time >= start && time <= end : time >= start || time <= end; }

function filterByEobt(routes, eobtJst) {
  const eobtUtc = (eobtJst - 9 * 60 + 1440) % 1440;
  return routes.filter((route) => {
    const windows = parseEobtWindows(route.time);
    if (!route.time.trim()) return true;
    if (!windows.length) return false;
    return windows.every(([start, end]) => isInWindow(eobtUtc, start, end));
  });
}

function updateClocks() {
  const now = new Date();
  const options = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
  elements.jstTime.textContent = new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "Asia/Tokyo" }).format(now);
  elements.utcTime.textContent = new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(now);
  elements.jstTime.dateTime = now.toISOString(); elements.utcTime.dateTime = now.toISOString();
}

function showToast(message) { elements.toast.textContent = message; elements.toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 1800); }
async function copyText(text) { try { await navigator.clipboard.writeText(text); } catch (_) { const textarea = document.createElement("textarea"); textarea.value = text; textarea.style.position = "fixed"; textarea.style.opacity = "0"; document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove(); } showToast(t("copied")); }

elements.form.addEventListener("submit", (event) => { event.preventDefault(); searchRoutes(); });
[elements.departure, elements.arrival].forEach((input) => input.addEventListener("input", () => { input.value = normalizeIcao(input.value); elements.error.textContent = ""; }));
elements.swap.addEventListener("click", () => { const dep = elements.departure.value; elements.departure.value = elements.arrival.value; elements.arrival.value = dep; elements.error.textContent = ""; });
elements.lateNight.addEventListener("change", () => {
  elements.eobtTime.disabled = !elements.lateNight.checked;
  if (elements.lateNight.checked) {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Tokyo" }).format(now);
    elements.eobtTime.value = isLateNight(parseClock(parts)) ? parts : "23:00";
  }
  elements.error.textContent = "";
});
document.querySelector(".examples").addEventListener("click", (event) => { const button = event.target.closest("button[data-dep]"); if (!button) return; elements.departure.value = button.dataset.dep; elements.arrival.value = button.dataset.arr; searchRoutes(); });
elements.results.addEventListener("click", (event) => { const button = event.target.closest("button[data-copy]"); if (button) copyText(button.dataset.copy); });
document.querySelector(".language-switch").addEventListener("click", (event) => { const button = event.target.closest("button[data-language]"); if (button) applyLanguage(button.dataset.language); });
window.addEventListener("scroll", () => elements.header.classList.toggle("is-scrolled", window.scrollY > 8), { passive: true });

async function init() {
  let preferred = "en";
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    preferred = saved === "en" || saved === "ja" ? saved : (navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en");
  } catch (_) {
    preferred = navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
  }
  applyLanguage(preferred === "ja" ? "ja" : "en");
  updateClocks(); setInterval(updateClocks, 1000);
  elements.search.disabled = true;
  const params = new URLSearchParams(location.search);
  elements.departure.value = normalizeIcao(params.get("dep") || ""); elements.arrival.value = normalizeIcao(params.get("arr") || "");
  await loadRoutes();
  if (elements.departure.value && elements.arrival.value) searchRoutes();
}

init();
