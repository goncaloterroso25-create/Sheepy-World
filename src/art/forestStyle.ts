import type Phaser from 'phaser';
import { pixelOval, softBox } from './styleProofShapes';
import { FOREST_PATHS, FOREST_TREES, FOREST_WATER } from '../world/regions/ExpansionLayout';

export const FOREST = {
  floor: 0x526e60, moss: 0x728369, shade: 0x3e5c54, light: 0xa5b389,
  pathEdge: 0x667667, path: 0x9a9b7b, pathLight: 0xb8b695,
  waterDeep: 0x355d66, water: 0x679b98, waterLight: 0xb1d1bb,
  bark: 0x62534e, barkLight: 0x9a7e62,
} as const;

/** Three genuinely different masks: spreading oak, tall column, leaning fork.
 * All keep the existing 104×132 image and root/collider anchor. */
export const FOREST_CROWNS = [
  [[4, 31, 60, 51], [30, 12, 64, 62], [47, 48, 54, 47], [15, 65, 58, 33]],
  [[26, 3, 51, 49], [18, 32, 65, 51], [24, 64, 59, 37]],
  [[8, 13, 52, 43], [29, 35, 60, 51], [49, 57, 54, 39]],
] as const;

export function forestTree(g: Phaser.GameObjects.Graphics, variant: number): void {
  const crowns = FOREST_CROWNS[variant % 3]!;
  g.fillStyle(0x2d4642, 0.3); pixelOval(g, 23, 117, 65, 13);
  g.fillStyle(0x403f40).fillRect(45, 56, 14, 68).fillRect(37, 121, 31, 6);
  g.fillStyle(FOREST.bark).fillRect(47, 64, 8, 59).fillRect(35, 83, 15, 6).fillRect(54, 72, 15, 6);
  g.fillStyle(FOREST.barkLight).fillRect(48, 83, 3, 32).fillRect(40, 121, 9, 3);
  const colors = [[0x365a52, 0x56816a, 0x79977a, 0xa6b38a],
    [0x3b5b54, 0x668773, 0x8ea084, 0xb6c19b], [0x384f4e, 0x507664, 0x799275, 0xa7ad80]][variant % 3]!;
  for (const [i, [x, y, w, h]] of crowns.entries()) {
    g.fillStyle(colors[0]!); pixelOval(g, x, y, w, h);
    g.fillStyle(colors[1]!); pixelOval(g, x + 3, y + 1, w - 8, h - 9);
    g.fillStyle(colors[2]!); pixelOval(g, x + 6, y + 2, w - 17, Math.floor(h / 2));
    g.fillStyle(colors[3]!); pixelOval(g, x + 12, y + 4, 16 + i * 2, 5);
    g.fillStyle(colors[0]!).fillRect(x + Math.floor(w / 2), y + h - 12, 9, 2);
  }
  g.fillStyle(FOREST.moss); pixelOval(g, 37, 118, 14, 6); pixelOval(g, 58, 122, 12, 4);
}

export function forestFern(g: Phaser.GameObjects.Graphics, x = 0, y = 0): void {
  g.fillStyle(FOREST.shade); pixelOval(g, x, y + 16, 30, 6);
  g.fillStyle(0x9bad82).fillRect(x + 14, y + 5, 1, 15);
  for (let i = 0; i < 4; i++) {
    const reach = 3 + i * 3;
    g.fillStyle(i % 2 ? 0x799a77 : 0x62866c);
    g.fillRect(x + 14 - reach, y + 5 + i * 3, reach, 2).fillRect(x + 15, y + 5 + i * 3, reach, 2);
    g.fillStyle(0xa5b98b).fillRect(x + 14 - reach, y + 4 + i * 3, 3, 1);
  }
}

export function forestBush(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(FOREST.shade); pixelOval(g, 1, 15, 36, 8);
  for (const [x, y, w, h] of [[2, 10, 20, 12], [12, 3, 19, 18], [24, 9, 13, 13]]) {
    g.fillStyle(0x4c705c); pixelOval(g, x!, y!, w!, h!);
    g.fillStyle(0x859b76); pixelOval(g, x! + 2, y! + 1, w! - 6, 5);
  }
  g.fillStyle(0xc9bc9b).fillRect(13, 8, 2, 2).fillRect(27, 13, 2, 2);
}

export function forestMotes(scene: Phaser.Scene): void {
  for (const [i, [x, y]] of [[560, 1964], [810, 2075], [600, 1680], [905, 1630],
    [470, 1868], [1130, 1550], [505, 2040], [1175, 2190]].entries()) {
    const mote = scene.add.graphics().setPosition(x!, y!).setDepth(y! + 8);
    mote.fillStyle(0xe5d7a3, 0.65).fillRect(0, 0, 2, 2);
    scene.tweens.add({ targets: mote, y: y! - 7, alpha: 0.25, duration: 2600 + i * 173,
      yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [7] });
  }
}

export function forestGround(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(FOREST.floor).fillRect(0, 1408, 1408, 896);
  for (const [i, p] of FOREST_TREES.entries()) {
    g.fillStyle(i % 2 ? FOREST.moss : FOREST.shade, 0.4);
    pixelOval(g, p.x - 46, p.y - 7, 114, 36);
  }
  FOREST_PATHS.forEach(r => {
    g.fillStyle(FOREST.pathEdge); softBox(g, r.x - 4, r.y - 4, r.width + 8, r.height + 8, 6);
  });
  FOREST_PATHS.forEach(r => { g.fillStyle(FOREST.path); softBox(g, r.x, r.y, r.width, r.height, 5); });
  for (let i = 0; i < 700; i++) {
    const x = (i * 173) % 1408, y = 1410 + (i * 97) % 890;
    const path = FOREST_PATHS.some(r => x > r.x && x < r.x + r.width && y > r.y && y < r.y + r.height);
    g.fillStyle(path ? FOREST.pathLight : FOREST.moss, 0.65).fillRect(x, y, 3 + i % 4, 1);
    if (!path && i % 7 === 0) forestFern(g, x, y);
  }
  for (const r of FOREST_WATER) {
    g.fillStyle(FOREST.waterDeep).fillRect(r.x, r.y, r.width, r.height);
    g.fillStyle(FOREST.water).fillRect(r.x, r.y + 8, r.width, r.height - 16);
    for (let x = r.x + 8; x < r.x + r.width - 25; x += 41) {
      // Bank lobes project out from the real blocked edge, never across the bridge.
      g.fillStyle(FOREST.shade); pixelOval(g, x, r.y - 7, 24, 12);
      g.fillStyle(FOREST.moss); pixelOval(g, x + 8, r.y + r.height - 5, 17, 10);
      g.fillStyle(FOREST.waterLight, 0.65).fillRect(x + 6, r.y + 23 + x % 17, 15, 1);
    }
  }
  // Same 172px deck, same open crossing and water sides. Heavy end abutments
  // sit outside the lane; small plank joins communicate timber, not paving.
  g.fillStyle(0x30494a, 0.45).fillRect(618, 1738, 172, 91);
  g.fillStyle(0x5a514b).fillRect(618, 1720, 172, 115);
  for (let y = 1721; y < 1835; y += 8) {
    g.fillStyle(y % 3 ? 0xa58c6d : 0x957b61).fillRect(623, y, 162, 6);
    g.fillStyle(0xceba91).fillRect(625, y, 157, 1);
    g.fillStyle(0x79624f).fillRect(657 + y % 71, y + 2, 16, 1);
  }
  for (const x of [618, 785]) {
    g.fillStyle(0x50494a).fillRect(x, 1717, 5, 123);
    g.fillStyle(0xd0b488).fillRect(x, 1717, 2, 123);
    for (const y of [1717, 1770, 1832]) {
      g.fillStyle(0x5a665d); softBox(g, x - 3, y, 11, 7, 2);
      g.fillStyle(0xb4b394).fillRect(x - 2, y, 8, 2);
    }
  }
  // Existing open western branch end: a deliberately quiet future activity pocket.
  // No collider, marker, quest, transition or gameplay is added.
  g.fillStyle(FOREST.moss, 0.35); pixelOval(g, 450, 1995, 150, 55);
  for (const [x, y] of [[444, 1995], [462, 2060], [583, 2050]]) forestFern(g, x!, y!);
}
