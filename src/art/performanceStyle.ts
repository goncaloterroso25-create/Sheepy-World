import type Phaser from 'phaser';
import { createPixelTexture } from './textureFactory';
import { pixelOval, softBox } from './styleProofShapes';
import { PORTO as C, nightLamp } from './portoUrban';
import { gardenPlant } from './portoGardens';

// Existing audience anchors: keep the same 28 people and clear center aisle.
export const PERFORMANCE_AUDIENCE = [
  [604,704],[637,709],[679,702],[716,711],[808,705],[846,713],[884,702],[918,710],
  [614,742],[654,735],[695,746],[724,737],[806,745],[842,736],[881,747],[913,738],
  [625,775],[665,786],[706,773],[817,781],[856,772],[900,785],
  [608,816],[652,807],[697,819],[826,811],[869,821],[916,809],
] as const;
export const PERFORMANCE_PLAYERS = [670,714,758,802,846] as const;

/** Local 24×36 audience drawings, never replacements for shared NPC keys. */
export function drawPerformanceFan(g: Phaser.GameObjects.Graphics, variant: number): void {
  const height=[30,33,28,32,29,34,31,30][variant%8]!, top=35-height;
  const width=[10,11,14,10,12,11,13,10][variant%8]!, x=12-Math.floor(width/2);
  const skin=[0xd3a083,0x976950,0xe3bd9b,0xb98167][variant%4]!;
  const hair=[0x39303b,0x82584a,0xc3af8b,0x352d35,0x61565c][variant%5]!;
  const coat=[0x836b85,0x4f7876,0x9a775b,0x626480,0x824f66,0x738275][variant%6]!;
  g.fillStyle(C.ink).fillRect(x,32,5,3).fillRect(x+width-5,32,5,3);
  g.fillStyle(0x3c4254).fillRect(x+1,top+20,4,32-top-19).fillRect(x+width-5,top+20,4,32-top-19);
  g.fillStyle(C.ink);softBox(g,x-1,top+10,width+2,14,2);
  g.fillStyle(coat);softBox(g,x,top+10,width,13,2);
  g.fillStyle(0xc7adac,.35).fillRect(x+2,top+11,width-4,1);
  g.fillStyle(coat).fillRect(x-2,top+13,3,8).fillRect(x+width-1,top+13,3,8);
  g.fillStyle(skin).fillRect(x-2,top+21,2,3).fillRect(x+width,top+21,2,3);
  g.fillStyle(skin);softBox(g,8,top+2,9,10,2);
  g.fillStyle(hair);softBox(g,7,top,11,12,3);
  if(variant%4===0) { // A profile turned toward a neighbour, still stage-facing.
    g.fillStyle(skin).fillRect(7,top+5,3,5).fillRect(6,top+7,2,2);
    g.fillStyle(C.ink).fillRect(7,top+6,1,1);
  }
  if(variant%4===1)g.fillRect(15,top+5,3,13).fillRect(16,top+16,2,2);
  if(variant%4===2)for(const [dx,dy]of [[6,2],[8,-1],[14,0],[17,3]])softBox(g,dx!,top+dy!,4,5,1);
  if(variant%4===3)g.fillRect(13,top-2,5,4);
  g.fillStyle(0xd7bb9c,.22).fillRect(9,top+2,5,2);
  g.fillStyle(0x292b3a,.4).fillRect(x+width-2,top+14,1,8);
}

/** Five original performance silhouettes: bass, guitar, singer, drums, keys.
 * Posture/instruments are the read; no claims of portrait-level band likeness. */
export function drawPerformancePerformer(g: Phaser.GameObjects.Graphics, role: number): void {
  const top=[2,5,3,7,3][role]!, shirt=[0x647c87,0xa87968,0xd0bb99,0x866582,0x657b6e][role]!;
  const hair=[0x45373b,0x624237,0x302b38,0x332c33,0x916b51][role]!;
  g.fillStyle(C.ink).fillRect(9,30,5,5).fillRect(20,30,5,5);
  g.fillStyle(0x42495e).fillRect(10,top+19,5,31-top-18).fillRect(19,top+19,5,31-top-18);
  g.fillStyle(C.ink);softBox(g,8,top+10,17,13,2);
  g.fillStyle(shirt);softBox(g,9,top+11,15,11,2);
  g.fillStyle(0xe9caaf,.4).fillRect(11,top+11,3,8);
  g.fillStyle(0xd5a082);softBox(g,12,top+2,10,10,2);
  g.fillStyle(hair);softBox(g,11,top,12,6,2);
  if(role===1)g.fillRect(10,top+3,3,7).fillRect(21,top+3,3,7);
  if(role===3)g.fillRect(20,top+5,3,12);
  g.fillStyle(C.ink).fillRect(14,top+6,1,1).fillRect(19,top+6,1,1);
  g.fillStyle(0x855b53).fillRect(16,top+9,3,1);
  g.fillStyle(shirt).fillRect(6,top+12,4,7).fillRect(23,top+12,4,7);
  if(role===0||role===1){
    g.fillStyle(C.ink).fillRect(12,top+12,2,10); // strap
    g.fillStyle(role===0?0x704e58:0xb48164);softBox(g,12,top+18,11,10,3);
    g.fillStyle(0xdbad7c).fillRect(18,top+19,13,3).fillRect(28,top+16,3,3);
    g.fillStyle(0x3a303b).fillRect(17,top+21,3,3);
    g.fillStyle(0xe6b796).fillRect(10,top+19,4,3).fillRect(25,top+17,3,3);
    g.fillStyle(0xf0d0a0).fillRect(20,top+20,10,1);
  }else if(role===2){
    g.fillStyle(0xd5a082).fillRect(24,top+13,3,4).fillRect(21,top+12,5,2);
    g.fillStyle(C.ink).fillRect(22,top+10,2,24).fillRect(17,34,12,1).fillRect(19,top+10,7,2);
    g.fillStyle(C.cap).fillRect(20,top+10,3,1);
  }else if(role===3){
    g.fillStyle(0xc1a580).fillRect(5,top+14,11,1).fillRect(20,top+12,12,1);
    g.fillStyle(C.ink).fillRect(5,top+17,1,16).fillRect(30,top+17,1,16);
    g.fillStyle(0xc1a580);pixelOval(g,1,top+16,11,3);pixelOval(g,25,top+16,10,3);
    g.fillStyle(0x88566e);softBox(g,11,top+21,16,12,3);
    g.fillStyle(0xd4bdaa);pixelOval(g,13,top+22,12,9);
    g.fillStyle(0x514755);pixelOval(g,16,top+25,6,5);
  }else{
    g.fillStyle(C.ink).fillRect(4,top+20,27,5).fillRect(8,top+25,2,9).fillRect(27,top+25,2,9);
    g.fillStyle(0xd1c9bd).fillRect(5,top+20,25,3);
    for(let x=8;x<29;x+=4)g.fillStyle(C.ink).fillRect(x,top+20,1,2);
    g.fillStyle(0xd5a082).fillRect(10,top+18,3,3).fillRect(24,top+18,3,3);
  }
}

export function addPerformanceShell(scene: Phaser.Scene): void {
  const g=scene.add.graphics().setDepth(665);
  g.fillStyle(C.ink,.55);pixelOval(g,584,646,360,39);
  // Copper shell, nested stepped ribs and shadowed rear wall; no dormant logo.
  for(let row=0;row<9;row++){
    const inset=(8-row)*13;
    g.fillStyle(row%2?0x587f80:0x648989).fillRect(594+inset,476+row*10,340-inset*2,11);
    g.fillStyle(0x92a69b).fillRect(595+inset,476+row*10,338-inset*2,2);
  }
  g.fillStyle(0x303747).fillRect(608,566,310,90);
  g.fillStyle(0x494759).fillRect(620,570,284,54);
  for(let x=627;x<899;x+=12)g.fillStyle(0x3d3d50).fillRect(x,573,3,48);
  g.fillStyle(0x76777e).fillRect(594,552,14,114).fillRect(918,552,16,114);
  g.fillStyle(0xb0a69a).fillRect(595,553,3,109).fillRect(920,553,3,109);
  g.fillStyle(0x605464).fillRect(606,628,317,28);
  for(let y=631;y<656;y+=6)g.fillStyle(0x88737b).fillRect(610,y,309,1);
  for(let x=622;x<916;x+=31)g.fillStyle(0x4a4355).fillRect(x,630,1,23);
  g.fillStyle(0x292b3a).fillRect(606,654,317,14);
  g.fillStyle(0x9a8585).fillRect(605,653,319,3);
  g.fillStyle(0x62596b).fillRect(730,668,70,4).fillRect(722,672,86,4);
  g.fillStyle(0x9a8585).fillRect(730,668,70,1).fillRect(722,672,86,1);
  for(const x of [617,889]) {
    g.fillStyle(C.ink);softBox(g,x,592,22,55,2);
    g.fillStyle(0x484353).fillRect(x+3,595,16,47);
    g.fillStyle(0x232632);pixelOval(g,x+5,602,12,12);pixelOval(g,x+4,622,14,16);
    g.fillStyle(0x726777).fillRect(x+3,595,16,1).fillRect(x+3,641,16,1);
  }
  for(const x of [647,864]) {
    g.fillStyle(C.ink).fillRect(x,631,20,15);
    g.fillStyle(0x6e626e).fillRect(x+2,633,16,2);
    for(let i=0;i<4;i++)g.fillStyle(0x45404f).fillRect(x+3,637+i*2,14,1);
  }
  for(const [x,y]of [[685,650],[817,650]]) {
    g.fillStyle(0x272a38).fillRect(x!,y!,27,1).fillRect(x!+26,y!-7,1,8).fillRect(x!+8,y!+2,19,1);
  }
  // Anonymous prepared stands/cases remain in all venue states.
  g.fillStyle(C.ink).fillRect(710,641,24,7).fillRect(821,641,21,7);
  g.fillStyle(0x8d8090).fillRect(711,641,22,1).fillRect(822,641,19,1);
  for(const [x,y]of [[568,694],[955,700],[560,756],[963,764]] as const)gardenPlant(scene,x,y);
  for(const [x,y]of [[572,662],[950,666],[605,734],[918,735]] as const)nightLamp(scene,x,y);
  scene.add.image(595,724,'person-apron-0').setOrigin(.5,1).setDepth(724);
  scene.add.image(936,726,'person-reader-0').setOrigin(.5,1).setDepth(726);
}

export function addPerformancePerformance(scene: Phaser.Scene): { refresh(active: boolean, restored: boolean): void } {
  for(let i=0;i<12;i++)createPixelTexture(scene,`porto-fan-${i}`,24,36,g=>drawPerformanceFan(g,i));
  for(let i=0;i<5;i++)createPixelTexture(scene,`porto-performer-${i}`,36,40,g=>drawPerformancePerformer(g,i));
  const crowd=scene.add.container(0,0).setDepth(682).setName('porto-performance-audience');
  PERFORMANCE_AUDIENCE.forEach(([x,y],i)=>{
    const fan=scene.add.image(x,y,`porto-fan-${i%12}`).setOrigin(.5,1);crowd.add(fan);
    scene.tweens.add({targets:fan,y:y-1,duration:500+i%4*120,delay:i*93,yoyo:true,repeat:-1,ease:'Stepped',easeParams:[1]});
  });
  const performers=scene.add.container(0,0).setDepth(680).setName('porto-performance-performers');
  PERFORMANCE_PLAYERS.forEach((x,i)=>performers.add(scene.add.image(x,646,`porto-performer-${i}`).setOrigin(.5,1)));
  const light=scene.add.graphics().setDepth(666).setName('porto-performance-light');
  const spill=scene.add.graphics().setDepth(-75).setName('porto-performance-spill');
  let previous='';
  return {refresh(active,restored){
    crowd.setVisible(active);performers.setVisible(active);
    const key=`${active}-${restored}`;if(key===previous)return;previous=key;
    light.clear();spill.clear();light.setVisible(active);spill.setVisible(active);
    if(!active)return;
    for(const [x,color]of [[665,0xc97b86],[760,0xeac69a],[854,0xa88abe]] as const){
      light.fillStyle(color,restored?.08:.13);pixelOval(light,x-20,620,40,32);
      light.fillStyle(color,.35);pixelOval(light,x-18,638,36,10);
      light.fillStyle(C.ink).fillRect(x-6,562,12,7);
      light.fillStyle(color).fillRect(x-4,565,8,3);
      spill.fillStyle(color,restored?.06:.1);pixelOval(spill,x-32,670,64,28);
    }
    // Small remembered lamp line; no broad translucent cones or screen tint.
    if(restored)for(const x of [637,704,824,891])light.fillStyle(C.warm).fillRect(x,655,2,2);
  }};
}
