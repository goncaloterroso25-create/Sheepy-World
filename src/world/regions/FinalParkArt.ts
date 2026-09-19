import type Phaser from 'phaser';
import { PALETTE as P } from '../../art/palette';
import { FINAL_PARK_HEIGHT, JOURNEY_POCKETS } from '../../data/finalJourney';
import { addSmallText } from '../../ui/PixelFont';
import { bakeGround, blockers } from './RegionArt';
import { createFinalParkFoliage, finalTree } from './FinalParkFoliage';

type G=Phaser.GameObjects.Graphics;

function flowers(g:G,x:number,y:number,tint:number):void {
  for(let i=0;i<6;i++){
    const xx=x+(i*13)%39,yy=y+(i*7)%21;
    g.fillStyle(P.grassDeep).fillRect(xx,yy,2,8);
    g.fillStyle(tint).fillRect(xx-2,yy-2,6,3).fillRect(xx,yy-4,2,7);
    g.fillStyle(P.creamLight).fillRect(xx,yy-1,2,2);
  }
}
export function lantern(scene:Phaser.Scene,x:number,y:number):void {
  const g=scene.add.graphics().setDepth(y);
  g.fillStyle(P.cream,.045).fillCircle(x,y-28,23);
  g.fillStyle(P.woodDeep).fillRect(x-1,y-28,3,29).fillRect(x-7,y-37,15,3);
  g.fillStyle(P.leafGold).fillRect(x-5,y-34,11,13);
  g.fillStyle(P.creamLight).fillRect(x-3,y-32,7,8);
  g.fillStyle(P.woodDeep).fillRect(x-6,y-23,13,3);
}
export function photoStand(scene:Phaser.Scene,x:number,y:number):void {
  const g=scene.add.graphics().setDepth(y);
  g.fillStyle(P.shadowDeep,.18).fillEllipse(x,y+4,42,10);
  g.fillStyle(P.woodDeep).fillRect(x-13,y-26,3,30).fillRect(x+12,y-26,3,30);
  g.fillStyle(P.wood).fillRect(x-22,y-50,44,40);
  g.fillStyle(0xf4ead5).fillRect(x-18,y-47,36,33);
  g.fillStyle(P.waterShade).fillRect(x-15,y-44,30,22);
  g.fillStyle(P.grassLight).fillRect(x-15,y-32,30,10);
  g.fillStyle(P.creamLight).fillRect(x+5,y-41,5,5);
  g.fillStyle(P.plumLight).fillRect(x-9,y-26,4,4).fillRect(x-2,y-28,4,6);
  g.fillStyle(P.leafRed).fillRect(x-2,y-49,4,4);
}
/** Tiny recognisable props, shared by the pre-gate Adventures and their final echoes. */
export function journeyMotif(scene:Phaser.Scene,x:number,y:number,kind:string):void {
  const g=scene.add.graphics().setDepth(y-3);
  g.fillStyle(P.shadowDeep,.14).fillEllipse(x,y,80,14);
  if(kind==='buggy'){
    g.fillStyle(P.jetHair).fillRect(x-33,y-26,12,28).fillRect(x+21,y-26,12,28);
    g.fillStyle(P.woodWarm).fillRect(x-25,y-20,50,20);
    g.lineStyle(3,P.blackClothLight).strokeRect(x-24,y-46,48,28).lineBetween(x-24,y-46,x-15,y-20).lineBetween(x+24,y-46,x+15,y-20);
    g.fillStyle(P.blackCloth).fillRect(x-17,y-31,13,18).fillRect(x+4,y-31,13,18);
    g.fillStyle(P.leafOrange).fillRect(x-23,y-12,46,7);
    g.fillStyle(P.cream).fillRect(x-21,y-11,7,3).fillRect(x+14,y-11,7,3);
  }else if(kind==='festival-clue'){
    g.fillStyle(P.blackCloth).fillRect(x-13,y-7,10,8).fillRect(x+3,y-7,10,8);
    g.fillStyle(P.snowLight).fillRect(x-13,y-30,26,24).fillRect(x-19,y-47,38,17);
    g.fillStyle(P.leafRed).fillRect(x-14,y-28,28,5).fillRect(x-5,y-45,10,18);
    g.fillStyle(P.leafGold).fillRect(x-18,y-46,5,15).fillRect(x+13,y-46,5,15);
    g.fillStyle(P.skin).fillRect(x-10,y-62,20,18);
    g.fillStyle(P.ink).fillRect(x-7,y-58,5,2).fillRect(x+3,y-58,5,2).fillRect(x-6,y-49,13,2);
    g.fillStyle(P.waterDeep).fillTriangle(x-17,y-62,x,y-97,x+17,y-62);
    g.lineStyle(2,P.leafGold).strokeTriangle(x-17,y-62,x,y-97,x+17,y-62);
    g.fillStyle(P.cream).fillRect(x-4,y-76,8,7);
    g.fillStyle(P.grassLight).fillRect(x-23,y-62,7,9).fillRect(x+17,y-62,7,9);
    for(let i=0;i<3;i++)g.fillStyle(P.paperShade).fillRect(x-12,y-22+i*6,25,2);
  }else if(kind==='eclipse'){
    g.fillStyle(P.plumDeep).fillRect(x-41,y-77,82,65);
    g.lineStyle(2,P.paperShade).strokeRect(x-41,y-77,82,65);
    for(let i=0;i<13;i++)g.fillStyle(P.cream).fillRect(x-35+(i*17)%69,y-70+(i*13)%52,1,1);
    g.fillStyle(P.cream,.13).fillCircle(x,y-44,24);
    g.lineStyle(2,P.creamLight).strokeCircle(x,y-44,17);
    g.fillStyle(P.jetHair).fillCircle(x+2,y-46,16);
    g.fillStyle(P.wood).fillRect(x-26,y-11,3,11).fillRect(x+23,y-11,3,11);
  }else if(kind==='snow'){
    g.fillStyle(P.snowShadow).fillEllipse(x,y-1,80,17);
    g.fillStyle(P.snow).fillEllipse(x,y-5,68,14).fillCircle(x,y-16,13).fillCircle(x,y-34,9);
    g.fillStyle(P.jetHair).fillRect(x-4,y-36,2,2).fillRect(x+3,y-36,2,2);
    g.fillStyle(P.leafRed).fillRect(x-10,y-27,21,4).fillRect(x+6,y-25,4,10);
    g.lineStyle(2,P.wood).lineBetween(x-11,y-20,x-25,y-31).lineBetween(x+11,y-20,x+25,y-30);
  }else if(kind==='music'){
    g.fillStyle(P.woodDeep).fillRect(x-40,y-8,80,9);
    g.fillStyle(P.plaster).fillRoundedRect(x-33,y-60,66,52,28);
    g.fillStyle(P.waterShade).fillRoundedRect(x-27,y-54,54,46,24);
    g.fillStyle(P.leafRed).fillRect(x-27,y-25,54,17);
    g.lineStyle(2,P.ink).lineBetween(x,y-40,x,y-9).lineBetween(x-5,y-40,x+4,y-40);
    g.fillStyle(P.cream).fillRect(x-13,y-35,2,12).fillRect(x-13,y-35,9,2).fillCircle(x-15,y-22,3);
  }else if(kind==='climb'){
    g.fillStyle(P.woodDeep).fillRect(x-25,y-84,5,84).fillRect(x+23,y-84,5,84);
    g.fillStyle(P.woodLight).fillRect(x-25,y-84,53,5);
    g.lineStyle(1,P.paper).lineBetween(x,y-80,x,y-12);
    for(let i=0;i<7;i++)g.lineStyle(2,P.woodWarm).lineBetween(x-20,y-70+i*9,x+22,y-70+i*9);
    g.fillStyle(P.leafOrange).fillEllipse(x+33,y-12,23,16).fillRect(x+21,y-9,25,4);
  }else if(kind==='heart'){
    g.fillStyle(P.plumLight).fillRect(x-10,y-26,8,8).fillRect(x+2,y-26,8,8).fillRect(x-7,y-18,14,5).fillRect(x-3,y-13,6,4);
  }else if(kind==='basket'){
    g.fillStyle(P.wood).fillRect(x-28,y-18,56,17);
    g.fillStyle(P.paperShade).fillRect(x-30,y-20,60,4);
    g.fillStyle(P.plumLight).fillRect(x-23,y-16,46,11);
  }else{
    const couch=kind==='couch';
    g.fillStyle(couch?P.plumDeep:P.woodDeep).fillRect(x-36,y-31,72,31);
    g.fillStyle(couch?P.plumLight:P.woodLight).fillRect(x-34,y-28,68,9).fillRect(x-34,y-13,68,8);
    g.fillStyle(P.paper).fillRect(x+15,y-21,16,13);
    g.fillStyle(P.woodDeep).fillRect(x-30,y-4,4,8).fillRect(x+26,y-4,4,8);
  }
}
export function buildJourneyPark(scene:Phaser.Scene):Phaser.Physics.Arcade.StaticGroup {
  createFinalParkFoliage(scene);
  bakeGround(scene,'final-park-6c1-ground',640,FINAL_PARK_HEIGHT,g=>{
    g.fillStyle(P.grassDeep).fillRect(0,0,640,FINAL_PARK_HEIGHT);
    g.fillStyle(P.grassShade).fillRect(32,70,576,FINAL_PARK_HEIGHT-70);
    for(let y=180;y<FINAL_PARK_HEIGHT;y+=83){
      for(const x of [36,584]){
        g.fillStyle(P.grass,.35).fillEllipse(x+(y%29),y,190,155);
        g.fillStyle(P.grassDeep,.35).fillEllipse(x,y+30,100,72);
      }
    }
    for(const pocket of JOURNEY_POCKETS){
      const snow=pocket.motif==='snow',quiet=pocket.motif==='eclipse';
      g.fillStyle(quiet?0x485757:snow?0x85958b:P.grass).fillEllipse(320,pocket.y-25,410,165);
      g.fillStyle(quiet?0x516365:snow?0xa0b1a6:P.grassWarm,.35).fillEllipse(320,pocket.y-25,360,120);
    }
    for(let y=350;y<FINAL_PARK_HEIGHT;y+=8){
      const x=312+Math.round(Math.sin(y/160)*20);
      g.fillStyle(P.pathShade).fillRect(x-37,y,88,8);
      g.fillStyle(P.path).fillRect(x-32,y,78,8);
      g.fillStyle(P.pathLight,.22).fillRect(x-26,y+2,65,3);
      if(y%24===0)for(const edge of [-40,47]){
        g.fillStyle(P.grassWarm).fillRect(x+edge,y,4,6).fillRect(x+edge+3,y+4,3,5);
        g.fillStyle(P.paperShade).fillRect(x+edge-1,y+10,3,2);
      }
      if(y%24===0)g.fillStyle(P.pathShade).fillRect(x+12,y+2,13,1);
    }
    for(let i=0;i<1300;i++){
      const x=72+(i*67)%492,y=120+(i*113)%2640;
      if(x>257&&x<380)continue;
      g.fillStyle(i%3?P.grassLight:P.leafGold,.35).fillRect(x,y,2,2);
      if(i%6===0)g.fillStyle(P.grassDeep).fillRect(x-2,y-3,1,3).fillRect(x+3,y-4,1,4);
    }
    for(const pocket of JOURNEY_POCKETS){
      flowers(g,122,pocket.y+20,P.plumLight);flowers(g,466,pocket.y+7,P.cream);
      g.fillStyle(P.path).fillRect(206,pocket.y-5,220,25);
      g.fillStyle(P.pathLight,.35).fillRect(213,pocket.y+1,203,12);
    }
    g.fillStyle(P.waterDeep).fillRect(32,52,576,58);
    g.fillStyle(P.waterShade).fillRect(46,59,548,44);
    for(let x=65;x<580;x+=29)g.fillStyle(P.waterGlint,.45).fillRect(x,77+(x%3)*6,14,1);
    // Golden light is layered in crisp translucent bands, never a blur filter.
    g.fillStyle(0xb6b575,.22).fillEllipse(320,233,480,310);
    g.fillStyle(P.grass).fillEllipse(320,243,440,275);
    g.fillStyle(P.grassWarm).fillEllipse(320,249,342,210);
    g.fillStyle(P.pathLight).fillEllipse(320,277,225,127);
    g.fillStyle(P.cream,.12).fillEllipse(322,264,206,106);
    g.fillStyle(P.shadowWarm,.18).fillEllipse(327,242,88,15);
    for(let i=0;i<32;i++){
      const x=235+(i*19)%177,y=183+(i*31)%160;
      g.fillStyle(i%2?P.cream:0xca9d9a,.8).fillRect(x,y,3,1);
    }
    for(let i=0;i<14;i++)flowers(g,133+(i*47)%335,143+(i*37)%209,i%2?P.plumLight:P.cream);
    // Handwoven cloth, wrappers and the traces of an unhurried lunch.
    g.fillStyle(P.paperShadow).fillRect(263,254,115,63);
    g.fillStyle(P.snowLight).fillRect(266,255,109,59);
    for(let y=259;y<314;y+=11)g.fillStyle(P.plumLight).fillRect(266,y,109,2);
    for(let x=274;x<375;x+=13)g.fillStyle(P.plumLight).fillRect(x,255,2,59);
    for(const x of [277,351]){
      g.fillStyle(P.woodWarm).fillRect(x,262,15,21);
      g.fillStyle(P.paperShade).fillRect(x-1,260,17,19);
      g.fillStyle(P.leafRed).fillRect(x+2,269,10,5);
      g.fillStyle(P.cream).fillRect(x+3,258,9,3);
    }
    g.fillStyle(P.creamLight).fillRect(302,281,18,11).fillRect(333,296,16,9);
    g.fillStyle(P.leafGold).fillRect(305,281,13,4).fillRect(308,278,2,9).fillRect(312,277,2,9);
    g.fillStyle(P.woodWarm).fillEllipse(336,301,12,5);
  });
  for(let y=230;y<2860;y+=150)for(const [i,x]of [54,588].entries()){
    finalTree(scene,x+(y%17)-8,y+(i?44:0),Math.floor(y/150)%3);
    scene.add.image(x+(i?-35:35),y+14,'final-fern').setDepth(y+14);
  }
  for(const [x,y,v]of [[158,214,1],[488,199,1],[131,352,0],[526,377,0],[220,132,2],[415,127,2]]){
    finalTree(scene,x!,y!,v!);
  }
  for(const pocket of JOURNEY_POCKETS){
    for(const x of [126,514])scene.add.image(x,pocket.y+23,'final-fern').setDepth(pocket.y+24);
    // A few flat stepping stones lead out of each clearing into the next.
    const stones=scene.add.graphics().setDepth(-85);
    for(let i=0;i<3;i++)stones.fillStyle(P.stoneLight,.25).fillEllipse(322+(i%2)*9,pocket.y-100-i*17,21,7);
  }
  for(const pocket of JOURNEY_POCKETS){
    photoStand(scene,215,pocket.y);journeyMotif(scene,449,pocket.y-20,pocket.motif);
    lantern(scene,154,pocket.y+46);lantern(scene,494,pocket.y+46);
  }
  journeyMotif(scene,320,232,'bench');
  scene.add.image(299,301,'cof-mug').setDepth(303);
  scene.add.image(347,286,'cof-mug').setDepth(288);
  lantern(scene,212,341);lantern(scene,430,319);lantern(scene,235,175);lantern(scene,467,213);
  const sign=scene.add.graphics().setDepth(148);
  sign.fillStyle(P.woodDeep).fillRect(279,131,82,17).fillRect(286,145,3,9).fillRect(352,145,3,9);
  sign.fillStyle(P.wood).fillRect(281,133,78,13);
  addSmallText(scene,320,134,'MEMORY PARK',P.cream).setOrigin(.5,0).setDepth(149);
  const arch=scene.add.graphics().setDepth(2691);
  arch.fillStyle(P.woodDeep).fillRect(243,2630,5,63).fillRect(392,2630,5,63);
  arch.lineStyle(2,P.woodLight).lineBetween(246,2632,318,2616).lineBetween(318,2616,394,2632);
  for(let i=0;i<7;i++)flowers(arch,238+i*20,2622-Math.min(i,6-i)*4,P.plumLight);
  addSmallText(scene,320,2714,'FOR YOU. THIS WAY.',P.creamLight).setOrigin(.5).setDepth(2715);
  return blockers(scene,[{x:0,y:0,width:640,height:115},{x:284,y:201,width:72,height:23}]);
}
