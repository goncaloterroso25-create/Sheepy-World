import type { MemoryProgress } from '../types/game';

export type ScrapbookLivingStage = 'PLAIN' | 'STIRRING' | 'REMEMBERING' | 'PERSONAL';
export type UnresolvedDoodleKind =
  | 'sleep-trace'
  | 'quiet-strokes'
  | 'headlights'
  | 'torn-poster'
  | 'island-ink'
  | 'crowd-shadows'
  | 'buried-car'
  | 'crossed-branches'
  | 'pale-round-thing'
  | 'unknown';
export type RestoredDoodleKind =
  | 'clock'
  | 'bench'
  | 'car'
  | 'poster'
  | 'night'
  | 'venue'
  | 'branches'
  | 'snowball'
  | 'snowman'
  | 'unknown';

export const SCRAPBOOK_LIVING_FLAGS = {
  movedReactionSeen: 'scrapbook-living:moved-reaction-seen',
  autoTurnSeen: 'scrapbook-living:auto-turn-seen',
  latestRestored: 'scrapbook-living:latest-restored',
} as const;

export const UNRESOLVED_DOODLES: Readonly<Record<string, UnresolvedDoodleKind>> = {
  'first-date-sleep': 'sleep-trace',
  'first-date-bench': 'quiet-strokes',
  'first-date-car': 'headlights',
  'performance-fourth-date': 'torn-poster',
  'performance-night': 'island-ink',
  'performance-venue': 'crowd-shadows',
  'snow-jeronimo': 'buried-car',
  'snow-weather': 'crossed-branches',
  'snow-play': 'pale-round-thing',
};

const RESTORED_DOODLES: Readonly<Record<string, RestoredDoodleKind>> = {
  'first-date-sleep': 'clock',
  'first-date-bench': 'bench',
  'first-date-car': 'car',
  'performance-fourth-date': 'poster',
  'performance-night': 'night',
  'performance-venue': 'venue',
  // The buried-car clue resolves into the car itself. The completed snowman is
  // reserved for the restored spread's combined illustration.
  'snow-jeronimo': 'car',
  'snow-weather': 'branches',
  'snow-play': 'snowball',
  'snow-memory': 'snowman',
};

export function restoredMemoryCount(progress: Readonly<Record<string, MemoryProgress>>): number {
  return Object.values(progress).filter(entry => entry.restored).length;
}

export function scrapbookLivingStage(restoredCount: number): ScrapbookLivingStage {
  if (restoredCount <= 0) return 'PLAIN';
  if (restoredCount === 1) return 'STIRRING';
  if (restoredCount === 2) return 'REMEMBERING';
  return 'PERSONAL';
}

export function unresolvedDoodleKind(fragmentId: string): UnresolvedDoodleKind {
  return UNRESOLVED_DOODLES[fragmentId] ?? 'unknown';
}

export function restoredDoodleKind(fragmentId: string): RestoredDoodleKind {
  return RESTORED_DOODLES[fragmentId] ?? 'unknown';
}

export function shouldPlayMovedReaction(restoredCount: number, flags: Readonly<Record<string, string>>): boolean {
  return restoredCount > 0 && flags[SCRAPBOOK_LIVING_FLAGS.movedReactionSeen] !== 'true';
}

export function autoTurnTarget(restoredCount: number, flags: Readonly<Record<string, string>>,
  currentMemoryId: string | undefined): string | undefined {
  // The page-turn is a later authored beat, never concurrent with the book's
  // first uncanny movement/reaction.
  if (restoredCount < 2 || flags[SCRAPBOOK_LIVING_FLAGS.movedReactionSeen] !== 'true'
    || flags[SCRAPBOOK_LIVING_FLAGS.autoTurnSeen] === 'true') return;
  const latest = flags[SCRAPBOOK_LIVING_FLAGS.latestRestored];
  return latest && latest !== currentMemoryId ? latest : undefined;
}

export function futurePageTrace(stage: ScrapbookLivingStage): 'NONE' | 'LEAF' | 'COFFEE_RING' | 'TICKET_THREAD' {
  if (stage === 'PLAIN') return 'NONE';
  if (stage === 'STIRRING') return 'LEAF';
  if (stage === 'REMEMBERING') return 'COFFEE_RING';
  return 'TICKET_THREAD';
}
