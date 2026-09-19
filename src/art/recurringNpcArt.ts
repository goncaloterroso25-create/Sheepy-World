import type Phaser from 'phaser';
import { characterContact, characterFace } from './characterFoundation';
import { clothLimb, shoe, silhouette } from './humanPixelGrammar';
import { pixelOval, softBox } from './styleProofShapes';

export const GRANDMA_HAIR = { edge:0x251e23, base:0x302321, light:0x513b32 } as const;

/** Existing 28×40 cameos and sole line. Only the two authored idle gestures vary. */
export function drawGrandma(g:Phaser.GameObjects.Graphics,frame:number):void {
  const hair=GRANDMA_HAIR;
  characterContact(g,4,37,20);
  shoe(g,7,37,6);shoe(g,16,37,6);
  g.fillStyle(0x443746);silhouette(g,4,24,[[3,13,2],[2,15,4],[1,17,5],[2,15,2]]);
  g.fillStyle(0x796378);silhouette(g,6,25,[[2,10,2],[1,12,4],[0,14,5]]);
  g.fillStyle(0xa28697).fillRect(9,28,2,6).fillRect(18,29,1,5);
  // Rounded shoulders and a soft shawl, not an age-by-grey-hair shorthand.
  g.fillStyle(0x514151);silhouette(g,4,19,[[5,10,1],[2,16,2],[1,18,4],[2,16,3]]);
  g.fillStyle(0xa58b96);silhouette(g,5,20,[[4,11,1],[1,17,2],[0,6,3],[1,4,2]]);
  g.fillRect(19,22,3,5);
  g.fillStyle(0xcdb5a5).fillRect(12,21,5,2);
  g.fillStyle(0xc2a575).fillRect(17,24,2,2);
  g.fillStyle(0xe2b79a).fillRect(7,28,4,3);
  const handY=frame?20:24;
  g.fillStyle(0x796378).fillRect(22,handY+2,2,6);
  g.fillStyle(0xe2b79a);softBox(g,22,handY,3,4,1);
  g.fillStyle(hair.edge);pixelOval(g,14,9,8,7);pixelOval(g,6,12,17,11);
  characterFace(g,8,15,13,10,0xe2b79a);
  g.fillStyle(0xc49380).fillRect(9,22,2,1).fillRect(18,22,2,1);
  g.fillStyle(hair.base);silhouette(g,7,12,[[4,8,1],[1,13,2],[0,6,2],[0,3,3]]);
  g.fillRect(20,15,2,5);
  g.fillStyle(hair.light).fillRect(16,10,4,1).fillRect(10,13,7,1).fillRect(8,15,2,1);
  g.fillStyle(0x63483f).fillRect(11,18,2,1).fillRect(16,18,2,1);
  g.fillStyle(0x302e38).fillRect(11,20,2,1).fillRect(17,20,2,1);
  g.fillStyle(0xb77770).fillRect(13,23,4,1);
  g.fillStyle(0xf5ceb0).fillRect(14,24,2,1);
}

export function drawLisbon(g:Phaser.GameObjects.Graphics,frame:number):void {
  characterContact(g,5,37,18);
  const suit={edge:0x2d303c,base:0x464958,light:0x676877};
  clothLimb(g,9,26,9,36,4,4,suit);shoe(g,8,37,5);
  clothLimb(g,15,26,15,36,4,4,suit);shoe(g,15,37,5);
  g.fillStyle(0x24232e);silhouette(g,6,6,[[5,7,1],[2,12,2],[1,14,4],[0,15,9],[1,13,5]]);
  g.fillStyle(suit.edge);silhouette(g,6,18,[[3,10,1],[1,14,3],[2,12,6],[3,10,2]]);
  g.fillStyle(suit.base);silhouette(g,8,19,[[1,10,3],[0,11,4],[1,9,3]]);
  g.fillStyle(0x8d6679).fillRect(12,18,4,7);
  g.fillStyle(0xb8a697).fillRect(13,19,2,1).fillRect(14,21,1,2);
  g.fillStyle(suit.light).fillRect(10,19,2,3).fillRect(17,19,2,3);
  g.fillStyle(0x30313b).fillRect(13,27,5,1);
  clothLimb(g,6,20,6,28,3,3,suit);clothLimb(g,20,20,20,28,3,3,suit);
  g.fillStyle(0xe4ae93).fillRect(6,29,3,3).fillRect(20,29+frame,3,3);
  characterFace(g,9,10,11,10,0xe4ae93);
  g.fillStyle(0xc58f80).fillRect(18,16,2,2);
  g.fillStyle(0x322c36);silhouette(g,7,7,[[4,8,1],[1,12,2],[0,7,2],[0,4,3]]);
  g.fillRect(19,10,2,9).fillRect(7,16,2,5).fillRect(19,19,2,3);
  g.fillStyle(0x55434c).fillRect(11,8,6,1).fillRect(8,12,1,5).fillRect(20,14,1,4);
  g.fillStyle(0x46343d).fillRect(11,13,2,1).fillRect(16,13,2,1);
  g.fillStyle(0x34333d).fillRect(11,15,2,1).fillRect(16,15,2,1);
  g.fillStyle(0x966775).fillRect(14,18,3,1);
}

export type RecurringNpc = 'grandma'|'jane'|'lisbon';
/** Same 64×72 crops/keys as before; stepped silhouettes and restrained face ramps. */
export function drawRecurringPortrait(g:Phaser.GameObjects.Graphics,id:RecurringNpc,expressive:boolean):void {
  const grandma=id==='grandma',jane=id==='jane';
  const ink=0x30313c,skin=grandma?0xe5b79a:jane?0xe8bd9b:0xe4ae93;
  const shade=grandma?0xc49481:jane?0xc9977f:0xc28c7c;
  const hair=jane?0xc6a06c:grandma?GRANDMA_HAIR.base:0x312a34;
  g.fillStyle(jane?0x747b7c:grandma?0x81707e:0x6d727f).fillRect(0,0,64,72);
  g.fillStyle(jane?0x9a9b8e:grandma?0xab9199:0x8e969b);pixelOval(g,3,3,58,67);
  g.fillStyle(jane?0xb8ae94:grandma?0xc1a59e:0xa3a9a5);pixelOval(g,9,6,42,45);
  // Hair under shoulders/face first: Lisbon's composed long sweep vs Jane's curls.
  g.fillStyle(jane?0x84654d:grandma?GRANDMA_HAIR.edge:0x24232d);
  pixelOval(g,13,7,39,43);
  if(!jane&&!grandma){pixelOval(g,10,28,15,35);pixelOval(g,41,25,13,39);}
  if(grandma){pixelOval(g,35,3,17,17);g.fillStyle(hair);pixelOval(g,36,5,13,13);}
  g.fillStyle(ink);softBox(g,5,54,55,18,5);
  g.fillStyle(grandma?0x81677e:jane?0x515360:0x454856);softBox(g,8,54,50,18,5);
  g.fillStyle(grandma?0xb194a0:jane?0x757782:0x626575).fillRect(10,60,3,12).fillRect(53,59,2,13);
  g.fillStyle(shade);softBox(g,26,43,13,17,3);
  g.fillStyle(skin).fillRect(29,46,8,12);
  g.fillStyle(grandma?0xc9ae9d:jane?0xe5deca:0x8b6377);
  silhouette(g,23,55,[[2,16,2],[4,12,3],[6,8,5],[7,6,7]]);
  if(jane){g.fillStyle(0xafb4a9).fillRect(23,54,5,4).fillRect(38,55,5,4);g.fillStyle(0xc3bcaa).fillRect(34,66,2,2);}
  if(!jane&&!grandma){g.fillStyle(0xc9bea5).fillRect(32,56,2,7).fillRect(30,61,5,2);}
  if(grandma){
    g.fillStyle(0xb89da7);silhouette(g,8,52,[[12,5,2],[5,13,2],[1,16,3],[0,11,4],[2,6,3]]);
    g.fillRect(42,54,7,4).fillRect(46,58,7,7);
    g.fillStyle(0xd7ba85).fillRect(44,60,3,3);
  }
  g.fillStyle(shade);pixelOval(g,18,16,30,35);
  g.fillStyle(skin);pixelOval(g,19,17,27,32);
  g.fillStyle(jane?0xf4d1b0:0xf1c9a9);pixelOval(g,21,21,18,20);
  g.fillStyle(0xd69b8b);pixelOval(g,21,37,6,4);pixelOval(g,39,37,5,4);
  g.fillStyle(hair);
  if(jane){
    for(const [x,y,w,h] of [[13,16,12,12],[17,9,16,13],[27,6,14,13],[38,10,12,13],[44,19,8,14]])pixelOval(g,x!,y!,w!,h!);
    g.fillStyle(0xe2c58e);pixelOval(g,20,11,11,4);pixelOval(g,32,9,9,4);pixelOval(g,15,18,7,3);
    g.fillStyle(0xac855c).fillRect(20,23,3,5).fillRect(45,27,3,7);
  }else{
    pixelOval(g,14,10,26,14);pixelOval(g,35,12,15,13);
    if(grandma){g.fillRect(16,22,5,11).fillRect(44,23,4,9);}
    else{pixelOval(g,13,20,9,34);pixelOval(g,43,21,9,37);}
    g.fillStyle(grandma?GRANDMA_HAIR.light:0x55444e);pixelOval(g,20,13,13,3);
    g.fillRect(17,25,2,9).fillRect(46,29,2,10);
  }
  const browY=grandma?29:28;
  g.fillStyle(jane?0x786048:0x59423e).fillRect(24,browY,5,1).fillRect(36,browY-(jane&&expressive?1:0),5,1);
  g.fillStyle(ink).fillRect(24,32,4,2).fillRect(37,32,4,2);
  g.fillStyle(jane?0x80969a:0x80614e).fillRect(26,33,2,2).fillRect(37,33,2,2);
  g.fillStyle(0xffdfbd).fillRect(26,32,1,1).fillRect(37,32,1,1);
  g.fillStyle(shade).fillRect(32,37,2,2);
  g.fillStyle(0x9c6570).fillRect(30,43,7,1);
  if(expressive&&(jane||grandma))g.fillRect(28,42,2,1).fillRect(37,42,2,1);
  if(grandma){g.fillStyle(shade).fillRect(22,36,4,1).fillRect(40,36,3,1).fillRect(27,42,1,3).fillRect(39,41,1,3);}
  g.fillStyle(0xf1c9a9).fillRect(31,45,4,1);
}
