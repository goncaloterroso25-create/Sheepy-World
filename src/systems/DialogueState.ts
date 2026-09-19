import {
  INTERACTION_MODES,
  type DialogueChoice,
  type DialogueDefinition,
  type DialogueNode,
  type InteractionProgress,
} from '../types/game';

const EMPTY_PROGRESS: Readonly<InteractionProgress> = {
  seenBranchIds: [],
  exhausted: false,
};

export function interactionProgressOrDefault(
  progress?: Readonly<InteractionProgress>,
): Readonly<InteractionProgress> {
  return progress ?? EMPTY_PROGRESS;
}

export function trackedBranchIds(dialogue: DialogueDefinition): string[] {
  const branchNodeId = dialogue.interaction.branchNodeId;
  if (!branchNodeId) return [];
  return dialogue.nodes[branchNodeId]?.choices?.map((choice) => choice.id) ?? [];
}

export function unseenDialogueChoices(
  dialogue: DialogueDefinition,
  node: DialogueNode,
  progress?: Readonly<InteractionProgress>,
  flags: Readonly<Record<string, string>> = {},
): readonly DialogueChoice[] {
  const choices = (node.choices ?? []).filter(choice => !choice.condition
    || flags[choice.condition.flag] === (choice.condition.equals ?? 'true'));
  if (
    dialogue.interaction.mode !== INTERACTION_MODES.branchExhaustible
    || dialogue.interaction.branchNodeId !== node.id
  ) {
    return choices;
  }

  const seen = new Set(interactionProgressOrDefault(progress).seenBranchIds);
  return choices.filter((choice) => !seen.has(choice.id));
}

export function dialogueStartNode(
  dialogue: DialogueDefinition,
  progress?: Readonly<InteractionProgress>,
): string | undefined {
  const safeProgress = interactionProgressOrDefault(progress);
  if (safeProgress.exhausted) return undefined;

  if (dialogue.interaction.mode === INTERACTION_MODES.oneShot) {
    return dialogue.startNodeId;
  }
  if (dialogue.interaction.mode !== INTERACTION_MODES.branchExhaustible) {
    return dialogue.startNodeId;
  }

  const remaining = trackedBranchIds(dialogue).filter(
    (branchId) => !safeProgress.seenBranchIds.includes(branchId),
  );
  if (remaining.length === 0) return undefined;
  if (safeProgress.seenBranchIds.length > 0) {
    return dialogue.interaction.revisitNodeId
      ?? dialogue.interaction.branchNodeId
      ?? dialogue.startNodeId;
  }
  return dialogue.startNodeId;
}
