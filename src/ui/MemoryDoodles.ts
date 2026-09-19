import type Phaser from 'phaser';
import { restoredDoodleKind, unresolvedDoodleKind } from './LivingScrapbook';

export interface MemoryDoodleOptions {
  restored?: boolean;
  accent?: number;
  cool?: number;
}

/** Original tiny paper illustrations. Unrestored marks depict evidence only;
 * completed people, places, romance, bands and snowmen belong to restored pages. */
export function memoryDoodle(g: Phaser.GameObjects.Graphics, x: number, y: number, fragmentId: string,
  scale = 1, options: MemoryDoodleOptions = {}): void {
  const rect = (dx: number, dy: number, w: number, h: number, color: number): void => {
    g.fillStyle(color).fillRect(x + dx * scale, y + dy * scale, w * scale, h * scale);
  };
  const ink = 0x674c50;
  const pale = 0xe8eff0;
  const gold = options.accent ?? 0xcda55e;
  const cool = options.cool ?? 0x6c7f84;
  const restored = options.restored === true;
  const kind = unresolvedDoodleKind(fragmentId);
  const restoredKind = restoredDoodleKind(fragmentId);

  if (!restored) {
    if (kind === 'sleep-trace') {
      // An incomplete clock, one visible two, and missing digits.
      rect(7, 2, 15, 2, ink); rect(3, 6, 2, 12, ink); rect(6, 20, 7, 2, ink);
      rect(20, 6, 2, 5, ink); rect(17, 14, 2, 2, ink); rect(13, 7, 2, 6, ink);
      rect(9, 9, 4, 2, ink); rect(9, 11, 2, 3, ink); rect(9, 14, 5, 2, ink);
      rect(19, 18, 2, 2, gold); rect(24, 18, 2, 2, gold);
    } else if (kind === 'quiet-strokes') {
      rect(3, 11, 24, 2, ink); rect(7, 17, 17, 2, gold); rect(5, 8, 2, 2, ink); rect(25, 14, 2, 2, ink);
    } else if (kind === 'headlights') {
      rect(5, 12, 22, 6, 0x454a51); rect(9, 9, 14, 4, 0x565d64);
      rect(7, 16, 4, 3, pale); rect(21, 16, 4, 3, pale); rect(1, 20, 7, 1, ink); rect(25, 20, 6, 1, ink);
    } else if (kind === 'torn-poster') {
      rect(3, 3, 25, 19, 0xe7c8a4); rect(6, 6, 16, 1, ink); rect(6, 10, 12, 1, ink);
      rect(6, 17, 18, 1, ink); rect(23, 3, 5, 5, 0xf4e1bd); rect(25, 3, 3, 3, 0x000000);
    } else if (kind === 'island-ink') {
      rect(5, 14, 4, 3, cool); rect(8, 11, 7, 6, cool); rect(13, 8, 6, 7, cool);
      rect(18, 11, 5, 8, cool); rect(22, 16, 4, 4, cool); rect(8, 21, 18, 1, ink);
      rect(26, 5, 3, 1, gold); rect(28, 6, 1, 3, gold);
    } else if (kind === 'crowd-shadows') {
      for (let i = 0; i < 6; i++) {
        const top = 8 + (i % 3) * 2;
        rect(2 + i * 5, top, 3, 3, i % 2 ? ink : cool);
        rect(1 + i * 5, top + 3, 5, 9, i % 2 ? ink : cool);
      }
      rect(0, 23, 32, 2, ink);
    } else if (kind === 'buried-car') {
      // Car-scale snow slab plus one dark wheel/edge: no assembled figure.
      rect(1, 11, 30, 10, pale); rect(5, 7, 22, 6, pale); rect(1, 20, 30, 3, 0xd1dfe2);
      rect(23, 21, 6, 3, ink); rect(27, 16, 4, 2, cool);
    } else if (kind === 'crossed-branches') {
      for (let i = 0; i < 19; i++) {
        rect(5 + i, 3 + Math.floor(i * .8), 2, 2, ink);
        rect(23 - i, 3 + Math.floor(i * .8), 2, 2, i % 3 ? 0x735a43 : ink);
      }
      rect(3, 6, 6, 2, 0x735a43); rect(22, 7, 7, 2, ink); rect(8, 20, 5, 2, ink);
    } else if (kind === 'pale-round-thing') {
      rect(9, 7, 14, 16, 0xd3e1e3); rect(6, 11, 20, 9, pale); rect(10, 5, 12, 3, pale);
      rect(8, 21, 4, 2, 0xc3d3d7); rect(20, 20, 5, 3, 0xc3d3d7);
    } else {
      rect(7, 9, 18, 12, 0xe0d7c2); rect(11, 6, 10, 3, 0xe0d7c2); rect(14, 13, 3, 3, ink);
    }
    return;
  }

  if (restoredKind === 'clock') {
    rect(3, 3, 23, 20, 0xe2c6ae); rect(6, 5, 17, 16, 0xf0dfc0);
    rect(13, 7, 2, 7, ink); rect(13, 13, 6, 2, ink); rect(4, 13, 2, 2, gold);
  } else if (restoredKind === 'bench') {
    rect(0, 5, 29, 3, gold); rect(0, 10, 29, 3, gold); rect(2, 14, 26, 3, ink);
    rect(4, 17, 3, 6, ink); rect(23, 17, 3, 6, ink);
  } else if (restoredKind === 'car') {
    rect(0, 12, 30, 9, cool); rect(7, 5, 15, 8, cool); rect(9, 7, 11, 5, pale);
    rect(4, 21, 5, 4, ink); rect(22, 21, 5, 4, ink); rect(26, 14, 4, 2, gold);
  } else if (restoredKind === 'poster') {
    rect(0, 3, 30, 21, 0xe9b88e); rect(3, 6, 24, 1, ink); rect(3, 20, 24, 1, ink);
    rect(7, 11, 3, 5, ink); rect(12, 11, 3, 5, ink); rect(19, 11, 4, 5, ink);
  } else if (restoredKind === 'night') {
    rect(2, 8, 6, 16, 0x45445f); rect(12, 4, 7, 20, 0x60536f); rect(23, 12, 8, 12, 0x45445f);
    rect(4, 11, 2, 3, gold); rect(14, 7, 2, 3, gold); rect(23, 0, 6, 5, 0xe7d7af);
  } else if (restoredKind === 'venue') {
    for (let i = 0; i < 4; i++) rect(i * 3, 9 - i * 3, 32 - i * 6, 3, cool);
    rect(0, 10, 3, 14, cool); rect(29, 10, 3, 14, cool); rect(0, 24, 32, 3, ink);
    rect(9, 16, 3, 6, gold); rect(21, 16, 3, 6, gold);
  } else if (restoredKind === 'branches') {
    for (let i = 0; i < 17; i++) rect(4 + i, 5 + Math.floor(i * .7), 2, 2, ink);
    for (let i = 0; i < 17; i++) rect(25 - i, 5 + Math.floor(i * .7), 2, 2, 0x735a43);
  } else if (restoredKind === 'snowball') {
    rect(8, 8, 16, 15, pale); rect(5, 12, 22, 8, pale); rect(21, 4, 3, 2, gold); rect(25, 2, 2, 2, gold);
  } else if (restoredKind === 'snowman') {
    // Restored Snow context: the completed figure is finally allowed to appear.
    rect(8, 15, 15, 10, pale); rect(10, 7, 11, 10, pale); rect(13, 1, 8, 7, pale);
    rect(0, 12, 11, 2, 0x68745c); rect(20, 15, 9, 2, 0x68745c);
    rect(14, 3, 1, 1, ink); rect(18, 3, 1, 1, ink);
  } else {
    rect(7, 9, 18, 12, 0xe0d7c2); rect(11, 6, 10, 3, 0xe0d7c2); rect(14, 13, 3, 3, ink);
  }
}
