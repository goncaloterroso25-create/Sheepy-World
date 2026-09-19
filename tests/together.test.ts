import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/systems/MovementState',()=>({MovementState:class{reset(){} }}));
import { TogetherState, togetherEnabled, togetherUnlocked, TOGETHER_PREFERENCE } from '../src/systems/TogetherState';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository, createDefaultSave, sanitizeSave } from '../src/systems/SaveSystem';
import { TogetherMotion, handSlot, pairDistance, pairSafe, pairSegmentSafe, safeJoin } from '../src/systems/TogetherMotion';
import { WORLD_REGIONS } from '../src/world/regions/definitions';
import { TOGETHER_ACTIVITIES } from '../src/data/togetherActivities';
import { getControlHint, observeController, observeKeyboardMouse } from '../src/config/controllerPresentation';
const advance=(model:TogetherState,ms:number,blocked=false,micro=false)=>{let event:ReturnType<TogetherState['tick']>={photo:false};for(let elapsed=0;elapsed<ms;elapsed+=100){const e=model.tick(Math.min(100,ms-elapsed),blocked,micro);if(e.farter||e.photo)event=e;}return event;};

describe('Together completion contract and preference',()=>{
  it('requires only canonical completion; old completed saves default ON',()=>{
    const save=createDefaultSave();save.flags[TOGETHER_PREFERENCE]='on';
    expect(togetherUnlocked(save)).toBe(false);expect(togetherEnabled(save)).toBe(false);
    save.flags['year-one-complete']='true';delete save.flags[TOGETHER_PREFERENCE];
    expect(togetherEnabled(sanitizeSave(save))).toBe(true);
    save.flags[TOGETHER_PREFERENCE]='off';expect(togetherEnabled(sanitizeSave(save))).toBe(false);
  });
  it('persists only an existing flag, retaining all existing save fields',()=>{
    let data=JSON.stringify({...createDefaultSave(),flags:{'year-one-complete':'true'}});
    const repository=new SaveRepository({getItem:()=>data,setItem:(_key,v)=>{data=v;},removeItem:()=>{}});
    const state=new GameStateStore(repository),before=structuredClone(state.snapshot);
    state.setFlag(TOGETHER_PREFERENCE,'off');const loaded=repository.load();
    expect(togetherEnabled(loaded)).toBe(false);delete loaded.flags[TOGETHER_PREFERENCE];expect(loaded).toEqual(before);
    state.setFlag(TOGETHER_PREFERENCE,'on');expect(togetherEnabled(repository.load())).toBe(true);
    expect(JSON.parse(data)).not.toHaveProperty('togetherPosition');
  });
});
describe('eligible clocks and affectionate state',()=>{
  it('randomizes the first giver, then strictly alternates, with G-only 25% reaction',()=>{
    const values=[0,.2,.24,.25];const m=new TogetherState(()=>values.shift()??.9);
    expect(m.pinch()).toEqual({giver:'goncalo',playfulCallback:true});
    expect(m.pinch()).toEqual({giver:'protagonist',playfulCallback:false});
    expect(m.pinch()).toEqual({giver:'goncalo',playfulCallback:false});
    expect(new TogetherState(()=>.9).pinch().giver).toBe('protagonist');
  });
  it('schedules once at 30–45s, then 45–120s, supports both farters',()=>{
    const low=new TogetherState(()=>0),high=new TogetherState(()=>1);
    expect(low.fartIn).toBe(30000);expect(high.fartIn).toBe(45000);
    expect(advance(low,29900).farter).toBeUndefined();expect(low.tick(100,false,false).farter).toBe('protagonist');
    expect(low.fartIn).toBe(45000);expect(advance(high,45000).farter).toBe('goncalo');expect(high.fartIn).toBe(120000);
  });
  it('suspends every clock for higher-priority UI/scripts/focus and prevents overlapping micro-events',()=>{
    const m=new TogetherState(()=>0);m.startCouch();m.bumpCooldown=2000;
    advance(m,60000,true);expect(m.elapsed).toBe(0);expect(m.couchElapsed).toBe(0);expect(m.fartIn).toBe(30000);expect(m.bumpCooldown).toBe(2000);
    m.fartIn=10;expect(advance(m,1000,false,true).farter).toBeUndefined();expect(m.fartIn).toBe(10);
    for(const mode of ['APPROACH','PINCH','BUTT_BUMP','COF','PHOTO'] as const){m.enter(mode);advance(m,5000);expect(m.fartIn).toBe(10);}
  });
  it('couch callback occurs at 20 eligible seconds once per sitting, never reopens after Back',()=>{
    const m=new TogetherState(()=>0);m.startCouch();
    expect(advance(m,19900).photo).toBe(false);expect(m.tick(100,false,false).photo).toBe(true);expect(m.mode).toBe('PHOTO');
    m.enter('COUCH');expect(advance(m,30000).photo).toBe(false);
    m.startCouch();expect(advance(m,20000).photo).toBe(true);
  });
  it('sheeping has no timeout and bump cooldown remains transient',()=>{
    const m=new TogetherState(()=>.5);m.enter('SHEEPING');advance(m,120000);expect(m.mode).toBe('SHEEPING');
    m.bumpCooldown=3500;advance(m,2000);expect(m.bumpCooldown).toBe(1500);advance(m,1500);expect(m.bumpCooldown).toBe(0);
  });
});
describe('adjacent hand-holding movement',()=>{
  const region=WORLD_REGIONS['home-interior'];
  it.each(['up','down','left','right'] as const)('stays in hand slot at walking and sprint speed facing %s',direction=>{
    const player={x:400,y:400},m=new TogetherMotion(handSlot(player,direction,1),()=>true);
    const delta=direction==='up'?[0,-1]:direction==='down'?[0,1]:direction==='left'?[-1,0]:[1,0];
    for(const speed of [78,150])for(let i=0;i<80;i++){
      const old={...m.position};player.x+=delta[0]!*speed*.016;player.y+=delta[1]!*speed*.016;m.update(player,direction,16);
      expect(m.joined).toBe(true);expect(pairDistance(old,m.position)).toBeLessThanOrEqual(230*.016+.001);
    }
  });
  it('turns and narrow-side changes never teleport, cross solids or exit triggers',()=>{
    const solids=[{x:418,y:300,width:25,height:220}],safe=(p:{x:number;y:number})=>pairSafe(p,solids,region);
    const player={x:396,y:400},m=new TogetherMotion({x:377,y:400},safe);
    for(const direction of ['down','left','up','right'] as const)for(let i=0;i<60;i++){
      const old={...m.position};m.update(player,direction,16);expect(safe(m.position)).toBe(true);
      expect(pairSegmentSafe(old,m.position,safe)).toBe(true);expect(pairDistance(old,m.position)).toBeLessThanOrEqual(3.681);
    }
    expect(pairSafe({x:516,y:840},[],region)).toBe(false);
    expect(pairSafe({x:2,y:80},[],region)).toBe(false);
    expect(safeJoin({x:420,y:400},'down',1,()=>false)).toBeUndefined();
  });
  it('authors activities in both existing homes plus the Porto COF spot, not in Final Park',()=>{
    expect(TOGETHER_ACTIVITIES).toHaveLength(7);expect(new Set(TOGETHER_ACTIVITIES.map(a=>a.id)).size).toBe(7);
    for(const region of ['home-interior','goncalo-home'])expect(TOGETHER_ACTIVITIES.filter(a=>a.region===region).map(a=>a.kind)).toEqual(['COUCH','SHEEPING','COF']);
    expect(TOGETHER_ACTIVITIES.find(a=>a.region==='porto')?.kind).toBe('COF');
  });
});
describe('presentation and bounded integration',()=>{
  it('uses C/R1/RB with existing family detection',()=>{
    observeKeyboardMouse();expect(getControlHint('together')).toBe('C');
    observeController('DualSense Wireless Controller');expect(getControlHint('together')).toBe('R1');
    observeController('Xbox Controller');expect(getControlHint('together')).toBe('RB');
  });
});
