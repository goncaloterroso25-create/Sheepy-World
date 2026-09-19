import { describe, expect, it } from 'vitest';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';

describe('memory progress', () => {
  it('collects clues once and restores only at the authored reconstruction point', () => {
    const storage = new MemoryStorage();
    const state = new GameStateStore(new SaveRepository(storage));

    for(const clue of ['first-date-sleep','first-date-bench','first-date-car'])expect(state.collectFragment('first-date',clue,3)).toBe(true);
    expect(state.collectFragment('first-date','first-date-car',3)).toBe(false);
    expect(state.snapshot.memories['first-date']?.restored).toBe(false);
    expect(state.restoreMemory('first-date')).toBe(true);expect(state.restoreMemory('first-date')).toBe(false);
    expect(state.snapshot.memories['first-date']?.restored).toBe(true);

    const reloaded = new GameStateStore(new SaveRepository(storage));
    expect(reloaded.snapshot.memories['first-date']?.restored).toBe(true);
  });
});
