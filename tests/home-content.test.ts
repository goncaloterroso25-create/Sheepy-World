import { describe, expect, it } from 'vitest';
import { HOME_DISCOVERIES, HOME_FUTURE_HOOKS, HOME_INSPECT_COPY } from '../src/data/homeContent';
import { ITEMS } from '../src/data/items';
import { CURATED_AUDIO } from '../src/config/audio';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';

describe('small personal Home content hooks', () => {
  it('uses exactly two planned contextual keepsakes with compact Bag copy and icons', () => {
    expect(HOME_DISCOVERIES.map(d => d.blueprintId)).toEqual(['A03', 'A01']);
    expect(new Set(HOME_DISCOVERIES.map(d => d.interactionId)).size).toBe(2);
    expect(ITEMS['half-glasses']?.description).toBe('Durability: 50%.');
    expect(ITEMS['naruto-shuriken-keychain']?.annotation).toContain("Gonçalo's first gifts");
    for (const d of HOME_DISCOVERIES) expect(ITEMS[d.id]?.iconKey).toBeTruthy();
    expect(ITEMS['home-emergency-spoon']).toBeUndefined();
  });
  it('persists both rewards once without adding food, hair or equipment state', () => {
    const storage = new MemoryStorage();
    const state = new GameStateStore(new SaveRepository(storage));
    for (const d of HOME_DISCOVERIES) {
      expect(state.addArtifact(d.id)).toBe(true); expect(state.addArtifact(d.id)).toBe(false);
    }
    const loaded = new GameStateStore(new SaveRepository(storage));
    expect(loaded.snapshot.inventory).toEqual(['half-glasses', 'naruto-shuriken-keychain']);
    expect(loaded.snapshot).not.toHaveProperty('hairstyle');
    expect(loaded.snapshot).not.toHaveProperty('food');
  });
  it('leaves future COF voice and removable-hair-tie mechanics inactive', () => {
    expect(HOME_FUTURE_HOOKS.hairTie.role).toBe('prop-only');
    expect(HOME_FUTURE_HOOKS.cof.futureVoice.map(v => v.text)).toEqual(['You want cof?', 'I make cof for pretty baby!']);
    expect(CURATED_AUDIO.assets.some(a => /cof|hair|nugg|song/.test(a.key))).toBe(false);
    expect(HOME_INSPECT_COPY.couch).toContain('ending movies early');
    expect(HOME_INSPECT_COPY.snack).toContain('Nuggies.');
  });
});
