import type Phaser from 'phaser';
import { PALETTE as P } from '../../art/palette';
import { addGoncaloHomeStyle } from '../../art/goncaloHomeStyle';
import { forestGround, forestMotes } from '../../art/forestStyle';
import { oldKeepStyle } from '../../art/oldKeepStyle';
import { addSnowStyleProof } from '../../art/snowStyleProof';
import { addPortoStyle } from '../../art/portoStyle';
import { addSmallText } from '../../ui/PixelFont';
import { bakeGround, blockers, paving } from './RegionArt';
import { CASTLE_SOLIDS, FOREST_WATER, FOREST_TREES, FOREST_TRUNKS, GONCALO_SOLIDS,
  PORTO_SOLIDS, SNOW_SOLIDS } from './ExpansionLayout';
import type { Rect } from './definitions';

const label = (scene: Phaser.Scene, x: number, y: number, text: string, color: number = P.cream): void => {
  addSmallText(scene, x, y, text, color).setDepth(3000);
};

export function buildPorto(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  addPortoStyle(scene);
  return blockers(scene, PORTO_SOLIDS);
}

export function buildGoncaloHome(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  addGoncaloHomeStyle(scene);
  const g = scene.add.graphics().setDepth(270);
  // Dual-monitor rig, keyboard, white/black controller and three colored wall notes.
  for (const x of [306, 374]) {
    g.fillStyle(P.shadowDeep).fillRect(x, 179, 60, 35).fillRect(x + 27, 214, 6, 11);
    g.fillStyle(P.waterDeep).fillRect(x + 3, 182, 54, 28);
    g.fillStyle(P.waterShade).fillRect(x + 7, 187, 26, 2).fillRect(x + 7, 193, 39, 1);
  }
  g.fillStyle(P.stoneDeep).fillRect(324, 237, 74, 8);
  g.fillStyle(P.stoneLight).fillRect(411, 233, 18, 7).fillRect(409, 238, 5, 5).fillRect(426, 238, 5, 5);
  g.fillStyle(P.shadowDeep).fillRect(417, 235, 6, 5);
  for (const [x, y, c] of [[260, 108, P.plumLight], [282, 114, P.leafGold], [264, 129, P.waterLight]]) {
    g.fillStyle(c!).fillRect(x!, y!, 17, 17); g.fillStyle(P.ink).fillRect(x! + 3, y! + 4, 10, 1).fillRect(x! + 3, y! + 8, 8, 1);
  }
  g.fillStyle(P.plasterLight).fillRect(330, 87, 32, 44);
  g.fillStyle(P.leafGold).fillRect(334, 103, 24, 23); g.fillStyle(P.shadowDeep).fillRect(337, 105, 7, 9).fillRect(350, 105, 6, 9);
  const sister = scene.add.graphics().setDepth(631);
  sister.fillStyle(P.shadowDeep).fillRect(99, 490, 33, 32).fillRect(103, 519, 30, 36);
  sister.fillStyle(P.skin).fillRect(106, 498, 18, 15); sister.fillStyle(P.stoneLight).fillRect(107, 502, 7, 4).fillRect(118, 502, 7, 4);
  sister.fillStyle(P.waterLight).fillRect(130, 516, 7, 12);
  const room = scene.add.graphics().setDepth(520);
  room.fillStyle(P.shadowDeep).fillRect(349, 422, 60, 39); room.fillStyle(P.waterLight).fillRect(354, 427, 50, 29);
  for (let i = 0; i < 7; i++) room.fillStyle(i % 2 ? P.plum : P.leafRedDeep).fillRect(201 + i * 8, 445, 6, 25);
  room.fillStyle(P.leafGold).fillRect(222, 449, 1, 18);
  scene.add.image(836, 610, 'cof-mug').setDepth(650);
  const snack = scene.add.graphics().setDepth(651);
  snack.fillStyle(P.paperShade).fillRect(779,604,37,20).fillRect(782,601,31,5);
  snack.fillStyle(P.woodDeep).fillRect(782,604,31,13);
  for(const [x,y] of [[784,606],[794,605],[805,607],[790,612],[801,612]])
    snack.fillStyle(P.leafGold).fillRect(x!,y!,7,4).fillStyle(P.woodWarm).fillRect(x!+1,y!+3,5,2);
  const bedside = scene.add.graphics().setDepth(177);
  bedside.fillStyle(P.woodDeep).fillRect(235,163,29,6).fillRect(238,168,4,11).fillRect(258,168,4,11);
  bedside.fillStyle(P.woodLight).fillRect(235,158,29,6);
  const cats = scene.add.graphics().setDepth(732);
  cats.fillStyle(P.plumDeep).fillRect(1000, 676, 75, 39); cats.fillStyle(P.paperShade).fillRect(1005, 681, 65, 29);
  for (const x of [920, 947]) { cats.fillStyle(P.stoneDeep).fillRect(x, 746, 21, 7); cats.fillStyle(x === 920 ? P.woodWarm : P.waterLight).fillRect(x + 2, 743, 17, 5); }
  return blockers(scene, GONCALO_SOLIDS);
}

export function buildSnow(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  addSnowStyleProof(scene);
  return blockers(scene, SNOW_SOLIDS);
}

export function addMedievalLandscape(scene: Phaser.Scene): readonly Rect[] {
  bakeGround(scene, 'old-world-forest-ground', 1408, 2304, g => {
    forestGround(g);
    for (const r of [{ x: 704, y: 140, width: 182, height: 120 }, { x: 936, y: 156, width: 91, height: 312 }]) paving(g, r);
  });
  oldKeepStyle(scene);
  label(scene, 748, 146, 'THE OLD KEEP', P.stoneLight);
  // Fountain, blacksmith nook, and two original woven motifs.
  const f = scene.add.graphics().setDepth(711);
  f.fillStyle(P.stoneDeep).fillRect(596, 640, 80, 64); f.fillStyle(P.stoneLight).fillRect(600, 644, 72, 53);
  f.fillStyle(P.waterShade).fillRect(607, 653, 58, 35); f.fillStyle(P.stone).fillRect(628, 631, 15, 53);
  f.fillStyle(P.waterLight).fillRect(633, 616, 4, 33).fillRect(622, 631, 26, 2);
  scene.tweens.add({ targets: f, alpha: .85, duration: 1300, yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [2] });
  label(scene, 482, 728, 'THE CROOKED CUP'); label(scene, 1100, 539, 'IRON & THREAD');
  const cloth = scene.add.graphics().setDepth(584);
  for (const [x, color] of [[1124, P.plum], [1176, P.festivalBlue]]) {
    cloth.fillStyle(color!).fillRect(x!, 546, 32, 52); cloth.fillStyle(P.leafGold).fillRect(x! + 3, 550, 26, 2).fillRect(x! + 3, 587, 26, 2);
    cloth.fillStyle(P.paper).fillRect(x! + 14, 560, 4, 23).fillRect(x! + 8, 570, 16, 3);
  }
  for(const [i,p] of FOREST_TREES.entries()){
    scene.add.image(p.x,p.y,`forest-tree-${p.variant}`).setOrigin(.5,.94).setDepth(p.y+4);
    if(i%2===0)scene.add.image(p.x-26,p.y+4,'forest-fern').setDepth(p.y+10);
    if(i%5===0)scene.add.image(p.x+28,p.y+7,'forest-bush').setDepth(p.y+9);
    if(i%13===0)scene.add.image(p.x-18,p.y+18,'flower-patch').setDepth(p.y+20);
  }
  const fauna = scene.add.graphics().setDepth(1903);
  fauna.fillStyle(P.paper).fillRect(429, 1868, 9, 5).fillRect(432, 1861, 2, 9).fillRect(437, 1863, 2, 5);
  fauna.fillStyle(P.woodLight).fillRect(468, 1514, 9, 13); fauna.fillStyle(P.cream).fillRect(469, 1516, 2, 3).fillRect(474, 1516, 2, 3);
  scene.tweens.add({ targets: fauna, x: 4, duration: 2700, yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [2] });
  const shrine=scene.add.graphics().setDepth(1800);
  shrine.fillStyle(P.stoneDeep).fillRect(443,1791,50,11).fillRect(451,1747,29,45);
  shrine.fillStyle(P.stone).fillRect(455,1750,22,39).fillRect(438,1789,58,4);
  shrine.fillStyle(0x4d7260).fillRect(455,1767,5,16).fillRect(443,1790,17,3);
  shrine.fillStyle(P.waterLight).fillRect(463,1758,5,10).fillRect(460,1761,11,3);
  const details=scene.add.graphics().setDepth(1910);
  for(const [x,y]of [[428,1910],[908,1912],[1221,1601],[360,2141]]){
    details.fillStyle(P.paper).fillRect(x!,y!,2,5).fillStyle(P.leafRedDeep).fillRect(x!-2,y!-3,7,4);
  }
  for(const [x,y]of [[590,1835],[833,1713],[918,1935]]){
    const bird=scene.add.graphics().setPosition(x!,y!).setDepth(y!+1);
    bird.fillStyle(P.woodDeep).fillRect(0,0,6,4).fillRect(4,-2,4,4);
    bird.fillStyle(P.leafGold).fillRect(8,0,2,1);bird.fillStyle(P.cream).fillRect(1,1,3,1);
    scene.tweens.add({targets:bird,x:x!+15,y:y!-3,duration:2300,yoyo:true,repeat:-1,ease:'Stepped',easeParams:[3]});
  }
  // Local guards are tiny non-blocking silhouettes, never roaming door blockers.
  for(const [x,y]of [[733,246],[866,246],[691,660]]){
    const guard=scene.add.graphics().setDepth(y!);
    guard.fillStyle(P.shadowDeep).fillRect(x!-5,y!-12,4,12).fillRect(x!+2,y!-12,4,12);
    guard.fillStyle(P.stoneShade).fillRect(x!-7,y!-24,15,16).fillRect(x!-5,y!-33,10,10);
    guard.fillStyle(P.stoneLight).fillRect(x!-4,y!-32,3,9).fillRect(x!-6,y!-23,4,6);
    guard.fillStyle(P.shadowDeep).fillRect(x!-3,y!-28,7,2);
    guard.fillStyle(P.festivalRed).fillRect(x!-2,y!-19,5,9).fillRect(x!-10,y!-17,6,10);
    guard.fillStyle(P.woodLight).fillRect(x!+11,y!-35,1,34);guard.fillStyle(P.stoneLight).fillRect(x!+10,y!-38,3,5);
  }
  forestMotes(scene);
  return [...FOREST_WATER, ...CASTLE_SOLIDS, ...FOREST_TRUNKS];
}
