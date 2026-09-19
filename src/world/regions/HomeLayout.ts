import type { Rect } from './definitions';

export const HOME_SIZE = { width: 1056, height: 864 };
export const HOME_ROOMS = {
  living: { x: 56, y: 460, width: 944, height: 368 },
  hall: { x: 56, y: 368, width: 944, height: 76 },
  protagonist: { x: 56, y: 80, width: 340, height: 264 },
  bathroom: { x: 420, y: 80, width: 204, height: 264 },
  parents: { x: 648, y: 80, width: 352, height: 264 },
} as const;
export const HOME_DOORWAYS: readonly Rect[] = [
  { x: 228, y: 344, width: 64, height: 24 }, { x: 492, y: 344, width: 64, height: 24 },
  { x: 788, y: 344, width: 64, height: 24 }, { x: 496, y: 444, width: 72, height: 16 },
  { x: 484, y: 828, width: 64, height: 36 },
];
export const HOME_WALLS: readonly Rect[] = [
  { x: 0, y: 0, width: 1056, height: 80 }, { x: 0, y: 80, width: 56, height: 784 },
  { x: 1000, y: 80, width: 56, height: 784 },
  { x: 396, y: 80, width: 24, height: 288 }, { x: 624, y: 80, width: 24, height: 288 },
  { x: 56, y: 344, width: 172, height: 24 }, { x: 292, y: 344, width: 200, height: 24 },
  { x: 556, y: 344, width: 232, height: 24 }, { x: 852, y: 344, width: 148, height: 24 },
  { x: 56, y: 444, width: 440, height: 16 }, { x: 568, y: 444, width: 432, height: 16 },
  { x: 56, y: 828, width: 428, height: 36 }, { x: 548, y: 828, width: 452, height: 36 },
];
export type HomeFurnitureKind = 'bed' | 'wardrobe' | 'dresser' | 'desk' | 'couch' | 'tv' | 'table'
  | 'counter' | 'sink' | 'stove' | 'fridge' | 'bath' | 'basin' | 'toilet';
export interface HomeFurniture extends Rect { kind: HomeFurnitureKind; tone?: 'plum' | 'sage' }
export const HOME_FURNITURE: readonly HomeFurniture[] = [
  { kind: 'bed', x: 80, y: 114, width: 80, height: 112, tone: 'plum' },
  { kind: 'wardrobe', x: 318, y: 92, width: 60, height: 48 },
  { kind: 'dresser', x: 80, y: 284, width: 92, height: 32 },
  { kind: 'desk', x: 278, y: 198, width: 94, height: 34 },
  { kind: 'bed', x: 758, y: 110, width: 132, height: 116, tone: 'sage' },
  { kind: 'dresser', x: 698, y: 112, width: 38, height: 32 },
  { kind: 'dresser', x: 912, y: 112, width: 38, height: 32 },
  { kind: 'wardrobe', x: 910, y: 276, width: 74, height: 48 },
  { kind: 'bath', x: 438, y: 108, width: 64, height: 104 },
  { kind: 'basin', x: 552, y: 112, width: 54, height: 30 },
  { kind: 'toilet', x: 564, y: 244, width: 32, height: 44 },
  { kind: 'tv', x: 248, y: 488, width: 110, height: 30 },
  { kind: 'couch', x: 236, y: 696, width: 140, height: 40 },
  { kind: 'table', x: 270, y: 600, width: 80, height: 40 },
  { kind: 'counter', x: 548, y: 484, width: 100, height: 38 },
  { kind: 'sink', x: 648, y: 484, width: 82, height: 38 },
  { kind: 'stove', x: 730, y: 484, width: 72, height: 38 },
  { kind: 'counter', x: 810, y: 526, width: 38, height: 116 },
  { kind: 'fridge', x: 810, y: 484, width: 38, height: 42 },
  { kind: 'table', x: 616, y: 658, width: 100, height: 54 },
];
export const HOME_SOLIDS: readonly Rect[] = [...HOME_WALLS, ...HOME_FURNITURE];
/** Player-center anchors, not saved raw positions or labels in the room. */
export const HOME_WALK_REVIEW = {
  entrance: { x: 516, y: 786 }, living: { x: 410, y: 650 }, kitchen: { x: 678, y: 574 },
  hall: { x: 530, y: 397 }, protagonist: { x: 245, y: 252 }, bathroom: { x: 531, y: 214 },
  parents: { x: 819, y: 272 },
} as const;
