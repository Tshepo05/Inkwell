/**
 * Verifies the local Convex backend and HTTP (auth) endpoints are up before Next.js starts.
 * Auth fails with "Auth provider discovery of http://127.0.0.1:3211 failed" when 3211 is down.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq)] = trimmed.slice(eq + 1).replace(/^["']|["']$/g, "");
  }
  return vars;
}

const env = { ...loadEnvLocal(), ...process.env };
const convexUrl = env.NEXT_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:3210";
const siteUrl =
  env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "http://127.0.0.1:3211";

async function probe(label, url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) {
      return { label, url, ok: false, detail: `HTTP ${res.status}` };
    }
    return { label, url, ok: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { label, url, ok: false, detail };
  }
}

const backendUrl = `${convexUrl.replace(/\/$/, "")}/version`;
const discoveryUrl = `${siteUrl.replace(/\/$/, "")}/.well-known/openid-configuration`;

const maxAttempts = 30;
let failed = [];
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const checks = await Promise.all([
    probe("Convex backend", backendUrl),
    probe("Convex auth (HTTP actions)", discoveryUrl),
  ]);
  failed = checks.filter((c) => !c.ok);
  if (failed.length === 0) {
    if (attempt > 1) {
      console.log(`Convex is running (ready after ${attempt} attempts).`);
    } else {
      console.log("Convex is running.");
    }
    process.exit(0);
  }
  if (attempt < maxAttempts) {
    await new Promise((r) => setTimeout(r, 1000));
  }
}

console.error("\nInkwell cannot authenticate: Convex is not fully running.\n");
for (const { label, url, detail } of failed) {
  console.error(`  ✗ ${label}: ${url}`);
  if (detail) console.error(`    ${detail}`);
}
console.error(`
Start Convex in another terminal, or use one command for both:

  npm run dev:all

Or:

  npx convex dev

Then in a second terminal:

  npm run dev

The auth error "Auth provider discovery of ${siteUrl} failed" means port 3211
is not serving HTTP routes yet — that only happens while \`npx convex dev\` is running.
`);
process.exit(1);
