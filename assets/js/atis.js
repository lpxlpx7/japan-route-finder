// ATIS page: find an airport by code or name, choose it, then Search.
const { t, applyLanguage, request } = window.App;
const form = document.querySelector("#atis-form");
const results = document.querySelector("#results");
const formError = form.querySelector(".form-error");
const submitButton = form.querySelector('button[type="submit"]');
const input = form.elements.icao;
const list = document.querySelector("#airport-list");
const toggle = document.querySelector(".combo-toggle");
const options = [...list.querySelectorAll("[role=option]")];

let chosen = "";     // code picked from the list
let active = null;   // option highlighted with the keyboard

const showError = (key) => {
  formError.textContent = key ? t(key) : "";
  if (key) formError.dataset.i18n = key; else delete formError.dataset.i18n;
};

// ---------- Airport list ----------
const visible = () => options.filter((option) => !option.hidden);

const highlight = (option) => {
  active?.classList.remove("is-active");
  active = option;
  if (option) {
    option.classList.add("is-active");
    option.scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", option.id);
  } else {
    input.removeAttribute("aria-activedescendant");
  }
};

/** Open the list. With a filter, only airports whose code or name contains the text. */
const openList = (filter = "") => {
  const query = filter.trim().toLowerCase();
  options.forEach((option) => { option.hidden = query !== "" && !option.dataset.search.includes(query); });
  list.hidden = !visible().length;
  input.setAttribute("aria-expanded", String(!list.hidden));
  toggle.classList.toggle("is-open", !list.hidden);
  highlight(options.find((option) => option.dataset.code === chosen && !option.hidden) || (query ? visible()[0] : null));
};

const closeList = () => {
  list.hidden = true;
  input.setAttribute("aria-expanded", "false");
  toggle.classList.remove("is-open");
  highlight(null);
};

const choose = (option) => {
  chosen = option.dataset.code;
  input.value = `${chosen} · ${option.querySelector("span:last-child").textContent}`;
  options.forEach((item) => item.setAttribute("aria-selected", String(item === option)));
  closeList();
  showError("");
};

input.addEventListener("input", () => {
  chosen = "";
  showError("");
  openList(input.value);
});
input.addEventListener("keydown", (event) => {
  const items = visible();
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (list.hidden) { openList(chosen ? "" : input.value); return; }
    const index = items.indexOf(active);
    const next = event.key === "ArrowDown" ? Math.min(index + 1, items.length - 1) : Math.max(index - 1, 0);
    highlight(items[index === -1 ? 0 : next]);
  } else if (event.key === "Enter" && !list.hidden && active) {
    event.preventDefault();
    choose(active);
  } else if (event.key === "Escape") {
    closeList();
  }
});
// The arrow always offers the whole list, whatever has been typed.
toggle.addEventListener("click", () => {
  if (list.hidden) { openList(""); input.focus(); } else { closeList(); }
});
list.addEventListener("mousedown", (event) => event.preventDefault());
list.addEventListener("click", (event) => {
  const option = event.target.closest("[role=option]");
  if (option) choose(option);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".combo")) closeList();
});

/** The airport to look up: the one chosen, or a code or name typed that matches exactly one. */
const resolve = () => {
  if (chosen) return { code: chosen };
  const query = input.value.trim().toLowerCase();
  if (!query) return { error: "atisChoosePrompt" };
  const exact = options.find((option) => option.dataset.code.toLowerCase() === query);
  if (exact) return { code: exact.dataset.code };
  const matches = options.filter((option) => option.dataset.search.includes(query));
  if (matches.length === 1) return { code: matches[0].dataset.code };
  return { error: matches.length ? "atisAmbiguous" : "atisUnknownAirport" };
};

// ---------- Search ----------
const setBusy = (busy) => {
  const label = submitButton.querySelector("span");
  submitButton.disabled = busy;
  label.dataset.i18n = busy ? "searching" : "search";
  label.textContent = t(label.dataset.i18n);
};

let pending = null;
const load = async (icao, { push = true } = {}) => {
  pending?.abort();
  pending = new AbortController();
  setBusy(true);
  try {
    const data = await request(`atis.php?icao=${icao}&partial=1`, { signal: pending.signal });
    showError(data.errorKey);
    if (data.errorKey) return;
    results.innerHTML = data.html;
    results.hidden = false;
    applyLanguage(window.App.language());
    if (push) history.pushState(null, "", `?icao=${icao}`);
    // Ready for the next airport.
    input.value = "";
    chosen = "";
    options.forEach((option) => option.setAttribute("aria-selected", "false"));
  } catch (error) {
    if (error.name !== "AbortError") showError("atisError");
  } finally {
    setBusy(false);
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  closeList();
  const { code, error } = resolve();
  if (error) { showError(error); return; }
  showError("");
  load(code);
});
window.addEventListener("popstate", () => {
  const icao = new URLSearchParams(location.search).get("icao") || "";
  if (icao) load(icao, { push: false });
  else results.hidden = true;
});
