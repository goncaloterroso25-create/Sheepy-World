import type { Rect } from './definitions';
export { HOME_SOLIDS } from './HomeLayout';

export interface House extends Rect {
  tone?: 'cream' | 'green' | 'rose'; balcony?: boolean; home?: boolean;
  variant?: 'shop' | 'stone' | 'narrow' | 'gable' | 'garage' | 'plain';
}
const treeSolids = (trees: readonly (readonly [number, number])[]): Rect[] =>
  trees.map(([x, y]) => ({ x: x - 4, y: y - 5, width: 8, height: 7 }));
// Shared paving, water and physical bases: art, audio and route QA all read this.
export const RIVER_PAVING: readonly Rect[] = [
  { x: 0, y: 1516, width: 1080, height: 98 }, // lower promenade
  { x: 208, y: 928, width: 872, height: 104 }, // upper street
  { x: 216, y: 1028, width: 80, height: 490 }, // west stairs
  { x: 968, y: 1028, width: 112, height: 672 }, // east stairs / overlook
  { x: 520, y: 1432, width: 376, height: 84 }, // intimate café square
  { x: 1032, y: 976, width: 448, height: 112 }, // bridge
  { x: 1428, y: 524, width: 104, height: 564 }, // east bank
  { x: 1508, y: 520, width: 668, height: 100 }, // market lane
  { x: 2080, y: 264, width: 96, height: 264 },
  { x: 2156, y: 264, width: 916, height: 96 }, // uphill residential street
  { x: 800, y: 432, width: 80, height: 500 }, // stone stair approach
  { x: 704, y: 388, width: 416, height: 94 }, // old lane / side pocket
  { x: 1056, y: 0, width: 64, height: 432 }, // Stone Steps remain on the western bank
  { x: 898, y: 354, width: 244, height: 40 }, // roadside layby
  { x: 1540, y: 756, width: 276, height: 94 }, // east-bank small garden court
  { x: 2748, y: 340, width: 64, height: 294 }, // signed, optional highlands detour
];
export const RIVER_BANKS = [
  { y: 0, height: 560, left: 1144, right: 1408 },
  { y: 560, height: 336, left: 1120, right: 1408 },
  { y: 896, height: 80, left: 1104, right: 1408 },
  { y: 1088, height: 224, left: 1104, right: 1392 },
  { y: 1312, height: 256, left: 1096, right: 1408 },
  { y: 1568, height: 224, left: 1112, right: 1424 },
] as const;
export const RIVER_WATER: readonly Rect[] = RIVER_BANKS.map(b => ({ x: b.left, y: b.y, width: b.right - b.left, height: b.height }));
export const RIVER_TREES = [[125, 1500], [388, 1535], [936, 1660], [1506, 1130], [1774, 873], [1936, 641], [2380, 400], [2927, 410], [667, 446], [721, 901]] as const;
export const RIVER_HOUSES: readonly House[] = [
  { x: 68, y: 1280, width: 162, height: 178, variant: 'stone' },
  { x: 322, y: 1290, width: 172, height: 168, tone: 'green', variant: 'plain' },
  { x: 560, y: 1244, width: 184, height: 176, tone: 'rose', variant: 'shop' },
  { x: 760, y: 1268, width: 172, height: 164, variant: 'shop', balcony: true },
  { x: 358, y: 1070, width: 180, height: 128, variant: 'gable' },
  { x: 548, y: 1070, width: 130, height: 128, tone: 'green', variant: 'narrow' },
  { x: 698, y: 1070, width: 206, height: 128, variant: 'stone' },
  { x: 302, y: 706, width: 152, height: 196, balcony: true, variant: 'narrow' },
  { x: 476, y: 736, width: 172, height: 166, variant: 'gable', tone: 'rose' },
  { x: 648, y: 744, width: 134, height: 158, variant: 'stone', tone: 'green' },
  { x: 150, y: 730, width: 122, height: 172, variant: 'plain' },
  { x: 932, y: 790, width: 128, height: 136, variant: 'gable' },
  { x: 704, y: 206, width: 170, height: 170, variant: 'stone', balcony: true },
  { x: 900, y: 166, width: 132, height: 166, variant: 'garage' },
  { x: 1552, y: 324, width: 182, height: 174, variant: 'stone', balcony: true },
  { x: 1754, y: 330, width: 148, height: 168, tone: 'green', variant: 'narrow' },
  { x: 1922, y: 346, width: 132, height: 152, tone: 'rose', variant: 'shop' },
  { x: 1560, y: 866, width: 192, height: 144, variant: 'gable' },
  { x: 2188, y: 80, width: 162, height: 166, variant: 'stone' },
  { x: 2384, y: 60, width: 142, height: 186, tone: 'green', variant: 'narrow', balcony: true },
  { x: 2574, y: 90, width: 188, height: 156, variant: 'shop' },
  { x: 2820, y: 56, width: 194, height: 190, tone: 'rose', variant: 'gable' },
  { x: 2454, y: 390, width: 184, height: 146, variant: 'stone' },
];
export const RIVER_WALLS: readonly Rect[] = [
  ...RIVER_BANKS.flatMap(b => [{ x: b.left - 12, y: b.y, width: 12, height: b.height }, { x: b.right, y: b.y, width: 12, height: b.height }]),
  { x: 1104, y: 976, width: 304, height: 10 }, { x: 1104, y: 1078, width: 304, height: 10 },
  { x: 298, y: 1036, width: 658, height: 14 },
  { x: 892, y: 1700, width: 200, height: 14 },
  { x: 1038, y: 32, width: 12, height: 298 }, { x: 1124, y: 32, width: 8, height: 298 },
  { x: 1850, y: 654, width: 205, height: 14 },
];
export const RIVER_CAFE_TABLES = [{ x: 612, y: 1462, width: 28, height: 18 }, { x: 790, y: 1460, width: 28, height: 18 }] as const;
export const RIVER_SOLIDS: readonly Rect[] = [
  ...RIVER_HOUSES, ...RIVER_WATER, ...RIVER_WALLS, ...treeSolids(RIVER_TREES), ...RIVER_CAFE_TABLES,
  { x: 940, y: 348, width: 110, height: 29 }, // parked classic car, never ambient traffic
  { x: 96, y: 522, width: 102, height: 179 }, // church/tower
];

export const VILA_ROADS: readonly Rect[] = [
  { x: 0, y: 566, width: 696, height: 58 }, { x: 648, y: 466, width: 60, height: 112 },
  { x: 692, y: 448, width: 426, height: 58 }, { x: 648, y: 624, width: 60, height: 372 },
];
export const VILA_PAVING: readonly Rect[] = [
  { x: 474, y: 348, width: 354, height: 28 },
  { x: 0, y: 550, width: 724, height: 92 }, { x: 628, y: 432, width: 96, height: 164 },
  { x: 712, y: 432, width: 418, height: 90 }, { x: 628, y: 620, width: 96, height: 394 },
  { x: 802, y: 320, width: 68, height: 130 },
  { x: 184, y: 412, width: 48, height: 140 }, { x: 450, y: 334, width: 48, height: 220 },
  { x: 288, y: 708, width: 342, height: 46 }, { x: 856, y: 522, width: 48, height: 182 },
  { x: 710, y: 688, width: 218, height: 48 },
  { x: 288, y: 968, width: 344, height: 40 }, { x: 490, y: 936, width: 142, height: 64 },
  { x: 710, y: 996, width: 268, height: 24 }, { x: 928, y: 916, width: 40, height: 102 },
];
export const VILA_TREES = [[58, 526], [343, 524], [578, 469], [1010, 354], [1086, 610], [769, 654], [163, 709], [541, 910], [990, 947]] as const;
export const VILA_HOUSES: readonly House[] = [
  { x: 110, y: 230, width: 188, height: 182, variant: 'gable' },
  { x: 386, y: 156, width: 176, height: 182, tone: 'rose', balcony: true, variant: 'plain' },
  { x: 744, y: 126, width: 184, height: 200, home: true, variant: 'stone' },
  { x: 218, y: 806, width: 180, height: 160, tone: 'green', variant: 'garage' },
  { x: 860, y: 772, width: 198, height: 142, variant: 'narrow' },
];
export const VILA_WALLS: readonly Rect[] = [
  { x: 70, y: 184, width: 12, height: 276 }, { x: 308, y: 184, width: 12, height: 276 },
  { x: 70, y: 444, width: 108, height: 16 }, { x: 238, y: 444, width: 82, height: 16 },
  { x: 350, y: 82, width: 12, height: 322 },
  { x: 350, y: 388, width: 94, height: 16 }, { x: 504, y: 388, width: 82, height: 16 },
  { x: 694, y: 376, width: 96, height: 16 }, { x: 882, y: 376, width: 170, height: 16 },
  { x: 350, y: 82, width: 690, height: 12 }, { x: 1040, y: 82, width: 16, height: 310 },
  { x: 180, y: 764, width: 310, height: 12 }, { x: 180, y: 764, width: 12, height: 260 },
  { x: 490, y: 776, width: 12, height: 158 }, { x: 490, y: 986, width: 12, height: 38 },
  { x: 180, y: 1012, width: 322, height: 12 },
  { x: 820, y: 752, width: 12, height: 244 }, { x: 1090, y: 752, width: 12, height: 244 },
  { x: 820, y: 984, width: 100, height: 12 }, { x: 976, y: 984, width: 126, height: 12 },
];
export const VILA_SOLIDS: readonly Rect[] = [...VILA_HOUSES, ...VILA_WALLS, ...treeSolids(VILA_TREES),
  { x: 449, y: 503, width: 43, height: 13 }];
