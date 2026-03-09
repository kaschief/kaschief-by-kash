import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const ROOT = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@features\/(.+)$/,
        replacement: `${resolve(ROOT, "features")}/$1/public-api.ts`,
      },
      { find: "@app", replacement: resolve(ROOT, "app") },
      { find: "@components", replacement: resolve(ROOT, "components/index.ts") },
      { find: "@data", replacement: resolve(ROOT, "data/index.ts") },
      { find: "@hooks", replacement: resolve(ROOT, "hooks/index.ts") },
      { find: "@utilities", replacement: resolve(ROOT, "utilities/index.ts") },
    ],
  },
  test: {
    environment: "node",
    include: [
      "features/**/*.test.ts",
      "components/**/*.test.ts",
      "components/**/*.test.tsx",
      "data/**/*.test.ts",
      "hooks/**/*.test.ts",
      "utilities/**/*.test.ts",
    ],
    exclude: ["node_modules", ".next"],
    cache: false,
  },
});
