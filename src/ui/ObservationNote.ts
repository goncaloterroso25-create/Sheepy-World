import type Phaser from 'phaser';
import { addBodyText, addSmallText } from './PixelFont';
import { tape, tornPaper, UI_MATERIAL as M } from './TactileUI';

/** A transient scrapbook note. Content is unchanged; paper sizes to the wrapped copy. */
export function createObservationNote(scene: Phaser.Scene, content: {title:string;detail:string},
  reducedMotion: boolean): Phaser.GameObjects.Container {
  const width=246;
  const title=addSmallText(scene,14,13,content.title,M.ink);
  title.setFontSize(scene.cache.bitmapFont.get(title.font).data.size).setMaxWidth(width-34);
  const detail=addBodyText(scene,14,Math.ceil(title.height)+22,content.detail,M.ink);
  detail.setFontSize(scene.cache.bitmapFont.get(detail.font).data.size).setMaxWidth(width-28);
  const height=Math.ceil(detail.y+detail.height+15);
  const art=scene.add.graphics();
  art.fillStyle(M.ink,.18).fillRect(3,5,width,height-3);
  tornPaper(art,0,0,width,height,M.paperLight);
  art.fillStyle(M.paperEdge).fillRect(width-12,2,10,9);
  art.fillStyle(M.paper).fillRect(width-11,2,9,7);
  art.fillStyle(M.paperEdge).fillRect(14,Math.ceil(title.height)+17,28,1);
  tape(art,18,-3,21);
  const note=scene.add.container(640-width-12,12,[art,title,detail]).setDepth(12000).setName('observation-note');
  if(!reducedMotion){
    note.setY(10).setAlpha(0);
    scene.tweens.add({targets:note,alpha:1,duration:180});
  }
  const settle=scene.time.delayedCall(100,()=>note.setY(12));
  const dismiss=scene.time.delayedCall(2850,()=>{
    scene.tweens.add({targets:note,alpha:0,duration:180,onComplete:()=>note.destroy(true)});
  });
  note.once('destroy',()=>{
    settle.remove(false);dismiss.remove(false);scene.tweens.killTweensOf(note);
  });
  return note;
}
