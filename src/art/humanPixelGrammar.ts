import type Phaser from 'phaser';

export type PixelBands = readonly (readonly [inset: number, width: number, rows: number])[];
export interface ClothRamp { edge: number; base: number; light: number }

/** Authored contours, not a common body template. Each band is an integer
 * scanline group; shoulders, hair and hems can all have different silhouettes. */
export function silhouette(g: Phaser.GameObjects.Graphics, x: number, y: number, bands: PixelBands): void {
  for (const [inset, width, rows] of bands) {
    g.fillRect(x + inset, y, width, rows); y += rows;
  }
}

/** A tapered cloth limb between two authored joints. One edge, one broad
 * material mass, a selective highlight. No outlining of every interior seam. */
export function clothLimb(g: Phaser.GameObjects.Graphics, x: number, y: number,
  endX: number, endY: number, width: number, cuff: number, ramp: ClothRamp): void {
  for (let row = y; row <= endY; row++) {
    const t = (row - y) / Math.max(1, endY - y);
    const xx = Math.round(x + (endX - x) * t);
    const w = Math.round(width + (cuff - width) * t);
    g.fillStyle(ramp.edge).fillRect(xx, row, w, 1);
    if (w > 2) g.fillStyle(ramp.base).fillRect(xx + 1, row, w - 2, 1);
    if (w > 4 && t < 0.65) g.fillStyle(ramp.light).fillRect(xx + 1, row, 1, 1);
  }
}

export function shoe(g: Phaser.GameObjects.Graphics, x: number, y: number, width: number,
  highlight = 0x68636a): void {
  g.fillStyle(0x282832).fillRect(x + 1, y, width - 2, 1).fillRect(x, y + 1, width, 1);
  g.fillStyle(highlight).fillRect(x + 1, y, Math.max(1, width - 3), 1);
}
