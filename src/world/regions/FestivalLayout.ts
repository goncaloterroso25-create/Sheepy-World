import type { Rect } from './definitions';
import type { House } from './layouts';
export const FESTIVAL_PAVING: readonly Rect[] = [
  { x: 656, y: 1240, width: 96, height: 168 }, { x: 608, y: 1018, width: 192, height: 240 },
  { x: 448, y: 788, width: 480, height: 260 }, { x: 280, y: 400, width: 132, height: 548 },
  { x: 390, y: 860, width: 76, height: 88 }, { x: 348, y: 392, width: 720, height: 104 },
  { x: 636, y: 248, width: 100, height: 164 }, { x: 592, y: 248, width: 320, height: 112 },
  { x: 956, y: 480, width: 112, height: 412 }, { x: 912, y: 852, width: 336, height: 112 },
  { x: 1064, y: 626, width: 188, height: 236 }, { x: 740, y: 586, width: 210, height: 80 },
  { x: 420, y: 498, width: 134, height: 52 }, { x: 236, y: 550, width: 52, height: 78 },
  { x: 238, y: 820, width: 60, height: 36 },
];
export const FESTIVAL_HOUSES: readonly House[] = [
  { x: 368, y: 1090, width: 182, height: 170, variant: 'stone' },
  { x: 858, y: 1102, width: 188, height: 158, tone: 'rose', variant: 'gable' },
  { x: 500, y: 548, width: 220, height: 174, variant: 'stone', balcony: true },
  { x: 1064, y: 350, width: 224, height: 180, variant: 'gable' },
  { x: 98, y: 930, width: 156, height: 168, variant: 'narrow' },
  { x: 294, y: 194, width: 236, height: 164, tone: 'rose', variant: 'stone' },
];
export const FESTIVAL_STALLS = [
  { id: 'hydromel', x: 424, y: 800, width: 128, height: 78, color: 'gold' },
  { id: 'alchemy', x: 136, y: 460, width: 120, height: 78, color: 'purple' },
  { id: 'adventurer', x: 134, y: 740, width: 120, height: 76, color: 'red' },
  { id: 'specimens', x: 430, y: 414, width: 124, height: 78, color: 'green' },
  { id: 'books', x: 744, y: 506, width: 128, height: 78, color: 'blue' },
  { id: 'curios', x: 1106, y: 860, width: 112, height: 78, color: 'red' },
] as const;
export const FESTIVAL_WALLS: readonly Rect[] = [
  { x: 584, y: 232, width: 154, height: 12 }, { x: 848, y: 232, width: 76, height: 12 },
  { x: 570, y: 232, width: 14, height: 116 }, { x: 924, y: 232, width: 14, height: 116 },
  { x: 1078, y: 589, width: 194, height: 14 }, // archery backstop
  { x: 1270, y: 603, width: 12, height: 354 },
  { x: 604, y: 1252, width: 30, height: 70 }, { x: 774, y: 1252, width: 30, height: 70 },
];
export const FESTIVAL_SOLIDS: readonly Rect[] = [...FESTIVAL_HOUSES, ...FESTIVAL_STALLS, ...FESTIVAL_WALLS,
  { x: 622, y: 250, width: 58, height: 43 }, { x: 838, y: 290, width: 30, height: 35 },
  { x: 1144, y: 622, width: 42, height: 37 }];
