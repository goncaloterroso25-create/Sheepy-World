import type { DiscoveryCueLevel } from '../systems/DiscoveryCue';
import type { InteractionApproach } from '../systems/InteractionGeometry';
import { INTERACTION_MODES, type DialogueDefinition } from '../types/game';

export interface FestivalCurio {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  iconKey: string;
  approach: InteractionApproach;
  discoveryCue: DiscoveryCueLevel;
}

export interface FestivalDetail {
  id: string;
  x: number;
  y: number;
  title: string;
  text: string;
  family: 'personal' | 'bg3' | 'mistria' | 'got' | 'hunger-games';
  approach: InteractionApproach;
  discoveryCue?: DiscoveryCueLevel;
}

export const FESTIVAL_CURIOS: readonly FestivalCurio[] = [
  {
    id: 'lumps-war-horn', x: 196, y: 757, title: "Lump's War Horn",
    description: "Maybe don't play it.", iconKey: 'item-war-horn', discoveryCue: 'INTERESTING',
    approach: { anchor: { x: 196, y: 834 }, shape: { x: 146, y: 821, width: 105, height: 25 }, radius: 31,
      preferredFacing: 'up', promptAnchor: { x: 196, y: 758 } },
  },
  {
    // Keep the stable save ID; the player-facing collectible has the correct name.
    id: 'bird-arrow-pin', x: 1156, y: 877, title: 'Mockingjay Pin',
    description: 'Katniss would probably want this back.', iconKey: 'item-bird-arrow-pin', discoveryCue: 'INTERESTING',
    approach: { anchor: { x: 1162, y: 951 }, shape: { x: 1114, y: 942, width: 98, height: 25 }, radius: 32,
      preferredFacing: 'up', promptAnchor: { x: 1156, y: 878 } },
  },
  {
    id: 'the-hunger-games', x: 848, y: 524, title: 'The Hunger Games',
    description: 'A blue book with one very defiant golden bird.', iconKey: 'item-hunger-games', discoveryCue: 'INTERESTING',
    approach: { anchor: { x: 848, y: 600 }, shape: { x: 829, y: 588, width: 42, height: 25 }, radius: 32,
      preferredFacing: 'up', promptAnchor: { x: 848, y: 525 } },
  },
];

export const FESTIVAL_DETAILS: readonly FestivalDetail[] = [
  { id: 'hydromel-cup', x: 493, y: 859, title: 'Hydromel', text: 'A small cup of a funny drink.', family: 'personal',
    approach: { anchor: { x: 493, y: 902 }, shape: { x: 448, y: 885, width: 96, height: 28 }, radius: 30,
      preferredFacing: 'up', promptAnchor: { x: 493, y: 860 } } },
  // The shooting target remains scenery. There is deliberately no archery interaction.
  { id: 'festival-flags', x: 696, y: 1130, title: 'The fair', text: 'Feira Medieval de Santa Maria da Feira!!!.', family: 'personal',
    approach: { anchor: { x: 696, y: 1130 }, shape: { x: 652, y: 1113, width: 88, height: 34 }, radius: 32,
      promptAnchor: { x: 696, y: 1104 } } },
  { id: 'fair-overlook', x: 758, y: 318, title: 'From up here', text: 'A town below. One more little adventure above it.', family: 'personal',
    approach: { anchor: { x: 758, y: 318 }, shape: { x: 731, y: 300, width: 54, height: 38 }, radius: 30,
      promptAnchor: { x: 758, y: 292 } } },
  { id: 'sussur-bloom', x: 194, y: 466, title: 'Sussur Bloom', text: 'In case there are any wizards around.', family: 'bg3',
    approach: { anchor: { x: 196, y: 555 }, shape: { x: 145, y: 542, width: 104, height: 27 }, radius: 34,
      preferredFacing: 'up', promptAnchor: { x: 194, y: 466 } }, discoveryCue: 'INTERESTING' },
  { id: 'tadpole-specimen', x: 490, y: 436, title: 'Suspicious specimen', text: 'For display. Definitely not for thoughts.', family: 'bg3',
    approach: { anchor: { x: 490, y: 507 }, shape: { x: 442, y: 496, width: 101, height: 26 }, radius: 32,
      preferredFacing: 'up', promptAnchor: { x: 490, y: 438 } }, discoveryCue: 'INTERESTING' },
  { id: 'speak-with-animals', x: 807, y: 522, title: 'Speak with Animals', text: 'Finally. A formal way to negotiate with Teemi.', family: 'bg3',
    approach: { anchor: { x: 789, y: 600 }, shape: { x: 754, y: 588, width: 73, height: 25 }, radius: 32,
      preferredFacing: 'up', promptAnchor: { x: 807, y: 522 } }, discoveryCue: 'INTERESTING' },
  { id: 'caldarus-shrine', x: 650, y: 264, title: 'Caldarus, waiting in stone',
    text: 'A patient stone dragon watches over one purple essence.', family: 'mistria',
    approach: { anchor: { x: 650, y: 318 }, shape: { x: 607, y: 302, width: 88, height: 28 }, radius: 36,
      preferredFacing: 'up', promptAnchor: { x: 650, y: 263 } }, discoveryCue: 'INTERESTING' },
  { id: 'mournful-clown', x: 582, y: 695, title: 'Mournful Clown Painting',
    text: 'A tiny painted clown, magnificently miserable in a gold frame.', family: 'mistria',
    approach: { anchor: { x: 582, y: 732 }, shape: { x: 556, y: 716, width: 53, height: 31 }, radius: 36,
      preferredFacing: 'up', promptAnchor: { x: 582, y: 694 } }, discoveryCue: 'INTERESTING' },
  { id: 'spiky-chair', x: 851, y: 286, title: 'A ceremonial chair', text: 'Finally, a chair that hates you back.', family: 'got',
    approach: { anchor: { x: 851, y: 348 }, shape: { x: 827, y: 334, width: 50, height: 30 }, radius: 32,
      preferredFacing: 'up', promptAnchor: { x: 851, y: 286 } } },
  { id: 'nightlock-berries', x: 777, y: 1608, title: 'NIGHTLOCK',
    text: 'Glossy, dark, and absolutely not a trail snack.', family: 'hunger-games',
    approach: { anchor: { x: 755, y: 1608 }, shape: { x: 735, y: 1583, width: 35, height: 52 }, radius: 36,
      preferredFacing: 'right', promptAnchor: { x: 780, y: 1599 } }, discoveryCue: 'INTERESTING' },
];

export const OLD_WORLD_GUESTS = {
  hange: { x: 1013, y: 775, priority: 48 },
  scouts: {
    // The trio belongs on the quieter eastern forest branch, not among the
    // fair stalls. The whole tableau is one joint target with a broad,
    // path-contained approach area.
    interaction: {
      x: 930, y: 1528,
      approach: {
        anchor: { x: 930, y: 1548 },
        shape: { x: 864, y: 1486, width: 132, height: 70 },
        radius: 34,
        promptAnchor: { x: 930, y: 1480 },
      },
    },
    members: [
      { id: 'eren', x: 894, y: 1530 },
      { id: 'mikasa', x: 930, y: 1533 },
      { id: 'armin', x: 966, y: 1530 },
    ],
  },
} as const;

/**
 * A self-contained, non-blocking tableau in the open court below the keep.
 * Every dragon is a discrete sprite so all three remain readable. Dimensions
 * describe the generated pixel textures and keep composition tests honest.
 */
export const DAENERYS_STAGE = {
  interactionId: 'daenerys-talk',
  x: 780, y: 333,
  sprite: { texture: 'festival-daenerys', width: 30, height: 44 },
  approach: {
    anchor: { x: 780, y: 343 },
    shape: { x: 720, y: 274, width: 114, height: 99 },
    radius: 34,
    promptAnchor: { x: 780, y: 287 },
  } satisfies InteractionApproach,
  dragons: [
    { role: 'shoulder', texture: 'festival-dragon-shoulder', x: 791, y: 308,
      width: 22, height: 16, visualMass: 352, depthOffset: 1 },
    { role: 'medium-companion', texture: 'festival-dragon-medium', x: 817, y: 337,
      width: 42, height: 28, visualMass: 1176, depthOffset: -2 },
    { role: 'large-companion', texture: 'festival-dragon-large', x: 716, y: 342,
      width: 68, height: 42, visualMass: 2856, depthOffset: -2 },
  ],
} as const;

export const OLD_WORLD_FOREST_PROPS = [
  { kind: 'mushrooms', x: 611, y: 1518 }, { kind: 'mushrooms', x: 1125, y: 1660 },
  { kind: 'mushrooms', x: 510, y: 2112 }, { kind: 'fallen-log', x: 1138, y: 1908 },
  { kind: 'fallen-log', x: 312, y: 1640 }, { kind: 'rock', x: 606, y: 1964 },
  { kind: 'rock', x: 1117, y: 1517 }, { kind: 'flowers', x: 802, y: 1517 },
  { kind: 'flowers', x: 534, y: 1880 }, { kind: 'flowers', x: 842, y: 2074 },
  { kind: 'reeds', x: 548, y: 1737 }, { kind: 'reeds', x: 854, y: 1818 },
  { kind: 'reeds', x: 348, y: 1886 }, { kind: 'fern-bank', x: 820, y: 1741 },
  { kind: 'fern-bank', x: 587, y: 1818 }, { kind: 'fern-bank', x: 424, y: 1994 },
] as const;

export const OLD_WORLD_CASTLE_LAYERS = [
  { id: 'west-tower', x: 590, y: 8, width: 130, height: 220 },
  { id: 'gatehouse', x: 706, y: 22, width: 182, height: 116 },
  { id: 'east-tower', x: 884, y: 8, width: 130, height: 220 },
  { id: 'west-buttress', x: 600, y: 112, width: 31, height: 116 },
  { id: 'east-buttress', x: 973, y: 112, width: 31, height: 116 },
] as const;

export const HANGE_DIALOGUE: DialogueDefinition = {
  id: 'hange-talk', startNodeId: 'hello', portraitKey: 'portrait-hange',
  interaction: { id: 'hange-talk', mode: INTERACTION_MODES.repeatable },
  nodes: {
    hello: { id: 'hello', speaker: 'Hange', portraitKey: 'portrait-hange',
      lines: ['Excellent timing. I have questions, three theories, and almost enough paper.'], choices: [
        { id: 'titans', label: 'About the Titans?', nextId: 'titans' },
        { id: 'walls', label: 'Studying the walls?', nextId: 'walls' },
        { id: 'method', label: 'What is the method?', nextId: 'method' },
      ] },
    titans: { id: 'titans', speaker: 'Hange', portraitKey: 'portrait-hange',
      lines: ['Observe first, survive second, write everything down. Preferably in that order.'] },
    walls: { id: 'walls', speaker: 'Hange', portraitKey: 'portrait-hange',
      lines: ['Stone remembers pressure. Cracks are simply evidence with excellent handwriting.'] },
    method: { id: 'method', speaker: 'Hange', portraitKey: 'portrait-hange',
      lines: ['Curiosity, repeatable experiments, and one assistant who knows when to run.'] },
  },
};

export const SCOUT_GROUP_DIALOGUE: DialogueDefinition = {
  id: 'scout-group-talk', startNodeId: 'hello', portraitKey: 'portrait-armin',
  interaction: { id: 'scout-group-talk', mode: INTERACTION_MODES.repeatable },
  nodes: {
    hello: { id: 'hello', speaker: 'Armin', portraitKey: 'portrait-armin',
      lines: ['We are checking the road ahead. Together.'], choices: [
        { id: 'route', label: 'Found a safe route?', nextId: 'route-armin' },
        { id: 'walls', label: 'What about the walls?', nextId: 'walls-eren' },
        { id: 'team', label: 'You stay close.', nextId: 'team-mikasa' },
      ] },
    'route-armin': { id: 'route-armin', speaker: 'Armin', portraitKey: 'portrait-armin',
      lines: ['A narrow one. The trees hide the turn, but the ground is firm.'], nextId: 'route-mikasa' },
    'route-mikasa': { id: 'route-mikasa', speaker: 'Mikasa', portraitKey: 'portrait-mikasa',
      lines: ['We move only when all three are ready.'] },
    'walls-eren': { id: 'walls-eren', speaker: 'Eren', portraitKey: 'portrait-eren',
      lines: ['A wall is not the same thing as freedom.'], nextId: 'walls-armin' },
    'walls-armin': { id: 'walls-armin', speaker: 'Armin', portraitKey: 'portrait-armin',
      lines: ['But understanding one may help us reach the other.'] },
    'team-mikasa': { id: 'team-mikasa', speaker: 'Mikasa', portraitKey: 'portrait-mikasa',
      lines: ['That is the plan.'], nextId: 'team-eren' },
    'team-eren': { id: 'team-eren', speaker: 'Eren', portraitKey: 'portrait-eren',
      lines: ['It is a very persistent plan.'] },
  },
};
export const CASTIEL_DIALOGUE: DialogueDefinition = {
  id: 'roadside-stranger', startNodeId: 'question', interaction: { id: 'roadside-stranger', mode: 'REPEATABLE' },
  nodes: {
    question: { id: 'question', speaker: 'Protagonist', lines: ['Are you lost?'], nextId: 'answer' },
    answer: { id: 'answer', speaker: 'Castiel', lines: ['No.', 'The car might be.'] },
  },
};
export const ADVICE_DIALOGUE: DialogueDefinition = {
  id: 'fair-advice', startNodeId: 'advice', interaction: { id: 'fair-advice', mode: 'REPEATABLE' },
  nodes: { advice: { id: 'advice', speaker: 'A small, confident gentleman',
    lines: ['Always take the shortest route. Unless it is longer.', 'I study over drinks. The conclusions get ambitious.'] } },
};
