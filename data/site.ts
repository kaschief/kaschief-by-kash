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

export interface Role {
  label: string;
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
  { label: "About", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

// Single source of truth for role identities and their act colors.
// Colors reference CSS variables defined in globals.css.
export const ROLES: Role[] = [
  { label: "Nurse", color: "var(--act-red)" },
  { label: "Engineer", color: "var(--act-blue)" },
  { label: "Leader", color: "var(--act-gold)" },
  { label: "Builder", color: "var(--act-green)" },
];
