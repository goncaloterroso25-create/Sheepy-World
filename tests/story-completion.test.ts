import { describe,it,expect,vi } from 'vitest';
// The unrelated movement module currently installs a window listener at import.
vi.mock('../src/systems/MovementState',()=>({MovementState:class{reset(){} }}));
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository,createDefaultSave,sanitizeSave } from '../src/systems/SaveSystem';
import { MEMORIES } from '../src/data/memories';
import { FINAL_MEMORY,KEEPSAKE_ANCHOR_MEMORIES,KEEPSAKE_HALVES,NON_FINAL_MEMORIES,STORY_FLAGS,finalGateOpen,lateKeepsakeFragmentsVisible,restoredEchoes } from '../src/data/storyCompletion';
import { memoryDiscoveryState } from '../src/ui/CollectionModels';

function setup(){let text:string|null=null;const repo=new SaveRepository({getItem:()=>text,setItem:(_k,v)=>{text=v;},removeItem:()=>{text=null;}});return {repo,state:new GameStateStore(repo)};}
function restore(state:GameStateStore,id:string){for(const f of MEMORIES[id]!.fragmentIds)state.collectFragment(id,f,99);expect(state.snapshot.memories[id]?.restored).toBe(false);expect(state.restoreMemory(id)).toBe(true);}
describe('Story critical path',()=>{
  it('keeps both keepsake halves hidden until all three anchor memories are restored',()=>{
    const {state}=setup();
    expect(lateKeepsakeFragmentsVisible(state.snapshot)).toBe(false);
    KEEPSAKE_ANCHOR_MEMORIES.forEach((id,index)=>{
      restore(state,id);
      expect(lateKeepsakeFragmentsVisible(state.snapshot)).toBe(index===KEEPSAKE_ANCHOR_MEMORIES.length-1);
    });
    const owned=setup().state;owned.collectFragment(FINAL_MEMORY,'keepsake-second',3);
    expect(lateKeepsakeFragmentsVisible(owned.snapshot)).toBe(true);
    expect(owned.memoryHasClue(FINAL_MEMORY,'keepsake-second')).toBe(true);
  });
  it.each([[3,2,false],[4,1,false],[4,0,false],[4,2,true],[5,2,true]])('gate: %i restored, half case %i => %s',(count,halfCase,open)=>{
    const {state}=setup();NON_FINAL_MEMORIES.slice(0,count).forEach(id=>restore(state,id));
    const halves=halfCase===2?KEEPSAKE_HALVES:halfCase===1?[KEEPSAKE_HALVES[0]]:[KEEPSAKE_HALVES[1]];
    halves.forEach(f=>state.collectFragment(FINAL_MEMORY,f,3));expect(finalGateOpen(state.snapshot)).toBe(open);
  });
  it.each(NON_FINAL_MEMORIES)('every 4/5 combination excludes unrestored %s from echoes',missing=>{
    const {state}=setup();NON_FINAL_MEMORIES.filter(id=>id!==missing).forEach(id=>restore(state,id));
    KEEPSAKE_HALVES.forEach(f=>state.collectFragment(FINAL_MEMORY,f,3));expect(state.finalRouteReady).toBe(true);
    const other=createDefaultSave();other.memories[missing]={foundFragmentIds:[],restored:true};
    expect(restoredEchoes(state.snapshot)).toHaveLength(4);
    expect(restoredEchoes(state.snapshot)).not.toContain(restoredEchoes(other)[0]);
  });
  it('persists each critical checkpoint, restores separately, and never duplicates completion',()=>{
    const {repo}=setup();let state=new GameStateStore(repo);
    const reload=()=>{const before=state.snapshot;state=new GameStateStore(repo);expect(state.snapshot).toEqual(sanitizeSave(before));};
    reload();state.collectFragment(FINAL_MEMORY,'keepsake-first',3);reload();state.collectFragment(FINAL_MEMORY,'keepsake-second',3);reload();
    expect(state.restoreMemory(FINAL_MEMORY)).toBe(false);expect(memoryDiscoveryState(MEMORIES[FINAL_MEMORY]!,state.snapshot.memories[FINAL_MEMORY])).toBe('DISCOVERING');
    NON_FINAL_MEMORIES.slice(1).forEach(id=>restore(state,id));reload();expect(state.finalRouteReady).toBe(true);
    expect(state.completeStory()).toBe(false);state.arriveAt({regionId:'final-park',entryId:'quiet-branch'});reload();
    expect(state.acknowledgeFinalAuthor()).toBe(false);
    expect(state.collectFragment(FINAL_MEMORY,'final-picnic',3)).toBe(true);reload();
    expect(state.snapshot.memories[FINAL_MEMORY]?.restored).toBe(false);expect(state.restoreMemory(FINAL_MEMORY)).toBe(true);reload();
    expect(state.completeStory()).toBe(false);expect(state.acknowledgeFinalAuthor()).toBe(true);reload();
    expect(state.completeStory()).toBe(true);reload();expect(state.flag(STORY_FLAGS.complete)).toBe('true');
    expect(state.completeStory()).toBe(false);expect(state.restoreMemory(FINAL_MEMORY)).toBe(false);
    expect(state.collectFragment(FINAL_MEMORY,'keepsake-first',3)).toBe(false);expect(state.snapshot.memories[FINAL_MEMORY]?.foundFragmentIds).toHaveLength(3);
  });
  it('gives old saves empty safe story defaults without changing existing restored pages',()=>{
    const old={...createDefaultSave(),version:7};old.memories['first-date']={foundFragmentIds:[...MEMORIES['first-date']!.fragmentIds],restored:true};
    const loaded=sanitizeSave(old);expect(loaded.memories['first-date']?.restored).toBe(true);expect(finalGateOpen(loaded)).toBe(false);
    expect(loaded.flags[STORY_FLAGS.complete]).toBeUndefined();expect(loaded.memories[FINAL_MEMORY]).toBeUndefined();
  });
  it('does not count the final or test memory toward the gate',()=>{
    const {state}=setup();NON_FINAL_MEMORIES.slice(0,3).forEach(id=>restore(state,id));restore(state,FINAL_MEMORY);restore(state,'test-memory');
    expect(state.finalRouteReady).toBe(false);
  });
});
