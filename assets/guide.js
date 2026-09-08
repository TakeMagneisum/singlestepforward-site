(function () {
  "use strict";

  const resources = Array.isArray(window.SSF_RESOURCES) ? window.SSF_RESOURCES : [];
  const grid = document.querySelector("#resource-grid");
  const count = document.querySelector("#results-count");
  const filterList = document.querySelector("#filter-list");
  const clearButton = document.querySelector("#clear-filters");
  const searchForm = document.querySelector("#help-search");
  const queryInput = document.querySelector("#help-query");
  const answerPanel = document.querySelector("#guide-answer");
  const answerTitle = document.querySelector("#answer-title");
  const answerText = document.querySelector("#answer-text");
  const resetGuide = document.querySelector("#reset-guide");
  const printButton = document.querySelector("#print-directory");

  if (!grid || !count) return;

  const categoryLabels = {
    all: "all topics",
    food: "food",
    housing: "housing and utilities",
    health: "health",
    "mental-health": "mental health",
    safety: "safety",
    work: "work",
    education: "education",
    family: "family and daily life",
    animals: "animal assistance",
    recovery: "recovery support",
    veterans: "military and veteran support",
    tax: "tax help",
    legal: "legal help",
    volunteer: "volunteer opportunities",
    transportation: "transportation",
    weather: "weather and preparedness"
  };

  const categoryAliases = {
    jobs: "work",
    job: "work",
    crisis: "mental-health",
    mental: "mental-health",
    animal: "animals",
    pets: "animals",
    pet: "animals",
    volunteering: "volunteer",
    donate: "volunteer",
    veteran: "veterans",
    taxes: "tax",
    transit: "transportation",
    weather: "weather"
  };

  const stopWords = new Set([
    "about", "after", "also", "and", "are", "can", "care", "could", "for", "from", "get",
    "have", "help", "here", "how", "into", "need", "please", "some", "that", "the",
    "their", "there", "they", "this", "what", "where", "with", "would", "your"
  ]);

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function containsTerm(text, term) {
    return (" " + text + " ").includes(" " + term + " ");
  }

  function sortResources(list) {
    return [...list].sort((a, b) => {
      const priority = (a.priority ?? 99) - (b.priority ?? 99);
      if (priority !== 0) return priority;
      if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function makeLink(label, href, className, external) {
    const link = makeElement("a", className, label);
    link.href = href;
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }

  function resourceCard(resource) {
    const className = "resource-card" +
      (resource.featured ? " featured" : "") +
      (resource.urgent ? " urgent-resource" : "");
    const card = makeElement("article", className);

    const sourceRow = makeElement("div", "resource-source");
    sourceRow.append(
      makeElement("span", "source-badge", resource.source),
      makeElement("span", "source-scope", resource.scope)
    );

    const heading = makeElement("h3", "", resource.title);
    const summary = makeElement("p", "resource-summary", resource.summary);
    const next = makeElement("p", "resource-next");
    next.append(makeElement("strong", "", "Next step: "), document.createTextNode(resource.next));

    const detail = makeElement("div", "resource-detail");
    if (resource.phoneDisplay) {
      const phoneLine = makeElement("p");
      phoneLine.append(makeElement("strong", "", "Phone: "), document.createTextNode(resource.phoneDisplay));
      detail.append(phoneLine);
    }
    if (resource.address) {
      const addressLine = makeElement("p");
      addressLine.append(makeElement("strong", "", "Location: "), document.createTextNode(resource.address));
      detail.append(addressLine);
    }

    const actions = makeElement("div", "resource-actions");
    if (resource.phone) {
      let callLabel = "Call";
      if (resource.phone === "988") callLabel = "Call 988";
      if (resource.phone === "211") callLabel = "Call 211";
      actions.append(makeLink(callLabel, "tel:" + resource.phone, "primary", false));
    }
    const webLabel = resource.source.toLowerCase().includes("official") ? "Official website ↗" : "Visit website ↗";
    actions.append(makeLink(webLabel, resource.url, resource.phone ? "" : "primary", true));

    const checked = makeElement(
      "p",
      "resource-check",
      "Checked " + (window.SSF_RESOURCE_VERSION || "recently") + " · Confirm current hours, requirements, and availability."
    );

    card.append(sourceRow, heading, summary, next);
    if (detail.childElementCount) card.append(detail);
    card.append(actions, checked);
    return card;
  }

  function render(list, message) {
    grid.replaceChildren();
    const sorted = sortResources(list);

    if (!sorted.length) {
      const empty = makeElement("div", "no-results");
      empty.append(
        makeElement("h3", "", "No close match yet."),
        makeElement("p", "", "Try fewer words, choose a topic above, or call Georgia 211 for a person who can help search across services.")
      );
      empty.append(makeLink("Call 211", "tel:211", "button", false));
      grid.append(empty);
      count.textContent = "No directory matches";
      return;
    }

    const fragment = document.createDocumentFragment();
    sorted.forEach((resource) => fragment.append(resourceCard(resource)));
    grid.append(fragment);
    count.textContent = message || sorted.length + " checked resources";
  }

  function updateFilterButtons(category) {
    document.querySelectorAll(".filter-chip").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === category));
    });
  }

  function showCategory(category, shouldScroll) {
    const resolved = categoryLabels[category] ? category : "all";
    updateFilterButtons(resolved);

    const filtered = resolved === "all"
      ? resources
      : resources.filter((resource) => resource.categories.includes(resolved));

    const message = resolved === "all"
      ? filtered.length + " checked resources · local and urgent options are shown first"
      : filtered.length + " checked resources for " + categoryLabels[resolved];
    render(filtered, message);

    clearButton.hidden = resolved === "all";
    answerPanel.hidden = true;
    answerPanel.classList.remove("urgent-answer");

    const nextUrl = new URL(window.location.href);
    if (resolved === "all") nextUrl.searchParams.delete("need");
    else nextUrl.searchParams.set("need", resolved);
    try {
      window.history.replaceState({}, "", nextUrl);
    } catch {
      /* Local file previews can restrict history changes; filtering still works. */
    }

    if (shouldScroll) {
      document.querySelector("#all-resources").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function urgentIntent(query) {
    const q = normalize(query);
    const words = new Set(q.split(" "));
    const emergency = [
      "cant breathe", "cannot breathe", "chest pain", "unconscious", "not breathing",
      "overdose", "overdosing", "bleeding badly", "severe bleeding", "gun", "weapon",
      "fire", "shots fired", "stabbed", "crime in progress", "immediate danger",
      "life threatening", "being attacked", "breaking in"
    ].some((phrase) => containsTerm(q, phrase));

    const suicide = [
      "suicide", "suicidal", "kill myself", "want to die", "hurt myself", "self harm",
      "end my life", "dont want to live", "cant go on", "someone wants to die",
      "someone is suicidal"
    ].some((phrase) => containsTerm(q, phrase));

    const violence = [
      "domestic violence", "partner hurting", "abuse at home", "unsafe at home",
      "being abused", "protective order", "escape my partner", "hit me", "being hit"
    ].some((phrase) => containsTerm(q, phrase)) ||
      (
        (words.has("partner") || words.has("husband") || words.has("wife")) &&
        (words.has("hurt") || words.has("hurting") || words.has("abuse") || words.has("abusing"))
      );

    if (emergency) return "emergency";
    if (suicide) return "suicide";
    if (violence) return "violence";
    return "";
  }

  function scoreResource(resource, rawQuery) {
    const query = normalize(rawQuery);
    if (!query) return 0;

    const title = normalize(resource.title);
    const categoryText = normalize(resource.categories.join(" "));
    const keywords = resource.keywords.map(normalize);
    const haystack = normalize([
      resource.title,
      resource.categories.join(" "),
      resource.keywords.join(" "),
      resource.summary,
      resource.next
    ].join(" "));

    let score = 0;
    if (containsTerm(title, query)) score += 20;
    if (containsTerm(categoryText, query)) score += 12;

    keywords.forEach((keyword) => {
      if (containsTerm(query, keyword)) score += keyword.includes(" ") ? 12 : 7;
    });

    const words = query
      .split(" ")
      .filter((word) => word.length > 2 && !stopWords.has(word));

    words.forEach((word) => {
      if (containsTerm(title, word)) score += 5;
      else if (containsTerm(categoryText, word)) score += 4;
      else if (containsTerm(haystack, word)) score += 2;
    });

    return score;
  }

  function showAnswer(title, text, urgent) {
    answerTitle.textContent = title;
    answerText.textContent = text;
    answerPanel.hidden = false;
    answerPanel.classList.toggle("urgent-answer", Boolean(urgent));
  }

  function search(query) {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      queryInput.focus();
      showAnswer("Tell me a little more.", "A few ordinary words are enough—for example, “food this week” or “behind on rent.”", false);
      return;
    }

    updateFilterButtons("");
    clearButton.hidden = false;

    const urgency = urgentIntent(cleanQuery);
    if (urgency === "emergency") {
      const emergencyResults = resources.filter((resource) =>
        ["988-lifeline", "gcal", "tri-county"].includes(resource.id)
      );
      render(emergencyResults, "Urgent support options");
      showAnswer(
        "Call 911 now for an immediate or life-threatening emergency.",
        "Do not wait for a website response. If it is safe to do so, move away from danger and call 911.",
        true
      );
    } else if (urgency === "suicide") {
      const crisisResults = resources.filter((resource) =>
        ["988-lifeline", "gcal", "gateway-csb"].includes(resource.id)
      );
      render(crisisResults, "Immediate crisis support");
      showAnswer(
        "Please call or text 988 now.",
        "You can reach a crisis counselor 24/7. If someone is in immediate physical danger, call 911.",
        true
      );
    } else if (urgency === "violence") {
      const safetyResults = resources.filter((resource) =>
        ["tri-county", "ga-legal-services", "gcal", "988-lifeline"].includes(resource.id)
      );
      render(safetyResults, "Confidential safety options");
      showAnswer(
        "Your safety comes first.",
        "Call 911 for immediate danger. Tri-County Protective Agency has a 24-hour confidential line at 912-368-9200; use a safe device if possible.",
        true
      );
    } else {
      const scored = resources
        .map((resource) => ({ resource: resource, score: scoreResource(resource, cleanQuery) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || (a.resource.priority ?? 99) - (b.resource.priority ?? 99))
        .slice(0, 9)
        .map((item) => item.resource);

      if (scored.length) {
        render(scored, scored.length + " likely matches for your situation");
        showAnswer(
          "Here are a few good places to start.",
          "I matched your words to the checked directory. Start with the first option that fits, and confirm details with the provider.",
          false
        );
      } else {
        const startingPoints = resources.filter((resource) =>
          ["ga-211", "georgia-gateway", "liberty-dfcs", "hinesville-library"].includes(resource.id)
        );
        render(startingPoints, "Broad starting points");
        showAnswer(
          "I’m not seeing a close match yet.",
          "Try fewer words, browse a topic, or call Georgia 211 for a person who can search across services.",
          false
        );
      }
    }

    answerPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (!resources.length) {
    render([], "Directory unavailable");
    return;
  }

  filterList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    if (queryInput) queryInput.value = "";
    showCategory(button.dataset.filter, true);
  });

  clearButton?.addEventListener("click", () => {
    if (queryInput) queryInput.value = "";
    showCategory("all", false);
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    search(queryInput.value);
  });

  document.querySelectorAll("[data-query]").forEach((button) => {
    button.addEventListener("click", () => {
      queryInput.value = button.dataset.query || "";
      search(queryInput.value);
    });
  });

  resetGuide?.addEventListener("click", () => {
    queryInput.value = "";
    showCategory("all", false);
    document.querySelector("#guide").scrollIntoView({ behavior: "smooth", block: "start" });
    queryInput.focus({ preventScroll: true });
  });

  printButton?.addEventListener("click", () => window.print());

  const params = new URLSearchParams(window.location.search);
  const requested = normalize(params.get("need") || "");
  const initialCategory = categoryAliases[requested] || requested;
  showCategory(categoryLabels[initialCategory] ? initialCategory : "all", false);
})();
