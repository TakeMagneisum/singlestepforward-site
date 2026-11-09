#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const errors = [];
const requiredCategories = [
  "animals", "education", "family", "food", "health", "housing", "legal", "mental-health",
  "recovery", "safety", "tax", "transportation", "veterans", "volunteer", "weather", "work"
];
const requiredVisualAssets = [
  "assets/icon-call-211.webp",
  "assets/icon-confirm-directly.webp",
  "assets/icon-dental-health.webp",
  "assets/icon-family-support.webp",
  "assets/icon-food.webp",
  "assets/icon-household-bills.webp",
  "assets/icon-housing.webp",
  "assets/icon-legal-consumer.webp",
  "assets/icon-medical-costs.webp",
  "assets/icon-mental-health.webp",
  "assets/icon-official-source.webp",
  "assets/icon-pet-assistance.webp",
  "assets/icon-prepared-search.webp",
  "assets/icon-private-device.webp",
  "assets/icon-reviewed-guide.webp",
  "assets/icon-safety-support.webp",
  "assets/icon-share-knowledge.webp",
  "assets/icon-transportation.webp",
  "assets/icon-use-zip.webp",
  "assets/icon-work-learning.webp",
  "assets/dawn-full.png",
  "assets/dawn-portait.png",
  "assets/dawn-full.webp",
  "assets/dawn-portait.webp"
];

function fail(message) {
  errors.push(message);
}

function loadDirectory() {
  const context = vm.createContext({ window: {} });
  [
    "assets/colorado-resources.js",
    "assets/massachusetts-resources.js",
    "assets/new-york-resources.js",
    "assets/illinois-resources.js",
    "assets/city-resources.js",
    "assets/resources.js"
  ].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  });
  return context.window.SSF_RESOURCE_AREAS;
}

function loadDiscovery() {
  const context = vm.createContext({ window: {} });
  vm.runInContext(
    fs.readFileSync(path.join(root, "assets/discovery-data.js"), "utf8"),
    context,
    { filename: "assets/discovery-data.js" }
  );
  return {
    groups: context.window.SSF_REVIEWED_ZIP_GROUPS,
    categories: context.window.SSF_DISCOVERY_CATEGORIES
  };
}

function validateDiscovery(discovery, areas) {
  const groups = Array.isArray(discovery.groups) ? discovery.groups : [];
  const categories = Array.isArray(discovery.categories) ? discovery.categories : [];
  const areaIds = new Set(Object.entries(areas || {}).filter(([, area]) => ["US", "PR"].includes(area.country || "US")).map(([id]) => id));
  const zipOwners = new Map();
  const categoryIds = new Set();

  if (groups.length !== areaIds.size) {
    fail("Discovery ZIP groups must match every reviewed local guide.");
  }

  groups.forEach((group, groupIndex) => {
    const label = "Discovery ZIP group " + groupIndex;
    if (!areaIds.has(group.areaId)) fail(label + ": unknown areaId " + group.areaId + ".");
    if (!group.label) fail(label + ": label is required.");
    if (!Array.isArray(group.zips) || !group.zips.length) fail(label + ": ZIP list is missing.");

    (group.zips || []).forEach((zip) => {
      if (!/^\d{5}$/.test(zip)) fail(label + ": malformed ZIP " + zip + ".");
      if (zipOwners.has(zip)) {
        const owners = [zipOwners.get(zip), group.areaId].sort().join(",");
        if (!["46280", "46290"].includes(zip) || owners !== "carmel,indianapolis") {
          fail("Unreviewed ZIP overlap: " + zip + " belongs to " + owners + ".");
        }
      } else {
        zipOwners.set(zip, group.areaId);
      }
    });
  });

  if (zipOwners.get("80202") !== "denver") fail("ZIP regression: 80202 must suggest the Denver guide.");
  if (zipOwners.get("60544") !== "plainfield") fail("ZIP regression: 60544 must suggest the Plainfield guide.");
  if (zipOwners.get("00901") !== "san-juan-pr") fail("ZIP regression: 00901 must suggest the San Juan guide.");
  if (zipOwners.get("00959") !== "bayamon-pr") fail("ZIP regression: 00959 must suggest the Bayamón guide.");
  if (zipOwners.get("00985") !== "carolina-pr") fail("ZIP regression: 00985 must suggest the Carolina guide.");
  if (zipOwners.get("00730") !== "ponce-pr") fail("ZIP regression: 00730 must suggest the Ponce guide.");
  if (zipOwners.get("32937") !== "indian-harbour-beach") fail("ZIP regression: 32937 must suggest the Indian Harbour Beach guide.");
  if (zipOwners.get("46032") !== "carmel") fail("ZIP regression: 46032 must suggest the Carmel guide.");
  if (zipOwners.get("32202") !== "jacksonville") fail("ZIP regression: 32202 must suggest the Jacksonville guide.");
  if (zipOwners.get("59601") !== "lewis-and-clark-county") fail("ZIP regression: 59601 must suggest the Lewis and Clark County guide.");
  if (zipOwners.get("59101") !== "yellowstone-county") fail("ZIP regression: 59101 must suggest the Yellowstone County guide.");
  if (zipOwners.get("59801") !== "missoula-county") fail("ZIP regression: 59801 must suggest the Missoula County guide.");
  [
    ["10001", "new-york-city"], ["60601", "chicago"], ["90012", "los-angeles"],
    ["19103", "philadelphia"], ["77002", "houston"], ["85003", "phoenix"],
    ["92101", "san-diego"], ["78205", "san-antonio"], ["76102", "fort-worth"]
  ].forEach(([zip, areaId]) => {
    if (zipOwners.get(zip) !== areaId) fail(`ZIP regression: ${zip} must suggest the ${areaId} guide.`);
  });
  if (zipOwners.has("99999")) fail("ZIP regression: 99999 must remain an unmatched fallback example.");

  if (categories.length < 13) fail("Universal discovery must contain at least 13 topic categories.");
  categories.forEach((category, index) => {
    const label = "Discovery category " + index;
    if (!category.id || !/^[a-z0-9-]+$/.test(category.id)) fail(label + ": invalid id.");
    if (categoryIds.has(category.id)) fail("Duplicate discovery category id " + category.id + ".");
    categoryIds.add(category.id);
    if (!category.title || !category.summary || !category.searchLabel) {
      fail(label + ": title, summary, and search label are required.");
    }
    if (!category.icon || !/^assets\/icon-[a-z0-9-]+\.webp$/.test(category.icon)) {
      fail(label + ": a valid category icon path is required.");
    } else if (!fs.existsSync(path.join(root, category.icon))) {
      fail(label + ": missing category icon " + category.icon + ".");
    }
    if (!category.query || !category.query.includes("{zip}")) {
      fail(label + ": prepared search query must contain the ZIP placeholder.");
    }
    if (!Array.isArray(category.official) || !category.official.length) {
      fail(label + ": at least one direct starting point is required.");
    }
    (category.official || []).forEach((item) => {
      if (!item.label || !/^(https:\/\/|tel:)/.test(item.url || "")) {
        fail(label + ": direct starting points require a label and HTTPS or telephone URL.");
      }
    });
  });

  const directUrls = categories.flatMap((category) => category.official || []).map((item) => item.url);
  if (!directUrls.includes("tel:911")) fail("Universal discovery is missing direct 911 routing.");
  if (!directUrls.includes("tel:988")) fail("Universal discovery is missing direct 988 routing.");
  if (!categoryIds.has("development-disability")) fail("Universal discovery is missing developmental, disability, and school support.");
}

function validateAreas(areas) {
  const areaEntries = Object.entries(areas || {});
  const expectedCount = JSON.parse(fs.readFileSync(path.join(root, "review-sheets/locations.json"), "utf8")).locations.length;
  if (areaEntries.length !== expectedCount) fail(`Expected ${expectedCount} manifest editions; found ${areaEntries.length}.`);

  areaEntries.forEach(([areaId, area]) => {
    if (!Array.isArray(area.resources) || !area.resources.length) {
      fail(`${areaId}: resource array is missing or empty.`);
      return;
    }
    if (!area.reviewed || Number.isNaN(Date.parse(area.reviewed))) {
      fail(`${areaId}: reviewed date is missing or invalid.`);
    }

    const ids = new Set();
    const categories = new Set();
    area.resources.forEach((resource, index) => {
      const label = `${areaId}[${index}]`;
      if (!resource.id || !/^[a-z0-9-]+$/.test(resource.id)) fail(`${label}: invalid id.`);
      if (ids.has(resource.id)) fail(`${areaId}: duplicate resource id ${resource.id}.`);
      ids.add(resource.id);
      if (!resource.title || !resource.summary || !resource.next) fail(`${label}: title, summary, and next step are required.`);
      if (!Array.isArray(resource.categories) || !resource.categories.length) fail(`${label}: categories are required.`);
      (resource.categories || []).forEach((category) => categories.add(category));
      if (!Array.isArray(resource.keywords) || !resource.keywords.length) fail(`${label}: keywords are required.`);
      if (!resource.url || !resource.url.startsWith("https://")) fail(`${label}: URL must use HTTPS.`);
      if (resource.phone && !/^(?:\d{3,15}|\*4141)$/.test(resource.phone)) fail(`${label}: phone must contain 3–15 digits or the verified *4141 short code.`);
    });

    requiredCategories.forEach((category) => {
      const documentedGap = areaId === "omaha" && category === "animals" && Boolean(area.coverageNote);
      if (!categories.has(category) && !documentedGap) fail(`${areaId}: missing category ${category}.`);
    });

    ["emergency", "suicide", "violence", "fallback"].forEach((routeName) => {
      const route = area.routing?.[routeName];
      if (!Array.isArray(route) || !route.length) {
        fail(`${areaId}: routing.${routeName} is missing.`);
        return;
      }
      route.forEach((id) => {
        if (!ids.has(id)) fail(`${areaId}: routing.${routeName} references missing id ${id}.`);
      });
    });
  });
}

function validateMarkup(areas) {
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const finder = fs.readFileSync(path.join(root, "find-help.html"), "utf8");
  const discovery = fs.readFileSync(path.join(root, "discover.html"), "utf8");
  const learning = fs.readFileSync(path.join(root, "learn.html"), "utf8");
  const notFound = fs.readFileSync(path.join(root, "404.html"), "utf8");
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

  Object.keys(areas).forEach((areaId) => {
    const option = `value="${areaId}"`;
    if (!index.includes(option)) fail(`index.html: selector is missing ${areaId}.`);
    if (!finder.includes(option)) fail(`find-help.html: selector is missing ${areaId}.`);
    if (areaId !== "liberty" && !sitemap.includes(`area=${areaId}`)) fail(`sitemap.xml: missing ${areaId}.`);
  });

  ["illinois-resources.js", "city-resources.js", "urgent.js"].forEach((file) => {
    if (!finder.includes(file)) fail(`find-help.html: missing script ${file}.`);
  });
  ["illinois-resources.js", "city-resources.js"].forEach((file) => {
    if (!index.includes(file)) fail(`index.html: missing dataset script ${file}.`);
  });

  if (!index.includes("data-zip-form") || !index.includes("data-zip-input")) {
    fail("index.html: accessible ZIP discovery form is missing.");
  }
  if (!index.includes("data-area-neutral") || !index.includes("data-area-open disabled")) {
    fail("index.html: neutral select-then-open reviewed-guide control is missing.");
  }
  if (!finder.includes("data-area-open") || !finder.includes("data-area-review-date")) {
    fail("find-help.html: reviewed-guide open control or visible review date is missing.");
  }
  [index, finder, discovery, learning].forEach((markup, index) => {
    if (!markup.includes("data-language-select") || !markup.includes("assets/i18n.js")) {
      fail(["index.html", "find-help.html", "discover.html", "learn.html"][index] + ": local English/Spanish selector is missing.");
    }
    if (!markup.includes("data-calm-toggle") || !markup.includes("assets/calm.js")) {
      fail(["index.html", "find-help.html", "discover.html", "learn.html"][index] + ": Calm View control is missing.");
    }
  });
  [index, finder, discovery].forEach((markup, pageIndex) => {
    if (!markup.includes("class=\"awareness-band\"") || !markup.includes("href=\"learn.html\"")) {
      fail(["index.html", "find-help.html", "discover.html"][pageIndex] + ": accessibility-and-inclusion entry point is missing.");
    }
  });
  ["id=\"accessibility\"", "id=\"learning-disabilities\"", "id=\"down-syndrome\"", "id=\"autism\"", "id=\"school-support\"", "id=\"developmental-disabilities\""].forEach((required) => {
    if (!learning.includes(required)) fail("learn.html: missing required learning topic " + required + ".");
  });
  ["https://www.w3.org/WAI/", "https://ndss.org/", "https://autisticadvocacy.org/", "https://www.parentcenterhub.org/", "https://thearc.org/"].forEach((source) => {
    if (!learning.includes(source)) fail("learn.html: missing educational source " + source + ".");
  });
  if (!finder.includes("crisis-guidance") || !finder.includes("mobile crisis team")) {
    fail("find-help.html: plain-language crisis and mobile-response guidance is missing.");
  }
  if (!finder.includes("assets/dawn-portait.png") || !index.includes("assets/dawn-full.png")) {
    fail("Production Dawn PNG references are missing.");
  }
  ["id=\"zip-result\"", "id=\"discovery-grid\"", "data-zip-form"].forEach((required) => {
    if (!discovery.includes(required)) fail("discover.html: missing required structure " + required + ".");
  });
  const discoveryScript = fs.readFileSync(path.join(root, "assets/discovery.js"), "utf8");
  if (!discoveryScript.includes("Add a ZIP to prepare a local search")) {
    fail("Universal discovery is missing the no-ZIP local-search prompt.");
  }
  ["tel:911", "tel:988", "tel:211"].forEach((route) => {
    if (!discovery.includes(route)) fail("discover.html: missing direct route " + route + ".");
  });
  if (!sitemap.includes("discover.html")) fail("sitemap.xml: missing universal discovery page.");
  if (!sitemap.includes("learn.html")) fail("sitemap.xml: missing accessibility-and-inclusion page.");

  const expectedCacheToken = "20261109-1";
  [
    ["index.html", index],
    ["find-help.html", finder],
    ["discover.html", discovery],
    ["learn.html", learning],
    ["404.html", notFound]
  ].forEach(([pageName, markup]) => {
    const refs = Array.from(markup.matchAll(/(?:src|href)="(assets\/[^"?]+)\?v=([^"]+)"/g));
    if (!refs.length) fail(pageName + ": no cache-versioned assets found.");
    refs.forEach((match) => {
      const asset = match[1];
      const token = match[2];
      if (token !== expectedCacheToken) fail(pageName + ": inconsistent cache token for " + asset + ".");
      if (!fs.existsSync(path.join(root, asset))) fail(pageName + ": missing referenced asset " + asset + ".");
    });
  });
}

function validateVisualAssets() {
  requiredVisualAssets.forEach((asset) => {
    if (!fs.existsSync(path.join(root, asset))) fail("Missing required visual asset: " + asset + ".");
  });
  if (fs.existsSync(path.join(root, "assets/desktop.ini"))) {
    fail("Packaging metadata assets/desktop.ini must be removed.");
  }
  const styles = fs.readFileSync(path.join(root, "assets/styles.css"), "utf8");
  if (!styles.includes('html[data-calm="true"] .category-icon') || !styles.includes("display: block !important")) {
    fail("Calm View must keep category pictograms visible as recognition cues.");
  }
  if (!styles.includes('html[data-calm="true"] .browse-all-cta') || !styles.includes('html[data-calm="true"] .dawn-section .dawn-grid')) {
    fail("Calm View must collapse layout columns left by suppressed decorative artwork.");
  }
}

function validateUrgentRules() {
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(root, "assets/urgent.js"), "utf8"), context, { filename: "assets/urgent.js" });
  const classify = context.window.SSF_URGENT_INTENT;
  if (typeof classify !== "function") {
    fail("Urgent-language classifier did not load.");
    return;
  }

  const cases = {
    emergency: [
      "I can't breathe", "she cannot breathe", "he is not breathing", "I have chest pain",
      "someone is unconscious", "possible overdose", "they are overdosing", "I took too many pills",
      "she has taken too many pills", "he swallowed too many pills", "I am bleeding badly",
      "there is severe bleeding", "shots fired outside", "a gun is pointed at me",
      "someone is pointing a gun", "he has a gun and is threatening us", "there is an armed person",
      "active shooter here", "my house is on fire", "the building is on fire", "our home is on fire",
      "there is a fire in my home", "there is a fire next door", "I was stabbed",
      "crime in progress", "I am in immediate danger", "this is life threatening",
      "I am being attacked", "someone is breaking in", "he is choking me right now",
      "no puedo respirar", "no está respirando", "tengo dolor de pecho", "está inconsciente",
      "hay una sobredosis", "tomé demasiadas pastillas", "hay un sangrado grave", "escuché disparos",
      "me apunta con un arma", "hay un incendio", "me apuñalaron", "estoy en peligro inmediato",
      "me están atacando", "me estrangula ahora"
    ],
    suicide: [
      "I am thinking about suicide", "I feel suicidal", "I might kill myself", "I am killing myself",
      "I want to die", "I might hurt myself", "I am hurting myself", "I have urges to self harm",
      "I want to end my life", "I am ending my life", "thinking about ending it",
      "thinking of ending it", "I want to end it all", "I don't want to live",
      "I do not want to live", "I can't go on", "I cannot go on", "everyone is better off dead without me",
      "someone wants to die", "someone is suicidal", "my friend wants to die",
      "thinking of suicide", "my brother is suicidal", "she said she wants to die",
      "I keep thinking about ending it", "quiero suicidarme", "estoy pensando en suicidarme",
      "quiero matarme", "quiero morir", "quiero hacerme daño", "me estoy haciendo daño",
      "no quiero vivir", "no puedo seguir", "quiero acabar con mi vida", "pienso en suicidarme"
    ],
    violence: [
      "I need domestic violence help", "my partner is hurting me", "there is abuse at home",
      "I am unsafe at home", "I am being abused", "I need a protective order",
      "I need to escape my partner", "he hit me", "I am being hit", "he is going to kill me",
      "he's going to kill me", "he will kill me", "she is going to kill me", "she's going to kill me",
      "she will kill me", "they are going to kill me", "my partner threatened to kill me",
      "I experienced sexual assault", "I was sexually assaulted", "I am being raped", "I was raped",
      "I need to report child abuse", "a child is being abused", "someone is abusing my child",
      "I escaped human trafficking", "I am being trafficked", "this may be sex trafficking",
      "I think this is labor trafficking", "my ex is stalking me", "my boyfriend is strangling me",
      "my wife is choking me", "someone forced me to have sex", "my husband is threatening me",
      "my girlfriend is abusing me", "necesito ayuda por violencia doméstica", "mi pareja me lastima",
      "hay abuso en casa", "no estoy a salvo en casa", "me golpea", "me va a matar",
      "sufrí una agresión sexual", "me violaron", "hay abuso infantil", "soy víctima de trata de personas",
      "me está acosando", "me estrangula", "me obliga a tener sexo"
    ],
    "": [
      "fire department jobs", "I need a gun permit", "weapon permit application", "I was fired from my job",
      "where can I buy firewood", "fire alarm inspection", "gun safety class", "a book about fire",
      "I need help with rent", "food pantry hours", "resume help", "medical clinic appointment",
      "dental care", "bus schedule", "lost dog", "animal shelter volunteer", "tax preparation",
      "veteran benefits", "weather forecast", "tornado preparedness", "legal help with a lease",
      "child care while I work", "GED class", "English classes", "utility bill help",
      "housing waitlist", "senior transportation", "food bank volunteer", "consumer complaint",
      "recovery meeting", "I feel anxious", "I feel sad", "marriage counseling",
      "my partner needs job training", "my husband needs a dentist", "my wife lost her job",
      "necesito comida", "estoy atrasado con el alquiler", "busco trabajo", "necesito un dentista",
      "mis pensamientos van muy rápido", "es difícil saber qué es real", "me siento ansioso",
      "necesito transporte", "busco ayuda para mi hijo con su IEP", "quiero ser voluntario"
    ]
  };

  let count = 0;
  Object.entries(cases).forEach(([expected, phrases]) => {
    phrases.forEach((phrase) => {
      count += 1;
      const actual = classify(phrase);
      if (actual !== expected) fail(`Urgent rule: expected ${expected || "ordinary"} for “${phrase}”; got ${actual || "ordinary"}.`);
    });
  });
  if (count < 140) fail(`Urgent-language suite must contain at least 140 cases; found ${count}.`);
}

function validateReviewSheets(areas) {
  const manifestFile = path.join(root, "review-sheets", "locations.json");
  if (!fs.existsSync(manifestFile)) {
    fail("Missing reviewer-sheet location manifest: review-sheets/locations.json.");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  if (manifest.schema_version !== 1) fail("Location manifest must use schema_version 1.");
  if (!Array.isArray(manifest.locations)) {
    fail("Location manifest must contain a locations array.");
    return;
  }

  const liveIds = Object.keys(areas).sort();
  const manifestIds = manifest.locations.map((location) => location.id).sort();
  const sheetFiles = fs.readdirSync(path.join(root, "review-sheets"))
    .filter((file) => file.endsWith("-review.csv"))
    .sort();
  const manifestFiles = manifest.locations.map((location) => location.file).sort();

  if (new Set(manifestIds).size !== manifestIds.length) fail("Location manifest contains duplicate ids.");
  if (new Set(manifestFiles).size !== manifestFiles.length) fail("Location manifest contains duplicate reviewer-sheet filenames.");
  if (JSON.stringify(liveIds) !== JSON.stringify(manifestIds)) {
    fail("Location manifest ids must exactly match the live reviewed guides.");
  }
  if (JSON.stringify(sheetFiles) !== JSON.stringify(manifestFiles)) {
    fail("Every reviewer CSV must appear exactly once in the location manifest.");
  }

  manifest.locations.forEach((location) => {
    const label = `Location manifest ${location.id || "(blank id)"}`;
    if (!/^[a-z0-9-]+$/.test(location.id || "")) fail(`${label}: invalid id.`);
    if (!/^[A-Z0-9_]+$/.test(location.constant || "")) fail(`${label}: invalid constant.`);
    if (!/^[A-Z]{2}$/.test(location.state_code || "")) fail(`${label}: invalid state_code.`);
    if (!/^(city|county|metro|municipality)$/.test(location.type || "")) fail(`${label}: type must be city, county, metro, or municipality.`);
    if (location.country && !/^[A-Z]{2}$/.test(location.country)) fail(`${label}: country must use a two-letter code.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(location.reviewed || "")) fail(`${label}: reviewed must use YYYY-MM-DD.`);
    if (!location.name || !location.state) fail(`${label}: name and state are required.`);
    if (!fs.existsSync(path.join(root, "review-sheets", location.file || ""))) {
      fail(`${label}: missing reviewer sheet ${location.file || "(blank)"}.`);
    }
    if (location.register === true && areas[location.id]) {
      const area = areas[location.id];
      const actualDate = new Date(area.reviewed).toISOString().slice(0, 10);
      if (actualDate !== location.reviewed) fail(`${label}: public source date differs from the manifest.`);
      const suicideTarget = area.resources.find((item) => item.id === area.routing.suicide[0]);
      if (suicideTarget?.phone !== "988") fail(`${label}: U.S. crisis route must start with the verified 988 entry.`);
      const violenceTarget = area.resources.find((item) => item.id === area.routing.violence[0]);
      if (violenceTarget?.title !== location.routing_titles.violence[0]) fail(`${label}: violence route changed from its explicit provider.`);
      area.resources.forEach((resource) => {
        if (/^\s*text\b/i.test(resource.phoneDisplay || "") && !/\bcall\b/i.test(resource.phoneDisplay || "") && resource.phone) {
          fail(`${label}: text-only contact must not create a voice-call link.`);
        }
        if (/medicare/i.test(resource.title) && !/mental.health/i.test(resource.title) && resource.categories.includes("mental-health")) {
          fail(`${label}: Medicare counseling is incorrectly categorized as mental-health care.`);
        }
      });
      if (!discovery.groups.some((group) => group.areaId === location.id && group.zips.length)) fail(`${label}: ZIP suggestions are missing.`);
    }
  });
}

let areas;
let discovery;
try {
  areas = loadDirectory();
  discovery = loadDiscovery();
  validateAreas(areas);
  validateDiscovery(discovery, areas);
  validateMarkup(areas);
  validateVisualAssets();
  validateUrgentRules();
  validateReviewSheets(areas);
} catch (error) {
  fail(error.stack || String(error));
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const resourceCount = Object.values(areas).reduce((sum, area) => sum + area.resources.length, 0);
console.log(`Validation passed: ${Object.keys(areas).length} editions, ${resourceCount} edition-listings, 16 directory categories (Omaha pet-listing gap disclosed), 13 discovery topics, accessibility-and-inclusion page, routing integrity, HTTPS links, reviewer sheets, Calm View with pictograms, and 140+ urgent-language cases.`);
