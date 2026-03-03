export interface MethodSkill {
  id: string
  label: string
  detail: string
}

export interface MethodGroup {
  id: string
  label: string
  description: string
  skills: MethodSkill[]
}

export const METHOD_GROUPS: MethodGroup[] = [
  {
    id: "think",
    label: "How I think",
    description: "The cognitive patterns underneath every domain. The way problems get processed regardless of context.",
    skills: [
      { id: "s1",  label: "Systems Thinking",      detail: "Every symptom is a signal. Finding root cause when the obvious answer is misleading — a muscle I use in every codebase, every team, every trade." },
      { id: "s3",  label: "High-Stakes Decisions",  detail: "Making calls with incomplete information and no time. The same muscle as production incidents, hiring decisions, and live trade management." },
      { id: "s4",  label: "Precision Under Pressure", detail: "Precision isn't perfectionism — it's professional standard. Shows up in my code, my documentation, and my trade journals." },
      { id: "s25", label: "Systems Architecture",   detail: "Managing state across 14 live indicators is a distributed systems problem. IQR over averages is the same instinct as p99 over mean." },
      { id: "s27", label: "Risk Engineering",        detail: "Position sizing and kill switches engineered the same way as rate limiting in production. Risk management is a systems design problem." },
      { id: "s30", label: "Statistical Analysis",    detail: "IQR-based session modelling, deviation bands, consolidation prediction. Applied statistics as an engineering tool — decisions with consequences." },
    ],
  },
  {
    id: "build",
    label: "How I build",
    description: "The craft of actually making things. The hands-on work across languages, frameworks, and systems.",
    skills: [
      { id: "s6",  label: "React",                   detail: "My primary tool since 2018. Four companies — from a medical education startup to a banking platform for 5 million users. I know its edges, not just its surface." },
      { id: "s7",  label: "TypeScript",               detail: "Type-first development by default. Makes large codebases navigable by humans — including future me." },
      { id: "s8",  label: "Vue",                      detail: "Compado and CAPinside. Product comparison engines and fintech dashboards. 50% page speed gains." },
      { id: "s9",  label: "Next.js",                  detail: "SSR, routing, deployment architecture. The framework I reach for when shipping matters." },
      { id: "s10", label: "Performance Optimization", detail: "50% faster at Compado. 35% faster at CAPinside. Measured, shipped, attributed to revenue." },
      { id: "s12", label: "Playwright",               detail: "Built DKB's E2E infrastructure from scratch. Introduced as team standard, coached others to own it." },
      { id: "s24", label: "Pine Script v6",            detail: "13,500 lines from scratch. 14 indicators. Zero duplicated logic. The market is the harshest QA process there is." },
      { id: "s26", label: "AI/LLM Workflows",          detail: "Daily AI-assisted development as professional practice. Agentic workflows, prompt engineering, tool integration. This is how I build now — by default." },
    ],
  },
  {
    id: "lead",
    label: "How I lead",
    description: "How I operate when other people are involved. The human work that most engineers never do.",
    skills: [
      { id: "s2",  label: "Crisis Communication",    detail: "Translating critical information across different mental models in real time. Why I can talk to engineers, POs, and executives without switching modes." },
      { id: "s5",  label: "Cross-Domain Translation", detail: "Four different mental models in one room. I translate between worlds without losing the meaning." },
      { id: "s16", label: "Engineering Management",   detail: "8 engineers at DKB. Monthly to weekly releases. 30% fewer bugs. What I'm proud of: the team got better at their jobs while I was there." },
      { id: "s17", label: "Team Building",            detail: "Grew the core team from 6 to 10. Hired for fit, not speed — pushed back on HR pressure twice. Both hires worked out." },
      { id: "s18", label: "Technical Mentoring",      detail: "Coached engineers into senior roles. The metric: whether they need me less over time." },
      { id: "s21", label: "Hiring",                   detail: "Structured interview processes, cultural and technical fit. The team you build is the product." },
      { id: "s22", label: "Culture Protection",       detail: "Caught a two-tier dynamic before it calcified. Culture is infrastructure — maintain it before it breaks." },
    ],
  },
  {
    id: "ship",
    label: "How I ship",
    description: "The discipline between building something and getting it out the door. Repeatedly.",
    skills: [
      { id: "s11", label: "A/B Testing",        detail: "20% engagement lift at AMBOSS. I treat hypotheses like code: state precisely, measure honestly, kill if they fail." },
      { id: "s13", label: "E2E Testing",         detail: "Pre-deploy verification as a standard, not a nice-to-have. The mindset that turned monthly releases into weekly." },
      { id: "s15", label: "Agile Delivery",      detail: "Four companies taught me when to follow the process and when it's getting in the way." },
      { id: "s19", label: "Process Design",      detail: "Made pre-deploy verification standard. A structural fix, not a people fix. Monthly became weekly." },
      { id: "s23", label: "Roadmapping",         detail: "Scope, sequence, protect engineering capacity. Scope creep caught in real time — systematically, not heroically." },
      { id: "s28", label: "Solo Delivery",       detail: "Full production system. Real money. No team, no safety net. Shipped and maintained alone. This is what ownership actually looks like." },
    ],
  },
  {
    id: "know",
    label: "What I know",
    description: "Domains where I have genuine depth — not transferable skills but real context earned over time.",
    skills: [
      { id: "s14", label: "Fintech",                  detail: "Two fintech products, 10K+ financial advisors, a regulated banking environment. I understand what it means to ship where errors have real consequences." },
      { id: "s29", label: "Algorithmic Trading",       detail: "Built, backtested, deployed. 60%+ win rate on $50K funded accounts. The domain is finance — the skills are engineering, statistics, and discipline." },
      { id: "s20", label: "Stakeholder Communication", detail: "Regulated banking environment. Multiple stakeholders, legal constraints, competing priorities. I communicate in the language of whoever is in the room." },
    ],
  },
]
