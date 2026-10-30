// Shared by every page: language, theme, copy and the toast.
window.App = (() => {
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
    document.title = t(document.body.dataset.titleKey || "pageTitle");
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

  // ---------- Toast and copy ----------
  const toast = document.querySelector(".toast");
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1600);
  };
  document.addEventListener("click", async (event) => {
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

  const smoothScroll = (element) => element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });

  // Language saved on another page of jurina.org, but no cookie yet.
  try {
    const stored = localStorage.getItem("language");
    if ((stored === "en" || stored === "ja") && stored !== language && !document.cookie.includes("language=")) applyLanguage(stored);
  } catch (error) { /* Nothing stored. */ }

  return { t, escapeHtml, applyLanguage, language: () => language, showToast, smoothScroll };
})();
