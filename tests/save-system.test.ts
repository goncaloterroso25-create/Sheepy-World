import { describe, expect, it } from 'vitest';
import { SaveRepository, SAVE_KEY, createDefaultSave } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';

describe('SaveRepository', () => {
  it('returns safe defaults for malformed data', () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, '{not json');
    const save = new SaveRepository(storage).load();
    expect(save).toEqual(createDefaultSave());
  });

  it('sanitizes and reloads valid progress', () => {
    const storage = new MemoryStorage();
    const repository = new SaveRepository(storage);
    const save = createDefaultSave();
    save.inventory.push('prototype-brass-bell');
    save.counters.yellowCars = 2.8;
    repository.save(save);

    expect(repository.load().inventory).toEqual(['prototype-brass-bell']);
    expect(repository.load().counters.yellowCars).toBe(2);
  });

  it('falls back when the schema version is unknown', () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 999, inventory: ['mystery'] }));
    expect(new SaveRepository(storage).load()).toEqual(createDefaultSave());
  });

  it('migrates older saves without losing existing progress', () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify({
      version: 1,
      memories: {
        memory: { foundFragmentIds: ['fragment'], restored: false },
      },
      inventory: ['bell'],
      achievements: ['test-achievement'],
      discoveredLocations: ['prototype-autumn-park'],
      settings: {
        musicVolume: 0.5,
        ambienceVolume: 0.6,
        sfxVolume: 0.7,
        voiceVolume: 0.8,
        reducedCameraMotion: true,
      },
      counters: { yellowCars: 4 },
    }));

    const migrated = new SaveRepository(storage).load();
    expect(migrated.version).toBe(8);
    expect(migrated.flags).toEqual({});
    expect(migrated.memories.memory?.foundFragmentIds).toEqual(['fragment']);
    expect(migrated.inventory).toEqual(['bell']);
    expect(migrated.counters.yellowCars).toBe(4);
    expect(migrated.interactions).toEqual({});
    expect(migrated.tutorials).toEqual({
      controlDockSeen: false,
      scrapbookOpened: false,
      bagOpened: false,
    });
  });

  it('preserves learned control hints in the current schema', () => {
    const storage = new MemoryStorage();
    const repository = new SaveRepository(storage);
    const save = createDefaultSave();
    save.tutorials = { controlDockSeen: true, scrapbookOpened: true, bagOpened: false };
    repository.save(save);
    expect(repository.load().tutorials).toEqual(save.tutorials);
  });
});
