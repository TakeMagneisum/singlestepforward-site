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
try {
  areas = loadDirectory();
  validateAreas(areas);
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
