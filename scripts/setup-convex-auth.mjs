/**
 * Reads keys.txt and writes convex.env for use with:
 *   npx convex env set --from-file convex.env --force
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const keysPath = resolve(process.cwd(), "keys.txt");
if (!existsSync(keysPath)) {
  console.error("Missing keys.txt. Generate it first:");
  console.error(
    "  node -e \"require('fs').writeFileSync('keys.txt', require('child_process').execSync('node generateKeys.mjs').toString(), 'utf8')\"",
  );
  process.exit(1);
}

const content = readFileSync(keysPath, "utf8");
const jwtMatch = content.match(/JWT_PRIVATE_KEY="([\s\S]+?)"\s*(?:\n|\r|$)/);
const jwksMatch = content.match(/JWKS=(.+)/);

if (!jwtMatch || !jwksMatch) {
  console.error("Could not parse JWT_PRIVATE_KEY or JWKS from keys.txt.");
  console.error("File contents:");
  console.error(content.slice(0, 200));
  process.exit(1);
}

const jwt = jwtMatch[1].trim();
const jwks = jwksMatch[1].trim();

// Validate JWKS is proper JSON
try {
  const parsed = JSON.parse(jwks);
  if (!parsed.keys || !Array.isArray(parsed.keys)) throw new Error("Missing keys array");
  console.log("✓ JWKS is valid JSON with", parsed.keys.length, "key(s)");
} catch (e) {
  console.error("✗ JWKS is not valid JSON:", e.message);
  console.error("Value:", jwks.slice(0, 100));
  process.exit(1);
}

const envContent = `JWT_PRIVATE_KEY=${jwt}\nJWKS=${jwks}\n`;
writeFileSync("convex.env", envContent, "utf8");
console.log("✓ convex.env written");

console.log("Setting Convex environment variables via --from-file...");
execSync("npx convex env set --from-file convex.env --force", {
  stdio: "inherit",
  shell: true,
});

console.log("✓ Done. Verifying...");
execSync("npx convex env list", { stdio: "inherit", shell: true });
