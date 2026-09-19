import type Phaser from 'phaser';
import { PALETTE as P } from '../../art/palette';
import type { Rect } from './definitions';
import type { House } from './layouts';

export function blockers(scene: Phaser.Scene, rects: readonly Rect[]): Phaser.Physics.Arcade.StaticGroup {
  const group = scene.physics.add.staticGroup();
  for (const r of rects) {
    const body = group.create(r.x + r.width / 2, r.y + r.height / 2, 'collision') as Phaser.Physics.Arcade.Sprite;
    body.setDisplaySize(r.width, r.height).setVisible(false).refreshBody();
  }
  return group;
}

export function bakeGround(scene: Phaser.Scene, key: string, width: number, height: number,
  draw: (g: Phaser.GameObjects.Graphics) => void): void {
  if (!scene.textures.exists(key)) {
    const g = scene.add.graphics(); draw(g); g.generateTexture(key, width, height); g.destroy();
  }
  scene.add.image(0, 0, key).setOrigin(0).setDepth(-100);
}

export function paving(g: Phaser.GameObjects.Graphics, r: Rect, shade = false): void {
  g.fillStyle(shade ? P.stone : P.stoneLight).fillRect(r.x, r.y, r.width, r.height);
  g.fillStyle(shade ? P.stoneShade : P.stone, .45);
  for (let y = r.y + 8; y < r.y + r.height - 2; y += 20) {
    for (let x = r.x + (y % 40 ? 8 : 22); x < r.x + r.width - 18; x += 38) {
      g.fillRect(x, y, 18, 1).fillRect(x + 18, y, 1, 7);
    }
  }
}

export function stoneWall(g: Phaser.GameObjects.Graphics, r: Rect): void {
  g.fillStyle(P.stoneDeep).fillRect(r.x, r.y, r.width, r.height);
  g.fillStyle(P.stone).fillRect(r.x + 1, r.y + 2, r.width - 2, r.height - 4);
  g.fillStyle(P.stoneLight).fillRect(r.x, r.y, r.width, 3);
  g.fillStyle(P.stoneShade);
  for (let x = r.x + 12; x < r.x + r.width - 2; x += 21) g.fillRect(x, r.y + 4, 1, r.height - 6);
}

export function house(scene: Phaser.Scene, h: House): void {
  const { x, y, width: w, height: ht } = h;
  const g = scene.add.graphics().setDepth(y + ht - 15);
  const plaster = h.tone === 'green' ? P.grassShade : h.tone === 'rose' ? P.paperShade : P.plaster;
  g.fillStyle(P.shadowDeep, .2).fillRect(x + 8, y + 20, w + 6, ht + 3);
  g.fillStyle(P.stoneDeep).fillRect(x, y, w, ht);
  g.fillStyle(plaster).fillRect(x + 3, y + 6, w - 6, ht - 15);
  g.fillStyle(P.plasterLight, .5).fillRect(x + 5, y + 10, 3, ht - 30);
  // Small authored age marks and string courses keep the broad plaster quiet.
  g.fillStyle(P.paperShadow, .24).fillRect(x + w - 18, y + ht - 62, 2, 22)
    .fillRect(x + w - 25, y + ht - 42, 9, 2).fillRect(x + 13, y + ht - 27, 17, 2);
  g.fillStyle(P.plasterLight, .35).fillRect(x + 4, y + ht - 59, w - 8, 2);
  stoneWall(g, { x, y: y + ht - 18, width: w, height: 18 });
  // Terracotta courses and a stepped hip roof, all integral pixels.
  g.fillStyle(P.leafRedDeep).fillRect(x - 7, y + 4, w + 14, 11);
  for (let row = 0; row < 5; row++) {
    const inset = (4 - row) * 5;
    g.fillStyle(row % 2 ? P.leafOrangeDeep : P.leafRed).fillRect(x - 6 + inset, y - 26 + row * 7, w + 12 - inset * 2, 7);
    g.fillStyle(P.woodLight, .45);
    for (let col = 0; col < w - inset * 2; col += 13) g.fillRect(x + inset + col, y - 25 + row * 7, 7, 1);
  }
  const windows = h.variant === 'narrow' ? [x + Math.floor(w / 2) - 13]
    : h.variant === 'shop' && w > 170 ? [x + 19, x + Math.floor(w / 2) - 13, x + w - 47] : [x + 22, x + w - 52];
  for (const wx of windows) {
    g.fillStyle(P.stoneLight).fillRect(wx - 3, y + 34, 32, 43);
    g.fillStyle(P.waterDeep).fillRect(wx, y + 37, 26, 34);
    g.fillStyle(P.waterLight).fillRect(wx + 2, y + 39, 9, 13);
    g.fillStyle(P.plasterLight).fillRect(wx + 12, y + 37, 2, 34).fillRect(wx, y + 54, 26, 2);
    g.fillStyle(P.woodDeep).fillRect(wx - 6, y + 36, 4, 36).fillRect(wx + 28, y + 36, 4, 36);
  }
  const dx = x + Math.floor(w / 2) - 15, dy = y + ht - 51;
  g.fillStyle(P.stoneLight).fillRect(dx - 4, dy - 4, 38, 53);
  g.fillStyle(P.woodDeep).fillRect(dx, dy, 30, 49);
  g.fillStyle(P.wood).fillRect(dx + 3, dy + 3, 24, 43);
  g.fillStyle(P.woodWarm).fillRect(dx + 5, dy + 5, 4, 39);
  g.fillStyle(P.leafGold).fillRect(dx + 23, dy + 25, 2, 3);
  // Tiny blue-and-cream ceramic door tile, no real address or copied lettering.
  g.fillStyle(P.waterDeep).fillRect(dx + 37, dy + 13, 11, 8);
  g.fillStyle(P.plasterLight).fillRect(dx + 39, dy + 15, 7, 4);
  g.fillStyle(P.waterShade).fillRect(dx + 41, dy + 16, 3, 2);
  if (h.balcony) {
    g.fillStyle(P.shadowDeep).fillRect(x + 14, y + 82, w - 28, 3).fillRect(x + 14, y + 96, w - 28, 3);
    for (let bx = x + 17; bx < x + w - 13; bx += 7) g.fillRect(bx, y + 83, 2, 13);
    g.fillStyle(P.leafRedDeep).fillRect(x + w - 48, y + 84, 24, 11);
    g.fillStyle(P.grass).fillRect(x + w - 50, y + 79, 28, 5);
    g.fillStyle(P.plumLight).fillRect(x + w - 47, y + 77, 3, 3).fillRect(x + w - 33, y + 77, 4, 3);
  }
  if (h.home) {
    g.fillStyle(P.warmLight).fillRect(dx + 5, dy + 4, 20, 8);
    g.fillStyle(P.creamLight).fillRect(x + 24, y + 39, 8, 14);
  }
  if (h.variant === 'stone') {
    for (const sx of [x + 3, x + w - 16]) {
      for (let sy = y + 17; sy < y + ht - 18; sy += 18) {
        g.fillStyle(P.stoneShade).fillRect(sx, sy, 13, 14);
        g.fillStyle(P.stoneLight).fillRect(sx, sy, 13, 2);
      }
    }
    g.fillStyle(P.stone).fillRect(x + 3, y + ht - 59, w - 6, 6);
  }
  if (h.variant === 'shop') {
    g.fillStyle(P.woodDeep).fillRect(x + 12, dy - 25, w - 24, 25);
    for (let aw = 0; aw < w - 24; aw += 12) {
      g.fillStyle(aw % 24 ? P.plasterLight : h.tone === 'rose' ? P.plum : P.grassShade)
        .fillRect(x + 12 + aw, dy - 24, Math.min(12, w - 24 - aw), 18);
    }
    g.fillStyle(P.woodWarm).fillRect(x + 16, dy + 10, 25, 28);
    g.fillStyle(P.waterDeep).fillRect(x + 19, dy + 13, 19, 20);
  }
  if (h.variant === 'gable') {
    for (let row = 0; row < 6; row++) {
      g.fillStyle(row % 2 ? P.leafRedDeep : P.leafRed).fillRect(x + w / 2 - row * 6 - 4, y - 41 + row * 6, row * 12 + 8, 6);
    }
    g.fillStyle(P.woodDeep).fillRect(x + w / 2 - 9, y + 8, 18, 18);
    g.fillStyle(P.plasterLight).fillRect(x + w / 2 - 6, y + 11, 12, 12);
    g.fillStyle(P.waterDeep).fillRect(x + w / 2 - 1, y + 11, 2, 12);
  }
  if (h.variant === 'garage') {
    g.fillStyle(P.stoneDeep).fillRect(x + 14, dy - 9, w - 28, 59);
    g.fillStyle(P.wood).fillRect(x + 18, dy - 5, w - 36, 53);
    for (let sy = dy + 4; sy < dy + 47; sy += 9) g.fillStyle(P.woodDeep).fillRect(x + 19, sy, w - 38, 1);
  }
}

export function wallLamp(scene: Phaser.Scene, x: number, y: number): void {
  const g = scene.add.graphics().setDepth(y + 12);
  g.fillStyle(P.shadowDeep).fillRect(x - 8, y - 24, 9, 3).fillRect(x - 1, y - 24, 2, 7).fillRect(x - 5, y - 18, 10, 16);
  g.fillStyle(P.leafGold).fillRect(x - 3, y - 15, 6, 10);
  g.fillStyle(P.creamLight).fillRect(x - 2, y - 14, 3, 6);
}

export function cafeTable(scene: Phaser.Scene, r: Rect): void {
  const g = scene.add.graphics().setDepth(r.y + r.height);
  g.fillStyle(P.woodDeep).fillRect(r.x + 4, r.y + 8, 4, 20).fillRect(r.x + r.width - 8, r.y + 8, 4, 20);
  g.fillStyle(P.woodWarm).fillRect(r.x - 3, r.y - 3, r.width + 6, r.height);
  g.fillStyle(P.woodLight).fillRect(r.x, r.y - 3, r.width, 2);
  for (const cx of [r.x - 17, r.x + r.width + 8]) {
    g.fillStyle(P.woodDeep).fillRect(cx, r.y + 1, 9, 19);
    g.fillStyle(P.woodWarm).fillRect(cx, r.y + 7, 11, 5);
  }
  g.fillStyle(P.plasterLight).fillRect(r.x + 8, r.y - 6, 5, 5);
}

export function planter(scene: Phaser.Scene, x: number, y: number): void {
  const g = scene.add.graphics().setDepth(y);
  g.fillStyle(P.woodDeep).fillRect(x - 11, y - 6, 22, 10);
  g.fillStyle(P.leafRed).fillRect(x - 9, y - 6, 18, 7);
  g.fillStyle(P.grassDeep).fillRect(x - 12, y - 15, 25, 10);
  g.fillStyle(P.grass).fillRect(x - 9, y - 18, 9, 7).fillRect(x + 2, y - 17, 10, 9);
  g.fillStyle(P.plumLight).fillRect(x - 7, y - 19, 3, 3).fillRect(x + 5, y - 17, 4, 3);
}

/** A few authored domestic trees, with clustered foliage rather than terrain noise. */
export function gardenTree(scene: Phaser.Scene, x: number, y: number): void {
  const g = scene.add.graphics().setDepth(y);
  g.fillStyle(P.shadowDeep, .25).fillRect(x - 16, y - 2, 36, 7);
  g.fillStyle(P.woodDeep).fillRect(x - 3, y - 37, 8, 38);
  g.fillStyle(P.woodWarm).fillRect(x - 1, y - 30, 2, 27);
  g.fillStyle(P.grassDeep).fillRect(x - 24, y - 47, 50, 22).fillRect(x - 17, y - 58, 35, 39);
  g.fillStyle(P.grass).fillRect(x - 22, y - 48, 26, 18).fillRect(x - 13, y - 57, 27, 23).fillRect(x + 5, y - 44, 18, 16);
  g.fillStyle(P.grassLight).fillRect(x - 14, y - 54, 12, 6).fillRect(x + 8, y - 39, 9, 5);
  g.fillStyle(P.leafGold).fillRect(x - 13, y - 34, 4, 4).fillRect(x + 12, y - 48, 4, 4);
}
