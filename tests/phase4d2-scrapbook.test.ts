import { describe, expect, it } from 'vitest';
import { MEMORIES } from '../src/data/memories';
import {
  SCRAPBOOK_LIVING_FLAGS,
  autoTurnTarget,
  futurePageTrace,
  restoredDoodleKind,
  scrapbookLivingStage,
  shouldPlayMovedReaction,
  unresolvedDoodleKind,
} from '../src/ui/LivingScrapbook';

describe('Phase 4D.2 spoiler-safe living Scrapbook', () => {
  it('uses incomplete evidence before Snow is restored and never a snowman', () => {
    expect(unresolvedDoodleKind('snow-jeronimo')).toBe('buried-car');
    expect(unresolvedDoodleKind('snow-weather')).toBe('crossed-branches');
    expect(unresolvedDoodleKind('snow-play')).toBe('pale-round-thing');
    expect(restoredDoodleKind('snow-jeronimo')).toBe('car');
    expect(restoredDoodleKind('snow-memory')).toBe('snowman');
    expect(Object.values(MEMORIES['snow-day']!.fragmentClues).join(' ')).not.toMatch(/snowman|jer[oó]nimo/i);
  });

  it('keeps first-date and concert conclusions out of unresolved labels', () => {
    expect(Object.values(MEMORIES['first-date']!.fragmentClues).join(' ')).not.toMatch(/date|kiss|romance/i);
    expect(Object.values(MEMORIES['porto-performance']!.fragmentClues).join(' ')).not.toMatch(/performance|band|concert|date/i);
    expect(unresolvedDoodleKind('first-date-car')).toBe('headlights');
    expect(unresolvedDoodleKind('performance-night')).toBe('island-ink');
  });

  it('progresses from a plain book to a restrained personal voice', () => {
    expect([0, 1, 2, 3].map(scrapbookLivingStage)).toEqual(['PLAIN', 'STIRRING', 'REMEMBERING', 'PERSONAL']);
    expect([0, 1, 2, 3].map(count => futurePageTrace(scrapbookLivingStage(count))))
      .toEqual(['NONE', 'LEAF', 'COFFEE_RING', 'TICKET_THREAD']);
  });

  it('plays each uncanny authored beat once and only turns toward a different restored page', () => {
    expect(shouldPlayMovedReaction(1, {})).toBe(true);
    expect(shouldPlayMovedReaction(1, { [SCRAPBOOK_LIVING_FLAGS.movedReactionSeen]: 'true' })).toBe(false);
    const flags = {
      [SCRAPBOOK_LIVING_FLAGS.latestRestored]: 'snow-day',
      [SCRAPBOOK_LIVING_FLAGS.movedReactionSeen]: 'true',
    };
    expect(autoTurnTarget(2, { [SCRAPBOOK_LIVING_FLAGS.latestRestored]: 'snow-day' }, 'first-date')).toBeUndefined();
    expect(autoTurnTarget(2, flags, 'first-date')).toBe('snow-day');
    expect(autoTurnTarget(2, flags, 'snow-day')).toBeUndefined();
    expect(autoTurnTarget(2, { ...flags, [SCRAPBOOK_LIVING_FLAGS.autoTurnSeen]: 'true' }, 'first-date')).toBeUndefined();
  });
});
