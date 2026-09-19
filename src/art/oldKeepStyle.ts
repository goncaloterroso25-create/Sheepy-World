import type Phaser from 'phaser';
import { softBox, pixelOval } from './styleProofShapes';

export const KEEP = { deep: 0x48515a, side: 0x65717a, stone: 0x919e9c, light: 0xbdc3b1, cream: 0xddd4b5 };

function arch(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
  // Rounded crown, straight jambs: a chamfered box with a large cut produces
  // a cross, not a recessed opening. Three stepped courses keep the arch solid.
  const opening = (xx: number, yy: number, ww: number, hh: number): void => {
    const shoulder = Math.max(2, Math.floor(ww / 5));
    g.fillRect(xx + shoulder * 2, yy, ww - shoulder * 4, hh);
    g.fillRect(xx + shoulder, yy + 3, ww - shoulder * 2, hh - 3);
    g.fillRect(xx, yy + 8, ww, hh - 8);
  };
  g.fillStyle(KEEP.light); opening(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle(KEEP.deep); opening(x, y, w, h);
  g.fillStyle(0x353c48); opening(x + 4, y + 3, w - 7, h - 4);
  g.fillStyle(KEEP.side).fillRect(x + 3, y + 12, 2, h - 13);
}

/** Replaces the old gate drawing only. No larger footprint or new collision. */
export function oldKeepStyle(scene: Phaser.Scene): void {
  const floor = scene.add.graphics().setDepth(-88);
  floor.fillStyle(0x515b58, 0.3); pixelOval(floor, 563, 198, 487, 90);
  for (let row = 0; row < 6; row++) {
    const y = 230 + row * 14, inset = row * 12;
    floor.fillStyle(row % 2 ? 0xa7aa94 : 0x9da38f).fillRect(680 - inset, y, 244 + inset * 2, 12);
    floor.fillStyle(0xc3c4a9, 0.6).fillRect(688 - inset, y, 228 + inset * 2, 1);
  }
  const g = scene.add.graphics().setDepth(228);
  g.fillStyle(KEEP.deep).fillRect(706, 29, 180, 104);
  g.fillStyle(KEEP.stone).fillRect(710, 36, 172, 89);
  g.fillStyle(KEEP.side).fillRect(711, 102, 171, 23);
  // Broad coherent stone planes, sparse courses, deeply recessed central gate.
  for (const y of [53, 82, 111]) g.fillStyle(KEEP.light, 0.5).fillRect(714, y, 164, 1);
  arch(g, 751, 74, 89, 61);
  for (let x = 758; x < 838; x += 11) g.fillStyle(0x857565).fillRect(x, 87, 3, 43);
  g.fillStyle(0x534d4b).fillRect(754, 96, 84, 4);
  g.fillStyle(KEEP.deep).fillRect(706, 25, 180, 11);
  g.fillStyle(KEEP.light).fillRect(706, 23, 180, 4);
  for (let x = 708; x < 879; x += 28) {
    g.fillStyle(KEEP.stone).fillRect(x, 12, 18, 13);
    g.fillStyle(KEEP.cream).fillRect(x, 12, 18, 2);
  }
  for (const [i, x] of [590, 884].entries()) {
    const top = i ? 19 : 9;
    g.fillStyle(KEEP.deep); softBox(g, x, top + 14, 130, 204 - top, 9);
    g.fillStyle(KEEP.stone).fillRect(x + 11, top + 19, 83, 202 - top);
    g.fillStyle(KEEP.side).fillRect(x + 94, top + 19, 27, 202 - top);
    g.fillStyle(KEEP.light).fillRect(x + 11, top + 19, 7, 202 - top);
    for (const y of [54, 101, 149, 196]) {
      g.fillStyle(KEEP.side, 0.55).fillRect(x + 19, y, 72, 1);
      g.fillStyle(KEEP.light, 0.55).fillRect(x + 22 + y % 39, y + 2, 22, 2);
    }
    arch(g, x + 46, 61 + i * 9, 19, 37);
    arch(g, x + 46, 143, 19, 38);
    g.fillStyle(KEEP.deep).fillRect(x - 2, top + 10, 133, 12);
    g.fillStyle(KEEP.light).fillRect(x - 2, top + 9, 133, 3);
    for (let dx = 0; dx < 130; dx += 26) {
      g.fillStyle(KEEP.stone).fillRect(x + dx, top - 5, 18, 16);
      g.fillStyle(KEEP.cream).fillRect(x + dx, top - 5, 18, 2);
    }
    for (const bx of [x + 3, x + 104]) {
      g.fillStyle(KEEP.deep).fillRect(bx, 123, 24, 102);
      g.fillStyle(KEEP.side).fillRect(bx + 3, 126, 17, 96);
      g.fillStyle(KEEP.light).fillRect(bx + 3, 126, 3, 96);
      g.fillStyle(KEEP.stone).fillRect(bx, 121, 24, 5).fillRect(bx - 2, 216, 28, 9);
    }
  }
  for (const [x, c] of [[670, 0x9e6372], [913, 0x607f92]]) {
    g.fillStyle(0x5d4c49).fillRect(x!, 78, 2, 57);
    g.fillStyle(c!); softBox(g, x! + 2, 80, 22, 42, 3);
    g.fillStyle(0xd4b88b).fillRect(x! + 5, 82, 16, 2).fillRect(x! + 12, 91, 3, 17);
  }
}
