import Phaser from 'phaser';
import { drawSnowProofCarCover } from '../../art/snowStyleProof';
import { addPerformancePerformance } from '../../art/performanceStyle';
import { GAME_EVENTS, REGISTRY_KEYS } from '../../config/constants';
import { PHOTO_CLOSED, PHOTO_OPEN, type PersonalPhotoId } from '../../data/personalPhotos';
import type { Player } from '../../entities/Player';
import { idleTextureKey } from '../../entities/playerAnimations';
import type { AudioSystem } from '../../systems/AudioSystem';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { SpatialAudio, type SoundEmitter } from '../../systems/SpatialAudio';
import { gameEvents } from '../../systems/events';
import { addSmallText } from '../../ui/PixelFont';
import { HOME_APPROACHES } from '../../data/interactionApproaches';
import type { RegionId } from './definitions';
import { remember, restoreMemory } from './MemoryDiscoveries';
import { NAMED_DIALOGUES } from '../../data/namedDialogues';
import type { DiscoveryCueLevel } from '../../systems/DiscoveryCue';
import {
  COMPUTER_OPEN,
  computerTerminalSession,
  type ComputerOpenPayload,
} from '../../data/computerTerminal';
import { RESTORED_JERONIMO_INTERACTION } from '../../data/snowContent';
import { storyMoment, bedsidePrompt } from './StoryMoments';
import { FINAL_MEMORY, lateKeepsakeFragmentsVisible } from '../../data/storyCompletion';

export const FUTURE_GONCALO_ID = 'goncalo'; // Reserved. No physical character in this phase.
export const PARENTS_SNORING_EMITTER = { id:'parents_snoring', x:824, y:170, inner:52, radius:170, key:undefined };
export const SNOW_PLAY_AREAS = [
  // Walkable south shoreline of the frozen lake. The lake body itself is a
  // solid, so keeping this strip outside it makes the authored action usable.
  { x:118,y:720,width:305,height:68 },
  { x:704,y:678,width:205,height:116 },
] as const;
export function snowPlayAreaContains(point:{x:number;y:number}):boolean {
  return SNOW_PLAY_AREAS.some(area=>point.x>=area.x&&point.x<=area.x+area.width
    &&point.y>=area.y&&point.y<=area.y+area.height);
}

export function installExpansionContent(scene: Phaser.Scene, id: RegionId, state: GameStateStore, interactions: InteractionSystem, player: Player): () => void {
  const audio=scene.registry.get(REGISTRY_KEYS.audio) as AudioSystem;
  const emitters: SoundEmitter[]=[];
  const tell=(title:string,detail:string):void=>{gameEvents.emit(GAME_EVENTS.notification,{title,detail});};
  const target=(key:string,x:number,y:number,prompt:string,action:()=>void,range=34,discoveryCue:DiscoveryCueLevel='NONE'):void=>{
    interactions.register({id:key,object:scene.add.zone(x,y,1,1),prompt,approach:{anchor:{x,y},radius:range,preferredFacing:'up'},discoveryCue,interact:action});
  };
  const closed=(photo:PersonalPhotoId):void=>{
    state.completeEncounter(`photo-${photo}-seen`);
  };
  gameEvents.on(PHOTO_CLOSED,closed); scene.events.once('shutdown',()=>gameEvents.off(PHOTO_CLOSED,closed));
  if(id==='river-town') audio.setRegionAmbience('river-bed');
  if(id==='vila-meow') audio.setRegionAmbience('vila-bed');
  if(id==='old-world-festival') {
    audio.setRegionAmbience('forest-bed');
    emitters.push({id:'forest-stream',key:'forest-stream',channel:'ambience',x:698,y:1790,inner:55,radius:300,gain:.95});
    emitters.push({id:'medieval-fair',key:'medieval-fair',channel:'music',x:690,y:880,inner:280,radius:720,gain:.62});
  }
  if(id==='goncalo-home') {
    scene.add.image(249,158,'cof-mug').setDepth(179);
    let keepsakePaper:Phaser.GameObjects.Graphics|undefined;
    const syncKeepsakePaper=():void=>{
      const shouldExist=lateKeepsakeFragmentsVisible(state.snapshot)&&!state.memoryHasClue(FINAL_MEMORY,'keepsake-first');
      if(shouldExist&&!keepsakePaper){
        keepsakePaper=scene.add.graphics().setName('keepsake-first-paper').setDepth(177);
        keepsakePaper.fillStyle(0x76513a).fillRect(232,158,27,17);
        keepsakePaper.fillStyle(0xffedbd).fillRect(233,156,25,17);
        keepsakePaper.lineStyle(1,0xc5a77a).lineBetween(234,157,246,164).lineBetween(246,164,257,157);
        addSmallText(scene,246,161,'I',0x76513a).setName('keepsake-first-label').setOrigin(.5).setDepth(178);
      }else if(!shouldExist&&keepsakePaper){
        keepsakePaper.destroy();keepsakePaper=undefined;
        scene.children.getByName('keepsake-first-label')?.destroy();
      }
    };
    syncKeepsakePaper();const unsubscribeKeepsakePaper=state.subscribe(syncKeepsakePaper);
    scene.events.once('shutdown',unsubscribeKeepsakePaper);
    interactions.register({id:'goncalo-bedside-mug',object:scene.add.zone(249,184,1,1),prompt:()=>bedsidePrompt(state),
      approach:{anchor:{x:249,y:190},radius:19,preferredFacing:'up'},priority:25,interact:()=>{
        const first=!state.memoryHasClue('everyday-us','everyday-morning');
        const hadKeepsake=state.memoryHasClue(FINAL_MEMORY,'keepsake-first');
        storyMoment(scene,state,'goncalo-bedside-mug');
        const foundKeepsake=!hadKeepsake&&state.memoryHasClue(FINAL_MEMORY,'keepsake-first');
        tell(foundKeepsake?'FIRST HALF':'Our morning mug',foundKeepsake?'A torn piece, tucked beneath the coaster. Why now?'
          :first?'Within reach, even on a sleepy morning.':'Still warm. Still familiar.');
      }});
    target('cheeky-notes',289,181,'Read the pinned love notes',()=>gameEvents.emit(PHOTO_OPEN,'notes'),18);
    target('breaking-bad-frame',347,156,'Look closer',()=>gameEvents.emit(PHOTO_OPEN,'frame'));
    const pcGlow=scene.add.rectangle(402,196,54,28,0x80d4c6,.28).setDepth(271).setVisible(false);
    scene.tweens.add({targets:pcGlow,alpha:{from:.18,to:.48},duration:760,yoyo:true,repeat:-1,ease:'Stepped',easeParams:[3]});
    const refreshPc=():void=>{ pcGlow.setVisible(state.pendingComputerMemoryId!==undefined); };
    refreshPc();
    const unsubscribePc=state.subscribe(refreshPc);
    scene.events.once('shutdown',unsubscribePc);
    interactions.register({
      id:'bedroom-computer',
      object:scene.add.zone(370,274,1,1),
      prompt:()=>!state.computerDiscovered?'Use computer':state.pendingComputerMemoryId
        ?'Read screen':state.snapshot.encounters.includes('bedroom-cipher-solved')?'Check screen':'Inspect signal',
      discoveryCue:'INTERESTING',
      discoveryCueEnabled:()=>state.pendingComputerMemoryId!==undefined,
      approach:{anchor:{x:370,y:274},shape:{x:300,y:250,width:136,height:28},radius:40,preferredFacing:'up'},
      interact:()=>{
        const firstDiscovery=state.discoverMemoryComputer();
        const payload:ComputerOpenPayload={
          session:computerTerminalSession(state.snapshot,state.pendingComputerMemoryId,firstDiscovery),
        };
        gameEvents.emit(COMPUTER_OPEN,payload);
      },
    });
    target('rocket-league-controller',434,275,'Inspect controller',()=>tell('PS5 controller','Poor controller, so much Rocket League...'),30);
    target('sister-bed',197,553,'Talk',()=>gameEvents.emit(GAME_EVENTS.dialogueStart,NAMED_DIALOGUES.sister),46);
    target('sister-books',237,486,'Inspect books',()=>tell('A familiar shelf','Harry Potter books, little toys, and a thoroughly defended comfort zone.'));
    target('goncalo-couch',880,267,'Inspect couch',()=>tell('The couch','Suspiciously effective at ending movies early.'));
    target('goncalo-tv',880,176,'Inspect TV',()=>tell('TV','Paused. Someone left the remote in a sensible place. Unsettling.'));
    target('work-desk',1021,335,'Inspect desk',()=>tell("Dad's work corner",'The dining room has a very small commute.'));
    target('hollow-knight-shirt',421,171,'Open wardrobe',()=>{
      state.addArtifact('hollow-knight-shirt'); tell('Hollow Knight Shirt','Folded neatly into your Bag. A familiar little knight.');
    });
    target('goncalo-nuggies',801,671,'Inspect snack',()=>tell('Snack bowl','Nuggies.'));
  }
  if(id==='home-interior') {
    target('naruto-bowl',643,640,'Inspect bowl',()=>tell('Naruto bowl',state.snapshot.memories['snow-day']?.restored
      ?'Black outside. Orange inside. A tiny pale smudge beside the spiral was not there before.'
      :'Black outside. Orange inside. Extremely serious about nuggies.'));
    target('home-hair-tie',331,253,'Inspect hair tie',()=>tell('Hair tie','A small possibility for another day.'),30);
    target('parents-threshold',819,380,'Listen',()=>tell('From the doorway','Que puta de orquestra...'));
    let sleeping=false;
    interactions.register({id:'protagonist-sleep',object:scene.add.zone(180,180,1,1),prompt:'Sleep',approach:HOME_APPROACHES['home-bed'],
      enabled:()=>!sleeping,interact:()=>{
        sleeping=true; state.movement.setLock('cutscene',true); player.setVisible(false);
        const asleep=scene.add.image(119,143,idleTextureKey('down')).setDepth(241);
        const blanket=scene.add.graphics().setDepth(242);
        blanket.fillStyle(0x72576e).fillRect(103,145,34,38).fillStyle(0xa18793).fillRect(103,145,34,3);
        const z=addSmallText(scene,138,121,'Zzz',0xf5e4c5).setDepth(250);
        const dim=scene.add.rectangle(528,432,1056,864,0x252537,.18).setDepth(4500);
        scene.time.delayedCall(2100,()=>{asleep.destroy();blanket.destroy();z.destroy();dim.destroy();player.setVisible(true);sleeping=false;state.movement.setLock('cutscene',false);
          state.unlockAchievement('cozy-nap'); tell('SHEEPY BABY','Cozy cat nap!');});
      }});
    const g=scene.add.graphics().setDepth(242);
    g.fillStyle(0x211e2b).fillRect(772,121,31,22);
    g.fillStyle(0xd9a883).fillRect(779,127,19,14).fillRect(847,119,14,20);
    g.fillStyle(0x8a766a).fillRect(849,136,10,2);
    g.fillStyle(0x34313a).fillRect(781,134,5,1).fillRect(791,134,4,1).fillRect(849,130,3,1).fillRect(855,130,3,1);
    g.fillStyle(0x617768).fillRect(768,144,47,25).fillRect(841,144,28,42);
    addSmallText(scene,792,100,'Zzz',0xe8d8bd).setDepth(248); addSmallText(scene,868,104,'Zzz',0xe8d8bd).setDepth(248);
  }
  if(id==='porto') {
    target('virtudes-bench',375,823,'Pause a moment',()=>tell('A terraced garden','The city has left a little room for the sky.'));
    interactions.register({
      id:'virtudes-picnic',
      object:scene.add.zone(195,748,1,1),
      prompt:'Sit for a snack',
      discoveryCue:'INTERESTING',
      approach:{anchor:{x:195,y:748},shape:{x:154,y:716,width:82,height:45},radius:40},
      interact:()=>tell('A picnic pocket','Blanket, fruit, and a very defensible corner of cheese. You sit for a moment.'),
    });
    const cofServed=():boolean=>state.flag('virtudes-cof-served')==='true';
    const cofMug=scene.add.image(424,374,'cof-mug').setScale(.72).setDepth(406);
    const refreshCof=():void=>{cofMug.setVisible(cofServed());};
    refreshCof();
    const unsubCof=state.subscribe(refreshCof);
    scene.events.once('shutdown',unsubCof);
    interactions.register({
      id:'virtudes-cof-kiosk',
      object:scene.add.zone(405,402,1,1),
      prompt:()=>cofServed()?'Sip Cof':'Order Cof',
      discoveryCue:'INTERESTING',
      approach:{anchor:{x:405,y:402},shape:{x:358,y:388,width:94,height:25},radius:42,preferredFacing:'up'},
      interact:()=>{
        if (!cofServed()) {
          state.setFlag('virtudes-cof-served','true');
          tell('Barista','"One cof." A tiny warm mug appears. No economy, just excellent priorities.');
        } else {
          tell('Cof','One careful sip. The overlook improves by at least twelve percent.');
        }
      },
    });
    const hadBothAtEntry=state.memoryHasClue('porto-performance','performance-fourth-date')&&state.memoryHasClue('porto-performance','performance-night');
    if(hadBothAtEntry)state.completeEncounter('performance-concert-awake');
    const active=()=>state.snapshot.encounters.includes('performance-concert-awake');
    const performance=addPerformancePerformance(scene);
    const refresh=()=>performance.refresh(active(),state.snapshot.memories['porto-performance']?.restored===true);
    refresh();
    const unsub=state.subscribe(refresh);scene.events.once('shutdown',unsub);
    let attendance=0;
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE,(_time:number,delta:number)=>{
      if(!active()||state.memoryHasClue('porto-performance','performance-venue')||Math.hypot(player.x-760,player.y-760)>175)return;
      attendance+=delta;if(attendance>=5200){remember(scene,state,'porto-performance','performance-venue');restoreMemory(scene,state,'porto-performance');}
    });
    emitters.push({id:'performance',key:'performance-concert',channel:'music',x:762,y:685,inner:110,radius:350,gain:.75,enabled:active},
      {id:'river-traffic',key:'road-traffic-bed',channel:'ambience',x:1260,y:1095,inner:160,radius:520,gain:.42});
  }
  if(id==='snow-highlands') {
    audio.setRegionAmbience('snow-bed');
    const car=scene.add.image(601,416,'classic-black-car').setDepth(445).setTint(0x5a768e);
    const snowCover=scene.add.graphics().setDepth(449);
    const jeronimo=scene.add.graphics().setDepth(452);
    const stage=():number=>Math.max(0,Math.min(3,Number(state.flag('snow-car-stage')??0)||0));
    const ready=():boolean=>['snow-jeronimo','snow-weather','snow-play'].every(clue=>state.memoryHasClue('snow-day',clue));
    const drawJeronimo=():void=>{
      jeronimo.clear();
      for(const [x,y,w,h]of [[586,388,29,14],[591,375,21,14],[597,364,13,12]] as const){
        jeronimo.fillStyle(0xc8d4d7).fillRect(x,y+2,w,h-3).fillRect(x+4,y,w-8,h);
        jeronimo.fillStyle(0xf4f5ef).fillRect(x+3,y+1,w-7,3);
      }
      jeronimo.fillStyle(0x4d5f46).fillRect(572,382,21,2).fillRect(610,386,19,2).fillRect(600,359,2,8).fillRect(597,361,8,2);
      jeronimo.fillStyle(0x3a3030).fillRect(600,369,2,2).fillRect(606,369,2,2).fillRect(604,373,2,2);
    };
    const drawCar=():void=>{
      const s=stage();car.setAlpha(s===0?.32:s===1?.58:1);
      drawSnowProofCarCover(snowCover,s);
    };
    drawCar();if(state.snapshot.memories['snow-day']?.restored)drawJeronimo();
    const brush=scene.add.zone(603,454,1,1);
    interactions.register({id:'snow-car-brush',object:brush,prompt:'Brush snow',discoveryCue:'INTERESTING',
      enabled:()=>stage()<3,approach:{anchor:{x:603,y:454},radius:36,preferredFacing:'up'},interact:()=>{
        const next=stage()+1;state.setFlag('snow-car-stage',String(next));drawCar();
        gameEvents.emit(GAME_EVENTS.notification,{title:`Snow cleared ${next} / 3`,detail:next<3
          ?'There is definitely a car under here.'
          :'A BYD emerges. Electric, even under three winters worth of weather.'});
        if(next===3)remember(scene,state,'snow-day','snow-jeronimo');
      }});
    const sticks=scene.add.graphics().setDepth(520);
    sticks.fillStyle(0x5b4637).fillRect(1030,334,69,4).fillRect(1040,325,4,25).fillRect(1061,321,4,30)
      .fillRect(1080,328,4,22);
    sticks.fillStyle(0x6d7258).fillRect(1027,327,20,3).fillRect(1062,337,42,3).fillRect(1044,344,31,3);
    interactions.register({id:'snow-sticks',object:scene.add.zone(1064,353,1,1),prompt:'Choose sticks',discoveryCue:'INTERESTING',
      approach:{anchor:{x:1064,y:353},shape:{x:1028,y:337,width:74,height:24},radius:40,preferredFacing:'up'},interact:()=>{
        if(!remember(scene,state,'snow-day','snow-weather'))tell('Cabin woodpile','Fern-like arms. Someone chose these on purpose.');
      }});
    interactions.register({id:'snow-car-build',object:scene.add.zone(603,454,1,1),prompt:'BUILD SOMETHING',priority:40,discoveryCue:'MEMORY_RESONANCE',
      enabled:()=>stage()===3&&ready()&&!state.snapshot.memories['snow-day']?.restored,
      approach:{anchor:{x:603,y:454},radius:38,preferredFacing:'up'},interact:()=>{
        state.movement.setLock('cutscene',true);let part=0;
        const addPart=():void=>{part++;const pieces=[[586,388,29,14],[591,375,21,14],[597,364,13,12]] as const;
          const piece=pieces[part-1];if(piece){const[x,y,w,h]=piece;jeronimo.fillStyle(0xc8d4d7).fillRect(x,y+2,w,h-3).fillRect(x+4,y,w-8,h);jeronimo.fillStyle(0xf4f5ef).fillRect(x+3,y+1,w-7,3);}
          if(part<3)scene.time.delayedCall(420,addPart);else scene.time.delayedCall(420,()=>{
            drawJeronimo();
            state.setFlag('snow-jeronimo-built','true');restoreMemory(scene,state,'snow-day');state.movement.setLock('cutscene',false);
          });};addPart();
      }});
    interactions.register({...RESTORED_JERONIMO_INTERACTION,object:scene.add.zone(603,403,1,1),
      enabled:()=>state.snapshot.memories['snow-day']?.restored===true,
      interact:()=>gameEvents.emit(PHOTO_OPEN,'jeronimo')});
    let nextThrow=0;
    interactions.register({id:'snowball',object:player,priority:-80,range:1,prompt:'Make a snowball',
      enabled:()=>scene.time.now>nextThrow&&snowPlayAreaContains(player.feetPosition),interact:()=>{
      nextThrow=scene.time.now+650;
      remember(scene,state,'snow-day','snow-play');
      const vector={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[player.facingDirection]!;
      const start={x:player.x,y:player.y}; const end={x:start.x+vector[0]!*58,y:start.y+vector[1]!*58};
      const ball=scene.add.rectangle(start.x,start.y,4,4,0xf4f2ed).setDepth(player.depth+40);
      const flight={t:0};scene.tweens.add({targets:flight,t:1,duration:450,onUpdate:()=>ball.setPosition(Math.round(start.x+(end.x-start.x)*flight.t),Math.round(start.y+(end.y-start.y)*flight.t-Math.sin(flight.t*Math.PI)*21)),
        onComplete:()=>{ball.destroy();const splat=scene.add.graphics().setDepth(end.y+20).fillStyle(0xf1f5ef).fillRect(end.x-6,end.y,13,2).fillRect(end.x-2,end.y-3,3,7);scene.time.delayedCall(400,()=>splat.destroy());}});
    }});
  }
  const spatial=new SpatialAudio(audio,emitters);
  return ()=>spatial.update(player.feetPosition,scene.game.loop.delta);
}
