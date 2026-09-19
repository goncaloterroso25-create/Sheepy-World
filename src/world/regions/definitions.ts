import type { FeetPosition, Surface } from '../SurfaceQuery';

export const REGION_IDS = ['autumn-parklands', 'river-town', 'river-crime-scene', 'vila-meow', 'home-interior', 'old-world-festival', 'porto', 'snow-highlands', 'goncalo-home', 'final-park'] as const;
export type RegionId = typeof REGION_IDS[number];
export interface WorldLocation { regionId: RegionId; entryId: string }
export interface Rect { x: number; y: number; width: number; height: number }
export interface RegionExit {
  id: string;
  area: Rect;
  destination: WorldLocation;
  door?: boolean;
}
export interface WorldRegion {
  id: RegionId; name: string; width: number; height: number;
  defaultEntry: string;
  entries: Readonly<Record<string, FeetPosition>>;
  exits: readonly RegionExit[];
  surface: Surface;
  audio: 'park' | 'quiet';
}

export const WORLD_REGIONS: Readonly<Record<RegionId, WorldRegion>> = {
  'final-park':{
    id:'final-park',name:'A place kept',width:640,height:2880,defaultEntry:'quiet-branch',
    entries:{'quiet-branch':{x:320,y:2797}},
    exits:[{id:'final-return',area:{x:280,y:2836,width:80,height:44},door:true,
      destination:{regionId:'autumn-parklands',entryId:'from-final'}}],surface:'grass',audio:'quiet',
  },
  'autumn-parklands': {
    id: 'autumn-parklands', name: 'Autumn Parklands', width: 1280, height: 768,
    defaultEntry: 'park-start', entries: { 'park-start': { x: 445, y: 405 }, 'from-river': { x: 1214, y: 622 },
      'from-porto': { x: 50, y: 400 }, 'from-goncalo-home': { x: 510, y: 715 }, 'from-final':{x:600,y:685} },
    exits: [{ id: 'east-riverside-path', area: { x: 1256, y: 598, width: 24, height: 82 },
      destination: { regionId: 'river-town', entryId: 'from-autumn' } },
        { id: 'west-porto-path', area: { x: 0, y: 366, width: 24, height: 100 }, destination: { regionId: 'porto', entryId: 'from-autumn' } }],
    surface: 'grass', audio: 'park',
  },
  'river-town': {
    id: 'river-town', name: 'River Town', width: 3072, height: 1792,
    defaultEntry: 'from-autumn', entries: { 'from-autumn': { x: 52, y: 1550 }, 'from-vila': { x: 3016, y: 300 }, 'from-festival': { x: 1088, y: 72 }, 'from-snow': { x: 2776, y: 560 }, 'from-crime-scene': { x: 1643, y: 535 } },
    exits: [
      { id: 'west-park-path', area: { x: 0, y: 1516, width: 24, height: 98 }, destination: { regionId: 'autumn-parklands', entryId: 'from-river' } },
      { id: 'east-residential-lane', area: { x: 3048, y: 264, width: 24, height: 96 }, destination: { regionId: 'vila-meow', entryId: 'from-river' } },
      { id: 'stone-steps-up', area: { x: 1056, y: 0, width: 64, height: 24 }, destination: { regionId: 'old-world-festival', entryId: 'from-river' } },
      { id: 'snow-pass', area: { x: 2748, y: 604, width: 64, height: 30 }, destination: { regionId: 'snow-highlands', entryId: 'from-river' } },
      { id: 'curios-crime-scene', area: { x: 1625, y: 492, width: 36, height: 34 }, door: true,
        destination: { regionId: 'river-crime-scene', entryId: 'front-door' } },
    ], surface: 'stone', audio: 'quiet',
  },
  'river-crime-scene': {
    id:'river-crime-scene',name:'Curios Shop',width:720,height:480,defaultEntry:'front-door',
    entries:{'front-door':{x:360,y:421}},
    exits:[{id:'curios-door-out',area:{x:328,y:452,width:64,height:28},door:true,
      destination:{regionId:'river-town',entryId:'from-crime-scene'}}],surface:'indoor',audio:'quiet',
  },
  'vila-meow': {
    id: 'vila-meow', name: 'Vila Meow', width: 1152, height: 1056,
    defaultEntry: 'from-river', entries: { 'from-river': { x: 52, y: 574 }, 'from-home': { x: 836, y: 362 }, 'from-goncalo-home': { x: 678, y: 980 } },
    exits: [
      { id: 'west-town-lane', area: { x: 0, y: 540, width: 24, height: 100 }, destination: { regionId: 'river-town', entryId: 'from-vila' } },
      { id: 'home-front-door', area: { x: 816, y: 318, width: 40, height: 34 }, door: true,
        destination: { regionId: 'home-interior', entryId: 'front-door' } },
      { id: 'vila-south-home', area: { x: 648, y: 1020, width: 60, height: 36 }, door: true,
        destination: { regionId: 'goncalo-home', entryId: 'front-door' } },
    ], surface: 'stone', audio: 'quiet',
  },
  'home-interior': {
    id: 'home-interior', name: 'Home', width: 1056, height: 864,
    defaultEntry: 'front-door', entries: { 'front-door': { x: 516, y: 786 } },
    exits: [{ id: 'front-door-outside', area: { x: 484, y: 828, width: 64, height: 36 }, door: true,
      destination: { regionId: 'vila-meow', entryId: 'from-home' } }], surface: 'indoor', audio: 'quiet',
  },
  'old-world-festival': {
    id: 'old-world-festival', name: 'The Old World', width: 1408, height: 2304,
    defaultEntry: 'from-river', entries: { 'from-river': { x: 704, y: 2228 } },
    exits: [{ id: 'stone-steps-down', area: { x: 656, y: 2280, width: 96, height: 24 },
      destination: { regionId: 'river-town', entryId: 'from-festival' } }], surface: 'stone', audio: 'quiet',
  },
  porto: {
    id: 'porto', name: 'Porto, after dark', width: 1792, height: 1408, defaultEntry: 'from-autumn',
    entries: { 'from-autumn': { x: 1732, y: 1016 } },
    exits: [{ id: 'porto-autumn', area: { x: 1768, y: 976, width: 24, height: 104 }, destination: { regionId: 'autumn-parklands', entryId: 'from-porto' } }],
    surface: 'stone', audio: 'quiet',
  },
  'snow-highlands': {
    id: 'snow-highlands', name: 'Snow Highlands', width: 1280, height: 1024, defaultEntry: 'from-river',
    entries: { 'from-river': { x: 640, y: 948 } },
    exits: [{ id: 'snow-river', area: { x: 592, y: 1000, width: 96, height: 24 }, destination: { regionId: 'river-town', entryId: 'from-snow' } }],
    surface: 'snow', audio: 'quiet',
  },
  'goncalo-home': {
    id: 'goncalo-home', name: 'A familiar house', width: 1152, height: 960, defaultEntry: 'front-door',
    entries: { 'front-door': { x: 568, y: 878 } },
    exits: [{ id: 'goncalo-door-out', area: { x: 536, y: 916, width: 64, height: 40 }, door: true,
      destination: { regionId: 'vila-meow', entryId: 'from-goncalo-home' } }], surface: 'wood', audio: 'quiet',
  },
};
export const START_LOCATION: WorldLocation = { regionId: 'autumn-parklands', entryId: 'park-start' };

export function contains(rect: Rect, point: FeetPosition, padding = 0): boolean {
  return point.x >= rect.x - padding && point.x < rect.x + rect.width + padding
    && point.y >= rect.y - padding && point.y < rect.y + rect.height + padding;
}

export function sanitizeWorldLocation(value: unknown): WorldLocation {
  if (!value || typeof value !== 'object') return { ...START_LOCATION };
  const raw = value as Record<string, unknown>;
  if (!REGION_IDS.includes(raw.regionId as RegionId)) return { ...START_LOCATION };
  const region = WORLD_REGIONS[raw.regionId as RegionId];
  return { regionId: region.id, entryId: typeof raw.entryId === 'string' && Object.hasOwn(region.entries, raw.entryId)
    ? raw.entryId : region.defaultEntry };
}

/** Single-flight gate; only movement into an exit can start a walk transition. */
export class RegionTransitionGate {
  active = false;
  request(exit: RegionExit | undefined, blocked: boolean, travelling: boolean, interacted: boolean): WorldLocation | undefined {
    if (this.active || blocked || !exit || (exit.door ? !interacted : !travelling)) return;
    this.active = true;
    return { ...exit.destination };
  }
}
