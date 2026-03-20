/**
 * Story content for the 3-lens structure: Users, Gaps, Patterns.
 *
 * Each entry maps to a skeuomorphic artifact card and contains:
 * - artifact: what the card depicts (the surface-level moment)
 * - story: the narrative behind the artifact
 * - iStatement: the personal takeaway / I-statement
 * - keywords: thematic tags
 */

export interface LensEntry {
  id: number;
  company: string;
  years: string;
  artifact: string;
  story: string;
  iStatement: string;
  keywords: string[];
}

export interface Lens {
  name: string;
  desc: string;
  entries: LensEntry[];
}

/* ── USERS ── */

const USERS: Lens = {
  name: "Users",
  desc: "What people actually experience.",
  entries: [
    {
      id: 1,
      company: "AMBOSS",
      years: "2018\u20132019",
      artifact:
        "Bug report from a colleague: \u201CThe images on the cardiology article are not showing up on my phone.\u201D",
      story:
        "I ask what phone, what browser. Older iOS, Safari. Format issue, quick to fix. But it came through a colleague, not our monitoring. I flag it in standup and a few of us pull up the analytics. Nearly a fifth of our users are on configurations we are not testing against. We expand the matrix together.",
      iStatement:
        "I care as much about how we find problems as how we fix them.",
      keywords: ["Curiosity", "Initiative"],
    },
    {
      id: 2,
      company: "Compado",
      years: "2019\u20132021",
      artifact:
        "Sentry log: TypeError on the meal kit recommendation page. Frequency: 300+ in the last 24 hours. All from mobile Safari.",
      story:
        "I open the log and the error is in the click handler for product links. The page renders fine, but when a user taps a product on certain iOS versions, the tap registers twice. They end up on the wrong page or nowhere at all. I trace the issue, fix the handler, and prevent the double-firing. But 300+ errors in a day and nobody noticed until I happened to check. I set up a weekly error review with the team after that.",
      iStatement: "I look at the logs even when nothing seems broken.",
      keywords: ["Initiative", "Ownership"],
    },
    {
      id: 3,
      company: "DKB",
      years: "2021\u20132024",
      artifact:
        "Slack: \u201CKash, have you seen the transfer page? The recipient name is missing. A user would not know where their money is going.\u201D",
      story:
        "Something broke in the mapping. The transfer goes through fine but a user seeing money leave with no name attached is not going to trust it. I fix it and raise the question with the team: what do the transfer screens need to show before we call a deploy done? We write the checklist together.",
      iStatement:
        "I think about what the user sees before I think about whether the code is correct.",
      keywords: ["User empathy", "Foresight"],
    },
  ],
};

/* ── GAPS ── */

const GAPS: Lens = {
  name: "Gaps",
  desc: "What is missing, misaligned, or disconnected.",
  entries: [
    {
      id: 4,
      company: "AMBOSS",
      years: "2018\u20132019",
      artifact:
        "Designer during handoff: \u201CHere is the menu. It opens from the side.\u201D",
      story:
        "I click through the prototype. It opens cleanly, but I cannot find a clear way to exit. No close action, no outside click, no escape. I ask how a user leaves this state. We walk through it together. It was designed as an entry point, not as a full cycle. We add the missing exits and make them consistent with how similar patterns behave across the app.",
      iStatement: "I check how someone gets in and how they get out.",
      keywords: ["User empathy", "Foresight"],
    },
    {
      id: 5,
      company: "Compado",
      years: "2019\u20132021",
      artifact:
        "Mid-sprint, colleague messages me: \u201CKash, this ticket said \u2018small change\u2019 but I have been on it for two days.\u201D",
      story:
        "I look at the ticket. A title and a one-line description. Of course it looked small. I suggest we start refining tickets as a team before they enter the sprint. It takes a few weeks to become a habit but the \u201Csmall change that took three days\u201D conversations stop.",
      iStatement:
        "I make sure we understand the weight of the work before we carry it.",
      keywords: ["Collaboration", "Patience"],
    },
    {
      id: 6,
      company: "CAPinside",
      years: "2021",
      artifact:
        "Design handoff: the new fund detail page looks clean in Figma but the data it needs does not exist in the API the same way.",
      story:
        "I start comparing the design against the API and the mismatches add up. Fields named differently. Data nested where the design expects it flat. The designer built from what the legacy app showed on screen. The new API is structured differently. I bring it to the PO and designer and we map it out together. Some things shift on the design side, some become requests to backend. Neither side had it wrong. They just had not looked at the same source.",
      iStatement:
        "I make sure what we design and what we can build are based on the same reality.",
      keywords: ["Alignment", "Communication"],
    },
    {
      id: 7,
      company: "CAPinside",
      years: "2021",
      artifact:
        "ADR meeting, architect from another team: \u201CWhy did you choose this approach over the alternative? Walk us through the trade-offs.\u201D",
      story:
        "The reasoning existed but it had stayed inside our team. I walk them through it. What we considered, what we ruled out, why. The constraints: timeline, the legacy system, what the API could support. They push back on one point. Fair challenge. We adjust. The decision gets stronger because someone outside our immediate team tested it.",
      iStatement:
        "I make my reasoning visible so others can challenge it and make it better.",
      keywords: ["Communication", "Collaboration"],
    },
  ],
};

/* ── PATTERNS ── */

const PATTERNS: Lens = {
  name: "Patterns",
  desc: "What repeats, accumulates, or became a shared practice.",
  entries: [
    {
      id: 8,
      company: "AMBOSS",
      years: "2018\u20132019",
      artifact:
        "PO in a 1:1: \u201CCan you start on this? We will figure out the details as we go.\u201D",
      story:
        "I have learned that a short conversation before building is magic.",
      iStatement:
        "I have learned that a short conversation before building is magic.",
      keywords: ["Patience", "Communication"],
    },
    {
      id: 9,
      company: "AMBOSS",
      years: "2018\u20132019",
      artifact:
        "New team member during onboarding: \u201CHow does anyone work on this file? It is massive.\u201D",
      story:
        "They are looking at a file that has grown with every feature cycle. Nobody planned for it to be this big. I pair with them and we map out which parts are active and which are legacy. We start carving off sections into their own modules, starting with the ones they need to touch.",
      iStatement:
        "I listen when someone new sees what the rest of us stopped noticing.",
      keywords: ["Curiosity", "Collaboration"],
    },
    {
      id: 10,
      company: "Compado",
      years: "2019\u20132021",
      artifact:
        "Cross-team sync: marketing keeps referring to \u201Cthe widget\u201D and engineering keeps asking \u201Cwhich widget?\u201D",
      story:
        "We have five different interactive elements and marketing calls all of them \u201Cthe widget.\u201D Every conversation is twice as long because both sides are translating in real time. I put together a simple shared reference: screenshots, names, where each one lives. Small piece of work. But after that, someone says \u201Cthe widget\u201D and there is a page to point at instead of a conversation to untangle.",
      iStatement:
        "I make sure the words we use mean the same thing to everyone.",
      keywords: ["Alignment", "Transparency"],
    },
    {
      id: 11,
      company: "DKB",
      years: "2021\u20132024",
      artifact:
        "I finish a feature and tag the designer for review. Next day, nothing. I follow up. They have moved on to the next project and assumed it was fine.",
      story:
        "Nobody closed the loop. I suggest we add a design sign-off before merge. Quick look, five minutes. The drifts get caught while they are still easy to fix.",
      iStatement:
        "I make sure the people who defined the work get to see it before it ships.",
      keywords: ["Ownership", "Initiative"],
    },
    {
      id: 12,
      company: "DKB",
      years: "2021\u20132024",
      artifact:
        "Standup: \u201CWe have fourteen feature flags in production. Does anyone know which ones are still active?\u201D",
      story:
        "No one is sure. They were added for safe rollouts and left in place long after the features settled. Some of them months old, some with flag names still exposed in the markup where a user could see them. We audit them as a team and strip out what is no longer needed. After that I push for every new flag to get a review date. If the feature is stable by then, the flag comes out.",
      iStatement:
        "I pay attention to what is still running and whether it should be.",
      keywords: ["Ownership", "Transparency"],
    },
  ],
};

/* ── Export ── */

export const LENSES: readonly Lens[] = [USERS, GAPS, PATTERNS] as const;

/** Flat list of all entries across lenses. */
export const ALL_ENTRIES: readonly LensEntry[] = LENSES.flatMap(
  (l) => l.entries,
);

/** Look up an entry by id. */
export function getEntry(id: number): LensEntry | undefined {
  return ALL_ENTRIES.find((e) => e.id === id);
}
