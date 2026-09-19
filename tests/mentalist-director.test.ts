import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/systems/MovementState',()=>({MovementState:class{reset(){} }}));
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { CASE_COMPARISON_FLAG, MENTALIST_CASE_CLUES, MENTALIST_COMPARISON,
  canDeduceCase, caseNotebook, mentalistCaseStage } from '../src/data/mentalistCase';
import { MENTALIST_DEDUCTION_DIALOGUE } from '../src/data/namedDialogues';
import type { DialogueDefinition } from '../src/types/game';

function setup(){
  let text:string|null=null;
  const repo=new SaveRepository({getItem:()=>text,setItem:(_k,v)=>{text=v;},removeItem:()=>{text=null;}});
  return {repo,state:new GameStateStore(repo)};
}
describe('Mentalist observation and comparison',()=>{
  it('requires every observation and a completed comparison before a new deduction',()=>{
    const {state}=setup();
    expect(mentalistCaseStage(state.snapshot)).toBe('INTRO');
    state.completeEncounter('mentalist-honorary');expect(mentalistCaseStage(state.snapshot)).toBe('CLUES');
    for(const id of MENTALIST_CASE_CLUES){
      expect(canDeduceCase(state.snapshot)).toBe(false);state.completeEncounter(id);
    }
    expect(mentalistCaseStage(state.snapshot)).toBe('DEDUCTION');expect(canDeduceCase(state.snapshot)).toBe(false);
    state.setFlag(CASE_COMPARISON_FLAG,'true');expect(canDeduceCase(state.snapshot)).toBe(true);
  });
  it.each(MENTALIST_CASE_CLUES)('cannot use a comparison flag to bypass missing %s',missing=>{
    const {state}=setup();state.setFlag(CASE_COMPARISON_FLAG,'true');
    MENTALIST_CASE_CLUES.filter(id=>id!==missing).forEach(id=>state.completeEncounter(id));
    expect(canDeduceCase(state.snapshot)).toBe(false);
    expect(caseNotebook(state.snapshot).nodes.notes!.lines.join(' ')).not.toContain(
      missing.endsWith('till')?'Coins still':missing.endsWith('cabinet')?'A display stand':'A narrow red trace');
  });
  it('persists comparison and evidence through reload; rereading does not consume observations',()=>{
    const {state,repo}=setup();state.completeEncounter('mentalist-honorary');
    MENTALIST_CASE_CLUES.forEach(id=>state.completeEncounter(id));state.setFlag(CASE_COMPARISON_FLAG,'true');
    let loaded=new GameStateStore(repo);const before=loaded.snapshot;
    caseNotebook(before);caseNotebook(before);expect(loaded.snapshot).toEqual(before);expect(canDeduceCase(before)).toBe(true);
    loaded.completeEncounter('mentalist-deduction-solved');loaded.setFlag('mentalist-knife','carried');
    loaded=new GameStateStore(repo);expect(mentalistCaseStage(loaded.snapshot)).toBe('HANDOVER');
    loaded.setFlag('mentalist-knife','handed-over');expect(mentalistCaseStage(new GameStateStore(repo).snapshot)).toBe('HANDOVER');
    loaded.completeEncounter('mentalist-case-resolved');expect(mentalistCaseStage(new GameStateStore(repo).snapshot)).toBe('RESOLVED');
  });
  it.each(['EVIDENCE','HANDOVER','RESOLVED'])('keeps old %s saves forward-compatible without a comparison flag',stage=>{
    const {state}=setup();state.completeEncounter('mentalist-deduction-solved');
    if(stage==='HANDOVER')state.setFlag('mentalist-knife','carried');
    if(stage==='RESOLVED')state.completeEncounter('mentalist-case-resolved');
    expect(mentalistCaseStage(state.snapshot)).toBe(stage);
  });
  it('all comparison and deduction branches can reach completion; wrong answers preserve a retry path',()=>{
    for(const graph of [MENTALIST_COMPARISON,MENTALIST_DEDUCTION_DIALOGUE] as DialogueDefinition[]){
      const reachable=(id:string,seen=new Set<string>()):boolean=>{
        if(seen.has(id))return false;seen.add(id);const node=graph.nodes[id];expect(node).toBeDefined();
        if(node!.onCompleteEvent)return true;
        return [...(node!.nextId?[node!.nextId]:[]),...(node!.choices?.map(c=>c.nextId)??[])].some(next=>reachable(next,new Set(seen)));
      };
      Object.keys(graph.nodes).forEach(id=>expect(reachable(id),`${graph.id}/${id}`).toBe(true));
    }
    expect(MENTALIST_COMPARISON.nodes.money!.nextId).toBe('compare');
    expect(MENTALIST_COMPARISON.nodes.drawer!.nextId).toBe('compare');
    expect(MENTALIST_COMPARISON.nodes['order-retry']!.nextId).toBe('sequence');
    expect(MENTALIST_COMPARISON.nodes.linked!.onCompleteEvent).toBe('mentalist-comparison-linked');
  });
});
