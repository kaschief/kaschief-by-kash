/**
 * Single source of truth for all lab routes.
 *
 * To add a new lab route:
 * 1. Create `app/lab-N/page.tsx`
 * 2. Add an entry here
 *
 * The hub page and lab-nav both read from this registry.
 */

export interface LabRoute {
  href: string;
  label: string;
  desc: string;
  section: "in-progress" | "wip-covers" | "archived";
}

export const LAB_ROUTES: readonly LabRoute[] = [
  {
    href: "/lab-builder-lenses",
    label: "Builder · Lenses",
    desc: "Hybrid scroll + hover reveal across five indicators on one chart",
    section: "in-progress",
  },

  {
    href: "/lab-wip-5",
    label: "Construction Hoarding",
    desc: "Bold graphic typography with mouse-reactive parallax layers",
    section: "wip-covers",
  },
  {
    href: "/lab-methods",
    label: "Methods",
    desc: "Skill panels with ScrollTrigger pinning and detail overlays",
    section: "wip-covers",
  },

  {
    href: "/lab-builder",
    label: "Builder (Legacy)",
    desc: "Original Act IV — 14 indicators, progression, horizontal strip",
    section: "archived",
  },
];

const SECTION_LABELS: Record<LabRoute["section"], string> = {
  "in-progress": "In Progress",
  "wip-covers": "WIP Covers",
  archived: "Archived Sections",
};

export interface LabSection {
  title: string;
  routes: LabRoute[];
}

/** Routes grouped by section, preserving insertion order. */
export function getLabSections(): LabSection[] {
  const grouped = new Map<LabRoute["section"], LabRoute[]>();

  for (const route of LAB_ROUTES) {
    const list = grouped.get(route.section) ?? [];
    list.push(route);
    grouped.set(route.section, list);
  }

  return Array.from(grouped.entries()).map(([key, routes]) => ({
    title: SECTION_LABELS[key],
    routes,
  }));
}
