import type Phaser from 'phaser';
import { PALETTE as P } from '../../art/palette';
import { addSmallText } from '../../ui/PixelFont';
import { bakeGround, blockers, wallLamp } from './RegionArt';
import { dayHouse as house, dayTree as gardenTree, dayPlanter as planter, dayPaving as paving, DAY } from '../../art/townDayArt';
import { vilaGround } from '../../art/riverVilaGround';
import { VILA_HOUSES, VILA_SOLIDS, VILA_TREES } from './layouts';

export function buildVilaMeow(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  bakeGround(scene, 'region-vila-ground', 1152, 1056, vilaGround);
  VILA_HOUSES.forEach(h => house(scene, h));
  const family=scene.add.graphics().setDepth(-30);
  family.fillStyle(DAY.grass).fillRect(565,108,174,238);
  paving(family,{x:474,y:348,width:354,height:28});
  scene.add.image(625,325,'bench').setDepth(338);
  for(const x of [590,654,703]) planter(scene,x,323);
  VILA_TREES.forEach(([x, y]) => gardenTree(scene, x, y));
  for (const [x, y] of [[172, 427], [526, 360], [722, 354], [907, 351], [1030, 917]]) planter(scene, x!, y!);
  for (const [x, y] of [[293, 392], [561, 318], [927, 306], [1072, 891]]) wallLamp(scene, x!, y!);
  for (const [x, y] of [[610, 542], [735, 516], [730, 975]]) scene.add.image(x!, y!, 'park-lamp').setDepth(y! + 10);
  const laundry = scene.add.graphics().setDepth(365);
  laundry.fillStyle(P.woodDeep).fillRect(384, 342, 162, 1);
  laundry.fillStyle(P.plasterLight).fillRect(401, 343, 21, 19).fillRect(491, 343, 24, 14);
  laundry.fillStyle(P.plum).fillRect(431, 343, 16, 22);
  scene.tweens.add({ targets: laundry, y: 1, duration: 2100, yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [1] });
  // One locality sign. No repeated street labels.
  const sign = scene.add.graphics().setDepth(557);
  sign.fillStyle(P.woodDeep).fillRect(76, 526, 2, 32).fillRect(145, 526, 2, 32);
  sign.fillStyle(P.plaster).fillRect(69, 518, 85, 18);
  addSmallText(scene, 74, 523, 'VILA MEOW', P.ink).setDepth(560);
  const parked = scene.add.image(470, 507, 'car-cream').setDepth(527);
  parked.setFlipX(true);
  return blockers(scene, VILA_SOLIDS);
}
