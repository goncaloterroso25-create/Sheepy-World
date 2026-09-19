import type Phaser from 'phaser';
import { FAIR as P, fairPaving } from '../../art/fairStyle';
import { forestFern } from '../../art/forestStyle';
import { pixelOval } from '../../art/styleProofShapes';
import { festivalLandmarkProps, festivalStall } from '../../art/festivalProps';
import { OLD_WORLD_FOREST_PROPS } from '../../data/festivalContent';
import { FESTIVAL_HOUSES, FESTIVAL_PAVING, FESTIVAL_SOLIDS, FESTIVAL_STALLS, FESTIVAL_WALLS } from './FestivalLayout';
import { bakeGround, blockers, house, planter, stoneWall, wallLamp } from './RegionArt';
import { addMedievalLandscape } from './ExpansionWorld';

function addCorrectiveForestArt(scene: Phaser.Scene): void {
  const bank=scene.add.graphics().setDepth(-89);
  // Small grass tongues, moss and stones interrupt the old rectangular water
  // edges while leaving the authored bridge and traversal collision unchanged.
  for(const [x,y,w] of [[18,1736,68],[116,1810,94],[244,1738,72],[405,1811,82],[520,1736,62],
    [816,1737,74],[923,1811,96],[1080,1737,77],[1222,1810,91],[257,1887,44],[365,1997,40]] as const){
    bank.fillStyle(0x526e60); pixelOval(bank,x,y-4,w,12);
    bank.fillStyle(0x819372); pixelOval(bank,x+4,y-3,w-12,5);
  }
  for(const [x,y] of [[680,1453],[739,1471],[704,1652],[744,1684],[674,1914],[742,1951],[682,2170],[748,2214]] as const){
    bank.fillStyle(0x475442).fillRect(x-8,y-3,17,7);
    bank.fillStyle(0x78816a).fillRect(x-6,y-2,12,2).fillRect(x+3,y+2,4,1);
  }
  for(const prop of OLD_WORLD_FOREST_PROPS){
    const g=scene.add.graphics().setDepth(prop.y+2);
    if(prop.kind==='mushrooms'){
      g.fillStyle(P.paperShade).fillRect(prop.x-7,prop.y-5,2,7).fillRect(prop.x+3,prop.y-8,2,10).fillRect(prop.x+10,prop.y-3,2,5);
      g.fillStyle(P.leafRedDeep).fillRect(prop.x-10,prop.y-7,8,3).fillRect(prop.x,prop.y-10,8,3).fillRect(prop.x+7,prop.y-5,8,3);
      g.fillStyle(P.cream).fillRect(prop.x-7,prop.y-7,2,1).fillRect(prop.x+3,prop.y-10,2,1);
    }else if(prop.kind==='fallen-log'){
      g.fillStyle(P.shadowDeep,.4).fillRect(prop.x-27,prop.y+2,59,6);
      g.fillStyle(P.woodDeep).fillRect(prop.x-28,prop.y-7,56,10).fillRect(prop.x+24,prop.y-10,8,14);
      g.fillStyle(P.woodWarm).fillRect(prop.x-23,prop.y-5,44,3).fillRect(prop.x-17,prop.y,31,1);
      g.fillStyle(P.grass).fillRect(prop.x-19,prop.y-9,12,3).fillRect(prop.x+5,prop.y-9,16,3);
    }else if(prop.kind==='rock'){
      g.fillStyle(P.stoneDeep).fillRect(prop.x-10,prop.y-8,21,10);
      g.fillStyle(P.stoneShade).fillRect(prop.x-7,prop.y-11,14,12);
      g.fillStyle(P.stoneLight).fillRect(prop.x-5,prop.y-9,8,2);
    }else if(prop.kind==='flowers'){
      for(const [dx,dy,c] of [[-8,-4,P.plumLight],[-2,-8,P.paper],[5,-3,P.leafGold],[10,-7,P.plumLight]] as const){
        g.fillStyle(P.grass).fillRect(prop.x+dx,prop.y+dy,1,dy*-1+3);
        g.fillStyle(c).fillRect(prop.x+dx-1,prop.y+dy-1,3,3);
      }
    }else if(prop.kind==='reeds'){
      for(let i=0;i<5;i++)g.fillStyle(i%2?P.grass:P.grassDeep).fillRect(prop.x+i*4,prop.y-10-(i%3)*4,2,13+(i%3)*4);
    }else{
      forestFern(g,prop.x-15,prop.y-18);
    }
  }
  const bridge=scene.add.graphics().setDepth(1837);
  bridge.fillStyle(P.grassDeep).fillRect(618,1717,16,7).fillRect(774,1717,16,7).fillRect(618,1832,16,7).fillRect(774,1832,16,7);
  for(const y of [1736,1770,1804])bridge.fillStyle(P.woodLight).fillRect(619,y,6,3).fillRect(783,y,6,3);
}

export function buildOldWorldFestival(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  bakeGround(scene, 'region-festival-ground', 1408, 1408, g => {
    g.fillStyle(P.grassDeep).fillRect(0, 0, 1408, 1408);
    g.fillStyle(P.soilDeep).fillRect(100, 374, 1200, 940);
    FESTIVAL_PAVING.forEach(r => fairPaving(g, r));
    FESTIVAL_WALLS.forEach(r => stoneWall(g, r));
    // Framed arrival and a stone rosette in the fair square, no compulsory interaction marker.
    for (let y = 1280; y < 1400; y += 16) {
      g.fillStyle(P.stoneShade).fillRect(661, y, 86, 3);
      g.fillStyle(P.stoneLight).fillRect(661, y + 3, 86, 2);
    }
    g.fillStyle(P.stone).fillRect(601, 892, 155, 66).fillRect(625, 870, 106, 110);
    g.fillStyle(P.stoneLight).fillRect(636, 896, 84, 55);
    g.fillStyle(P.stoneShade).fillRect(648, 907, 60, 32);
    for (const [x, y, w] of [[115, 440, 132], [948, 330, 80], [1090, 1090, 168], [560, 748, 129], [310, 1022, 94]]) {
      g.fillStyle(P.grass).fillRect(x!, y!, w!, 24);
      g.fillStyle(P.grassShade).fillRect(x! + 4, y! - 5, w! - 8, 17);
    }
    // Thin archery shooting line, with plenty of circulation around it.
    g.fillStyle(P.paperShade).fillRect(1093, 754, 145, 3);
  });
  FESTIVAL_HOUSES.forEach(h => house(scene, h));
  FESTIVAL_STALLS.forEach(s => festivalStall(scene, s));
  festivalLandmarkProps(scene);
  const arch = scene.add.graphics().setDepth(1290);
  arch.fillStyle(P.stoneDeep).fillRect(604, 1210, 30, 112).fillRect(774, 1210, 30, 112);
  arch.fillStyle(P.stone).fillRect(608, 1214, 22, 106).fillRect(778, 1214, 22, 106);
  arch.fillStyle(P.stoneLight).fillRect(602, 1210, 34, 6).fillRect(772, 1210, 34, 6);
  // High arch lintel is art only: walking beneath it remains possible.
  arch.fillStyle(P.stoneShade).fillRect(618, 1210, 170, 16).fillRect(626, 1198, 154, 13);
  arch.fillStyle(P.stoneLight).fillRect(633, 1196, 140, 4);
  for (const [x, y] of [[396, 1045], [853, 1045], [292, 386], [918, 375], [1265, 830]]) planter(scene, x!, y!);
  for (const [x, y] of [[543, 1232], [1050, 1232], [722, 699], [1283, 501], [269, 918]]) wallLamp(scene, x!, y!);
  const flags = scene.add.graphics().setDepth(1500);
  for (const [x, y, w] of [[521, 1100, 346], [412, 766, 561], [376, 382, 667]]) {
    flags.fillStyle(P.woodDeep).fillRect(x!, y!, w!, 1);
    for (let dx = 15, i = 0; dx < w! - 5; dx += 43, i++) {
      flags.fillStyle([P.festivalRed, P.festivalGold, P.festivalBlue][i % 3]!).fillRect(x! + dx, y! + 1, 15, 13)
        .fillRect(x! + dx + 3, y! + 14, 9, 4).fillRect(x! + dx + 6, y! + 18, 3, 3);
    }
  }
  scene.tweens.add({ targets: flags, y: 1, duration: 2400, yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [1] });
  const extra = addMedievalLandscape(scene);
  addCorrectiveForestArt(scene);
  return blockers(scene, [...FESTIVAL_SOLIDS, ...extra]);
}
