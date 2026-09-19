import type Phaser from 'phaser';
import { PALETTE } from './palette';
import { createPixelTexture } from './textureFactory';
import { pixelOval, softBox } from './styleProofShapes';
import { PARK_TREES, isGrassPlacement, isPointOnParkPath } from '../world/ParkComposition';

/** Autumn-local ramps: never recolor a shared texture or another region. */
export const AUTUMN = {
  ...PALETTE,
  grass: 0x899575, grassShade: 0x7e8c70, grassDeep: 0x586f61,
  grassLight: 0xb4bb8b, grassWarm: 0xa5a477, dryGrass: 0xc4b68d,
  pathShade: 0xad8a73, path: 0xcba582, pathLight: 0xe0c49e,
  soilDeep: 0x746755, stoneShade: 0x849388, stoneLight: 0xc3c3a2,
  waterDeep: 0x4b777d, water: 0x7ca9a1, waterShade: 0x63918e,
  waterLight: 0xa7c8b5, waterGlint: 0xdbe4c8,
  leafOrange: 0xd79668, leafGold: 0xe7bc7c,
} as const;

const CROWNS = [
  [0x805a62, 0xb7736e, 0xcf9280, 0xe7b39a],
  [0x956b59, 0xc48b62, 0xdda772, 0xf0cd91],
  [0x687563, 0x969568, 0xb9b07b, 0xd9cd96],
  [0x80565b, 0xac7062, 0xc98d70, 0xe3b28a],
] as const;

/** Same 64×76 footprint and trunk pixels as the existing tree collider. */
export function drawAutumnProofTree(g: Phaser.GameObjects.Graphics, variant: number): void {
  const [deep, mid, light, tip] = CROWNS[variant % CROWNS.length]!;
  g.fillStyle(0x584d4c).fillRect(28, 39, 10, 33).fillRect(24, 70, 20, 3);
  g.fillStyle(0x947360).fillRect(29, 45, 4, 26).fillRect(24, 48, 8, 4);
  g.fillStyle(0xc49b76).fillRect(29, 55, 2, 13);
  g.fillStyle(deep);
  pixelOval(g, 4, 10, 57, 46); pixelOval(g, 13, 2, 40, 39);
  const lobes = [[7, 17, 28, 29], [23, 8, 31, 34], [31, 26, 28, 24], [13, 30, 31, 25]];
  for (const [i, [x, y, w, h]] of lobes.entries()) {
    g.fillStyle(mid); pixelOval(g, x!, y!, w!, h!);
    g.fillStyle(light); pixelOval(g, x! + 2, y! + 1, w! - 7, h! - 10);
    g.fillStyle(tip); pixelOval(g, x! + 5, y! + 2, 10 + i % 2 * 3, 4);
  }
  // A few broken leaf tips, not a grid of identical confetti.
  g.fillStyle(light).fillRect(5, 31, 4, 3).fillRect(24, 5, 6, 2).fillRect(50, 23, 6, 3);
  g.fillStyle(deep).fillRect(28, 39, 7, 2).fillRect(44, 43, 5, 2).fillRect(15, 48, 4, 2);
}

export function drawAutumnProofBench(g: Phaser.GameObjects.Graphics, memory: boolean): void {
  const w = memory ? 60 : 56;
  g.fillStyle(0x49484b, 0.24); pixelOval(g, 2, 23, w - 4, memory ? 6 : 5);
  g.fillStyle(0x4c5955).fillRect(9, 8, 4, 19).fillRect(w - 13, 8, 4, 19);
  g.fillStyle(0x788779).fillRect(10, 10, 1, 16).fillRect(w - 12, 10, 1, 16);
  for (const [y, h] of [[3, 5], [9, 4], [16, 6]]) {
    g.fillStyle(0x674f4b); softBox(g, 5, y!, w - 10, h!, 1);
    g.fillStyle(0xaa7f62).fillRect(7, y!, w - 14, 2);
    g.fillStyle(0xd0ac7e).fillRect(9, y!, 13, 1).fillRect(w - 22, y!, 11, 1);
  }
  g.fillStyle(0x46544f).fillRect(3, 13, 7, 3).fillRect(w - 10, 13, 7, 3);
  if (memory) g.fillStyle(0xe8c58a).fillRect(27, 5, 2, 2).fillRect(31, 5, 2, 2).fillRect(29, 7, 2, 2);
}

export function createAutumnProofTextures(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'autumn-leaf-pile', 22, 10, g => {
    g.fillStyle(0x766c59, 0.35); pixelOval(g, 1, 5, 20, 5);
    for (const [x, y, c] of [[2, 5, 0xb88870], [8, 3, 0xd6b184], [14, 5, 0xc3937e]]) {
      g.fillStyle(c!); softBox(g, x!, y!, 6, 3, 1);
    }
  });
  CROWNS.forEach((_, i) => createPixelTexture(scene, `autumn-tree-${i}`, 64, 76, g => drawAutumnProofTree(g, i)));
  createPixelTexture(scene, 'autumn-memory-bench', 60, 30, g => drawAutumnProofBench(g, true));
  createPixelTexture(scene, 'autumn-bench', 56, 28, g => drawAutumnProofBench(g, false));
  for (let i = 0; i < 3; i++) createPixelTexture(scene, `autumn-shrub-${i}`, 28, 20, g => {
    g.fillStyle(0x546d5f); pixelOval(g, 1, 7, 26, 12);
    g.fillStyle([0x899776, 0xb78971, 0xad7a80][i]!);
    pixelOval(g, 2, 5, 15, 10); pixelOval(g, 12, 2, 14, 13);
    g.fillStyle([0xb2b78b, 0xd7b086, 0xd4a194][i]!);
    pixelOval(g, 5, 5, 8, 4); pixelOval(g, 16, 3, 7, 4);
    g.fillStyle(0xe4c998).fillRect(9, 10, 2, 2).fillRect(22, 9, 2, 2);
  });
}

export function drawAutumnMeadow(g: Phaser.GameObjects.Graphics): void {
  // Broad translucent drifts leave the walking surfaces quiet.
  for (const [i, [x, y]] of PARK_TREES.entries()) {
    g.fillStyle(i % 2 ? AUTUMN.grassWarm : AUTUMN.grassShade, 0.5);
    pixelOval(g, x - 38, y + 12, 91, 36);
    g.fillStyle(0x525f58, 0.16); pixelOval(g, x - 13, y + 23, 65, 16);
    for (let n = 0; n < 7; n++) {
      const lx = x - 24 + (n * 19 + i * 7) % 64, ly = y + 17 + (n * 7) % 23;
      if (!isGrassPlacement({ x: lx, y: ly })) continue;
      g.fillStyle([0xc29374, 0xd5b284, 0xa6816b][n % 3]!);
      g.fillRect(lx, ly, 3, 2).fillRect(lx + 2, ly - 1, 2, 1);
    }
  }
  for (let y = 165; y < 750; y += 29) for (let x = 24 + y % 53; x < 1260; x += 47) {
    if (!isGrassPlacement({ x, y }, 5)) continue;
    g.fillStyle(AUTUMN.grassLight, 0.55).fillRect(x, y, 3, 1).fillRect(x + 4, y - 2, 1, 3);
  }
}

export function drawAutumnDressing(g: Phaser.GameObjects.Graphics): void {
  // Interrupted gravel clusters preserve exactly the existing route footprint.
  for (let y = 175; y < 754; y += 23) for (let x = 20 + y % 31; x < 1270; x += 37) {
    if (!isPointOnParkPath({ x, y }, -10)) continue;
    g.fillStyle(AUTUMN.pathLight, 0.5).fillRect(x, y, 4, 1).fillRect(x + 8, y + 3, 2, 1);
  }
  // Authored banks and sitting-area borders; no new solid or interaction.
  for (const [x, y, w] of [[788, 199, 48], [969, 195, 59], [794, 333, 42], [988, 336, 49],
    [837, 398, 31], [938, 396, 38], [220, 430, 24], [278, 432, 25]] as const) {
    g.fillStyle(AUTUMN.grassDeep, 0.4); pixelOval(g, x, y, w, 13);
    for (let n = 0; n < 6; n++) {
      const fx = x + 3 + n * Math.floor((w - 6) / 6), fy = y + 3 + n % 3 * 2;
      g.fillStyle(0x597969).fillRect(fx, fy, 1, 6).fillRect(fx - 2, fy + 3, 3, 1);
      g.fillStyle(n % 2 ? 0xe6c692 : 0xd9aaa1); softBox(g, fx - 1, fy - 2, 3, 3, 1);
    }
  }
  // Lily pads stay entirely inside the existing water collider.
  for (const [x, y] of [[828, 236], [844, 242], [984, 311], [998, 304]]) {
    g.fillStyle(0x568879); pixelOval(g, x!, y!, 11, 5);
    g.fillStyle(0x9eb695).fillRect(x! + 2, y!, 5, 1);
  }
  g.fillStyle(0xf0d4b0, 0.12); pixelOval(g, 846, 388, 112, 28);
}
