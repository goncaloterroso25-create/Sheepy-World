import { ITEMS, TEST_ITEM_ID } from '../data/items';
import { MEMORIES, TEST_MEMORY_ID } from '../data/memories';
import type { ItemDefinition, MemoryDefinition, MemoryProgress } from '../types/game';

export interface CollectionPreview {
  items: readonly ItemDefinition[];
  memories: readonly MemoryDefinition[];
  progress: Readonly<Record<string, MemoryProgress>>;
}

/** Loaded only behind import.meta.env.DEV. No fixtures are added to GameStateStore. */
export function collectionPreview(query: URLSearchParams): CollectionPreview {
  const scenario = query.get('state') ?? 'selected';
  const bell = ITEMS[TEST_ITEM_ID]!;
  const count = scenario === 'empty' ? 0 : scenario === 'scroll' ? 23 : 1;
  const items = Array.from({ length: count }, (_, index) => index === 0 ? bell : {
    ...bell, id: `review-only-${index}`, name: `Pocket test ${String(index + 1).padStart(2, '0')}`,
    description: `A stand-in for object ${index + 1}.\nDefinitely not final lore.`, annotation: 'Review fixture. Not saved.',
  });
  if(scenario==='living'){
    const memories=['first-date','porto-performance','snow-day'].map(id=>MEMORIES[id]!);
    const progress:Readonly<Record<string,MemoryProgress>>={
      'first-date':{foundFragmentIds:memories[0]!.fragmentIds.slice(0,2),restored:false},
      'porto-performance':{foundFragmentIds:[...memories[1]!.fragmentIds],restored:true},
      'snow-day':{foundFragmentIds:memories[2]!.fragmentIds.slice(0,1),restored:false},
    };
    return {items,memories,progress};
  }
  const memory = MEMORIES[TEST_MEMORY_ID]!;
  const extraPages = query.get('pages') === '3';
  const memories = extraPages ? [memory, ...[2, 3].map((index) => ({ ...memory,
    id: `review-page-${index}`, title: `Another little page ${index}`,
  }))] : [memory];
  const progress = Object.fromEntries(memories.map((page) => [page.id, {
    foundFragmentIds: scenario === 'empty' ? [] : scenario === 'restored' ? [...page.fragmentIds] : [page.fragmentIds[0]!],
    restored: scenario === 'restored',
  }]));
  return { items, memories, progress };
}
