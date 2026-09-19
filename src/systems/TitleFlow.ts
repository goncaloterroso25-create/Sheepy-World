import type { SaveData } from '../types/game';
import { STORY_FLAGS } from '../data/storyCompletion';

export type TitleAction = 'START' | 'CONTINUE' | 'NEW_GAME';

export function openingActionLabel(action: TitleAction): string {
  if (action === 'START') return 'OPEN';
  if (action === 'NEW_GAME') return 'BEGIN AGAIN';
  return 'CONTINUE';
}

export function hasMeaningfulProgress(save: Readonly<SaveData>): boolean {
  return Object.values(save.memories).some(
    (memory) => memory.restored || memory.foundFragmentIds.length > 0,
  ) || Object.values(save.interactions).some(
    (interaction) => interaction.exhausted || interaction.seenBranchIds.length > 0,
  ) || save.inventory.length > 0
    || save.achievements.length > 0
    || save.counters.yellowCars > 0
    || save.worldLocation.regionId !== 'autumn-parklands'
    || save.worldLocation.entryId !== 'park-start'
    || save.cats.tobias !== 'outside';
}

export function titleActionsForSave(save: Readonly<SaveData>): readonly TitleAction[] {
  return hasMeaningfulProgress(save) ? ['CONTINUE', 'NEW_GAME'] : ['START'];
}

/** Credits are a quiet post-ending discovery, keyed to the canonical story flag. */
export function titleCreditsAvailable(save: Readonly<SaveData>): boolean {
  return save.flags[STORY_FLAGS.complete] === 'true';
}
