import { ROLES } from "./site"
const [nurseRole, engineerRole, leaderRole, builderRole] = ROLES

/* ------------------------------------------------------------------ */
/*  Company identity                                                   */
/* ------------------------------------------------------------------ */

export const COMPANY_ID = {
  AMBOSS: "amboss",
  COMPADO: "compado",
  CAPINSIDE: "capinside",
  DKB: "dkb",
} as const

export type CompanyId = (typeof COMPANY_ID)[keyof typeof COMPANY_ID]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Job {
  readonly id: string
  readonly company: string
  readonly role: string
  readonly period: string
  readonly location: string
  readonly color: string
  readonly tech: readonly string[]
  readonly summary: string
  readonly url: string
  readonly deepDive: {
    readonly context: string
    readonly contribution: string
    readonly outcome: string
    readonly skills: readonly string[]
  }
}

export interface ManagementStory {
  readonly id: string
  readonly tags: readonly string[]
  readonly color: string
  readonly title: string
  readonly teaser: string
  readonly text: string
}

export interface Stat {
  readonly value: string
  readonly label: string
}

export interface SkillRef {
  readonly id: string
  readonly label: string
}

export interface ActContent {
  readonly act: string
  readonly title: string
  readonly period: string
  readonly location: string
  readonly color: string
  readonly splash: string
  readonly body: string
  readonly takeaway: string
  readonly takeawaySerif?: boolean
  readonly throughline: string
  readonly stats: readonly Stat[]
  readonly statsColor?: string
  readonly skills: readonly SkillRef[]
}

export interface NurseFeature {
  readonly label: string
  readonly text: string
}

export interface Commit {
  readonly type: string
  readonly msg: string
}

export interface Tag {
  readonly text: string
  /** Hex color — must be hex (not CSS var) for alpha suffix manipulation */
  readonly color: string
}

export interface ImpactMetric {
  readonly stat: string
  readonly label: string
  /** Full sentence form for the roles grid drain animation */
  readonly text?: string
  /** Substring within text to highlight in green (the evidence) */
  readonly highlight?: string
  /** Whether this is a promotion line (rendered in gold) */
  readonly promoted?: boolean
}

export interface Repo {
  readonly org: string
  readonly name: string
  readonly url: string
  readonly branch: string
  readonly stars: string
  readonly language: string
  readonly languageColor: string
  readonly description: string
  readonly readme: readonly string[]
  readonly impact: readonly ImpactMetric[]
  readonly stack: readonly Tag[]
}

export interface Distillation {
  /** Words preserved from commits that fly into the question */
  readonly seedWords: readonly string[]
  /** The question the seed words form */
  readonly question: string
  /** One-sentence engineering principle this role crystallised */
  readonly principle: string
  /** Longer narrative detail — shown in the interactive view */
  readonly detail: string
}

export interface Company {
  readonly id: CompanyId
  readonly hash: string
  readonly company: string
  /** Short display name for terminal/UI contexts (e.g. "AMBOSS", "DKB") */
  readonly shortName: string
  readonly role: string
  /** Final/promoted title at this company */
  readonly promotedRole: string
  readonly location: string
  readonly period: string
  /** Compact period for space-constrained UI (e.g. "2018–2019") */
  readonly periodShort: string
  readonly industry: string
  readonly commits: readonly Commit[]
  readonly tags: readonly Tag[]
  readonly promoted: boolean
  readonly repo: Repo
  /** Word-distillation animation data */
  readonly distillation: Distillation
}

export interface SkillScenario {
  readonly id: string
  readonly question: string
  /** Substring of question to highlight in accent color during order phase */
  readonly accentText: string
  readonly title: string
  readonly proof: string
  readonly capability: string
}

export interface ActINurseContent {
  readonly act: string
  readonly title: string
  readonly period: string
  readonly location: string
  readonly color: string
  readonly splash: string
  readonly intro: string
  readonly detail: string
  readonly features: readonly NurseFeature[]
  readonly skills: readonly SkillRef[]
  readonly trainedHeadline: string
  readonly throughline: string
  readonly skillScenarios: readonly SkillScenario[]
}

/* ------------------------------------------------------------------ */
/*  ACT I — The Nurse                                                  */
/* ------------------------------------------------------------------ */

export const ACT_I: ActINurseContent = {
  act: "ACT I",
  title: `The ${nurseRole.label}`,
  period: "2015 — 2018",
  location: "New York, NY",
  color: nurseRole.color,
  splash:
    "Intensive care taught me how to read a situation fast, stay exact under pressure, and make decisions when the cost of confusion was real.",
  intro:
    "Three years as a critical care nurse at New York University Langone Medical Center — the largest medical complex in the New York. Neuro ICU, Cardiac ICU, ER trauma.",
  detail:
    "This wasn't a stepping stone. It was where I learned to read complex systems under pressure, communicate with precision, and make decisions when the cost of being wrong was someone's life.",
  features: [
    {
      label: "Pattern Recognition",
      text: "Reading 12-lead EKGs, catching early signs of deterioration, understanding that vital signs tell a story before the patient can.",
    },
    {
      label: "Systems Thinking",
      text: "The human body is the original complex system. Every intervention has downstream effects. You learn to think in feedback loops.",
    },
  ],
  skills: [
    { id: "s1", label: "Systems Thinking" },
    { id: "s2", label: "Crisis Communication" },
    { id: "s3", label: "High-Stakes Decisions" },
    { id: "s4", label: "Precision Under Pressure" },
    { id: "s5", label: "Cross-Domain Translation" },
  ],
  trainedHeadline: "What that environment trained into me.",
  throughline: "The ICU was not just a previous career. It was where my operating system started.",
  skillScenarios: [
    {
      id: "detection",
      question: "What do you do when the numbers are not telling the whole story yet?",
      accentText: "you do",
      title: "Recognize the signal before it is obvious",
      proof:
        "Ran hourly neuro checks, watched ICP trends, compared vitals with the patient in front of me, and caught changes before the chart reflected them.",
      capability:
        "Collect the data, build the picture from fragments, and decide what information matters.",
    },
    {
      id: "diagnosis",
      question: "When something breaks, how do you find the cause?",
      accentText: "find the cause",
      title: "Start with what changed",
      proof:
        "Checked the ventilator, reviewed medication changes, assessed secretions, and worked backwards through what had changed when something suddenly looked wrong.",
      capability: "Trace problems back to their cause instead of reacting to the loudest symptom.",
    },
    {
      id: "communication",
      question: "How do you explain something critical to someone who has never seen it before?",
      accentText: "explain something",
      title: "Put complex things into plain language",
      proof:
        "Explained machines and alarms to families in the middle of the night and gave surgeons clear updates during rounds.",
      capability:
        "Translate complex situations into clear language for whoever needs to understand them.",
    },
    {
      id: "execution",
      question: "How do you get it right when everything is happening at once?",
      accentText: "everything is happening",
      title: "Stop. Breathe. Focus.",
      proof:
        "Adjusted ventilators, titrated vasopressors, drew labs, documented changes, and moved between patients without losing track of the details.",
      capability: "Execute precisely while tracking everything else that is unfolding.",
    },
    {
      id: "triage",
      question: "How do you decide where your attention goes when every patient is critical?",
      accentText: "decide",
      title: "Fix the most dangerous problem first",
      proof:
        "Managed four ICU patients at once, deciding who needed immediate attention and who could safely wait.",
      capability:
        "Focus attention where risk is highest and escalate before the system catches up.",
    },
    {
      id: "composure",
      question: "When the pressure rises in the room, what matters most?",
      accentText: "pressure",
      title: "Anchor and keep direction",
      proof:
        "Stayed steady during tense moments so the room could focus on the next step instead of the stress.",
      capability: "Stay steady so the room can think clearly and move to the next step.",
    },
  ],
}

/* ------------------------------------------------------------------ */
/*  ACT II — The Engineer                                              */
/* ------------------------------------------------------------------ */

export const JOBS: readonly Job[] = [
  {
    id: "amboss",
    company: "AMBOSS",
    role: "Frontend Engineer",
    period: "2018 - 2019",
    location: "Berlin",
    color: engineerRole.color,
    tech: ["React", "A/B Testing", "User Research"],
    summary: "Medical exam platform used by 500K+ students globally",
    url: "https://amboss.com",
    deepDive: {
      context:
        "This was my first engineering role, and it mattered that it was in health tech. Coming from nursing, I understood the users — medical students under immense pressure who needed tools that worked flawlessly.",
      contribution:
        "I wasn't just writing React components; I was validating whether features actually helped people learn faster. The A/B testing culture here shaped how I think about product decisions: not opinions, but evidence.",
      outcome:
        "We shipped features, measured them, and killed what didn't work. That discipline has stayed with me ever since.",
      skills: [
        "Rapid prototyping",
        "Evidence-based decisions",
        "User empathy from domain knowledge",
      ],
    },
  },
  {
    id: "compado",
    company: "Compado",
    role: "Frontend Engineer → Senior Frontend Engineer",
    period: "2019 - 2021",
    location: "Berlin",
    color: engineerRole.color,
    tech: ["Vue", "SEO", "Performance"],
    summary: "Product comparison sites with dynamic content systems",
    url: "https://compado.com",
    deepDive: {
      context:
        "Compado was where I learned that performance is a feature. We built product comparison sites where milliseconds mattered for SEO rankings and conversion.",
      contribution:
        "I went deep on Core Web Vitals, lazy loading strategies, and how to architect Vue apps that score well on Lighthouse while still being rich and interactive.",
      outcome:
        "The promotion to Senior wasn't about tenure — it came because I took ownership of the entire frontend performance story and delivered measurable business results: 50% faster load times, 25% more organic traffic.",
      skills: ["Performance optimization", "SEO engineering", "Ownership mentality"],
    },
  },
  {
    id: "capinside",
    company: "CAPinside",
    role: "Senior Frontend Engineer",
    period: "2021",
    location: "Hamburg",
    color: engineerRole.color,
    tech: ["Vue", "TypeScript", "Fintech"],
    summary: "Fintech platform serving 10,000+ financial advisors",
    url: "https://capinside.com",
    deepDive: {
      context:
        "Short tenure, deep impact. CAPinside had a legacy frontend that was holding back the entire product. I was brought in specifically to replace it.",
      contribution:
        "The challenge wasn't just technical — it was convincing a fintech company serving 10,000 financial advisors that a full rewrite was safer than continuing to patch. I mapped every feature, built migration paths, and delivered a Vue + TypeScript application that loaded 35% faster.",
      outcome:
        "The lesson: sometimes the most senior thing you can do is have the conviction to say 'this needs to be rebuilt' and then prove it.",
      skills: ["Technical conviction", "Migration planning", "Stakeholder alignment"],
    },
  },
  {
    id: "dkb",
    company: "DKB Code Factory",
    role: "Senior → Engineering Manager",
    period: "2021 - 2022",
    location: "Berlin",
    color: engineerRole.color,
    tech: ["React", "TypeScript", "Playwright", "Micro-frontends"],
    summary: "Rebuilt UI/UX of a banking platform for 5M+ users",
    url: "https://dkb.de",
    deepDive: {
      context:
        "DKB is Germany's largest direct bank — 5 million users. The frontend needed a complete overhaul, and I was part of the team rebuilding it in React with TypeScript and micro-frontends.",
      contribution:
        "What set me apart wasn't the code. I introduced testing culture: Jest for units, Playwright for e2e. The team had been shipping without automated tests. I built the testing infrastructure, wrote the patterns, and coached others to adopt them.",
      outcome:
        "Within 12 months, I was promoted to Engineering Manager — not because I asked, but because I was already doing the work: unblocking people, improving processes, and taking responsibility for outcomes beyond my own PRs.",
      skills: ["Testing infrastructure", "Process improvement", "Leadership through action"],
    },
  },
]

export const ACT_II: ActContent = {
  act: "ACT II",
  title: `The ${engineerRole.label}`,
  period: "2018 - 2022",
  location: "Berlin, Germany",
  color: engineerRole.color,
  splash:
    "I have spent a lot of my working life solving problems inside complex systems, first human ones, then technical ones. I wanted to engineer solutions that mattered to people, and I wanted to do it at scale.",
  body: "React at AMBOSS, Vue at Compado and CAPinside, TypeScript across all of it. Four years building production systems that needed to be fast, correct, and reliable at scale. The path from engineer to manager didn't come from asking — it came from already doing the work.",
  takeaway:
    "The deeper I went into engineering, the more the work became about judgment, seeing the system clearly and making the right technical decisions.",
  throughline: "",
  stats: [
    { value: "4", label: "Companies" },
    { value: "5M+", label: "Users at DKB" },
    { value: "50%", label: "Faster load times" },
    { value: "10K+", label: "Financial advisors" },
  ],
  skills: [
    { id: "s6", label: "React" },
    { id: "s7", label: "TypeScript" },
    { id: "s8", label: "Vue" },
    { id: "s9", label: "Next.js" },
    { id: "s10", label: "Performance Optimization" },
    { id: "s11", label: "A/B Testing" },
    { id: "s12", label: "Playwright" },
    { id: "s13", label: "E2E Testing" },
    { id: "s14", label: "Fintech" },
    { id: "s15", label: "Agile Delivery" },
  ],
}

/* ------------------------------------------------------------------ */
/*  ACT II — Engineer Companies (git log)                              */
/* ------------------------------------------------------------------ */

/** Hex value of --act-blue, needed for hex-alpha tag backgrounds */
const ENGINEER_HEX = "#5B9EC2"
const PROMOTED_HEX = "#5EBB73"
const INDUSTRY_HEX = "#9B8FCE"

export const COMPANIES: readonly Company[] = [
  {
    id: COMPANY_ID.AMBOSS,
    hash: "a3f7b21",
    company: "AMBOSS",
    shortName: "AMBOSS",
    role: "Frontend Engineer",
    promotedRole: "Frontend Engineer",
    location: "Berlin",
    period: "Sep 2018 — Oct 2019",
    periodShort: "2018–2019",
    industry: "Med-Ed",
    commits: [
      {
        type: "feat",
        msg: "build core React product for 500K+ medical students",
      },
      { type: "test", msg: "run A/B experiments on study and review flows" },
      {
        type: "collab",
        msg: "translate research insights into frontend decisions",
      },
      { type: "ship", msg: "help take the product from beta to production" },
    ],
    tags: [
      { text: "React", color: ENGINEER_HEX },
      { text: "A/B Testing", color: ENGINEER_HEX },
      { text: "Med-Ed", color: INDUSTRY_HEX },
    ],
    promoted: false,
    repo: {
      org: "amboss-meded",
      name: "student-app",
      url: "https://www.amboss.com",
      branch: "main",
      stars: "500K+ students",
      language: "React",
      languageColor: "#61DAFB",
      description: "Medical exam preparation platform used by 500K+ students.",
      readme: [
        "AMBOSS was my transition from writing code to building products. It was an environment that prioritized evidence over ego.",
        "",
        "I learned that an elegant component is a failure if it confuses a student during an exam. I spent my time in research sessions, watching how people actually interacted with our flows. It grounded my engineering in human behavior.",
        "",
        "The goal wasn't just to ship features, but to move the needle on engagement through rigorous A/B testing. It taught me that engineering decisions must be informed by real usage, not just intuition.",
      ],
      impact: [
        {
          stat: "",
          label: "product launched to 500K students",
          text: "product launched to 500K students",
          highlight: "500K",
        },
        {
          stat: "",
          label: "research embedded into the development process",
          text: "research embedded into the development process",
        },
        {
          stat: "",
          label: "engagement up 20% through tested decisions",
          text: "engagement up 20% through tested decisions",
          highlight: "20%",
        },
      ],
      stack: [
        { text: "React", color: ENGINEER_HEX },
        { text: "JavaScript", color: ENGINEER_HEX },
        { text: "Jest", color: ENGINEER_HEX },
        { text: "A/B Testing", color: ENGINEER_HEX },
        { text: "Med-Ed", color: INDUSTRY_HEX },
      ],
    },
    distillation: {
      seedWords: ["research", "decisions", "production"],
      question: "How do you incorporate user research into your engineering decisions?",
      principle: "I build from observed behaviour, not assumption.",
      detail:
        "I watched medical students use flows I thought were straightforward and saw where they hesitated, misread, or took the long way through. That changed how I build. What feels obvious in the code is not always obvious in the experience.",
    },
  },
  {
    id: COMPANY_ID.COMPADO,
    hash: "8c2e4d9",
    company: "Compado",
    shortName: "Compado",
    role: "Frontend Engineer → Senior Frontend Engineer",
    promotedRole: "Senior Frontend Engineer",
    location: "Berlin",
    period: "Oct 2019 — Jun 2021",
    periodShort: "2019–2021",
    industry: "Marketing",
    commits: [
      {
        type: "feat",
        msg: "build Vue comparison pages for high-traffic products",
      },
      {
        type: "perf",
        msg: "improve page speed problems by reworking loading systems",
      },
      {
        type: "fix",
        msg: "integrate SEO requirements into the frontend architecture",
      },
      { type: "collab", msg: "work with Product to improve conversion flows" },
    ],
    tags: [
      { text: "Vue", color: ENGINEER_HEX },
      { text: "Marketing", color: INDUSTRY_HEX },
      { text: "↑ Promoted", color: PROMOTED_HEX },
    ],
    promoted: true,
    repo: {
      org: "compado",
      name: "comparison-engine",
      url: "https://www.compado.com",
      branch: "main",
      stars: "SEO Growth",
      language: "Vue.js",
      languageColor: "#42B883",
      description: "High-traffic comparison platforms where speed drove organic growth.",
      readme: [
        "At Compado, performance was a business metric, not a technical preference. In the world of SEO and comparison engines, milliseconds are directly tied to traffic and revenue.",
        "",
        "I went deep into the loading pipeline—identifying what blocks rendering and what can be stripped away. I began treating SEO as a core engineering constraint rather than a marketing afterthought.",
        "",
        "This role shifted my focus toward the 'cost' of code. The fastest code is often what you have the discipline to remove. That mix of technical depth and business alignment led to my promotion to Senior.",
      ],
      impact: [
        {
          stat: "",
          label: "Lighthouse scores from 30s to 90+",
          text: "Lighthouse scores from 30s to 90+",
          highlight: "90+",
        },
        {
          stat: "",
          label: "organic traffic doubled",
          text: "organic traffic doubled",
          highlight: "doubled",
        },
        {
          stat: "",
          label: "promoted to Senior Frontend Engineer",
          text: "promoted to Senior Frontend Engineer",
          promoted: true,
        },
      ],
      stack: [
        { text: "Vue.js", color: ENGINEER_HEX },
        { text: "JavaScript", color: ENGINEER_HEX },
        { text: "SEO", color: ENGINEER_HEX },
        { text: "Performance", color: ENGINEER_HEX },
        { text: "Marketing", color: INDUSTRY_HEX },
      ],
    },
    distillation: {
      seedWords: ["product", "systems"],
      question: "How do you tell the difference between a product problem and a systems problem?",
      principle: "I trace the issue to the layer that is creating it.",
      detail:
        "The page was still slow, even after the local fixes looked right on paper. I stepped back and looked at the loading flow itself, what was arriving too early, what could wait, and what was blocking the experience. Once I reworked that layer, the improvement was real.",
    },
  },
  {
    id: COMPANY_ID.CAPINSIDE,
    hash: "1f9a0c3",
    company: "CAPinside",
    shortName: "CAPinside",
    role: "Senior Frontend Engineer",
    promotedRole: "Senior Frontend Engineer",
    location: "Hamburg",
    period: "Jun 2021 — Oct 2021",
    periodShort: "2021",
    industry: "Fintech",
    commits: [
      {
        type: "feat",
        msg: "build advisor platform for 10K+ financial professionals",
      },
      {
        type: "refactor",
        msg: "modernized a fragile legacy frontend in Vue/TS",
      },
      {
        type: "test",
        msg: "raise code quality and test coverage across the platform",
      },
      {
        type: "perf",
        msg: "improved and stabilized load times across frontend architecture",
      },
    ],
    tags: [
      { text: "Vue", color: ENGINEER_HEX },
      { text: "TypeScript", color: ENGINEER_HEX },
      { text: "Fintech", color: INDUSTRY_HEX },
    ],
    promoted: false,
    repo: {
      org: "capinside",
      name: "advisor-platform",
      url: "https://www.capinside.com",
      branch: "main",
      stars: "10K+ advisors",
      language: "TypeScript",
      languageColor: "#3178C6",
      description: "Fintech platform serving 10,000+ financial advisors.",
      readme: [
        "I joined CAPinside to stabilize a fintech platform that had reached a breaking point with its legacy debt.",
        "",
        "The most senior decision I made wasn't a clever hack, but the realization that the foundation itself was the problem. I mapped the product surface and replaced the struggling legacy app with a modern Vue 3 and TypeScript architecture.",
        "",
        "This project reinforced a core belief: seniority is about knowing when to stop patching and when to start rebuilding. I left the team with a predictable, stable system they could actually grow.",
      ],
      impact: [
        {
          stat: "",
          label: "legacy system replaced with Vue 3/TS",
          text: "legacy system replaced with a modern Vue 3/TS stack",
        },
        {
          stat: "",
          label: "team shipping with confidence",
          text: "team shipping with confidence, not caution",
        },
        {
          stat: "",
          label: "10K advisors on a stable platform",
          text: "10K advisors on a stable platform",
          highlight: "10K",
        },
      ],
      stack: [
        { text: "Vue 3", color: ENGINEER_HEX },
        { text: "TypeScript", color: ENGINEER_HEX },
        { text: "Architecture Redesign", color: ENGINEER_HEX },
        { text: "Fintech", color: INDUSTRY_HEX },
      ],
    },
    distillation: {
      seedWords: ["frontend", "quality", "code", "platform"],
      question: "How do you raise code quality across a platform?",
      principle: "I raise quality by shaping the code so the right decisions are easier to make.",
      detail:
        "The frontend had drifted into something people edited carefully rather than extended confidently. I reduced one-off patterns, pulled logic into shared structures, and added tests around brittle flows so new work could build on the system instead of working around it.",
    },
  },
  {
    id: COMPANY_ID.DKB,
    hash: "5e7d2a1",
    company: "DKB Code Factory",
    shortName: "DKB",
    role: "Senior Frontend Engineer → Engineering Manager",
    promotedRole: "Engineering Manager",
    location: "Berlin",
    period: "Oct 2021 — Dec 2024",
    periodShort: "2021–2024",
    industry: "Banking",
    commits: [
      {
        type: "refactor",
        msg: "rebuild the banking platform for millions of users in React/TS",
      },
      {
        type: "test",
        msg: "introduce Jest and Playwright to build safety into the pipeline",
      },
      {
        type: "collab",
        msg: "partner with Product to identify and address usability gaps",
      },
      {
        type: "ship",
        msg: "increase speed from monthly to weekly deployments",
      },
    ],
    tags: [
      { text: "React", color: ENGINEER_HEX },
      { text: "TypeScript", color: ENGINEER_HEX },
      { text: "Banking", color: INDUSTRY_HEX },
      { text: "↑ Promoted", color: PROMOTED_HEX },
    ],
    promoted: true,
    repo: {
      org: "dkb-code-factory",
      name: "banking-frontend",
      url: "https://www.dkb.de",
      branch: "main",
      stars: "5M+ users",
      language: "TypeScript",
      languageColor: "#3178C6",
      description: "Mission-critical frontend for a major German digital bank.",
      readme: [
        "At DKB, engineering scale met regulatory rigor. When you serve millions of users, 'moving fast' is only possible if your testing is ironclad.",
        "",
        "I focused on rebuilding the UI/UX while introducing automated testing frameworks like Jest and Playwright. We needed to make releases boring and predictable, not heroic efforts.",
        "",
        "I spent my time bridging the gap between technical feasibility and product vision. By the time I moved into leadership, we had transformed the platform from a fragile system into a reliable, mission-critical product.",
        "",
        "Within 12 months I was promoted to Engineering Manager. I was already doing the work — unblocking engineers, fixing process, and taking responsibility for outcomes beyond my own code. As EM I led a group of engineers, designers, QA, and freelancers. Grew the core team from 6 to 10 and moved releases from monthly to weekly.",
      ],
      impact: [
        {
          stat: "",
          label: "test automation across critical flows",
          text: "test automation introduced across critical flows",
        },
        {
          stat: "",
          label: "releases monthly to weekly",
          text: "releases moved from monthly to weekly",
          highlight: "weekly",
        },
        {
          stat: "",
          label: "production bugs down 30%",
          text: "production bugs down 30%",
          highlight: "30%",
        },
        {
          stat: "",
          label: "team grew from 6 to 10",
          text: "team grew from 6 to 10",
          highlight: "6 to 10",
        },
        {
          stat: "",
          label: "promoted to Engineering Manager",
          text: "promoted to Engineering Manager",
          promoted: true,
        },
      ],
      stack: [
        { text: "React", color: ENGINEER_HEX },
        { text: "TypeScript", color: ENGINEER_HEX },
        { text: "Playwright", color: ENGINEER_HEX },
        { text: "Jest", color: ENGINEER_HEX },
        { text: "Banking", color: INDUSTRY_HEX },
      ],
    },
    distillation: {
      seedWords: ["speed", "safety", "banking", "millions", "users"],
      question:
        "How do you balance speed and safety on a banking platform that millions of users depend on?",
      principle:
        "I put enough testing in place so that we can ship without second-guessing ourselves.",
      detail:
        "I helped push testing into the release process because too much was being caught late and too much depended on people remembering things. With Jest and Playwright in place around critical flows, shipping became more regular, less tense, and easier for the team to trust.",
    },
  },
]

/* ------------------------------------------------------------------ */
/*  ACT III — The Leader                                               */
/* ------------------------------------------------------------------ */

export const MGMT_STORIES: readonly ManagementStory[] = [
  {
    id: "releases",
    tags: ["LEADERSHIP", "PROCESS"],
    color: leaderRole.color,
    title: "Monthly to weekly — rebuilding delivery at DKB",
    teaser:
      "Releases kept breaking. I coordinated readiness across multiple developers, found that support teams weren't testing until deploy day, and made pre-deploy verification standard.",
    text: "Releases kept breaking. I coordinated readiness across multiple developers per release, assessed what was ready vs what would block the whole pipeline, and pushed for post-deployment debriefs. Found that support teams weren't testing their infrastructure connections until deploy day. Made pre-deploy verification standard. Monthly became weekly. 30% fewer bugs.",
  },
  {
    id: "playwright",
    tags: ["ENGINEERING", "TESTING"],
    color: engineerRole.color,
    title: "Introducing Playwright at scale in a banking app",
    teaser:
      "DKB had no E2E infrastructure. I introduced Playwright, built the testing patterns, and coached the team to own it as a standard — not a nice-to-have.",
    text: "The team had been shipping without automated tests. I built the testing infrastructure, wrote the patterns, and coached others to adopt them. Introduced Playwright for e2e testing and Jest for unit tests. Made testing culture standard, not optional.",
  },
  {
    id: "trading",
    tags: ["TRADING", "ENGINEERING"],
    color: builderRole.color,
    title: "Building a production trading system alone",
    teaser:
      "14 indicators. 13,500 lines. No libraries, no wrappers. Real money on the line from day one. The market is the harshest QA process there is.",
    text: "An algorithmic futures trading system built from scratch. 14 custom indicators, 13,500 lines of Pine Script v6 with AI-assisted development as a daily workflow. No libraries, no wrappers. The market gives feedback instantly, and it doesn't care about your feelings.",
  },
  {
    id: "silence",
    tags: ["CULTURE", "LEADERSHIP"],
    color: leaderRole.color,
    title: "Fighting the culture of silence",
    teaser:
      "Developers were staying passive during refinements. I changed from 'any questions?' to 'what's the first edge case you'd test here?' — forcing engagement.",
    text: "Developers were staying passive during refinements, then claiming confusion during planning. I changed the approach: instead of 'any questions?' I started asking specific people 'what's the first edge case you'd test here?' Forced engagement. Made it safe to surface uncertainty. The team went from passive receivers to active participants.",
  },
  {
    id: "scope",
    tags: ["TECHNICAL", "PROCESS"],
    color: nurseRole.color,
    title: "Catching scope creep in real time",
    teaser:
      "A developer mentioned he was 'just fixing a small eslint issue.' Turned out the fix had expanded into a large refactor touching dozens of files.",
    text: "A developer mentioned he was 'just fixing a small eslint issue.' Turned out the fix had expanded into a large refactor touching dozens of files, all inside a feature ticket. I caught it, moved the refactor to its own ticket, and refocused him on the feature. The broader issue became a team discussion, not one person's side quest buried in an unrelated PR.",
  },
  {
    id: "hiring",
    tags: ["HIRING", "LEADERSHIP"],
    color: builderRole.color,
    title: "Hiring for fit, not speed",
    teaser:
      "HR wanted to close whichever candidate finished first. I pushed back: run both in parallel, give the team a real comparison.",
    text: "Two candidates in the pipeline. HR wanted to close whichever finished first. I pushed back: run both in parallel, give the team a comparison. Delegated code reviews to the engineers who would actually work with the hire. Set a clear timeline: one week for submission, 7-day follow-up. Hired the better candidate, not the faster one.",
  },
]

/* ------------------------------------------------------------------ */
/*  ACT III — The Leader (v2 cinematic)                                */
/* ------------------------------------------------------------------ */

export interface LeaderScenario {
  readonly id: string
  readonly situation: string
  readonly response: string
}

export interface LeaderAnnotation {
  readonly label: string
  readonly text: string
}

export interface LeaderContent {
  readonly act: string
  readonly title: string
  readonly color: string
  readonly headline: string
  readonly subhead: string
  readonly scenarios: readonly LeaderScenario[]
  readonly annotations: readonly LeaderAnnotation[]
  readonly proof: readonly string[]
  readonly closing: string
}

export const ACT_III_LEADER: LeaderContent = {
  act: "ACT III",
  title: `The ${leaderRole.label}`,
  color: leaderRole.color,
  headline: "turned pressure into clearer decisions, calmer teams, and better outcomes.",
  subhead:
    "In high-stakes product environments, I helped teams align faster, narrow the real problem, and keep delivery moving when priorities shifted and confusion started to spread.",
  scenarios: [
    {
      id: "01",
      situation: "A deployment was drifting into private chats and guesswork.",
      response:
        "I pulled readiness into the open, got the real ticket picture on the table, and gave the team one shared view of what could ship.",
    },
    {
      id: "02",
      situation: "A small feature started turning into a much bigger refactor.",
      response:
        "I narrowed scope, protected delivery, and split the broader technical issue into something the team could handle deliberately.",
    },
    {
      id: "03",
      situation: "A broken merge risked becoming a blame spiral.",
      response:
        "I shifted the conversation back to process, test discipline, and learning, so the issue stayed useful instead of corrosive.",
    },
  ],
  annotations: [
    {
      label: "What's actually ready",
      text: "Aligned engineering, product, and stakeholders around what was actually ready, realistic, and worth doing next.",
    },
    {
      label: "When work sprawled",
      text: "Protected focus when work began to sprawl, and separated urgent delivery from larger systemic fixes.",
    },
    {
      label: "How we talked",
      text: "Pushed for directness, openness, and constructive feedback over silence, blame, or process confusion.",
    },
  ],
  proof: [
    "Led and unblocked 15+ engineers across complex product work.",
    "Worked on systems affecting 5M+ users, where reliability and judgment mattered.",
    "Managed delivery, communication, recruitment, scope, and team dynamics in parallel.",
    "Focused on clarity, not theatre — helping teams move with less friction and more trust.",
  ],
  closing:
    "I was at my best where there was ambiguity to resolve, people to align, and systems that needed steadier judgment — not more noise.",
}

export const ACT_III: ActContent = {
  act: "ACT III",
  title: `The ${leaderRole.label}`,
  period: "2022 - 2024",
  location: "DKB Code Factory, Berlin",
  color: leaderRole.color,
  splash:
    "Eight engineers on one of Germany's largest banking apps. Grew the core team from 6 to 10. Drove migration to React/TypeScript and micro-frontends.",
  body: "Monthly releases became weekly. Bugs dropped 30%. Ran weekly 1:1s. Coached engineers into senior roles. Navigated a regulated banking environment while staying hands-on with code — because I believe the best engineering managers still understand what they're managing.",
  takeaway:
    "Management isn't about being in charge. It's about creating the conditions where other people can do their best work.",
  takeawaySerif: true,
  throughline: "",
  stats: [
    { value: "8", label: "Engineers managed" },
    { value: "6→10", label: "Team growth" },
    { value: "-30%", label: "Bug reduction" },
    { value: "Weekly", label: "Release cadence" },
  ],
  skills: [
    { id: "s16", label: "Engineering Management" },
    { id: "s17", label: "Team Building" },
    { id: "s18", label: "Technical Mentoring" },
    { id: "s19", label: "Process Design" },
    { id: "s20", label: "Stakeholder Communication" },
    { id: "s21", label: "Hiring" },
    { id: "s22", label: "Culture Protection" },
    { id: "s23", label: "Roadmapping" },
  ],
}

/* ------------------------------------------------------------------ */
/*  ACT IV — The Builder                                               */
/* ------------------------------------------------------------------ */

export const ACT_IV: ActContent = {
  act: "ACT IV",
  title: `The ${builderRole.label}`,
  period: "2024 - Present",
  location: "Self-Employed, Berlin",
  color: builderRole.color,
  splash:
    "An algorithmic futures trading system. 14 custom indicators. 13,500 lines of Pine Script v6, written from scratch with AI-assisted development as a daily workflow.",
  body: "No libraries, no wrappers. The market gives feedback instantly, and it doesn't care about your feelings. Managing funded accounts with real money on the line.",
  takeaway:
    "This is where everything converges. ICU pattern recognition, engineering discipline, leadership under pressure. The market doesn't care what you've done before. It only cares if you can read it correctly, right now.",
  throughline: "",
  statsColor: builderRole.color,
  stats: [
    { value: "14", label: "Custom indicators" },
    { value: "13.5K", label: "Lines of Pine Script" },
    { value: "Live", label: "Funded accounts" },
  ],
  skills: [
    { id: "s24", label: "Pine Script v6" },
    { id: "s25", label: "Systems Architecture" },
    { id: "s26", label: "AI/LLM Workflows" },
    { id: "s27", label: "Risk Engineering" },
    { id: "s28", label: "Solo Delivery" },
    { id: "s29", label: "Algorithmic Trading" },
    { id: "s30", label: "Statistical Analysis" },
  ],
}
