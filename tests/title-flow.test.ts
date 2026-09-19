import { describe, expect, it } from 'vitest';
import { createDefaultSave } from '../src/systems/SaveSystem';
import {
  hasMeaningfulProgress,
  openingActionLabel,
  titleActionsForSave,
  titleCreditsAvailable,
} from '../src/systems/TitleFlow';

describe('title flow', () => {
  it('offers a single start action for a new save', () => {
    const save = createDefaultSave();
    expect(hasMeaningfulProgress(save)).toBe(false);
    expect(titleActionsForSave(save)).toEqual(['START']);
  });

  it('offers continue and explicit new game after progress', () => {
    const save = createDefaultSave();
    save.counters.yellowCars = 1;
    expect(hasMeaningfulProgress(save)).toBe(true);
    expect(titleActionsForSave(save)).toEqual(['CONTINUE', 'NEW_GAME']);
  });

  it('uses neutral opening labels without exposing the game identity', () => {
    expect(openingActionLabel('START')).toBe('OPEN');
    expect(openingActionLabel('CONTINUE')).toBe('CONTINUE');
    expect(openingActionLabel('NEW_GAME')).toBe('BEGIN AGAIN');
  });

  it('exposes credits only after canonical story completion', () => {
    const save = createDefaultSave();
    expect(titleCreditsAvailable(save)).toBe(false);
    save.counters.yellowCars = 1;
    expect(titleCreditsAvailable(save)).toBe(false);
    save.flags['year-one-complete'] = 'true';
    expect(titleCreditsAvailable(save)).toBe(true);
  });
});
