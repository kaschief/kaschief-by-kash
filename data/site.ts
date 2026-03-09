import { SECTION_ID, type SectionId, TOKENS } from "@utilities";

const { actBlue, actGold, actGreen, actRed, gold } = TOKENS;
const {
  ACT_BUILDER,
  ACT_ENGINEER,
  ACT_LEADER,
  ACT_NURSE,
  CONTACT,
  METHODS,
  PHILOSOPHY: PHILOSOPHY_SECTION,
  PORTRAIT,
} = SECTION_ID;

export interface PersonalInfo {
  readonly name: string;
  readonly initials: string;
  readonly email: string;
  readonly phone: string;
  readonly location: string;
  readonly linkedin: string;
  readonly github: string;
}

export const ROLE_LABEL = {
  NURSE: "Nurse",
  ENGINEER: "Engineer",
  LEADER: "Leader",
  BUILDER: "Builder",
} as const;

export type RoleLabel = (typeof ROLE_LABEL)[keyof typeof ROLE_LABEL];

export const SECTION_NAV_LABEL = {
  WHO_AM_I: "Who Am I",
  METHODS: "Methods",
  CONTACT: "Contact",
} as const;

export type SectionNavLabel =
  (typeof SECTION_NAV_LABEL)[keyof typeof SECTION_NAV_LABEL];

export const NAV_LINK_TYPE = {
  ROLE: "role",
  SECTION: "section",
} as const;

export type NavLinkType = (typeof NAV_LINK_TYPE)[keyof typeof NAV_LINK_TYPE];

interface BaseNavLink {
  sectionId: SectionId;
  color: string;
}

export interface RoleNavLink extends BaseNavLink {
  type: typeof NAV_LINK_TYPE.ROLE;
  label: RoleLabel;
}

export interface SectionNavLink extends BaseNavLink {
  type: typeof NAV_LINK_TYPE.SECTION;
  label: SectionNavLabel;
}

export type NavLink = RoleNavLink | SectionNavLink;

export type Role = RoleNavLink;

export const PERSONAL: PersonalInfo = {
  name: "Kaschief Johnson",
  initials: "KJ",
  email: "kaschiefj@gmail.com",
  phone: "+49 176 204 19325",
  location: "Berlin, Germany",
  linkedin: "https://linkedin.com/in/kaschief-johnson",
  github: "https://github.com/kaschief/kash-indicators",
};

// Single source of truth for top nav composition and styling.
export const NAV_LINKS: readonly NavLink[] = [
  {
    type: NAV_LINK_TYPE.SECTION,
    label: SECTION_NAV_LABEL.WHO_AM_I,
    sectionId: PORTRAIT,
    color: gold,
  },
  {
    type: NAV_LINK_TYPE.ROLE,
    label: ROLE_LABEL.NURSE,
    sectionId: ACT_NURSE,
    color: actRed,
  },
  {
    type: NAV_LINK_TYPE.ROLE,
    label: ROLE_LABEL.ENGINEER,
    sectionId: ACT_ENGINEER,
    color: actBlue,
  },
  {
    type: NAV_LINK_TYPE.ROLE,
    label: ROLE_LABEL.LEADER,
    sectionId: ACT_LEADER,
    color: actGold,
  },
  {
    type: NAV_LINK_TYPE.ROLE,
    label: ROLE_LABEL.BUILDER,
    sectionId: ACT_BUILDER,
    color: actGreen,
  },
  {
    type: NAV_LINK_TYPE.SECTION,
    label: SECTION_NAV_LABEL.METHODS,
    sectionId: METHODS,
    color: gold,
  },
  {
    type: NAV_LINK_TYPE.SECTION,
    label: SECTION_NAV_LABEL.CONTACT,
    sectionId: CONTACT,
    color: gold,
  },
];

const NAV_LINKS_BY_TYPE = NAV_LINKS.reduce(
  (groups, link) => {
    if (link.type === NAV_LINK_TYPE.ROLE) {
      groups.roles.push(link);
      return groups;
    }

    groups.sections.push(link);
    return groups;
  },
  {
    roles: [] as RoleNavLink[],
    sections: [] as SectionNavLink[],
  },
);

export const ROLE_NAV_LINKS: readonly RoleNavLink[] = NAV_LINKS_BY_TYPE.roles;
export const SECTION_NAV_LINKS: readonly SectionNavLink[] = NAV_LINKS_BY_TYPE.sections;

export const ROLES: readonly Role[] = ROLE_NAV_LINKS;

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
