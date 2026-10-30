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
  const areaIds = new Set(Object.keys(areas || {}));
  const zipOwners = new Map();
  const categoryIds = new Set();

  if (groups.length !== areaIds.size) {
    fail("Discovery ZIP groups must match all 10 reviewed local guides.");
  }

  groups.forEach((group, groupIndex) => {
    const label = "Discovery ZIP group " + groupIndex;
    if (!areaIds.has(group.areaId)) fail(label + ": unknown areaId " + group.areaId + ".");
    if (!group.label) fail(label + ": label is required.");
    if (!Array.isArray(group.zips) || !group.zips.length) fail(label + ": ZIP list is missing.");

    (group.zips || []).forEach((zip) => {
      if (!/^\d{5}$/.test(zip)) fail(label + ": malformed ZIP " + zip + ".");
      if (zipOwners.has(zip)) {
        fail("Discovery ZIP " + zip + " is assigned to both " + zipOwners.get(zip) + " and " + group.areaId + ".");
      } else {
        zipOwners.set(zip, group.areaId);
      }
    });
  });

  if (zipOwners.get("80202") !== "denver") fail("ZIP regression: 80202 must suggest the Denver guide.");
  if (zipOwners.get("60544") !== "plainfield") fail("ZIP regression: 60544 must suggest the Plainfield guide.");
  if (zipOwners.has("99999")) fail("ZIP regression: 99999 must remain an unmatched fallback example.");

  if (categories.length < 11) fail("Universal discovery must contain at least 11 topic categories.");
  categories.forEach((category, index) => {
    const label = "Discovery category " + index;
    if (!category.id || !/^[a-z0-9-]+$/.test(category.id)) fail(label + ": invalid id.");
    if (categoryIds.has(category.id)) fail("Duplicate discovery category id " + category.id + ".");
    categoryIds.add(category.id);
    if (!category.title || !category.summary || !category.searchLabel) {
      fail(label + ": title, summary, and search label are required.");
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
}

function validateAreas(areas) {
  const areaEntries = Object.entries(areas || {});
  if (areaEntries.length !== 10) fail(`Expected 10 local editions; found ${areaEntries.length}.`);

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
      if (resource.phone && !/^\d{3,15}$/.test(resource.phone)) fail(`${label}: phone must contain 3–15 digits only.`);
    });

    requiredCategories.forEach((category) => {
      if (!categories.has(category)) fail(`${areaId}: missing category ${category}.`);
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
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

  Object.keys(areas).forEach((areaId) => {
    const option = `value="${areaId}"`;
    if (!index.includes(option)) fail(`index.html: selector is missing ${areaId}.`);
    if (!finder.includes(option)) fail(`find-help.html: selector is missing ${areaId}.`);
    if (areaId !== "liberty" && !sitemap.includes(`area=${areaId}`)) fail(`sitemap.xml: missing ${areaId}.`);
  });

  ["illinois-resources.js", "urgent.js"].forEach((file) => {
    if (!finder.includes(file)) fail(`find-help.html: missing script ${file}.`);
  });
  if (!index.includes("illinois-resources.js")) fail("index.html: missing Illinois dataset script.");

  if (!index.includes("data-zip-form") || !index.includes("data-zip-input")) {
    fail("index.html: accessible ZIP discovery form is missing.");
  }
  ["id=\"zip-result\"", "id=\"discovery-grid\"", "data-zip-form"].forEach((required) => {
    if (!discovery.includes(required)) fail("discover.html: missing required structure " + required + ".");
  });
  ["tel:911", "tel:988", "tel:211"].forEach((route) => {
    if (!discovery.includes(route)) fail("discover.html: missing direct route " + route + ".");
  });
  if (!sitemap.includes("discover.html")) fail("sitemap.xml: missing universal discovery page.");

  const expectedCacheToken = "20261030-1";
  [
    ["index.html", index],
    ["find-help.html", finder],
    ["discover.html", discovery]
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
      "I am being attacked", "someone is breaking in", "he is choking me right now"
    ],
    suicide: [
      "I am thinking about suicide", "I feel suicidal", "I might kill myself", "I am killing myself",
      "I want to die", "I might hurt myself", "I am hurting myself", "I have urges to self harm",
      "I want to end my life", "I am ending my life", "thinking about ending it",
      "thinking of ending it", "I want to end it all", "I don't want to live",
      "I do not want to live", "I can't go on", "I cannot go on", "everyone is better off dead without me",
      "someone wants to die", "someone is suicidal", "my friend wants to die",
      "thinking of suicide", "my brother is suicidal", "she said she wants to die",
      "I keep thinking about ending it"
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
      "my girlfriend is abusing me"
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
      "my partner needs job training", "my husband needs a dentist", "my wife lost her job"
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
  if (count < 100) fail(`Urgent-language suite must contain at least 100 cases; found ${count}.`);
}

function validateReviewSheets(areas) {
  Object.keys(areas).forEach((areaId) => {
    const file = path.join(root, "review-sheets", `${areaId}-review.csv`);
    if (!fs.existsSync(file)) fail(`Missing reviewer sheet: review-sheets/${areaId}-review.csv.`);
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
console.log(`Validation passed: ${Object.keys(areas).length} editions, ${resourceCount} edition-listings, 16 categories, routing integrity, HTTPS links, reviewer sheets, and 100+ urgent-language cases.`);
