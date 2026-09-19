import { INTERACTION_MODES, type DialogueDefinition } from '../types/game';

export const PARK_WANDERER_INTERACTION_ID = 'park-wanderer';

export const PARK_KEEPER_DIALOGUE: DialogueDefinition = {
  id: 'park-keeper',
  startNodeId: 'hello',
  interaction: {
    id: PARK_WANDERER_INTERACTION_ID,
    mode: INTERACTION_MODES.branchExhaustible,
    branchNodeId: 'question',
    revisitNodeId: 'question',
    completionNodeId: 'farewell',
  },
  nodes: {
    hello: {
      id: 'hello',
      speaker: 'Park Wanderer',
      lines: [
        'Lovely leaf weather, isn\'t it?',
        'I have been conducting a very serious survey.',
      ],
      nextId: 'question',
    },
    question: {
      id: 'question',
      speaker: 'Park Wanderer',
      lines: ['Which leaf is the most suspicious?'],
      choices: [
        { id: 'crunchy-leaf', label: 'The crunchy one.', nextId: 'converge' },
        { id: 'round-leaf', label: 'Obviously the round one.', nextId: 'converge' },
      ],
    },
    converge: {
      id: 'converge',
      speaker: 'Park Wanderer',
      lines: ['Excellent. That confirms absolutely nothing.', 'Scientific progress!'],
      onCompleteEvent: 'prototype:npc-chat-finished',
    },
    farewell: {
      id: 'farewell',
      speaker: 'Park Wanderer',
      lines: ['Well, that is everything I know. The survey is complete!'],
      onCompleteEvent: 'prototype:npc-chat-exhausted',
    },
  },
};

export const BENCH_DIALOGUE: DialogueDefinition = {
  id: 'familiar-bench',
  startNodeId: 'thought',
  interaction: {
    id: 'familiar-bench',
    mode: INTERACTION_MODES.repeatable,
  },
  nodes: {
    thought: {
      id: 'thought',
      speaker: 'Protagonist',
      lines: [
        'This bench seems familiar for some reason.',
        'The trees, the quiet... something is missing though.',
      ],
      onCompleteEvent: 'prototype:bench-inspected',
    },
  },
};
