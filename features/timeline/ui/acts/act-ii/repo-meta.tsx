"use client";

import type { Repo } from "@data";

interface RepoMetaProps {
  repo: Repo;
}

/** Language dot, stars, branch info bar. */
export function RepoMeta({ repo }: RepoMetaProps) {
  return (
    <div
      className="mb-5 flex flex-wrap items-center gap-4 font-mono text-xs"
      aria-label="Repository metadata">
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: repo.languageColor }}
          aria-hidden="true"
        />
        <span className="text-(--cream-muted)">{repo.language}</span>
      </span>
      <span className="text-(--text-dim)">
        <span aria-hidden="true">{"\u2605"} </span>
        {repo.stars}
      </span>
      <span className="text-(--text-dim)">
        <span aria-hidden="true">{"\u2387"} </span>
        {repo.branch}
      </span>
    </div>
  );
}
