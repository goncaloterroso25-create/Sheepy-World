import type { DialogueDefinition, SaveData } from '../types/game';

export const MENTALIST_CASE_CLUES = [
  'mentalist-clue-till', 'mentalist-clue-cabinet', 'mentalist-clue-blood',
] as const;
export const CASE_COMPARISON_FLAG = 'mentalist-compared-details';
type CaseSave = Pick<SaveData, 'encounters' | 'flags'>;
export type MentalistCaseStage = 'INTRO' | 'CLUES' | 'DEDUCTION' | 'EVIDENCE' | 'HANDOVER' | 'RESOLVED';

export function hasCaseClues(save: CaseSave): boolean {
  return MENTALIST_CASE_CLUES.every(id => save.encounters.includes(id));
}
export function canDeduceCase(save: CaseSave): boolean {
  return hasCaseClues(save) && save.flags[CASE_COMPARISON_FLAG] === 'true';
}
export function mentalistCaseStage(save: CaseSave): MentalistCaseStage {
  // Existing completed/carried saves keep their progress, even without the new comparison flag.
  if (save.encounters.includes('mentalist-case-resolved')) return 'RESOLVED';
  if (['carried', 'handed-over'].includes(save.flags['mentalist-knife'] ?? '')) return 'HANDOVER';
  if (save.encounters.includes('mentalist-deduction-solved')) return 'EVIDENCE';
  if (hasCaseClues(save)) return 'DEDUCTION';
  return save.encounters.includes('mentalist-honorary') ? 'CLUES' : 'INTRO';
}

/** Observations remain available to reread; the player supplies the interpretation. */
export const CASE_OBSERVATIONS = [
  ['01 / THE TILL', 'Coins still sit in their grooves. The drawer has been pulled open, but nothing is missing.'],
  ['02 / THE CABINET', 'A display stand sits across its old outline in the dust. Something dark continues underneath it.'],
  ['03 / THE TRACE', 'A narrow red trace runs toward the cabinet. Its edge disappears beneath the shifted stand.'],
] as const;

export function caseNotebook(save: CaseSave): DialogueDefinition {
  return { id: 'mentalist-notes', startNodeId: 'notes', portraitKey: 'portrait-protagonist-warm',
    interaction: { id: 'mentalist-notes', mode: 'REPEATABLE' }, nodes: {
      notes: { id: 'notes', speaker: 'Protagonist / field notes', lines: [
        ...CASE_OBSERVATIONS.filter((_, i) => save.encounters.includes(MENTALIST_CASE_CLUES[i]!))
          .map(([title, detail]) => `${title}\n${detail}`),
        hasCaseClues(save) ? 'Three observations. Compare them with Jane or Lisbon.' : 'Look at the till, the cabinet, and the trace. I can reread each detail here.',
      ] },
    } };
}

/** One fair comparison, with retry feedback and no penalty or consumed clues. */
export const MENTALIST_COMPARISON: DialogueDefinition = {
  id: 'mentalist-comparison', startNodeId: 'compare', portraitKey: 'portrait-lisbon-serious',
  interaction: { id: 'mentalist-comparison', mode: 'REPEATABLE' }, nodes: {
    compare: { id: 'compare', speaker: 'Teresa Lisbon', lines: [
      'Before a theory, a sequence. Which two details tell us what happened first?',
    ], choices: [
      { id: 'till-dust', label: 'The coins and the dust outline.', nextId: 'money' },
      { id: 'dust-trace', label: 'The shifted stand and the red trace.', nextId: 'sequence' },
      { id: 'till-trace', label: 'The open drawer and the red trace.', nextId: 'drawer' },
    ] },
    money: { id: 'money', speaker: 'Patrick Jane', portraitKey: 'portrait-jane-amused', lines: [
      'The coins tell us what stayed. The outline tells us what moved. Neither tells us when.',
      'Look for one detail covering another.',
    ], nextId: 'compare' },
    drawer: { id: 'drawer', speaker: 'Teresa Lisbon', lines: [
      'The drawer could have opened before or after. What physically lies on top of the trace?',
    ], nextId: 'compare' },
    sequence: { id: 'sequence', speaker: 'Teresa Lisbon', lines: [
      'The red trace runs under the shifted stand. So which came first?',
    ], choices: [
      { id: 'stand-first', label: 'The stand moved, then the trace.', nextId: 'order-retry' },
      { id: 'trace-first', label: 'The trace, then someone moved the stand.', nextId: 'linked' },
      { id: 'review', label: 'Let me compare the details again.', nextId: 'compare' },
    ] },
    'order-retry': { id: 'order-retry', speaker: 'Patrick Jane', portraitKey: 'portrait-jane', lines: [
      'Then the mark would stop at the stand. It continues underneath. Try reversing the order.',
    ], nextId: 'sequence' },
    linked: { id: 'linked', speaker: 'Teresa Lisbon', lines: [
      'Exactly. The stand was moved after the trace was left. Now we have an order, not just a suspicion.',
      'Talk to us again when you are ready to test your explanation.',
    ], onCompleteEvent: 'mentalist-comparison-linked' },
  },
};
