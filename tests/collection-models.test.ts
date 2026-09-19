import { describe, expect, it } from 'vitest';
import { BagSelection, inventoryEntries, memoryFragments, ScrapbookSelection } from '../src/ui/CollectionModels';
import { collectionPreview } from '../src/dev/collectionPreviews';
import { ITEMS, TEST_ITEM_ID } from '../src/data/items';
import { MEMORIES, TEST_MEMORY_ID } from '../src/data/memories';

const fixtures = () => collectionPreview(new URLSearchParams('state=scroll&pages=3'));

describe('pocket selection and integer row scrolling', () => {
  it('handles empty, low-item and overflow inventories without inventing discoveries', () => {
    const model = new BagSelection();
    model.setItems([]);
    expect(model.selected).toBeUndefined();
    expect(model.index).toBe(-1);
    expect(model.move('right')).toBe(false);
    model.setItems([ITEMS[TEST_ITEM_ID]!]);
    expect(model.selected?.id).toBe(TEST_ITEM_ID);
    expect(model.maxFirstRow).toBe(0);
    model.setItems(fixtures().items);
    expect(model.visible).toHaveLength(9);
    expect(model.items).toHaveLength(23);
    expect(model.maxFirstRow).toBe(5);
  });

  it('navigates a 3-column grid by keyboard and updates the detail selection', () => {
    const model = new BagSelection(); model.setItems(fixtures().items);
    expect(model.move('left')).toBe(false);
    model.move('right'); model.move('down');
    expect(model.index).toBe(4);
    expect(model.selected?.description).toContain('object 5');
    model.select(8); model.move('down');
    expect(model.index).toBe(11);
    expect(model.firstRow).toBe(1);
    model.select(20); model.move('down');
    expect(model.index).toBe(22); // Last, partial row remains reachable.
    expect(model.move('down')).toBe(false);
    expect(model.move('right')).toBe(false);
  });

  it('accepts valid pointer selection and rejects invalid indexes', () => {
    const model = new BagSelection(); model.setItems(fixtures().items);
    expect(model.select(14)).toBe(true);
    expect(model.selected?.name).toBe('Pocket test 15');
    for (const index of [-1, 999, 1.5, NaN]) expect(model.select(index)).toBe(false);
    expect(model.index).toBe(14);
    expect(model.select(14)).toBe(false);
  });

  it('scrolls beyond capacity in whole rows while keeping selection visible', () => {
    const model = new BagSelection(); model.setItems(fixtures().items);
    model.scroll(2);
    expect(model.firstRow).toBe(2);
    expect(model.visible.some((item) => item.id === model.selected?.id)).toBe(true);
    model.scroll(999);
    expect(model.firstRow).toBe(5);
    expect(model.scroll(1)).toBe(false);
    expect(model.visible).toHaveLength(8);
    model.select(22); model.scroll(-99);
    expect(model.firstRow).toBe(0);
    expect(model.visible.some((item) => item.id === model.selected?.id)).toBe(true);
    expect(model.scroll(NaN)).toBe(false);
  });

  it('preserves selection by stable ID, clamps on removal and safely resets when emptied', () => {
    const model = new BagSelection(); const items = fixtures().items;
    model.setItems(items); model.select(19);
    model.setItems([...items].reverse());
    expect(model.selected?.id).toBe(items[19]?.id);
    model.setItems(items.slice(0, 2));
    expect(model.index).toBeLessThan(2);
    expect(model.firstRow).toBe(0);
    model.setItems([]);
    expect(model.index).toBe(-1);
    expect(model.firstRow).toBe(0);
  });

  it('keeps unknown saved IDs visible without changing the saved collection', () => {
    const ids = [TEST_ITEM_ID, 'future-shirt', TEST_ITEM_ID];
    const entries = inventoryEntries(ids, ITEMS);
    expect(entries).toHaveLength(2);
    expect(entries[1]?.description).toContain('label is missing');
    expect(ids).toHaveLength(3);
    expect(entries[0]?.iconKey).toBe('artifact');
  });
});

describe('scrapbook shell', () => {
  it('has complete single-page navigation and bounded future-page turns', () => {
    const model = new ScrapbookSelection();
    model.setPages([MEMORIES[TEST_MEMORY_ID]!]);
    expect(model.turn(-1)).toBe(false);
    expect(model.turn(1)).toBe(false);
    model.setPages(fixtures().memories);
    expect(model.turn(1)).toBe(true);
    expect(model.selected?.id).toBe('review-page-2');
    model.setPages([...fixtures().memories].reverse());
    expect(model.selected?.id).toBe('review-page-2');
    model.turn(1); expect(model.turn(1)).toBe(false);
    model.setPages([]); expect(model.index).toBe(0);
    expect(model.selected).toBeUndefined();
  });

  it('maps missing, inserted and restored fragments without modifying progress', () => {
    const memory = MEMORIES[TEST_MEMORY_ID]!;
    expect(memoryFragments(memory).map((fragment) => fragment.state)).toEqual(['missing', 'missing', 'missing']);
    const progress = { foundFragmentIds: [memory.fragmentIds[0]!, 'unknown-fragment'], restored: false };
    expect(memoryFragments(memory, progress).map((fragment) => fragment.state)).toEqual(['found', 'missing', 'missing']);
    expect(memoryFragments(memory, { ...progress, restored: true }).every((fragment) => fragment.state === 'restored')).toBe(true);
    expect(progress.foundFragmentIds).toHaveLength(2);
    expect(progress.restored).toBe(false);
  });
});
