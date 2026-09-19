import type { MemoryDefinition, SaveData } from '../types/game';

export const NON_FINAL_MEMORIES = ['first-date','snow-day','porto-performance','everyday-us','adventures'] as const;
export const FINAL_MEMORY = 'anniversary-memory';
export const KEEPSAKE_HALVES = ['keepsake-first','keepsake-second'] as const;
export const STORY_FLAGS = { author:'final-author-known', complete:'year-one-complete' } as const;
export const KEEPSAKE_ANCHOR_MEMORIES = ['first-date','snow-day','porto-performance'] as const;
export const STORY_MEMORIES: Record<string,MemoryDefinition> = {
  'everyday-us': {
    id:'everyday-us',kind:'CORE',title:'EVERYDAY US',restoreAt:4,
    fragmentIds:['everyday-cof','everyday-couch','everyday-snack','everyday-morning'],
    fragmentClues:{'everyday-cof':'A WARM RING','everyday-couch':'A SOFT HOLLOW','everyday-snack':'A FEW CRUMBS','everyday-morning':'A SMALL HANDLE'},
    fragmentDetails:{
      'everyday-cof':{found:'A warm ring on the paper. Nothing grand.',restored:'Cof. The smallest possible occasion.'},
      'everyday-couch':{found:'An impression of somewhere comfortable.',restored:'No need to go anywhere. Staying counted too.'},
      'everyday-snack':{found:'Crumbs caught in a fold.',restored:'Sharing the ordinary things. Including the last snack.'},
      'everyday-morning':{found:'A curved handle, familiar to the hand.',restored:'A mug left close enough for another quiet morning.'},
    },
    restoredText:'Cof. Couch. Our mug.\nSnacks shared.\nThe little things\nmattered too.',
    nextHint:'A couch at Home has room for all these small things.',
  },
  adventures:{id:'adventures',kind:'CORE',title:'ADVENTURES',restoreAt:3,
    fragmentIds:['adventures-cup','adventures-flags','adventures-view'],
    fragmentClues:{'adventures-cup':'WIND AND DUST','adventures-flags':'A TOWERING MASK','adventures-view':'THE SKY WENT QUIET'},
    fragmentDetails:{
      'adventures-cup':{found:'Dust on our shoes. Goggles around our necks.',restored:'A dusty detour. The wind brought all our hair along.'},
      'adventures-flags':{found:'A tall painted mask. A grinning face.',restored:'A festival. Bells, masks, and us in the crowd.'},
      'adventures-view':{found:'A ring of light in a suddenly quiet sky.',restored:'A quiet sky. We stood and looked up together.'},
    },restoredText:'Festival. Quiet sky.\nDust from a detour.\nA beautiful world,\nwith you beside me.',nextHint:'A mask at the Fair, dust by the river road, and a quiet sky in Porto.'},
  'anniversary-memory':{id:'anniversary-memory',kind:'CORE',title:'A PLACE KEPT',restoreAt:3,
    fragmentIds:['keepsake-first','keepsake-second','final-picnic'],
    fragmentClues:{'keepsake-first':'FIRST HALF','keepsake-second':'SECOND HALF','final-picnic':'A PLACE KEPT'},
    fragmentDetails:{
      'keepsake-first':{found:'One half of a torn keepsake; no explanation.',restored:'The first half. The torn pieces belong together.'},
      'keepsake-second':{found:'A matching paper edge. It seems to be waiting.',restored:'The second half. The two pieces belong together.'},
      'final-picnic':{found:'The last fold of a blanket. A place left open.',restored:'The picnic, the bench, and a place kept for Protagonist.'},
    },restoredText:'A keepsake restored.\nA place for us.\nA world kept for you.',nextHint:'The quiet branch near the familiar house is waiting.'},
};

export function finalGateOpen(save:Pick<SaveData,'memories'>):boolean {
  return NON_FINAL_MEMORIES.filter(id=>save.memories[id]?.restored).length>=4
    && KEEPSAKE_HALVES.every(id=>save.memories[FINAL_MEMORY]?.foundFragmentIds.includes(id));
}

/** The closing keepsake appears only after all three anchor memories are restored. */
export function lateKeepsakeFragmentsVisible(save:Pick<SaveData,'memories'>):boolean {
  return KEEPSAKE_ANCHOR_MEMORIES.every(id=>save.memories[id]?.restored)
    || KEEPSAKE_HALVES.some(id=>save.memories[FINAL_MEMORY]?.foundFragmentIds.includes(id));
}
const ECHOES: Record<typeof NON_FINAL_MEMORIES[number],string> = {
  'first-date':'Two quiet strokes. A place where uncertainty softened.',
  'snow-day':'A tiny snowman in weather much too warm for snow.',
  'porto-performance':'For a moment, the leaves sound like a crowd asking for one more song.',
  'everyday-us':'A warm ring. Even here, there is somewhere to put the cof.',
  adventures:'A mask, a quiet sky, dust in our hair. Every detour had you in it.',
};
export function restoredEchoes(save:Pick<SaveData,'memories'>):string[] {
  return NON_FINAL_MEMORIES.filter(id=>save.memories[id]?.restored).map(id=>ECHOES[id]);
}
/** Hooks augment repeatable, already reachable interactions, never exhausted branches. */
export const STORY_MOMENTS: Record<string,readonly [string,string]> = {
  'home-cof':['everyday-us','everyday-cof'],
  'home-couch':['everyday-us','everyday-couch'],
  'home-snack':['everyday-us','everyday-snack'],
  'goncalo-bedside-mug':['everyday-us','everyday-morning'],
};
