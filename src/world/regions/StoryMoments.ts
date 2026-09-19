import type Phaser from 'phaser';
import type { GameStateStore } from '../../systems/GameStateStore';
import { FINAL_MEMORY, STORY_MEMORIES, STORY_MOMENTS, lateKeepsakeFragmentsVisible } from '../../data/storyCompletion';
import { remember, restoreMemory } from './MemoryDiscoveries';
import { gameEvents } from '../../systems/events';
import { GAME_EVENTS } from '../../config/constants';

export function storyPrompt(state:GameStateStore,id:string,fallback:string):string {
  const memory=id==='home-couch'?'everyday-us':undefined;
  if(!memory)return fallback;
  return !state.snapshot.memories[memory]?.restored&&STORY_MEMORIES[memory]!.fragmentIds.every(f=>state.memoryHasClue(memory,f))?'Remember':fallback;
}

export function storyMoment(scene:Phaser.Scene,state:GameStateStore,id:string):void {
  const moment=STORY_MOMENTS[id];
  if(!moment)return;
  const [memory,fragment]=moment;
  const newlyFound=remember(scene,state,memory,fragment);
  if(newlyFound&&STORY_MEMORIES[memory]!.fragmentIds.every(f=>state.memoryHasClue(memory,f))){
    scene.time.delayedCall(1100,()=>gameEvents.emit('world-cue',{
      title:'The pieces are waiting',detail:STORY_MEMORIES[memory]!.nextHint!,
    }));
  }
  // Return to a place, not a list. The last clue and restoration stay separate actions.
  if(!newlyFound&&id==='home-couch'){
    if(!restoreMemory(scene,state,memory)&&state.snapshot.memories[memory]?.restored)gameEvents.emit(GAME_EVENTS.notification,{
      title:'Our kind of evening',detail:'Cof within reach. Snacks between us. Your place on the couch is always kept. The ordinary little things mattered too.',
    });
  }
  if(id==='goncalo-bedside-mug'&&lateKeepsakeFragmentsVisible(state.snapshot)) {
    remember(scene,state,FINAL_MEMORY,'keepsake-first');
  }
  if(!state.finalRouteReady&&!newlyFound&&!state.snapshot.memories[memory]?.restored)gameEvents.emit(GAME_EVENTS.notification,{
    title:'Small things',detail:memory==='everyday-us'?'Cof, the couch, a snack, a bedside mug. Nothing needed buying.'
      :'A warm cup, the flags, the view. The Fair is full of little detours.',
  });
}
export function bedsidePrompt(state:GameStateStore):string {
  if(lateKeepsakeFragmentsVisible(state.snapshot)&&!state.memoryHasClue(FINAL_MEMORY,'keepsake-first'))return 'Unfold the small paper';
  if(!state.memoryHasClue('everyday-us','everyday-morning'))return 'Remember the morning mug';
  return 'Inspect our morning mug';
}
