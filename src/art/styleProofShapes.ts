import type Phaser from 'phaser';

/** Integer scanlines, deliberately stepped; no antialiased ellipse edges. */
export function pixelOval(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
  for (let row = 0; row < h; row += 2) {
    const t = (row + 1) / h * 2 - 1;
    const inset = Math.round(w * (1 - Math.sqrt(Math.max(0, 1 - t * t))) / 2);
    g.fillRect(x + inset, y + row, Math.max(1, w - inset * 2), Math.min(2, h - row));
  }
}

/** Chamfered upholstery/ceramics retain the collision footprint's visual base. */
export function softBox(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, cut = 3): void {
  cut = Math.max(0, Math.min(cut, Math.floor((Math.min(w, h) - 1) / 2)));
  g.fillRect(x + cut, y, w - cut * 2, h).fillRect(x, y + cut, w, h - cut * 2);
}
