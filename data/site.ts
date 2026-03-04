import { SECTION_ID, type SectionId, TOKENS } from "@utilities";
const { actBlue, actGold, actGreen, actRed } = TOKENS;
const { ACT_BUILDER, ACT_ENGINEER, ACT_LEADER, ACT_NURSE, CONTACT, METHODS, PHILOSOPHY: PHILOSOPHY_SECTION } = SECTION_ID;

export interface PersonalInfo {
  name: string;
  initials: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export const ROLE_LABEL = {
  NURSE: "Nurse",
  ENGINEER: "Engineer",
  LEADER: "Leader",
  BUILDER: "Builder",
} as const;

export type RoleLabel = (typeof ROLE_LABEL)[keyof typeof ROLE_LABEL];

export interface Role {
  label: RoleLabel;
  sectionId: SectionId;
  color: string;
}

export const PERSONAL: PersonalInfo = {
  name: "Kaschief Johnson",
  initials: "KJ",
  email: "kaschiefj@gmail.com",
  phone: "+49 176 204 19325",
  location: "Berlin, Germany",
  linkedin: "https://linkedin.com/in/kaschief-johnson",
  github: "https://github.com/kaschief/kash-indicators",
};

export const NAV_LINKS: NavLink[] = [
  { label: "Methods", href: `#${METHODS}` },
  { label: "Contact", href: `#${CONTACT}` },
];

// Single source of truth for role identities, section IDs, and act colors.
export const ROLES: Role[] = [
  {
    label: ROLE_LABEL.NURSE,
    sectionId: ACT_NURSE,
    color: actRed,
  },
  {
    label: ROLE_LABEL.ENGINEER,
    sectionId: ACT_ENGINEER,
    color: actBlue,
  },
  {
    label: ROLE_LABEL.LEADER,
    sectionId: ACT_LEADER,
    color: actGold,
  },
  {
    label: ROLE_LABEL.BUILDER,
    sectionId: ACT_BUILDER,
    color: actGreen,
  },
];

export const PHILOSOPHY = {
  label: "How I Think",
  sectionId: PHILOSOPHY_SECTION,
  lines: [
    "Water can be a river.",
    "It can be ice. It can be the ocean.",
    "My skills don\u2019t belong to any one title.",
    "They adapt to whatever container",
    "the work demands.",
  ],
} as const;
