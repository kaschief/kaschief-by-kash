import { ROLES } from "./site";
const [nurseRole, engineerRole, leaderRole, builderRole] = ROLES;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Job {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  color: string;
  tech: string[];
  summary: string;
  url: string;
  deepDive: {
    context: string;
    contribution: string;
    outcome: string;
    skills: string[];
  };
}

export interface ManagementStory {
  id: string;
  tags: string[];
  color: string;
  title: string;
  teaser: string;
  text: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface SkillRef {
  id: string;
  label: string;
}

export interface ActContent {
  act: string;
  title: string;
  period: string;
  location: string;
  color: string;
  lead: string;
  body: string;
  takeaway: string;
  takeawaySerif?: boolean;
  stats: Stat[];
  statsColor?: string;
  skills: SkillRef[];
}

export interface NurseFeature {
  label: string;
  text: string;
}

export interface Commit {
  type: string;
  msg: string;
}

export interface Tag {
  text: string;
  /** Hex color — must be hex (not CSS var) for alpha suffix manipulation */
  color: string;
}

export interface ImpactMetric {
  stat: string;
  label: string;
  /** Fill percentage for the diff-stat bar (0–100) */
  pct: number;
}

export interface Repo {
  org: string;
  name: string;
  url: string;
  branch: string;
  stars: string;
  language: string;
  languageColor: string;
  description: string;
  readme: string[];
  impact: ImpactMetric[];
  stack: string[];
}

export interface Company {
  hash: string;
  company: string;
  role: string;
  location: string;
  period: string;
  commits: Commit[];
  tags: Tag[];
  promoted: boolean;
  repo: Repo;
}

export interface ClinicalReadout {
  label: string;
  text: string;
}

export interface ThroughLine {
  label: string;
  text: string;
}

export interface ActINurseContent {
  act: string;
  title: string;
  period: string;
  location: string;
  color: string;
  takeaway: string;
  intro: string;
  detail: string;
  features: NurseFeature[];
  skills: SkillRef[];
  trainedHeadline: string;
  readouts: ClinicalReadout[];
  throughlineHeadline: string;
  throughlines: ThroughLine[];
}

/* ------------------------------------------------------------------ */
/*  ACT I — The Nurse                                                  */
/* ------------------------------------------------------------------ */

export const ACT_I: ActINurseContent = {
  act: "ACT I",
  title: `The ${nurseRole.label}`,
  period: "2012 — 2017",
  location: "New York, NY",
  color: nurseRole.color,
  takeaway:
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
  readouts: [
    {
      label: "Assess",
      text: "Take in fragmented signals quickly and separate noise from what actually carries risk.",
    },
    {
      label: "Prioritize",
      text: "Focus attention where the stakes are highest instead of getting lost in everything at once.",
    },
    {
      label: "Communicate",
      text: "Be direct, accurate, and useful when time, energy, and attention are limited.",
    },
    {
      label: "Act",
      text: "Move cleanly inside pressure without becoming sloppy, vague, or reactive.",
    },
  ],
  throughlineHeadline:
    "The ICU was not just a previous career. It was where the operating system began.",
  throughlines: [
    {
      label: "Carryover",
      text: "The instinct to protect the system, communicate clearly, and respond without panic came from here — long before tech, management, or trading entered the picture.",
    },
    {
      label: "Through-line",
      text: "Different domains, same pattern — absorb complexity, find the real signal, then make the next step clearer for everyone involved.",
    },
  ],
};

/* ACT I — Chaos-to-Order orbit nodes */

export interface OrbitNode {
  label: string;
  title: string;
  did: string;
  built: string;
  transfer: string;
}

export const ORBIT_NODES: readonly OrbitNode[] = [
  {
    label: "Assessment",
    title: "Read the room before the monitor does",
    did: "Neuro checks every hour. ICP, hemodynamics, blood gas — all at once. Incomplete data, competing signals, every single shift.",
    built: "Absorb fast, filter noise, orient before the full picture exists.",
    transfer:
      "The instinct that reads a patient before the alarm fires is the same one that catches a system failing before the ticket lands.",
  },
  {
    label: "Pattern Recognition",
    title: "Never treat the symptom",
    did: "A cough at 1 am — nothing, or effusion, vent malfunction, a dosage reaction from hours ago. Diagnosis under time pressure, every night.",
    built: "Find what's actually broken. Not what's loudest.",
    transfer:
      "The eye that catches a drug interaction catches a regression buried three PRs deep.",
  },
  {
    label: "Communication",
    title: "Translate fear into trust in ninety seconds",
    did: "Briefed surgeons in three sentences. Talked families through ventilator settings at 3 am. Every audience needed a different language.",
    built: "Make complexity clear for people who need to act on it. Now.",
    transfer:
      "The voice that steadies a family in the ICU steadies a team when the roadmap shifts.",
  },
  {
    label: "Execution",
    title: "Chaos, controlled",
    did: "Rapid response. Ventilators, IV titrations, arterial lines. Document in real time. Then walk back to three other patients like nothing happened.",
    built:
      "Move fast under pressure without getting sloppy. Context-switch clean.",
    transfer:
      "Production incidents, regulatory deadlines, competing releases. Same muscle, different room.",
  },
  {
    label: "Triage",
    title: "One crashing. Three still need you steady.",
    did: "Four critical patients. Competing needs, all urgent. Escalated past the chain when the chain was too slow.",
    built: "Know which fire to fight first. Know which ones can wait.",
    transfer:
      "Three projects on fire, a teammate blocked, a deadline moved up. Triage was four ICU beds.",
  },
  {
    label: "Composure",
    title: "Calm is a procedure, not a personality",
    did: "~1,100 night shifts. Codes, family breakdowns, moments where the call was mine alone. The room reads the nurse first.",
    built:
      "Regulate yourself first. A reactive leader makes a reactive system.",
    transfer: "A team reads its manager the way a room reads its nurse.",
  },
];

/* ------------------------------------------------------------------ */
/*  ACT II — The Engineer                                              */
/* ------------------------------------------------------------------ */

export const JOBS: Job[] = [
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
    role: "Frontend Engineer → Senior",
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
      skills: [
        "Performance optimization",
        "SEO engineering",
        "Ownership mentality",
      ],
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
      skills: [
        "Technical conviction",
        "Migration planning",
        "Stakeholder alignment",
      ],
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
      skills: [
        "Testing infrastructure",
        "Process improvement",
        "Leadership through action",
      ],
    },
  },
];

export const ACT_II: ActContent = {
  act: "ACT II",
  title: `The ${engineerRole.label}`,
  period: "2018 - 2022",
  location: "Berlin, Germany",
  color: engineerRole.color,
  lead: "Four frontend roles across health tech, fintech, and Germany's largest bank. Each move was deliberate — find the hardest problem, learn it deeply, then follow the signal.",
  body: "React at AMBOSS, Vue at Compado and CAPinside, TypeScript across all of it. Four years building production systems that needed to be fast, correct, and reliable at scale. The path from engineer to manager didn't come from asking — it came from already doing the work.",
  takeaway:
    "Four companies in four years wasn't job-hopping. It was following the signal: find the hardest problem, solve it, and when you've learned what you came to learn, move to where you can learn more.",
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
};

/* ------------------------------------------------------------------ */
/*  ACT II — Engineer Companies (git log)                              */
/* ------------------------------------------------------------------ */

/** Hex value of --act-blue, needed for hex-alpha tag backgrounds */
const ENGINEER_HEX = "#5B9EC2";
const PROMOTED_HEX = "#5EBB73";

export const COMPANIES: Company[] = [
  {
    hash: "a3f7b21",
    company: "AMBOSS",
    role: "Frontend Engineer",
    location: "Berlin",
    period: "Sep 2018 — Oct 2019",
    commits: [
      {
        type: "feat",
        msg: "build React app for medical exam prep (500K+ students)",
      },
      { type: "test", msg: "run A/B tests on study flow — engagement +20%" },
      { type: "chore", msg: "ship features that take product out of beta" },
      {
        type: "collab",
        msg: "work with Product on user research and feature validation",
      },
    ],
    tags: [
      { text: "React", color: ENGINEER_HEX },
      { text: "A/B Testing", color: ENGINEER_HEX },
    ],
    promoted: false,
    repo: {
      org: "amboss-meded",
      name: "student-app",
      url: "https://www.amboss.com",
      branch: "main",
      stars: "500K+ users",
      language: "React",
      languageColor: "#61DAFB",
      description:
        "Medical exam preparation platform used by 500K+ students worldwide. Built with React, featuring adaptive learning paths, spaced repetition, and clinical case simulations.",
      readme: [
        "## What I shipped",
        "",
        "Joined as a frontend engineer on the core student app \u2014 a React SPA used by over half a million medical students across 180+ countries.",
        "",
        "The product was in beta when I arrived. My job was to help make it production-ready.",
        "",
        "### Key contributions",
        "",
        "**A/B testing framework** \u2014 Designed and ran experiments on the study flow UI. One test on the question review screen lifted engagement by 20%. That one change affected hundreds of thousands of daily sessions.",
        "",
        "**Feature velocity** \u2014 Shipped multiple features that contributed to the product officially leaving beta. Worked directly with PMs on user research to validate what we built before we built it.",
        "",
        "**User research integration** \u2014 Sat in on user interviews, translated findings into technical requirements, and made sure engineering stayed close to the people using the product.",
      ],
      impact: [
        { stat: "+20%", label: "engagement lift", pct: 60 },
        { stat: "500K+", label: "students served", pct: 95 },
        { stat: "3", label: "features \u2192 production", pct: 40 },
      ],
      stack: ["React", "JavaScript", "Jest", "REST APIs", "Webpack"],
    },
  },
  {
    hash: "8c2e4d9",
    company: "Compado",
    role: "Frontend Engineer \u2192 Senior",
    location: "Berlin",
    period: "Oct 2019 — Jun 2021",
    commits: [
      {
        type: "feat",
        msg: "build product comparison sites in Vue (chatbots, infinite scroll)",
      },
      { type: "perf", msg: "improve page speed by 50%" },
      { type: "fix", msg: "SEO optimizations \u2014 organic traffic +25%" },
      {
        type: "collab",
        msg: "work with Product on acquisition and conversion funnels",
      },
    ],
    tags: [
      { text: "Vue", color: ENGINEER_HEX },
      { text: "\u2191 Promoted to Senior", color: PROMOTED_HEX },
    ],
    promoted: true,
    repo: {
      org: "compado",
      name: "comparison-engine",
      url: "https://www.compado.com",
      branch: "main",
      stars: "+25% traffic",
      language: "Vue.js",
      languageColor: "#42B883",
      description:
        "Product comparison websites with chatbots, dynamic loading, and infinite scroll. Built in Vue with a heavy focus on performance and SEO.",
      readme: [
        "## What I shipped",
        "",
        "Built product comparison websites from scratch in Vue. The business model was content-driven: high-quality comparison pages that ranked well and converted.",
        "",
        "### Key contributions",
        "",
        "**Page speed overhaul** \u2014 Audited and rebuilt the rendering pipeline. Lazy loading, code splitting, image optimization, critical CSS extraction. Page speed improved by 50%. This directly impacted SEO rankings.",
        "",
        "**SEO-driven development** \u2014 Treated SEO as an engineering problem, not a marketing afterthought. Structured data, semantic HTML, server-side rendering. Organic traffic grew 25%.",
        "",
        "**Dynamic UI systems** \u2014 Built chatbot interfaces, infinite scroll feeds, and dynamic product comparison tables. All had to work without JavaScript for crawlers while being interactive for users.",
        "",
        "**Promoted to Senior** \u2014 Took on more ownership of technical decisions, mentored newer developers, and started leading feature development end-to-end.",
      ],
      impact: [
        { stat: "+50%", label: "page speed improvement", pct: 80 },
        { stat: "+25%", label: "organic traffic growth", pct: 65 },
        { stat: "\u2192 Senior", label: "promoted", pct: 100 },
      ],
      stack: ["Vue.js", "Nuxt", "JavaScript", "SEO", "Performance"],
    },
  },
  {
    hash: "1f9a0c3",
    company: "CAPinside",
    role: "Senior Frontend Engineer",
    location: "Hamburg",
    period: "Jun 2021 — Oct 2021",
    commits: [
      {
        type: "feat",
        msg: "lead frontend rebuild for fintech platform (10K+ advisors)",
      },
      {
        type: "refactor",
        msg: "replace struggling legacy app with Vue/TypeScript architecture",
      },
      { type: "perf", msg: "cut page load times by 35%" },
    ],
    tags: [
      { text: "Vue", color: ENGINEER_HEX },
      { text: "TypeScript", color: ENGINEER_HEX },
      { text: "Fintech", color: ENGINEER_HEX },
    ],
    promoted: false,
    repo: {
      org: "capinside",
      name: "advisor-platform",
      url: "https://www.capinside.com",
      branch: "develop",
      stars: "10K+ advisors",
      language: "TypeScript",
      languageColor: "#3178C6",
      description:
        "Fintech platform serving 10,000+ financial advisors. Replaced a failing legacy application with a modern Vue/TypeScript architecture.",
      readme: [
        "## What I shipped",
        "",
        "Short stint, high impact. CAPinside had a legacy frontend that was buckling under its own weight. Brought in as a senior to lead the rebuild.",
        "",
        "### Key contributions",
        "",
        "**Legacy migration** \u2014 The existing app was slow, fragile, and hard to extend. Architected and led the migration to Vue 3 + TypeScript. The new architecture was modular, testable, and fast.",
        "",
        "**Performance** \u2014 Cut page load times by 35% through bundle optimization, lazy loading, and eliminating render-blocking resources. For a fintech platform where advisors check data throughout the day, speed is retention.",
        "",
        "**Technical leadership** \u2014 Made architecture decisions, set coding standards, and established patterns that the team continued using after I left.",
      ],
      impact: [
        { stat: "-35%", label: "page load time", pct: 70 },
        { stat: "10K+", label: "advisors on platform", pct: 85 },
        { stat: "1", label: "legacy app replaced", pct: 50 },
      ],
      stack: ["Vue 3", "TypeScript", "Vite", "Fintech", "REST APIs"],
    },
  },
  {
    hash: "5e7d2a1",
    company: "DKB Code Factory",
    role: "Senior Frontend \u2192 Engineering Manager",
    location: "Berlin",
    period: "Oct 2021 — Dec 2024",
    commits: [
      {
        type: "refactor",
        msg: "rebuild frontend of banking app used by 5M people",
      },
      { type: "test", msg: "introduce Jest + Playwright testing frameworks" },
      { type: "fix", msg: "reduce production bugs by 30%" },
      { type: "docs", msg: "improve documentation, mentor 3 junior engineers" },
      { type: "feat", msg: "promoted to Engineering Manager" },
    ],
    tags: [
      { text: "React", color: ENGINEER_HEX },
      { text: "TypeScript", color: ENGINEER_HEX },
      { text: "\u2191 Promoted", color: PROMOTED_HEX },
    ],
    promoted: true,
    repo: {
      org: "dkb-code-factory",
      name: "banking-frontend",
      url: "https://www.dkb.de",
      branch: "release/prod",
      stars: "5M+ users",
      language: "TypeScript",
      languageColor: "#3178C6",
      description:
        "Frontend of one of Germany\u2019s largest banking apps. React/TypeScript, micro-frontends, serving 5 million customers. Regulated banking environment.",
      readme: [
        "## What I shipped",
        "",
        "Three years. Two promotions. This is the role where everything came together.",
        "",
        "### As Senior Engineer (2021\u20132022)",
        "",
        "**Frontend rebuild** \u2014 Rebuilt the UI/UX of a banking platform used by 5 million people. React, TypeScript, component library, micro-frontend architecture.",
        "",
        "**Testing culture** \u2014 Introduced Jest and Playwright to an organization that had no automated frontend testing. Built the framework, wrote the initial test suites, and trained the team.",
        "",
        "**Promoted to Engineering Manager in 12 months.**",
        "",
        "### As Engineering Manager (2022\u20132024)",
        "",
        "**Team growth** \u2014 Led a distributed team of 15+ (engineers, designers, QA, freelancers). Grew the core engineering team from 6 to 10 through structured hiring.",
        "",
        "**Release velocity** \u2014 Moved releases from monthly to weekly. Bugs dropped 30%.",
        "",
        "**People development** \u2014 Weekly 1:1s. Coached engineers into senior roles. Protected team culture across a complex stakeholder environment.",
        "",
        "**Product leadership** \u2014 Worked directly with Product on feature prioritization and technical feasibility. Translated business requirements into technical roadmaps.",
      ],
      impact: [
        { stat: "5M+", label: "users served", pct: 100 },
        { stat: "-30%", label: "production bugs", pct: 70 },
        { stat: "15+", label: "team managed", pct: 80 },
        { stat: "\u2192 EM", label: "promoted to manager", pct: 100 },
      ],
      stack: [
        "React",
        "TypeScript",
        "Playwright",
        "Jest",
        "Micro-frontends",
        "CI/CD",
      ],
    },
  },
];

/* ------------------------------------------------------------------ */
/*  ACT III — The Leader                                               */
/* ------------------------------------------------------------------ */

export const MGMT_STORIES: ManagementStory[] = [
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
];

/* ------------------------------------------------------------------ */
/*  ACT III — The Leader (v2 cinematic)                                */
/* ------------------------------------------------------------------ */

export interface LeaderScenario {
  id: string;
  situation: string;
  response: string;
}

export interface LeaderAnnotation {
  label: string;
  text: string;
}

export interface LeaderContent {
  act: string;
  title: string;
  color: string;
  headline: string;
  subhead: string;
  scenarios: LeaderScenario[];
  annotations: LeaderAnnotation[];
  proof: string[];
  closing: string;
}

export const ACT_III_LEADER: LeaderContent = {
  act: "ACT III",
  title: `The ${leaderRole.label}`,
  color: leaderRole.color,
  headline:
    "I turned pressure into clearer decisions, calmer teams, and better outcomes.",
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
};

export const ACT_III: ActContent = {
  act: "ACT III",
  title: `The ${leaderRole.label}`,
  period: "2022 - 2024",
  location: "DKB Code Factory, Berlin",
  color: leaderRole.color,
  lead: "Eight engineers on one of Germany's largest banking apps. Grew the core team from 6 to 10. Drove migration to React/TypeScript and micro-frontends.",
  body: "Monthly releases became weekly. Bugs dropped 30%. Ran weekly 1:1s. Coached engineers into senior roles. Navigated a regulated banking environment while staying hands-on with code — because I believe the best engineering managers still understand what they're managing.",
  takeaway:
    "Management isn't about being in charge. It's about creating the conditions where other people can do their best work.",
  takeawaySerif: true,
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
};

/* ------------------------------------------------------------------ */
/*  ACT IV — The Builder                                               */
/* ------------------------------------------------------------------ */

export const ACT_IV: ActContent = {
  act: "ACT IV",
  title: `The ${builderRole.label}`,
  period: "2024 - Present",
  location: "Self-Employed, Berlin",
  color: builderRole.color,
  lead: "An algorithmic futures trading system. 14 custom indicators. 13,500 lines of Pine Script v6, written from scratch with AI-assisted development as a daily workflow.",
  body: "No libraries, no wrappers. The market gives feedback instantly, and it doesn't care about your feelings. Managing funded accounts with real money on the line.",
  takeaway:
    "This is where everything converges. ICU pattern recognition, engineering discipline, leadership under pressure. The market doesn't care what you've done before. It only cares if you can read it correctly, right now.",
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
};
