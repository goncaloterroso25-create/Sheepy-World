import type Phaser from 'phaser';
import type { HomeFurniture } from '../world/regions/HomeLayout';
import { HOME_PROOF as H } from './styleProofPalette';
import { pixelOval, softBox } from './styleProofShapes';

/** Home-only silhouettes. Contact bases and depth anchors still come from HomeLayout. */
export function homeProofFurniture(scene: Phaser.Scene, f: HomeFurniture): void {
  const {x,y,width:w,height:h,kind}=f;
  const g=scene.add.graphics().setDepth(y+h);
  g.fillStyle(H.shadow,.22);softBox(g,x+3,y+6,w+3,h,4);
  if(kind==='bed') {
    g.fillStyle(H.woodDeep);softBox(g,x,y-15,w,h+17,3);
    g.fillStyle(H.wood);softBox(g,x+3,y-17,w-6,27,5);
    g.fillStyle(H.woodEdge).fillRect(x+8,y-17,w-16,2);
    for(let dx=12;dx<w-8;dx+=18)g.fillStyle(H.woodLight).fillRect(x+dx,y-12,2,15);
    g.fillStyle(H.linen);softBox(g,x+3,y+2,w-6,h-7,4);
    g.fillStyle(H.cream);softBox(g,x+5,y+2,w-10,h-12,4);
    const pillows=w>100?2:1, pw=Math.floor((w-20)/pillows);
    for(let i=0;i<pillows;i++) {
      g.fillStyle(H.linen);softBox(g,x+10+i*pw,y+9,pw-3,23,3);
      g.fillStyle(H.cream);softBox(g,x+11+i*pw,y+7,pw-5,20,3);
      g.fillStyle(H.trim).fillRect(x+14+i*pw,y+9,pw-12,1);
    }
    const sage=f.tone==='sage',base=sage?H.sage:H.cloth,shade=sage?H.sageDeep:H.clothDeep;
    g.fillStyle(shade);softBox(g,x+4,y+36,w-8,h-37,3);
    g.fillStyle(base).fillRect(x+7,y+34,w-14,h-42);
    g.fillStyle(sage?H.sageLight:H.clothLight).fillRect(x+7,y+35,w-14,6);
    for(let dx=16;dx<w-8;dx+=22) {
      g.fillStyle(shade,.35).fillRect(x+dx,y+44,2,h-58);
      g.fillStyle(sage?H.sageLight:H.clothLight).fillRect(x+dx-2,y+47,1,h-66);
    }
    g.fillStyle(H.linen).fillRect(x+4,y+33,w-8,3);
    g.fillStyle(H.woodDeep).fillRect(x+5,y+h-3,7,7).fillRect(x+w-12,y+h-3,7,7);
    return;
  }
  if(kind==='couch') {
    // North-facing: cushions peek over the back, leaving the TV relationship intact.
    g.fillStyle(H.woodDeep).fillRect(x+10,y+h-2,8,6).fillRect(x+w-18,y+h-2,8,6);
    g.fillStyle(H.clothDeep);softBox(g,x,y-9,w,h+8,5);
    g.fillStyle(H.cloth);softBox(g,x+5,y-11,w-10,h+2,5);
    g.fillStyle(H.clothLight);softBox(g,x+10,y-12,w-20,10,3);
    g.fillStyle(H.cloth).fillRect(x+11,y-5,w-22,7);
    for(const dx of [Math.floor(w/3),Math.floor(w*2/3)]) {
      g.fillStyle(H.clothDeep).fillRect(x+dx,y-7,2,32);
      g.fillStyle(H.clothLight).fillRect(x+dx+2,y+3,1,20);
    }
    for(const dx of [0,w-13]) {
      g.fillStyle(H.clothDeep);softBox(g,x+dx,y-3,13,h+1,3);
      g.fillStyle(H.clothLight);softBox(g,x+dx+2,y-5,9,10,2);
    }
    g.fillStyle(H.linen).fillRect(x+20,y-11,29,38);
    g.fillStyle(H.cream).fillRect(x+22,y-11,25,30);
    for(let dx=24;dx<46;dx+=6)g.fillStyle(H.linen).fillRect(x+dx,y-10,1,31);
    for(let dx=23;dx<48;dx+=4)g.fillStyle(H.cream).fillRect(x+dx,y+26,1,4);
    g.fillStyle(H.rose);softBox(g,x+w-38,y-15,18,13,3);
    g.fillStyle(H.clothLight).fillRect(x+w-35,y-13,11,2);
    return;
  }
  if(['bath','basin','toilet'].includes(kind)) {
    g.fillStyle(H.tile);softBox(g,x,y,w,h,5);
    g.fillStyle(H.ceramic);softBox(g,x+2,y-2,w-4,h-2,5);
    g.fillStyle(H.cream);softBox(g,x+4,y-2,w-8,h-6,5);
    g.fillStyle(H.tile);softBox(g,x+8,y+8,w-16,h-18,4);
    g.fillStyle(H.sageLight);softBox(g,x+10,y+10,w-20,h-23,4);
    g.fillStyle(H.ceramic).fillRect(x+12,y+12,2,Math.max(3,h-32));
    g.fillStyle(H.shadow).fillRect(x+w-17,y+12,3,2);
    if(kind==='bath') {
      g.fillStyle(H.brass).fillRect(x+w-15,y+3,3,10).fillRect(x+w-20,y+3,8,3);
      g.fillStyle(H.clothLight).fillRect(x+4,y+h-33,17,23);
      g.fillStyle(H.cloth).fillRect(x+6,y+h-14,13,5);
    }
    if(kind==='toilet') {
      g.fillStyle(H.tile);softBox(g,x-1,y-10,w+2,19,3);
      g.fillStyle(H.ceramic);softBox(g,x,y-12,w,17,3);
      g.fillStyle(H.brass).fillRect(x+w-10,y-8,5,2);
      g.fillStyle(H.cream);pixelOval(g,x+3,y+10,w-6,h-15);
      g.fillStyle(H.tile);pixelOval(g,x+8,y+16,w-16,h-27);
    }
    if(kind==='basin') {
      g.fillStyle(H.woodDeep);softBox(g,x+2,y-48,w-4,40,4);
      g.fillStyle(H.sage);softBox(g,x+5,y-45,w-10,34,3);
      g.fillStyle(H.ceramic).fillRect(x+9,y-40,2,21).fillRect(x+12,y-41,9,2);
      g.fillStyle(H.brass).fillRect(x+Math.floor(w/2),y-3,3,10);
    }
    return;
  }
  // Warm wood carcasses: top, front, bevel, panel inset, contact feet.
  g.fillStyle(H.woodDeep);softBox(g,x,y,w,h,2);
  g.fillStyle(H.wood).fillRect(x+3,y+5,w-6,h-9);
  g.fillStyle(H.woodLight).fillRect(x+2,y-3,w-4,9);
  g.fillStyle(H.woodEdge).fillRect(x+3,y-4,w-6,2);
  if(['wardrobe','dresser','tv'].includes(kind)) {
    const top=kind==='wardrobe'?y-28:y+8,faceH=kind==='wardrobe'?h+24:h-13;
    if(kind==='wardrobe') {
      g.fillStyle(H.woodDeep).fillRect(x,y-32,w,36);
      g.fillStyle(H.wood).fillRect(x+3,y-29,w-6,34);
      g.fillStyle(H.woodEdge).fillRect(x,y-33,w,3);
    }
    const pw=Math.floor((w-9)/2);
    for(let i=0;i<2;i++) {
      const px=x+3+i*(pw+3);
      g.fillStyle(H.woodDeep).fillRect(px,top,pw,faceH);
      g.fillStyle(H.wood).fillRect(px+2,top+2,pw-4,faceH-4);
      g.fillStyle(H.woodLight).fillRect(px+3,top+3,1,faceH-7);
      if(kind==='dresser')g.fillStyle(H.woodDeep).fillRect(px,top+Math.floor(faceH/2),pw,1);
      g.fillStyle(H.brass).fillRect(px+Math.floor(pw/2)-3,top+Math.floor(faceH/2)-4,7,2);
    }
    g.fillStyle(H.woodDeep).fillRect(x+4,y+h-2,5,5).fillRect(x+w-9,y+h-2,5,5);
  }
  if(kind==='tv') {
    g.fillStyle(H.shadow);softBox(g,x+8,y-44,w-16,45,3);
    g.fillStyle(0x343f50).fillRect(x+12,y-40,w-24,35);
    g.fillStyle(0x495266).fillRect(x+14,y-38,w-28,2).fillRect(x+14,y-36,2,26);
    g.fillStyle(0x617178).fillRect(x+18,y-34,25,1).fillRect(x+18,y-32,9,1);
    g.fillStyle(H.shadow).fillRect(x+Math.floor(w/2)-2,y,4,6).fillRect(x+Math.floor(w/2)-15,y+4,30,2);
    g.fillStyle(H.brass).fillRect(x+w-17,y-3,1,1);
  }
  if(kind==='table'||kind==='desk') {
    g.fillStyle(H.woodDeep).fillRect(x+6,y+h-5,5,12).fillRect(x+w-11,y+h-5,5,12);
    g.fillStyle(H.woodLight);softBox(g,x,y-4,w,h-3,5);
    g.fillStyle(H.woodEdge).fillRect(x+7,y-4,w-14,2);
    g.fillStyle(H.wood).fillRect(x+5,y+h-9,w-10,3);
    for(let dx=17;dx<w-5;dx+=25)g.fillStyle(H.wood,.5).fillRect(x+dx,y+2,1,h-15);
    g.fillStyle(H.woodEdge,.55).fillRect(x+12,y+9,14,1).fillRect(x+w-30,y+18,16,1);
    if(kind==='desk') {
      g.fillStyle(H.cream).fillRect(x+12,y+5,23,15);
      g.fillStyle(H.linen).fillRect(x+15,y+8,14,1).fillRect(x+15,y+12,10,1);
      g.fillStyle(H.clothDeep).fillRect(x+52,y-9,7,20);
      g.fillStyle(H.sageDeep).fillRect(x+61,y-13,8,24);
      g.fillStyle(H.brass).fillRect(x+53,y-6,5,2).fillRect(x+62,y-9,6,2);
      g.fillStyle(H.shadow).fillRect(x+38,y+7,1,14);
    }
    // A folded book and remote make the small coffee table a used place.
    if(kind==='table'&&w===80) {
      g.fillStyle(H.shadow,.2).fillRect(x+15,y+7,24,17);
      g.fillStyle(H.sageDeep).fillRect(x+13,y+4,23,17);
      g.fillStyle(H.cream).fillRect(x+16,y+18,19,2);
      g.fillStyle(H.sageLight).fillRect(x+17,y+7,14,2);
      g.fillStyle(H.shadow).fillRect(x+55,y+8,5,15);
      g.fillStyle(H.linen).fillRect(x+57,y+10,1,2).fillRect(x+56,y+16,3,1);
    }
  }
  if(['counter','sink','stove','fridge'].includes(kind)) {
    const lengthwise=h>80;
    g.fillStyle(H.sageDeep).fillRect(x+2,y+8,w-4,h-11);
    g.fillStyle(H.sage).fillRect(x+5,y+11,w-10,h-18);
    g.fillStyle(H.cream).fillRect(x,y-5,w,lengthwise?h-10:17);
    g.fillStyle(H.ceramic).fillRect(x+2,y-5,w-4,3);
    if(!lengthwise) {
      g.fillStyle(H.brass).fillRect(x+Math.floor(w/2)-5,y+19,10,2);
      g.fillStyle(H.sageLight).fillRect(x+5,y+12,w-10,1);
    } else {
      g.fillStyle(H.linen).fillRect(x+w-5,y,w>20?3:1,h-19);
      // Folded dish towel, grouped on the existing counter rather than the walkway.
      g.fillStyle(H.clothLight).fillRect(x+5,y+64,24,24);
      g.fillStyle(H.cream).fillRect(x+5,y+67,24,2).fillRect(x+5,y+82,24,2);
    }
  }
  if(kind==='sink') {
    g.fillStyle(H.tile);softBox(g,x+15,y-1,w-30,18,3);
    g.fillStyle(H.sageDeep);softBox(g,x+18,y+2,w-36,11,2);
    g.fillStyle(H.ceramic).fillRect(x+25,y-10,3,12).fillRect(x+25,y-10,10,3);
  }
  if(kind==='stove') {
    g.fillStyle(H.shadow).fillRect(x+4,y-3,w-8,19);
    for(const dx of [15,44]) {
      g.fillStyle(H.tile);pixelOval(g,x+dx,y,12,11);
      g.fillStyle(H.shadow);pixelOval(g,x+dx+2,y+2,8,7);
    }
    g.fillStyle(H.shadow).fillRect(x+10,y+21,w-20,11);
    g.fillStyle(H.brass).fillRect(x+14,y+18,w-28,2);
    g.fillStyle(H.tile).fillRect(x+14,y+24,w-28,1);
  }
  if(kind==='fridge') {
    g.fillStyle(H.tile);softBox(g,x,y-28,w,h+28,2);
    g.fillStyle(H.ceramic).fillRect(x+2,y-27,w-6,h+24);
    g.fillStyle(H.cream).fillRect(x+3,y-26,2,h+22);
    g.fillStyle(H.tile).fillRect(x+2,y-5,w-5,2);
    g.fillStyle(H.shadow).fillRect(x+w-8,y+3,2,13).fillRect(x+w-8,y-21,2,9);
    g.fillStyle(H.cream).fillRect(x+8,y+4,12,14);
    g.fillStyle(H.clothLight).fillRect(x+13,y+3,3,3);
    g.fillStyle(H.linen).fillRect(x+10,y+8,7,1).fillRect(x+10,y+11,5,1);
  }
}
