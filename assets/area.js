(function () {
  "use strict";

  const areas = window.SSF_RESOURCE_AREAS || {};
  const defaultAreaId = "liberty";
  const storageKey = "ssf-selected-area";

  function safeStoredArea() {
    try {
      return window.localStorage.getItem(storageKey) || "";
    } catch {
      return "";
    }
  }

  function chooseAreaId() {
    const requested = new URLSearchParams(window.location.search).get("area") || "";
    if (Object.prototype.hasOwnProperty.call(areas, requested)) return requested;
    const stored = safeStoredArea();
    if (Object.prototype.hasOwnProperty.call(areas, stored)) return stored;
    return Object.prototype.hasOwnProperty.call(areas, defaultAreaId)
      ? defaultAreaId
      : Object.keys(areas)[0];
  }

  const areaId = chooseAreaId();
  const area = areas[areaId];
  if (!area) return;

  window.SSF_CURRENT_AREA = area;
  window.SSF_RESOURCES = Array.isArray(area.resources) ? area.resources : [];
  window.SSF_RESOURCE_VERSION = area.reviewed || "recently";

  try {
    window.localStorage.setItem(storageKey, areaId);
  } catch {
    /* The selector still works when storage is unavailable. */
  }

  function addAreaToLink(link) {
    const raw = link.getAttribute("href") || "";
    if (!raw || raw.startsWith("#") || raw.startsWith("tel:") || raw.startsWith("mailto:")) return;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return;

    const path = raw.split(/[?#]/)[0];
    if (path && !/(^|\/)(index|find-help)\.html$/.test(path)) return;

    try {
      const url = new URL(raw, window.location.href);
      url.searchParams.set("area", areaId);
      link.href = url.href;
    } catch {
      /* A malformed optional link should not stop the page. */
    }
  }

  function updateMetadata() {
    const isFinder = document.body.classList.contains("finder-page");
    document.title = isFinder
      ? "Find Help in " + area.label + " | Single Step Forward"
      : "Single Step Forward | " + area.label;

    const description = isFinder
      ? "Find trusted local and official help in " + area.label + " for food, housing, health, work, family needs, animals, safety, and more."
      : "Single Step Forward helps people in " + area.label + " find clear paths to trusted local services, official applications, crisis contacts, and practical support.";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:description"]')?.setAttribute(
      "content",
      "Local help, clearly connected for " + area.label + "."
    );

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const url = new URL(canonical.href);
      if (areaId === defaultAreaId) url.searchParams.delete("area");
      else url.searchParams.set("area", areaId);
      canonical.href = url.href;
    }
  }

  function updatePage() {
    document.body.dataset.area = areaId;

    const currentUrl = new URL(window.location.href);
    if (areaId !== defaultAreaId && currentUrl.searchParams.get("area") !== areaId) {
      currentUrl.searchParams.set("area", areaId);
      try {
        window.history.replaceState({}, "", currentUrl);
      } catch {
        /* Local file previews can restrict history changes. */
      }
    }

    updateMetadata();

    const values = {
      "area-name": area.name,
      "area-state": area.state,
      "area-label": area.label,
      "area-short-label": area.shortLabel,
      "area-review-date": area.reviewed
    };

    Object.entries(values).forEach(([key, value]) => {
      document.querySelectorAll("[data-" + key + "]").forEach((element) => {
        element.textContent = value;
      });
    });

    document.querySelectorAll("[data-area-only]").forEach((element) => {
      element.hidden = element.dataset.areaOnly !== areaId;
    });

    document.querySelectorAll("[data-area-select]").forEach((select) => {
      select.value = areaId;
      select.addEventListener("change", () => {
        if (!Object.prototype.hasOwnProperty.call(areas, select.value)) return;
        try {
          window.localStorage.setItem(storageKey, select.value);
        } catch {
          /* Continue with the URL even if storage is blocked. */
        }
        const next = new URL(window.location.href);
        next.searchParams.set("area", select.value);
        window.location.assign(next.href);
      });
    });

    document.querySelectorAll("a[href]").forEach(addAreaToLink);

    const areaInput = document.querySelector("#resource-area");
    if (areaInput && !areaInput.value) areaInput.placeholder = area.label + " or another area";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updatePage, { once: true });
  } else {
    updatePage();
  }
})();
