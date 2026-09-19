import type Phaser from 'phaser';
import { createPixelTexture } from '../../art/textureFactory';
import { PALETTE as P } from '../../art/palette';

/** Local ownership: cold-loading the finale must never depend on visiting Autumn. */
export function createFinalParkFoliage(scene:Phaser.Scene):void {
  for(let variant=0;variant<3;variant++)createPixelTexture(scene,`final-tree-${variant}`,128,152,g=>{
    const shades=variant===1?[0x615365,0x887083,0xb48d99,0xd9b2ac]:variant===2?[0x536349,0x7a8757,0xaab376,0xd1cd91]:[0x334b3d,0x506c51,0x819765,0xaab67a];
    g.fillStyle(P.shadowDeep,.2).fillEllipse(63,144,90,13);
    g.fillStyle(P.woodDeep).fillRect(58,77,13,63).fillRect(53,135,24,6);
    g.fillStyle(P.wood).fillRect(61,79,6,59);
    g.fillStyle(P.woodLight).fillRect(63,91,2,42);
    g.lineStyle(5,P.woodDeep).lineBetween(61,112,35,76).lineBetween(66,99,93,70);
    g.lineStyle(2,P.woodWarm).lineBetween(63,109,40,76).lineBetween(66,98,90,72);
    const lobes=[[40,42,28],[65,29,29],[86,48,30],[27,67,25],[58,63,34],[98,72,24],[46,88,25],[76,90,27]];
    const lobe=(x:number,y:number,r:number,color:number)=>{
      g.fillStyle(color).fillPoints([{x:x-r,y:y-9},{x:x-r+5,y:y-19},{x:x-13,y:y-r},{x:x+8,y:y-r-2},{x:x+r-6,y:y-17},{x:x+r,y:y-2},{x:x+r-5,y:y+13},{x:x+13,y:y+21},{x:x-5,y:y+23},{x:x-r+6,y:y+13}],true);
    };
    lobes.forEach(([x,y,r])=>lobe(x!,y!,r!,shades[0]!));
    lobes.forEach(([x,y,r],i)=>{
      lobe(x!-2,y!-5,r!-5,shades[1]!);
      lobe(x!-5,y!-9,r!-12,shades[2]!);
      for(let j=0;j<7;j++){
        const xx=x!-16+(j*11+i*7)%31,yy=y!-15+(j*7)%25;
        g.fillStyle(j%3?shades[2]!:shades[3]!).fillRect(xx,yy,4+j%3,2).fillRect(xx+1,yy-1,3,1);
      }
    });
    for(let i=0;i<25;i++){
      const x=23+(i*31)%83,y=37+(i*17)%63;
      if(variant===0&&i%3)continue;
      g.fillStyle(variant===1?0xefc7bb:0xe7d4ae).fillRect(x,y,3,3).fillRect(x-1,y+1,5,1);
      g.fillStyle(P.paperShade).fillRect(x+1,y+1,1,1);
    }
  });
  createPixelTexture(scene,'final-fern',38,25,g=>{
    g.fillStyle(P.shadowDeep,.12).fillEllipse(20,22,35,5);
    for(let i=0;i<5;i++){
      const x=3+i*7,top=4+Math.abs(i-2)*3;
      g.lineStyle(1,P.grassDeep).lineBetween(19,23,x,top);
      for(let y=top;y<21;y+=4)g.fillStyle(i%2?P.grassLight:P.grassWarm).fillRect(x-3,y,7,2);
    }
  });
}

export function finalTree(scene:Phaser.Scene,x:number,y:number,variant:number,scale=1):Phaser.GameObjects.Image {
  return scene.add.image(x,y,`final-tree-${variant}`).setOrigin(.5,1).setScale(scale).setDepth(y);
}

/** Reuses the approved head/shirt; only the finale's seated leg pose is composed. */
export function createFinalSeatedPose(scene:Phaser.Scene):void {
  if(scene.textures.exists('final-goncalo-seated'))return;
  const canvas=scene.textures.createCanvas('final-goncalo-seated',24,28)!;
  const ctx=canvas.context;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(scene.textures.get('goncalo-down-idle').getSourceImage() as HTMLImageElement,0,0,24,23,0,0,24,23);
  ctx.fillStyle='#304c67';ctx.fillRect(6,22,13,3);ctx.fillRect(5,24,7,2);ctx.fillRect(15,24,6,2);
  ctx.fillStyle='#617f99';ctx.fillRect(7,22,4,2);ctx.fillRect(15,22,3,2);
  ctx.fillStyle='#e2d7c9';ctx.fillRect(4,26,7,2);ctx.fillRect(16,26,6,2);
  canvas.refresh();
}
