import type { RegionId, Rect } from '../world/regions/definitions';
import { contains } from '../world/regions/definitions';
import type { DialogueDefinition } from '../types/game';

export interface CatPerch { id: string; regionId: RegionId; x: number; y: number }
const perches = (regionId: RegionId, entries: readonly (readonly [string, number, number])[]): CatPerch[] =>
  entries.map(([id, x, y]) => ({ id, regionId, x, y }));
export const CAT_PERCHES: readonly CatPerch[] = [
  ...perches('autumn-parklands', [['park-east', 1190, 622], ['park-meadow', 445, 405], ['park-south', 560, 676]]),
  ...perches('porto', [['porto-east',1690,1028],['porto-river',1180,1038],['porto-venue',866,826],['porto-virtudes',325,710],['porto-club',838,469]]),
  ...perches('snow-highlands', [['snow-arrival',696,924],['snow-car',640,489]]),
  ...perches('goncalo-home', [['goncalo-entry',630,874],['goncalo-kitchen',902,710],['goncalo-bedroom',260,323],['goncalo-living',745,266],['goncalo-sister',268,676]]),
  ...perches('old-world-festival', [['forest-entry',748,2162],['forest-stream',730,1844],['forest-path',737,1579],['castle-court',804,189]]),
  ...perches('vila-meow', [['vila-outside', 764, 414], ['vila-gate', 833, 412], ['vila-west', 119, 600], ['vila-lane', 599, 601], ['vila-south', 738, 995]]),
  ...perches('home-interior', [['home-bed', 410, 546], ['home-entrance', 577, 773], ['home-living', 324, 668],
    ['home-kitchen', 902, 606], ['home-hall', 680, 404], ['home-bedroom', 220, 258], ['home-bath', 530, 258], ['home-parents', 733, 271]]),
  ...perches('river-town', [['river-west', 80, 1565], ['river-promenade', 460, 1560], ['river-cafe', 860, 1516], ['river-stairs', 1030, 1380],
    ['river-bridge-west', 1034, 1020], ['river-bridge-east', 1468, 1020], ['river-bank', 1480, 699], ['river-market', 1840, 570],
    ['river-junction', 2117, 379], ['river-east', 2690, 310], ['river-arrival', 2990, 310], ['river-upper', 544, 981],
    ['river-old-lane', 840, 440], ['river-castiel', 1004, 434], ['river-stone-steps', 1088, 101]]),
  ...perches('old-world-festival', [['fair-arrival', 730, 1315], ['fair-square', 696, 990], ['fair-west', 373, 907],
    ['fair-stalls', 358, 584], ['fair-archery', 1034, 769], ['fair-books', 888, 635], ['fair-overlook', 697, 297]]),
];
export const catPerch = (id: string): CatPerch | undefined => CAT_PERCHES.find(p => p.id === id);
export type TobiasState = 'outside' | 'carried' | 'home' | 'perched';
export interface CatSave { tobias: TobiasState; teemi: 'home'; tobiasPerch?: string }
export function tobiasPerch(cats: CatSave): CatPerch | undefined {
  if (cats.tobias === 'carried') return;
  return catPerch(cats.tobias === 'home' ? 'home-bed' : cats.tobias === 'perched' ? cats.tobiasPerch ?? '' : 'vila-outside');
}
export function sanitizeCats(value: unknown): CatSave {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  if (raw.tobias === 'carried' || raw.tobias === 'home') return { tobias: raw.tobias, teemi: 'home' };
  if (raw.tobias === 'perched' && typeof raw.tobiasPerch === 'string' && catPerch(raw.tobiasPerch)) {
    return { tobias: 'perched', teemi: 'home', tobiasPerch: raw.tobiasPerch };
  }
  return { tobias: 'outside', teemi: 'home' };
}
/** Reject a perch across a wall/water; authored anchors keep persisted positions stable. */
export function safeCatDrop(regionId: RegionId, player: { x: number; y: number }, solids: readonly Rect[]): CatPerch | undefined {
  return CAT_PERCHES.filter(p => p.regionId === regionId && Math.hypot(p.x - player.x, p.y - player.y) <= 112)
    .filter(p => {
      const steps = Math.max(1, Math.ceil(Math.hypot(p.x - player.x, p.y - player.y) / 4));
      for (let i = 0; i <= steps; i++) {
        const point = { x: player.x + (p.x - player.x) * i / steps, y: player.y + (p.y - player.y) * i / steps + 11 };
        if (solids.some(r => contains(r, point, 7))) return false;
      }
      return true;
    }).sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y) || a.id.localeCompare(b.id))[0];
}
export const TEEMI_PERCHES = [{ x: 345, y: 556 }, { x: 442, y: 580 }] as const;
export const CAT_EVENTS = { pet: 'cat:tobias-pet', pickup: 'cat:tobias-pickup' } as const;
export const TOBIAS_DIALOGUE: DialogueDefinition = {
  id: 'tobias-actions', startNodeId: 'hello', interaction: { id: 'tobias-actions', mode: 'REPEATABLE' },
  nodes: {
    hello: { id: 'hello', speaker: 'Tobias', lines: ['Available for absolutely unreasonable amounts of affection.'],
      choices: [{ id: 'pet', label: 'Pet', nextId: 'pet' }, { id: 'pickup', label: 'Pick up', nextId: 'pickup' }] },
    pet: { id: 'pet', speaker: 'Tobias', lines: ['Still accepting applications for more pats.'], onCompleteEvent: CAT_EVENTS.pet },
    pickup: { id: 'pickup', speaker: 'Tobias', lines: ['A very portable gentleman.'], onCompleteEvent: CAT_EVENTS.pickup },
  },
};
