(function () {
  "use strict";

  const zipPattern = /^\d{5}$/;

  function validZip(value) {
    return zipPattern.test(String(value || "").trim());
  }

  function setFormError(form, message) {
    const input = form.querySelector("[data-zip-input]");
    const error = form.querySelector("[data-zip-error]");
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
  }

  function discoveryUrl(zip) {
    const url = new URL("discover.html", window.location.href);
    url.searchParams.set("zip", zip);
    const topic = new URLSearchParams(window.location.search).get("topic");
    if (topic) url.searchParams.set("topic", topic);
    return url.href;
  }

  function setupZipForms() {
    document.querySelectorAll("[data-zip-form]").forEach((form) => {
      const input = form.querySelector("[data-zip-input]");
      if (!input) return;

      input.addEventListener("input", () => setFormError(form, ""));
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const zip = input.value.trim();
        if (!validZip(zip)) {
          setFormError(form, "Enter a five-digit U.S. ZIP code.");
          input.focus();
          return;
        }
        setFormError(form, "");
        window.location.assign(discoveryUrl(zip));
      });
    });
  }

  function makeLink(label, href, className, external) {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    if (className) link.className = className;
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }

  function reviewedMatches(zip) {
    const groups = Array.isArray(window.SSF_REVIEWED_ZIP_GROUPS)
      ? window.SSF_REVIEWED_ZIP_GROUPS
      : [];
    return groups.filter((group) => Array.isArray(group.zips) && group.zips.includes(zip));
  }

  function renderCoverage(zip) {
    const panel = document.querySelector("#zip-result");
    if (!panel) return;
    panel.replaceChildren();

    const heading = document.createElement("h2");
    const copy = document.createElement("p");
    const actions = document.createElement("div");
    actions.className = "zip-result-actions";

    if (!validZip(zip)) {
      panel.className = "zip-result zip-result-neutral";
      heading.textContent = "Enter a ZIP code to prepare local starting points.";
      copy.textContent = "Your ZIP stays in this page address. Single Step Forward does not save it or send it anywhere.";
      panel.append(heading, copy);
      return;
    }

    const matches = reviewedMatches(zip);
    if (matches.length) {
      panel.className = "zip-result zip-result-reviewed";
      heading.textContent = "We have a source-checked local guide that may cover ZIP " + zip + ".";
      copy.textContent = "ZIP codes can cross county or municipal boundaries. Confirm that the guide matches where you live before relying on county-specific programs.";
      matches.forEach((match) => {
        actions.append(
          makeLink(
            "Open the " + match.label + " guide",
            "find-help.html?area=" + encodeURIComponent(match.areaId),
            "button",
            false
          )
        );
      });
      panel.append(heading, copy, actions);
      return;
    }

    panel.className = "zip-result zip-result-unreviewed";
    heading.textContent = "We have not completed a reviewed local guide for ZIP " + zip + " yet.";
    copy.textContent = "You can still learn what may exist, use official starting points, and open prepared local searches below.";
    actions.append(makeLink("Call 211", "tel:211", "button button-outline", false));
    panel.append(heading, copy, actions);
  }

  function renderCategories(zip) {
    const grid = document.querySelector("#discovery-grid");
    if (!grid) return;
    grid.replaceChildren();

    const categories = Array.isArray(window.SSF_DISCOVERY_CATEGORIES)
      ? window.SSF_DISCOVERY_CATEGORIES
      : [];
    const selectedTopic = new URLSearchParams(window.location.search).get("topic") || "";

    categories.forEach((category, index) => {
      const card = document.createElement("article");
      card.className = "discovery-card";
      card.id = "topic-" + category.id;
      card.dataset.topic = category.id;
      if (category.urgent) card.classList.add("is-urgent");
      if (category.id === selectedTopic) card.classList.add("is-featured");

      const eyebrow = document.createElement("p");
      eyebrow.className = "mini-label";
      eyebrow.textContent = "Did you know?";

      const heading = document.createElement("h3");
      heading.textContent = category.title;

      const summary = document.createElement("p");
      summary.textContent = category.summary;

      const officialWrap = document.createElement("div");
      officialWrap.className = "discovery-official-links";
      (category.official || []).forEach((item) => {
        officialWrap.append(
          makeLink(
            item.label + (item.url.startsWith("https://") ? " ↗" : ""),
            item.url,
            "official-link",
            item.url.startsWith("https://")
          )
        );
      });

      const searchWrap = document.createElement("div");
      searchWrap.className = "discovery-search-action";
      if (validZip(zip)) {
        const query = category.query.replace("{zip}", zip);
        const searchUrl = "https://www.google.com/search?q=" + encodeURIComponent(query);
        searchWrap.append(makeLink(category.searchLabel + " ↗", searchUrl, "button button-small", true));

        const searchNote = document.createElement("small");
        searchNote.textContent = "Prepared web search for ZIP " + zip + "; results are not reviewed by SSF.";
        searchWrap.append(searchNote);
      } else {
        const disabled = document.createElement("span");
        disabled.className = "button button-small is-disabled";
        disabled.setAttribute("aria-disabled", "true");
        disabled.textContent = "Enter a ZIP above to prepare this search";
        searchWrap.append(disabled);
      }

      const number = document.createElement("span");
      number.className = "discovery-number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(index + 1).padStart(2, "0");

      card.append(number, eyebrow, heading, summary);
      if (category.urgent) {
        card.append(officialWrap, searchWrap);
      } else {
        card.append(searchWrap, officialWrap);
      }
      grid.append(card);
    });

    if (selectedTopic) {
      const featured = document.getElementById("topic-" + selectedTopic);
      if (featured) featured.setAttribute("aria-current", "true");
    }
  }

  function setupDiscoveryPage() {
    if (!document.body.classList.contains("discovery-page")) return;
    const params = new URLSearchParams(window.location.search);
    const zip = params.get("zip") || "";

    document.querySelectorAll("[data-zip-input]").forEach((input) => {
      if (validZip(zip)) input.value = zip;
    });
    document.querySelectorAll("[data-current-zip]").forEach((element) => {
      element.textContent = validZip(zip) ? zip : "your area";
    });

    renderCoverage(zip);
    renderCategories(zip);

    if (validZip(zip)) {
      document.title = "Possible Next Steps Near ZIP " + zip + " | Single Step Forward";
    }
  }

  async function copyShareLink(button, status) {
    const shareUrl = button.dataset.shareUrl || "https://singlestepforward.com/";
    const shareData = {
      title: "Single Step Forward",
      text: "Learn what kinds of local help may exist and where to begin looking.",
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (status) status.textContent = "Share options opened.";
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = shareUrl;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    button.textContent = "Link copied";
    if (status) status.textContent = "Single Step Forward link copied.";
  }

  function setupShareButtons() {
    document.querySelectorAll("[data-share-page]").forEach((button) => {
      const status = document.querySelector(button.dataset.statusTarget || "#share-status");
      button.addEventListener("click", () => copyShareLink(button, status));
    });
  }

  function initialize() {
    setupZipForms();
    setupDiscoveryPage();
    setupShareButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
