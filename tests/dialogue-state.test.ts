import { describe, expect, it } from 'vitest';
import { PARK_KEEPER_DIALOGUE, PARK_WANDERER_INTERACTION_ID } from '../src/data/dialogues';
import {
  dialogueStartNode,
  trackedBranchIds,
  unseenDialogueChoices,
} from '../src/systems/DialogueState';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';

describe('branch-exhaustible dialogue', () => {
  it('filters viewed choices and starts revisits at the branch node', () => {
    const question = PARK_KEEPER_DIALOGUE.nodes.question;
    expect(question).toBeDefined();
    if (!question) return;

    expect(dialogueStartNode(PARK_KEEPER_DIALOGUE)).toBe('hello');
    expect(unseenDialogueChoices(PARK_KEEPER_DIALOGUE, question).map((choice) => choice.id))
      .toEqual(['crunchy-leaf', 'round-leaf']);

    const progress = { seenBranchIds: ['crunchy-leaf'], exhausted: false };
    expect(dialogueStartNode(PARK_KEEPER_DIALOGUE, progress)).toBe('question');
    expect(unseenDialogueChoices(PARK_KEEPER_DIALOGUE, question, progress).map((choice) => choice.id))
      .toEqual(['round-leaf']);
  });

  it('persists seen branches and exhausts after the final branch', () => {
    const storage = new MemoryStorage();
    const state = new GameStateStore(new SaveRepository(storage));
    const branchIds = trackedBranchIds(PARK_KEEPER_DIALOGUE);

    const first = state.markDialogueBranchSeen(
      PARK_WANDERER_INTERACTION_ID,
      'crunchy-leaf',
      branchIds,
    );
    expect(first.exhausted).toBe(false);

    const second = state.markDialogueBranchSeen(
      PARK_WANDERER_INTERACTION_ID,
      'round-leaf',
      branchIds,
    );
    expect(second).toEqual({
      seenBranchIds: ['crunchy-leaf', 'round-leaf'],
      exhausted: true,
    });

    const reloaded = new GameStateStore(new SaveRepository(storage));
    const persisted = reloaded.interactionProgress(PARK_WANDERER_INTERACTION_ID);
    expect(persisted).toEqual(second);
    expect(dialogueStartNode(PARK_KEEPER_DIALOGUE, persisted)).toBeUndefined();
    expect(reloaded.isInteractionExhausted(PARK_WANDERER_INTERACTION_ID)).toBe(true);
  });
});
