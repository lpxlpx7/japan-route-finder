const DATA_URL = "https://jp-routes.vercel.app/public/routes.csv";
const CACHE_KEY = "japan-aip-routes-cache-v1";
const LANGUAGE_KEY = "japan-aip-route-language";

const messages = {
  en: {
    pageTitle: "Japan Route Finder",
    connecting: "Connecting to route data",
    liveData: (count) => `Live data 路 ${count} routes`,
    offlineData: (count) => `Offline cache 路 ${count} routes`,
    dataError: "Route data unavailable",
    heroLine1: "Find your route",
    heroLine2: "across Japan.",
    lead: "Enter departure and arrival ICAO codes to search published AIP routes across Japan.",
    departure: "Departure airport",
    arrival: "Arrival airport",
    swap: "Swap departure and arrival airports",
    search: "Search recommended routes",
    lateNight: "Late-night route",
    lateNightRange: "23:00鈥?5:59 JST",
    examplesAria: "Route search examples",
    quickStart: "Quick start",
    exampleTokyoOsaka: "Tokyo 鈫?Osaka",
    exampleNaritaChitose: "Narita 鈫?New Chitose",
    exampleFukuokaNaha: "Fukuoka 鈫?Naha",
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
    nightResultCount: (count, time) => `${count} recommended 路 EOBT ${time} JST`
  },
  ja: {
    pageTitle: "Japan Route Finder",
    connecting: "銉囥兗銈裤伀鎺ョ稓涓?,
    liveData: (count) => `鏈€鏂般儑銉笺偪 路 ${count}浠禶,
    offlineData: (count) => `銈儠銉┿偆銉?路 ${count}浠禶,
    dataError: "銉囥兗銈挎帴缍氥偍銉┿兗",
    heroLine1: "鏃ユ湰銈掗銇躲儷銉笺儓銈?,
    heroLine2: "銇欍亹銇銇ゃ亼銈嬨€?,
    lead: "鍑虹櫤銉诲埌鐫€绌烘腐銇?ICAO 銈炽兗銉夈亱銈夈€佹棩鏈浗鍐呫伄鍏枊 AIP 鎺ㄥエ銉兗銉堛倰銇欍伆銈勩亸妞滅储銇с亶銇俱仚銆?,
    departure: "鍑虹櫤绌烘腐",
    arrival: "鍒扮潃绌烘腐",
    swap: "鍑虹櫤绌烘腐銇ㄥ埌鐫€绌烘腐銈掑叆銈屾浛銇堛倠",
    search: "鎺ㄥエ銉兗銉堛倰妞滅储",
    lateNight: "娣卞銉兗銉?,
    lateNightRange: "23:00銆?5:59 JST",
    examplesAria: "妞滅储渚?,
    quickStart: "銈偆銉冦偗妞滅储",
    exampleTokyoOsaka: "鏉变含 鈫?澶ч槳",
    exampleNaritaChitose: "鎴愮敯 鈫?鏂板崈姝?,
    exampleFukuokaNaha: "绂忓病 鈫?閭ｈ",
    results: "妞滅储绲愭灉",
    resultTitle: (dep, arr) => `${dep} 銇嬨倝 ${arr}`,
    resultCount: (count) => `${count}浠躲伄鍊欒`,
    noRoutes: "銉兗銉堛仾銇?,
    option: "鍊欒",
    copy: "銈炽償銉?,
    copyAria: (index) => `${index}鐣洰銇儷銉笺儓銈掋偝銉斻兗`,
    copied: "銉兗銉堛倰銈炽償銉笺仐銇俱仐銇?,
    time: "鍏ず鏅傞枔鍒堕檺",
    altitude: "楂樺害鍒堕檺",
    aircraft: "瀵捐薄姗熺ó",
    remarks: "鍌欒€?,
    unspecified: "鎸囧畾銇仐",
    emptyTitle: "瑭插綋銇欍倠銉兗銉堛亴銇傘倞銇俱仜銈?,
    emptyText: (dep, arr) => `${dep} 銇嬨倝 ${arr} 銇帹濂ㄣ儷銉笺儓銇従鍦ㄧ櫥閷层仌銈屻仸銇勩伨銇涖倱銆俙,
    emptyHint: "ICAO 銈炽兗銉夈倰纰鸿獚銇欍倠銇嬨€侀€嗘柟鍚戙仹妞滅储銇椼仸銇忋仩銇曘亜銆?,
    aboutTitle: "銇层仺銇ゃ伄鐩殑銈掋€佹槑蹇伀銆?,
    aboutText: "Kevin 銇?Japan Flight Dispatcher 銇嬨倝 AIP 銉兗銉堟绱㈡鑳姐倰鐙珛銇曘仜銆乄eb 鍚戙亼銇啀瑷▓銇椼伨銇椼仧銆傘偑銉偢銉娿儷銉椼儹銈般儵銉犮伄闁嬬櫤銇ㄤ繚瀹堛伀鎰熻瑵銇椼伨銇欍€?,
    originalProject: "銈儶銈搞儕銉儣銉偢銈с偗銉堛倰瑕嬨倠",
    footerRemix: "Kevin 銇儣銉偘銉┿儬銈掑熀銇€丣urina 銇屽啀瑷▓銇椼伨銇椼仧銆?,
    sourceLink: "銈姐兗銈广偝銉笺儔",
    footerNotice: "銉兗銉堛儑銉笺偪銇?jp-routes 銈堛倞鍙栧緱銇椼仸銇勩伨銇欍€傘儠銉┿偆銉堛偡銉熴儱銉兗銈枫儳銉炽亰銈堛伋瀛︾繏鐢ㄣ仹銇傘倞銆佸疅閬嬭埅銇伅浣跨敤銇с亶銇俱仜銈撱€?,
    openSourceAt: "銈姐兗銈广偝銉笺儔銇亾銇°倝",
    required: "鍑虹櫤绌烘腐銇ㄥ埌鐫€绌烘腐銇?ICAO 銈炽兗銉夈倰鍏ュ姏銇椼仸銇忋仩銇曘亜銆?,
    invalid: "ICAO 銈炽兗銉夈伅4鏂囧瓧銇嫳鏁板瓧銇у叆鍔涖仐銇︺亸銇犮仌銇勩€?,
    same: "鍑虹櫤绌烘腐銇ㄥ埌鐫€绌烘腐銇伅鐣般仾銈嬨偝銉笺儔銈掓寚瀹氥仐銇︺亸銇犮仌銇勩€?,
    loading: "銉兗銉堛儑銉笺偪銈掕銇胯炯銈撱仹銇勩伨銇欍€傘仐銇般倝銇忋亰寰呫仭銇忋仩銇曘亜銆?,
    unavailable: "銉兗銉堛儑銉笺偪銇帴缍氥仹銇嶃伨銇涖倱銆傘儘銉冦儓銉兗銈倰纰鸿獚銇椼仸鍐嶈銇胯炯銇裤仐銇︺亸銇犮仌銇勩€?,
    nightTimeRequired: "娣卞銉兗銉堢敤銇?EOBT 銈掗伕鎶炪仐銇︺亸銇犮仌銇勩€?,
    nightTimeRange: "娣卞 EOBT 銇?23:00銆?5:59 JST 銇瘎鍥层仹鎸囧畾銇椼仸銇忋仩銇曘亜銆?,
    nightResultCount: (count, time) => `${count}浠躲伄鍊欒 路 EOBT ${time} JST`
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
  const utc = windows.map(({ kind, start, end }) => `${kind} ${formatMinutes(start)}鈥?{formatMinutes(end)} UTC (Z)`).join(" 路 ");
  const jst = windows.map(({ kind, start, end }) => `${kind} ${formatMinutes(start + 540)}鈥?{formatMinutes(end + 540)} JST`).join(" 路 ");
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
