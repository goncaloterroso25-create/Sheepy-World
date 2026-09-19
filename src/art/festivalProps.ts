import type Phaser from 'phaser';
import { PALETTE as P } from './palette';
import type { FESTIVAL_STALLS } from '../world/regions/FestivalLayout';
import { pixelOval, softBox } from './styleProofShapes';

export function festivalStall(scene: Phaser.Scene, stall: typeof FESTIVAL_STALLS[number]): void {
  const { x, y, width: w, height: h } = stall;
  const color = { red: 0xb87879, gold: 0xc3a268, blue: 0x718d96, purple: 0x927994, green: 0x7c9273 }[stall.color];
  const g = scene.add.graphics().setDepth(y + h);
  g.fillStyle(0x46464b, .28); pixelOval(g, x - 5, y + h - 10, w + 20, 22);
  g.fillStyle(0x67524e).fillRect(x, y - 10, 5, h + 12).fillRect(x + w - 5, y - 10, 5, h + 12);
  g.fillStyle(0xc2a07b).fillRect(x + 1, y - 10, 2, h + 10).fillRect(x + w - 4, y - 10, 2, h + 10);
  for (let row = 0; row < 4; row++) {
    const inset = (3 - row) * 4;
    g.fillStyle(color); softBox(g, x - 4 + inset, y - 29 + row * 7, w + 8 - inset * 2, 8, 2);
    for (let dx = 12; dx < w - 14; dx += 27)
      g.fillStyle(0xf1dfb8, .4).fillRect(x + dx, y - 29 + row * 7, 6, 7);
  }
  g.fillStyle(color).fillRect(x - 4, y - 2, w + 8, 10);
  for (let dx = 3; dx < w; dx += 20) {
    g.fillStyle(color); softBox(g, x + dx - 2, y + 5, 16, 7, 2);
    g.fillStyle(0xe3cda6).fillRect(x + dx, y + 8, 11, 1);
  }
  g.fillStyle(0x745b53).fillRect(x + 4, y + 27, w - 8, h - 28);
  g.fillStyle(0xb38b6a); softBox(g, x, y + 24, w, 9, 2);
  g.fillStyle(0xddbf91).fillRect(x + 2, y + 24, w - 4, 2);
  for (let dx = 10; dx < w - 8; dx += 22) {
    g.fillStyle(0x594d4c).fillRect(x + dx, y + 37, 1, h - 42);
    g.fillStyle(0x94715b).fillRect(x + dx + 3, y + 36, 16, 3);
  }
  if (stall.id === 'hydromel') {
    for (const dx of [18, 49, 84]) {
      g.fillStyle(P.paperShade).fillRect(x + dx, y + 11, 12, 15).fillRect(x + dx + 12, y + 14, 4, 8);
      g.fillStyle(P.leafGold).fillRect(x + dx + 2, y + 10, 8, 3);
    }
    // Red carved dragon sign: distinct from the quiet stone shrine deeper in the fair.
    g.fillStyle(P.woodDeep).fillRect(x + w - 26, y - 2, 33, 28);
    g.fillStyle(P.festivalRed).fillRect(x + w - 17, y + 9, 15, 5).fillRect(x + w - 6, y + 2, 8, 8)
      .fillRect(x + w - 18, y + 1, 3, 10).fillRect(x + w - 23, y - 2, 6, 7).fillRect(x + w - 21, y + 14, 5, 4);
  } else if (stall.id === 'alchemy') {
    // Fine pale blue branching stem and saturated blue blossom, not a generic crop.
    g.fillStyle(P.waterLight).fillRect(x + 56, y + 3, 3, 22).fillRect(x + 48, y + 10, 10, 2).fillRect(x + 59, y + 6, 9, 2);
    g.fillStyle(P.festivalBlue).fillRect(x + 47, y - 2, 23, 11).fillRect(x + 52, y - 7, 12, 21);
    g.fillStyle(P.waterGlint).fillRect(x + 54, y - 1, 8, 6);
    g.fillStyle(P.stoneDeep).fillRect(x + 50, y + 23, 16, 6);
  } else if (stall.id === 'specimens') {
    g.fillStyle(P.stoneDeep).fillRect(x + 47, y + 1, 25, 25);
    g.fillStyle(P.waterLight).fillRect(x + 49, y + 3, 21, 22);
    g.fillStyle(P.plaster).fillRect(x + 46, y - 2, 27, 5);
    g.fillStyle(P.plumDeep).fillRect(x + 54, y + 9, 8, 6).fillRect(x + 61, y + 12, 5, 2).fillRect(x + 65, y + 14, 2, 5);
    g.fillStyle(P.waterGlint).fillRect(x + 50, y + 5, 2, 14);
  } else if (stall.id === 'books') {
    for (const [dx, c, ht] of [[12, P.plum, 17], [25, P.grass, 22], [38, P.paperShade, 15], [81, P.leafRedDeep, 26]]) {
      g.fillStyle(c!).fillRect(x + dx!, y + 24 - ht!, 10, ht!);
      g.fillStyle(P.cream).fillRect(x + dx! + 2, y + 25 - ht!, 6, 2);
    }
    // Open animal-scroll with two ear marks. The separate blue volume uses an
    // original, low-resolution bird-and-ring motif drawn by our texture pass.
    g.fillStyle(P.cream).fillRect(x + 53, y + 10, 19, 15);
    g.fillStyle(P.woodDeep).fillRect(x + 56, y + 14, 3, 4).fillRect(x + 65, y + 14, 3, 4).fillRect(x + 59, y + 18, 6, 4);
  }
  if (stall.id === 'adventurer') scene.add.image(x + 62, y + 17, 'item-war-horn').setDepth(y + h + 1);
  if (stall.id === 'curios') scene.add.image(x + 50, y + 17, 'item-bird-arrow-pin').setDepth(y + h + 1);
  if (stall.id === 'books') scene.add.image(x + 104, y + 18, 'item-hunger-games').setDepth(y + h + 1);
}

export function festivalLandmarkProps(scene: Phaser.Scene): void {
  const shrine = scene.add.graphics().setDepth(293);
  shrine.fillStyle(P.stoneDeep).fillRect(612, 286, 80, 12).fillRect(622, 276, 60, 11);
  shrine.fillStyle(P.stoneLight).fillRect(617, 286, 70, 3).fillRect(625, 277, 54, 3);
  // A seated stone dragon, curled tail and swept ears; small essence offering below.
  shrine.fillStyle(P.stoneShade).fillRect(635, 256, 27, 22).fillRect(652, 236, 20, 26).fillRect(667, 243, 14, 9)
    .fillRect(628, 270, 15, 9).fillRect(621, 264, 9, 8).fillRect(627, 258, 6, 5)
    .fillRect(635, 239, 8, 22).fillRect(630, 232, 6, 18).fillRect(653, 230, 4, 9).fillRect(665, 230, 4, 10);
  shrine.fillStyle(P.stoneLight).fillRect(655, 240, 10, 16).fillRect(640, 259, 10, 15).fillRect(671, 244, 8, 2);
  shrine.fillStyle(P.waterLight).fillRect(669, 244, 2, 2);
  shrine.fillStyle(P.stoneDeep).fillRect(630, 248, 3, 14).fillRect(627, 251, 3, 8)
    .fillRect(658, 235, 10, 2).fillRect(661, 232, 3, 4);
  shrine.fillStyle(P.festivalPurple).fillRect(644, 289, 9, 6);
  shrine.fillStyle(P.plumLight).fillRect(646, 287, 4, 3);
  const chair = scene.add.graphics().setDepth(325);
  chair.fillStyle(P.shadowDeep).fillRect(838, 286, 30, 38).fillRect(835, 307, 7, 21).fillRect(865, 307, 7, 21);
  for (const [x, y] of [[839, 258], [845, 246], [851, 252], [857, 242], [863, 260]]) {
    chair.fillStyle(P.stoneShade).fillRect(x!, y!, 3, 61 - (y! - 242));
    chair.fillStyle(P.stoneLight).fillRect(x!, y!, 1, 23);
  }
  chair.fillStyle(P.stone).fillRect(841, 306, 24, 6);
  const painting = scene.add.graphics().setDepth(727);
  painting.fillStyle(P.woodDeep).fillRect(562, 670, 40, 45);
  painting.fillStyle(P.leafGold).fillRect(565, 673, 34, 39);
  painting.fillStyle(P.paperShadow).fillRect(568, 676, 28, 33);
  painting.fillStyle(P.plumDeep).fillRect(570, 678, 24, 29);
  painting.fillStyle(P.plaster).fillRect(577, 687, 11, 12).fillRect(573, 699, 19, 5);
  painting.fillStyle(P.festivalRed).fillRect(574, 682, 17, 6).fillRect(580, 690, 5, 4);
  painting.fillStyle(P.shadowDeep).fillRect(577, 694, 2, 2).fillRect(587, 694, 2, 2).fillRect(581, 699, 5, 1);
  painting.fillStyle(P.waterLight).fillRect(577, 696, 1, 4).fillRect(588, 696, 1, 4);
  const target = scene.add.graphics().setDepth(659);
  target.fillStyle(P.woodDeep).fillRect(1148, 651, 5, 32).fillRect(1177, 651, 5, 32);
  target.fillStyle(P.paperShade).fillRect(1144, 622, 42, 38);
  target.fillStyle(P.plaster).fillRect(1148, 625, 34, 31);
  target.fillStyle(P.festivalRed).fillRect(1153, 630, 24, 21);
  target.fillStyle(P.cream).fillRect(1158, 634, 14, 13);
  target.fillStyle(P.festivalRed).fillRect(1162, 638, 6, 5);
  target.fillStyle(P.woodWarm).fillRect(1106, 637, 3, 38).fillRect(1101, 647, 4, 19);
  target.fillStyle(P.cream).fillRect(1109, 638, 1, 36);
  // NIGHTLOCK grows at the edge of the traversed forest path, rather than in
  // the fair. The paired glossy lobes make it readable without a loot marker.
  const berries = scene.add.graphics().setDepth(1625);
  berries.fillStyle(P.grassDeep).fillRect(769, 1592, 27, 25).fillRect(776, 1584, 12, 37);
  berries.fillStyle(P.grass).fillRect(767, 1597, 12, 6).fillRect(786, 1590, 13, 7).fillRect(785, 1607, 14, 6);
  for (const [x, y] of [[772,1595],[781,1590],[790,1597],[776,1606],[787,1611],[794,1604]] as const) {
    berries.fillStyle(P.plumDeep).fillRect(x, y, 5, 5);
    berries.fillStyle(P.plumLight).fillRect(x + 1, y + 1, 1, 1);
  }
}
