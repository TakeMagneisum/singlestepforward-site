#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "review-sheets");
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

function csv(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

fs.mkdirSync(output, { recursive: true });
Object.values(context.window.SSF_RESOURCE_AREAS).forEach((area) => {
  const rows = [[
    "Resource", "Scope", "Phone", "Official link", "Current next step",
    "Still correct? (Yes/No)", "Correction or updated link", "Important missing resource",
    "Reviewer name", "Review date"
  ]];
  area.resources.forEach((resource) => {
    rows.push([
      resource.title, resource.scope, resource.phoneDisplay || "", resource.url, resource.next,
      "", "", "", "", ""
    ]);
  });
  const note = [
    [`Single Step Forward reviewer sheet — ${area.label}`],
    [`Source check date: ${area.reviewed}. Local reviewer confirmation is pending.`],
    ["Please mark each row, correct anything stale, and add important missing resources. Do not include client or case details."],
    []
  ];
  const contents = [...note, ...rows].map((row) => row.map(csv).join(",")).join("\n") + "\n";
  fs.writeFileSync(path.join(output, `${area.id}-review.csv`), contents, "utf8");
});

console.log(`Wrote ${Object.keys(context.window.SSF_RESOURCE_AREAS).length} reviewer sheets to ${path.relative(root, output)}.`);
