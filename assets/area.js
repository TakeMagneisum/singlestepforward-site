(function () {
  "use strict";

  const areas = window.SSF_RESOURCE_AREAS || {};
  const defaultAreaId = "liberty";
  const storageKey = "ssf-selected-area";
  const countryStorageKey = "ssf-selected-country";
  const isFinder = document.body.classList.contains("finder-page");

  function safeStoredArea() {
    try {
      return window.localStorage.getItem(storageKey) || "";
    } catch {
      return "";
    }
  }

  function storeArea(areaId) {
    try {
      window.localStorage.setItem(storageKey, areaId);
    } catch {
      /* Guide selection still works when browser storage is unavailable. */
    }
  }

  function safeStoredCountry() {
    try { return window.localStorage.getItem(countryStorageKey) || ""; } catch { return ""; }
  }

  function storeCountry(country) {
    try { window.localStorage.setItem(countryStorageKey, country); } catch { /* Selection still works. */ }
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

  if (isFinder) {
    window.SSF_CURRENT_AREA = area;
    window.SSF_RESOURCES = Array.isArray(area.resources) ? area.resources : [];
    window.SSF_RESOURCE_VERSION = area.reviewed || "recently";
    storeArea(areaId);
  } else {
    window.SSF_CURRENT_AREA = null;
    window.SSF_RESOURCES = [];
    window.SSF_RESOURCE_VERSION = "";
  }

  function updateMetadata() {
    if (!isFinder) return;

    document.title = "Find Help in " + area.label + " | Single Step Forward";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "Find trusted local and official help in " + area.label + " for food, housing, health, work, family needs, animals, safety, and more."
    );
    document.querySelector('meta[property="og:description"]')?.setAttribute(
      "content",
      "Source-checked local starting points for " + area.label + "."
    );

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const url = new URL(canonical.href);
      if (areaId !== defaultAreaId) url.searchParams.set("area", areaId);
      else url.searchParams.delete("area");
      canonical.href = url.href;
    }
  }

  function updatePickerButton(select, button) {
    const selectedArea = areas[select.value];
    const hasSelection = Boolean(selectedArea);
    button.disabled = !hasSelection;
    button.textContent = hasSelection
      ? "Open " + (selectedArea.shortLabel || selectedArea.name || "selected") + " guide"
      : "Open guide";
    button.setAttribute(
      "aria-label",
      hasSelection ? "Open the " + selectedArea.label + " reviewed local guide" : "Open reviewed local guide"
    );
  }

  function setupAreaPicker(select) {
    const picker = select.closest("[data-area-picker]");
    const button = picker?.querySelector("[data-area-open]");
    const countrySelect = picker?.querySelector("[data-country-select]");
    if (!button) return;

    const requestedArea = new URLSearchParams(window.location.search).get("area") || "";
    const requestedCountry = areas[requestedArea]?.country;
    const initialCountry = requestedCountry || (isFinder ? area.country : safeStoredCountry()) || "US";

    function filterAreas(country, preserveSelection) {
      Array.from(select.options).forEach((option) => {
        if (!option.value) return;
        option.hidden = (areas[option.value]?.country || "US") !== country;
      });
      const currentVisible = select.value && !select.selectedOptions[0]?.hidden;
      if (!preserveSelection || !currentVisible) select.value = "";
      updatePickerButton(select, button);
    }

    if (countrySelect) {
      countrySelect.value = initialCountry;
      filterAreas(initialCountry, true);
      countrySelect.addEventListener("change", () => {
        storeCountry(countrySelect.value);
        filterAreas(countrySelect.value, false);
      });
    }

    select.value = select.hasAttribute("data-area-neutral") ? "" : areaId;
    updatePickerButton(select, button);

    select.addEventListener("change", () => updatePickerButton(select, button));
    button.addEventListener("click", () => {
      if (!Object.prototype.hasOwnProperty.call(areas, select.value)) return;
      storeArea(select.value);
      storeCountry(areas[select.value].country || "US");
      const next = new URL("find-help.html", window.location.href);
      next.searchParams.set("area", select.value);
      window.location.assign(next.href);
    });
  }

  function updatePage() {
    if (isFinder) {
      document.body.dataset.area = areaId;
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get("area") !== areaId) {
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

      const scopeNote = document.querySelector("[data-area-scope-note]");
      if (scopeNote) {
        scopeNote.textContent = [area.jurisdictionNote, area.coverageNote].filter(Boolean).join(" ");
        scopeNote.hidden = !scopeNote.textContent;
      }

      document.querySelectorAll("[data-area-only]").forEach((element) => {
        element.hidden = element.dataset.areaOnly !== areaId;
      });

      document.querySelectorAll(".public-note").forEach((container) => {
        container.hidden = !Array.from(container.children).some((element) => !element.hidden);
      });

      const areaInput = document.querySelector("#resource-area");
      if (areaInput && !areaInput.value) areaInput.placeholder = area.label + " or another area";

      const emergency = area.emergency;
      if (emergency) {
        const emergencyCard = document.querySelector("[data-emergency-card]");
        const crisisCard = document.querySelector("[data-crisis-card]");
        if (emergencyCard) emergencyCard.href = "tel:" + emergency.call.replace(/[^\d*]/g, "");
        if (crisisCard) crisisCard.href = "tel:" + emergency.crisis.replace(/[^\d*]/g, "");
        document.querySelector("[data-emergency-label]")?.replaceChildren(emergency.callLabel);
        document.querySelector("[data-emergency-description]")?.replaceChildren(emergency.description);
        document.querySelector("[data-crisis-label]")?.replaceChildren(emergency.crisisLabel);
        document.querySelector("[data-crisis-description]")?.replaceChildren(emergency.crisisDescription);
        document.querySelectorAll("[data-global-emergency]").forEach((link) => {
          link.href = "tel:" + emergency.call.replace(/[^\d*]/g, "");
          link.textContent = emergency.callLabel;
        });
        document.querySelectorAll("[data-global-crisis]").forEach((link) => {
          link.href = "tel:" + emergency.crisis.replace(/[^\d*]/g, "");
          link.textContent = emergency.crisisLabel;
        });
      }
    }

    document.querySelectorAll("[data-area-select]").forEach(setupAreaPicker);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updatePage, { once: true });
  } else {
    updatePage();
  }
})();
