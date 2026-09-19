import { describe, expect, it, vi } from 'vitest';
import { createDefaultSave, SaveRepository } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';
import { goncaloHomeAvailable } from '../src/data/homeAccess';
import { FINAL_MEMORY, KEEPSAKE_ANCHOR_MEMORIES, KEEPSAKE_HALVES, STORY_FLAGS } from '../src/data/storyCompletion';
import { memoryKeepsakes } from '../src/ui/MemoryKeepsakes';
import { WORLD_REGIONS } from '../src/world/regions/definitions';
import { calculatePixelPerfectSize } from '../src/systems/PixelScaleManager';

describe('7C late village access and memory-derived paper',()=>{
  it.each([0,1,2,3])('requires all three restored anchors (%i restored)',count=>{
    const save=createDefaultSave();
    KEEPSAKE_ANCHOR_MEMORIES.forEach((id,i)=>{save.memories[id]={foundFragmentIds:['found'],restored:i<count};});
    expect(goncaloHomeAvailable(save)).toBe(count===3);
    expect(memoryKeepsakes(save)).toHaveLength(count);
  });
  it('does not decorate for fragments alone',()=>{
    const save=createDefaultSave();
    save.memories['snow-day']={foundFragmentIds:['snow'],restored:false};
    expect(memoryKeepsakes(save)).toEqual([]);
  });
  it.each(['visited','inside','complete',...KEEPSAKE_HALVES])('preserves access paths: %s',kind=>{
    const save=createDefaultSave();
    if(kind==='visited')save.discoveredLocations.push('goncalo-home');
    else if(kind==='inside')save.worldLocation={regionId:'goncalo-home',entryId:'front-door'};
    else if(kind==='complete')save.flags[STORY_FLAGS.complete]='true';
    else save.memories[FINAL_MEMORY]={foundFragmentIds:[kind],restored:false};
    const repo=new SaveRepository(new MemoryStorage());repo.save(save);
    const loaded=repo.load(), before=JSON.stringify(loaded);
    expect(goncaloHomeAvailable(loaded)).toBe(true);
    expect(JSON.stringify(loaded)).toBe(before);
  });
  it('removes the Autumn door and provides a village round-trip',()=>{
    expect(WORLD_REGIONS['autumn-parklands'].exits.some(e=>e.destination.regionId==='goncalo-home')).toBe(false);
    const entrance=WORLD_REGIONS['vila-meow'].exits.find(e=>e.id==='vila-south-home')!;
    expect(entrance.door).toBe(true);
    expect(entrance.destination).toEqual({regionId:'goncalo-home',entryId:'front-door'});
    const back=WORLD_REGIONS['goncalo-home'].exits[0]!;
    expect(back.destination.regionId).toBe('vila-meow');
    expect(WORLD_REGIONS['vila-meow'].entries[back.destination.entryId]).toBeDefined();
  });
  it.each([[1920,1080,1],[1537,865,1],[1280,720,1],[1024,768,1.25],[375,240,1]])('letterboxes without clipping at %ix%i @%s', (w,h,dpr)=>{
    const s=calculatePixelPerfectSize(w,h,dpr);
    expect(s.cssWidth).toBeLessThanOrEqual(w);expect(s.cssHeight).toBeLessThanOrEqual(h);
    expect(s.cssWidth/s.cssHeight).toBeCloseTo(640/360);
    if(w*dpr>=640&&h*dpr>=360)expect(Number.isInteger(s.physicalScale)).toBe(true);
  });
});

describe('7C browser fullscreen failures',()=>{
  it('uses actual browser state and handles rejected/unsupported requests without throwing',async()=>{
    const requestFullscreen=vi.fn().mockRejectedValue(new Error('gesture required'));
    const documentStub={fullscreenElement:null as object|null,fullscreenEnabled:true,
      querySelector:()=>({requestFullscreen}),exitFullscreen:vi.fn().mockResolvedValue(undefined)};
    vi.stubGlobal('document',documentStub);
    const {fullscreen}=await import('../src/systems/Fullscreen');
    const listener=vi.fn(),unsubscribe=fullscreen.subscribe(listener);
    await expect(fullscreen.toggle()).resolves.toBeUndefined();
    expect(fullscreen.label).toBe('FULLSCREEN: OFF');expect(fullscreen.message).toContain('CLICK OR KEY');
    expect(listener).toHaveBeenCalledTimes(1);unsubscribe();
    documentStub.fullscreenElement={};expect(fullscreen.label).toBe('FULLSCREEN: ON');
    await fullscreen.toggle();expect(documentStub.exitFullscreen).toHaveBeenCalledTimes(1);
    documentStub.fullscreenElement=null;documentStub.fullscreenEnabled=false;
    await fullscreen.toggle();expect(fullscreen.label).toBe('FULLSCREEN: UNAVAILABLE');
    expect(requestFullscreen).toHaveBeenCalledTimes(1);expect(listener).toHaveBeenCalledTimes(1);
  });
});
