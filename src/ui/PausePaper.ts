import type Phaser from 'phaser';
import { UI_MATERIAL as M, steppedPanel, tape, leafDoodle } from './TactileUI';
import { addSmallText } from './PixelFont';
import type { Keepsake } from './MemoryKeepsakes';

export function keepsakeArt(g: Phaser.GameObjects.Graphics, marks: readonly Keepsake[], x: number, y: number): void {
  marks.forEach((mark,i) => {
    const a=x+i*15;
    if(mark==='flower') { leafDoodle(g,a,y,M.accent);g.fillStyle(M.fabric).fillRect(a+6,y+7,1,6); }
    if(mark==='ticket') { g.fillStyle(M.coverLight).fillRect(a,y+2,11,7);g.fillStyle(M.paperLight).fillRect(a+3,y+4,5,1).fillRect(a+3,y+6,4,1); }
    if(mark==='snowflake') { g.fillStyle(0x718c9a).fillRect(a+5,y+1,1,11).fillRect(a,y+6,11,1).fillRect(a+2,y+3,2,2).fillRect(a+7,y+8,2,2).fillRect(a+7,y+3,2,2).fillRect(a+2,y+8,2,2); }
    if(mark==='cof') { g.fillStyle(M.pencil).fillRect(a+2,y+4,7,7).fillRect(a+8,y+5,3,4);g.fillStyle(M.paperLight).fillRect(a+3,y+5,5,5); }
    if(mark==='travel') { g.fillStyle(M.fabricDeep).fillRect(a+1,y+2,1,11).fillRect(a+2,y+2,9,6);g.fillStyle(M.gold).fillRect(a+3,y+3,6,3); }
  });
}

export function pausePaper(scene: Phaser.Scene, title: string, marks: readonly Keepsake[], height = 246): Phaser.GameObjects.Container {
  const top=Math.round((360-height)/2), x=178, width=284;
  const shade=scene.add.rectangle(320,180,640,360,0x211b24,.48).setInteractive();
  const g=scene.add.graphics();
  g.fillStyle(M.ink,.28).fillRect(x+4,top+5,width,height);
  steppedPanel(g,x,top,width,height,M.paper,M.pencil);
  g.fillStyle(M.paperLight).fillRect(x+4,top+3,width-8,2);
  g.fillStyle(M.paperEdge).fillRect(x+13,top+12,1,height-25).fillRect(x+21,top+height-22,width-42,1);
  tape(g,x+width-44,top-3,25);
  keepsakeArt(g,marks,x+width-24-marks.length*15,top+height-16);
  const heading=addSmallText(scene,320,top+20,title,M.ink).setOrigin(.5);
  heading.setFontSize(scene.cache.bitmapFont.get(heading.font).data.size*2);
  return scene.add.container(0,0,[shade,g,heading]).setDepth(10000);
}
