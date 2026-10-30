const form = document.querySelector("#route-form");
const results = document.querySelector("#results");
const formError = form.querySelector(".form-error");
const submitButton = form.querySelector('button[type="submit"]');
const toast = document.querySelector(".toast");
let language = document.documentElement.lang === "ja" ? "ja" : "en";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

const t = (key, args = {}) => {
  let text = window.TRANSLATIONS[language][key] ?? window.TRANSLATIONS.en[key] ?? key;
  Object.entries(args).forEach(([name, value]) => { text = text.replaceAll(`{${name}}`, escapeHtml(value)); });
  return text;
};

// ---------- Language ----------
const applyLanguage = (selected) => {
  language = selected === "ja" ? "ja" : "en";
  document.documentElement.lang = language;
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const args = element.dataset.i18nArgs ? JSON.parse(element.dataset.i18nArgs) : {};
    element.innerHTML = t(element.dataset.i18n, args);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel)));
  document.querySelectorAll(".language-button").forEach((button) => { button.checked = button.value === language; });
  window.RouteMap?.refreshLanguage(t);
  try { localStorage.setItem("language", language); } catch (error) { /* Cookie below still works. */ }
  document.cookie = `language=${language}; path=/; max-age=31536000; samesite=lax`;
};
document.querySelectorAll(".language-button").forEach((button) => button.addEventListener("change", () => button.checked && applyLanguage(button.value)));

// ---------- Theme ----------
const themeButton = document.querySelector(".theme-button");
const themeColor = document.querySelector('meta[name="theme-color"]');
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
const applyTheme = (preference) => {
  const resolved = preference === "system" ? (systemDark.matches ? "dark" : "light") : preference;
  document.documentElement.dataset.theme = resolved;
  themeButton.querySelector(".theme-icon").innerHTML = `<span class="icon ${resolved === "dark" ? "icon-sun" : "icon-moon"}"></span>`;
  themeColor.content = resolved === "dark" ? "#000000" : "#f5f5f7";
  window.RouteMap?.refreshTheme();
};
const savedTheme = () => { try { return localStorage.getItem("theme") || "system"; } catch (error) { return "system"; } };
applyTheme(savedTheme());
themeButton.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", next); } catch (error) { /* This page view still switches. */ }
  applyTheme(next);
});
systemDark.addEventListener("change", () => { if (savedTheme() === "system") applyTheme("system"); });

// ---------- Search ----------
const fields = { dep: form.elements.dep, arr: form.elements.arr, eobt: form.elements.eobt };
const cleanIcao = (value) => value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);

const showError = (key) => {
  formError.textContent = key ? t(key) : "";
  if (key) formError.dataset.i18n = key; else delete formError.dataset.i18n;
};

const validate = () => {
  const dep = cleanIcao(fields.dep.value), arr = cleanIcao(fields.arr.value);
  if (!dep || !arr) return "errorRequired";
  if (dep.length !== 4 || arr.length !== 4) return "errorInvalid";
  if (dep === arr) return "errorSame";
  return "";
};

let pending = null;
const search = async ({ push = true } = {}) => {
  const error = validate();
  showError(error);
  if (error) return;
  const params = new URLSearchParams({ dep: cleanIcao(fields.dep.value), arr: cleanIcao(fields.arr.value) });
  if (fields.eobt.value) params.set("eobt", fields.eobt.value);
  pending?.abort();
  pending = new AbortController();
  submitButton.disabled = true;
  submitButton.querySelector("span").dataset.i18n = "searching";
  submitButton.querySelector("span").textContent = t("searching");
  try {
    const response = await fetch(`./?${params}&partial=1`, { signal: pending.signal, headers: { Accept: "application/json" } });
    const data = await response.json();
    showError(data.errorKey);
    if (data.errorKey) return;
    results.innerHTML = data.html;
    results.hidden = false;
    window.RouteMap?.mount(results);
    applyLanguage(language);
    if (push) history.pushState(null, "", `?${params}`);
    results.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  } catch (error) {
    if (error.name !== "AbortError") showError("errorService");
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").dataset.i18n = "search";
    submitButton.querySelector("span").textContent = t("search");
  }
};

form.addEventListener("submit", (event) => { event.preventDefault(); search(); });
[fields.dep, fields.arr].forEach((input) => input.addEventListener("input", () => {
  input.value = cleanIcao(input.value);
  showError("");
}));
document.querySelector(".swap-button").addEventListener("click", () => {
  [fields.dep.value, fields.arr.value] = [fields.arr.value, fields.dep.value];
  showError("");
});
document.querySelector(".examples").addEventListener("click", (event) => {
  const link = event.target.closest("a[data-dep]");
  if (!link) return;
  event.preventDefault();
  fields.dep.value = link.dataset.dep;
  fields.arr.value = link.dataset.arr;
  fields.eobt.value = "";
  search();
});
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(location.search);
  fields.dep.value = params.get("dep") || "";
  fields.arr.value = params.get("arr") || "";
  fields.eobt.value = params.get("eobt") || "";
  if (fields.dep.value && fields.arr.value) search({ push: false });
  else results.hidden = true;
});

// ---------- Copy ----------
const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1600);
};
// "Map" on a route card shows that route on the map below.
results.addEventListener("click", (event) => {
  const button = event.target.closest(".route-card [data-map-route]");
  if (!button || !window.RouteMap?.card()) return;
  window.RouteMap.select(Number(button.dataset.mapRoute));
  window.RouteMap.card().scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
});

results.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
  } catch (error) {
    const area = Object.assign(document.createElement("textarea"), { value: button.dataset.copy });
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast(t("copied"));
});

// ---------- Clocks ----------
const jstClock = document.querySelector("#jst-clock");
const utcClock = document.querySelector("#utc-clock");
const formatClock = (timeZone) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone });
const jstFormat = formatClock("Asia/Tokyo"), utcFormat = formatClock("UTC");
const tick = () => {
  const now = new Date();
  jstClock.textContent = jstFormat.format(now);
  utcClock.textContent = utcFormat.format(now);
};
tick();
setInterval(tick, 1000);

// Language saved on another page of jurina.org, but no cookie yet.
try {
  const stored = localStorage.getItem("language");
  if ((stored === "en" || stored === "ja") && stored !== language && !document.cookie.includes("language=")) applyLanguage(stored);
} catch (error) { /* Nothing stored. */ }

// Results rendered by the server on page load.
if (!results.hidden) window.RouteMap?.mount(results);
window.RouteMap?.refreshLanguage(t);
