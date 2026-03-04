import type { SectionId } from "@utilities";

interface ResolveNavLinkColorInput {
  activeSection: SectionId | "";
  hoveredSection?: SectionId | null;
  linkSection: SectionId;
  activeColor: string;
  idleColor: string;
}

/**
 * Shared nav color resolver used by desktop and mobile nav variants.
 *
 * Why:
 * - Prevents drift where one nav branch (e.g. mobile sections) forgets to
 *   apply active-state color logic.
 */
export function resolveNavLinkColor({
  activeSection,
  hoveredSection = null,
  linkSection,
  activeColor,
  idleColor,
}: ResolveNavLinkColorInput): string {
  const isActive = activeSection === linkSection;
  const isHovered = hoveredSection === linkSection;
  return isActive || isHovered ? activeColor : idleColor;
}
