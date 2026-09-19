import { describe, expect, it } from 'vitest';
import { createDefaultSave } from '../src/systems/SaveSystem';
import { FINAL_MEMORY, KEEPSAKE_HALVES, NON_FINAL_MEMORIES } from '../src/data/storyCompletion';
import { lateMemoryNote, RouteReadyObservation, ROUTE_READY_NOTE } from '../src/ui/MemoryGuidance';

function checkpoint(whole: number, halves: readonly string[] = []) {
  const save = createDefaultSave();
  NON_FINAL_MEMORIES.slice(0, whole).forEach(id => save.memories[id] = { foundFragmentIds: [], restored: true });
  save.memories[FINAL_MEMORY] = { foundFragmentIds: [...halves], restored: false };
  return save;
}

describe('Memory guidance, without changing progression', () => {
  it.each([0, 1, 2])('offers no late hint at %i restored memories', count => {
    expect(lateMemoryNote(checkpoint(count, KEEPSAKE_HALVES))).toBeUndefined();
  });
  it('counts restored pages, never collected clues; stays poetic and hides completed guidance', () => {
    const save = checkpoint(0);
    NON_FINAL_MEMORIES.forEach(id => save.memories[id] = { foundFragmentIds: ['clue'], restored: false });
    expect(lateMemoryNote(save)).toBeUndefined();
    for (const count of [3, 4, 5]) expect(lateMemoryNote(checkpoint(count))).not.toMatch(/4\/5|gate|14|09|Gonçalo|unlock/i);
    const complete = checkpoint(5, KEEPSAKE_HALVES); complete.memories[FINAL_MEMORY]!.restored = true;
    expect(lateMemoryNote(complete)).toBeUndefined();
  });
  it.each([[3, KEEPSAKE_HALVES], [4, ['keepsake-first']], [4, ['keepsake-second']]] as const)('stays silent below the gate: %i, %s', (count, halves) => {
    const cue = new RouteReadyObservation(checkpoint(0)); cue.observe(checkpoint(count, halves));
    expect(cue.take(true)).toBeUndefined();
  });
  it('queues once on the actual rising edge, waits for free play, and never repeats on mutations or reload', () => {
    const cue = new RouteReadyObservation(checkpoint(3, KEEPSAKE_HALVES));
    const ready = checkpoint(4, KEEPSAKE_HALVES); cue.observe(ready);
    expect(cue.take(false)).toBeUndefined(); expect(cue.take(true)).toEqual(ROUTE_READY_NOTE);
    cue.observe(checkpoint(5, KEEPSAKE_HALVES)); expect(cue.take(true)).toBeUndefined();
    const loaded = new RouteReadyObservation(ready); loaded.observe(ready); expect(loaded.take(true)).toBeUndefined();
  });
  it('also notices the final half arriving after four restored pages', () => {
    const cue = new RouteReadyObservation(checkpoint(4, ['keepsake-first']));
    cue.observe(checkpoint(4, KEEPSAKE_HALVES)); expect(cue.take(true)).toEqual(ROUTE_READY_NOTE);
  });
});
