// Generates every static HTML page from _build/pages/*.mjs.
// Usage: node _build/build.mjs
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = join(import.meta.dirname, "pages");
for (const file of readdirSync(dir).filter((f) => f.endsWith(".mjs")).sort()) {
  await import(pathToFileURL(join(dir, file)).href);
}
console.log("Build complete.");
