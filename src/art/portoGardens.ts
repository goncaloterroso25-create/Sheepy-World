import type Phaser from 'phaser';
import { addSmallText } from '../ui/PixelFont';
import { pixelOval, softBox } from './styleProofShapes';
import { PORTO as C, nightLamp } from './portoUrban';

export const GARDEN_TERRACES = [[92, 552, 420, 110], [112, 692, 420, 110], [96, 836, 436, 98]] as const;
const TREES = [[145,588],[423,615],[139,756],[474,903],[388,877],[542,307],
  [110,895],[176,330],[486,706],[96,686]] as const;

/** Low stepped retaining fronts, with a broad open stair at x237–320.
 * These are planted edges, not new collision walls across traversable ground. */
export function gardenGround(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x484e60);softBox(g,332,390,146,43,5);
  for(let x=338;x<474;x+=17)g.fillStyle(0x707080,.4).fillRect(x,416,10,1);
  g.fillStyle(0x30464a); softBox(g, 65, 534, 492, 417, 24);
  for (const [x, y, w, h] of GARDEN_TERRACES) {
    g.fillStyle(0x273b42); softBox(g, x + 5, y + 6, w, h + 12, 16);
    g.fillStyle(0x456356); softBox(g, x, y, w, h, 16);
    g.fillStyle(0x53725e); pixelOval(g, x + 22, y + 15, w - 48, h - 30);
    for (const [start, width] of [[x + 12, 225 - x], [329, x + w - 341]]) {
      g.fillStyle(0x3c444e).fillRect(start!, y + h - 2, width!, 13);
      g.fillStyle(0x656b70).fillRect(start!, y + h - 2, width!, 7);
      g.fillStyle(0x92958b).fillRect(start! - 1, y + h - 4, width! + 2, 3);
      for (let sx = start! + 12; sx < start! + width! - 6; sx += 19)
        g.fillStyle(0x49545b).fillRect(sx, y + h + 2, 1, 6);
    }
    for (let s = 0; s < 4; s++) {
      g.fillStyle(0x6a7274).fillRect(237, y + s * 5, 83, 5);
      g.fillStyle(0x9b9d91).fillRect(237, y + s * 5, 83, 1);
    }
    // Curved planting lobes soften the retaining ends without cluttering stairs.
    for (const [px, py] of [[x + 12, y + 34], [x + w - 37, y + 15], [x + w - 22, y + h - 12]]) {
      g.fillStyle(C.leafDeep); pixelOval(g, px!, py!, 31, 13);
      g.fillStyle(C.leaf); pixelOval(g, px! + 3, py! - 2, 25, 12);
    }
  }
  for (const [x, y] of TREES) { g.fillStyle(0x23363d, .48); pixelOval(g, x - 24, y - 3, 61, 19); }
  // A garden overlook vignette, not a geographical map: dusky river beyond
  // the western planting. The playable terrace footprint is unchanged.
  g.fillStyle(0x354654).fillRect(0, 553, 58, 403);
  for (let i = 0; i < 16; i++) {
    g.fillStyle(0x3c5360).fillRect(6 + i % 3 * 8, 569 + i * 24, 28, 2);
    g.fillStyle(0xb6987b, .3).fillRect(12 + i % 4 * 6, 578 + i * 24, 5, 1);
  }
}

/** Applied after paving so the open terrace crossings read as shallow stairs. */
export function gardenSteps(g: Phaser.GameObjects.Graphics): void {
  for(const [,y,,h]of GARDEN_TERRACES)for(const sy of [y,y+h-4])for(let s=0;s<4;s++){
    g.fillStyle(0x68717a).fillRect(237,sy+s*4,83,4);
    g.fillStyle(0xa0a199).fillRect(237,sy+s*4,83,1);
    g.fillStyle(0x414d5b).fillRect(237,sy+s*4+3,83,1);
  }
}

export function gardenPlant(scene: Phaser.Scene, x: number, y: number, pot = true, variant = 0): void {
  const g = scene.add.graphics().setDepth(y);
  g.fillStyle(C.ink, .45); pixelOval(g, x - 15, y - 2, 34, 8);
  if (pot) {
    g.fillStyle(0x654955); softBox(g, x - 11, y - 9, 22, 12, 2);
    g.fillStyle(0xab7a76).fillRect(x - 12, y - 10, 24, 3).fillRect(x - 8, y - 6, 3, 6);
  }
  for (const [dx, dy, w, h] of [[-15,-18,18,13],[-5,-25,20,17],[7,-17,13,11]]) {
    g.fillStyle(C.leafDeep); pixelOval(g, x + dx!, y + dy!, w!, h!);
    g.fillStyle(C.leafLight); pixelOval(g, x + dx! + 2, y + dy! + 1, w! - 6, 5);
  }
  for (const [dx, dy] of [[-9,-19],[2,-24],[10,-17],[-2,-13]]) {
    g.fillStyle(variant % 2 ? 0xd8b791 : 0xb98ba8).fillRect(x + dx!, y + dy!, 3, 3);
    g.fillStyle(0xeee0b8).fillRect(x + dx! + 1, y + dy! + 1, 1, 1);
  }
}

function tree(scene: Phaser.Scene, x: number, y: number, variant: number): void {
  const g = scene.add.graphics().setDepth(y);
  g.fillStyle(0x39363f).fillRect(x - 4, y - 44, 9, 44).fillRect(x - 9, y - 1, 17, 3);
  g.fillStyle(0x82665f).fillRect(x - 1, y - 35, 3, 34).fillRect(x - 12, y - 30, 11, 3);
  const lobes = variant % 2 ? [[-21,-75,33,40],[-30,-52,39,28],[0,-57,28,36]] : [[-33,-57,41,31],[-20,-73,46,40],[3,-51,32,30]];
  for (const [dx, dy, w, h] of lobes) {
    g.fillStyle(C.leafDeep); pixelOval(g, x + dx!, y + dy!, w!, h!);
    g.fillStyle(C.leaf); pixelOval(g, x + dx! + 2, y + dy! + 1, w! - 5, h! - 7);
    g.fillStyle(C.leafLight); pixelOval(g, x + dx! + 5, y + dy! + 2, w! - 14, 11);
    g.fillStyle(0x96a188).fillRect(x + dx! + 10, y + dy! + 4, 8, 2);
  }
}

function bench(scene: Phaser.Scene, x: number, y: number, w: number): void {
  const g = scene.add.graphics().setDepth(y + 14);
  g.fillStyle(C.ink, .4); pixelOval(g, x - 4, y + 9, w + 9, 9);
  g.fillStyle(C.ink).fillRect(x + 5, y - 10, 3, 24).fillRect(x + w - 8, y - 10, 3, 24);
  for (const dy of [-10,-5,0]) {
    g.fillStyle(0x8c6c6a).fillRect(x, y + dy, w, 4);
    g.fillStyle(0xc2967e).fillRect(x + 2, y + dy, w - 4, 1);
  }
  g.fillStyle(0x644e5b).fillRect(x - 1, y + 5, w + 2, 5);
  g.fillStyle(0xc2967e).fillRect(x, y + 4, w, 2);
  g.fillStyle(C.ink).fillRect(x - 2, y, 3, 8).fillRect(x + w - 1, y, 3, 8);
}

export function addPortoGarden(scene: Phaser.Scene): void {
  gardenPlant(scene,328,378,true,1);gardenPlant(scene,480,377,true,0);
  TREES.forEach(([x,y],i) => tree(scene,x,y,i));
  bench(scene,146,628,58); bench(scene,346,792,60);
  for (const [i,[x,y]] of [[413,651],[483,843],[889,452],[1417,856],[220,653],[302,800],
    [128,850],[520,904],[574,690],[950,690],[180,682],[320,704],[448,746],[348,885],[476,925]].entries())
    gardenPlant(scene,x!,y!,i<10,i);
  const picnic = scene.add.graphics().setDepth(-80);
  picnic.fillStyle(C.ink,.35); softBox(picnic,154,720,85,46,5);
  picnic.fillStyle(0x956c80); softBox(picnic,154,716,82,45,2);
  for(let y=719;y<760;y+=8)picnic.fillStyle(0xbd94a0).fillRect(157,y,76,2);
  for(let x=158;x<235;x+=10)picnic.fillStyle(0xc79d9e,.4).fillRect(x,718,2,41);
  picnic.fillStyle(0xe7d7b9);pixelOval(picnic,170,728,19,10);pixelOval(picnic,204,735,15,8);
  picnic.fillStyle(0xcd9d67).fillRect(174,730,11,4);
  picnic.fillStyle(0xb36d73).fillRect(197,728,4,4);
  picnic.fillStyle(0xd8ba76).fillRect(194,731,4,3);
  picnic.fillStyle(0x6d504e).fillRect(214,718,14,10);
  picnic.fillStyle(0xa88063).fillRect(215,719,12,7).fillRect(218,715,6,2);
  // Kiosk retains 352,330,106,70 solid, counter and original people anchors.
  const k = scene.add.graphics().setDepth(400);
  k.fillStyle(C.ink).fillRect(350,330,110,70);
  k.fillStyle(0x577773).fillRect(353,334,104,62);
  for(let x=356;x<456;x+=12)k.fillStyle(0x74918a).fillRect(x,335,2,59);
  k.fillStyle(C.roof).fillRect(348,320,114,16);
  k.fillStyle(0x8a7280).fillRect(353,317,104,5);
  k.fillStyle(C.brass).fillRect(348,332,114,3);
  k.fillStyle(C.ink).fillRect(360,341,88,41);
  k.fillStyle(0xab8473).fillRect(363,344,82,34);
  k.fillStyle(C.window).fillRect(366,346,76,24);
  k.fillStyle(C.wood).fillRect(371,354,67,2).fillRect(370,366,68,2);
  for(const x of [376,389,427])k.fillStyle(C.warm).fillRect(x,360,5,5).fillRect(x+5,361,2,2);
  k.fillStyle(0x53616c).fillRect(403,351,17,17);
  k.fillStyle(C.cap).fillRect(404,352,14,3).fillRect(414,356,2,5);
  k.fillStyle(C.wood).fillRect(356,379,98,6);
  k.fillStyle(C.cap).fillRect(355,377,100,3);
  addSmallText(scene,389,323,'COF',C.warm).setDepth(401);
  for(const [x,y] of [[357,402],[452,402],[286,748]] as const) {
    const g=scene.add.graphics().setDepth(y+18);
    g.fillStyle(C.ink,.4);pixelOval(g,x-16,y+12,35,8);
    g.fillStyle(C.ink).fillRect(x-2,y,4,18).fillRect(x-9,y+16,18,2);
    g.fillStyle(C.wood);pixelOval(g,x-15,y-6,30,10);
    g.fillStyle(C.brass);pixelOval(g,x-13,y-6,26,6);
    g.fillStyle(C.warm).fillRect(x+3,y-9,4,4);
  }
  for(const [x,y,key] of [[340,416,'reader'],[466,416,'elder'],[274,774,'beret'],[405,390,'apron']] as const)
    scene.add.image(x,y,`person-${key}-0`).setOrigin(.5,1).setDepth(y);
  nightLamp(scene,343,614);nightLamp(scene,378,842);
  // Short overlooking rails among the planted outer edges, not across paths.
  const rails=scene.add.graphics().setDepth(-78);
  for(const y of [565,705,849]){
    rails.fillStyle(C.ink).fillRect(72,y,2,59);
    for(let sy=y;sy<y+59;sy+=12)rails.fillRect(72,sy,9,2);
    rails.fillStyle(0x88958e).fillRect(80,y,2,59);
  }
  // Small diegetic plaque. Compatibility interaction/fixture IDs stay virtudes.
  const sign=scene.add.graphics().setDepth(550);
  sign.fillStyle(C.wood).fillRect(113,497,4,47).fillRect(65,472,166,27);
  sign.fillStyle(C.brass).fillRect(65,472,166,2);
  addSmallText(scene,71,477,'JARDINS DO',C.warm).setDepth(551);
  addSmallText(scene,71,487,'PALÁCIO DE CRISTAL',C.warm).setDepth(551);
}
