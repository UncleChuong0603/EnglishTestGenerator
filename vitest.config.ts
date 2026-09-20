import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    // PGlite migration suites each start an embedded database. Running them
    // together exhausted startup time on Windows/OneDrive during the full run.
    maxWorkers: 1,
  },
});
