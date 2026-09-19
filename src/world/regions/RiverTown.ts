import type Phaser from 'phaser';
import { addSmallText } from '../../ui/PixelFont';
import { PALETTE as P } from '../../art/palette';
import { bakeGround, blockers, wallLamp } from './RegionArt';
import { dayHouse as house, dayTree as gardenTree, dayPlanter as planter, dayCafeTable as cafeTable } from '../../art/townDayArt';
import { riverGround } from '../../art/riverVilaGround';
import { RIVER_CAFE_TABLES, RIVER_HOUSES, RIVER_SOLIDS, RIVER_TREES } from './layouts';

export function buildRiverTown(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  bakeGround(scene, 'region-river-ground', 3072, 1792, riverGround);
  RIVER_HOUSES.forEach(h => house(scene, h));
  RIVER_TREES.forEach(([x, y]) => gardenTree(scene, x, y));
  RIVER_CAFE_TABLES.forEach(r => cafeTable(scene, r));
  for (const [x, y] of [[541, 1474], [882, 1485], [937, 970], [296, 914], [1474, 942], [2145, 383], [3013, 374], [1791, 792]]) planter(scene, x!, y!);
  // Lamps sit at façades, stair landings and bridge entry posts.
  for (const [x, y] of [[734, 1400], [918, 1410], [268, 883], [1055, 908], [1742, 477], [2051, 477], [2810, 214], [1031, 342]]) wallLamp(scene, x!, y!);
  for (const [x, y] of [[1086, 962], [1423, 963], [305, 1530]]) scene.add.image(x!, y!, 'park-lamp').setDepth(y! + 9);
  const tower = scene.add.graphics().setDepth(690);
  tower.fillStyle(P.stoneDeep).fillRect(96, 522, 102, 179);
  tower.fillStyle(P.plaster).fillRect(101, 526, 92, 169);
  tower.fillStyle(P.stoneLight).fillRect(89, 547, 116, 10).fillRect(93, 615, 108, 8);
  tower.fillStyle(P.woodDeep).fillRect(123, 564, 47, 40).fillRect(133, 553, 27, 12);
  tower.fillStyle(P.leafGold).fillRect(140, 577, 15, 14);
  tower.fillStyle(P.stoneLight).fillRect(110, 515, 75, 9).fillRect(127, 504, 42, 11).fillRect(143, 491, 9, 13);
  // Old-world roofline and banners frame the stone stair route in the upper view.
  const glimpse = scene.add.graphics().setDepth(310);
  for (const [x, y, w, h] of [[1000, 94, 36, 72], [1120, 126, 16, 150]]) {
    glimpse.fillStyle(P.stoneDeep).fillRect(x!, y!, w!, h!);
    glimpse.fillStyle(P.stone).fillRect(x! + 3, y! + 3, w! - 6, h! - 3);
    for (let dx = 0; dx < w!; dx += 12) glimpse.fillStyle(P.stoneLight).fillRect(x! + dx, y! - 6, 8, 9);
  }
  glimpse.fillStyle(P.woodDeep).fillRect(1032, 123, 96, 1);
  for (const [i, x] of [1041, 1066, 1091, 1116].entries()) {
    glimpse.fillStyle(i % 2 ? P.festivalGold : P.festivalRed).fillRect(x, 124, 13, 15).fillRect(x + 3, 139, 7, 4);
  }
  for (const [x, y] of [[1175, 764], [1317, 1263], [1200, 1670]]) {
    const ripple = scene.add.image(x!, y!, 'water-ripple').setDepth(-90).setTint(P.waterGlint).setAlpha(.4);
    scene.tweens.add({ targets: ripple, x: x! + 4, duration: 3400, yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [4] });
  }
  const sign=scene.add.graphics().setDepth(516);
  sign.fillStyle(P.woodDeep).fillRect(2833,470,4,43).fillRect(2797,469,79,17);
  sign.fillStyle(P.woodWarm).fillRect(2799,471,75,13);
  addSmallText(scene,2803,474,'HIGHLANDS',P.cream).setDepth(517);
  // A compact, readable police perimeter outside the curios shop.
  const caseFront=scene.add.graphics().setDepth(524);
  caseFront.fillStyle(0xe5c14e).fillRect(1532,514,222,4);
  for(let x=1535;x<1748;x+=22)caseFront.fillStyle(P.shadowDeep).fillRect(x,514,8,4);
  caseFront.fillStyle(0x334b64).fillRect(1510,532,72,25).fillRect(1724,532,72,25);
  caseFront.fillStyle(P.paper).fillRect(1517,536,58,12).fillRect(1731,536,58,12);
  caseFront.fillStyle(0xc44647).fillRect(1543,528,9,4).fillRect(1757,528,9,4);
  caseFront.fillStyle(0x5f8db0).fillRect(1552,528,9,4).fillRect(1766,528,9,4);
  scene.add.image(1589,548,'person-cap-0').setOrigin(.5,1).setDepth(548).setTint(0x6f89a5);
  scene.add.image(1692,548,'person-cap-1').setOrigin(.5,1).setDepth(548).setTint(0x6f89a5);
  addSmallText(scene,1580,478,'CURIOS',P.cream).setDepth(479);
  return blockers(scene, RIVER_SOLIDS);
}
