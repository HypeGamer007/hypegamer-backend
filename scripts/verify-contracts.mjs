/**
 * Lightweight contract checks (no backend): route manifest shape + OpenAPI file present.
 * Complements verify-telemetry-contract.mjs.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function fail(msg) {
  console.error(`verify-contracts: ${msg}`);
  process.exit(1);
}

const manifestPath = resolve(root, "docs/routes/route-manifest.json");
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (e) {
  fail(`could not parse route-manifest.json: ${e}`);
}

if (!manifest.routes || !Array.isArray(manifest.routes) || manifest.routes.length === 0) {
  fail("route-manifest.json: missing routes array");
}

const ids = new Set();
const paths = new Set();
for (const r of manifest.routes) {
  if (!r.id || typeof r.id !== "string") fail(`route missing id: ${JSON.stringify(r)}`);
  if (!r.path || typeof r.path !== "string") fail(`route ${r.id}: missing path`);
  if (!Array.isArray(r.supportsStates) || r.supportsStates.length === 0) {
    fail(`route ${r.id}: supportsStates must be a non-empty array`);
  }
  if (ids.has(r.id)) fail(`duplicate route id: ${r.id}`);
  if (paths.has(r.path)) fail(`duplicate route path: ${r.path}`);
  ids.add(r.id);
  paths.add(r.path);
}

const openapiPath = resolve(root, "specs/openapi/control-plane.yaml");
let openapiHead;
try {
  openapiHead = readFileSync(openapiPath, "utf8").slice(0, 400);
} catch (e) {
  fail(`could not read OpenAPI spec: ${e}`);
}

if (!/^openapi:\s*3\.\d/m.test(openapiHead)) {
  fail("control-plane.yaml: expected OpenAPI 3.x document");
}

console.log(
  `verify-contracts: ok (${manifest.routes.length} routes, OpenAPI stub readable).`,
);
