import { type ReactNode } from "react"
import { COMPANIES, COMPANY_ID, LENS_NAMES, type CompanyId } from "@data"
export { clamp, smoothstep, lerp } from "./math"

/* ================================================================== */
/*  Seeded random                                                      */
/* ================================================================== */

/** Deterministic hash → [0,1). Same seed always returns same value.
 *  Used to generate stable random-looking positions/sizes without Math.random().
 *  The numeric constants (127.1, 311.7, 43758.5453) are from the standard GLSL
 *  sin-hash trick — they produce good distribution and must not be changed, as
 *  all fragment/ember positions depend on them. Callers vary input with prime
 *  multipliers (e.g. seed * 7.3, seed * 11.1) to get uncorrelated outputs for
 *  different properties (x, y, rotation, etc.) from the same base seed. */
export function hashToUnit(seed: number): number {
  return (((Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453) % 1) + 1) % 1
}
/* srand alias removed — use hashToUnit directly (P1.5) */

/* ================================================================== */
/*  Colors                                                             */
/* ================================================================== */

export const ACT_BLUE = "#5B9EC2"

/** Roles per company — derived from canonical COMPANIES data */
export const COMPANY_ROLES: Record<string, string> = Object.fromEntries(
  COMPANIES.map((c) => [c.shortName, c.promotedRole]),
)

/** Base RGB palette (4 company colors) — single source of truth for rgba() and hex.
 *  Indexed positionally: 0=AMBOSS, 1=Compado, 2=CAPinside, 3=DKB.
 *  Kept as a positional array for backward compatibility — many consumers index by number. */
export const CC: readonly [number, number, number][] = [
  [96, 165, 250], // blue  — AMBOSS
  [66, 184, 131], // green — Compado
  [6, 182, 212], // cyan  — CAPinside
  [244, 114, 182], // pink  — DKB
]

/** Company index → CompanyId mapping (preserves CC positional order) */
export const COMPANY_IDS_ORDERED: readonly CompanyId[] = [
  COMPANY_ID.AMBOSS,
  COMPANY_ID.COMPADO,
  COMPANY_ID.CAPINSIDE,
  COMPANY_ID.DKB,
] as const

/** RGB palette keyed by CompanyId — type-safe alternative to positional CC access */
export const COMPANY_RGB: Readonly<Record<CompanyId, readonly [number, number, number]>> = {
  [COMPANY_ID.AMBOSS]: [96, 165, 250],
  [COMPANY_ID.COMPADO]: [66, 184, 131],
  [COMPANY_ID.CAPINSIDE]: [6, 182, 212],
  [COMPANY_ID.DKB]: [244, 114, 182],
}

/** Hex colors derived from CC — for CSS color properties */
export const COMPANY_COLORS = CC.map(
  ([r, g, b]) =>
    `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
) as unknown as readonly string[]

/** Extended RGB palette for fragments — base 4 + extra variety */
const CC_EXTRA = [
  [224, 82, 82], // red (act-red)
  [139, 92, 246], // purple
  [245, 158, 11], // amber
  [94, 187, 115], // emerald
]
export const CC_EXT = [...CC, ...CC_EXTRA]

export function fc(ci: number, a: number): string {
  const [r, g, b] = CC[ci % CC.length]
  return `rgba(${r},${g},${b},${a})`
}

/** Fragment color — uses extended palette */
export function fcExt(ci: number, a: number): string {
  const [r, g, b] = CC_EXT[ci % CC_EXT.length]
  return `rgba(${r},${g},${b},${a})`
}

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface FragmentBase {
  companyIdx: number
  isSeed: boolean
  /** Initial X position (vw offset from center) */
  x0: number
  /** Initial Y position (vh offset from center) */
  y0: number
  /** Horizontal drift distance during scroll (vw) */
  dx: number
  /** Vertical drift distance during scroll (vh) */
  dy: number
  /** Initial rotation in degrees */
  rot: number
  /** Scroll progress [0–1] at which dissolve blur begins */
  dissolveStart: number
  /** Scroll progress [0–1] at which dissolve blur completes */
  dissolveEnd: number
}

export interface TextFrag extends FragmentBase {
  type: "phrase" | "tag" | "seed"
  text: string
  size: number
  weight: number
}

export interface CodeFrag extends FragmentBase {
  type: "code"
  code: string
  size: number
}

export interface LogoFrag extends FragmentBase {
  type: "logo"
  logoKey: string
  label: string
  logoSize: number
}

export interface CommandFrag extends FragmentBase {
  type: "command"
  cmd: string
  size: number
}

export type Fragment = TextFrag | CodeFrag | LogoFrag | CommandFrag

/* BeatData + WhisperData interfaces removed — unused (P1.5) */

export interface PrincipleData {
  text: string
  companyIdx: number
  yOffset: number
}

export interface EmberData {
  x0: number
  y0: number
  dx: number
  speed: number
  size: number
  delay: number
}

/* ================================================================== */
/*  Logo SVGs                                                          */
/* ================================================================== */

export const LOGOS: Record<string, ReactNode> = {
  react: (
    <path
      d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"
      fill="#61DAFB"
    />
  ),

  vue: (
    <path
      d="M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z"
      fill="#4FC08D"
    />
  ),

  typescript: (
    <path
      d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
      fill="#3178C6"
    />
  ),

  git: (
    <path
      d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"
      fill="#F05032"
    />
  ),

  nextjs: (
    <path
      d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z"
      fill="white"
    />
  ),

  playwright: (
    <>
      <path
        d="M9.7126 15.915175V14.388l-4.243175 1.2032s.313525-1.82175 2.526475-2.4495c.6711-.1902 1.2437-.1889 1.7167-.09755V6.780125h2.124575c-.231325-.714825-.4551-1.26515-.64305-1.64755-.310925-.632925-.62965-.21335-1.35325.39185-.50965.425775-1.797675 1.33405-3.7359 1.85635-1.938275.522625-3.50525.384025-4.15906.2708-.9268825-.1599-1.4116925-.36345-1.3663375.34155.03947.621825.187595 1.58595.5268925 2.859275C1.8405325 13.609875 4.266525 18.9232 8.85135 17.68835c1.197625-.3227 2.04295-.960525 2.6289-1.7735h-1.76765v.000325ZM2.8657 10.8903l3.258275-.858375s-.094975 1.25345-1.316425 1.57545c-1.221825.321675-1.94185-.717075-1.94185-.717075Z"
        fill="#E2574C"
      />
      <path
        d="M21.975075 6.8525c-.84695.148475-2.878875.33345-5.389975-.339625-2.5118-.672675-4.17835-1.849175-4.838625-2.402175-.936-.783975-1.347725-1.328825-1.752925-.5047-.358225.726875-.816325 1.909875-1.259725 3.565925-.960775 3.586125-1.67885 11.15385 4.260525 12.7463 5.938125 1.591125 9.09945-5.322175 10.0603-8.908625.4434-1.655725.637825-2.9095.691325-3.717925.061-.915775-.568025-.64995-1.7709-.439175ZM10.0418 9.81945s.936-1.45575 2.523525-1.00455c1.588525.451225 1.711525 2.207425 1.711525 2.207425l-4.23505-1.202875ZM13.917 16.352c-2.79235-.817975-3.223-3.04465-3.223-3.04465l7.501125 2.0972s-1.5141 1.755175-4.278125.94745Zm2.6521-4.57605s.9347-1.45475 2.521925-1.00225c1.587175.4519 1.71215 2.2081 1.71215 2.2081l-4.234075-1.20585Z"
        fill="#2EAD33"
      />
    </>
  ),

  jest: (
    <path
      d="M22.251 11.82a3.117 3.117 0 0 0-2.328-3.01L22.911 0H8.104L11.1 8.838a3.116 3.116 0 0 0-2.244 2.988c0 1.043.52 1.967 1.313 2.536a8.279 8.279 0 0 1-1.084 1.244 8.14 8.14 0 0 1-2.55 1.647c-.834-.563-1.195-1.556-.869-2.446a3.11 3.11 0 0 0-.91-6.08 3.117 3.117 0 0 0-3.113 3.113c0 .848.347 1.626.903 2.182-.048.097-.097.195-.146.299-.465.959-.993 2.043-1.195 3.259-.403 2.432.257 4.384 1.849 5.489A5.093 5.093 0 0 0 5.999 24c1.827 0 3.682-.917 5.475-1.807 1.279-.632 2.599-1.292 3.898-1.612.48-.118.98-.187 1.508-.264 1.07-.153 2.175-.312 3.168-.89a4.482 4.482 0 0 0 2.182-3.091c.174-.994 0-1.994-.444-2.87.298-.48.465-1.042.465-1.647zm-1.355 0c0 .965-.785 1.75-1.75 1.75a1.753 1.753 0 0 1-1.085-3.126l.007-.007c.056-.042.118-.084.18-.125 0 0 .008 0 .008-.007.028-.014.055-.035.083-.05.007 0 .014-.006.021-.006.028-.014.063-.028.097-.042.035-.014.07-.027.098-.041.007 0 .013-.007.02-.007.028-.007.056-.021.084-.028.007 0 .02-.007.028-.007.034-.007.062-.014.097-.02h.007l.104-.022c.007 0 .02 0 .028-.007.028 0 .055-.007.083-.007h.035c.035 0 .07-.007.111-.007h.09c.028 0 .05 0 .077.007h.014c.055.007.111.014.167.028a1.766 1.766 0 0 1 1.396 1.723zM10.043 1.39h10.93l-2.509 7.4c-.104.02-.208.055-.312.09l-2.64-5.385-2.648 5.35c-.104-.034-.216-.055-.327-.076l-2.494-7.38zm4.968 9.825a3.083 3.083 0 0 0-.938-1.668l1.438-2.904 1.452 2.967c-.43.43-.743.98-.868 1.605H15.01zm-3.481-1.098c.034-.007.062-.014.097-.02h.02c.029-.008.056-.008.084-.015h.028c.028 0 .049-.007.076-.007h.271c.028 0 .049.007.07.007.014 0 .02 0 .035.007.027.007.048.007.076.014.007 0 .014 0 .028.007l.097.02h.007c.028.008.056.015.083.029.007 0 .014.007.028.007.021.007.049.014.07.027.007 0 .014.007.02.007.028.014.056.021.084.035h.007a.374.374 0 0 1 .09.049h.007c.028.014.056.034.084.048.007 0 .007.007.013.007.028.014.05.035.077.049l.007.007c.083.062.16.132.236.201l.007.007a1.747 1.747 0 0 1 .48 1.209 1.752 1.752 0 0 1-3.502 0 1.742 1.742 0 0 1 1.32-1.695zm-6.838-.049c.966 0 1.751.786 1.751 1.751s-.785 1.751-1.75 1.751-1.752-.785-1.752-1.75.786-1.752 1.751-1.752zm16.163 6.025a3.07 3.07 0 0 1-1.508 2.133c-.758.438-1.689.577-2.669.716a17.29 17.29 0 0 0-1.64.291c-1.445.355-2.834 1.05-4.182 1.717-1.724.854-3.35 1.66-4.857 1.66a3.645 3.645 0 0 1-2.154-.688c-1.529-1.056-1.453-3.036-1.272-4.12.167-1.015.632-1.966 1.077-2.877.028-.055.049-.104.077-.16.152.056.312.098.479.126-.264 1.473.486 2.994 1.946 3.745l.264.139.284-.104c1.216-.431 2.342-1.133 3.336-2.071a9.334 9.334 0 0 0 1.445-1.716c.16.027.32.034.48.034a3.117 3.117 0 0 0 3.008-2.327h1.167a3.109 3.109 0 0 0 3.01 2.327c.576 0 1.11-.16 1.57-.43.18.52.236 1.063.139 1.605z"
      fill="#C21325"
    />
  ),

  sentry: (
    <path
      d="M13.91 2.505c-.873-1.448-2.972-1.448-3.844 0L6.904 7.92a15.478 15.478 0 0 1 8.53 12.811h-2.221A13.301 13.301 0 0 0 5.784 9.814l-2.926 5.06a7.65 7.65 0 0 1 4.435 5.848H2.194a.365.365 0 0 1-.298-.534l1.413-2.402a5.16 5.16 0 0 0-1.614-.913L.296 19.275a2.182 2.182 0 0 0 .812 2.999 2.24 2.24 0 0 0 1.086.288h6.983a9.322 9.322 0 0 0-3.845-8.318l1.11-1.922a11.47 11.47 0 0 1 4.95 10.24h5.915a17.242 17.242 0 0 0-7.885-15.28l2.244-3.845a.37.37 0 0 1 .504-.13c.255.14 9.75 16.708 9.928 16.9a.365.365 0 0 1-.327.543h-2.287c.029.612.029 1.223 0 1.831h2.297a2.206 2.206 0 0 0 1.922-3.31z"
      fill="#8B6CC1"
    />
  ),

  node: (
    <path
      d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z"
      fill="#5FA04E"
    />
  ),

  figma: (
    <path
      d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"
      fill="#F24E1E"
    />
  ),

  jira: (
    <path
      d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z"
      fill="#4A90D9"
    />
  ),

  miro: (
    <path
      d="M17.392 0H13.9L17 4.808 10.444 0H6.949l3.102 6.3L3.494 0H0l3.05 8.131L0 24h3.494L10.05 6.985 6.949 24h3.494L17 5.494 13.899 24h3.493L24 3.672 17.392 0z"
      fill="#FFD02F"
    />
  ),

  anthropic: (
    <g transform="scale(0.0469)">
      <path
        fill="#D77655"
        d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"
      />
      <path
        fill="#FCF2EE"
        fillRule="nonzero"
        d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474z"
      />
    </g>
  ),

  webpack: (
    <path
      d="M22.1987 18.498l-9.7699 5.5022v-4.2855l6.0872-3.3338 3.6826 2.117zm.6683-.6026V6.3884l-3.5752 2.0544v7.396zm-21.0657.6026l9.7699 5.5022v-4.2855L5.484 16.3809l-3.6826 2.117zm-.6683-.6026V6.3884l3.5751 2.0544v7.396zm.4183-12.2515l10.0199-5.644v4.1434L5.152 7.6586l-.0489.028zm20.8975 0l-10.02-5.644v4.1434l6.4192 3.5154.0489.028 3.5518-2.0427zm-10.8775 13.096l-6.0056-3.2873V8.9384l6.0054 3.4525v6.349zm.8575 0l6.0053-3.2873V8.9384l-6.0053 3.4525zM5.9724 8.1845l6.0287-3.3015L18.03 8.1845l-6.0288 3.4665z"
      fill="#8DD6F9"
    />
  ),

  lighthouse: (
    <path
      d="M12 0l5.5 3.5v5H20v3h-2.25l2 12.5H4.25l2-12.5H4v-3h2.5V3.53zm2.94 13.25l-6.22 2.26L8 20.04l7.5-2.75zM12 3.56L9.5 5.17V8.5h5V5.15Z"
      fill="#F44B21"
    />
  ),

  css: (
    <path
      d="M0 0v20.16A3.84 3.84 0 0 0 3.84 24h16.32A3.84 3.84 0 0 0 24 20.16V3.84A3.84 3.84 0 0 0 20.16 0Zm14.256 13.08c1.56 0 2.28 1.08 2.304 2.64h-1.608c.024-.288-.048-.6-.144-.84-.096-.192-.288-.264-.552-.264-.456 0-.696.264-.696.84-.024.576.288.888.768 1.08.72.288 1.608.744 1.92 1.296q.432.648.432 1.656c0 1.608-.912 2.592-2.496 2.592-1.656 0-2.4-1.032-2.424-2.688h1.68c0 .792.264 1.176.792 1.176.264 0 .456-.072.552-.24.192-.312.24-1.176-.048-1.512-.312-.408-.912-.6-1.32-.816q-.828-.396-1.224-.936c-.24-.36-.36-.888-.36-1.536 0-1.44.936-2.472 2.424-2.448m5.4 0c1.584 0 2.304 1.08 2.328 2.64h-1.608c0-.288-.048-.6-.168-.84-.096-.192-.264-.264-.528-.264-.48 0-.72.264-.72.84s.288.888.792 1.08c.696.288 1.608.744 1.92 1.296.264.432.408.984.408 1.656.024 1.608-.888 2.592-2.472 2.592-1.68 0-2.424-1.056-2.448-2.688h1.68c0 .744.264 1.176.792 1.176.264 0 .456-.072.552-.24.216-.312.264-1.176-.048-1.512-.288-.408-.888-.6-1.32-.816-.552-.264-.96-.576-1.2-.936s-.36-.888-.36-1.536c-.024-1.44.912-2.472 2.4-2.448m-11.031.018c.711-.006 1.419.198 1.839.63.432.432.672 1.128.648 1.992H9.336c.024-.456-.096-.792-.432-.96-.312-.144-.768-.048-.888.24-.12.264-.192.576-.168.864v3.504c0 .744.264 1.128.768 1.128a.65.65 0 0 0 .552-.264c.168-.24.192-.552.168-.84h1.776c.096 1.632-.984 2.712-2.568 2.688-1.536 0-2.496-.864-2.472-2.472v-4.032c0-.816.24-1.44.696-1.848.432-.408 1.146-.624 1.857-.63"
      fill="#42A5F5"
    />
  ),

  vscode: (
    <g transform="scale(0.25) translate(0, 0)">
      <mask id="vsc-a" width="94" height="94" x="1" y="1" maskUnits="userSpaceOnUse">
        <path
          fill="#fff"
          d="M67.657 94.358c1.48.577 3.169.54 4.663-.179l19.353-9.312C93.707 83.888 95 81.83 95 79.572V16.428c0-2.258-1.293-4.316-3.327-5.295l-19.353-9.312c-1.961-.944-4.256-.713-5.977.539-.246.178-.48.378-.7.598L28.594 36.76 12.456 24.509c-1.502-1.14-3.604-1.047-4.999.222l-5.176 4.708c-1.707 1.552-1.709 4.237-.004 5.792L16.272 48 2.277 60.768c-1.704 1.555-1.702 4.24.004 5.792l5.176 4.708c1.395 1.27 3.497 1.363 4.999.223l16.138-12.25L65.643 93.042c.586.586 1.274 1.028 2.014 1.316Zm3.857-67.697-28.112 21.339 28.112 21.339V26.661Z"
        />
      </mask>
      <g mask="url(#vsc-a)">
        <path
          fill="#0065a9"
          d="M91.731 11.148 72.363 1.823c-2.242-1.079-4.921-.624-6.681 1.135L2.278 60.768c-1.705 1.555-1.703 4.24.004 5.792l5.179 4.708c1.396 1.27 3.499 1.363 5.002.223L88.816 13.568c2.562-1.943 6.241-.116 6.241 3.099v-.225c0-2.257-1.293-4.314-3.326-5.293Z"
        />
        <path
          fill="#007acc"
          d="m91.731 84.851-19.368 9.325c-2.242 1.08-4.921.624-6.681-1.135L2.278 35.231c-1.705-1.555-1.703-4.24.004-5.792l5.179-4.708c1.396-1.27 3.499-1.363 5.002-.222l76.353 57.923c2.562 1.943 6.241.116 6.241-3.099v.225c0 2.257-1.293 4.314-3.326 5.293Z"
        />
        <path
          fill="#1f9cf0"
          d="M72.32 94.178c-2.242 1.08-4.921.624-6.68-1.135a4.4 4.4 0 0 0 1.868.413h.001c1.662 0 3.258-.903 4.085-2.478V2.98c0-1.574-.421-2.477-2.083-2.477-.64 0-2.205.24-3.87 1.32l19.368 9.326C87.042 12.228 88.335 14.286 88.335 16.543v62.914c0 2.258-1.293 4.316-3.326 5.295Z"
        />
      </g>
    </g>
  ),

  chatgpt: (
    <g transform="scale(0.075)">
      <path
        d="m297.06 130.97c7.26-21.79 4.76-45.66-6.85-65.48-17.46-30.4-52.56-46.04-86.84-38.68-15.25-17.18-37.16-26.95-60.13-26.81-35.04-.08-66.13 22.48-76.91 55.82-22.51 4.61-41.94 18.7-53.31 38.67-17.59 30.32-13.58 68.54 9.92 94.54-7.26 21.79-4.76 45.66 6.85 65.48 17.46 30.4 52.56 46.04 86.84 38.68 15.24 17.18 37.16 26.95 60.13 26.8 35.06.09 66.16-22.49 76.94-55.86 22.51-4.61 41.94-18.7 53.31-38.67 17.57-30.32 13.55-68.51-9.94-94.51zm-120.28 168.11c-14.03.02-27.62-4.89-38.39-13.88.49-.26 1.34-.73 1.89-1.07l63.72-36.8c3.26-1.85 5.26-5.32 5.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zm-128.84-55.03c-7.03-12.14-9.56-26.37-7.15-40.18.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83l-64.41 37.19c-28.69 16.52-65.33 6.7-81.92-21.95zm-16.77-139.09c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91-26.93 15.55c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94-7.01 12.14-18.05 21.44-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8c-3.23-1.89-7.23-1.89-10.47 0l-77.79 44.92v-31.1c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22 6.99 12.12 9.52 26.31 7.15 40.1zm-168.51 55.43-26.94-15.55c-.29-.14-.48-.42-.52-.74v-74.39c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07l-63.72 36.8c-3.26 1.85-5.26 5.31-5.24 9.06l-.04 89.79zm14.63-31.54 34.65-20.01 34.65 20v40.01l-34.65 20-34.65-20z"
        fill="#10A37F"
      />
    </g>
  ),

  /* Company logos — hand-drawn at 24x24 */
  amboss: (
    <g transform="scale(1.05) translate(0.5, 0.5)">
      <path
        d="M17.4788 21.3322H4.99195l.78912-1.4388H16.6897l.7891 1.4388ZM12.8926 6.92824l6.3223 11.52646h-1.6664l-4.6651-8.50512-.824 1.50192 3.8413 7.0032H6.57019l6.32241-11.52646ZM21.6519 19.8934L12.8833 3.90691l-.8147 1.51905L4.9222 18.4547H3.25582l8.80338-16.05046-.824-1.50196L.81871 19.8934h3.31437L2.55484 22.7709h17.361L18.3376 19.8934h3.3143Z"
        fill="#0AA6B8"
      />
    </g>
  ),

  compado: (
    <>
      <path
        d="M3 5.5 C3 4 4 3 5.5 3 L18.5 3 C20 3 21 4 21 5.5 L21 15.5 C21 17 20 18 18.5 18 L10 18 L7 21 L7 18 L5.5 18 C4 18 3 17 3 15.5 Z"
        stroke="#42B883"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M8.5 9.5 L11.5 9.5 M10.5 8.5 L11.5 9.5 L10.5 10.5"
        stroke="#42B883"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M15.5 12 L12.5 12 M13.5 11 L12.5 12 L13.5 13"
        stroke="#42B883"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  capinside: (
    <g transform="scale(0.428) translate(0, -0.5)">
      <path
        d="M.115 25.863H26.44V0H.115v25.863Zm2.659-2.612H23.78V2.612H2.774v20.639ZM55.906 0H29.583v25.863h9.041v6.041l6.924-6.04h10.358V0Zm-2.658 2.612v20.639h-8.71l-.755.659-2.5 2.18v-2.839h-9.041V2.612h21.006Z"
        fill="white"
      />
    </g>
  ),

  dkb: (
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="#148DEA"
      fontSize="11"
      fontWeight="900"
      fontFamily="var(--font-sans)"
      letterSpacing="0.08em">
      DKB
    </text>
  ),
}

/* ================================================================== */
/*  Data factories                                                     */
/* ================================================================== */

/** Fragment grid layout — prevents overlapping by assigning to grid cells */
const FRAGMENT_GRID = {
  cols: 12,
  rows: 10,
  widthVw: 82, // total grid width in vw (centered)
  heightVh: 72, // total grid height in vh (centered)
  originX: -41, // left edge offset from center (half of width)
  originY: -36, // top edge offset from center (half of height)
  jitterFactor: 0.6, // jitter as fraction of cell size
  maxDriftX: 24, // max horizontal drift in vw
  maxDriftY: 20, // max vertical drift in vh
  maxRotation: 30, // max initial rotation in degrees
  maxAttempts: 20, // max retries to find unused cell
} as const

/** Dissolve ranges per fragment type (scroll progress fractions) */
const DISSOLVE = {
  default: { start: 0.22, end: 0.32 },
  code: { start: 0.23, end: 0.33 },
  logo: { start: 0.18, end: 0.28 },
  command: { start: 0.2, end: 0.3 },
  tagEarly: { start: 0.19, end: 0.29 }, // tags that dissolve slightly before others
} as const

/** Default sizes and weights per fragment type */
const FRAGMENT_DEFAULTS = {
  codeSize: 0.65,
  cmdSize: 0.65,
  tagSize: 0.65,
  tagWeight: 500,
  logoSize: 34, // default logo size in px
  companyLogo: 38, // company logo size (slightly larger)
  seedSize: 1.05,
  seedWeight: 600,
} as const

/** Principle card layout */
const PRINCIPLE_LAYOUT = {
  spacingVh: 11, // vertical spacing between cards
  centerOffset: 1.5, // centering offset (places 4 cards around center)
} as const

export function createFragments(): Fragment[] {
  const frags: Fragment[] = []
  let s = 0

  const usedCells = new Set<number>()
  const G = FRAGMENT_GRID
  const cellW = G.widthVw / G.cols
  const cellH = G.heightVh / G.rows

  function pos() {
    s++
    // Find an unused grid cell, with jitter for natural look
    let cell: number
    let attempts = 0
    do {
      cell = Math.floor(hashToUnit(s * 7.1 + attempts * 3.3) * G.cols * G.rows)
      attempts++
    } while (usedCells.has(cell) && attempts < G.maxAttempts)
    usedCells.add(cell)
    const col = cell % G.cols
    const row = Math.floor(cell / G.cols)
    const jitterX = (hashToUnit(s * 11.7) - 0.5) * cellW * G.jitterFactor
    const jitterY = (hashToUnit(s * 17.3) - 0.5) * cellH * G.jitterFactor
    return {
      x0: G.originX + col * cellW + cellW / 2 + jitterX,
      y0: G.originY + row * cellH + cellH / 2 + jitterY,
      dx: (hashToUnit(s * 3.7) - 0.5) * G.maxDriftX,
      dy: (hashToUnit(s * 5.3) - 0.5) * G.maxDriftY,
      rot: (hashToUnit(s * 11.1) - 0.5) * G.maxRotation,
    }
  }

  // Cycle through extended palette evenly
  let colorIdx = 0
  const randColor = () => {
    const c = colorIdx % CC_EXT.length
    colorIdx++
    return c
  }

  // _ci kept for call-site consistency with logo() which uses its company index
  const D = DISSOLVE
  const FD = FRAGMENT_DEFAULTS
  const text = (
    t: string,
    _ci: number,
    kind: TextFrag["type"],
    size: number,
    weight: number = 400,
    ds: number = D.default.start,
    de: number = D.default.end,
  ): TextFrag => ({
    type: kind,
    text: t,
    companyIdx: randColor(),
    isSeed: kind === "seed",
    size,
    weight,
    dissolveStart: ds,
    dissolveEnd: de,
    ...pos(),
  })
  const code = (c: string, _ci: number, size: number = FD.codeSize): CodeFrag => ({
    type: "code",
    code: c,
    companyIdx: randColor(),
    isSeed: false,
    size,
    dissolveStart: D.code.start,
    dissolveEnd: D.code.end,
    ...pos(),
  })
  const logo = (
    key: string,
    ci: number,
    label: string,
    logoSize: number = FD.logoSize,
  ): LogoFrag => ({
    type: "logo",
    logoKey: key,
    label,
    companyIdx: ci,
    isSeed: false,
    logoSize,
    dissolveStart: D.logo.start,
    dissolveEnd: D.logo.end,
    ...pos(),
  })
  const cmd = (c: string, _ci: number, size: number = FD.cmdSize): CommandFrag => ({
    type: "command",
    cmd: c,
    companyIdx: randColor(),
    isSeed: false,
    size,
    dissolveStart: D.command.start,
    dissolveEnd: D.command.end,
    ...pos(),
  })

  // Companies (logos instead of text)
  frags.push(logo("amboss", 0, "AMBOSS", FD.companyLogo))
  frags.push(logo("compado", 1, "Compado", FD.companyLogo))
  frags.push(logo("capinside", 2, "CAPinside", FD.companyLogo))
  frags.push(logo("dkb", 3, "", FD.companyLogo))

  // Phrases
  frags.push(text("500K students", 0, "phrase", 0.85))
  frags.push(text("A/B experiments", 0, "phrase", 0.8))
  frags.push(text("beta to production", 0, "phrase", 0.75))
  frags.push(text("page speed", 1, "phrase", 0.85))
  frags.push(text("conversion flows", 1, "phrase", 0.8))
  frags.push(text("organic traffic", 1, "phrase", 0.75))
  frags.push(text("legacy rewrite", 2, "phrase", 0.85))
  frags.push(text("10K advisors", 2, "phrase", 0.8))
  frags.push(text("migration paths", 2, "phrase", 0.75))
  frags.push(text("banking platform", 3, "phrase", 0.85))
  frags.push(text("test automation", 3, "phrase", 0.8))
  frags.push(text("weekly deploys", 3, "phrase", 0.75))
  frags.push(text("5M users", 3, "phrase", 0.9, 500))
  frags.push(text("micro-frontends", 3, "phrase", 0.75))

  // Tags (only ones that DON'T have a logo equivalent)
  frags.push(
    text("Performance", 1, "tag", FD.tagSize, FD.tagWeight, D.command.start, D.command.end),
  )
  frags.push(text("Med-Ed", 0, "tag", FD.tagSize, FD.tagWeight, D.tagEarly.start, D.tagEarly.end))
  frags.push(text("Fintech", 2, "tag", FD.tagSize, FD.tagWeight, D.command.start, D.command.end))
  frags.push(text("Banking", 3, "tag", FD.tagSize, FD.tagWeight, D.command.start, D.command.end))
  frags.push(text("SEO", 1, "tag", FD.tagSize, FD.tagWeight, D.tagEarly.start, D.tagEarly.end))

  // Code
  frags.push(code("const isReady = await pipeline.validate()", 3))
  frags.push(code("useEffect(() => { fetchData() }, [])", 0))
  frags.push(code("describe('payment flow', () => {", 3))
  frags.push(code("expect(loadTime).toBeLessThan(300)", 1))
  frags.push(code("<DataGrid columns={schema} />", 2))
  frags.push(code("interface Advisor { id: string }", 2))
  frags.push(code("const metrics = useWebVitals()", 1))
  frags.push(code("render(<StudyFlow variant={B} />)", 0))
  frags.push(code("await page.goto('/dashboard')", 3))
  frags.push(code("export function migrate(legacy: Schema)", 2))

  // Logos — every logo gets a label for clarity
  frags.push(logo("react", 0, "React", 34))
  frags.push(logo("vue", 1, "Vue", 34))
  frags.push(logo("typescript", 2, "TypeScript", 32))
  frags.push(logo("git", 0, "Git", 30))
  frags.push(logo("nextjs", 3, "Next.js", 32))
  frags.push(logo("playwright", 3, "Playwright", 30))
  frags.push(logo("jest", 3, "Jest", 30))
  frags.push(logo("sentry", 1, "Sentry", 30))
  frags.push(logo("lighthouse", 0, "Lighthouse", 30))
  frags.push(logo("css", 1, "CSS", 30))
  frags.push(logo("node", 3, "Node.js", 30))
  frags.push(logo("webpack", 3, "Webpack", 28))
  frags.push(logo("vscode", 0, "VS Code", 30))
  frags.push(logo("anthropic", 3, "Claude", 30))
  frags.push(logo("chatgpt", 3, "ChatGPT", 30))
  frags.push(logo("miro", 1, "Miro", 30))
  frags.push(logo("figma", 2, "Figma", 30))
  frags.push(logo("jira", 3, "Jira", 30))

  // Commands
  frags.push(cmd("git push origin main", 0))
  frags.push(cmd("npx playwright test --headed", 3))
  frags.push(cmd("npm run build && npm run deploy", 1))
  frags.push(cmd("jest --coverage --watchAll", 3))
  frags.push(cmd("lighthouse https://app.amboss.com", 0))

  // Seeds — cycle through all 4 company colors for variety
  let seedColorIdx = 0
  COMPANIES.forEach((c) => {
    c.distillation.seedWords.forEach((w) => {
      frags.push(text(w, seedColorIdx % 4, "seed", FD.seedSize, FD.seedWeight))
      seedColorIdx++
    })
  })

  return frags
}

/* BEATS array removed — page.tsx uses TERM_COMPANIES + COMPANIES from @data (P1.5) */
/* createWhispers removed — was never imported (P1.5) */

export function createPrinciples(): PrincipleData[] {
  return COMPANIES.map((c, i) => ({
    text: c.distillation.principle,
    companyIdx: i,
    yOffset: (i - PRINCIPLE_LAYOUT.centerOffset) * PRINCIPLE_LAYOUT.spacingVh,
  }))
}

/** Ember spawn layout — tiny rising sparks during convergence phase */
const EMBER_SPAWN = {
  count: 20,
  seedOffset: 50, // hash seed offset to avoid colliding with fragment seeds
  spreadX: 60, // horizontal spread in vw
  spreadY: 40, // vertical spread in vh
  originY: 10, // vertical offset from center
  driftX: 8, // horizontal drift range in vw
  speedMin: 15, // minimum rise speed
  speedRange: 30, // additional random speed
  sizeMin: 1.5, // minimum size in px
  sizeRange: 3, // additional random size
  maxDelay: 0.08, // max stagger delay (scroll fraction)
} as const

export function createEmbers(): EmberData[] {
  const E = EMBER_SPAWN
  return Array.from({ length: E.count }, (_, i) => ({
    x0: (hashToUnit((i + E.seedOffset) * 7.3) - 0.5) * E.spreadX,
    y0: hashToUnit((i + E.seedOffset) * 11.1) * E.spreadY + E.originY,
    dx: (hashToUnit((i + E.seedOffset) * 3.9) - 0.5) * E.driftX,
    speed: hashToUnit((i + E.seedOffset) * 5.7) * E.speedRange + E.speedMin,
    size: hashToUnit((i + E.seedOffset) * 9.1) * E.sizeRange + E.sizeMin,
    delay: hashToUnit((i + E.seedOffset) * 2.3) * E.maxDelay,
  }))
}

/* ================================================================== */
/*  Content — all user-facing text, no hardcoded strings in JSX        */
/* ================================================================== */

/** All visible text in the Act II scroll experience */
export const CONTENT = {
  /** Thesis sentence — keywords are animated individually */
  thesis: {
    prefix: "Each of my past roles sharpened a different part of how I think about ",
    keywords: LENS_NAMES,
    conjunction: "and\u00A0", // non-breaking space before last keyword
  },

  /** Terminal chrome */
  terminal: {
    header: "~/career \u2014 zsh",
  },

  /** Convergence point label (desktop SVG + mobile) */
  convergenceLabel: "The Engineer I Became",

  /** Page chrome / debug title */
  pageTitle: "Engineer-Candidate",

  /** Summary / closing narrator paragraphs */
  summary: {
    block1:
      "What pulled me toward engineering was already there in nursing. ICU taught me that I liked complexity, troubleshooting, and understanding how different parts of a system affect each other.",
    block2: "That way of thinking carried naturally into engineering.",
  },

  /** Glass narrator panels alongside funnel tiers */
  funnelNarrator: [
    "It started with an instinct from the ward \u2014 watching how people actually behave under pressure, not how you imagine they will. That instinct found its first codebase.",
    "The tools multiplied. Each one resharpened the instinct. Vue for speed. React for structure. Lighthouse for the milliseconds that separate staying from leaving.",
    "Somewhere along the way, the code stopped being the point. The codebase became a mirror \u2014 reflecting how teams communicate, where habits calcify, what nobody dares to touch.",
    "At scale, every stream thickened. Testing, architecture, design systems, product partnership. The question shifted from what to build to what to protect.",
  ] as readonly string[],

  /** Terminal narrative panels (scene/action/shift per company) */
  terminalNarratives: [
    {
      scene:
        "Half a million medical students. I came from the ward \u2014 I knew what it felt like when the system you depend on doesn\u2019t understand your context.",
      action:
        "Migrated vanilla JS to React. Introduced A/B testing. Broke production once \u2014 learned testing discipline.",
      shift:
        "The gap between \u2018works technically\u2019 and \u2018works for the person\u2019 is where most products fail.",
    },
    {
      scene:
        "Sites were replicas of each other. Every change meant touching six copies. Visitors arrived from search with zero loyalty.",
      action:
        "Rebuilt as swappable components. Attacked load times: Lighthouse, lazy loading, CSS compression. Built first chatbot interface.",
      shift: "Every millisecond is a user who stays or leaves.",
    },
    {
      scene:
        "Ten thousand financial advisors on a fragile platform. Nobody reviewed code. Tests were sparse. TypeScript was new to me.",
      action:
        "Started seeing the codebase as a record of how the team communicated. Every shortcut was a frozen habit.",
      shift: "You can\u2019t fix code without fixing process.",
    },
    {
      scene:
        "Germany\u2019s largest direct bank. Five million users. Monthly releases. Zero automated tests when I arrived.",
      action:
        "Introduced Playwright. Monthly to weekly releases. Feature flags. Found myself in the product room shaping what got built.",
      shift: "Confidence to ship weekly comes from tests, not from courage.",
    },
  ] as const,
} as const

/* BEAT_RANGES removed — was never imported (P1.5) */

/* ================================================================== */
/*  Phase labels                                                       */
/* ================================================================== */

const PHASES = [
  { s: 0, l: "" },
  { s: 0.04, l: "RAW" },
  { s: 0.15, l: "HEAT" },
  { s: 0.22, l: "SMELT" },
  { s: 0.28, l: "THESIS" },
  { s: 0.35, l: "SIGHT" },
  { s: 0.88, l: "CRYSTALLIZE" },
] as const

export function phaseLabel(p: number): string {
  let l = ""
  for (const ph of PHASES) if (p >= ph.s) l = ph.l
  return l
}
