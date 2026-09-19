import type { SaveData } from '../types/game';
import { FINAL_MEMORY, KEEPSAKE_ANCHOR_MEMORIES, KEEPSAKE_HALVES, STORY_FLAGS } from './storyCompletion';

/** Entrance visibility only. Existing journeys keep access without rewriting their saves. */
export function goncaloHomeAvailable(save: Readonly<SaveData>): boolean {
  return KEEPSAKE_ANCHOR_MEMORIES.every(id => save.memories[id]?.restored)
    || save.discoveredLocations.includes('goncalo-home')
    || save.worldLocation.regionId === 'goncalo-home'
    || KEEPSAKE_HALVES.some(id => save.memories[FINAL_MEMORY]?.foundFragmentIds.includes(id))
    || save.flags[STORY_FLAGS.complete] === 'true';
}
