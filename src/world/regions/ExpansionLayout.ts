import type { Rect } from './definitions';
import type { House } from './layouts';
import type { HomeFurniture } from './HomeLayout';

export const PORTO_PATHS: readonly Rect[] = [
  { x: 200, y: 976, width: 1592, height: 104 }, { x: 1080, y: 430, width: 108, height: 580 },
  { x: 236, y: 426, width: 952, height: 104 }, { x: 232, y: 426, width: 96, height: 598 },
  { x: 492, y: 160, width: 96, height: 302 }, { x: 540, y: 160, width: 886, height: 100 },
  { x: 1330, y: 200, width: 96, height: 848 }, { x: 740, y: 488, width: 110, height: 296 },
  { x: 594, y: 678, width: 348, height: 160 },
];
export const PORTO_HOUSES: readonly House[] = [
  { x: 1268, y: 810, width: 192, height: 140, variant: 'stone', balcony: true },
  { x: 1492, y: 802, width: 188, height: 148, variant: 'shop' },
  { x: 926, y: 580, width: 132, height: 240, variant: 'narrow', tone: 'green' },
  { x: 690, y: 264, width: 190, height: 140, variant: 'shop', tone: 'rose' },
  { x: 918, y: 238, width: 162, height: 166, variant: 'gable' },
  { x: 1454, y: 302, width: 198, height: 220, variant: 'stone', balcony: true },
  { x: 1480, y: 548, width: 162, height: 198, variant: 'narrow', tone: 'rose' },
];
export const PORTO_SOLIDS: readonly Rect[] = [...PORTO_HOUSES,
  { x: 0, y: 1150, width: 1792, height: 258 }, { x: 0, y: 1118, width: 1792, height: 12 },
  { x: 608, y: 588, width: 310, height: 77 }, { x: 352, y: 330, width: 106, height: 70 },
  { x: 146, y: 628, width: 58, height: 14 }, { x: 346, y: 792, width: 60, height: 14 },
];
export const FOREST_PATHS: readonly Rect[] = [
  { x: 648, y: 1370, width: 112, height: 934 }, { x: 730, y: 1480, width: 360, height: 84 },
  { x: 1010, y: 1280, width: 80, height: 276 }, { x: 730, y: 1280, width: 356, height: 76 },
  { x: 434, y: 1832, width: 214, height: 72 }, { x: 460, y: 1990, width: 228, height: 64 },
];
export const FOREST_WATER: readonly Rect[] = [
  { x: 0, y: 1740, width: 618, height: 76 }, { x: 790, y: 1740, width: 618, height: 76 },
  { x: 236, y: 1890, width: 176, height: 118 },
];
export const FOREST_TREES: readonly {x:number;y:number;variant:number}[] = Array.from({length:126},(_,i)=>({x:60+(i*193)%1280,y:1460+(i*139)%760,variant:i%3}))
  .filter(p=>!FOREST_PATHS.some(r=>p.x>r.x-42&&p.x<r.x+r.width+42&&p.y>r.y-35&&p.y<r.y+r.height+35)
    &&!FOREST_WATER.some(r=>p.x>r.x-25&&p.x<r.x+r.width+25&&p.y>r.y-28&&p.y<r.y+r.height+28)
    &&Math.hypot(p.x-470,p.y-1840)>52);
export const FOREST_TRUNKS: readonly Rect[]=FOREST_TREES.map(p=>({x:p.x-9,y:p.y-10,width:18,height:12}));
export const CASTLE_SOLIDS: readonly Rect[] = [
  { x: 600, y: 0, width: 106, height: 226 }, { x: 886, y: 0, width: 128, height: 226 },
  { x: 690, y: 26, width: 212, height: 106 },
  { x: 697, y: 217, width: 54, height: 18 }, { x: 839, y: 217, width: 55, height: 18 },
  { x: 596, y: 640, width: 80, height: 64 },
];
export const GONCALO_ROOMS = {
  bedroom: { x: 48, y: 76, width: 452, height: 300 }, living: { x: 524, y: 76, width: 580, height: 300 },
  sister: { x: 48, y: 420, width: 432, height: 368 }, kitchen: { x: 686, y: 420, width: 418, height: 368 },
  hall: { x: 48, y: 816, width: 1056, height: 100 },
};
export const GONCALO_WALLS: readonly Rect[] = [
  { x: 32, y: 48, width: 1088, height: 28 }, { x: 32, y: 76, width: 16, height: 856 },
  { x: 1104, y: 76, width: 16, height: 856 }, { x: 48, y: 916, width: 488, height: 16 }, { x: 600, y: 916, width: 504, height: 16 },
  { x: 48, y: 376, width: 360, height: 24 }, { x: 480, y: 376, width: 48, height: 24 }, { x: 616, y: 376, width: 488, height: 24 },
  { x: 500, y: 76, width: 24, height: 236 },
  { x: 480, y: 420, width: 20, height: 272 }, { x: 480, y: 764, width: 20, height: 52 },
  { x: 666, y: 420, width: 20, height: 272 }, { x: 666, y: 764, width: 20, height: 52 },
  { x: 48, y: 788, width: 360, height: 28 }, { x: 760, y: 788, width: 344, height: 28 },
];
export const GONCALO_FURNITURE: readonly HomeFurniture[] = [
  { kind: 'bed', x: 70, y: 126, width: 156, height: 172, tone: 'plum' },
  { kind: 'wardrobe', x: 372, y: 104, width: 100, height: 45 },
  { kind: 'desk', x: 286, y: 210, width: 176, height: 43 },
  { kind: 'couch', x: 808, y: 286, width: 146, height: 40 },
  { kind: 'tv', x: 814, y: 124, width: 138, height: 28 },
  { kind: 'desk', x: 972, y: 280, width: 110, height: 35 },
  { kind: 'table', x: 584, y: 180, width: 130, height: 62 },
  { kind: 'bed', x: 78, y: 482, width: 96, height: 146, tone: 'plum' },
  { kind: 'dresser', x: 330, y: 466, width: 100, height: 40 },
  { kind: 'wardrobe', x: 318, y: 642, width: 108, height: 50 },
  { kind: 'counter', x: 716, y: 448, width: 108, height: 40 },
  { kind: 'sink', x: 824, y: 448, width: 100, height: 40 },
  { kind: 'stove', x: 924, y: 448, width: 78, height: 40 },
  { kind: 'fridge', x: 1030, y: 444, width: 50, height: 60 },
  { kind: 'table', x: 742, y: 592, width: 120, height: 58 },
];
export const GONCALO_SOLIDS: readonly Rect[] = [...GONCALO_WALLS, ...GONCALO_FURNITURE];
export const SNOW_SOLIDS: readonly Rect[] = [
  { x: 0, y: 0, width: 1280, height: 128 }, { x: 533, y: 399, width: 136, height: 42 },
  { x: 830, y: 600, width: 124, height: 46 }, { x: 292, y: 410, width: 84, height: 30 },
  { x: 916, y: 166, width: 226, height: 148 },
  { x: 104, y: 548, width: 342, height: 170 },
];
