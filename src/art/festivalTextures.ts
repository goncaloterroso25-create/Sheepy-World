import type Phaser from 'phaser';
import { PALETTE as P } from './palette';
import { createPixelTexture } from './textureFactory';
import { expeditionStyle } from './expeditionStyle';

export interface ExpeditionLook {
  id: 'hange' | 'eren' | 'mikasa' | 'armin';
  skin: number;
  hair: number;
  coat: number;
  accent: number;
  hairShape: 'ponytail' | 'crop' | 'bob' | 'parted';
  glasses?: boolean;
  stance?: 'energetic';
}

export const EXPEDITION_LOOKS: readonly ExpeditionLook[] = [
  { id: 'hange', skin: 0xd6a37f, hair: 0x3f2b25, coat: 0x4e6248, accent: 0x9a7550,
    hairShape: 'ponytail', glasses: true, stance: 'energetic' },
  { id: 'eren', skin: 0xd1a17d, hair: 0x3c2d2b, coat: 0x59664e, accent: 0xb99567, hairShape: 'crop' },
  { id: 'mikasa', skin: 0xe1b08d, hair: 0x252532, coat: 0x4b5054, accent: 0x914b51, hairShape: 'bob' },
  { id: 'armin', skin: 0xe7bb91, hair: 0xc9a66a, coat: 0x6a7560, accent: 0xc6baa3, hairShape: 'parted' },
];

function expeditionPortrait(g: Phaser.GameObjects.Graphics, look: ExpeditionLook): void {
  g.fillStyle(0x282536).fillRect(0, 0, 64, 72);
  g.fillStyle(0x3f3945).fillRect(3, 3, 58, 66);
  g.fillStyle(look.coat).fillRect(7, 53, 50, 19).fillRect(2, 64, 60, 8);
  g.fillStyle(look.accent).fillRect(27, 53, 11, 19);
  g.fillStyle(look.skin).fillRect(20, 17, 25, 35).fillRect(27, 50, 12, 8);
  g.fillStyle(look.hair).fillRect(17, 10, 31, 12);
  if (look.hairShape === 'ponytail') g.fillRect(43, 17, 9, 38).fillRect(49, 31, 7, 28);
  if (look.hairShape === 'bob') g.fillRect(14, 18, 8, 35).fillRect(43, 18, 8, 35);
  if (look.hairShape === 'crop') g.fillRect(16, 17, 7, 17).fillRect(43, 17, 6, 13);
  if (look.hairShape === 'parted') g.fillRect(15, 17, 8, 25).fillRect(42, 17, 7, 24);
  g.fillStyle(0xf2c5a2, .45).fillRect(23, 21, 4, 21);
  g.fillStyle(0x302936).fillRect(25, 32, 4, 2).fillRect(37, 32, 4, 2).fillRect(32, 43, 6, 2);
  if (look.glasses) {
    g.lineStyle(2, 0xeadbb9).strokeRect(21, 27, 12, 10).strokeRect(35, 27, 12, 10).lineBetween(33, 31, 35, 31);
    g.fillStyle(0x5b4234).fillRect(23, 29, 8, 1).fillRect(37, 29, 8, 1);
  }
  if (look.id === 'mikasa') g.fillStyle(look.accent).fillRect(16, 51, 34, 7).fillRect(39, 56, 9, 16);
  if (look.id === 'hange') {
    g.fillStyle(look.hair).fillRect(45, 12, 10, 12).fillRect(50, 20, 9, 28)
      .fillRect(14, 21, 4, 24).fillRect(17, 42, 3, 11);
    g.fillStyle(0xb89b76).fillRect(48, 19, 5, 4);
    g.fillStyle(0xe2d5b9).fillRect(48, 53, 5, 16).fillRect(45, 51, 11, 4);
  }
}

function daenerysSprite(g: Phaser.GameObjects.Graphics): void {
  // An original pale, braided silhouette with a cool-blue travelling dress.
  g.fillStyle(0x272735).fillRect(6, 40, 6, 4).fillRect(19, 40, 6, 4);
  g.fillStyle(0x214c69).fillRect(8, 28, 5, 13).fillRect(18, 28, 5, 13);
  g.fillStyle(0x2d7296).fillRect(5, 19, 21, 17).fillRect(3, 32, 25, 8);
  g.fillStyle(0x75a5b5).fillRect(8, 20, 3, 15).fillRect(20, 20, 3, 15);
  g.fillStyle(0xd8b69d).fillRect(1, 22, 4, 9).fillRect(26, 22, 4, 9);
  g.fillStyle(0xebc6aa).fillRect(10, 7, 11, 11);
  g.fillStyle(0xf1ead9).fillRect(8, 3, 15, 6).fillRect(7, 7, 4, 18).fillRect(20, 7, 4, 18);
  g.fillStyle(0xd9c8ab).fillRect(7, 12, 3, 15).fillRect(21, 11, 3, 16)
    .fillRect(10, 2, 4, 3).fillRect(19, 4, 5, 3);
  // Two compact braids read as a deliberate blonde hair shape, not a pale hood.
  for (const [x, y] of [[7, 17], [8, 21], [9, 25], [21, 17], [20, 21], [19, 25]] as const)
    g.fillStyle(0xeadfc8).fillRect(x, y, 3, 3);
  g.fillStyle(0x5d5060).fillRect(12, 11, 1, 1).fillRect(18, 11, 1, 1);
  g.fillStyle(0x9a5e5e).fillRect(15, 15, 3, 1);
  g.fillStyle(0xd7b465).fillRect(14, 20, 3, 15).fillRect(7, 34, 17, 2);
}

function shoulderDragon(g: Phaser.GameObjects.Graphics): void {
  // Pale-gold perched profile: curled tail, raised folded wing, long neck,
  // horned head and projecting snout are all separated in the silhouette.
  g.fillStyle(0x5c4933)
    .fillRect(5, 8, 11, 6).fillRect(13, 5, 5, 8)
    .fillRect(16, 2, 5, 6).fillRect(20, 4, 2, 4)
    .fillRect(2, 10, 5, 3).fillRect(0, 8, 3, 3)
    .fillRect(7, 13, 3, 3).fillRect(14, 13, 3, 3)
    .fillTriangle(7, 10, 10, 2, 15, 11)
    .fillTriangle(16, 3, 17, 0, 19, 3).fillTriangle(19, 3, 21, 1, 21, 5);
  g.fillStyle(0xd6bd72)
    .fillRect(6, 9, 9, 4).fillRect(14, 6, 3, 6)
    .fillRect(17, 3, 4, 4).fillRect(20, 5, 2, 2)
    .fillRect(3, 10, 4, 2).fillRect(1, 9, 2, 1)
    .fillRect(8, 13, 2, 2).fillRect(15, 13, 2, 2);
  g.fillStyle(0xb87648).fillTriangle(8, 10, 10, 4, 14, 11);
  g.fillStyle(0xf3e5ac).fillRect(8, 8, 6, 2).fillRect(15, 6, 2, 3).fillRect(18, 3, 2, 1);
  g.fillStyle(0x3d3026).fillRect(19, 4, 1, 1);
}

function mediumDragon(g: Phaser.GameObjects.Graphics): void {
  // Deep-green ground companion, facing left. The bronze membrane sits inside
  // a tall folded wing while the tail climbs clear of the back edge.
  g.fillStyle(0x142a27)
    .fillRect(2, 8, 9, 8).fillRect(0, 11, 6, 6)
    .fillRect(8, 10, 8, 12).fillRect(13, 16, 20, 8)
    .fillRect(30, 15, 7, 7).fillRect(35, 12, 5, 6).fillRect(39, 8, 3, 6)
    .fillRect(17, 22, 5, 6).fillRect(28, 22, 5, 6)
    .fillTriangle(14, 18, 20, 2, 29, 20).fillTriangle(22, 18, 31, 5, 34, 21)
    .fillTriangle(4, 9, 6, 3, 9, 10).fillTriangle(8, 8, 11, 2, 12, 11);
  g.fillStyle(0x315847)
    .fillRect(3, 9, 7, 6).fillRect(1, 12, 5, 4)
    .fillRect(9, 11, 6, 10).fillRect(14, 17, 18, 6)
    .fillRect(31, 16, 6, 5).fillRect(36, 13, 4, 4).fillRect(40, 9, 2, 4)
    .fillRect(18, 23, 4, 4).fillRect(29, 23, 4, 4);
  g.fillStyle(0x9a713f).fillTriangle(15, 18, 20, 4, 27, 19).fillTriangle(23, 18, 30, 7, 32, 20);
  g.fillStyle(0x5f8058).fillRect(10, 11, 3, 8).fillRect(15, 17, 15, 2)
    .fillRect(32, 15, 4, 2).fillRect(37, 12, 3, 2);
  g.fillStyle(0xb48a4e).fillRect(2, 11, 2, 1).fillRect(6, 6, 1, 3).fillRect(10, 5, 1, 3);
  g.fillStyle(0xe2c15f).fillRect(4, 11, 1, 1);
  g.fillStyle(0x142a27).fillRect(0, 15, 3, 1).fillRect(19, 27, 5, 1).fillRect(30, 27, 5, 1);
}

function largeDragon(g: Phaser.GameObjects.Graphics): void {
  // Charcoal major silhouette, facing right. Two folded wing peaks, a broken
  // neck line, heavy feet and a hooked tail keep it readable before colour.
  g.fillStyle(0x101419)
    .fillRect(18, 24, 36, 12).fillRect(46, 17, 11, 17)
    .fillRect(53, 9, 11, 11).fillRect(61, 13, 7, 8).fillRect(56, 19, 9, 4)
    .fillRect(25, 34, 8, 8).fillRect(43, 33, 9, 9)
    .fillRect(10, 25, 11, 8).fillRect(4, 21, 9, 7).fillRect(0, 16, 7, 7)
    .fillTriangle(20, 27, 29, 2, 43, 29).fillTriangle(33, 27, 47, 5, 53, 30)
    .fillTriangle(54, 10, 56, 3, 59, 10).fillTriangle(59, 10, 63, 1, 64, 12)
    .fillTriangle(50, 18, 48, 10, 55, 15);
  g.fillStyle(0x252b31)
    .fillRect(19, 25, 34, 10).fillRect(47, 18, 9, 15)
    .fillRect(54, 10, 10, 9).fillRect(62, 14, 6, 6).fillRect(57, 19, 7, 3)
    .fillRect(26, 35, 7, 6).fillRect(44, 34, 8, 7)
    .fillRect(11, 26, 10, 6).fillRect(5, 22, 8, 5).fillRect(1, 17, 6, 5);
  g.fillStyle(0x652f39).fillTriangle(21, 27, 29, 4, 41, 28)
    .fillTriangle(35, 27, 47, 7, 51, 29);
  g.fillStyle(0x963d45).fillTriangle(25, 25, 29, 9, 37, 26)
    .fillTriangle(39, 25, 47, 12, 49, 27);
  g.fillStyle(0x4e5559).fillRect(20, 24, 27, 3).fillRect(48, 18, 4, 9)
    .fillRect(55, 10, 7, 2).fillRect(62, 14, 5, 2).fillRect(6, 21, 7, 2);
  g.fillStyle(0x9b7a62).fillRect(56, 7, 2, 4).fillRect(61, 6, 2, 5)
    .fillRect(27, 40, 9, 2).fillRect(45, 40, 10, 2);
  g.fillStyle(0xd68b52).fillRect(60, 12, 2, 2);
  g.fillStyle(0x101419).fillRect(64, 18, 4, 2).fillRect(0, 16, 3, 2);
}

/** Original silhouettes; no official sprites, logo, cover or frame is ingested. */
export function createFestivalTextures(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'festival-daenerys', 30, 44, daenerysSprite);
  createPixelTexture(scene, 'festival-dragon-shoulder', 22, 16, shoulderDragon);
  createPixelTexture(scene, 'festival-dragon-medium', 42, 28, mediumDragon);
  createPixelTexture(scene, 'festival-dragon-large', 68, 42, largeDragon);
  createPixelTexture(scene, 'npc-trench-coat', 24, 36, g => {
    g.fillStyle(P.shadowDeep).fillRect(6, 32, 5, 3).fillRect(14, 32, 5, 3);
    g.fillStyle(P.denimDeep).fillRect(7, 23, 4, 10).fillRect(14, 23, 4, 10);
    g.fillStyle(P.paperShadow).fillRect(4, 12, 17, 17);
    g.fillStyle(P.plaster).fillRect(5, 12, 14, 17);
    g.fillStyle(P.creamLight).fillRect(10, 11, 5, 11);
    g.fillStyle(P.festivalBlue).fillRect(12, 14, 2, 8).fillRect(13, 20, 2, 3);
    g.fillStyle(P.paperShade).fillRect(7, 13, 3, 12).fillRect(15, 13, 3, 12);
    g.fillStyle(P.skin).fillRect(8, 4, 10, 8).fillRect(3, 23, 3, 4).fillRect(19, 23, 3, 4);
    g.fillStyle(P.jetHair).fillRect(7, 2, 12, 4).fillRect(7, 5, 2, 4).fillRect(17, 5, 2, 4);
    g.fillStyle(P.jetHairLight).fillRect(10, 1, 7, 2);
    g.fillStyle(P.coolEye).fillRect(10, 7, 1, 1).fillRect(15, 7, 1, 1);
    g.fillStyle(P.skinShade).fillRect(12, 10, 3, 1);
  });
  createPixelTexture(scene, 'classic-black-car', 120, 44, g => {
    g.fillStyle(P.shadowDeep).fillRect(3, 34, 114, 4);
    g.fillStyle(P.jetHair).fillRect(15, 30, 16, 12).fillRect(89, 30, 16, 12);
    g.fillStyle(P.stoneShade).fillRect(19, 33, 8, 7).fillRect(93, 33, 8, 7);
    g.fillStyle(P.jetHair).fillRect(2, 19, 116, 15).fillRect(34, 6, 52, 17).fillRect(29, 12, 63, 11);
    g.fillStyle(P.jetHairLight).fillRect(3, 20, 112, 5).fillRect(36, 6, 48, 3);
    g.fillStyle(P.waterDeep).fillRect(35, 11, 21, 10).fillRect(60, 11, 25, 10);
    g.fillStyle(P.waterLight).fillRect(38, 11, 15, 2).fillRect(62, 11, 18, 2);
    g.fillStyle(P.stoneLight).fillRect(2, 29, 115, 2).fillRect(2, 21, 10, 4).fillRect(54, 25, 6, 1);
    g.fillStyle(P.plasterLight).fillRect(106, 22, 9, 4).fillRect(111, 31, 5, 3);
    g.fillStyle(P.leafRedDeep).fillRect(3, 25, 4, 3);
  });
  createPixelTexture(scene, 'npc-goblet-adviser', 24, 27, g => {
    g.fillStyle(P.shadowDeep).fillRect(5, 24, 6, 3).fillRect(14, 24, 6, 3);
    g.fillStyle(P.plumDeep).fillRect(5, 10, 15, 15);
    g.fillStyle(P.leafRedDeep).fillRect(7, 10, 11, 12);
    g.fillStyle(P.leafGold).fillRect(11, 12, 2, 9).fillRect(5, 20, 14, 2);
    g.fillStyle(P.skin).fillRect(7, 3, 11, 8).fillRect(2, 14, 4, 5);
    g.fillStyle(P.brownHair).fillRect(6, 1, 13, 4).fillRect(5, 4, 3, 6).fillRect(17, 4, 3, 6);
    g.fillStyle(P.shadowDeep).fillRect(9, 6, 1, 1).fillRect(15, 6, 1, 1);
    g.fillStyle(P.leafGold).fillRect(19, 13, 5, 5).fillRect(21, 18, 1, 4).fillRect(19, 22, 5, 1);
    g.fillStyle(P.plum).fillRect(20, 13, 3, 1);
  });
  createPixelTexture(scene, 'item-war-horn', 16, 16, g => {
    g.fillStyle(P.woodDeep).fillRect(1, 2, 4, 8).fillRect(4, 7, 4, 6).fillRect(7, 10, 7, 4);
    g.fillStyle(P.paperShade).fillRect(2, 3, 2, 6).fillRect(5, 7, 2, 5).fillRect(7, 11, 6, 2);
    g.fillStyle(P.leafGold).fillRect(0, 1, 6, 2).fillRect(12, 9, 3, 6);
  });
  createPixelTexture(scene, 'item-bird-arrow-pin', 16, 16, g => {
    g.fillStyle(P.paperShadow).fillRect(2, 2, 12, 1).fillRect(2, 13, 12, 1).fillRect(1, 3, 1, 10).fillRect(14, 3, 1, 10);
    g.fillStyle(P.leafGold).fillRect(6, 6, 5, 5).fillRect(9, 4, 3, 3).fillRect(12, 5, 3, 1);
    g.fillRect(3, 4, 2, 6).fillRect(2, 3, 2, 3).fillRect(5, 8, 3, 5).fillRect(10, 10, 4, 1);
    g.fillStyle(P.cream).fillRect(3, 11, 10, 1).fillRect(12, 10, 2, 3);
  });
  for (const look of EXPEDITION_LOOKS) {
    createPixelTexture(scene, `festival-${look.id}`, 24, 36, g => expeditionStyle(g, look));
    createPixelTexture(scene, `portrait-${look.id}`, 64, 72, g => expeditionPortrait(g, look));
  }
}
