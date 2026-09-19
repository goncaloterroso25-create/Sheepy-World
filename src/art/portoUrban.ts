import type Phaser from 'phaser';
import type { House } from '../world/regions/layouts';
import type { Rect } from '../world/regions/definitions';
import { pixelOval, softBox } from './styleProofShapes';

/** Porto-only material ramps; no global palette or collision ownership. */
export const PORTO = {
  ink: 0x242637, night: 0x303344, paving: 0x535368, seam: 0x414357,
  stone: 0x777383, cap: 0xa39a98, plaster: 0x6d647a, rose: 0x816674,
  sage: 0x536f6a, roof: 0x433c50, roofLight: 0x695568,
  wood: 0x68515d, brass: 0xb99577, window: 0xe2b786, warm: 0xf7d9a6,
  leafDeep: 0x293f43, leaf: 0x45685d, leafLight: 0x71927a,
  river: 0x293f53, riverLight: 0x506b7b,
} as const;

export function nightPaving(g: Phaser.GameObjects.Graphics, paths: readonly Rect[]): void {
  for (const r of paths) {
    g.fillStyle(PORTO.seam); softBox(g, r.x - 3, r.y - 3, r.width + 6, r.height + 6, 5);
  }
  for (const r of paths) { g.fillStyle(PORTO.paving); softBox(g, r.x, r.y, r.width, r.height, 4); }
  // Draw each shared junction once, without seams crossing the walking lane.
  for (let y = 160; y < 1080; y += 12) for (let x = 0; x < 1792; x += 18) {
    const xx = x + (y % 24 ? 9 : 0);
    if (!paths.some(r => xx > r.x + 3 && xx + 15 < r.x + r.width - 3 && y > r.y + 3 && y + 9 < r.y + r.height - 3)) continue;
    const v = (x * 7 + y * 11) % 17;
    g.fillStyle(v < 5 ? 0x626074 : v < 9 ? 0x4d5063 : PORTO.paving);
    softBox(g, xx, y, 15, 9, 2);
    if (v < 4) g.fillStyle(0x797387, .5).fillRect(xx + 2, y, 6, 1);
    if (v === 12) g.fillStyle(PORTO.seam).fillRect(xx + 2, y + 7, 10, 1);
  }
}

function windowBay(g: Phaser.GameObjects.Graphics, x: number, y: number, lit: boolean, balcony: boolean): void {
  g.fillStyle(PORTO.ink).fillRect(x - 4, y - 3, 32, 39);
  g.fillStyle(PORTO.stone).fillRect(x - 3, y - 4, 30, 3).fillRect(x - 3, y - 1, 2, 35);
  g.fillStyle(lit ? 0x967766 : 0x384758).fillRect(x, y, 24, 31);
  g.fillStyle(lit ? PORTO.window : 0x506579).fillRect(x + 2, y + 2, 20, 24);
  if (lit) g.fillStyle(PORTO.warm).fillRect(x + 3, y + 3, 5, 22);
  g.fillStyle(PORTO.wood).fillRect(x + 11, y, 2, 31).fillRect(x, y + 10, 24, 2);
  g.fillStyle(PORTO.cap).fillRect(x - 5, y + 32, 34, 2);
  g.fillStyle(PORTO.roof).fillRect(x - 7, y + 1, 3, 29).fillRect(x + 27, y + 1, 3, 29);
  if (balcony) {
    g.fillStyle(PORTO.ink).fillRect(x - 9, y + 25, 42, 2).fillRect(x - 9, y + 37, 42, 3);
    for (let bx = x - 8; bx < x + 33; bx += 6) g.fillRect(bx, y + 25, 1, 12);
    g.fillStyle(PORTO.stone).fillRect(x - 10, y + 40, 44, 3);
    g.fillStyle(PORTO.brass).fillRect(x - 7, y + 25, 8, 1);
  }
}

export function nightFacade(scene: Phaser.Scene, h: House, index: number): void {
  const { x, y, width: w, height: ht } = h;
  const g = scene.add.graphics().setDepth(y + ht);
  const plaster = h.tone === 'rose' ? PORTO.rose : h.tone === 'green' ? PORTO.sage : PORTO.plaster;
  g.fillStyle(PORTO.ink, .6); softBox(g, x - 5, y + ht - 7, w + 17, 20, 5);
  g.fillStyle(PORTO.ink).fillRect(x, y, w, ht);
  g.fillStyle(plaster).fillRect(x + 3, y + 3, w - 6, ht - 10);
  g.fillStyle(0xc1a4a2, .18).fillRect(x + 4, y + 8, 3, ht - 25);
  g.fillStyle(PORTO.roof).fillRect(x + w - 10, y + 5, 7, ht - 12);
  // Stepped hips, cornice and chimney, distinct from the old flat roof strips.
  for (let row = 0; row < 4; row++) {
    const inset = (3 - row) * 5;
    g.fillStyle(row % 2 ? PORTO.roof : PORTO.roofLight).fillRect(x - 5 + inset, y - 21 + row * 6, w + 10 - inset * 2, 6);
    for (let tx = x + inset + 3; tx < x + w - inset; tx += 16)
      g.fillStyle(0x927078, .4).fillRect(tx, y - 20 + row * 6, 8, 1);
  }
  g.fillStyle(PORTO.ink).fillRect(x + w - 40, y - 31, 14, 15);
  g.fillStyle(PORTO.stone).fillRect(x + w - 39, y - 30, 10, 12);
  g.fillStyle(PORTO.cap).fillRect(x - 6, y + 3, w + 12, 3);
  if (h.variant === 'gable') for (let i = 0; i < 5; i++) {
    g.fillStyle(PORTO.stone).fillRect(x + Math.floor(w / 2) - 5 - i * 6, y - 34 + i * 7, 10 + i * 12, 7);
    g.fillStyle(PORTO.cap).fillRect(x + Math.floor(w / 2) - 5 - i * 6, y - 34 + i * 7, 10 + i * 12, 2);
  }
  const rows = ht > 185 ? [22, 79, 136] : ht > 150 ? [22, 76] : [23];
  const bays = h.variant === 'narrow' ? [24, w - 48] : [24, w - 50];
  rows.filter(dy => dy < ht - 72).forEach((dy, row) => {
    bays.forEach((dx, b) => windowBay(g, x + dx, y + dy, (index + row * 2 + b) % 4 !== 1, !!h.balcony || row === 1));
    g.fillStyle(PORTO.cap, .35).fillRect(x + 7, y + dy + 45, w - 17, 2);
  });
  // Footprint and recessed threshold remain exactly inside the old solid.
  g.fillStyle(PORTO.roof).fillRect(x + 2, y + ht - 13, w - 4, 11);
  g.fillStyle(PORTO.stone).fillRect(x, y + ht - 9, w, 4);
  const dx = x + Math.floor(w / 2) - 15, dy = y + ht - 48;
  g.fillStyle(PORTO.cap).fillRect(dx - 4, dy - 4, 38, 48);
  g.fillStyle(PORTO.ink).fillRect(dx - 1, dy, 32, 45);
  g.fillStyle(PORTO.wood).fillRect(dx + 4, dy + 4, 23, 36);
  g.fillStyle(PORTO.brass).fillRect(dx + 22, dy + 22, 2, 3);
  g.fillStyle(PORTO.window).fillRect(dx + 5, dy + 5, 21, 7);
  g.fillStyle(PORTO.cap).fillRect(dx - 5, y + ht - 4, 40, 4);
  if (h.variant === 'shop') {
    for (const sx of [x + 13, x + w - 49]) {
      g.fillStyle(PORTO.ink).fillRect(sx, dy + 2, 34, 36);
      g.fillStyle(PORTO.window).fillRect(sx + 3, dy + 5, 28, 26);
      g.fillStyle(PORTO.warm).fillRect(sx + 5, dy + 6, 6, 21);
      g.fillStyle(PORTO.wood).fillRect(sx + 6, dy + 24, 22, 2);
      g.fillStyle(PORTO.rose).fillRect(sx + 18, dy + 18, 5, 6);
    }
    g.fillStyle(PORTO.ink).fillRect(x + 9, dy - 11, w - 18, 14);
    for (let i = 0; i < w - 20; i += 10) {
      g.fillStyle(i % 20 ? 0xc29b97 : 0x865f79).fillRect(x + 10 + i, dy - 15, Math.min(10, w - 20 - i), 13);
      g.fillStyle(i % 20 ? 0xa67f85 : 0x654d68).fillRect(x + 10 + i, dy - 2, Math.min(10, w - 20 - i), 4);
    }
  }
  // Selective tilework and wear, not full-wall visual noise.
  for (let ty = y + ht - 29; ty < y + ht - 14; ty += 6) for (let tx = x + 8; tx < x + 27; tx += 6) {
    g.fillStyle(0x929ca4).fillRect(tx, ty, 5, 5);
    g.fillStyle(0x526276).fillRect(tx + 2, ty + 2, 1, 1);
  }
  g.fillStyle(PORTO.cap, .3).fillRect(x + w - 24, y + ht - 60, 8, 2).fillRect(x + 11, y + 16, 14, 1);
}

export function nightLamp(scene: Phaser.Scene, x: number, y: number): void {
  const pool = scene.add.graphics().setDepth(-85);
  for (const [w, h, alpha] of [[84, 30, .04], [58, 22, .07], [30, 12, .1]]) {
    pool.fillStyle(PORTO.window, alpha); pixelOval(pool, x - w! / 2, y - h! / 2 + 4, w!, h!);
  }
  const g = scene.add.graphics().setDepth(y + 4);
  g.fillStyle(PORTO.ink).fillRect(x - 2, y - 29, 4, 32).fillRect(x - 6, y + 1, 12, 3);
  g.fillStyle(PORTO.stone).fillRect(x, y - 28, 1, 28);
  g.fillStyle(PORTO.ink); softBox(g, x - 7, y - 44, 14, 18, 3);
  g.fillStyle(PORTO.brass).fillRect(x - 8, y - 44, 16, 2).fillRect(x - 5, y - 27, 10, 2);
  g.fillStyle(PORTO.window).fillRect(x - 5, y - 41, 10, 12);
  g.fillStyle(PORTO.warm).fillRect(x - 4, y - 40, 3, 10);
  g.fillStyle(PORTO.ink).fillRect(x, y - 41, 1, 12);
}

export function riverNight(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x292f40).fillRect(0, 1080, 1792, 38);
  for (let x = 0; x < 1792; x += 74) g.fillStyle(0x68677a).fillRect(x, 1096, 32, 2);
  g.fillStyle(PORTO.river).fillRect(0, 1150, 1792, 258);
  g.fillStyle(0x344b60).fillRect(0, 1218, 1792, 190);
  // Two distant banks and grouped warm windows, all below the unchanged parapet.
  for (let i = 0; i < 40; i++) {
    const x = i * 47, h = 18 + i * 19 % 35;
    g.fillStyle(0x303c51).fillRect(x, 1213 - h, 43, h);
    g.fillStyle(0x39475c).fillRect(x + 7, 1203 - h, 28, 10);
    g.fillStyle(0xbe9c83, .45).fillRect(x + 12, 1221 - h, 3, 3).fillRect(x + 25, 1221 - h, 3, 3);
    for (let j = 0; j < 3; j++) g.fillStyle(0x9d8d83, .2).fillRect(x + 10 - j * 2, 1222 + j * 7, 9 + j * 4, 1);
  }
  for (let i = 0; i < 150; i++) {
    const x = i * 113 % 1792, y = 1159 + i * 31 % 224;
    g.fillStyle(i % 5 ? PORTO.riverLight : 0x9e8d86, i % 5 ? .28 : .4).fillRect(x, y, 6 + i % 23, 1);
  }
  g.fillStyle(PORTO.ink).fillRect(0, 1118, 1792, 12);
  g.fillStyle(PORTO.stone).fillRect(0, 1120, 1792, 5);
  for (let x = 0; x < 1792; x += 28) {
    g.fillStyle(PORTO.ink).fillRect(x, 1104, 2, 16).fillRect(x + 12, 1108, 1, 10);
    if (x % 112 === 0) g.fillStyle(PORTO.stone).fillRect(x - 2, 1102, 7, 21);
  }
  g.fillStyle(PORTO.cap).fillRect(0, 1103, 1792, 2);
}
