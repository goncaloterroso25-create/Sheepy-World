import { describe, expect, it } from 'vitest';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';

describe('inventory progress', () => {
  it('adds each artifact once and persists it', () => {
    const storage = new MemoryStorage();
    const state = new GameStateStore(new SaveRepository(storage));
    expect(state.addArtifact('bell')).toBe(true);
    expect(state.addArtifact('bell')).toBe(false);
    expect(state.snapshot.inventory).toEqual(['bell']);
    expect(new GameStateStore(new SaveRepository(storage)).snapshot.inventory).toEqual(['bell']);
  });
});
