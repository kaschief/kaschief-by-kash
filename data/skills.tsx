import type { ReactNode } from "react"

export interface Tool {
  category: string
  content: ReactNode
}

export interface Language {
  lang: string
  desc: string
  level: string
}

export const TOOLS: Tool[] = [
  {
    category: "FRONTEND",
    content: (
      <>
        <strong className="text-[var(--cream)]">React</strong> since 2018,{" "}
        <strong className="text-[var(--cream)]">Vue</strong> at Compado & CAPinside,{" "}
        <strong className="text-[var(--cream)]">TypeScript</strong> as default, Next.js when full-stack is needed.
      </>
    ),
  },
  {
    category: "TESTING",
    content: (
      <>
        <strong className="text-[var(--cream)]">Playwright</strong> — built the E2E infrastructure at DKB.{" "}
        <strong className="text-[var(--cream)]">Jest</strong> for unit patterns. CI/CD with GitHub Actions.
      </>
    ),
  },
  {
    category: "SPECIALIZED",
    content: (
      <>
        <strong className="text-[var(--cream)]">Pine Script v6</strong> — 13,500 lines written from scratch.{" "}
        <strong className="text-[var(--cream)]">AI/LLM workflows</strong> as daily development practice.
        TradingView platform and ecosystem.
      </>
    ),
  },
  {
    category: "LEADERSHIP",
    content: (
      <>
        Roadmapping, hiring for fit, weekly 1:1s, mentoring into senior roles, cross-functional communication
        across engineering and product.
      </>
    ),
  },
]

export const LANGUAGES: Language[] = [
  { lang: "English", desc: "Native tongue.", level: "NATIVE" },
  { lang: "Français", desc: "Conversational — used daily in Berlin.", level: "C1" },
  { lang: "Español", desc: "Conversational.", level: "B1" },
  { lang: "Deutsch", desc: "Working proficiency in Berlin.", level: "B1" },
]
