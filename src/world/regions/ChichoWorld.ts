import type Phaser from 'phaser';
import { GAME_EVENTS, REGISTRY_KEYS } from '../../config/constants';
import type { Player } from '../../entities/Player';
import type { AudioSystem } from '../../systems/AudioSystem';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { emitterGain } from '../../systems/SpatialAudio';
import { segmentHitsRect } from '../../systems/InteractionGeometry';
import { gameEvents } from '../../systems/events';
import type { DialogueDefinition } from '../../types/game';
import { contains, type Rect, type RegionId } from './definitions';
import { CatActor } from './CatActor';

const ACTIONS: DialogueDefinition={id:'chicho-actions',startNodeId:'hello',interaction:{id:'chicho-actions',mode:'REPEATABLE'},nodes:{
  hello:{id:'hello',speaker:'Chicho',lines:['Soft fur. Very firm opinions.'],choices:[{id:'pet',label:'Pet',nextId:'pet'},{id:'pick',label:'Pick up',nextId:'pick'}]},
  pet:{id:'pet',speaker:'Chicho',lines:['A brief audience is granted.'],onCompleteEvent:'chicho-pet'},
  pick:{id:'pick',speaker:'Chicho',lines:['Transport has been arranged.'],onCompleteEvent:'chicho-pick'},
}};
export function installChicho(scene:Phaser.Scene,id:RegionId,state:GameStateStore,interactions:InteractionSystem,player:Player,solids:readonly Rect[]):()=>void {
  if(id!=='goncalo-home') return ()=>{};
  state.resetChicho();
  const audio=scene.registry.get(REGISTRY_KEYS.audio) as AudioSystem;
  const actor = new CatActor(scene, 'chicho', { x: 1040, y: 700 }, solids, 2);
  const sprite = actor.sprite;
  let pets=0;
  const close=()=>Math.hypot(player.x-sprite.x,player.y-sprite.y)<52;
  const pet=():void=>{
    if(!close())return;
    actor.hold();
    pets++;
    audio.play(pets%2?'chicho-meow-1':'chicho-meow-2','sfx',.9);
    const heart=scene.add.graphics().setDepth(4900).fillStyle(0xd999aa).fillRect(sprite.x-4,sprite.y-20,3,3).fillRect(sprite.x+1,sprite.y-20,3,3).fillRect(sprite.x-2,sprite.y-17,5,3);
    scene.time.delayedCall(500,()=>heart.destroy());
    if(pets%3===0 && state.chicho.mode!=='eating') gameEvents.emit(GAME_EVENTS.notification,{title:'Chicho',detail:'Affection quota briefly reached. Please admire from here.'});
  };
  const pick=():void=>{
    if(!close() || state.chicho.mode==='eating')return;
    if(state.snapshot.cats.tobias==='carried'){gameEvents.emit(GAME_EVENTS.notification,{title:'Chicho',detail:'One passenger at a time, please.'});return;}
    state.updateChicho({mode:'carried'}); audio.play('chicho-meow-2','sfx',.7);
  };
  gameEvents.on('chicho-pet',pet);gameEvents.on('chicho-pick',pick);
  interactions.register({id:'chicho-actions',object:sprite,range:44,priority:0,prompt:()=>state.chicho.mode==='eating'?'Pet Chicho':'Pet / Pick up',
    enabled:()=>state.chicho.mode==='ground'||state.chicho.mode==='eating',interact:()=>{ actor.hold(); if(state.chicho.mode==='eating')pet();else gameEvents.emit(GAME_EVENTS.dialogueStart,ACTIONS); }});
  const drop=():{x:number;y:number}|undefined=>{
    for(const [dx,dy] of [[24,8],[-24,8],[0,30],[0,-22]]){
      const point={x:Math.round(player.x+dx!),y:Math.round(player.y+dy!)};
      if(point.x<59||point.x>1093||point.y<87||point.y>905)continue;
      if(!solids.some(r=>contains(r,point,11)||segmentHitsRect(player,point,r)))return point;
    }
  };
  interactions.register({id:'chicho-drop',object:player,range:1,priority:-100,prompt:'Set down Chicho',enabled:()=>state.chicho.mode==='carried'&&!!drop(),interact:()=>{
    const point=drop();if(!point)return;
    actor.place(point);
    state.updateChicho({...point,mode:Math.hypot(point.x-930,point.y-761)<120?'going-to-food':'ground'});
  }});
  scene.events.once('shutdown',()=>{gameEvents.off('chicho-pet',pet);gameEvents.off('chicho-pick',pick);state.resetChicho();audio.emitter('chicho-food','chicho-eating','ambience',0);});
  return ()=>{
    const c=state.chicho;
    if(c.mode==='carried'){
      sprite.anims.stop(); sprite.setTexture('cat-chicho-shoulder').setPosition(Math.round(player.x+7),Math.round(player.y-10)).setDepth(player.depth+1).setData('cat-pose','carried');return;
    }
    if(c.mode==='going-to-food'){
      if(actor.walkTo({x:931,y:762},64,state.movement.locked))state.updateChicho({mode:'eating',until:scene.time.now+13000,x:931,y:762});
      else state.updateChicho(actor.motion.position);
    }
    if(c.mode==='eating'&&scene.time.now>=c.until)state.updateChicho({mode:'ground'});
    const eating=state.chicho.mode==='eating';
    if(eating) { actor.render(); actor.pose('eat', 'left'); }
    else if(state.chicho.mode==='ground') {
      actor.roam(state.movement.locked); state.updateChicho(actor.motion.position);
    }
    sprite.setData('cat-mode', state.chicho.mode);
    audio.emitter('chicho-food','chicho-eating','ambience',eating?.85*emitterGain(Math.hypot(player.x-931,player.y-762),45,210):0);
  };
}
