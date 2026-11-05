(function () {
  "use strict";

  const storageKey = "ssf-calm-view";

  function storedPreference() {
    try { return window.localStorage.getItem(storageKey) === "true"; }
    catch { return false; }
  }

  function remember(active) {
    try { window.localStorage.setItem(storageKey, String(active)); }
    catch { /* Calm View still works for the current page. */ }
  }

  function label(active) {
    const spanish = document.documentElement.lang === "es";
    if (spanish) return active ? "Vista tranquila: activada" : "Vista tranquila";
    return active ? "Calm View: On" : "Calm View";
  }

  function apply(active) {
    document.documentElement.dataset.calm = String(active);
    document.querySelectorAll("[data-calm-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(active));
      button.textContent = label(active);
    });
  }

  function init() {
    let active = storedPreference();
    apply(active);
    document.querySelectorAll("[data-calm-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        active = !active;
        remember(active);
        apply(active);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
