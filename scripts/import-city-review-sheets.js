#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "assets", "city-resources.js");

const sheetsDirectory = path.join(root, "review-sheets");
const manifestPath = path.join(sheetsDirectory, "locations.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.schema_version !== 1 || !Array.isArray(manifest.locations)) {
  throw new Error("review-sheets/locations.json must use schema_version 1 and contain a locations array.");
}

const discoveredFiles = fs.readdirSync(sheetsDirectory)
  .filter((file) => file.endsWith("-review.csv"))
  .sort();
const cities = [...manifest.locations].sort((a, b) => a.id.localeCompare(b.id));
const configuredFiles = cities.map((city) => city.file).sort();
if (JSON.stringify(discoveredFiles) !== JSON.stringify(configuredFiles)) {
  const missingFromManifest = discoveredFiles.filter((file) => !configuredFiles.includes(file));
  const missingFromFolder = configuredFiles.filter((file) => !discoveredFiles.includes(file));
  throw new Error([
    missingFromManifest.length ? `Reviewer sheets missing from locations.json: ${missingFromManifest.join(", ")}.` : "",
    missingFromFolder.length ? `Manifest files missing from review-sheets: ${missingFromFolder.join(", ")}.` : ""
  ].filter(Boolean).join(" "));
}

const seenIds = new Set();
const seenConstants = new Set();
cities.forEach((city) => {
  if (!/^[a-z0-9-]+$/.test(city.id || "")) throw new Error(`Invalid location id: ${city.id || "(blank)"}.`);
  if (!/^[A-Z0-9_]+$/.test(city.constant || "")) throw new Error(`${city.id}: invalid constant name.`);
  if (seenIds.has(city.id)) throw new Error(`Duplicate location id: ${city.id}.`);
  if (seenConstants.has(city.constant)) throw new Error(`Duplicate location constant: ${city.constant}.`);
  seenIds.add(city.id);
  seenConstants.add(city.constant);
});

const categoryKeywords = {
  animals: ["animal", "pet", "dog", "cat", "veterinary", "veterinaria", "mascota", "humane", "shelter pet"],
  education: ["adult education", "college", "school", "library", "learning", "GED", "literacy", "class", "special education", "IEP", "parent training"],
  family: ["family", "familia", "child", "niñez", "childcare", "child care", "JUNJI", "JUNAEB", "WIC", "senior", "adulto mayor", "SENAMA", "aging", "disability", "discapacidad", "SENADIS", "caregiver", "Head Start"],
  food: ["food", "pantry", "meal", "aliment", "JUNAEB", "SNAP", "groceries", "WIC", "nutrition"],
  health: ["health", "salud", "FONASA", "CESFAM", "SAMU", "healthcare", "medical", "clinic", "immunization", "vaccine", "insurance", "Medicaid"],
  housing: ["housing", "vivienda", "arriendo", "rent", "rental", "homeless", "calle", "albergue", "shelter", "eviction", "utility", "energy", "LIHEAP", "HEAP"],
  legal: ["legal", "juríd", "asistencia judicial", "SERNAC", "consumidor", "law", "lawhelp", "attorney", "consumer", "tenant", "renter", "rights", "counsel"],
  "mental-health": ["mental health", "salud mental", "suicid", "*4141", "behavioral health", "suicide", "counseling", "MHMR"],
  recovery: ["substance", "opioid", "recovery", "addiction", "treatment", "alcohol", "drog", "SENDA", "1412", "drug"],
  safety: ["domestic violence", "sexual violence", "violence", "violencia", "Carabineros", "Bomberos", "SENAPRED", "abuse", "safety", "emergency", "emergencia", "crisis", "shelter", "alert"],
  tax: ["tax", "tributari", "impuestos internos", "SII", "VITA", "TCE", "IRS"],
  transportation: ["transit", "transportation", "transporte", "Biotren", "Red Movilidad", "EFE", "paratransit", "fare", "ride", "metro", "bus", "Cityride", "Dial-a-Ride"],
  veterans: ["veteran", "veterans", "military", "Armed Forces", "CAPREDENA", "fuerzas armadas"],
  volunteer: ["volunteer", "voluntari", "Servicio País", "give back"],
  weather: ["weather", "meteorológ", "forecast", "SENAPRED", "alert", "preparedness", "warning", "Notify", "Ready"],
  work: ["workforce", "work", "trabajo", "empleo", "OMIL", "SENCE", "job", "career", "employment", "training", "WorkSource"]
};

const keywordBank = {
  animals: ["pet help", "animal shelter", "pet food", "veterinary care"],
  education: ["adult classes", "GED", "literacy", "library", "school"],
  family: ["child care", "senior help", "disability", "caregiver", "family support"],
  food: ["food pantry", "groceries", "meals", "SNAP", "WIC"],
  health: ["clinic", "medical care", "insurance", "immunization", "vaccine"],
  housing: ["rent help", "shelter", "homeless", "eviction", "utility bill"],
  legal: ["legal aid", "tenant rights", "consumer complaint", "lawyer"],
  "mental-health": ["crisis support", "mental health", "suicide", "counseling"],
  recovery: ["substance use", "addiction", "recovery", "treatment"],
  safety: ["domestic violence", "abuse", "unsafe", "emergency", "crisis"],
  tax: ["free tax help", "tax preparation", "VITA"],
  transportation: ["bus", "reduced fare", "paratransit", "ride"],
  veterans: ["veteran benefits", "military family", "homeless veteran"],
  volunteer: ["volunteer", "give back", "community service"],
  weather: ["weather forecast", "emergency alert", "warning", "preparedness"],
  work: ["job center", "career", "training", "resume", "employment"]
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function slug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function categoriesFor(row, includeFallback = true) {
  const haystack = `${row.resource} ${row.scope} ${row.next}`.toLowerCase();
  const resourceName = row.resource.toLowerCase();
  const normalized = ` ${haystack.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
  const hasPhrase = (phrase) => normalized.includes(` ${phrase.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `);
  const categories = Object.entries(categoryKeywords)
    .filter(([, words]) => words.some(hasPhrase))
    .map(([category]) => category);

  if (/\b(?:2-1-1|211|311)\b/.test(resourceName)) {
    categories.push("food", "housing", "health", "mental-health", "family", "work", "safety", "transportation", "volunteer");
  }
  if (/benefits|public assistance|social services/.test(resourceName)) {
    categories.push("food", "health", "housing", "family");
  }
  if (/public librar/.test(resourceName)) categories.push("education", "work");
  if (/emergency alert|weather|forecast|notify|ready(?:fw|philadelphia)?|calalerts|ny-alert|alertsa|alertsan|alerthouston/.test(haystack)) {
    categories.push("weather", "safety");
  }
  if (/988|crisis lifeline/.test(resourceName)) categories.push("mental-health", "recovery", "safety");
  if (/crisis/.test(resourceName) && !/domestic|violence/.test(resourceName)) categories.push("mental-health", "safety");
  if (/homeless veterans/.test(resourceName)) categories.push("veterans", "housing", "safety");

  let resolved = [...new Set(categories.length ? categories : (includeFallback ? ["family"] : []))];
  if (/medicare/.test(resourceName) && !/mental.health/.test(resourceName)) {
    resolved = [...new Set(resolved.filter((category) => category !== "mental-health").concat("health", "family"))];
  }
  if (/(?:animal|dog|cat) shelter/.test(resourceName)) {
    resolved = resolved.filter((category) => category !== "housing" && category !== "safety");
  }
  return resolved;
}

function phoneFor(display) {
  const text = String(display || "");
  if (/^\s*text\b/i.test(text) && !/\bcall\b/i.test(text)) return "";
  const star = text.match(/\*4141/);
  if (star) return "*4141";
  const leadingShort = text.match(/^\D*\b(101|131|132|133|1412|1455|149|211|311|988)\b/);
  if (leadingShort) return leadingShort[1];
  const full = text.match(/\b(?:1[-.\s]?)?\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/);
  if (full) return full[0].replace(/\D/g, "");
  const short = text.match(/\b(?:101|131|132|133|1412|1455|149|211|311|988)\b/);
  if (short) return short[0];
  const local = text.match(/\b\d{3}[-.\s]\d{4}\b/);
  return local ? local[0].replace(/\D/g, "") : "";
}

function sourceFor(url) {
  const host = new URL(url).hostname.toLowerCase();
  if (host.endsWith(".gov") || host.includes(".gov.") || host.endsWith(".gob.cl") || host.endsWith(".cl") && /chileatiende|munistgo|concepcion|municipalidaddevalparaiso|senapred|senda|sernac|minsal/.test(host)) return "Government official";
  if (host.includes("211") || host.includes("988")) return "Official helpline";
  return "Official or designated provider";
}

function primaryCategoryFor(resource, categories) {
  if (/medicare/i.test(resource)) return "Medicare and health-coverage guidance";
  if (/\b(?:2-1-1|211|311)\b/i.test(resource)) return "local service navigation";
  if (/988|crisis lifeline/i.test(resource)) return "mental-health support";
  if (/benefits|compass|access nyc|social services|community connections/i.test(resource)) return "benefits navigation";
  if (/developmental disabilit|early intervention|parent training/i.test(resource)) return "disability and family support";

  const titleOnly = categoriesFor({ resource, scope: "", next: "" }, false);
  const preferredOrder = [
    "tax", "veterans", "weather", "volunteer", "animals", "transportation", "education",
    "work", "legal", "recovery", "mental-health", "safety", "housing", "food", "health", "family"
  ];
  const titleMatch = preferredOrder.find((category) => titleOnly.includes(category));
  const generalMatch = preferredOrder.find((category) => categories.includes(category));
  return (titleMatch || generalMatch || categories[0]).replace("mental-health", "mental-health support");
}

function summaryFor(resource, categories, scope) {
  const primary = primaryCategoryFor(resource, categories);
  return `${resource} is a source-checked starting point for ${primary} serving ${scope}.`;
}

function keywordsFor(resource, categories, scope) {
  const stopWords = new Set([
    "about", "after", "also", "and", "are", "can", "care", "could", "for", "from", "get",
    "have", "help", "here", "how", "into", "need", "please", "some", "that", "the", "their",
    "there", "they", "this", "what", "where", "with", "would", "your"
  ]);
  const titleWords = resource
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
  const scopeWords = scope
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));
  return [...new Set([
    resource.toLowerCase(),
    ...titleWords,
    ...scopeWords,
    ...categories.flatMap((category) => keywordBank[category] || [])
  ])];
}

function priorityFor(resource, categories, index) {
  const name = resource.toLowerCase();
  if (/\b(?:2-1-1|211)\b/.test(name)) return 1;
  if (/988|crisis lifeline/.test(name)) return 1;
  if (/311/.test(name)) return 2;
  if (/benefits|access nyc|community connections|social services/.test(name)) return 3;
  if (categories.includes("food") && /food|pantry/.test(name)) return 4;
  if (categories.includes("housing") && /homeless|shelter|housing/.test(name)) return 5;
  if (categories.includes("mental-health")) return 6;
  if (/domestic|violence|safehaven|women/.test(name)) return 7;
  if (categories.includes("legal")) return 8;
  return 20 + index;
}

function buildResources(city) {
  const file = path.join(root, "review-sheets", city.file);
  const rows = parseCsv(fs.readFileSync(file, "utf8"));
  const header = rows[4];
  const expected = ["Resource", "Scope", "Phone", "Official link", "Current next step"];
  expected.forEach((label, index) => {
    if (header[index] !== label) throw new Error(`${city.file}: expected ${label} in column ${index + 1}.`);
  });

  const ids = new Set();
  const resources = rows.slice(5).filter((row) => row[0]).map((row, index) => {
    const data = {
      resource: row[0].trim(),
      scope: row[1].trim(),
      phoneDisplay: row[2].trim(),
      url: row[3].trim(),
      next: row[4].replace(/\s+/g, " ").trim()
    };
    if (!data.url.startsWith("https://")) throw new Error(`${city.file}: ${data.resource} does not use HTTPS.`);

    let id = slug(data.resource);
    let suffix = 2;
    while (ids.has(id)) {
      id = `${slug(data.resource)}-${suffix}`;
      suffix += 1;
    }
    ids.add(id);

    const categories = categoriesFor(data);
    const phone = phoneFor(data.phoneDisplay);
    const priority = priorityFor(data.resource, categories, index);
    const resource = {
      id,
      title: data.resource,
      categories,
      keywords: keywordsFor(data.resource, categories, data.scope),
      source: sourceFor(data.url),
      scope: data.scope,
      summary: summaryFor(data.resource, categories, data.scope),
      next: data.next
    };
    if (phone) resource.phone = phone;
    if (data.phoneDisplay) resource.phoneDisplay = data.phoneDisplay;
    resource.url = data.url;
    resource.featured = priority <= 8;
    resource.priority = priority;
    return resource;
  });

  const categorySet = new Set(resources.flatMap((resource) => resource.categories));
  if (categorySet.size < 6) {
    throw new Error(`${city.file}: generated data covers only ${categorySet.size} categories; review the sheet or classification rules.`);
  }
  return resources;
}

const generatedCities = cities.filter((city) => city.generate === true);
const importedAreas = {};
const generated = [
  "/* Generated from review-sheets/*-review.csv by scripts/import-city-review-sheets.js. */",
  "(function () {",
  '  "use strict";',
  ""
];

generatedCities.forEach((city, cityIndex) => {
  const resources = buildResources(city);
  if (city.register === true) {
    const routing = {};
    for (const route of ["emergency", "suicide", "violence", "fallback"]) {
      const titles = city.routing_titles?.[route];
      if (!Array.isArray(titles) || !titles.length) throw new Error(`${city.id}: missing ${route} routing titles.`);
      routing[route] = titles.map((title) => {
        const match = resources.find((resource) => resource.title === title);
        if (!match) throw new Error(`${city.id}: unknown routing title ${title}.`);
        return match.id;
      });
    }
    routing.violenceText = "Call 911 for immediate danger. Use a safe device if possible to contact the support service below; confirm its current intake and availability.";
    routing.fallbackText = "Try fewer words, browse a topic, or contact the local service-navigation resource below for help finding the right provider.";
    const [year, month, day] = city.reviewed.split("-").map(Number);
    importedAreas[city.id] = {
      id: city.id, name: city.name, state: city.state, stateCode: city.state_code,
      country: city.country || "US", label: `${city.name}, ${city.state}`,
      shortLabel: `${city.name}, ${city.state_code}`,
      reviewed: new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
      routing
    };
    if (city.jurisdiction_note) importedAreas[city.id].jurisdictionNote = city.jurisdiction_note;
    if (city.coverage_note) importedAreas[city.id].coverageNote = city.coverage_note;
  }
  const json = JSON.stringify(resources, null, 2)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  generated.push(`  window.SSF_${city.constant}_RESOURCES = ${json};`);
  if (cityIndex < generatedCities.length - 1) generated.push("");
});

generated.push("", `  window.SSF_IMPORTED_RESOURCE_AREAS = ${JSON.stringify(importedAreas, null, 2)};`);
cities.filter((city) => city.register === true).forEach((city) => {
  generated.push(`  window.SSF_IMPORTED_RESOURCE_AREAS[${JSON.stringify(city.id)}].resources = window.SSF_${city.constant}_RESOURCES;`);
});
generated.push("})();", "");
fs.writeFileSync(output, generated.join("\n"), "utf8");
console.log(`Validated ${cities.length} locations and wrote ${generatedCities.length} generated datasets to ${path.relative(root, output)}.`);
