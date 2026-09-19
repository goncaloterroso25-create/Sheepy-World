import type Phaser from 'phaser';
import { HOME_PROOF as H } from './styleProofPalette';
import { pixelOval, softBox } from './styleProofShapes';
import { HOME_DOORWAYS, HOME_ROOMS, HOME_SIZE, HOME_WALLS } from '../world/regions/HomeLayout';
import { bakeGround } from '../world/regions/RegionArt';

function rug(g: Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,sage=false):void {
  g.fillStyle(sage?H.sageDeep:H.clothDeep);softBox(g,x,y,w,h,2);
  g.fillStyle(sage?H.sage:H.cloth).fillRect(x+4,y+4,w-8,h-8);
  g.fillStyle(H.linen,.6).fillRect(x+7,y+6,w-14,1).fillRect(x+7,y+h-7,w-14,1)
    .fillRect(x+6,y+7,1,h-14).fillRect(x+w-7,y+7,1,h-14);
  g.fillStyle(sage?H.sageLight:H.clothLight,.65);
  for(let yy=y+15;yy<y+h-10;yy+=18) {
    g.fillRect(x+11,yy,3,2).fillRect(x+w-14,yy,3,2);
    for(let xx=x+24;xx<x+w-15;xx+=24)g.fillRect(xx,yy,2,1);
  }
  const cx=Math.floor(x+w/2),cy=Math.floor(y+h/2);
  g.fillStyle(sage?H.sageLight:H.clothLight,.45);
  for(let row=-18;row<=18;row+=2)g.fillRect(cx-18+Math.abs(row),cy+row,(18-Math.abs(row))*2+1,2);
  g.fillStyle(sage?H.sage:H.cloth);pixelOval(g,cx-9,cy-7,18,14);
  for(let xx=x+8;xx<x+w-5;xx+=5)g.fillStyle(H.linen,.6).fillRect(xx,y-2,1,3).fillRect(xx,y+h-1,1,3);
}

function window(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number):void {
  g.fillStyle(H.woodDeep).fillRect(x,y,w,29);
  g.fillStyle(0x697b8d).fillRect(x+3,y+3,w-6,23);
  g.fillStyle(0xa5b9b5).fillRect(x+3,y+3,w-6,9);
  g.fillStyle(H.sageDeep).fillRect(x+3,y+20,w-6,6);
  for(let dx=8;dx<w-5;dx+=19) {
    g.fillStyle(H.sage).fillRect(x+dx,y+14,9,11).fillRect(x+dx+2,y+10,5,6);
  }
  g.fillStyle(H.cream).fillRect(x+Math.floor(w/2),y+1,2,27).fillRect(x+2,y+13,w-4,2);
  g.fillStyle(H.woodLight).fillRect(x-3,y+27,w+6,3);
  g.fillStyle(H.trim).fillRect(x-3,y+27,w+6,1);
  g.fillStyle(H.clothLight).fillRect(x-7,y-2,11,29).fillRect(x+w-4,y-2,11,29);
  g.fillStyle(H.rose).fillRect(x-6,y-1,3,27).fillRect(x+w-2,y-1,3,27);
  g.fillStyle(H.brass).fillRect(x-7,y+19,11,2).fillRect(x+w-4,y+19,11,2);
}

export function addHomeProofGround(scene:Phaser.Scene):void {
  bakeGround(scene,'region-home-ground',HOME_SIZE.width,HOME_SIZE.height,g=>{
    g.fillStyle(H.shadow).fillRect(0,0,HOME_SIZE.width,HOME_SIZE.height);
    for(const [id,r] of Object.entries(HOME_ROOMS)) {
      const tiled=id==='bathroom';
      g.fillStyle(tiled?H.tile:H.floor).fillRect(r.x,r.y,r.width,r.height);
      if(tiled) {
        for(let y=r.y;y<r.y+r.height;y+=24)for(let x=r.x;x<r.x+r.width;x+=24) {
          g.fillStyle((x+y)%48?H.tileLight:H.ceramic).fillRect(x+1,y+1,Math.min(22,r.x+r.width-x-1),Math.min(22,r.y+r.height-y-1));
          if((x+y)%48===0)g.fillStyle(H.sage).fillRect(x+10,y+10,3,3);
        }
      } else {
        for(let y=r.y;y<r.y+r.height;y+=16) {
          const row=Math.floor((y-r.y)/16),end=Math.min(15,r.y+r.height-y);
          g.fillStyle(row%3?H.floor:H.floorLight).fillRect(r.x,y,r.width,end);
          g.fillStyle(H.seam,.33).fillRect(r.x,y+end,r.width,1);
          for(let x=r.x+29+row%3*31;x<r.x+r.width;x+=119) {
            g.fillStyle(H.seam,.42).fillRect(x,y,1,end);
            const len=Math.min(23,r.x+r.width-x-7);
            if(len>0)g.fillStyle(H.grain,.6).fillRect(x+7,y+4,len,1);
          }
        }
      }
      // Wainscot and a quiet paper frieze give elevation without adding collision.
      g.fillStyle(tiled?H.sage:H.wall).fillRect(r.x,r.y-44,r.width,44);
      g.fillStyle(tiled?H.tileLight:H.wallLight).fillRect(r.x,r.y-43,r.width,23);
      for(let x=r.x+10;x<r.x+r.width-3;x+=24) {
        g.fillStyle(tiled?H.sage:H.rose,.6).fillRect(x,r.y-37,2,6).fillRect(x-2,r.y-35,6,2);
        g.fillStyle(H.woodDeep,.17).fillRect(x,r.y-18,1,12);
      }
      g.fillStyle(H.trim).fillRect(r.x,r.y-21,r.width,2);
      g.fillStyle(H.woodDeep).fillRect(r.x,r.y-5,r.width,5);
      g.fillStyle(H.woodLight).fillRect(r.x,r.y-5,r.width,2);
      g.fillStyle(H.shadow,.1).fillRect(r.x,r.y,r.width,4);
    }
    for(const r of HOME_WALLS.filter(r=>r.y>=80)) {
      g.fillStyle(H.woodDeep).fillRect(r.x,r.y,r.width,r.height);
      g.fillStyle(H.wall).fillRect(r.x+1,r.y+3,r.width-2,r.height-5);
      g.fillStyle(H.trim).fillRect(r.x,r.y,r.width,3);
      g.fillStyle(H.woodLight).fillRect(r.x,r.y+r.height-3,r.width,2);
    }
    for(const r of HOME_DOORWAYS) {
      g.fillStyle(H.floorLight).fillRect(r.x,r.y,r.width,r.height);
      g.fillStyle(H.woodLight).fillRect(r.x,r.y+2,r.width,1);
      g.fillStyle(H.trim).fillRect(r.x-3,r.y,3,r.height).fillRect(r.x+r.width,r.y,3,r.height);
    }
    rug(g,212,545,196,180);rug(g,183,165,83,144);rug(g,718,256,176,61,true);
    g.fillStyle(H.tile).fillRect(538,466,320,143);
    for(let y=466;y<609;y+=24)for(let x=538;x<858;x+=32) {
      g.fillStyle((x+y)%3?H.tileLight:H.ceramic).fillRect(x+1,y+1,Math.min(30,857-x),Math.min(22,608-y));
    }
    for(const [x,y,w] of [[302,43,65],[834,44,79],[312,402,94]])window(g,x!,y!,w!);
    // Stepped, very low-opacity light shapes retain unfiltered pixels.
    for(const [x,y,w,h] of [[316,462,86,65],[306,80,61,69],[836,80,70,55]]) {
      g.fillStyle(H.cream,.07);softBox(g,x!,y!,w!,h!,8);
      g.fillStyle(H.cream,.07);softBox(g,x!+8,y!,w!-16,h!-16,5);
    }
    for(const [w,h,a] of [[124,72,.035],[98,55,.04],[72,40,.055]]) {
      g.fillStyle(H.amber,a!);pixelOval(g,390-Math.floor(w!/2),640-Math.floor(h!/2),w!,h!);
    }
    rug(g,490,799,50,24,true);
  });
}

function plant(g:Phaser.GameObjects.Graphics,x:number,y:number):void {
  g.fillStyle(H.woodDeep);softBox(g,x-5,y-1,12,12,2);
  g.fillStyle(H.woodLight).fillRect(x-4,y,10,7);
  g.fillStyle(H.sageDeep).fillRect(x,y-19,2,20);
  for(const [dx,dy,w] of [[-8,-14,9],[1,-18,10],[-5,-24,8],[2,-8,8]]) {
    g.fillStyle(H.sage);softBox(g,x+dx!,y+dy!,w!,6,2);
    g.fillStyle(H.sageLight).fillRect(x+dx!+2,y+dy!,w!-4,1);
  }
}

export function addHomeProofDressing(scene:Phaser.Scene):void {
  // Wall-mounted objects never turn free walking floor into fake furniture.
  const wall=scene.add.graphics().setDepth(459);
  wall.fillStyle(H.woodDeep).fillRect(91,417,123,5);
  wall.fillStyle(H.woodEdge).fillRect(91,416,123,2);
  for(const [x,h,c] of [[100,20,H.sageDeep],[108,25,H.cloth],[115,23,H.woodLight],[122,18,H.sage]]) {
    wall.fillStyle(c!).fillRect(x!,416-h!,6,h!);
    wall.fillStyle(H.brass).fillRect(x!+1,411-h!,4,1);
  }
  plant(wall,190,405);
  // A small stitched wall hanging (not a new memory or a private photograph).
  wall.fillStyle(H.woodDeep).fillRect(455,397,43,3);
  wall.fillStyle(H.linen).fillRect(459,400,35,27);
  wall.fillStyle(H.cream).fillRect(462,401,29,23);
  wall.fillStyle(H.clothLight).fillRect(473,405,7,11).fillRect(470,409,13,3);
  wall.fillStyle(H.sage).fillRect(475,416,2,5).fillRect(469,417,5,2).fillRect(478,415,5,2);
  for(let x=462;x<491;x+=4)wall.fillStyle(H.linen).fillRect(x,426,1,3);
  const bedside=scene.add.graphics().setDepth(144);
  plant(bedside,717,106);
  const guitar=scene.add.graphics().setDepth(310);
  guitar.fillStyle(H.woodDeep).fillRect(348,258,5,37);
  guitar.fillStyle(H.woodLight).fillRect(349,260,2,30);
  guitar.fillStyle(H.woodDeep);pixelOval(guitar,340,283,21,17);pixelOval(guitar,338,294,26,20);
  guitar.fillStyle(H.woodLight);pixelOval(guitar,342,283,17,15);pixelOval(guitar,340,294,22,17);
  guitar.fillStyle(H.woodEdge);pixelOval(guitar,342,297,7,10);
  guitar.fillStyle(H.shadow);pixelOval(guitar,348,290,6,6);
  guitar.fillStyle(H.cream).fillRect(350,260,1,44);
  guitar.fillStyle(H.woodDeep).fillRect(346,304,9,2);
  for(const y of [261,266])guitar.fillStyle(H.brass).fillRect(346,y,2,1).fillRect(353,y,2,1);
  const bath=scene.add.graphics().setDepth(342);
  bath.fillStyle(H.brass).fillRect(438,312,40,2);
  bath.fillStyle(H.clothLight).fillRect(443,314,27,23);
  bath.fillStyle(H.cream).fillRect(444,332,25,2);
  const lamp=scene.add.graphics().setDepth(657);
  lamp.fillStyle(H.woodDeep);pixelOval(lamp,381,644,20,7);
  lamp.fillStyle(H.brass).fillRect(389,615,3,32);
  lamp.fillStyle(H.woodDeep);softBox(lamp,376,601,30,17,3);
  lamp.fillStyle(H.linen);softBox(lamp,377,599,28,16,3);
  lamp.fillStyle(H.cream).fillRect(380,599,22,2).fillRect(377,613,28,3);
  for(let x=381;x<403;x+=6)lamp.fillStyle(H.trim).fillRect(x,602,1,11);
}

export function addHomeProofCatBed(scene:Phaser.Scene):void {
  const g=scene.add.graphics().setDepth(530);
  g.fillStyle(H.shadow,.2);pixelOval(g,374,542,89,30);
  g.fillStyle(H.clothDeep);softBox(g,372,531,88,37,7);
  g.fillStyle(H.clothLight);softBox(g,373,529,86,35,7);
  g.fillStyle(H.linen);softBox(g,379,533,74,25,6);
  g.fillStyle(H.cream);softBox(g,382,533,68,22,5);
  g.fillStyle(H.cloth).fillRect(380,560,72,5);
  for(let x=384;x<449;x+=9)g.fillStyle(H.clothLight).fillRect(x,561,3,1);
  for(const x of [395,420]) {
    g.fillStyle(H.shadow,.2);pixelOval(g,x-2,594,23,7);
    g.fillStyle(H.tile);softBox(g,x,592,18,7,2);
    g.fillStyle(H.ceramic);pixelOval(g,x,589,18,7);
    g.fillStyle(x===395?H.sage:H.wood);pixelOval(g,x+2,590,14,4);
    g.fillStyle(x===395?H.cream:H.woodEdge).fillRect(x+4,590,4,1);
  }
}
