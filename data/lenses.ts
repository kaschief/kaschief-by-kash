/**
 * Story content for the 3-lens structure: Users, Gaps, Patterns.
 * SINGLE SOURCE OF TRUTH — all content lives here.
 *
 * Each entry maps to a skeuomorphic artifact card and contains:
 * - artifact: the rendered text content displayed on the card
 * - story: the narrative behind the artifact
 * - iStatement: the personal takeaway / I-statement
 * - keywords: thematic tags
 * - cardType: discriminant for which visual card template to use
 * - chrome: per-card-type metadata (names, IDs, channels, etc.)
 */

/* ── Shared base — every entry has these ── */

interface LensEntryBase {
  id: number;
  company: string;
  years: string;
  artifact: string;
  story: string;
  iStatement: string;
  keywords: string[];
}

/* ── Per-card-type chrome ── */

interface JiraChrome {
  cardType: "jira";
  chrome: {
    breadcrumb: { org: string; team: string };
    title: string;
    ticketId: string;
    priority: { label: string; level: "low" | "medium" | "high" | "critical" };
    status: { label: string; tone: "open" | "in-progress" | "done" };
    reporter: { name: string; avatar: string };
  };
}

interface SentryChrome {
  cardType: "sentry";
  chrome: {
    project: { org: string; repo: string };
    eventCount: string;
    error: { type: string; message: string };
    stackTrace: { file: string; line: number; code: string };
    tags: string[];
    firstSeen: string;
  };
}

interface SlackChannelChrome {
  cardType: "slack-channel";
  chrome: {
    channel: string;
    sender: { name: string; avatar: string; avatarBg: string };
    timestamp: string;
    emoji?: { icon: string; count: number }[];
  };
}

interface SlackDirectChrome {
  cardType: "slack-direct";
  chrome: {
    sender: { name: string; avatar: string; avatarBg: string };
    timestamp: string;
    emoji?: { icon: string; count: number }[];
  };
}

interface FigmaCommentChrome {
  cardType: "figma-comment";
  chrome: {
    page: string;
    author: { name: string; avatar: string };
    devMode?: boolean;
  };
}

interface MeetingNoteChrome {
  cardType: "meeting-note";
  chrome: {
    date: string;
    title: string;
    agendaLabel: string;
    agendaText: string;
    highlightedQuote: string;
    footnote: string;
    viewers: { avatar: string; color: string }[];
  };
}

interface AdrCommentChrome {
  cardType: "adr-comment";
  chrome: {
    docId: string;
    subject: string;
    status: { label: string; tone: "under-review" | "accepted" | "superseded" };
    commenter: { role: string; avatar: string };
  };
}

interface GithubReviewChrome {
  cardType: "github-review";
  chrome: {
    repo: { org: string; name: string };
    pr: { title: string; number: string };
    labels: { text: string; color: string }[];
    reviewer: { name: string; timeAgo: string };
  };
}

interface PlainTextBareChrome {
  cardType: "plain-bare";
  chrome: {
    context: string;
    rotation?: number;
  };
}

interface PlainTextStickyChrome {
  cardType: "plain-sticky";
  chrome: {
    context: string;
    rotation?: number;
  };
}

interface PlainTextAnnotationChrome {
  cardType: "plain-annotation";
  chrome: {
    context: string;
    accentColor?: string;
  };
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
  );

export type CardType = LensEntry["cardType"];

/** Type-safe extraction: get the entry shape for a specific card type */
export type EntryOf<T extends CardType> = Extract<LensEntry, { cardType: T }>;

/** The three pillar/lens names — used across curtain-thesis, EC, lab-pillars */
export const LENS_NAMES = ["users", "gaps", "patterns"] as const;
export type LensName = (typeof LENS_NAMES)[number];

/** Display form of each lens name — tied to LENS_NAMES, not freeform strings */
export const LENS_DISPLAY: Record<LensName, string> = {
  users: "Users",
  gaps: "Gaps",
  patterns: "Patterns",
};

export interface Lens {
  desc: string;
  entries: LensEntry[];
}

/* ── USERS ── */

const USERS: Lens = {

  desc: "What people actually experience.",
  entries: [
    {
      id: 1,
      company: "AMBOSS",
      years: "2018\u20132019",
      cardType: "jira",
      artifact:
        "The images on the cardiology article are not showing up on my phone. Tested on iPhone 11, Safari. Other articles seem fine.",
      story:
        "I ask what phone, what browser. Older iOS, Safari. Format issue, quick to fix. But it came through a colleague, not our monitoring. I flag it in standup and a few of us pull up the analytics. Nearly a fifth of our users are on configurations we are not testing against. We expand the matrix together.",
      iStatement:
        "I care as much about how we find problems as how we fix them.",
      keywords: ["Curiosity", "Initiative"],
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
      years: "2019\u20132021",
      cardType: "sentry",
      artifact:
        "Sentry log: TypeError on the meal kit recommendation page. Frequency: 300+ in the last 24 hours. All from mobile Safari.",
      story:
        "I open the log and the error is in the click handler for product links. The page renders fine, but when a user taps a product on certain iOS versions, the tap registers twice. They end up on the wrong page or nowhere at all. I trace the issue, fix the handler, and prevent the double-firing. But 300+ errors in a day and nobody noticed until I happened to check. I set up a weekly error review with the team after that.",
      iStatement: "I look at the logs even when nothing seems broken.",
      keywords: ["Initiative", "Ownership"],
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
      years: "2021\u20132024",
      cardType: "slack-channel",
      artifact:
        "Kash, have you seen the transfer page? The recipient name is missing. A user would not know where their money is going.",
      story:
        "Something broke in the mapping. The transfer goes through fine but a user seeing money leave with no name attached is not going to trust it. I fix it and raise the question with the team: what do the transfer screens need to show before we call a deploy done? We write the checklist together.",
      iStatement:
        "I think about what the user sees before I think about whether the code is correct.",
      keywords: ["User empathy", "Foresight"],
      chrome: {
        channel: "#frontend-dkb",
        sender: { name: "Thomas M.", avatar: "T", avatarBg: "#2B5A3F" },
        timestamp: "10:17 AM",
        emoji: [
          { icon: "\uD83D\uDC40", count: 3 },
          { icon: "\u26A0\uFE0F", count: 1 },
        ],
      },
    },
  ],
};

/* ── GAPS ── */

const GAPS: Lens = {

  desc: "What is missing, misaligned, or disconnected.",
  entries: [
    {
      id: 4,
      company: "AMBOSS",
      years: "2018\u20132019",
      cardType: "figma-comment",
      artifact: "Here is the menu. It opens from the side.",
      story:
        "I click through the prototype. It opens cleanly, but I cannot find a clear way to exit. No close action, no outside click, no escape. I ask how a user leaves this state. We walk through it together. It was designed as an entry point, not as a full cycle. We add the missing exits and make them consistent with how similar patterns behave across the app.",
      iStatement: "I check how someone gets in and how they get out.",
      keywords: ["User empathy", "Foresight"],
      chrome: {
        page: "Side Menu v2",
        author: { name: "Lisa", avatar: "L" },
      },
    },
    {
      id: 5,
      company: "Compado",
      years: "2019\u20132021",
      cardType: "slack-direct",
      artifact:
        "This ticket said \u2018small change\u2019 but I have been on it for two days.",
      story:
        "I look at the ticket. A title and a one-line description. Of course it looked small. I suggest we start refining tickets as a team before they enter the sprint. It takes a few weeks to become a habit but the \u201Csmall change that took three days\u201D conversations stop.",
      iStatement:
        "I make sure we understand the weight of the work before we carry it.",
      keywords: ["Collaboration", "Patience"],
      chrome: {
        sender: { name: "Marcus W.", avatar: "M", avatarBg: "#5B5FC7" },
        timestamp: "3:42 PM",
      },
    },
    {
      id: 6,
      company: "CAPinside",
      years: "2021",
      cardType: "figma-comment",
      artifact:
        "The new fund detail page looks clean in Figma but the data it needs does not exist in the API the same way.",
      story:
        "I start comparing the design against the API and the mismatches add up. Fields named differently. Data nested where the design expects it flat. The designer built from what the legacy app showed on screen. The new API is structured differently. I bring it to the PO and designer and we map it out together. Some things shift on the design side, some become requests to backend. Neither side had it wrong. They just had not looked at the same source.",
      iStatement:
        "I make sure what we design and what we can build are based on the same reality.",
      keywords: ["Alignment", "Communication"],
      chrome: {
        page: "Fund Detail v3",
        author: { name: "Designer", avatar: "D" },
        devMode: true,
      },
    },
    {
      id: 7,
      company: "CAPinside",
      years: "2021",
      cardType: "adr-comment",
      artifact:
        "Why did you choose this approach over the alternative? Walk us through the trade-offs.",
      story:
        "The reasoning existed but it had stayed inside our team. I walk them through it. What we considered, what we ruled out, why. The constraints: timeline, the legacy system, what the API could support. They push back on one point. Fair challenge. We adjust. The decision gets stronger because someone outside our immediate team tested it.",
      iStatement:
        "I make my reasoning visible so others can challenge it and make it better.",
      keywords: ["Communication", "Collaboration"],
      chrome: {
        docId: "ADR-012",
        subject: "Frontend rendering approach",
        status: { label: "Under review", tone: "under-review" },
        commenter: { role: "Architect", avatar: "A" },
      },
    },
  ],
};

/* ── PATTERNS ── */

const PATTERNS: Lens = {

  desc: "What repeats, accumulates, or became a shared practice.",
  entries: [
    {
      id: 8,
      company: "AMBOSS",
      years: "2018\u20132019",
      cardType: "plain-bare",
      artifact:
        "Can you start on this? We will figure out the details as we go.",
      story:
        "I have learned that a short conversation before building is magic.",
      iStatement:
        "I have learned that a short conversation before building is magic.",
      keywords: ["Patience", "Communication"],
      chrome: {
        context: "1:1 with Product Owner",
        rotation: 0.4,
      },
    },
    {
      id: 9,
      company: "AMBOSS",
      years: "2018\u20132019",
      cardType: "plain-sticky",
      artifact: "How does anyone work on this file? It is massive.",
      story:
        "They are looking at a file that has grown with every feature cycle. Nobody planned for it to be this big. I pair with them and we map out which parts are active and which are legacy. We start carving off sections into their own modules, starting with the ones they need to touch.",
      iStatement:
        "I listen when someone new sees what the rest of us stopped noticing.",
      keywords: ["Curiosity", "Collaboration"],
      chrome: {
        context: "New team member, week 1",
        rotation: -0.5,
      },
    },
    {
      id: 10,
      company: "Compado",
      years: "2019\u20132021",
      cardType: "meeting-note",
      artifact:
        "Cross-team sync: marketing keeps referring to \u201Cthe widget\u201D and engineering keeps asking \u201Cwhich widget?\u201D",
      story:
        "We have five different interactive elements and marketing calls all of them \u201Cthe widget.\u201D Every conversation is twice as long because both sides are translating in real time. I put together a simple shared reference: screenshots, names, where each one lives. Small piece of work. But after that, someone says \u201Cthe widget\u201D and there is a page to point at instead of a conversation to untangle.",
      iStatement:
        "I make sure the words we use mean the same thing to everyone.",
      keywords: ["Alignment", "Transparency"],
      chrome: {
        date: "March 14, 2024",
        title: "Cross-team sync notes",
        agendaLabel: "Agenda",
        agendaText: "Marketing terminology and implementation handoff",
        highlightedQuote:
          "Marketing keeps referring to \u201Cthe widget\u201D and engineering keeps asking \u201Cwhich widget?\u201D",
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
      years: "2021\u20132024",
      cardType: "github-review",
      artifact:
        "I finish a feature and tag the designer for review. Next day, nothing. I follow up. They have moved on to the next project and assumed it was fine.",
      story:
        "Nobody closed the loop. I suggest we add a design sign-off before merge. Quick look, five minutes. The drifts get caught while they are still easy to fix.",
      iStatement:
        "I make sure the people who defined the work get to see it before it ships.",
      keywords: ["Ownership", "Initiative"],
      chrome: {
        repo: { org: "dkb-app", name: "frontend" },
        pr: { title: "feat: account settings redesign", number: "#847" },
        labels: [
          { text: "frontend", color: "#7057FF" },
          { text: "enhancement", color: "#0E8A16" },
        ],
        reviewer: { name: "Lisa K.", timeAgo: "2 days ago" },
      },
    },
    {
      id: 12,
      company: "DKB",
      years: "2021\u20132024",
      cardType: "plain-annotation",
      artifact:
        "We have fourteen feature flags in production. Does anyone know which ones are still active?",
      story:
        "No one is sure. They were added for safe rollouts and left in place long after the features settled. Some of them months old, some with flag names still exposed in the markup where a user could see them. We audit them as a team and strip out what is no longer needed. After that I push for every new flag to get a review date. If the feature is stable by then, the flag comes out.",
      iStatement:
        "I pay attention to what is still running and whether it should be.",
      keywords: ["Ownership", "Transparency"],
      chrome: {
        context: "During standup",
        accentColor: "#E05252",
      },
    },
  ],
};

/* ── Export ── */

/** Record keyed by LensName — stable, no array index dependency. */
export const LENSES: Record<LensName, Lens> = {
  users: USERS,
  gaps: GAPS,
  patterns: PATTERNS,
};

/** Flat list of all entries across lenses. */
export const ALL_ENTRIES: readonly LensEntry[] = LENS_NAMES.flatMap(
  (name) => LENSES[name].entries,
);

/** Look up an entry by id. */
export function getEntry(id: number): LensEntry | undefined {
  return ALL_ENTRIES.find((e) => e.id === id);
}

/** Look up a lens by name. */
export function getLens(name: LensName): Lens {
  return LENSES[name];
}
