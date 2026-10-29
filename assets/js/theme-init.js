// Runs before first paint so the page never flashes the wrong theme.
(() => {
  let preference = "system";
  try {
    preference = localStorage.getItem("theme") || "system";
  } catch (error) {
    // Storage can be blocked; fall back to the system setting.
  }
  const dark = preference === "dark" || (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
})();
