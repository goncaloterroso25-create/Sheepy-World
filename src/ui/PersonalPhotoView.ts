import Phaser from 'phaser';
import { PERSONAL_PHOTOS, personalMedia, type PersonalPhotoId } from '../data/personalPhotos';
import { addBodyText, addSmallText } from './PixelFont';
import { paperButton, UI_MATERIAL as M } from './TactileUI';
import { addControlHint, paperControlButton } from './ControllerGlyphs';

/** One active media item. Destroying the modal owns video stop + element/texture disposal. */
export function createPhotoView(scene: Phaser.Scene, id: PersonalPhotoId, index: number,
  actions: {close:()=>void;previous:()=>void;next:()=>void}): Phaser.GameObjects.Container {
  const definition=PERSONAL_PHOTOS[id],frames=personalMedia(id);
  const frameIndex=Math.max(0,Math.min(frames.length-1,index)),item=frames[frameIndex]!;
  const root=scene.add.container(0,0);
  const dim=scene.add.rectangle(320,180,640,360,0x100e18,.94).setInteractive();
  const frame=scene.add.rectangle(320,174,592,286,M.cover).setStrokeStyle(2,M.paperEdge);
  const loading=addBodyText(scene,320,170,item.kind==='video'?'A little moment, loading...':'',M.paperLight).setOrigin(.5);
  root.add([dim,frame,loading]);
  const clip=scene.make.graphics({x:0,y:0},false).fillStyle(0xffffff).fillRect(39,66,562,228);
  const mask=clip.createGeometryMask();
  let zoom=false,fit=1;
  let media:Phaser.GameObjects.Image|Phaser.GameObjects.Video;
  const fitMedia=():void=>{
    fit=Math.min(562/Math.max(1,media.width),228/Math.max(1,media.height));
    media.setScale(fit).setPosition(320,180);
  };
  if(item.kind==='video'){
    const video=scene.add.video(320,180);
    media=video;video.setMask(mask);
    video.once('created',()=>{fitMedia();video.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);loading.setVisible(false);});
    const failure=():void=>{loading.setText('This clip could not load. You can still browse or close.').setMaxWidth(480).setVisible(true);};
    video.on('error',failure);video.on('unsupported',failure);
    // Silent runtime derivatives make autoplay reliable and never fight the finale score.
    video.loadURL(item.url,true).setMute(true).play(true);
    root.add(video);
    root.add(addSmallText(scene,45,330,'A LITTLE LOOP',M.paperLight));
    root.once('destroy',()=>video.stop()); // Phaser destroy also removes its HTML video element.
  }else{
    const available=scene.textures.exists(item.key);
    if(available)scene.textures.get(item.key).setFilter(Phaser.Textures.FilterMode.LINEAR);
    media=scene.add.image(320,180,available?item.key:'__WHITE').setVisible(available).setMask(mask);
    fitMedia();root.add(media);
    if(!available)loading.setText('This photograph could not load.\nThe memory is still here. You can close and continue.').setVisible(true);
    const surface=scene.add.rectangle(320,180,562,228,0,0).setInteractive();
    let last:{x:number;y:number}|undefined;
    surface.on('pointerdown',(p:Phaser.Input.Pointer)=>{last={x:p.x,y:p.y};});
    surface.on('pointermove',(p:Phaser.Input.Pointer)=>{
      if(!p.isDown||!last||!zoom)return;
      const dx=Math.max(0,(media.displayWidth-562)/2),dy=Math.max(0,(media.displayHeight-228)/2);
      media.x=Phaser.Math.Clamp(media.x+p.x-last.x,320-dx,320+dx);
      media.y=Phaser.Math.Clamp(media.y+p.y-last.y,180-dy,180+dy);last={x:p.x,y:p.y};
    });
    surface.on('pointerup',()=>{last=undefined;});root.add(surface);
    root.add(paperButton(scene,39,323,150,'ZOOM / FIT',()=>{
      zoom=!zoom;media.setScale(zoom?Math.max(fit*3,540/media.width):fit).setPosition(320,180);
    }));
  }
  root.add([
    addSmallText(scene,320,44,definition.title,M.paperLight).setOrigin(.5),
    addSmallText(scene,320,305,definition.caption,M.paperLight).setOrigin(.5),
    paperButton(scene,346,323,32,'<',actions.previous,frameIndex>0),
    addSmallText(scene,408,330,`${frameIndex+1} / ${frames.length}`,M.paperLight).setOrigin(.5),
    paperButton(scene,434,323,32,'>',actions.next,frameIndex<frames.length-1),
    paperControlButton(scene,480,323,121,'back','CLOSE',actions.close),
    addControlHint(scene,'movement',item.kind==='video'?'BROWSE MEMORIES':'CHANGE / DRAG WHEN ZOOMED',320,350,M.paperLight,'center'),
  ]);
  root.once('destroy',()=>{mask.destroy();clip.destroy();});
  return root;
}
