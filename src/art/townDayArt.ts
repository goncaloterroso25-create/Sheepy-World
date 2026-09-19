import type Phaser from 'phaser';
import type { Rect } from '../world/regions/definitions';
import type { House } from '../world/regions/layouts';
import { pixelOval, softBox } from './styleProofShapes';

/** Daylight siblings of the approved urban materials; no collision or content ownership. */
export const DAY = {
  shadow:0x414b50, grass:0x789789, grassLight:0x91a593, grassDeep:0x567b70,
  stone:0xb3b1a0, stoneLight:0xd1c9ae, seam:0x969e93, stoneDeep:0x707d77,
  cream:0xeee0bc, wood:0x96725f, woodDeep:0x614c49, roof:0xa3776b,
  roofLight:0xc7967f, roofDeep:0x795d59, leaf:0x779887, leafLight:0x9fb292,
};

export function dayPaving(g: Phaser.GameObjects.Graphics, r: Rect, narrow=false): void {
  const {x,y,width:w,height:h}=r;
  g.fillStyle(DAY.seam).fillRect(x,y,w,h);
  g.fillStyle(DAY.stone).fillRect(x+2,y+2,w-4,h-4);
  const step=narrow?16:24;
  for(let row=0,py=y+3;py<y+h-3;py+=step,row++) {
    for(let px=x+3;px<x+w-3;px+=32) {
      const pw=Math.min(30,x+w-3-px),ph=Math.min(step-2,y+h-3-py);
      const k=(Math.floor(px/32)+row*3)%7;
      g.fillStyle(k===0?0xbcc0ad:k===3?0xbab7a4:DAY.stone);
      g.fillRect(px,py,pw,ph);
      if(k<2)g.fillStyle(DAY.stoneLight,.6).fillRect(px+2,py,Math.max(1,pw-5),1);
      if(k===4&&pw>12)g.fillStyle(DAY.seam,.45).fillRect(px+5,py+ph-1,7,1);
    }
  }
  // Pale worn center, very sparse joints: traversal remains quieter than landmarks.
  g.fillStyle(DAY.stoneLight,.14).fillRect(x+6,y+5,w-12,h-10);
}

export function dayWall(g: Phaser.GameObjects.Graphics,r:Rect):void {
  const {x,y,width:w,height:h}=r;
  g.fillStyle(DAY.shadow,.22).fillRect(x+3,y+4,w,h);
  g.fillStyle(DAY.stoneDeep).fillRect(x,y,w,h);
  g.fillStyle(DAY.stone).fillRect(x+1,y+1,w-2,h-3);
  if(w>h){
    g.fillStyle(DAY.stoneLight).fillRect(x,y,w,3);
    for(let dx=22;dx<w;dx+=27)g.fillStyle(DAY.seam).fillRect(x+dx,y+4,1,h-5);
    g.fillStyle(DAY.seam).fillRect(x+2,y+Math.floor(h/2),w-4,1);
  }else{
    g.fillStyle(DAY.stoneLight).fillRect(x,y,3,h);
    for(let dy=20;dy<h;dy+=25)g.fillStyle(DAY.seam).fillRect(x+3,y+dy,w-4,1);
  }
}

function window(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,shutter:number):void {
  g.fillStyle(DAY.woodDeep).fillRect(x-3,y-3,w+6,h+8);
  g.fillStyle(DAY.cream).fillRect(x-2,y-3,w+4,h+3);
  g.fillStyle(0x526d74).fillRect(x,y,w,h);
  g.fillStyle(0x88a5a0).fillRect(x+2,y+2,w-4,Math.floor(h/2)-2);
  g.fillStyle(0xc0cdb5).fillRect(x+3,y+3,2,7);
  g.fillStyle(DAY.cream).fillRect(x+Math.floor(w/2),y,2,h).fillRect(x,y+Math.floor(h/2),w,2);
  g.fillStyle(shutter).fillRect(x-9,y-1,6,h+2).fillRect(x+w+3,y-1,6,h+2);
  for(let dy=4;dy<h;dy+=6)g.fillStyle(DAY.shadow,.28).fillRect(x-8,y+dy,4,1).fillRect(x+w+4,y+dy,4,1);
  g.fillStyle(DAY.stoneLight).fillRect(x-5,y+h+1,w+10,3);
}

export function dayHouse(scene:Phaser.Scene,h:House):void {
  const {x,y,width:w,height:height}=h,bottom=y+height;
  const g=scene.add.graphics().setDepth(bottom-15);
  const residential=h.home||w>175&&h.variant==='gable';
  const wall=h.tone==='green'?0xa4b5a1:h.tone==='rose'?0xc6a099:0xd3c4a7;
  const shade=h.tone==='green'?0x819a89:h.tone==='rose'?0xaa8583:0xb4a58f;
  const shutter=h.tone==='rose'?0x738b82:0x7c817b;
  const roofH=Math.min(48,Math.floor(height*.29));
  g.fillStyle(DAY.shadow,.19);softBox(g,x+5,bottom-9,w+7,20,5);
  g.fillStyle(DAY.woodDeep).fillRect(x,y+roofH-3,w,height-roofH+3);
  g.fillStyle(shade).fillRect(x+2,y+roofH,w-4,height-roofH-3);
  g.fillStyle(wall).fillRect(x+5,y+roofH+4,w-16,height-roofH-11);
  // Foundation courses and sparse corner quoins anchor each facade to its exact base.
  g.fillStyle(DAY.stoneDeep).fillRect(x+1,bottom-10,w-2,9);
  g.fillStyle(DAY.stone).fillRect(x+2,bottom-10,w-4,3);
  for(let yy=y+roofH+12;yy<bottom-13;yy+=17){
    g.fillStyle(h.variant==='stone'?DAY.stoneLight:shade).fillRect(x+5,yy,10,6).fillRect(x+w-14,yy+5,9,6);
  }
  const doorX=x+Math.floor(w/2)-14,doorW=h.variant==='garage'?Math.min(80,w-28):28;
  const dx=h.variant==='garage'?x+Math.floor((w-doorW)/2):doorX;
  const dy=bottom-(h.variant==='garage'?53:46);
  g.fillStyle(DAY.stoneLight).fillRect(dx-4,dy-4,doorW+8,bottom-dy+3);
  g.fillStyle(DAY.woodDeep).fillRect(dx,dy,doorW,bottom-dy-1);
  g.fillStyle(DAY.wood).fillRect(dx+3,dy+3,doorW-6,bottom-dy-7);
  for(let py=dy+9;py<bottom-6;py+=10)g.fillStyle(DAY.woodDeep,.5).fillRect(dx+4,py,doorW-8,1);
  if(h.variant!=='garage'){
    g.fillStyle(0x739194).fillRect(dx+5,dy+4,doorW-10,10);
    g.fillStyle(DAY.cream).fillRect(dx+doorW-6,dy+25,2,2);
  }
  g.fillStyle(DAY.stoneLight).fillRect(dx-3,bottom-2,doorW+6,3);
  for(const wx of [x+25,x+w-49])window(g,wx,Math.max(y+roofH+17,bottom-91),24,29,shutter);
  if(h.balcony){
    g.fillStyle(DAY.shadow,.2).fillRect(x+20,bottom-54,w-40,8);
    g.fillStyle(DAY.woodDeep).fillRect(x+18,bottom-66,w-36,2).fillRect(x+18,bottom-56,w-36,3);
    for(let bx=x+20;bx<x+w-18;bx+=8)g.fillRect(bx,bottom-65,2,10);
    g.fillStyle(DAY.stoneLight).fillRect(x+15,bottom-54,w-30,3);
  }
  // Hipped tile roofs, with gables reserved for the existing gable/Home identity.
  g.fillStyle(DAY.roofDeep).fillRect(x-4,y+roofH-1,w+8,8);
  for(let row=0;row<roofH;row+=4){
    const inset=Math.max(0,Math.floor((roofH-row)/4));
    g.fillStyle(row%8===0?DAY.roof:0xaf8271).fillRect(x-3+inset,y+row,w+6-inset*2,4);
    for(let tx=x+inset+8+(row%8);tx<x+w-inset;tx+=16)g.fillStyle(DAY.roofLight,.48).fillRect(tx,y+row,1,3);
  }
  g.fillStyle(DAY.roofLight).fillRect(x+8,y-1,w-16,3);
  g.fillStyle(DAY.roofDeep).fillRect(x+w-29,y-12,14,22);
  g.fillStyle(DAY.stone).fillRect(x+w-27,y-11,9,15);
  g.fillStyle(DAY.stoneLight).fillRect(x+w-31,y-14,17,3);
  if(h.variant==='gable'||h.home){
    const cx=x+Math.floor(w/2);
    for(let r=0;r<29;r+=2){g.fillStyle(DAY.woodDeep).fillRect(cx-r,y+8+r,2*r+2,2);}
    for(let r=3;r<27;r+=2){g.fillStyle(DAY.cream).fillRect(cx-r+3,y+10+r,Math.max(2,2*r-5),2);}
    g.fillStyle(DAY.woodDeep).fillRect(cx-1,y+19,3,17);
  }
  if(h.variant==='shop'){
    const ay=bottom-48;
    g.fillStyle(DAY.shadow,.2).fillRect(x+17,ay+7,w-34,10);
    for(let bx=x+14,i=0;bx<x+w-14;bx+=12,i++){
      g.fillStyle(i%2?DAY.cream:0x829b8c).fillRect(bx,ay,Math.min(12,x+w-14-bx),7);
      g.fillRect(bx+1,ay+7,Math.min(10,x+w-15-bx),4);
    }
  }
  if(residential||h.tone==='rose'){
    for(const px of [x+25,x+w-44]){
      g.fillStyle(DAY.woodDeep).fillRect(px,bottom-58,23,6);
      g.fillStyle(DAY.leaf).fillRect(px+1,bottom-62,21,6);
      for(const ox of [3,11,18])g.fillStyle(ox===11?DAY.cream:0xc99199).fillRect(px+ox,bottom-64,3,3);
    }
  }
}

export function dayTree(scene:Phaser.Scene,x:number,y:number):void {
  const g=scene.add.graphics().setDepth(y+5);
  g.fillStyle(DAY.shadow,.18);pixelOval(g,x-22,y-4,46,13);
  g.fillStyle(DAY.woodDeep).fillRect(x-4,y-31,8,32);
  g.fillStyle(DAY.wood).fillRect(x-2,y-29,3,28);
  g.fillStyle(DAY.grassDeep);pixelOval(g,x-27,y-66,55,48);
  for(const [dx,dy,w,h] of [[-24,-62,32,29],[-5,-66,28,32],[-28,-45,32,25],[0,-44,29,26]]){
    g.fillStyle(DAY.leaf);pixelOval(g,x+dx!,y+dy!,w!,h!);
    g.fillStyle(DAY.leafLight);pixelOval(g,x+dx!+3,y+dy!+2,w!-10,7);
  }
  g.fillStyle(DAY.grassDeep).fillRect(x-19,y-23,8,3).fillRect(x+11,y-26,8,3);
}

export function dayPlanter(scene:Phaser.Scene,x:number,y:number):void {
  const g=scene.add.graphics().setDepth(y+9);
  g.fillStyle(DAY.shadow,.2);pixelOval(g,x-12,y+4,26,8);
  g.fillStyle(DAY.roofDeep);softBox(g,x-10,y-3,20,12,3);
  g.fillStyle(DAY.roofLight).fillRect(x-10,y-4,20,3);
  g.fillStyle(DAY.leaf);pixelOval(g,x-11,y-14,23,12);
  for(const dx of [-6,0,6]){g.fillStyle(dx?0xd3a2a1:DAY.cream).fillRect(x+dx,y-14,3,3);}
}

export function dayCafeTable(scene:Phaser.Scene,r:Rect):void {
  const {x,y,width:w,height:h}=r,g=scene.add.graphics().setDepth(y+h);
  g.fillStyle(DAY.shadow,.22);pixelOval(g,x-5,y+7,w+12,h+2);
  g.fillStyle(DAY.woodDeep).fillRect(x+5,y+5,3,h+2).fillRect(x+w-8,y+5,3,h+2);
  g.fillStyle(DAY.woodDeep);softBox(g,x,y-4,w,h,4);
  g.fillStyle(DAY.wood);softBox(g,x,y-6,w,h-1,4);
  g.fillStyle(DAY.cream);softBox(g,x+4,y-4,w-8,h-5,3);
  g.fillStyle(DAY.stoneLight).fillRect(x+7,y-2,9,4);
  g.fillStyle(DAY.woodDeep).fillRect(x+9,y-4,5,4);
  g.fillStyle(DAY.cream).fillRect(x+10,y-5,4,3);
}
