// Route search page.
const { t, applyLanguage, smoothScroll } = window.App;
const form = document.querySelector("#route-form");
const results = document.querySelector("#results");
const formError = form.querySelector(".form-error");
const submitButton = form.querySelector('button[type="submit"]');

const fields = { dep: form.elements.dep, arr: form.elements.arr, eobt: form.elements.eobt, transfer: form.elements.transfer };
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

const setBusy = (busy) => {
  const label = submitButton.querySelector("span");
  submitButton.disabled = busy;
  label.dataset.i18n = busy ? "searching" : "search";
  label.textContent = t(label.dataset.i18n);
};

let pending = null;
const search = async ({ push = true } = {}) => {
  const error = validate();
  showError(error);
  if (error) return;
  const params = new URLSearchParams({ dep: cleanIcao(fields.dep.value), arr: cleanIcao(fields.arr.value) });
  if (fields.eobt.value) params.set("eobt", fields.eobt.value);
  if (fields.transfer.checked) params.set("transfer", "1");
  pending?.abort();
  pending = new AbortController();
  setBusy(true);
  try {
    const response = await fetch(`./?${params}&partial=1`, { signal: pending.signal, headers: { Accept: "application/json" } });
    const data = await response.json();
    showError(data.errorKey);
    if (data.errorKey) return;
    results.innerHTML = data.html;
    results.hidden = false;
    window.RouteMap?.mount(results);
    applyLanguage(window.App.language());
    if (push) history.pushState(null, "", `?${params}`);
    smoothScroll(results);
  } catch (error) {
    if (error.name !== "AbortError") showError("errorService");
  } finally {
    setBusy(false);
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
  fields.transfer.checked = params.get("transfer") === "1";
  if (fields.dep.value && fields.arr.value) search({ push: false });
  else results.hidden = true;
});

// "Map" on a route card shows that route on the map below.
results.addEventListener("click", (event) => {
  const button = event.target.closest(".route-card [data-map-route]");
  if (!button || !window.RouteMap?.card()) return;
  window.RouteMap.select(Number(button.dataset.mapRoute));
  smoothScroll(window.RouteMap.card());
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

// Results rendered by the server on page load.
if (!results.hidden) window.RouteMap?.mount(results);
window.RouteMap?.refreshLanguage(t);
