/**
 * Story content for the 3-lens structure: Users, Gaps, Patterns.
 * SINGLE SOURCE OF TRUTH — all content lives here.
 *
 * Each entry maps to a skeuomorphic artifact card and contains:
 * - artifact: the rendered text content displayed on the card
 * - story: the narrative behind the artifact
 * - iStatement: the personal takeaway / I-statement
 * - cardType: discriminant for which visual card template to use
 * - chrome: per-card-type metadata (names, IDs, channels, etc.)
 */

/* ── Shared base — every entry has these ── */

interface LensEntryBase {
  id: number
  company: string
  years: string
  /** Question framing the scenario */
  question: string
  artifact: string
  story: string
  iStatement: string
}

/* ── Per-card-type chrome ── */

interface JiraChrome {
  cardType: "jira"
  chrome: {
    breadcrumb: { org: string; team: string }
    title: string
    ticketId: string
    priority: { label: string; level: "low" | "medium" | "high" | "critical" }
    status: { label: string; tone: "open" | "in-progress" | "done" }
    reporter: { name: string; avatar: string }
  }
}

interface SentryChrome {
  cardType: "sentry"
  chrome: {
    project: { org: string; repo: string }
    eventCount: string
    error: { type: string; message: string }
    stackTrace: { file: string; line: number; code: string }
    tags: string[]
    firstSeen: string
  }
}

interface SlackChannelChrome {
  cardType: "slack-channel"
  chrome: {
    channel: string
    sender: { name: string; avatar: string; avatarBg: string }
    timestamp: string
    emoji?: { icon: string; count: number }[]
  }
}

interface SlackDirectChrome {
  cardType: "slack-direct"
  chrome: {
    sender: { name: string; avatar: string; avatarBg: string }
    timestamp: string
    emoji?: { icon: string; count: number }[]
  }
}

interface FigmaCommentChrome {
  cardType: "figma-comment"
  chrome: {
    page: string
    author: { name: string; avatar: string }
    devMode?: boolean
  }
}

interface MeetingNoteChrome {
  cardType: "meeting-note"
  chrome: {
    date: string
    title: string
    /** Optional separate heading for the body — if omitted, title is reused */
    heading?: string
    agendaLabel: string
    agendaText: string
    highlightedQuote: string
    footnote: string
    viewers: { avatar: string; color: string }[]
  }
}

interface AdrCommentChrome {
  cardType: "adr-comment"
  chrome: {
    docId: string
    subject: string
    status: { label: string; tone: "under-review" | "accepted" | "superseded" }
    commenter: { role: string; avatar: string }
  }
}

interface GithubReviewChrome {
  cardType: "github-review"
  chrome: {
    repo: { org: string; name: string }
    pr: { title: string; number: string }
    labels: { text: string; color: string }[]
    reviewer: { name: string; timeAgo: string }
  }
}

interface PlainTextBareChrome {
  cardType: "plain-bare"
  chrome: {
    context: string
    rotation?: number
  }
}

interface PlainTextStickyChrome {
  cardType: "plain-sticky"
  chrome: {
    context: string
    rotation?: number
  }
}

interface PlainTextAnnotationChrome {
  cardType: "plain-annotation"
  chrome: {
    context: string
    accentColor?: string
  }
}

/* ── Discriminated union ── */

export type LensEntry = LensEntryBase &
  (
    | JiraChrome
    | SentryChrome
    | SlackChannelChrome
    | SlackDirectChrome
    | FigmaCommentChrome
    | MeetingNoteChrome
    | AdrCommentChrome
    | GithubReviewChrome
    | PlainTextBareChrome
    | PlainTextStickyChrome
    | PlainTextAnnotationChrome
  )

export type CardType = LensEntry["cardType"]

/** Type-safe extraction: get the entry shape for a specific card type */
export type EntryOf<T extends CardType> = Extract<LensEntry, { cardType: T }>

/** The three pillar/lens names — used across lab-lenses, EC, lab-pillars */
export const LENS_NAMES = ["users", "gaps", "patterns"] as const
export type LensName = (typeof LENS_NAMES)[number]

/** Display form of each lens name — tied to LENS_NAMES, not freeform strings */
export const LENS_DISPLAY: Record<LensName, string> = {
  users: "Users",
  gaps: "Gaps",
  patterns: "Patterns",
}

export interface Lens {
  desc: string
  entries: LensEntry[]
}

/* ── USERS ── */

const USERS: Lens = {
  desc: "What people actually experience.",
  entries: [
    {
      id: 1,
      company: "AMBOSS",
      years: "2018–2019",
      question: "How do I approach a bug found by accident?",
      cardType: "jira",
      artifact:
        "The images on the cardiology article are not showing up on my phone. Tested on iPhone 11, Safari. Other articles seem fine.",
      story:
        "I ask what phone, what browser. Older iOS, Safari. It is a format issue, quick to fix. What stays with me is how it reached us, through a colleague, not our monitoring. I bring it up in standup, and a few of us pull up the analytics. Nearly a fifth of our users are on configurations we are not testing against. We expand the matrix together.",
      iStatement: "I care as much about how we find problems as how we fix them.",
      chrome: {
        breadcrumb: { org: "AMBOSS", team: "Medical Content" },
        title: "Images on cardiology article not displaying on mobile",
        ticketId: "MED-2847",
        priority: { label: "Medium", level: "medium" },
        status: { label: "Open", tone: "open" },
        reporter: { name: "Sarah K.", avatar: "S" },
      },
    },
    {
      id: 2,
      company: "Compado",
      years: "2019–2021",
      question: "How do I look for trouble before someone reports it?",
      cardType: "sentry",
      artifact: "",
      story:
        "I open the trace logs and find the error in the click handler for product links. The page renders normally, but on certain iOS versions a tap can fire twice. Users end up on the wrong page, or nowhere at all. I fix the handler and stop the double firing. But what mattered just as much was the visibility gap. More than 300 errors had built up before anyone saw the pattern. After that, I set up a weekly error review with the team.",
      iStatement: "I look at the logs even when nothing seems broken.",
      chrome: {
        project: { org: "Compado", repo: "meal-kit-recommendation" },
        eventCount: "312 events",
        error: {
          type: "TypeError",
          message: "Cannot read property 'href' of null",
        },
        stackTrace: {
          file: "click-handler.js",
          line: 47,
          code: "const url = event.target.parentNode.href",
        },
        tags: ["safari 14.1.2", "iOS 14.8", "iPhone"],
        firstSeen: "First seen 3d ago",
      },
    },
    {
      id: 3,
      company: "DKB",
      years: "2021–2024",
      question: "How do I assess whether something is really done?",
      cardType: "slack-channel",
      artifact:
        "Hey Nina, quick flag, the transfer page is missing the recipient name. The transfer still works, but from the user side it is not clear where the money is going.",
      story:
        "Something broke in the link between data and the UI. The transfer succeeds, but without the recipient name the screen stops feeling trustworthy. I fix it, then bring the question to the team: what has to be visible on these screens before a feature deployment counts as safe? I push for QA, Product, and engineering to review the testing criteria together, so the tickets get sharper and the definition of done becomes more reliable.",
      iStatement:
        "I think about what the user sees before I think about whether the code is correct.",
      chrome: {
        channel: "#frontend-dkb",
        sender: { name: "Kaschief J.", avatar: "KJ", avatarBg: "#5B5FC7" },
        timestamp: "10:17 AM",
        emoji: [
          { icon: "👀", count: 3 },
          { icon: "⚠️", count: 1 },
        ],
      },
    },
  ],
}

/* ── GAPS ── */

const GAPS: Lens = {
  desc: "What is missing, misaligned, or disconnected.",
  entries: [
    {
      id: 4,
      company: "AMBOSS",
      years: "2018–2019",
      question: "How do I view a design that feels complete?",
      cardType: "figma-comment",
      artifact: "Here is the menu. It opens from the side.",
      story:
        "I click through the prototype. It opens cleanly, but there is no clear way out, no close action, no outside click, no escape. I ask how a user leaves this state. We walk through it together and realize we designed the entry, but not the full loop. We add the missing exits and align them with how similar patterns behave across the app.",
      iStatement: "I check how someone gets in and how they get out.",
      chrome: {
        page: "Side Menu v2",
        author: { name: "Lisa", avatar: "L" },
      },
    },
    {
      id: 5,
      company: "Compado",
      years: "2019 - 2021",
      question: "How do I handle unclear scope?",
      cardType: "slack-direct",
      artifact:
        "Before I pick this up, can we refine it a bit? It says small change, but the scope is not clear.",
      story:
        "I look at the ticket. A title, a sentence, without much specs. I recognize the cost of ambiguity and scope early, when requirements are unclear. I push for quick refinement before sprint entry, so we size the work before it lands on someone’s desk.",
      iStatement: "I make sure we understand the weight of the work before we carry it.",
      chrome: {
        sender: { name: "Kaschief J.", avatar: "KJ", avatarBg: "#5B5FC7" },
        timestamp: "3:42 PM",
      },
    },
    {
      id: 6,
      company: "CAPinside",
      years: "2021",
      question: "How do I respond when design and data disagree?",
      cardType: "figma-comment",
      artifact:
        "The new fund detail page looks clean in Figma but the data it needs does not exist in the API the same way.",
      story:
        "I start comparing the design against the API and the mismatches keep surfacing. Fields are named differently. Data is nested where the design expects it flat. The design reflects the legacy app. The API reflects the new system. I bring it to the PO and designer and we work through it together. We adjust the design where needed, raise backend requests where needed, and leave with one aligned version instead of separate assumptions.",
      iStatement:
        "I make sure what we design and what we can build are based on the same information.",
      chrome: {
        page: "Fund Detail v3",
        author: { name: "Kaschief", avatar: "K" },
        devMode: true,
      },
    },
    {
      id: 7,
      company: "CAPinside",
      years: "2021",
      question: "How do I react when my reasoning is challenged?",
      cardType: "adr-comment",
      artifact:
        "Why did you choose this approach over the alternative? Mind walking us through the trade-offs?",
      story:
        "The reasoning existed but it had stayed inside our team. I try to bring decisions into an Architectural Decision Record as early as I can, so everyone can see the pathway to a technical decision. I walk teams through what we considered, what we ruled out, and why, including the timeline, the constraints, and options. I believe that a decision becomes stronger when someone outside our immediate team is able to challenge it.",
      iStatement: "I make my reasoning visible so others can challenge it and make it better.",
      chrome: {
        docId: "ADR-012",
        subject: "Frontend rendering approach",
        status: { label: "Under review", tone: "under-review" },
        commenter: { role: "Architect", avatar: "A" },
      },
    },
  ],
}

/* ── PATTERNS ── */

const PATTERNS: Lens = {
  desc: "What repeats, accumulates, or became a shared practice.",
  entries: [
    {
      id: 8,
      company: "AMBOSS",
      years: "2018 - 2019",
      question: "How do I start when the shape is still unclear?",
      cardType: "plain-bare",
      artifact: "Can you start on this? We will figure out the details as we go.",
      story:
        "I have learned that a short conversation before building is magic. It gives me a chance to ask questions, share what I am thinking, and get feedback before I have sunk time into something that might be off track. I like to make sure we can highlight the possible blind spots before we start.",
      iStatement: "I use a short conversation to make the work clearer before it grows.",
      chrome: {
        context: "1:1 with Product Owner",
        rotation: 0.4,
      },
    },
    {
      id: 9,
      company: "AMBOSS",
      years: "2018 - 2019",
      question: "How do I approach feedback from someone who just arrived to our team?",
      cardType: "plain-sticky",
      artifact: "How does anyone work on this file? It is massive.",
      story:
        "They are looking at a file that grew with every feature cycle. Nobody intended for it to become this hard to enter. I pair with them and we sort through what is still active, what is legacy, and what they actually need to change. Then we start breaking sections into their own modules, starting with the parts blocking their work.",
      iStatement: "I listen when someone new sees what the rest of us stopped noticing.",
      chrome: {
        context: "New team member, week 1",
        rotation: -0.5,
      },
    },
    {
      id: 10,
      company: "Compado",
      years: "2019–2021",
      question: "How do I work when the same word means different things to different teams?",
      cardType: "meeting-note",
      artifact: "",
      story:
        "We had five different interactive elements and marketing called all of them “the widget.” Every conversation slowed down because we kept translating the same ambiguity back and forth, with the the real definitions buried in chats. I put together a simple shared reference: screenshots, names, where each one lived. It was a small piece of work, but after that, when someone said “the widget”, there was something objective to point to instead of another thread to untangle.",
      iStatement: "I make sure the words we use mean the same thing to everyone.",
      chrome: {
        date: "March 14, 2024",
        title: "Cross-team sync notes",
        heading: "Naming alignment",
        agendaLabel: "Agenda",
        agendaText: "Marketing terminology and implementation handoff",
        highlightedQuote:
          "Marketing keeps referring to “the widget” and engineering keeps asking “which widget?”",
        footnote: "Need shared naming before next sprint.",
        viewers: [
          { avatar: "K", color: "#E8734A" },
          { avatar: "A", color: "#45B26B" },
          { avatar: "M", color: "#5B5FC7" },
        ],
      },
    },
    {
      id: 11,
      company: "DKB",
      years: "2021–2024",
      question: "How do I close the loop before shipping?",
      cardType: "github-review",
      artifact: "",
      story:
        "I finished a feature and tagged the designer for review. The next day, nothing. When I followed up, they had already moved on and assumed it was fine. The work was built, but the loop was still open. I pushed for a quick design sign-off before merge. It took five minutes, and it caught mismatches while they were still easy to fix.",
      iStatement: "I make sure the people who defined the work get to see it before it ships.",
      chrome: {
        repo: { org: "dkb-app", name: "frontend" },
        pr: { title: "feat: account settings redesign", number: "#847" },
        labels: [
          { text: "frontend", color: "#7057FF" },
          { text: "enhancement", color: "#0E8A16" },
        ],
        reviewer: { name: "Kaschief J.", timeAgo: "2 days ago" },
      },
    },
    {
      id: 12,
      company: "DKB",
      years: "2021–2024",
      question: "How do I think about temporary things that stay too long?",
      cardType: "plain-annotation",
      artifact:
        "We have fourteen feature flags in production. Does anyone know which ones are still active?",
      story:
        "No one was sure. The flags were added to make rollouts safer, then stayed long after the risk was gone. Some had been sitting there for months, and a few were still leaking into the network response where users could see them. We audited them as a team, kept the ones still needed, and stripped out what no longer belonged. After that I push for every new flag to have a review date, so temporary decisions did not quietly become permanent.",
      iStatement: "I pay attention to what is still running and whether it should be.",
      chrome: {
        context: "During standup",
        accentColor: "#E05252",
      },
    },
  ],
}

/* ── Export ── */

/** Record keyed by LensName — stable, no array index dependency. */
export const LENSES: Record<LensName, Lens> = {
  users: USERS,
  gaps: GAPS,
  patterns: PATTERNS,
}

/** Flat list of all entries across lenses. */
export const ALL_ENTRIES: readonly LensEntry[] = LENS_NAMES.flatMap((name) => LENSES[name].entries)

/** Look up an entry by id. */
export function getEntry(id: number): LensEntry | undefined {
  return ALL_ENTRIES.find((e) => e.id === id)
}

/** Look up a lens by name. */
export function getLens(name: LensName): Lens {
  return LENSES[name]
}
