/**
 * Applies JWT_PRIVATE_KEY and JWKS from generateKeys.mjs to the local Convex deployment.
 * Run: node generateKeys.mjs > keys.txt && node scripts/setup-convex-auth.mjs
 *
 * On Windows, run env commands in a separate terminal from `npx convex dev` to avoid
 * a harmless libuv crash (Assertion failed: UV_HANDLE_CLOSING) when the CLI exits.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const keysPath = resolve(process.cwd(), "keys.txt");
if (!existsSync(keysPath)) {
  console.error("Missing keys.txt. Run: node generateKeys.mjs > keys.txt");
  process.exit(1);
}

const content = readFileSync(keysPath, "utf8");
const jwtMatch = content.match(/^JWT_PRIVATE_KEY="(.+)"$/m);
const jwksMatch = content.match(/^JWKS=(.+)$/m);

if (!jwtMatch || !jwksMatch) {
  console.error("keys.txt must contain JWT_PRIVATE_KEY and JWKS lines from generateKeys.mjs");
  process.exit(1);
}

function setEnv(name, value) {
  execFileSync("npx", ["convex", "env", "set", name, value], {
    stdio: "inherit",
    shell: true,
  });
}

console.log("Setting JWT_PRIVATE_KEY...");
setEnv("JWT_PRIVATE_KEY", jwtMatch[1]);
console.log("Setting JWKS...");
setEnv("JWKS", jwksMatch[1]);
console.log("Done. Verify with: npx convex env list");
