import type Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import type { GameStateStore } from '../../systems/GameStateStore';
import { gameEvents } from '../../systems/events';
import { addSmallText } from '../../ui/PixelFont';

export const REUNION_DURATION=8200;
/** A scene-local staged embrace, with no saved transient animation state. */
export function playFinalReunion(scene:Phaser.Scene,state:GameStateStore,player:Player,goncalo:Phaser.GameObjects.Image,finished:()=>void):void {
  const reduced=state.snapshot.settings.reducedCameraMotion;
  const camera=scene.cameras.main,oldZoom=camera.zoom;
  const pose=scene.add.image(player.feetPosition.x,player.feetPosition.y,player.texture.key).setOrigin(.5,1).setDepth(290);
  player.setVisible(false).setVelocity(0);state.movement.setLock('cutscene',true);
  gameEvents.emit('finale-reunion-start');gameEvents.emit('finale-voice:found-player');
  const glow=scene.add.graphics().setDepth(-80).setAlpha(0);
  glow.fillStyle(0xffe5ae,.14).fillEllipse(322,250,312,192);
  glow.fillStyle(0xffe5ae,.1).fillEllipse(322,250,240,145);
  const line=addSmallText(scene,320,186,'Oh. There you are, baby.',0xffedbd).setOrigin(.5).setAlpha(0).setDepth(3010);
  const dots:Phaser.GameObjects.Rectangle[]=[];
  const tweens:Phaser.Tweens.Tween[]=[];
  const later:Phaser.Time.TimerEvent[]=[];
  const tween=(config:Phaser.Types.Tweens.TweenBuilderConfig)=>tweens.push(scene.tweens.add(config));
  tween({targets:pose,x:308,y:251,duration:reduced?1:1150,ease:'Sine.easeInOut'});
  if(!reduced){camera.pan(320,224,1600,'Sine.easeInOut');camera.zoomTo(1.12,2300,'Sine.easeInOut');}
  tween({targets:glow,alpha:1,duration:1900});
  later.push(scene.time.delayedCall(1500,()=>{
    pose.setTexture('player-seated');tween({targets:pose,x:313,y:243,duration:reduced?1:600,ease:'Sine.easeInOut'});
    tween({targets:goncalo,x:328,duration:reduced?1:600});
    tween({targets:line,alpha:1,duration:650});
  }));
  later.push(scene.time.delayedCall(3200,()=>{
    line.setText('These cheeks!! eheheh');
    if(!reduced)tween({targets:pose,x:316,duration:180,yoyo:true,repeat:1});
  }));
  later.push(scene.time.delayedCall(4800,()=>{line.setText('No hurry. Just us.');}));
  if(!reduced)for(let i=0;i<20;i++){
    const dot=scene.add.rectangle(218+(i*43)%212,185+(i*29)%136,2,2,i%3?0xffe1a3:0xe3b2b0,0).setDepth(3010);dots.push(dot);
    tween({targets:dot,alpha:.8,y:dot.y-13,delay:1200+i*100,duration:2200,yoyo:true,repeat:-1});
  }
  let cleaned=false;
  const cleanup=():void=>{
    if(cleaned)return;cleaned=true;later.forEach(t=>t.remove(false));tweens.forEach(t=>t.remove());
    pose.destroy();glow.destroy();line.destroy();dots.forEach(d=>d.destroy());
    player.setVisible(true);goncalo.setPosition(329,241);state.movement.setLock('cutscene',false);
    camera.panEffect.reset();camera.zoomEffect.reset();camera.setZoom(oldZoom);
    gameEvents.emit('finale-reunion-end');scene.events.off('shutdown',cleanup);
  };
  scene.events.once('shutdown',cleanup);
  later.push(scene.time.delayedCall(REUNION_DURATION,()=>{cleanup();finished();}));
}
