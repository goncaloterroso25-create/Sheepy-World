import type Phaser from 'phaser';
import { PALETTE } from './palette';
import { softBox } from './styleProofShapes';

/** Local material ramps; no global palette or neighboring region changes. */
export const FAIR = { ...PALETTE, grassDeep: 0x526e60, grass: 0x819372,
  grassShade: 0x687e66, soilDeep: 0x817968, stoneDeep: 0x545f60,
  stoneShade: 0x899185, stone: 0xa6aa96, stoneLight: 0xcecbb0,
  woodDeep: 0x574c49, woodWarm: 0x9c7b5c, woodLight: 0xc7aa7d,
  festivalRed: 0xb87879, festivalGold: 0xc3a268, festivalBlue: 0x718d96 };

export function fairPaving(g: Phaser.GameObjects.Graphics,
  r: { x: number; y: number; width: number; height: number }): void {
  g.fillStyle(0x707b70); softBox(g, r.x, r.y, r.width, r.height, 5);
  g.fillStyle(0xa5a68e); softBox(g, r.x + 3, r.y + 3, r.width - 6, r.height - 6, 4);
  // Broken broad courses, not a uniformly noisy brick grid.
  for (let y = r.y + 9, row = 0; y < r.y + r.height - 8; y += 23, row++) {
    for (let x = r.x + 8 + row % 3 * 9; x < r.x + r.width - 32; x += 67) {
      g.fillStyle(row % 2 ? 0xb9b79b : 0x969d88).fillRect(x, y, 25, 2);
      g.fillStyle(0x89917d).fillRect(x + 24, y + 2, 1, 5);
    }
  }
}
