#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const offline = args.includes("--offline");
const strict = args.includes("--strict");
const ageArgument = args.find((arg) => arg.startsWith("--max-age-days="));
const outputArgument = args.find((arg) => arg.startsWith("--output="));
const maxAgeDays = Number(ageArgument?.split("=")[1] || 35);
const outputStem = path.resolve(root, outputArgument?.split("=")[1] || "output/resource-audit");

if (!Number.isFinite(maxAgeDays) || maxAgeDays < 1) throw new Error("--max-age-days must be a positive number.");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += character;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function daysSince(dateText) {
  return Math.floor((Date.now() - Date.parse(dateText + "T00:00:00Z")) / 86400000);
}

function classifyStatus(status) {
  if (status >= 200 && status < 400) return "ok";
  if ([401, 403, 429].includes(status)) return "blocked-or-rate-limited";
  if ([404, 410].includes(status)) return "broken";
  return "warning";
}

async function fetchWithTimeout(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "SingleStepForward-ResourceAudit/1.0 (+https://singlestepforward.com/)",
        ...(method === "GET" ? { Range: "bytes=0-0" } : {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkLink(entry) {
  try {
    let response = await fetchWithTimeout(entry.url, "HEAD");
    if ([405, 501].includes(response.status) || ([400, 404, 410].includes(response.status))) {
      response = await fetchWithTimeout(entry.url, "GET");
    }
    return {
      ...entry,
      status: response.status,
      finalUrl: response.url,
      result: classifyStatus(response.status)
    };
  } catch (error) {
    return { ...entry, status: null, finalUrl: "", result: "warning", error: error.name || String(error) };
  }
}

async function mapWithLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

function markdown(report) {
  const lines = [
    "# Single Step Forward resource audit",
    "",
    `Generated: ${report.generated}`,
    `Mode: ${report.mode}`,
    `Editions: ${report.summary.editions}`,
    `Unique links: ${report.summary.links}`,
    `Stale editions: ${report.summary.staleEditions}`,
    `Confirmed broken links: ${report.summary.broken}`,
    `Blocked, rate-limited, or sign-in responses: ${report.summary.blocked}`,
    `Other warnings: ${report.summary.warnings}`,
    "",
    "Automated checks are triage only. Never remove a resource solely because a bot was blocked; open the authoritative page and confirm it manually.",
    ""
  ];

  if (report.stale.length) {
    lines.push("## Source-check dates needing review", "", "| Edition | Checked | Age |", "|---|---:|---:|");
    report.stale.forEach((item) => lines.push(`| ${item.label} | ${item.reviewed} | ${item.ageDays} days |`));
    lines.push("");
  }

  const attention = report.links.filter((item) => item.result !== "ok");
  if (attention.length) {
    lines.push("## Links needing attention", "", "| Result | HTTP | Resource | Editions | URL |", "|---|---:|---|---|---|");
    attention.forEach((item) => {
      lines.push(`| ${item.result} | ${item.status ?? "—"} | ${item.resources.join("; ")} | ${item.editions.join("; ")} | ${item.url} |`);
    });
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "review-sheets", "locations.json"), "utf8"));
  const stale = [];
  const linkMap = new Map();

  manifest.locations.forEach((location) => {
    const ageDays = daysSince(location.reviewed);
    if (ageDays > maxAgeDays) stale.push({ id: location.id, label: `${location.name}, ${location.state}`, reviewed: location.reviewed, ageDays });

    const sheet = parseCsv(fs.readFileSync(path.join(root, "review-sheets", location.file), "utf8"));
    sheet.slice(5).filter((row) => row[0]).forEach((row) => {
      const url = row[3]?.trim();
      if (!url?.startsWith("https://")) return;
      if (!linkMap.has(url)) linkMap.set(url, { url, editions: new Set(), resources: new Set() });
      linkMap.get(url).editions.add(location.id);
      linkMap.get(url).resources.add(row[0].trim());
    });
  });

  const entries = Array.from(linkMap.values()).map((entry) => ({
    url: entry.url,
    editions: Array.from(entry.editions).sort(),
    resources: Array.from(entry.resources).sort()
  }));
  const checked = offline
    ? entries.map((entry) => ({ ...entry, status: null, finalUrl: "", result: "not-checked" }))
    : await mapWithLimit(entries, 8, checkLink);

  const report = {
    generated: new Date().toISOString(),
    mode: offline ? "offline structure and freshness check" : "live link, structure, and freshness check",
    maxAgeDays,
    summary: {
      editions: manifest.locations.length,
      links: checked.length,
      staleEditions: stale.length,
      broken: checked.filter((item) => item.result === "broken").length,
      blocked: checked.filter((item) => item.result === "blocked-or-rate-limited").length,
      warnings: checked.filter((item) => item.result === "warning").length
    },
    stale,
    links: checked
  };

  fs.mkdirSync(path.dirname(outputStem), { recursive: true });
  fs.writeFileSync(outputStem + ".json", JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(outputStem + ".md", markdown(report) + "\n");
  console.log(`Audit wrote ${path.relative(root, outputStem)}.{json,md}: ${report.summary.broken} broken, ${report.summary.staleEditions} stale, ${report.summary.blocked} blocked, ${report.summary.warnings} warnings.`);

  if (strict && (report.summary.broken || report.summary.staleEditions)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
