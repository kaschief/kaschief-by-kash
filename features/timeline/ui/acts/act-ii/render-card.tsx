"use client";

/**
 * Maps a LensEntry to its visual card component.
 * Single wiring point — both gallery and scroll choreography use this.
 * Exhaustive switch on cardType: compiler catches missing variants.
 */

import type { LensEntry } from "@data";
import {
  JiraCard,
  SentryCard,
  SlackMessage,
  FigmaComment,
  MeetingNote,
  AdrComment,
  GithubReviewCard,
  PlainTextBare,
  PlainTextSticky,
  PlainTextAnnotation,
} from "./artifact-cards";

export function renderCard(
  entry: LensEntry,
  style?: React.CSSProperties,
): React.JSX.Element {
  const { artifact } = entry;

  switch (entry.cardType) {
    case "jira":
      return (
        <JiraCard
          style={style}
          breadcrumb={entry.chrome.breadcrumb}
          title={entry.chrome.title}
          ticketId={entry.chrome.ticketId}
          description={artifact}
          priority={entry.chrome.priority}
          status={entry.chrome.status}
          reporter={entry.chrome.reporter}
        />
      );

    case "sentry":
      return (
        <SentryCard
          style={style}
          project={entry.chrome.project}
          eventCount={entry.chrome.eventCount}
          error={entry.chrome.error}
          stackTrace={entry.chrome.stackTrace}
          tags={entry.chrome.tags}
          firstSeen={entry.chrome.firstSeen}
        />
      );

    case "slack-channel":
      return (
        <SlackMessage
          style={style}
          sender={entry.chrome.sender.name}
          avatar={entry.chrome.sender.avatar}
          avatarBg={entry.chrome.sender.avatarBg}
          timestamp={entry.chrome.timestamp}
          text={artifact}
          channel={entry.chrome.channel}
          emoji={entry.chrome.emoji}
        />
      );

    case "slack-direct":
      return (
        <SlackMessage
          style={style}
          sender={entry.chrome.sender.name}
          avatar={entry.chrome.sender.avatar}
          avatarBg={entry.chrome.sender.avatarBg}
          timestamp={entry.chrome.timestamp}
          text={artifact}
          direct
          emoji={entry.chrome.emoji}
        />
      );

    case "figma-comment":
      return (
        <FigmaComment
          style={style}
          author={entry.chrome.author.name}
          avatar={entry.chrome.author.avatar}
          page={entry.chrome.page}
          comment={artifact}
          devMode={entry.chrome.devMode}
        />
      );

    case "meeting-note":
      return (
        <MeetingNote
          style={style}
          date={entry.chrome.date}
          title={entry.chrome.title}
          heading={entry.chrome.heading}
          agendaLabel={entry.chrome.agendaLabel}
          agendaText={entry.chrome.agendaText}
          highlightedQuote={entry.chrome.highlightedQuote}
          footnote={entry.chrome.footnote}
          viewers={entry.chrome.viewers}
        />
      );

    case "adr-comment":
      return (
        <AdrComment
          style={style}
          docId={entry.chrome.docId}
          subject={entry.chrome.subject}
          status={entry.chrome.status}
          commenter={entry.chrome.commenter}
          comment={artifact}
        />
      );

    case "github-review":
      return (
        <GithubReviewCard
          style={style}
          repo={entry.chrome.repo}
          pr={entry.chrome.pr}
          labels={entry.chrome.labels}
          reviewer={entry.chrome.reviewer}
        />
      );

    case "plain-bare":
      return (
        <PlainTextBare
          style={style}
          context={entry.chrome.context}
          quote={artifact}
          rotation={entry.chrome.rotation}
        />
      );

    case "plain-sticky":
      return (
        <PlainTextSticky
          style={style}
          context={entry.chrome.context}
          quote={artifact}
          rotation={entry.chrome.rotation}
        />
      );

    case "plain-annotation":
      return (
        <PlainTextAnnotation
          style={style}
          context={entry.chrome.context}
          quote={artifact}
          accentColor={entry.chrome.accentColor}
        />
      );
  }
}
