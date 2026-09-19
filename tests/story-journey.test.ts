import { describe,it,expect,vi } from 'vitest';
vi.mock('../src/systems/MovementState',()=>({MovementState:class{reset(){} }}));
vi.mock('../src/systems/events',()=>({gameEvents:{emit:vi.fn()}}));
vi.mock('../src/world/regions/MemoryDiscoveries',()=>({remember:vi.fn(),restoreMemory:vi.fn()}));
import { FINAL_LETTER,letterPages } from '../src/data/finalLetter';
import { ADVENTURE_STATIONS,JOURNEY_POCKETS,PAPER_WISH,memoryEcho,BELGIUM_DIALOGUE } from '../src/data/finalJourney';
import { JOURNEY_PHOTOS } from '../src/data/journeyPhotos';
import { MEMORIES } from '../src/data/memories';
import { FINAL_MEMORY, KEEPSAKE_HALVES, STORY_MOMENTS } from '../src/data/storyCompletion';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { bedsidePrompt } from '../src/world/regions/StoryMoments';
describe('Batch 6C journey contract',()=>{
  it('keeps the new restored-page copy inside the four-line handwriting area',()=>{
    for(const id of ['everyday-us','adventures']){
      const lines=MEMORIES[id]!.restoredText!.split('\n');expect(lines.length).toBeLessThanOrEqual(4);
      expect(lines.every(line=>line.length<=20)).toBe(true);
    }
  });
  it('keeps only the public omission notice in a short player-advanced beat',()=>{
    const pages=letterPages();expect(pages).toHaveLength(1);
    expect(pages.every(p=>p.length<=180)).toBe(true);
    expect(pages.join(' ').replace(/\s+/g,' ')).toBe(FINAL_LETTER.replace(/\s+/g,' '));
    expect(pages.at(-1)).toBe('[The original anniversary letter is private and has been omitted from the public portfolio edition.]');
  });
  it('orders the continuous chronological walk and keeps omitted memories neutral',()=>{
    expect(JOURNEY_POCKETS.map(p=>p.id)).toEqual(['first-date','performance','everyday','snow','eclipse','buggy','festival-clue','travel-clue','sleepy','pets','keepsake']);
    expect(JOURNEY_POCKETS.every((p,i,a)=>!i||p.y<a[i-1]!.y)).toBe(true);
    expect(memoryEcho(false)).not.toMatch(/restored/);expect(memoryEcho(true)).toContain('restored');
    expect(PAPER_WISH).toBe('[A private personal wish has been omitted from the public portfolio edition.]');
    expect(BELGIUM_DIALOGUE.nodes.flag!.choices!.map(c=>c.label)).toEqual(['Belgium','Germany']);
  });
  it('maps every public album to the four fictional placeholder images',()=>{
    const assets=new Map(Object.values(JOURNEY_PHOTOS).flatMap(p=>p.gallery.map(f=>[f.key,f.url] as const)));
    expect(assets.size).toBe(12);
    const frames=Object.values(JOURNEY_PHOTOS).flatMap(p=>p.gallery);
    expect(frames.filter(f=>f.kind==='image')).toHaveLength(12);
    expect(frames.filter(f=>(f as {kind:string}).kind==='video')).toHaveLength(0);
    expect(JOURNEY_PHOTOS.pets.gallery).toHaveLength(1);
    for(const url of assets.values())expect(url).toMatch(/^\/assets\/placeholders\/[\w-]+\.png$/);
    expect(JOURNEY_PHOTOS.badge.caption).toBe('Identifying details were removed from this public card.');
  });
  it('preserves Adventures IDs, idempotent badge and keepsake-half persistence',()=>{
    let text:string|null=null;const repo=new SaveRepository({getItem:()=>text,setItem:(_k,v)=>{text=v;},removeItem:()=>{text=null;}});
    const state=new GameStateStore(repo);
    expect(ADVENTURE_STATIONS.map(s=>s.fragment).sort()).toEqual([...MEMORIES.adventures!.fragmentIds].sort());
    expect(ADVENTURE_STATIONS.map(s=>[s.fragment,s.regionId])).toEqual([
      ['adventures-flags','old-world-festival'],
      ['adventures-cup','river-town'],
      ['adventures-view','porto'],
    ]);
    expect(new Set(ADVENTURE_STATIONS.map(s=>s.id)).size).toBe(3);
    expect(['hydromel-cup','festival-flags','fair-overlook'].every(id=>!(id in STORY_MOMENTS))).toBe(true);
    expect(bedsidePrompt(state)).toBe('Remember the morning mug');
    state.collectFragment('everyday-us','everyday-morning',4);
    expect(bedsidePrompt(state)).toBe('Inspect our morning mug');
    for(const id of ['first-date','snow-day','porto-performance']){
      for(const fragment of MEMORIES[id]!.fragmentIds)state.collectFragment(id,fragment,99);
      state.restoreMemory(id);
    }
    expect(bedsidePrompt(state)).toBe('Unfold the small paper');
    for(const f of KEEPSAKE_HALVES)state.collectFragment(FINAL_MEMORY,f,3);
    expect(bedsidePrompt(state)).toBe('Inspect our morning mug');
    for(const station of ADVENTURE_STATIONS)state.collectFragment('adventures',station.fragment,3);
    expect(state.restoreMemory('adventures')).toBe(true);expect(state.restoreMemory('adventures')).toBe(false);
    state.addArtifact('protagonist-keepsake-badge');state.addArtifact('protagonist-keepsake-badge');state.setFlag('final-cats-joined','true');
    const loaded=new GameStateStore(repo);expect(loaded.snapshot).toEqual(state.snapshot);
    expect(loaded.snapshot.inventory.filter(id=>id==='protagonist-keepsake-badge')).toHaveLength(1);
    expect(loaded.snapshot.memories.adventures?.restored).toBe(true);
    expect(loaded.memoryHasClue(FINAL_MEMORY,'keepsake-second')).toBe(true);
    expect(loaded.flag('final-cats-joined')).toBe('true');
  });
});
