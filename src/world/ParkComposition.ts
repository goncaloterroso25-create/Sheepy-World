export interface ParkPoint {
  x: number;
  y: number;
}

export interface ParkPathDefinition {
  points: readonly ParkPoint[];
  outerWidth: number;
}

export type TreePlacement = readonly [number, number, number];
export type PropPlacement = readonly [number, number, string, number?];

export interface ParkBenchPlacement {
  id: 'memory-bench' | 'west-path-bench';
  x: number;
  y: number;
  texture: 'memory-bench' | 'bench';
  purpose: 'pond-view' | 'path-rest';
}

export interface ParkFencePlacement {
  x: number;
  y: number;
  angle: 0 | 90;
  purpose: 'pond-guard' | 'road-boundary';
}

export const PARK_PATH_JUNCTION: Readonly<ParkPoint> = { x: 520, y: 330 };
export const PARK_PATH_CLEARING: readonly ParkPoint[] = [
  { x: 474, y: 306 }, { x: 496, y: 287 }, { x: 550, y: 292 },
  { x: 567, y: 321 }, { x: 556, y: 365 }, { x: 490, y: 370 },
];

export const PARK_PATHS: readonly ParkPathDefinition[] = [
  {
    outerWidth: 56,
    points: [{ x: -28, y: 395 }, { x: 178, y: 395 }, { x: 255, y: 357 }],
  },
  {
    outerWidth: 60,
    points: [{ x: 612, y: 674 }, { x: 510, y: 674 }, { x: 510, y: 780 }],
  },
  {
    outerWidth: 82,
    points: [
      { x: 384, y: 120 }, { x: 394, y: 210 }, { x: 448, y: 285 },
      PARK_PATH_JUNCTION, { x: 566, y: 353 }, { x: 630, y: 486 }, { x: 610, y: 780 },
    ],
  },
  {
    outerWidth: 64,
    points: [
      PARK_PATH_JUNCTION, { x: 430, y: 300 }, { x: 346, y: 318 }, { x: 255, y: 357 },
      { x: 172, y: 430 }, { x: 96, y: 530 }, { x: -28, y: 578 },
    ],
  },
  {
    outerWidth: 66,
    points: [
      PARK_PATH_JUNCTION, { x: 570, y: 352 }, { x: 687, y: 377 }, { x: 790, y: 427 },
      { x: 940, y: 486 }, { x: 1060, y: 570 }, { x: 1308, y: 642 },
    ],
  },
];

export const PARK_POND_BOUNDS = { x: 780, y: 190, width: 268, height: 170 } as const;

export const PARK_BENCHES: readonly ParkBenchPlacement[] = [
  {
    id: 'memory-bench',
    x: 900,
    y: 386,
    texture: 'memory-bench',
    purpose: 'pond-view',
  },
  {
    id: 'west-path-bench',
    x: 258,
    y: 414,
    texture: 'bench',
    purpose: 'path-rest',
  },
];

export const PARK_FENCES: readonly ParkFencePlacement[] = [
  { x: 770, y: 236, angle: 90, purpose: 'pond-guard' },
  { x: 770, y: 280, angle: 90, purpose: 'pond-guard' },
  { x: 770, y: 324, angle: 90, purpose: 'pond-guard' },
  { x: 1022, y: 142, angle: 0, purpose: 'road-boundary' },
  { x: 1068, y: 142, angle: 0, purpose: 'road-boundary' },
  { x: 1114, y: 142, angle: 0, purpose: 'road-boundary' },
];

export const PARK_TREES: readonly TreePlacement[] = [
  [55, 166, 0], [128, 184, 1], [205, 167, 2], [286, 183, 3],
  [574, 178, 2], [672, 168, 0], [742, 174, 3],
  [1094, 166, 1], [1172, 182, 0], [1242, 166, 2],
  [70, 292, 2], [160, 304, 0], [270, 286, 1], [690, 285, 2],
  [1102, 294, 3], [1212, 310, 1],
  [24, 472, 3], [286, 438, 1], [374, 470, 0], [700, 454, 2],
  [1090, 432, 0], [1196, 468, 2],
  [54, 656, 1], [220, 592, 3], [330, 646, 2], [450, 590, 0],
  [760, 642, 0], [860, 610, 3], [1130, 665, 0], [1240, 560, 3],
  [130, 700, 0], [280, 706, 1], [420, 696, 2],
  [746, 704, 1], [890, 690, 2], [1050, 700, 3], [1200, 710, 1],
];

export const PARK_SHRUBS: readonly PropPlacement[] = [
  [86, 226, 'shrub-0'], [218, 224, 'shrub-2'], [302, 210, 'shrub-1'],
  [512, 224, 'shrub-0'], [674, 230, 'shrub-1'], [746, 190, 'shrub-0'],
  [1082, 226, 'shrub-2'], [1214, 248, 'shrub-0'],
  [96, 354, 'shrub-1'], [344, 350, 'shrub-0'], [710, 350, 'shrub-2'],
  [1104, 370, 'shrub-0'], [1212, 390, 'shrub-1'],
  [68, 512, 'shrub-0'], [302, 522, 'shrub-2'], [440, 532, 'shrub-0'],
  [760, 542, 'shrub-1'], [1150, 522, 'shrub-0'],
  [180, 680, 'shrub-1'], [800, 710, 'shrub-2'],
  [1130, 710, 'shrub-1'],
];

export const PARK_DECOR: readonly PropPlacement[] = [
  [34, 250, 'grass-tuft'], [152, 252, 'flower-patch'], [328, 238, 'leaf-pile'],
  [590, 238, 'grass-tuft'], [724, 314, 'leaf-pile'], [1080, 352, 'rock-small'],
  [1170, 376, 'flower-patch'], [200, 382, 'leaf-pile'], [334, 414, 'grass-tuft'],
  [420, 468, 'flower-patch'], [682, 468, 'leaf-pile'], [1110, 482, 'grass-tuft'],
  [74, 550, 'rock-small'], [248, 548, 'flower-patch'], [390, 612, 'leaf-pile'],
  [784, 586, 'grass-tuft'], [866, 552, 'flower-patch'], [1130, 590, 'leaf-pile'],
  [1228, 618, 'rock-small'], [274, 710, 'grass-tuft'], [580, 702, 'flower-patch'],
  [906, 706, 'leaf-pile'],
];

function distanceToSegment(point: ParkPoint, start: ParkPoint, end: ParkPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  const t = Math.max(0, Math.min(1, projection));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

export function isPointOnParkPath(point: ParkPoint, clearance = 0): boolean {
  return PARK_PATHS.some((path) => path.points.slice(1).some((end, index) => {
    const start = path.points[index];
    if (!start) return false;
    return distanceToSegment(point, start, end) <= path.outerWidth / 2 + clearance;
  }));
}

export function isGrassPlacement(point: ParkPoint, clearance = 0): boolean {
  if (point.y < 132 + clearance) return false;
  const pond = PARK_POND_BOUNDS;
  const insidePond = point.x >= pond.x - clearance
    && point.x <= pond.x + pond.width + clearance
    && point.y >= pond.y - clearance
    && point.y <= pond.y + pond.height + clearance;
  return !insidePond && !isPointOnParkPath(point, clearance);
}
