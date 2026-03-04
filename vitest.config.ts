import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const ROOT = __dirname;

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
      "data/**/*.test.ts",
      "utilities/**/*.test.ts",
    ],
    exclude: ["node_modules", ".next"],
    cache: false,
  },
});
