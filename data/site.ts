import { SECTION_ID, type SectionId, TOKENS } from "@utilities"

const { actBlue, actGold, actGreen, actRed, gold } = TOKENS
const {
  ACT_BUILDER,
  ACT_ENGINEER,
  ACT_LEADER,
  ACT_NURSE,
  CONTACT,
  PHILOSOPHY: PHILOSOPHY_SECTION,
  PORTRAIT,
} = SECTION_ID

export interface PersonalInfo {
  readonly name: string
  readonly firstName: string
  readonly lastName: string
  readonly initials: string
  readonly email: string
  readonly location: string
  readonly linkedin: string
  readonly github: string
}

const ROLE_LABEL = {
  NURSE: "Nurse",
  ENGINEER: "Engineer",
  LEADER: "Leader",
  BUILDER: "Builder",
} as const

type RoleLabel = (typeof ROLE_LABEL)[keyof typeof ROLE_LABEL]

const SECTION_NAV_LABEL = {
  WHO_AM_I: "Who Am I",
  CONTACT: "Contact",
} as const

type SectionNavLabel = (typeof SECTION_NAV_LABEL)[keyof typeof SECTION_NAV_LABEL]

const NAV_LINK_TYPE = {
  ROLE: "role",
  SECTION: "section",
} as const

interface BaseNavLink {
  sectionId: SectionId
  color: string
}

export interface RoleNavLink extends BaseNavLink {
  type: typeof NAV_LINK_TYPE.ROLE
  label: RoleLabel
}

export interface SectionNavLink extends BaseNavLink {
  type: typeof NAV_LINK_TYPE.SECTION
  label: SectionNavLabel
}

export type NavLink = RoleNavLink | SectionNavLink

export type Role = RoleNavLink

export const PERSONAL: PersonalInfo = {
  name: "Kaschief Johnson",
  firstName: "Kaschief",
  lastName: "Johnson",
  initials: "KJ",
  email: "hi@kaschief.com",
  location: "Berlin, Germany",
  linkedin: "https://linkedin.com/in/kaschief-johnson",
  github: "https://github.com/kaschief/kash-indicators",
}

// Single source of truth for top nav composition and styling.
const NAV_LINKS: readonly NavLink[] = [
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
    type: NAV_LINK_TYPE.SECTION,
    label: SECTION_NAV_LABEL.CONTACT,
    sectionId: CONTACT,
    color: gold,
  },
]

const NAV_LINKS_BY_TYPE = NAV_LINKS.reduce(
  (groups, link) => {
    if (link.type === NAV_LINK_TYPE.ROLE) {
      groups.roles.push(link)
      return groups
    }

    groups.sections.push(link)
    return groups
  },
  {
    roles: [] as RoleNavLink[],
    sections: [] as SectionNavLink[],
  },
)

export const ROLE_NAV_LINKS: readonly RoleNavLink[] = NAV_LINKS_BY_TYPE.roles
export const SECTION_NAV_LINKS: readonly SectionNavLink[] = NAV_LINKS_BY_TYPE.sections

/** All career roles — includes Builder even though it's not in nav (used by timeline data). */
export const ROLES: readonly Role[] = [
  ...ROLE_NAV_LINKS,
  { type: "role" as const, label: ROLE_LABEL.BUILDER, sectionId: ACT_BUILDER, color: actGreen },
]

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
} as const

export const PORTRAIT_CONTENT = {
  headline: ["From the bedside", "to the terminal."],
  bio: [
    "I started my career as an ICU nurse, where I learned to stay calm under pressure and make decisions that carried meaning. That instinct followed me into software engineering, then into leadership, and now into building products of my own.",
    "Each role expanded the way I think and work.",
  ],
  stats: [
    { value: "3", label: "Eras" },
    { value: "8+", label: "Years in tech" },
    { value: "5M+", label: "Users impacted" },
  ],
} as const

export const CONTACT_CONTENT = {
  paragraphs: [
    "A thread through all of my work has been noticing what others had learned to look past.",
    "That is still what I am looking for.",
    "My path has not been conventional. I am looking for a place where that is a strength, where I have room to work with some independence, and where the work itself has a positive effect.",
  ],
  coda: "Based in Berlin. Open to remote and international work. English, German, French, Spanish.",
} as const
