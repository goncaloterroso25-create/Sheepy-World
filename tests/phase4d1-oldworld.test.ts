import { describe, expect, it } from 'vitest';
import {
  DAENERYS_STAGE,
  FESTIVAL_CURIOS,
  FESTIVAL_DETAILS,
  HANGE_DIALOGUE,
  OLD_WORLD_CASTLE_LAYERS,
  OLD_WORLD_FOREST_PROPS,
  OLD_WORLD_GUESTS,
  SCOUT_GROUP_DIALOGUE,
} from '../src/data/festivalContent';
import { ITEMS } from '../src/data/items';
import { NAMED_DIALOGUES } from '../src/data/namedDialogues';
import { approachDistance } from '../src/systems/InteractionGeometry';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { CASTLE_SOLIDS, FOREST_PATHS, FOREST_TRUNKS, FOREST_WATER } from '../src/world/regions/ExpansionLayout';
import { FESTIVAL_SOLIDS, FESTIVAL_STALLS } from '../src/world/regions/FestivalLayout';
import { contains } from '../src/world/regions/definitions';
import { MemoryStorage } from './helpers/MemoryStorage';

const overlaps = (a: {x:number;y:number;width:number;height:number}, b: {x:number;y:number;width:number;height:number}): boolean =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

describe('Phase 4D.1 Old World collectibles', () => {
  it('removes archery as an interaction while keeping all authored IDs unique', () => {
    expect(FESTIVAL_DETAILS.some(detail => /archery/i.test(detail.id) || /archery/i.test(detail.title))).toBe(false);
    const ids = [...FESTIVAL_DETAILS, ...FESTIVAL_CURIOS].map(entry => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ships the Mockingjay Pin and Hunger Games book as visible, idempotent Bag items', () => {
    const pin = FESTIVAL_CURIOS.find(item => item.id === 'bird-arrow-pin');
    const book = FESTIVAL_CURIOS.find(item => item.id === 'the-hunger-games');
    expect(pin).toMatchObject({ title: 'Mockingjay Pin', description: 'Katniss would probably want this back.' });
    expect(book).toMatchObject({ title: 'The Hunger Games', iconKey: 'item-hunger-games' });
    expect(ITEMS['bird-arrow-pin']).toMatchObject({ name: 'Mockingjay Pin', description: 'Katniss would probably want this back.' });
    expect(ITEMS['the-hunger-games']).toMatchObject({ name: 'The Hunger Games', iconKey: 'item-hunger-games' });
    const state = new GameStateStore(new SaveRepository(new MemoryStorage()));
    expect(state.addArtifact(book!.id)).toBe(true);
    expect(state.addArtifact(book!.id)).toBe(false);
    expect(state.snapshot.inventory.filter(id => id === book!.id)).toHaveLength(1);
  });

  it('places NIGHTLOCK beside a traversed forest path with its own authored identity', () => {
    const nightlock = FESTIVAL_DETAILS.find(detail => detail.id === 'nightlock-berries')!;
    expect(nightlock).toMatchObject({ title: 'NIGHTLOCK', family: 'hunger-games', discoveryCue: 'INTERESTING' });
    expect(nightlock.text).toMatch(/dark|snack/i);
    expect(nightlock.y).toBeGreaterThan(1408);
    expect(FOREST_PATHS.some(path => contains(path, nightlock.approach.anchor))).toBe(true);
  });
});

describe('Phase 4D.1 Old World interaction coverage', () => {
  it('gives stall discoveries broad walkable approach strips instead of single-pixel anchors', () => {
    for (const id of ['sussur-bloom', 'tadpole-specimen', 'speak-with-animals']) {
      const detail = FESTIVAL_DETAILS.find(entry => entry.id === id)!;
      expect(detail.approach.shape?.width, id).toBeGreaterThanOrEqual(42);
      expect(detail.discoveryCue, id).toBe('INTERESTING');
      const shape = detail.approach.shape!;
      const point = { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
      expect(FESTIVAL_SOLIDS.some(solid => contains(solid, point)), id).toBe(false);
      expect(approachDistance(point, detail.approach, FESTIVAL_SOLIDS), id).toBe(0);
    }
    expect(FESTIVAL_STALLS.some(stall => stall.color === 'purple')).toBe(true);
    const eastCurio = FESTIVAL_CURIOS.find(item => item.id === 'bird-arrow-pin')!;
    expect(eastCurio.approach.shape!.width).toBeGreaterThanOrEqual(90);
    expect(eastCurio.discoveryCue).toBe('INTERESTING');
  });

  it('makes both Mistria details specific, cued, and reachable across broad geometry', () => {
    const dragon = FESTIVAL_DETAILS.find(detail => detail.id === 'caldarus-shrine')!;
    const clown = FESTIVAL_DETAILS.find(detail => detail.id === 'mournful-clown')!;
    expect(dragon.title).toContain('Caldarus');
    expect(dragon.text).toMatch(/stone dragon.*purple essence/i);
    expect(clown.title).toBe('Mournful Clown Painting');
    expect(clown.text).toMatch(/clown.*miserable.*gold frame/i);
    for (const detail of [dragon, clown]) {
      expect(detail.discoveryCue).toBe('INTERESTING');
      expect(detail.approach.shape!.width * detail.approach.shape!.height).toBeGreaterThan(1_000);
    }
  });
});

describe('Phase 4D.1 Old World living-world staging', () => {
  it('keeps Daenerys and three discrete dragons in the open court below the keep', () => {
    expect(DAENERYS_STAGE.interactionId).toBe('daenerys-talk');
    expect(NAMED_DIALOGUES.daenerys.worldFocus).toEqual({ x: DAENERYS_STAGE.x, y: DAENERYS_STAGE.y });
    expect(DAENERYS_STAGE.dragons.map(dragon => dragon.role)).toEqual(['shoulder', 'medium-companion', 'large-companion']);
    expect(new Set(DAENERYS_STAGE.dragons.map(dragon => dragon.texture)).size).toBe(3);
    const medium = DAENERYS_STAGE.dragons[1]!;
    const large = DAENERYS_STAGE.dragons[2]!;
    expect(DAENERYS_STAGE.dragons.map(dragon => [dragon.width, dragon.height])).toEqual([
      [22, 16], [42, 28], [68, 42],
    ]);
    expect(large.visualMass / medium.visualMass).toBeGreaterThan(2);
    expect(medium.depthOffset).toBeLessThan(0);
    expect(large.depthOffset).toBeLessThan(0);
    expect(DAENERYS_STAGE.y).toBeGreaterThan(260);
    const runtimeCourtSolids = [...FESTIVAL_SOLIDS, ...CASTLE_SOLIDS];
    const spriteBounds = {
      x: DAENERYS_STAGE.x - DAENERYS_STAGE.sprite.width / 2,
      y: DAENERYS_STAGE.y - DAENERYS_STAGE.sprite.height,
      width: DAENERYS_STAGE.sprite.width,
      height: DAENERYS_STAGE.sprite.height,
    };
    expect(runtimeCourtSolids.some(solid => overlaps(spriteBounds, solid))).toBe(false);
    const dragonBounds = DAENERYS_STAGE.dragons.map(dragon => ({
      x: dragon.x - dragon.width / 2, y: dragon.y - dragon.height,
      width: dragon.width, height: dragon.height,
    }));
    dragonBounds.forEach((bounds, index) => {
      expect(runtimeCourtSolids.some(solid => overlaps(bounds, solid)), DAENERYS_STAGE.dragons[index]!.role).toBe(false);
    });
    for (let i = 0; i < dragonBounds.length; i++) for (let j = i + 1; j < dragonBounds.length; j++)
      expect(overlaps(dragonBounds[i]!, dragonBounds[j]!), `${i}/${j}`).toBe(false);
    for (const dragon of DAENERYS_STAGE.dragons) {
      expect(Math.hypot(dragon.x - DAENERYS_STAGE.x, dragon.y - DAENERYS_STAGE.y)).toBeLessThan(70);
    }
  });

  it('makes Daenerys reachable around the authored tableau using actual runtime court solids', () => {
    const runtimeCourtSolids = [...FESTIVAL_SOLIDS, ...CASTLE_SOLIDS];
    const approach = DAENERYS_STAGE.approach;
    expect(runtimeCourtSolids.some(solid => overlaps(approach.shape!, solid))).toBe(false);
    const authoredFeet = {
      below: { x: 780, y: 407 },
      left: { x: 686, y: 333 },
      right: { x: 868, y: 350 },
      'upper-diagonal': { x: 802, y: 250 },
    } as const;
    for (const [side, point] of Object.entries(authoredFeet)) {
      expect(runtimeCourtSolids.some(solid => contains(solid, point)), side).toBe(false);
      expect(approachDistance(point, approach, runtimeCourtSolids), side).toBeLessThanOrEqual(approach.radius!);
    }
  });

  it('adds authored forest texture and layered monumental castle masses', () => {
    expect(OLD_WORLD_FOREST_PROPS.length).toBeGreaterThanOrEqual(14);
    expect(new Set(OLD_WORLD_FOREST_PROPS.map(prop => prop.kind))).toEqual(
      new Set(['mushrooms', 'fallen-log', 'rock', 'flowers', 'reeds', 'fern-bank']),
    );
    expect(OLD_WORLD_CASTLE_LAYERS).toHaveLength(5);
    expect(OLD_WORLD_CASTLE_LAYERS.filter(layer => layer.id.includes('tower'))).toHaveLength(2);
    expect(OLD_WORLD_CASTLE_LAYERS.some(layer => layer.id === 'gatehouse')).toBe(true);
  });

  it('makes Hange readable and moves the shared scout interaction onto the forest route', () => {
    expect(OLD_WORLD_GUESTS.hange.priority).toBeGreaterThan(40);
    expect(HANGE_DIALOGUE.nodes.hello?.choices).toHaveLength(3);
    expect(OLD_WORLD_GUESTS.scouts.members.map(member => member.id)).toEqual(['eren', 'mikasa', 'armin']);
    expect(OLD_WORLD_GUESTS.scouts.interaction.y).toBeGreaterThan(1408);
    const forestBlockers = [...FOREST_WATER, ...FOREST_TRUNKS];
    for (const member of OLD_WORLD_GUESTS.scouts.members) {
      expect(FOREST_PATHS.some(path => contains(path, member)), member.id).toBe(true);
      const bounds = { x: member.x - 12, y: member.y - 36, width: 24, height: 36 };
      expect(forestBlockers.some(solid => overlaps(bounds, solid)), member.id).toBe(false);
    }
    for (let i = 1; i < OLD_WORLD_GUESTS.scouts.members.length; i++)
      expect(OLD_WORLD_GUESTS.scouts.members[i]!.x - OLD_WORLD_GUESTS.scouts.members[i - 1]!.x).toBeGreaterThanOrEqual(32);
    const groupShape = OLD_WORLD_GUESTS.scouts.interaction.approach.shape!;
    expect(FOREST_PATHS.some(path => groupShape.x >= path.x && groupShape.y >= path.y
      && groupShape.x + groupShape.width <= path.x + path.width
      && groupShape.y + groupShape.height <= path.y + path.height)).toBe(true);
    expect(SCOUT_GROUP_DIALOGUE.id).toBe('scout-group-talk');
    const speakers = new Set(Object.values(SCOUT_GROUP_DIALOGUE.nodes).map(node => node.speaker));
    expect(speakers).toEqual(new Set(['Armin', 'Mikasa', 'Eren']));
    expect(SCOUT_GROUP_DIALOGUE.nodes.hello?.choices).toHaveLength(3);
  });
});
