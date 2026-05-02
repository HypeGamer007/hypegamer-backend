/**
 * Fails CI when `track("event", …)` is used in src/ but the event is not declared in docs/analytics/events.yaml.
 * Run: node scripts/verify-telemetry-contract.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const eventsPath = join(root, "docs", "analytics", "events.yaml");
const srcDir = join(root, "src");

const yaml = readFileSync(eventsPath, "utf8");
const declared = new Set();
for (const line of yaml.split(/\r?\n/)) {
  const m = line.match(/^\s*-\s*name:\s*(\S+)\s*$/);
  if (m) declared.add(m[1]);
}

if (declared.size === 0) {
  console.error("verify-telemetry-contract: no events parsed from events.yaml");
  process.exit(1);
}

const TRACK_RE = /\btrack\s*\(\s*["']([^"']+)["']/g;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (st.isFile() && [".ts", ".tsx"].includes(extname(p))) files.push(p);
  }
  return files;
}

const used = new Set();
for (const file of walk(srcDir)) {
  const text = readFileSync(file, "utf8");
  let m;
  while ((m = TRACK_RE.exec(text)) !== null) {
    used.add(m[1]);
  }
}

const missing = [...used].filter((e) => !declared.has(e)).sort();
if (missing.length) {
  console.error("verify-telemetry-contract: track() uses events missing from docs/analytics/events.yaml:");
  for (const e of missing) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`verify-telemetry-contract: ok (${used.size} distinct track() event ids, ${declared.size} declared in yaml).`);
