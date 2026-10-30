// Transfer altitude page: enter an airport, its fix list loads, then search.
const { t, applyLanguage, smoothScroll } = window.App;
const form = document.querySelector("#transfer-form");
const results = document.querySelector("#results");
const formError = form.querySelector(".form-error");
const submitButton = form.querySelector('button[type="submit"]');
const icaoInput = form.elements.icao;
const fixSelect = form.elements.fix;

const cleanIcao = (value) => value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
const side = () => form.querySelector('input[name="side"]:checked')?.value === "dep" ? "dep" : "arr";

const showError = (key) => {
  formError.textContent = key ? t(key) : "";
  if (key) formError.dataset.i18n = key; else delete formError.dataset.i18n;
};

// ---------- Fix list ----------
const allOption = fixSelect.options[0];
let listRequest = null;
let listFor = icaoInput.value && fixSelect.options.length > 1 ? `${icaoInput.value} ${side()}` : "";

const setOptions = (fixes, selected = "") => {
  fixSelect.replaceChildren(allOption, ...fixes.map((fix) => new Option(fix, fix, false, fix === selected)));
  allOption.dataset.i18n = "fixAll";
  allOption.textContent = t("fixAll");
  fixSelect.disabled = !fixes.length;
};

const loadFixes = async () => {
  const icao = cleanIcao(icaoInput.value);
  const key = `${icao} ${side()}`;
  if (icao.length !== 4 || key === listFor) return;
  listFor = key;
  const keep = fixSelect.value;
  listRequest?.abort();
  listRequest = new AbortController();
  allOption.dataset.i18n = "fixLoading";
  allOption.textContent = t("fixLoading");
  fixSelect.replaceChildren(allOption);
  fixSelect.disabled = true;
  try {
    const params = new URLSearchParams({ icao, side: side(), list: "1" });
    const data = await (await fetch(`transfer.php?${params}`, { signal: listRequest.signal, headers: { Accept: "application/json" } })).json();
    setOptions(data.fixes || [], keep);
    showError(data.errorKey);
    if (data.errorKey) listFor = "";
  } catch (error) {
    if (error.name === "AbortError") return;
    setOptions([]);
    showError("transferError");
    listFor = "";
  }
};

icaoInput.addEventListener("input", () => {
  icaoInput.value = cleanIcao(icaoInput.value);
  showError("");
  if (icaoInput.value.length === 4) loadFixes();
  else { listFor = ""; setOptions([]); }
});
form.querySelectorAll('input[name="side"]').forEach((radio) => radio.addEventListener("change", loadFixes));

// ---------- Search ----------
const setBusy = (busy) => {
  const label = submitButton.querySelector("span");
  submitButton.disabled = busy;
  label.dataset.i18n = busy ? "searching" : "search";
  label.textContent = t(label.dataset.i18n);
};

let pending = null;
const search = async ({ push = true } = {}) => {
  const icao = cleanIcao(icaoInput.value);
  if (icao.length !== 4) { showError("errorAirport"); return; }
  showError("");
  const params = new URLSearchParams({ icao, side: side() });
  if (fixSelect.value) params.set("fix", fixSelect.value);
  pending?.abort();
  pending = new AbortController();
  setBusy(true);
  try {
    const data = await (await fetch(`transfer.php?${params}&partial=1`, { signal: pending.signal, headers: { Accept: "application/json" } })).json();
    showError(data.errorKey);
    if (data.errorKey) return;
    results.innerHTML = data.html;
    results.hidden = false;
    applyLanguage(window.App.language());
    if (push) history.pushState(null, "", `?${params}`);
    smoothScroll(results);
  } catch (error) {
    if (error.name !== "AbortError") showError("transferError");
  } finally {
    setBusy(false);
  }
};

form.addEventListener("submit", (event) => { event.preventDefault(); search(); });

const setForm = (icao, sideValue, fix) => {
  icaoInput.value = icao;
  form.querySelector(`input[name="side"][value="${sideValue === "dep" ? "dep" : "arr"}"]`).checked = true;
  if (fix && ![...fixSelect.options].some((option) => option.value === fix)) fixSelect.append(new Option(fix, fix));
  fixSelect.value = fix || "";
};

document.querySelector(".examples").addEventListener("click", (event) => {
  const link = event.target.closest("a[data-icao]");
  if (!link) return;
  event.preventDefault();
  setForm(link.dataset.icao, link.dataset.side, "");
  loadFixes();
  search();
});

window.addEventListener("popstate", () => {
  const params = new URLSearchParams(location.search);
  setForm(params.get("icao") || "", params.get("side"), params.get("fix") || "");
  loadFixes();
  if (icaoInput.value) search({ push: false });
  else results.hidden = true;
});
