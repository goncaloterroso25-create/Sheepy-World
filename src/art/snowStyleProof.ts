import type Phaser from 'phaser';
import { SNOW_PROOF as S } from './styleProofPalette';
import { pixelOval, softBox } from './styleProofShapes';
import { bakeGround } from '../world/regions/RegionArt';

const PINES = [[80,265],[190,340],[375,271],[854,369],[1033,505],[1130,330],
  [367,696],[1031,879],[160,881],[752,235],[1120,760],[492,860]] as const;

/** Existing four brush states, with the same footprint and reveal order. */
export function drawSnowProofCarCover(g:Phaser.GameObjects.Graphics,stage:number):void {
  g.clear();
  if(stage===0) {
    g.fillStyle(S.shade);softBox(g,532,381,139,66,8);
    g.fillStyle(S.light);softBox(g,532,378,139,58,8);
    g.fillStyle(S.powder);softBox(g,548,368,109,28,6);
    g.fillStyle(S.light);pixelOval(g,549,368,105,13);
    g.fillStyle(S.shade).fillRect(545,422,31,2).fillRect(624,429,33,2);
  } else if(stage===1) {
    g.fillStyle(S.shade);softBox(g,536,389,131,53,5);
    g.fillStyle(S.light);softBox(g,538,387,127,47,5);
    g.fillStyle(S.powder);softBox(g,558,373,89,19,4);
    g.fillStyle(S.light).fillRect(564,373,77,3);
  } else if(stage===2) {
    g.fillStyle(S.shade);softBox(g,542,404,120,34,4);
    g.fillStyle(S.light);softBox(g,542,404,120,28,4);
    g.fillStyle(S.powder);softBox(g,578,376,56,11,3);
  } else {
    g.fillStyle(S.powder);softBox(g,546,426,111,10,3);
    g.fillStyle(S.light).fillRect(549,426,105,2).fillRect(585,378,43,3);
  }
}

function drift(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
  g.fillStyle(S.shade); pixelOval(g, x, y + 5, w, h);
  g.fillStyle(S.light); pixelOval(g, x - 3, y, w, Math.max(6, h - 5));
  // A lee-side patch, not a concentric hollow that reads as a crater.
  g.fillStyle(S.powder); pixelOval(g, x + Math.floor(w*.45), y + 4,
    Math.floor(w*.55), Math.max(4, h - 9));
}

function pine(g: Phaser.GameObjects.Graphics, x: number, y: number, variant: number): void {
  const height = 93 + variant % 3 * 12;
  g.fillStyle(S.shade, .65); pixelOval(g, x - 36, y - 5, 88, 20);
  g.fillStyle(S.timberDeep).fillRect(x - 5, y - 32, 10, 33);
  g.fillStyle(S.timberLight).fillRect(x - 3, y - 23, 3, 22);
  for (let tier = 3; tier >= 0; tier--) {
    const tip = y - height + tier * 19, spread = 13 + tier * (variant%2?10:8);
    const lean = variant%2 ? tier-2 : 0;
    // Each bough is tapered, offset, and scalloped rather than a horizontal bar.
    for (let row = 0; row < 40; row += 3) {
      const half = Math.round(3 + row / 40 * spread);
      g.fillStyle(S.pineDeep).fillRect(x - half + lean, tip + row, half * 2 + 3, 3);
      g.fillStyle(S.pine).fillRect(x - half + 2 + lean, tip + row, half + 2, 3);
      if (row < 24) g.fillStyle(S.pineLight).fillRect(x - half + 2, tip + row, Math.max(2, half - 3), 2);
    }
    const bottom = tip + 34;
    for (const side of [-1, 1]) {
      const bx = x + side * Math.round(spread * .6) - 9;
      g.fillStyle(S.drift); pixelOval(g, bx, bottom - 2, 24, 10);
      g.fillStyle(S.light); pixelOval(g, bx - 2, bottom - 5, 23, 8);
    }
    g.fillStyle(S.shade); pixelOval(g, x - spread + 3, tip + 21, spread * 2, 12);
    g.fillStyle(S.light); pixelOval(g, x - spread + 1, tip + 17, spread * 2, 12);
    g.fillStyle(S.powder); pixelOval(g, x - spread + 8, tip + 21, Math.max(10, spread), 5);
  }
  g.fillStyle(S.light).fillRect(x - 2, y - height, 5, 8).fillRect(x - 5, y - height + 8, 11, 3);
}

function frozenLake(g: Phaser.GameObjects.Graphics): void {
  // The solid rectangular ice core stays fully visible; irregular banks sit outside it.
  g.fillStyle(S.drift).fillRect(99, 543, 352, 181);
  g.fillStyle(S.iceDeep).fillRect(104, 548, 342, 170);
  g.fillStyle(S.ice).fillRect(111, 554, 328, 155);
  g.fillStyle(S.iceLight,.75);
  for(let y=560;y<704;y+=2) {
    const left=116+Math.floor((y-560)*.63),right=425-Math.floor((y-560)*.31);
    g.fillRect(left,y,right-left,2);
  }
  g.fillStyle(S.ice,.6).fillRect(189,590,204,18).fillRect(244,608,148,23).fillRect(310,631,82,25);
  for (const [x,y,w,h] of [[108,535,98,24],[185,536,147,20],[313,535,135,24],
    [96,701,139,27],[217,705,111,22],[318,704,131,25]]) drift(g,x!,y!,w!,h!);
  g.fillStyle(S.light).fillRect(96,549,14,166).fillRect(439,549,13,167);
  for (let y = 558; y < 697; y += 26) {
    g.fillStyle(S.light);pixelOval(g,90,y,21,35);pixelOval(g,439,y+8,19,32);
    g.fillStyle(S.powder).fillRect(96,y+9,3,19).fillRect(449,y+14,3,13);
  }
  // Sparse trapped bubbles and interrupted crystalline seams, not a swimming pool grid.
  for (const [x,y,w] of [[137,581,78],[279,584,91],[217,613,92],[140,663,64],[282,683,106]]) {
    g.fillStyle(S.glint, .7).fillRect(x!,y!,w!,1).fillRect(x!+8,y!+2,Math.floor(w!/2),1);
  }
  g.fillStyle(S.iceDeep, .5).fillRect(341,616,2,17).fillRect(333,631,9,2).fillRect(331,633,2,10)
    .fillRect(187,624,18,1).fillRect(203,625,2,9).fillRect(205,632,14,1);
  for (const [x,y] of [[154,609],[163,616],[309,650],[315,656],[380,601]]) {
    g.fillStyle(S.glint).fillRect(x!,y!,3,1).fillRect(x!+1,y!-1,1,3);
  }
}

function cabin(scene: Phaser.Scene): void {
  const g = scene.add.graphics().setDepth(338);
  g.fillStyle(S.shade, .8); pixelOval(g, 892, 294, 277, 48);
  g.fillStyle(S.timberDeep).fillRect(916,166,226,148);
  for (let y = 171; y < 301; y += 11) {
    g.fillStyle(S.timber).fillRect(920,y,218,8);
    g.fillStyle(S.timberLight).fillRect(923,y,212,2);
    g.fillStyle(S.timberDeep,.35).fillRect(949+(y%3)*32,y+5,26,1);
  }
  g.fillStyle(S.timberDeep).fillRect(916,172,8,139).fillRect(1134,172,8,139);
  g.fillStyle(S.timberLight).fillRect(919,179,2,121).fillRect(1135,179,2,121);
  // Brick chimney and stepped pitched roof, all at logical pixel resolution.
  g.fillStyle(S.timberDeep).fillRect(1091,95,22,60);
  g.fillStyle(S.timberLight).fillRect(1094,98,16,44);
  for (let y=102;y<137;y+=9) g.fillStyle(S.timber).fillRect(1094,y,16,2);
  for (let row=0;row<102;row+=3) {
    const half = Math.floor(8+row*1.25);
    g.fillStyle(S.timberDeep).fillRect(1028-half,78+row,half*2,3);
    g.fillStyle(row>79?S.shade:S.light).fillRect(1028-half,72+row,half*2,3);
    if(row>16)g.fillStyle(S.powder).fillRect(1028+Math.floor(row*.38),72+row,Math.max(2,Math.floor(row*.82)),3);
  }
  g.fillStyle(S.drift).fillRect(896,174,264,5);
  for(const [x,h] of [[911,8],[940,5],[992,9],[1077,6],[1139,8]])
    g.fillStyle(S.light).fillRect(x!,174,2,h!);
  g.fillStyle(S.light).fillRect(1088,91,28,6);
  // Door remains exactly where the existing exterior wall says it is; no new entrance.
  g.fillStyle(S.timberDeep).fillRect(998,227,58,78);
  g.fillStyle(S.timber).fillRect(1004,232,46,67);
  g.fillStyle(S.timberLight).fillRect(1006,234,2,59).fillRect(1026,234,2,59);
  g.fillStyle(S.amber).fillRect(1041,268,3,4);
  for (const x of [950,1072]) {
    g.fillStyle(S.amber,.08); softBox(g,x-17,197,68,62,10);
    g.fillStyle(S.timberDeep).fillRect(x-4,207,42,41);
    g.fillStyle(S.amber).fillRect(x,211,34,30);
    g.fillStyle(S.lamp).fillRect(x+3,212,12,22);
    g.fillStyle(S.timber).fillRect(x+16,211,3,31).fillRect(x,226,34,3);
    g.fillStyle(S.timberLight).fillRect(x-5,244,44,4);
    g.fillStyle(S.light).fillRect(x-5,241,44,3);
  }
  g.fillStyle(S.drift).fillRect(991,306,70,8);
  g.fillStyle(S.light).fillRect(988,302,76,5);
  drift(g,906,304,75,17);drift(g,1080,304,70,16);
  const smoke=scene.add.graphics().setDepth(69);
  for(let i=0;i<4;i++) { smoke.fillStyle(S.light,.08+i*.025); pixelOval(smoke,1082-i*9,74-i*17,27+i*7,14); }
}

/** Rendering only. Snow collision, content, audio and progression remain in their owners. */
export function addSnowStyleProof(scene: Phaser.Scene): void {
  bakeGround(scene,'snow-highlands-ground',1280,1024,g=>{
    g.fillStyle(S.powder).fillRect(0,0,1280,1024);
    // Distant, overlapping ridges behind the authored clearing.
    for(let i=0;i<10;i++) {
      g.fillStyle(S.distant); pixelOval(g,i*154-60,34+i%3*18,253,138);
      g.fillStyle(S.shade); pixelOval(g,i*154-65,23+i%3*18,250,130);
      g.fillStyle(S.light); pixelOval(g,i*154-48,28+i%3*18,185,89);
    }
    for (const [x,y,w,h] of [[-44,306,204,74],[170,219,200,45],[432,235,224,63],
      [693,492,131,45],[948,542,271,47],[818,726,245,55],[43,774,251,52],
      [262,884,186,50],[899,942,258,56],[19,968,210,37],[422,358,116,35]]) drift(g,x!,y!,w!,h!);
    // One continuous packed route instead of two contradictory road drawings.
    for(let y=426;y<1024;y+=2) {
      const x = y<475?330+(y-426)*156/49:y<590?486+(y-475)*104/115:
        y<760?590+(y-590)*40/170:630+(y-760)*8/264;
      const cx=Math.round(x);
      g.fillStyle(S.shade).fillRect(cx-32,y,66,2);
      g.fillStyle(S.road).fillRect(cx-25,y,51,2);
      g.fillStyle(S.powder).fillRect(cx-20,y,39,2);
      if(y%26===0)g.fillStyle(S.track).fillRect(cx-9,y,3,5).fillRect(cx+6,y+8,3,5);
    }
    // A light foot trail joins the car to the cabin without implying another hard road.
    for(let i=0;i<30;i++) {
      const x=653+i*13,y=454-Math.floor(i*2.9);
      g.fillStyle(S.shade).fillRect(x,y,3,5).fillRect(x+6,y+5,3,4);
    }
    for (const [x,y,w] of [[292,410,84],[830,600,124]]) {
      g.fillStyle(S.distant);softBox(g,x!,y!,w!,y===410?30:46,4);
      g.fillStyle(S.drift).fillRect(x!+4,y!+11,w!-8,5);
      drift(g,x!-5,y!-9,w!+10,24);
    }
    frozenLake(g);
    // Quiet cluster texture leaves the play spaces bright and legible.
    for(let i=0;i<135;i++) {
      const x=32+(i*173)%1190,y=195+(i*127)%800;
      if(x>88&&x<463&&y>530&&y<733)continue;
      g.fillStyle(i%3?S.shade:S.light,.65).fillRect(x,y,7+i%7,1).fillRect(x+4,y-2,5,1);
      if(i%9===0)g.fillStyle(S.drift).fillRect(x+3,y-4,1,4).fillRect(x+7,y-3,1,3);
    }
  });
  PINES.forEach(([x,y],i)=>pine(scene.add.graphics().setDepth(y),x,y,i));
  cabin(scene);
  for(const [x,y] of [[510,550],[536,593],[574,637],[611,688]]){
    const g=scene.add.graphics().setDepth(y!+23);
    g.fillStyle(S.timber).fillRect(x!,y!,3,23);
    g.fillStyle(S.light).fillRect(x!-3,y!-2,9,3);
  }
  const snow=scene.add.graphics().setDepth(4800),fog=scene.add.graphics().setDepth(4799);
  const update=(time:number):void=>{
    fog.clear();
    for(let i=0;i<4;i++) {
      const x=((i*373-Math.floor(time/90))%1560+1560)%1560-280,y=154+i%3*227;
      fog.fillStyle(S.light,.035);pixelOval(fog,x,y,350,47);
      fog.fillStyle(S.light,.035);pixelOval(fog,x+37,y+9,248,24);
    }
    snow.clear().fillStyle(S.light,.72);
    for(let i=0;i<58;i++)snow.fillRect((i*137+Math.floor(time/70))%1320-20,
      (i*89+Math.floor(time/55))%1044-20,i%5===0?2:1,i%4===0?2:1);
  };
  scene.events.on('update',update);
  scene.events.once('shutdown',()=>scene.events.off('update',update));
}
