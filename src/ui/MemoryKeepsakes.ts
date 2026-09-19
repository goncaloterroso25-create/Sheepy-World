import type { SaveData } from '../types/game';

export type Keepsake = 'flower' | 'ticket' | 'snowflake' | 'cof' | 'travel';
const marks = [['first-date','flower'],['porto-performance','ticket'],['snow-day','snowflake'],['everyday-us','cof'],['adventures','travel']] as const;
/** Decorations are recollections, never hints about unfinished pages. */
export function memoryKeepsakes(save: Pick<SaveData, 'memories'>): Keepsake[] {
  return marks.filter(([id]) => save.memories[id]?.restored).map(([,mark]) => mark);
}
