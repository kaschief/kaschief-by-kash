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
  section: "archived" | "reference" | "scroll";
}

export const LAB_ROUTES: readonly LabRoute[] = [
  // Archived
  { href: "/old-engineer", label: "Old Engineer", desc: "Original Act II terminal section", section: "archived" },

  // Reference prototypes
  { href: "/lab-sankey", label: "Horizontal Sankey", desc: "Left-to-right SVG Sankey, streams flow through company bars", section: "reference" },
  { href: "/lab-particles", label: "Particle Flow", desc: "Canvas particles with glow, trails, wobble along stream paths", section: "reference" },

  // Design explorations
  { href: "/lab-artifacts", label: "Artifacts", desc: "Skeuomorphic UI fragments — Jira, Sentry, Slack, Figma, GitHub", section: "reference" },

  // Scroll explorations (newest first)
  { href: "/lab-curtain-thesis", label: "Curtain Thesis", desc: "Thesis → curtain wipe → keyword isolation → pillar anchor", section: "scroll" },
  { href: "/lab-blinds", label: "Blinds", desc: "Staggered entry → horizontal blinds sweep → dual content reveal", section: "scroll" },
  { href: "/lab-pillars", label: "Pillars", desc: "Card-stack pillar exploration with scroll-driven stories", section: "scroll" },
  { href: "/lab-focus", label: "Focus", desc: "Focus scroll prototype (latest)", section: "scroll" },
  { href: "/lab-curtain", label: "Curtain", desc: "Curtain reveal scroll prototype", section: "scroll" },
  { href: "/lab-wordtype", label: "WordType", desc: "Word-typing scroll prototype", section: "scroll" },
  { href: "/lab-forge", label: "Forge", desc: "Forge scroll prototype", section: "scroll" },
];

const SECTION_LABELS: Record<LabRoute["section"], string> = {
  archived: "Archived",
  reference: "Reference Prototypes",
  scroll: "Scroll Explorations",
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
