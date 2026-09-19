import type Phaser from 'phaser';
import { GONCALO_FURNITURE, GONCALO_ROOMS, GONCALO_WALLS } from '../world/regions/ExpansionLayout';
import { bakeGround } from '../world/regions/RegionArt';
import { homeProofFurniture } from './homeProofFurniture';
import { HOME_PROOF as H } from './styleProofPalette';
import { pixelOval, softBox } from './styleProofShapes';

/** Personal palette and dressing, on the original room/furniture geometry. */
export function addGoncaloHomeStyle(scene:Phaser.Scene):void {
  bakeGround(scene,'goncalo-home-ground',1152,960,g=>{
    g.fillStyle(H.shadow).fillRect(0,0,1152,960);
    g.fillStyle(H.floor).fillRect(48,76,1056,840);
    for(let y=76,row=0;y<916;y+=16,row++){
      g.fillStyle(row%3===0?H.floorLight:H.floor).fillRect(48,y,1056,15);
      g.fillStyle(H.seam,.65).fillRect(48,y+15,1056,1);
      for(let x=49+(row%3)*31;x<1100;x+=96){
        g.fillStyle(H.seam,.6).fillRect(x,y,1,15);
        g.fillStyle(H.grain,.65).fillRect(x+8,y+5,Math.min(28,1104-x-8),1);
      }
    }
    // Cool stained bedroom floor distinguishes his room without obscuring props.
    const bed=GONCALO_ROOMS.bedroom;
    g.fillStyle(0x505969,.26).fillRect(bed.x,bed.y,bed.width,bed.height);
    const k=GONCALO_ROOMS.kitchen;
    g.fillStyle(H.tile).fillRect(k.x,k.y,k.width,k.height);
    for(let y=k.y;y<k.y+k.height;y+=24)for(let x=k.x;x<k.x+k.width;x+=24){
      g.fillStyle((x+y)%48===0?H.tileLight:0xbfc2b1).fillRect(x+1,y+1,Math.min(22,k.x+k.width-x-1),Math.min(22,k.y+k.height-y-1));
    }
    for(const [name,r] of Object.entries(GONCALO_ROOMS)){
      g.fillStyle(name==='bedroom'?0x5d6076:name==='sister'?0xa28699:H.wall).fillRect(r.x,r.y-28,r.width,28);
      g.fillStyle(name==='bedroom'?0x818198:H.wallLight).fillRect(r.x,r.y-28,r.width,3);
      g.fillStyle(H.woodDeep).fillRect(r.x,r.y-7,r.width,7);
      g.fillStyle(H.woodLight).fillRect(r.x,r.y-7,r.width,2);
    }
    for(const r of GONCALO_WALLS){
      g.fillStyle(H.shadow,.18).fillRect(r.x+3,r.y+4,r.width,r.height);
      g.fillStyle(H.woodDeep).fillRect(r.x,r.y,r.width,r.height);
      g.fillStyle(H.wall).fillRect(r.x+2,r.y+2,r.width-4,r.height-5);
      g.fillStyle(H.trim).fillRect(r.x,r.y,r.width,3);
    }
    for(const [x,y,w,h,c] of [[230,125,70,220,0x686780],[758,177,233,167,H.sage],[207,516,77,210,H.cloth],[519,830,169,58,H.sage]]){
      g.fillStyle(H.shadow,.2);softBox(g,x!+2,y!+3,w!,h!,4);
      g.fillStyle(H.clothDeep);softBox(g,x!,y!,w!,h!,3);
      g.fillStyle(c!);softBox(g,x!+3,y!+3,w!-6,h!-6,3);
      g.fillStyle(H.linen).fillRect(x!+7,y!+6,w!-14,1).fillRect(x!+7,y!+h!-7,w!-14,1);
      for(let dx=8;dx<w!-7;dx+=8)g.fillStyle(H.linen).fillRect(x!+dx,y!-2,1,3).fillRect(x!+dx,y!+h!-1,1,3);
    }
    // Restrained warm pools, baked beneath actors and furniture, not a global wash.
    for(const [x,y,w,h] of [[204,119,88,92],[596,130,115,124],[983,519,90,106]]){
      g.fillStyle(H.amber,.08);pixelOval(g,x!,y!,w!,h!);
      g.fillStyle(H.amber,.06);pixelOval(g,x!+12,y!+10,w!-24,h!-20);
    }
  });
  GONCALO_FURNITURE.forEach(f=>homeProofFurniture(scene,f));
  const floor=scene.add.graphics().setDepth(-25);
  // Desk-local screen bounce only; unread glow remains owned by the PC observer.
  floor.fillStyle(0x90b9bd,.1);softBox(floor,302,242,126,43,6);
  const g=scene.add.graphics().setDepth(269);
  // Backrest stays tucked inside the existing desk base; the approach is clear.
  g.fillStyle(H.shadow);softBox(g,344,239,42,14,3);
  g.fillStyle(0x666579);softBox(g,348,241,34,9,3);
  g.fillStyle(0x9791a1).fillRect(352,241,25,2);
  g.fillStyle(H.shadow).fillRect(317,219,1,13).fillRect(317,230,20,1)
    .fillRect(418,215,1,13).fillRect(418,227,16,1);
  // Speakers, mouse mat and console-sized keyboard detail support the original rig.
  for(const x of [293,443]){
    g.fillStyle(H.shadow);softBox(g,x,198,11,24,2);
    g.fillStyle(0x747887);pixelOval(g,x+3,204,5,7);
    g.fillStyle(H.shadow);pixelOval(g,x+4,205,3,4);
  }
  g.fillStyle(0x535363);softBox(g,400,224,38,23,3);
  g.fillStyle(H.linen);softBox(g,428,228,5,8,2);
  const shelf=scene.add.graphics().setDepth(172);
  shelf.fillStyle(H.shadow,.2).fillRect(245,159,117,6);
  shelf.fillStyle(H.woodDeep).fillRect(243,154,119,5);
  shelf.fillStyle(H.woodLight).fillRect(243,153,119,2);
  for(let i=0;i<7;i++){
    shelf.fillStyle([H.clothDeep,H.sageDeep,H.wood,H.clothLight][i%4]!).fillRect(304+i*7,136+i%2*3,5,17-i%2*3);
    shelf.fillStyle(H.linen).fillRect(305+i*7,146,3,1);
  }
  // Music/creative-work materials stay in the already dressed bedroom wall area.
  shelf.fillStyle(H.shadow);softBox(shelf,267,133,24,19,2);
  shelf.fillStyle(H.wood);pixelOval(shelf,274,135,10,13);
  shelf.fillStyle(H.cream).fillRect(278,139,2,3);
  const lamp=scene.add.graphics().setDepth(177);
  lamp.fillStyle(H.brass).fillRect(247,149,3,10).fillRect(241,157,15,2);
  lamp.fillStyle(H.linen);softBox(lamp,239,138,20,13,3);
  lamp.fillStyle(H.cream).fillRect(241,138,16,3);
  const detail=scene.add.graphics().setDepth(271);
  // Crisp bezels and tiny screen marks, never a second interface or unread signal.
  for(const x of [306,374]){
    detail.fillStyle(0x819da3).fillRect(x+4,183,51,1);
    detail.fillStyle(0xb4c4ba).fillRect(x+6,185,1,18);
    detail.fillStyle(0x8eaaa9).fillRect(x+10,202,18,1);
  }
  for(let x=328;x<395;x+=6)detail.fillStyle(H.linen,.6).fillRect(x,239,3,1).fillRect(x,242,3,1);
}
