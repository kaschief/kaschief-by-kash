#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = [
  "app",
  "components",
  "data",
  "features",
  "hooks",
  "utilities",
];
const TARGET_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts"]);

const DISALLOWED_IMPORTS = [
  {
    regex: /from\s+["']@\/(?:[^"']+)["']/g,
    message:
      "Do not use '@/...' imports. Use top-level aliases: @components, @data, @features, @hooks, @utilities.",
  },
  {
    regex: /from\s+["']@components\/(?:[^"']+)["']/g,
    message:
      "Do not deep import from @components/... Use only `from \"@components\"`.",
  },
  {
    regex: /from\s+["']@data\/(?:[^"']+)["']/g,
    message: "Do not deep import from @data/... Use only `from \"@data\"`.",
  },
  {
    regex: /from\s+["']@hooks\/(?:[^"']+)["']/g,
    message: "Do not deep import from @hooks/... Use only `from \"@hooks\"`.",
  },
  {
    regex: /from\s+["']@utilities\/(?:[^"']+)["']/g,
    message:
      "Do not deep import from @utilities/... Use only `from \"@utilities\"`.",
  },
  {
    regex: /from\s+["']@features\/(?:[^"'\/]+)\/(?:[^"']+)["']/g,
    message:
      "Feature modules must be imported from their public API only (e.g. @features/navigation).",
  },
  {
    regex: /from\s+["'](?:@\/)?lib(?:\/(?:[^"']+))?["']/g,
    message: "`lib` has been renamed to `utilities`. Import from @utilities instead.",
  },
];

const DISALLOWED_MEMBER_ACCESS = [
  {
    regex: /\bPERSONAL\.\w+\b/g,
    message:
      "Destructure PERSONAL first (e.g. `const { email } = PERSONAL`) instead of PERSONAL.email.",
  },
  {
    regex: /\bSECTION_ID\.\w+\b/g,
    message:
      "Destructure SECTION_ID values first (e.g. `const { CONTACT } = SECTION_ID`) instead of SECTION_ID.CONTACT.",
  },
];

const DISALLOWED_BREAKPOINT_STRING_RULE = {
  regex: /\buseBreakpoint\(\s*["'][^"']+["']\s*\)/g,
  message:
    "Use breakpoint constants (e.g. BP.md), not string literals, in useBreakpoint(...).",
};

const DISALLOWED_COMPONENT_MATCH_MEDIA_RULE = {
  regex: /\bmatchMedia\s*\(/g,
  message: "Components must not use matchMedia directly. Use hooks from @hooks.",
};

const MEMBER_ACCESS_ALLOWLIST = new Set(["utilities/sections.ts"]);

const IMPORT_LINE_REGEX =
  /^import\s+[\s\S]*?\s+from\s+["']([^"']+)["'];?/gm;

const issues = [];

for (const dir of TARGET_DIRS) {
  walkDir(dir);
}

if (issues.length > 0) {
  console.error(`Architecture rules failed: ${issues.length} issue(s).`);
  for (const issue of issues) {
    console.error(`- ${issue.file}:${issue.line} ${issue.message}`);
    console.error(`  ${issue.snippet}`);
  }
  process.exit(1);
}

console.log("Architecture rules passed.");

function walkDir(dir) {
  const fullDir = join(ROOT, dir);
  let entries = [];

  try {
    entries = readdirSync(fullDir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.startsWith(".")) continue;

    const fullPath = join(fullDir, entry);
    let stats;
    try {
      stats = statSync(fullPath);
    } catch {
      continue;
    }

    if (stats.isDirectory()) {
      walkDir(join(dir, entry));
      continue;
    }

    if (!TARGET_EXTENSIONS.has(extname(fullPath))) continue;
    lintFile(fullPath);
  }
}

function lintFile(filePath) {
  let source = "";
  try {
    source = readFileSync(filePath, "utf8");
  } catch {
    return;
  }

  const relPath = normalize(relative(ROOT, filePath));

  if (relPath.startsWith("components/sections/")) {
    issues.push({
      file: relPath,
      line: 1,
      message:
        "Section features must live under features/*, not components/sections/.",
      snippet: relPath,
    });
  }

  if (
    relPath === "components/index.ts" &&
    /from\s+["']\.\/sections(?:\/[^"']*)?["']/.test(source)
  ) {
    issues.push({
      file: relPath,
      line: 1,
      message:
        "components/index.ts must expose shared components only (no sections exports).",
      snippet: "./sections export detected",
    });
  }

  for (const rule of DISALLOWED_IMPORTS) {
    findMatches({ relPath, source, regex: rule.regex, message: rule.message });
  }

  if (!MEMBER_ACCESS_ALLOWLIST.has(relPath)) {
    for (const rule of DISALLOWED_MEMBER_ACCESS) {
      findMatches({
        relPath,
        source,
        regex: rule.regex,
        message: rule.message,
      });
    }
  }

  findMatches({
    relPath,
    source,
    regex: DISALLOWED_BREAKPOINT_STRING_RULE.regex,
    message: DISALLOWED_BREAKPOINT_STRING_RULE.message,
  });

  if (relPath.startsWith("components/")) {
    findMatches({
      relPath,
      source,
      regex: DISALLOWED_COMPONENT_MATCH_MEDIA_RULE.regex,
      message: DISALLOWED_COMPONENT_MATCH_MEDIA_RULE.message,
    });
  }

  checkDuplicateImports(relPath, source);
}

function checkDuplicateImports(relPath, source) {
  const counts = new Map();

  for (const match of source.matchAll(IMPORT_LINE_REGEX)) {
    const modulePath = match[1];
    counts.set(modulePath, (counts.get(modulePath) ?? 0) + 1);
  }

  for (const [modulePath, count] of counts.entries()) {
    if (count <= 1) continue;

    issues.push({
      file: relPath,
      line: 1,
      message: `Combine duplicate imports from \"${modulePath}\" into one import statement.`,
      snippet: `import ... from \"${modulePath}\" (x${count})`,
    });
  }
}

function findMatches({ relPath, source, regex, message }) {
  for (const match of source.matchAll(regex)) {
    const index = match.index ?? 0;
    const line = getLineNumber(source, index);

    issues.push({
      file: relPath,
      line,
      message,
      snippet: match[0],
    });
  }
}

function normalize(filePath) {
  return filePath.replaceAll("\\", "/");
}

function getLineNumber(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source[i] === "\n") line += 1;
  }
  return line;
}
