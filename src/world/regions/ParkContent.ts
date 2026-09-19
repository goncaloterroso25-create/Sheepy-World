import type Phaser from 'phaser';
import { BENCH_DIALOGUE } from '../../data/dialogues';
import { GAME_EVENTS } from '../../config/constants';
import { gameEvents } from '../../systems/events';
import { BenchInteraction } from '../../systems/BenchInteraction';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import type { Player } from '../../entities/Player';
import type { ParkObjects } from '../ParkBuilder';
import { remember, restoreMemory } from './MemoryDiscoveries';
import { PORTO_ROUTE_DIALOGUE } from '../../data/namedDialogues';
import { FIRST_DATE_CAR } from './ParkInteractionGeometry';
import { FINAL_MEMORY, lateKeepsakeFragmentsVisible } from '../../data/storyCompletion';
import { addSmallText } from '../../ui/PixelFont';

export function installParkContent(scene: Phaser.Scene, park: ParkObjects, player: Player,
  state: GameStateStore, interactions: InteractionSystem): BenchInteraction {
  park.fragment.destroy(); park.artifact.destroy(); park.npc.destroy();
  const benchInteraction = new BenchInteraction(scene, player, park.bench, state, () => {
    scene.time.delayedCall(650,()=>{
      if(!benchInteraction.active)return;
      gameEvents.emit(GAME_EVENTS.dialogueStart, BENCH_DIALOGUE);
      remember(scene, state, 'first-date', 'first-date-bench');
      scene.time.delayedCall(500,()=>{
        if (!restoreMemory(scene,state,'first-date') && !state.memoryHasClue('first-date','first-date-car')) {
          gameEvents.emit(GAME_EVENTS.notification,{title:'Something is missing',detail:'The bench remembers a road. Maybe a car nearby.'});
        }
      });
    });
  });
  interactions.register({ id: 'familiar-bench', object: park.bench, prompt: 'Sit',discoveryCue:'MEMORY_RESONANCE',
    discoveryCueEnabled: () => !state.memoryHasClue('first-date', 'first-date-bench'),
    approach: { anchor: { x: park.bench.x, y: park.bench.y + 36 }, radius: 34, preferredFacing: 'up',
      approachSide: 'down', body: { x: park.bench.x - 30, y: park.bench.y - 10, width: 60, height: 24 } },
    enabled: () => !benchInteraction.active && state.snapshot.encounters.includes('mentalist-case-resolved'), interact: () => benchInteraction.sit() });
  const benchMemory=scene.add.graphics().setDepth(Math.round(park.bench.y+17));
  const drawRememberedBench=():void=>{
    benchMemory.clear();
    if(!state.snapshot.memories['first-date']?.restored)return;
    benchMemory.fillStyle(0xe6b86f,.34).fillRect(park.bench.x-37,park.bench.y+10,74,4);
    for(const [x,y] of [[-42,23],[-31,27],[34,24],[44,20],[23,31]] as const)
      benchMemory.fillStyle(0xd4774f,.9).fillRect(park.bench.x+x,park.bench.y+y,3,2);
  };
  drawRememberedBench();
  const unsubscribeBench=state.subscribe(drawRememberedBench);
  scene.events.once('shutdown',unsubscribeBench);
  let keepsakePaper:Phaser.GameObjects.Container|undefined;
  const syncSecondKeepsake=():void=>{
    const shouldExist=lateKeepsakeFragmentsVisible(state.snapshot)&&!state.memoryHasClue(FINAL_MEMORY,'keepsake-second');
    if(shouldExist&&!keepsakePaper){
      const paper=scene.add.graphics();
      paper.fillStyle(0x76513a).fillRect(-13,-8,27,18);
      paper.fillStyle(0xffedbd).fillRect(-12,-10,25,17);
      paper.lineStyle(1,0xc5a77a).lineBetween(-11,-9,1,-2).lineBetween(1,-2,12,-9);
      const marker=addSmallText(scene,1,-4,'II',0x76513a).setOrigin(.5);
      keepsakePaper=scene.add.container(951,405,[paper,marker]).setName('keepsake-second-paper').setDepth(412);
      interactions.register({id:'second-keepsake-envelope',object:keepsakePaper,prompt:'Examine the torn paper',range:25,
        discoveryCue:'MEMORY_RESONANCE',approach:{anchor:{x:951,y:430},radius:25,preferredFacing:'up'},interact:()=>{
          if(remember(scene,state,FINAL_MEMORY,'keepsake-second'))gameEvents.emit(GAME_EVENTS.notification,{
            title:'SECOND HALF',detail:'A torn piece of something. Why now?',
          });
        }});
    }else if(!shouldExist&&keepsakePaper){
      interactions.unregister('second-keepsake-envelope');keepsakePaper.destroy(true);keepsakePaper=undefined;
    }
  };
  syncSecondKeepsake();const unsubscribeKeepsake=state.subscribe(syncSecondKeepsake);
  scene.events.once('shutdown',()=>{unsubscribeKeepsake();interactions.unregister('second-keepsake-envelope');});
  const details = [
    ['rustling-bush', park.details.bush, 'Rustle', 'Something small disagrees with being perceived.'],
  ] as const;
  details.forEach(([id, object, prompt, detail]) => interactions.register({ id, object, range: 34, prompt,
    interact: () => gameEvents.emit(GAME_EVENTS.notification, { title: prompt, detail }) }));
  scene.add.image(374, 130, 'car-cream').setDepth(149);
  scene.add.image(FIRST_DATE_CAR.x, FIRST_DATE_CAR.y, FIRST_DATE_CAR.texture).setDepth(149);
  scene.add.image(506, 130, 'car-red').setDepth(149);
  interactions.register({ id: FIRST_DATE_CAR.id,
    object: scene.add.zone(FIRST_DATE_CAR.approach.anchor.x, FIRST_DATE_CAR.approach.anchor.y, 1, 1),
    prompt: 'Inspect',discoveryCue:'MEMORY_RESONANCE',
    discoveryCueEnabled: () => !state.memoryHasClue('first-date', 'first-date-car'),
    approach: FIRST_DATE_CAR.approach, interact: () => {
      gameEvents.emit(GAME_EVENTS.notification,{title:'A car.',detail:'You can do a lot of things in a car, I suppose.'});
      if (!remember(scene, state, 'first-date', 'first-date-car')) gameEvents.emit(GAME_EVENTS.notification,
        { title: 'A car.', detail: 'Still parked. Still suspiciously familiar.' });
    } });

  // The route begins outside Porto: a small park noticeboard promises only an
  // interesting band in the city. It deliberately withholds name and origin.
  const notice = scene.add.graphics().setDepth(573);
  notice.fillStyle(0x654536).fillRect(1084,510,7,72).fillRect(1152,510,7,72).fillRect(1078,505,87,8);
  notice.fillStyle(0xd8c49f).fillRect(1092,516,59,43);
  notice.fillStyle(0x3b3140).fillRect(1097,521,49,18);
  for(let i=0;i<5;i++) notice.fillStyle([0xb55d5e,0xd09a55,0x708f8a,0x7f668b,0xc17b5b][i]!)
    .fillRect(1100+i*9,526+(i%2)*3,5,10);
  notice.fillStyle(0x73564c).fillRect(1098,544,47,2).fillRect(1104,550,35,2);
  interactions.register({
    id:'performance-fourth-date',
    object:scene.add.zone(1121,566,1,1),
    prompt:'Read poster',
    discoveryCue:'INTERESTING',
    approach:{anchor:{x:1121,y:566},shape:{x:1084,y:554,width:75,height:24},radius:40,preferredFacing:'up'},
    interact:()=>{
      if (remember(scene,state,'porto-performance','performance-fourth-date')) {
        scene.time.delayedCall(450,()=>gameEvents.emit(GAME_EVENTS.notification,{
          title:'A little venue poster',
          detail:'An interesting band is playing in Porto.',
        }));
      } else {
        gameEvents.emit(GAME_EVENTS.notification,{
          title:'A little venue poster',
          detail:'An interesting band is playing in Porto.',
        });
      }
    },
  });

  const traveller=scene.add.image(128,430,'person-braid-0').setOrigin(.5,1).setDepth(430).setTint(0x8fc4bb);
  scene.tweens.add({targets:traveller,x:176,duration:2600,yoyo:true,repeat:-1,ease:'Stepped',easeParams:[8],
    onUpdate:()=>traveller.setDepth(Math.round(traveller.y))});
  const travellerAvailable=():boolean=>state.memoryHasClue('porto-performance','performance-fourth-date')
    &&!state.memoryHasClue('porto-performance','performance-night');
  const refreshTraveller=():void=>{traveller.setVisible(travellerAvailable()).setActive(travellerAvailable());};
  refreshTraveller();
  const unsubscribeTraveller=state.subscribe(refreshTraveller);
  interactions.register({id:'porto-route-traveller',object:traveller,prompt:'Talk',discoveryCue:'IMPORTANT_NPC',
    enabled:travellerAvailable,approach:()=>({anchor:{x:traveller.x,y:traveller.y+10},radius:48}),
    interact:()=>gameEvents.emit(GAME_EVENTS.dialogueStart,PORTO_ROUTE_DIALOGUE)});
  const madeira=():void=>{remember(scene,state,'porto-performance','performance-night');};
  gameEvents.on('performance-madeira-clue',madeira);scene.events.once('shutdown',()=>{
    unsubscribeTraveller();gameEvents.off('performance-madeira-clue',madeira);
  });
  return benchInteraction;
}
