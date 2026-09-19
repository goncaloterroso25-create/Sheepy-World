import { describe, expect, it } from 'vitest';
import { contains, REGION_IDS, RegionTransitionGate, sanitizeWorldLocation, START_LOCATION, WORLD_REGIONS, type Rect } from '../src/world/regions/definitions';
import { HOME_SOLIDS, RIVER_SOLIDS, VILA_SOLIDS } from '../src/world/regions/layouts';
import { SaveRepository, sanitizeSave, createDefaultSave } from '../src/systems/SaveSystem';
import { GameStateStore } from '../src/systems/GameStateStore';
import { MemoryStorage } from './helpers/MemoryStorage';
import { hasMeaningfulProgress } from '../src/systems/TitleFlow';
import { regionSurfaceAt } from '../src/world/regions/RegionSurface';
import { RIVER_PAVING, VILA_PAVING } from '../src/world/regions/layouts';
import { FESTIVAL_SOLIDS } from '../src/world/regions/FestivalLayout';

describe('authored interconnected world', () => {
  it('classifies the same paving used by rendering and keeps water/indoor distinct from grass', () => {
    for (const [id, paving] of [['river-town', RIVER_PAVING], ['vila-meow', VILA_PAVING]] as const) {
      for (const r of paving) expect(['stone', 'road']).toContain(regionSurfaceAt(id, { x: r.x + r.width / 2, y: r.y + r.height / 2 }));
      expect(regionSurfaceAt(id, { x: 30, y: 750 })).toBe('grass');
    }
    expect(regionSurfaceAt('river-town', { x: 1250, y: 700 })).toBe('water');
    expect(regionSurfaceAt('home-interior', { x: 320, y: 380 })).toBe('wood');
    expect(regionSurfaceAt('autumn-parklands', { x: 1210, y: 631 })).toBe('stone');
    expect(regionSurfaceAt('river-town', { x: NaN, y: 2 })).toBe('unknown');
  });
  it('has stable reciprocal destinations with safe inset entries', () => {
    for (const id of REGION_IDS) {
      const region = WORLD_REGIONS[id];
      expect(region.id).toBe(id);
      expect(region.entries[region.defaultEntry]).toBeDefined();
      expect(new Set(region.exits.map(e => e.id)).size).toBe(region.exits.length);
      for (const exit of region.exits) {
        const other = WORLD_REGIONS[exit.destination.regionId];
        const spawn = other.entries[exit.destination.entryId]!;
        expect(spawn).toBeDefined();
        // Final Park's outward route is an earned interactable, not an early static exit.
        if (id === 'final-park') {
          expect(exit.id).toBe('final-return');
          expect(exit.destination).toEqual({ regionId: 'autumn-parklands', entryId: 'from-final' });
        } else expect(other.exits.some(e => e.destination.regionId === id)).toBe(true);
        for (const trigger of other.exits) expect(contains(trigger.area, { x: spawn.x, y: spawn.y + 15 })).toBe(false);
      }
    }
  });

  it('requires real movement/door intent, blocks under modals, and accepts only one transition', () => {
    const walk = WORLD_REGIONS['autumn-parklands'].exits[0]!;
    const gate = new RegionTransitionGate();
    expect(gate.request(walk, true, true, false)).toBeUndefined();
    expect(gate.request(walk, false, false, false)).toBeUndefined();
    expect(gate.request(walk, false, true, false)).toEqual(walk.destination);
    expect(gate.request(walk, false, true, false)).toBeUndefined();
    const door = WORLD_REGIONS['home-interior'].exits[0]!;
    const doorGate = new RegionTransitionGate();
    expect(doorGate.request(door, false, true, false)).toBeUndefined();
    expect(doorGate.request(door, false, false, true)).toEqual(door.destination);
  });

  it.each([1, 2, 3, 4, 5, 6])('migrates v%i without losing existing inventory, memories, settings, or counters', version => {
    const old = { ...createDefaultSave(), version, worldLocation: undefined, cats: undefined,
      inventory: ['prototype-brass-bell'], memories: { old: { foundFragmentIds: ['one'], restored: false } }, counters: { yellowCars: 8 } };
    const save = sanitizeSave(old);
    expect(save.version).toBe(8); expect(save.worldLocation).toEqual(START_LOCATION);
    expect(save.memories).toEqual(old.memories); expect(save.inventory).toEqual(old.inventory);
    expect(save.settings).toEqual(old.settings); expect(save.counters).toEqual(old.counters);
  });

  it('recovers invalid region/entry/cat data defensively, including prototype keys', () => {
    expect(sanitizeWorldLocation({ regionId: 'moon' })).toEqual(START_LOCATION);
    expect(sanitizeWorldLocation({ regionId: 'river-town', entryId: 'constructor' })).toEqual({ regionId: 'river-town', entryId: 'from-autumn' });
    expect(sanitizeSave({ version: 5, cats: { tobias: 'lost' } }).cats).toEqual({ tobias: 'outside', teemi: 'home' });
  });

  it('round-trips every arrival and carries Tobias across regions/reloads without duplicate pickups', () => {
    const storage = new MemoryStorage();
    let state = new GameStateStore(new SaveRepository(storage));
    for (const regionId of REGION_IDS) {
      const entryId = WORLD_REGIONS[regionId].defaultEntry;
      state.arriveAt({ regionId, entryId });
      state = new GameStateStore(new SaveRepository(storage));
      expect(state.snapshot.worldLocation).toEqual({ regionId, entryId });
    }
    expect(state.carryTobias()).toBe(false);
    state.arriveAt({ regionId: 'vila-meow', entryId: 'from-river' });
    expect(state.carryTobias()).toBe(true); expect(state.carryTobias()).toBe(false);
    state.arriveAt({ regionId: 'river-town', entryId: 'from-vila' });
    state = new GameStateStore(new SaveRepository(storage));
    expect(state.snapshot.cats.tobias).toBe('carried'); expect(state.settleTobias()).toBe(false);
    state.arriveAt({ regionId: 'home-interior', entryId: 'front-door' });
    state = new GameStateStore(new SaveRepository(storage));
    expect(state.snapshot.cats.tobias).toBe('carried'); expect(state.settleTobias()).toBe(true);
    expect(state.settleTobias()).toBe(false); expect(state.addArtifact('half-glasses')).toBe(true);
    expect(state.addArtifact('half-glasses')).toBe(false);
    expect(hasMeaningfulProgress(state.snapshot)).toBe(true);
    expect(new GameStateStore(new SaveRepository(storage)).snapshot.cats.tobias).toBe('home');
  });

  it.each([
    ['river-town', RIVER_SOLIDS], ['vila-meow', VILA_SOLIDS], ['home-interior', HOME_SOLIDS],
    ['old-world-festival', FESTIVAL_SOLIDS],
  ] as const)('%s has collision-clear spawns and connected usable exits', (id, solids) => {
    const region = WORLD_REGIONS[id];
    for (const spawn of Object.values(region.entries)) {
      expect(solids.some(r => contains(r, { x: spawn.x, y: spawn.y + 11 }, 6))).toBe(false);
    }
    // Conservative player-sized flood fill proves route gaps in the same authored collider data.
    const step = 8, start = region.entries[region.defaultEntry]!;
    const pending = [[Math.round(start.x / step), Math.round((start.y + 11) / step)]];
    const visited = new Set<string>();
    while (pending.length) {
      const [x, y] = pending.pop()!;
      const key = `${x},${y}`;
      const p = { x: x! * step, y: y! * step };
      if (visited.has(key) || p.x < 8 || p.y < 8 || p.x > region.width - 8 || p.y > region.height - 8
        || solids.some((r: Rect) => contains(r, p, 6))) continue;
      visited.add(key);
      pending.push([x! + 1, y!], [x! - 1, y!], [x!, y! + 1], [x!, y! - 1]);
    }
    for (const exit of region.exits) {
      expect([...visited].some(key => { const [x, y] = key.split(',').map(Number);
        return contains(exit.area, { x: x! * step, y: y! * step }, exit.door ? 20 : 0); })).toBe(true);
    }
  });
});
