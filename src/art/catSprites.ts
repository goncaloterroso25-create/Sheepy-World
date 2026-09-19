import type Phaser from 'phaser';
import { createPixelTexture } from './textureFactory';

export type CatName = 'tobias' | 'teemi' | 'chicho';
export type CatDirection = 'down' | 'up' | 'left' | 'right';
export type CatPose = 'idle' | 'walk' | 'sit' | 'sleep' | 'warning' | 'eat';
export const CAT_NAMES: readonly CatName[] = ['tobias', 'teemi', 'chicho'];
export const CAT_DIRECTIONS: readonly CatDirection[] = ['down', 'left', 'right', 'up'];
export const CAT_SIZE = 24;
export const CAT_FEET_Y = 23;
export const CAT_COLORS = {
  O: 0x302c34, D: 0x39363f, H: 0x504952, W: 0xf4edde, S: 0xd7cbbc,
  A: 0xdca359, a: 0xb97c48, P: 0xd58f89, p: 0xa96f70,
  E: 0xb0cf78, e: 0x7a9b50, I: 0x292932, L: 0xf7f1df,
  C: 0xd4c3ae, c: 0xb2a294, M: 0x70605c, m: 0x8e7b70, B: 0xb4cddd, b: 0x7b9eaf,
} as const;
type Ink = keyof typeof CAT_COLORS;
type Pixel = Ink | '.';

/** Hand-authored pixel clusters, never sampled or extracted from the reference bitmap. */
export function catPixels(cat: CatName, direction: CatDirection, pose: CatPose = 'idle', frame = 0): Pixel[][] {
  const pixels: Pixel[][] = Array.from({ length: CAT_SIZE }, () => Array<Pixel>(CAT_SIZE).fill('.'));
  const point = cat === 'chicho', coat: Ink = point ? 'C' : 'W', shade: Ink = point ? 'c' : 'S', dark: Ink = point ? 'M' : 'D';
  const r = (x: number, y: number, w: number, h: number, color: Ink): void => {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      if (xx >= 0 && xx < CAT_SIZE && yy >= 0 && yy < CAT_SIZE) pixels[yy]![xx] = color;
    }
  };
  const eye = (x: number, y: number, closed = false): void => {
    r(x, y, 3, closed ? 1 : 3, 'I');
    if (!closed) {
      r(x, y, 3, 2, point ? 'B' : 'E'); r(x, y + 2, 2, 1, point ? 'b' : 'e');
      r(x + 1, y + 1, 1, 2, 'I'); r(x, y, 1, 1, 'L');
    }
  };
  const side = direction === 'left' || direction === 'right';
  const stride = pose === 'walk' ? [0, -1, 0, 1][frame % 4]! : 0;
  if (pose === 'sleep') {
    r(5, 13, 13, 1, 'O'); r(3, 14, 17, 7, 'O'); r(2, 16, 20, 5, 'O'); r(4, 21, 17, 2, 'O');
    r(4, 15, 15, 5, coat); r(6, 14, 11, 1, coat); r(3, 17, 18, 3, shade);
    r(4, 15, 7, 5, point ? 'c' : 'D'); r(4, 17, 5, 3, point ? 'm' : 'H');
    if (cat === 'teemi') { r(5, 14, 6, 2, 'A'); r(4, 16, 3, 3, 'a'); r(9, 16, 3, 2, 'A'); }
    r(10, 13, 2, 4, dark); r(16, 14, 2, 4, dark); r(11, 14, 1, 2, 'p');
    r(10, 16, 8, 4, point ? 'M' : 'W'); r(11, 19, 6, 2, coat);
    if (cat === 'tobias') { r(10, 15, 3, 3, 'D'); r(15, 15, 3, 3, 'D'); r(13, 16, 2, 3, 'W'); }
    if (cat === 'teemi') { r(10, 15, 3, 3, 'A'); r(15, 15, 3, 3, 'D'); r(13, 15, 2, 4, 'D'); }
    r(11, 18, 2, 1, 'I'); r(16, 18, 2, 1, 'I'); r(14, 19, 1, 1, point ? 'O' : 'P');
    r(4, 20, 8, 2, dark); r(5, 22, 14, 1, dark); r(11, 21, 9, 2, dark); r(19, 19, 2, 3, dark);
    r(16, 20, 3, 1, coat); if (cat === 'teemi') r(6, 21, 4, 2, 'A');
    return pixels;
  }
  if (side) {
    // Left-facing anatomy; right-facing markings are authored separately below.
    r(20, 9, 3, 10, 'O'); r(21, 6, 2, 6, 'O'); r(20, 5, 2, 3, 'O');
    r(21, 9, 1, 9, dark); r(22, 7, 1, 4, dark); r(20, 6, 2, 2, dark);
    if (cat === 'teemi') { r(21, 12, 2, 3, 'A'); r(21, 11, 1, 1, 'a'); }
    r(8, 12, 12, 8, 'O'); r(10, 11, 8, 1, 'O'); r(19, 14, 2, 5, 'O');
    r(8, 13, 11, 5, coat); r(10, 12, 8, 1, coat); r(10, 18, 8, 2, shade);
    r(10, 11, 6, 1, dark); r(9, 12, 9, 1, coat);
    if (cat === 'tobias') { r(12, 12, 6, 5, 'D'); r(14, 13, 6, 4, 'D'); r(14, 17, 4, 1, 'D'); r(13, 12, 4, 1, 'H'); }
    if (cat === 'teemi') {
      if (direction === 'left') {
        r(10, 12, 4, 4, 'A'); r(13, 12, 5, 5, 'D'); r(16, 15, 4, 4, 'A'); r(15, 15, 3, 2, 'D'); r(17, 13, 2, 2, 'a');
      } else {
        r(11, 12, 5, 5, 'D'); r(14, 12, 3, 3, 'A'); r(15, 15, 5, 4, 'A'); r(17, 14, 3, 3, 'D'); r(11, 16, 2, 2, 'A');
      }
    }
    if (point) { r(12, 12, 6, 5, 'c'); r(15, 13, 4, 3, 'm'); r(12, 13, 2, 3, 'C'); }
    // Four feet alternate in pairs; the baseline never bobs with the face.
    for (const [x, shift, far] of [[8, stride, false], [11, -stride, true], [17, -stride, false], [19, stride, true]] as const) {
      r(x + shift, 18, 2, far ? 4 : 5, 'O'); r(x + shift, 18, 1, 3, far ? shade : coat);
      r(x - 1 + shift, far ? 21 : 22, 3, 1, point ? 'M' : far ? 'S' : 'W');
      if (point) r(x + shift, 20, 2, far ? 2 : 3, 'M');
    }
    r(3, 4, 2, 5, 'O'); r(8, 3, 2, 6, 'O'); r(4, 6, 6, 7, 'O'); r(2, 9, 8, 4, 'O'); r(3, 13, 6, 2, 'O');
    r(4, 5, 1, 3, dark); r(8, 4, 1, 4, dark); r(8, 5, 1, 2, 'P');
    r(3, 8, 7, 4, point ? 'M' : 'D'); r(4, 7, 5, 1, point ? 'm' : 'H');
    r(3, 12, 6, 2, point ? 'm' : 'W'); r(6, 14, 4, 4, coat); r(7, 13, 3, 2, coat);
    if (cat === 'tobias') { r(3, 8, 1, 3, 'W'); r(4, 7, 1, 1, 'W'); r(3, 13, 2, 1, 'D'); }
    if (cat === 'teemi') {
      r(4, 8, direction === 'left' ? 3 : 2, 3, 'A'); r(3, 10, 1, 2, 'W'); r(3, 8, 1, 2, 'D');
      if (direction === 'right') r(8, 8, 2, 3, 'D');
    }
    eye(4, 9, pose === 'eat' || pose === 'warning'); r(2, 12, 1, 1, point ? 'O' : 'P');
    if (pose === 'eat') { r(2, 13, 2, 1, 'O'); r(3, 13, 1, 1, 'P'); }
    if (direction === 'right') return pixels.map(row => row.slice().reverse());
    return pixels;
  }
  // Rounded chest, separated forepaws, and a low curled tail.
  r(8, 12, 8, 10, 'O'); r(6, 16, 12, 5, 'O'); r(7, 21, 10, 2, 'O');
  r(8, 13, 8, 8, coat); r(7, 16, 10, 5, coat); r(7, 19, 2, 2, shade); r(15, 18, 2, 3, shade);
  r(17, 19, 5, 3, 'O'); r(19, 18, 2, 4, dark); r(16, 20, 5, 2, dark); r(17, 19, 3, 1, point ? 'm' : 'H');
  if (cat === 'teemi') { r(19, 19, 2, 2, 'A'); r(17, 20, 2, 1, 'a'); }
  r(8, 14, 2, 4, point ? 'c' : 'D'); r(14, 14, 2, 4, point ? 'c' : 'D');
  if (cat === 'teemi') { r(8, 14, 2, 2, 'A'); r(14, 16, 2, 2, 'A'); }
  if (pose === 'sit') { r(7, 18, 3, 3, coat); r(14, 18, 3, 3, coat); }
  for (const [x, lift] of [[9, stride < 0 ? 1 : 0], [13, stride > 0 ? 1 : 0]] as const) {
    r(x, 18, 2, 4 - lift, point ? 'm' : 'W'); r(x - 1, 22 - lift, 3, 1, point ? 'M' : 'W');
    if (point) r(x, 20, 2, 2 - lift, 'M');
  }
  r(11, 19, 1, 4, shade);
  if (direction === 'up') {
    r(8, 13, 8, 7, dark); r(9, 12, 6, 1, coat); r(8, 13, 1, 3, coat); r(15, 13, 1, 4, coat);
    if (cat === 'teemi') { r(8, 13, 4, 3, 'A'); r(12, 16, 4, 3, 'A'); r(10, 15, 3, 2, 'D'); }
    if (point) { r(8, 13, 8, 7, 'c'); r(10, 15, 4, 4, 'm'); }
  }
  // Ear tips frame the face, with soft cheek steps rather than a square mask.
  r(6, 2, 2, 5, 'O'); r(16, 2, 2, 5, 'O'); r(7, 3, 2, 4, dark); r(15, 3, 2, 4, dark);
  r(8, 5, 8, 1, 'O'); r(6, 6, 12, 5, 'O'); r(5, 8, 14, 2, 'O'); r(7, 11, 10, 2, 'O'); r(9, 13, 6, 1, 'O');
  r(7, 6, 10, 6, point ? 'm' : 'D'); r(6, 8, 12, 3, dark);
  r(7, 11, 10, 2, dark); r(8, 13, 8, 1, 'O'); r(10, 14, 4, 1, coat);
  r(7, 4, 1, 2, 'P'); r(16, 4, 1, 2, 'P'); r(8, 6, 8, 1, point ? 'C' : 'H');
  if (direction === 'up') {
    r(7, 7, 10, 4, point ? 'c' : 'D'); r(8, 11, 8, 2, coat); r(10, 12, 4, 1, dark);
    if (cat === 'teemi') { r(10, 6, 4, 2, 'A'); r(8, 8, 3, 2, 'A'); r(14, 8, 3, 2, 'A'); r(7, 9, 2, 2, 'A'); r(16, 9, 1, 2, 'A'); }
    if (point) r(9, 7, 6, 4, 'm');
    return pixels;
  }
  if (cat === 'tobias') {
    r(11, 6, 2, 2, 'W'); r(10, 8, 4, 4, 'W'); r(8, 12, 8, 2, 'W'); r(10, 14, 4, 1, 'W'); r(11, 14, 2, 1, 'D');
  } else if (cat === 'teemi') {
    r(8, 7, 3, 4, 'A'); r(13, 7, 3, 4, 'A'); r(10, 6, 4, 1, 'A');
    r(10, 8, 4, 4, 'W'); r(11, 7, 2, 5, 'D'); r(8, 12, 8, 2, 'W'); r(10, 14, 4, 1, 'W'); r(11, 14, 2, 1, 'O');
  } else {
    r(7, 8, 10, 4, 'M'); r(8, 12, 8, 2, 'M'); r(10, 14, 4, 1, 'm'); r(11, 7, 2, 1, 'c');
  }
  eye(7, 9, pose === 'warning'); eye(14, 9, pose === 'warning');
  r(11, 12, 2, 1, point ? 'O' : 'P'); r(11, 13, 1, 1, point ? 'O' : 'p');
  return pixels;
}

export function drawCatSprite(g: Phaser.GameObjects.Graphics, cat: CatName, direction: CatDirection, pose: CatPose = 'idle', frame = 0): void {
  catPixels(cat, direction, pose, frame).forEach((row, y) => row.forEach((ink, x) => {
    if (ink !== '.') g.fillStyle(CAT_COLORS[ink]).fillRect(x, y, 1, 1);
  }));
}
export const catTexture = (cat: CatName, direction: CatDirection, pose: CatPose, frame = 0): string => `cat-${cat}-${direction}-${pose}-${frame}`;

export function createCatTextures(scene: Phaser.Scene): void {
  for (const cat of CAT_NAMES) {
    for (const direction of CAT_DIRECTIONS) {
      for (const pose of ['idle', 'walk', 'sit', 'sleep', 'warning', 'eat'] as const) {
        for (let frame = 0; frame < (pose === 'walk' ? 4 : 1); frame++) {
          createPixelTexture(scene, catTexture(cat, direction, pose, frame), 24, 24, g => drawCatSprite(g, cat, direction, pose, frame));
        }
      }
      const key = `cat-${cat}-walk-${direction}`;
      if (!scene.anims.exists(key)) scene.anims.create({ key, frames: [0, 1, 2, 3].map(frame => ({ key: catTexture(cat, direction, 'walk', frame) })), frameRate: 7, repeat: -1 });
    }
    // Existing scene/tableau texture IDs remain valid and use the same approved art.
    for (const [alias, direction, pose, frame] of [
      ['front', 'down', 'idle', 0], ['back', 'up', 'idle', 0], ['side', 'left', 'idle', 0],
      ['idle', 'down', 'idle', 0], ['idle-tail', 'left', 'walk', 1], ['sit', 'down', 'sit', 0],
      ['sleep', 'down', 'sleep', 0], ['annoyed', 'down', 'warning', 0],
    ] as const) createPixelTexture(scene, `cat-${cat}-${alias}`, 24, 24, g => drawCatSprite(g, cat, direction, pose, frame));
  }
  createPixelTexture(scene, 'cat-tobias-shoulder', 10, 10, g => {
    g.fillStyle(CAT_COLORS.D).fillRect(1, 3, 7, 6).fillRect(0, 1, 2, 4).fillRect(7, 1, 2, 4).fillRect(0, 8, 4, 2);
    g.fillStyle(CAT_COLORS.W).fillRect(4, 3, 2, 4).fillRect(3, 6, 5, 3);
    g.fillStyle(CAT_COLORS.E).fillRect(2, 5, 1, 1).fillRect(7, 5, 1, 1);
    g.fillStyle(CAT_COLORS.P).fillRect(5, 6, 1, 1); g.fillStyle(CAT_COLORS.D).fillRect(5, 8, 1, 1);
  });
  createPixelTexture(scene, 'cat-chicho-shoulder', 12, 12, g => {
    g.fillStyle(CAT_COLORS.C).fillRect(2, 4, 8, 7); g.fillStyle(CAT_COLORS.M).fillRect(1, 1, 3, 5).fillRect(8, 1, 3, 5).fillRect(3, 5, 6, 4);
    g.fillStyle(CAT_COLORS.B).fillRect(3, 6, 1, 1).fillRect(8, 6, 1, 1); g.fillStyle(CAT_COLORS.O).fillRect(6, 8, 1, 1);
  });
}
