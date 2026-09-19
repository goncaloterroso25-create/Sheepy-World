import type Phaser from 'phaser';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { GAME_EVENTS, REGISTRY_KEYS } from '../../config/constants';
import type { AudioSystem } from '../../systems/AudioSystem';
import { FINAL_MEMORY, STORY_FLAGS } from '../../data/storyCompletion';
import { FINAL_AFTER_DIALOGUE, FINAL_AUTHOR_DIALOGUE } from '../../data/finalDialogue';
import { gameEvents } from '../../systems/events';
import { remember, restoreMemory } from './MemoryDiscoveries';
import { buildJourneyPark } from './FinalParkArt';
import { installFinalJourney } from './FinalJourney';
import type { Player } from '../../entities/Player';
import { FINALE_CALLBACKS } from '../../config/finaleCallbacks';
import { PALETTE as P } from '../../art/palette';
import { addSmallText } from '../../ui/PixelFont';
import { SHEEPY_WORLD_THEME } from '../../config/audio';

import { createFinalSeatedPose } from './FinalParkFoliage';
import { playFinalReunion } from './FinalReunion';

export const buildFinalPark=buildJourneyPark;

export function installFinalPark(scene:Phaser.Scene,state:GameStateStore,interactions:InteractionSystem,player:Player):void {
  installFinalJourney(scene,state,interactions,player);
  const audio=scene.registry.get(REGISTRY_KEYS.audio) as AudioSystem;
  audio.setRegionAmbience('autumn-park-bed',.32);
  // The existing emitter lifetime retries after unlock/focus and owns one looping voice.
  const score=():void=>audio.emitter('finale',SHEEPY_WORLD_THEME,'music',.66);
  scene.events.on('postupdate',score);
  const motion=!state.snapshot.settings.reducedCameraMotion;
  const tell=(title:string,detail:string):void=>{gameEvents.emit(GAME_EVENTS.notification,{title,detail});};
  const target=(id:string,x:number,y:number,prompt:string|(()=>string),interact:()=>void,enabled=()=>true):void=>{
    interactions.register({id,object:scene.add.zone(x,y,1,1),prompt,range:40,priority:25,
      discoveryCue:'MEMORY_RESONANCE',enabled,interact});
  };
  const restored=()=>state.snapshot.memories[FINAL_MEMORY]?.restored===true;
  const present=()=>state.flag(STORY_FLAGS.author)==='true'&&restored();
  target('final-picnic',320,319,()=>restored()?'A place kept':state.memoryHasClue(FINAL_MEMORY,'final-picnic')?'Remember this picnic':'A familiar picnic',()=>{
    if(restored()){tell('A place kept','The last page has an envelope. Read it here, by the bench.');return;}
    if(remember(scene,state,FINAL_MEMORY,'final-picnic')){
      tell('Two halves, one place','The keepsake halves fit the fold. Stay by the blanket and Remember.');return;
    }
    if(restoreMemory(scene,state,FINAL_MEMORY))gameEvents.emit('world-cue',{
      title:'Something tucked inside',detail:'The final keepsake has found its page. An envelope waits just to the right of the blanket.',
    });
  });
  target('final-author-note',395,291,'Read the last page',()=>gameEvents.emit(GAME_EVENTS.dialogueStart,FINAL_AUTHOR_DIALOGUE),restored);
  createFinalSeatedPose(scene);
  const goncalo=scene.add.image(329,241,'final-goncalo-seated').setName('final-goncalo').setOrigin(.5,1).setDepth(242);
  const envelope=scene.add.graphics().setDepth(292);
  envelope.fillStyle(P.paperShadow).fillRect(384,279,24,14);
  envelope.fillStyle(P.creamLight).fillRect(383,277,24,14);
  envelope.lineStyle(1,P.paperShade).lineBetween(384,278,395,285).lineBetween(395,285,406,278);
  envelope.fillStyle(P.leafRed).fillRect(393,284,4,4);
  const date=addSmallText(scene,320,273,'A PLACE KEPT',P.woodDeep).setOrigin(.5).setDepth(296);
  let inReunion=false,wasReady=present();
  const readyNote=addSmallText(scene,329,207,'A place beside him.',P.creamLight).setOrigin(.5).setDepth(243).setVisible(false);
  const refresh=():void=>{
    const ready=present();envelope.setVisible(restored());date.setVisible(restored());
    if(ready&&!wasReady){readyNote.setVisible(true);scene.time.delayedCall(4000,()=>readyNote.setVisible(false));}
    wasReady=ready;
  };
  refresh();const unsubscribe=state.subscribe(refresh);
  target('final-goncalo',329,250,'Sit with Gonçalo',()=>{
    if(inReunion)return;
    if(state.flag(STORY_FLAGS.complete)==='true'){gameEvents.emit(GAME_EVENTS.dialogueStart,FINAL_AFTER_DIALOGUE);return;}
    inReunion=true;
    playFinalReunion(scene,state,player,goncalo,()=>{
      inReunion=false;if(state.completeStory())gameEvents.emit('story-ending');
    });
  },()=>present()&&!inReunion);
  const author=():void=>{state.acknowledgeFinalAuthor();};
  target('final-cheek-pinch',374,245,'Pinch cheek',()=>{
    tell('Gonçalo','These cheeks!! eheheh');
    if(motion)scene.tweens.add({targets:goncalo,x:332,duration:100,yoyo:true,repeat:1});
  },()=>present()&&!inReunion&&state.flag(STORY_FLAGS.complete)==='true');
  const played=new Set<string>();
  const callbacks=Object.entries(FINALE_CALLBACKS).map(([id,key])=>{
    const event='finale-voice:'+id;
    const play=():void=>{if(!key||played.has(id))return;played.add(id);audio.stopChannel('voice');audio.playAuthoredVoice(key);};
    gameEvents.on(event,play);return ()=>gameEvents.off(event,play);
  });
  scene.events.once('shutdown',()=>callbacks.forEach(remove=>remove()));
  gameEvents.on('final-author-read',author);
  scene.events.once('shutdown',()=>{unsubscribe();scene.events.off('postupdate',score);gameEvents.off('final-author-read',author);});
  if(!restored())scene.time.delayedCall(1100,()=>tell('A place kept','The book grows quiet. There is no hurry now. Follow the little notes.'));
}
