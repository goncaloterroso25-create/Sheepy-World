import type { MemoryDefinition } from '../types/game';
import { STORY_MEMORIES } from './storyCompletion';

export const TEST_MEMORY_ID = 'test-memory';
export const TEST_FRAGMENT_ID = 'test-memory-fragment-a';

export const MEMORIES: Readonly<Record<string, MemoryDefinition>> = {
  'first-date': {
    id: 'first-date', title: 'TWO SEATS', kind: 'CORE', theme: 'first-date',
    fragmentIds: ['first-date-sleep', 'first-date-bench', 'first-date-car'], restoreAt: 3,
    fragmentClues: { 'first-date-sleep': '2 Hours???', 'first-date-bench': 'Familiar Bench', 'first-date-car': 'Not an electric car.' },
    fragmentDetails: {
      'first-date-sleep': { found:'Why did Jane say "2 hours" like that?', restored:'A tiny detail returning from an earlier chapter...' },
      'first-date-bench': { found:'I think I remember this particular bench...', restored:'A bench where uncertainty softened.' },
      'first-date-car': { found:'Is this car important?', restored:'A changed plan became a beginning.' },
    },
    restoredText: 'Two seats.\nA gentle beginning.\nSee you later.', regionIds: ['autumn-parklands', 'goncalo-home'],
    nextHint:'A familiar place is waiting somewhere near a road.',
  },
  'porto-performance': {
    id: 'porto-performance', title: 'ONE MORE SONG', kind: 'CORE', theme: 'performance', restoreAt: 3,
    fragmentIds: ['performance-fourth-date', 'performance-night', 'performance-venue'],
    fragmentClues: { 'performance-fourth-date': 'MUSIC POSTER', 'performance-night': 'FROM THE ISLANDS', 'performance-venue': 'CROWD SHADOWS' },
    fragmentDetails: {
      'performance-fourth-date': { found:'A poster about music at the venue tonight. Interesting.', restored:'The poster that quietly started the route to an evening out.' },
      'performance-night': { found:'A note about a visiting band.', restored:'Music arriving from across the water to fill the city night.' },
      'performance-venue': { found:'Crowd silhouettes with no stage and no name.', restored:'The crowd, the stage, and one more song together.' },
    },
    restoredText: 'The city sang.\nOne more song.\nA night worth keeping.', regionIds: ['porto'],
    nextHint:'A prepared room is waiting for the right night.',
  },
  'snow-day': {
    id: 'snow-day', title: 'A little snow', kind: 'CORE', theme: 'snow', restoreAt: 3,
    fragmentIds: ['snow-jeronimo', 'snow-weather', 'snow-play'],
    fragmentClues: { 'snow-jeronimo': 'AN ELETRIC CAR', 'snow-weather': 'STICKS N BRANCHES', 'snow-play': 'BALLS OF SNOW' },
    fragmentDetails: {
      'snow-jeronimo': { found:'A familiar eletric car, covered in snow.', restored:'Jerónimo rode in the BYD with us for... a few minutes before he fell off.' },
      'snow-weather': { found:'Sticks and branches. Mustache and arm shaped.', restored:'The chosen sticks gave Jerónimo his unmistakable fern-like arms.' },
      'snow-play': { found:'A couple of snowballs, very throwable.', restored:'Jerónimo´s body, so tea!!' },
    },
    restoredText: 'The best snowman ever built.\nA friend of ours for a couple of minutes.',
    nextHint:'Something small could be built where the road disappeared.',
  },
  ...STORY_MEMORIES,
  [TEST_MEMORY_ID]: {
    id: TEST_MEMORY_ID,
    title: 'A page still waiting',
    fragmentIds: [TEST_FRAGMENT_ID, 'test-memory-fragment-b', 'test-memory-fragment-c'],
    fragmentClues: {
      [TEST_FRAGMENT_ID]: 'A warm glint beneath a quiet tree.',
      'test-memory-fragment-b': 'Not present in this prototype.',
      'test-memory-fragment-c': 'Not present in this prototype.',
    },
    restoreAt: 3,
  },
};
