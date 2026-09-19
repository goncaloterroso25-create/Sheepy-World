import type Phaser from 'phaser';
import { PALETTE as P } from './palette';
import type { HomeFurniture } from '../world/regions/HomeLayout';

/** Contact bases match HomeLayout; taller silhouettes rise above them. */
export function homeFurniture(scene: Phaser.Scene, f: HomeFurniture): void {
  const { x, y, width: w, height: h, kind } = f;
  const g = scene.add.graphics().setDepth(y + h);
  g.fillStyle(P.shadowDeep, .2).fillRect(x + 4, y + 5, w, h);
  if (kind === 'bed') {
    g.fillStyle(P.woodDeep).fillRect(x, y - 12, w, h + 14);
    g.fillStyle(P.woodWarm).fillRect(x + 3, y - 10, w - 6, 13);
    g.fillStyle(P.plasterLight).fillRect(x + 4, y + 4, w - 8, h - 8);
    g.fillStyle(P.creamLight).fillRect(x + 10, y + 8, w - 20, 20);
    g.fillStyle(P.paperShade).fillRect(x + 12, y + 24, w - 24, 2);
    const base = f.tone === 'plum' ? P.plum : P.grassShade;
    g.fillStyle(base).fillRect(x + 5, y + 33, w - 10, h - 38);
    g.fillStyle(P.plaster).fillRect(x + 5, y + 32, w - 10, 5);
    g.fillStyle(P.cream, .25).fillRect(x + 12, y + 45, 3, h - 61).fillRect(x + w - 18, y + 41, 2, h - 57);
    return;
  }
  if (kind === 'couch') {
    // Back of a north-facing couch: the TV sits directly opposite, across the rug.
    g.fillStyle(P.plumDeep).fillRect(x, y, w, h).fillRect(x + 5, y - 12, w - 10, 20);
    g.fillStyle(P.plum).fillRect(x + 8, y - 9, w - 16, 29);
    g.fillStyle(P.plumLight).fillRect(x + 10, y - 9, w - 20, 3);
    g.fillStyle(P.woodDeep).fillRect(x + 8, y + h, 9, 5).fillRect(x + w - 17, y + h, 9, 5);
    g.fillStyle(P.paperShade).fillRect(x + 14, y - 8, 25, 35);
    g.fillStyle(P.cream).fillRect(x + 16, y - 8, 21, 26);
    return;
  }
  if (['bath', 'basin', 'toilet'].includes(kind)) {
    g.fillStyle(P.stoneShade).fillRect(x, y, w, h);
    g.fillStyle(P.plasterLight).fillRect(x + 2, y + 2, w - 4, h - 5);
    g.fillStyle(P.waterLight).fillRect(x + 8, y + 9, w - 16, h - 18);
    g.fillStyle(P.waterShade).fillRect(x + 12, y + 13, w - 24, h - 26);
    g.fillStyle(P.stoneDeep).fillRect(x + w - 13, y + 5, 5, 3);
    if (kind === 'toilet') g.fillStyle(P.plaster).fillRect(x - 2, y - 8, w + 4, 16);
    if (kind === 'basin') {
      g.fillStyle(P.woodDeep).fillRect(x + 2, y - 43, w - 4, 36);
      g.fillStyle(P.waterLight).fillRect(x + 5, y - 40, w - 10, 30);
      g.fillStyle(P.waterGlint).fillRect(x + 8, y - 37, 2, 20);
    }
    return;
  }
  g.fillStyle(P.woodDeep).fillRect(x, y, w, h);
  g.fillStyle(P.wood).fillRect(x + 3, y + 4, w - 6, h - 8);
  g.fillStyle(P.woodWarm).fillRect(x, y - 4, w, 8);
  g.fillStyle(P.woodLight).fillRect(x + 2, y - 4, w - 4, 2);
  if (kind === 'wardrobe' || kind === 'dresser') {
    const split = Math.floor(w / 2);
    g.fillStyle(P.woodDeep).fillRect(x + split, y + 5, 2, h - 12);
    g.fillStyle(P.leafGold).fillRect(x + split - 6, y + 15, 3, 3).fillRect(x + split + 5, y + 15, 3, 3);
    if (kind === 'wardrobe') {
      g.fillStyle(P.wood).fillRect(x + 2, y - 28, w - 4, 30);
      g.fillStyle(P.woodDeep).fillRect(x, y - 30, w, 4).fillRect(x + split, y - 26, 2, 27);
    }
  }
  if (kind === 'tv') {
    g.fillStyle(P.shadowDeep).fillRect(x + 8, y - 44, w - 16, 45);
    g.fillStyle(P.asphalt).fillRect(x + 12, y - 40, w - 24, 35);
    g.fillStyle(P.waterShade).fillRect(x + 17, y - 36, 21, 2);
    g.fillStyle(P.shadowDeep).fillRect(x + w / 2 - 10, y, 20, 3);
  }
  if (kind === 'table' || kind === 'desk') {
    g.fillStyle(P.woodWarm).fillRect(x + 2, y + 3, w - 4, h - 7);
    g.fillStyle(P.woodDeep).fillRect(x + 5, y + h, 5, 9).fillRect(x + w - 10, y + h, 5, 9);
  }
  if (kind === 'desk') {
    g.fillStyle(P.paper).fillRect(x + 12, y + 5, 23, 15);
    g.fillStyle(P.plumDeep).fillRect(x + 53, y - 12, 6, 22).fillRect(x + 62, y - 16, 8, 26);
  }
  if (['counter', 'sink', 'stove', 'fridge'].includes(kind)) {
    g.fillStyle(P.plaster).fillRect(x, y - 5, w, 17);
    g.fillStyle(P.plasterLight).fillRect(x + 1, y - 5, w - 2, 3);
    g.fillStyle(P.leafGold).fillRect(x + 12, y + 19, Math.max(5, Math.min(15, w - 24)), 2);
  }
  if (kind === 'sink') {
    g.fillStyle(P.stoneDeep).fillRect(x + 15, y - 1, w - 30, 18);
    g.fillStyle(P.waterShade).fillRect(x + 18, y + 2, w - 36, 11);
    g.fillStyle(P.stoneLight).fillRect(x + 25, y - 10, 3, 12).fillRect(x + 25, y - 10, 10, 3);
  }
  if (kind === 'stove') {
    g.fillStyle(P.asphalt).fillRect(x + 4, y - 3, w - 8, 19);
    for (const dx of [15, 44]) g.fillStyle(P.stoneShade).fillRect(x + dx, y, 12, 11);
    g.fillStyle(P.asphaltDeep).fillRect(x + 10, y + 20, w - 20, 13);
  }
  if (kind === 'fridge') {
    g.fillStyle(P.plaster).fillRect(x, y - 28, w, h + 28);
    g.fillStyle(P.paperShade).fillRect(x + 3, y - 5, w - 6, 2);
    g.fillStyle(P.stoneDeep).fillRect(x + w - 8, y + 3, 3, 13).fillRect(x + w - 8, y - 21, 3, 9);
  }
}
