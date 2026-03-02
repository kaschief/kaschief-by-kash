import { ROLES } from "@/data/site"

const [nurseRole, engineerRole, leaderRole, builderRole] = ROLES

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Job {
  id: string
  company: string
  role: string
  period: string
  location: string
  color: string
  tech: string[]
  summary: string
  url: string
  deepDive: {
    context: string
    contribution: string
    outcome: string
    skills: string[]
  }
}

export interface ManagementStory {
  id: string
  tags: string[]
  color: string
  title: string
  teaser: string
  text: string
}

export interface Stat {
  value: string
  label: string
}

export interface SkillRef {
  id: string
  label: string
}

export interface ActContent {
  act: string
  title: string
  period: string
  location: string
  color: string
  lead: string
  body: string
  takeaway: string
  takeawaySerif?: boolean
  stats: Stat[]
  statsColor?: string
  skills: SkillRef[]
}

export interface NurseFeature {
  label: string
  text: string
}

export interface ActINurseContent {
  act: string
  title: string
  period: string
  location: string
  color: string
  takeaway: string
  intro: string
  detail: string
  features: NurseFeature[]
  skills: SkillRef[]
}

/* ------------------------------------------------------------------ */
/*  ACT I — The Nurse                                                  */
/* ------------------------------------------------------------------ */

export const ACT_I: ActINurseContent = {
  act: "ACT I",
  title: `The ${nurseRole.label}`,
  period: "2012 - 2017",
  location: "Houston, TX",
  color: nurseRole.color,
  takeaway:
    "The ICU taught me that under pressure, process matters more than heroics. You assess, prioritize, and execute — or people die. That discipline never left me.",
  intro:
    "Five years as a critical care nurse in Houston's Texas Medical Center — the largest medical complex in the world. Neuro ICU, Cardiac ICU, ER trauma.",
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
}

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
      skills: ["Rapid prototyping", "Evidence-based decisions", "User empathy from domain knowledge"],
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
    { id: "s6",  label: "React" },
    { id: "s7",  label: "TypeScript" },
    { id: "s8",  label: "Vue" },
    { id: "s9",  label: "Next.js" },
    { id: "s10", label: "Performance Optimization" },
    { id: "s11", label: "A/B Testing" },
    { id: "s12", label: "Playwright" },
    { id: "s13", label: "E2E Testing" },
    { id: "s14", label: "Fintech" },
    { id: "s15", label: "Agile Delivery" },
  ],
}

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
]

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
}
