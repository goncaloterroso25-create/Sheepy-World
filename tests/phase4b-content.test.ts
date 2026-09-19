import { describe, expect, it } from 'vitest';
import { CAT_PERCHES, catPerch, safeCatDrop, sanitizeCats, TEEMI_PERCHES, tobiasPerch } from '../src/data/cats';
import { FESTIVAL_CURIOS, FESTIVAL_DETAILS } from '../src/data/festivalContent';
import { HOME_DISCOVERIES } from '../src/data/homeContent';
import { ITEMS } from '../src/data/items';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository, createDefaultSave, sanitizeSave } from '../src/systems/SaveSystem';
import { TeemiInteraction } from '../src/systems/TeemiInteraction';
import { selectInteraction } from '../src/systems/InteractionSelection';
import { MemoryStorage } from './helpers/MemoryStorage';
import { HOME_DOORWAYS, HOME_ROOMS, HOME_SOLIDS, HOME_WALK_REVIEW, HOME_WALLS } from '../src/world/regions/HomeLayout';
import { FESTIVAL_SOLIDS } from '../src/world/regions/FestivalLayout';
import { RIVER_SOLIDS, VILA_SOLIDS } from '../src/world/regions/layouts';
import { contains, type Rect, type RegionId, WORLD_REGIONS } from '../src/world/regions/definitions';

const solids: Partial<Record<RegionId, readonly Rect[]>> = {
  'river-town': RIVER_SOLIDS, 'vila-meow': VILA_SOLIDS, 'home-interior': HOME_SOLIDS, 'old-world-festival': FESTIVAL_SOLIDS,
};
describe('Phase 4B cats and optional discoveries', () => {
  it('Teemi cycles pet, warning, harmless chomp, a different perch and reset repeatedly', () => {
    const teemi = new TeemiInteraction();
    expect(teemi.prompt).toBe('Pet'); expect(teemi.pet(100)).toBe('pet');
    expect(teemi.pet(200)).toBe('pet'); expect(teemi.prompt).toBe('Pet again'); expect(teemi.pet(300)).toBe('chomp');
    expect(teemi.pet(310)).toBeUndefined(); teemi.update(521);
    expect(teemi.perch).toBe(1); expect(teemi.available).toBe(false);
    teemi.update(3921); expect(teemi.available).toBe(true); expect(teemi.pet(4000)).toBe('pet');
    expect(teemi.pet(4100)).toBe('pet'); expect(teemi.pet(4200)).toBe('pet');
    expect(teemi.pet(4300)).toBe('chomp'); teemi.update(4521); expect(teemi.perch).toBe(0);
    expect(new TeemiInteraction().stage).toBe('ready');
  });
  it.each(['outside', 'home', 'carried'] as const)('migrates v5 Tobias %s and both moved artifacts', tobias => {
    const save = sanitizeSave({ ...createDefaultSave(), version: 5, cats: { tobias, teemi: 'home' }, inventory: HOME_DISCOVERIES.map(i => i.id) });
    expect(save.version).toBe(8); expect(save.cats.tobias).toBe(tobias);
    expect(save.inventory).toEqual(['half-glasses', 'naruto-shuriken-keychain']);
  });
  it('Tobias can settle, repick, cross every region, drop and reload on a stable perch', () => {
    const storage = new MemoryStorage(), repository = new SaveRepository(storage);
    let state = new GameStateStore(repository);
    state.arriveAt({ regionId: 'vila-meow', entryId: 'from-river' }); expect(state.carryTobias()).toBe(true);
    state.arriveAt({ regionId: 'home-interior', entryId: 'front-door' }); expect(state.settleTobias()).toBe(true);
    expect(state.carryTobias()).toBe(true);
    for (const regionId of ['vila-meow', 'river-town', 'old-world-festival', 'river-town', 'home-interior'] as const) {
      state.arriveAt({ regionId, entryId: WORLD_REGIONS[regionId].defaultEntry });
      state = new GameStateStore(repository); expect(state.snapshot.cats.tobias).toBe('carried');
    }
    expect(state.setDownTobias('fair-square')).toBe(false);
    expect(state.setDownTobias('home-bedroom')).toBe(true);
    state = new GameStateStore(repository);
    expect(tobiasPerch(state.snapshot.cats)).toEqual(catPerch('home-bedroom'));
    expect(state.carryTobias()).toBe(true); expect(state.carryTobias()).toBe(false);
    expect(sanitizeCats({ tobias: 'perched', tobiasPerch: 'constructor' })).toEqual({ tobias: 'outside', teemi: 'home' });
  });
  it('every new-region cat perch and both Teemi positions have physical clearance', () => {
    for (const perch of [...CAT_PERCHES, ...TEEMI_PERCHES.map(p => ({ ...p, id: 'teemi', regionId: 'home-interior' as const }))]) {
      expect(solids[perch.regionId]?.some(r => contains(r, { x: perch.x, y: perch.y + 11 }, 7)) ?? false, perch.id).toBe(false);
    }
  });
  it('safe drops reject a wall between player and anchor and never invent raw coordinates', () => {
    const p = catPerch('home-entrance')!;
    expect(safeCatDrop('home-interior', { x: p.x + 25, y: p.y }, HOME_SOLIDS)?.id).toBe(p.id);
    expect(safeCatDrop('home-interior', { x: p.x + 25, y: p.y }, [...HOME_SOLIDS,
      { x: p.x + 10, y: p.y - 100, width: 8, height: 210 }])).toBeUndefined();
    expect(safeCatDrop('river-town', { x: 1250, y: 700 }, RIVER_SOLIDS)).toBeUndefined();
  });
  it('world objects and doors always beat carried-cat fallback; ties are deterministic', () => {
    const fallback = { id: 'set-down', distance: 0, range: 1, priority: -100 };
    const drawer = { id: 'drawer', distance: 20, range: 30, priority: 10 };
    const door = { id: 'door', distance: 30, range: 38, priority: 100 };
    expect(selectInteraction([fallback, drawer])?.id).toBe('drawer');
    expect(selectInteraction([drawer, fallback, door])?.id).toBe('drawer');
    expect(selectInteraction([fallback, { ...drawer, distance: 31 }])?.id).toBe('set-down');
    expect(selectInteraction([{ ...drawer, id: 'b' }, { ...drawer, id: 'a' }])?.id).toBe('a');
  });
  it('curios do not alter memories, achievements or counters; all discoveries remain idempotent', () => {
    const repository = new SaveRepository(new MemoryStorage()), state = new GameStateStore(repository);
    const before = structuredClone(state.snapshot);
    for (const item of [...HOME_DISCOVERIES, ...FESTIVAL_CURIOS]) {
      expect(state.addArtifact(item.id)).toBe(true); expect(state.addArtifact(item.id)).toBe(false);
    }
    const saved = repository.load();
    expect(saved.memories).toEqual(before.memories); expect(saved.counters).toEqual(before.counters);
    expect(saved.achievements).toEqual(before.achievements); expect(saved.inventory).toHaveLength(5);
    expect(ITEMS['half-glasses']?.description).toBe('Durability: 50%.');
    expect(FESTIVAL_CURIOS).toHaveLength(3);
    expect(FESTIVAL_DETAILS.filter(d => d.family === 'mistria')).toHaveLength(2);
    expect(FESTIVAL_CURIOS.find(d => d.id === 'the-hunger-games')?.title).toBe('The Hunger Games');
  });
});

describe('one connected house', () => {
  it('every doorway gap is genuinely free of wall collision', () => {
    for (const door of HOME_DOORWAYS) {
      expect(HOME_WALLS.some(w => contains(w, { x: door.x + door.width / 2, y: door.y + door.height / 2 }, 7))).toBe(false);
      expect(door.width).toBeGreaterThanOrEqual(64);
    }
  });
  it('connects the front door, living/kitchen, hall, all bedrooms, bathroom and both discoveries', () => {
    expect(Object.keys(HOME_ROOMS)).toHaveLength(5);
    const visited = new Set<string>(), pending = [[65, 100]], step = 8;
    while (pending.length) {
      const [x, y] = pending.pop()!, key = x + ',' + y;
      const p = { x: x! * step, y: y! * step };
      if (visited.has(key) || p.x < 8 || p.x > 1048 || p.y < 8 || p.y > 856 || HOME_SOLIDS.some(r => contains(r, p, 7))) continue;
      visited.add(key); pending.push([x! + 1, y!], [x! - 1, y!], [x!, y! + 1], [x!, y! - 1]);
    }
    for (const p of [...Object.values(HOME_WALK_REVIEW), ...HOME_DISCOVERIES, ...TEEMI_PERCHES]) {
      expect(visited.has(Math.round(p.x / step) + ',' + Math.round((p.y + 11) / step)), JSON.stringify(p)).toBe(true);
    }
  });
});
