import type { ItemDefinition, MemoryDefinition, MemoryProgress } from '../types/game';
import { UI_COPY } from '../data/uiCopy';

export const BAG_GRID = { columns: 3, rows: 3 } as const;

/** View-local selection; never persisted and never changes collected item IDs. */
export class BagSelection {
  private entries: readonly ItemDefinition[] = [];
  index = -1;
  firstRow = 0;

  get items(): readonly ItemDefinition[] { return this.entries; }
  get selected(): ItemDefinition | undefined { return this.entries[this.index]; }
  get totalRows(): number { return Math.ceil(this.entries.length / BAG_GRID.columns); }
  get maxFirstRow(): number { return Math.max(0, this.totalRows - BAG_GRID.rows); }
  get visible(): readonly ItemDefinition[] {
    return this.entries.slice(this.firstRow * BAG_GRID.columns, (this.firstRow + BAG_GRID.rows) * BAG_GRID.columns);
  }

  setItems(items: readonly ItemDefinition[]): void {
    const previousId = this.selected?.id;
    this.entries = items;
    const preserved = items.findIndex((item) => item.id === previousId);
    this.index = items.length ? Math.max(0, Math.min(items.length - 1, preserved >= 0 ? preserved : this.index)) : -1;
    this.firstRow = Math.min(this.firstRow, this.maxFirstRow);
    this.revealSelection();
  }

  select(index: number): boolean {
    if (!Number.isInteger(index) || index < 0 || index >= this.entries.length || index === this.index) return false;
    this.index = index;
    this.revealSelection();
    return true;
  }

  move(direction: 'left' | 'right' | 'up' | 'down'): boolean {
    if (this.index < 0) return false;
    const column = this.index % BAG_GRID.columns;
    if (direction === 'left') return column > 0 && this.select(this.index - 1);
    if (direction === 'right') return column < BAG_GRID.columns - 1 && this.select(this.index + 1);
    const offset = direction === 'up' ? -BAG_GRID.columns : BAG_GRID.columns;
    if (direction === 'down' && Math.floor(this.index / BAG_GRID.columns) >= this.totalRows - 1) return false;
    return this.select(Math.min(this.entries.length - 1, this.index + offset));
  }

  scroll(rows: number): boolean {
    if (!Number.isFinite(rows)) return false;
    const next = Math.max(0, Math.min(this.maxFirstRow, this.firstRow + Math.trunc(rows)));
    if (next === this.firstRow) return false;
    this.firstRow = next;
    const first = next * BAG_GRID.columns;
    const last = Math.min(this.entries.length - 1, (next + BAG_GRID.rows) * BAG_GRID.columns - 1);
    if (this.index < first) this.index = Math.min(last, first + this.index % BAG_GRID.columns);
    if (this.index > last) this.index = Math.min(last, (next + BAG_GRID.rows - 1) * BAG_GRID.columns + this.index % BAG_GRID.columns);
    return true;
  }

  private revealSelection(): void {
    if (this.index < 0) { this.firstRow = 0; return; }
    const row = Math.floor(this.index / BAG_GRID.columns);
    if (row < this.firstRow) this.firstRow = row;
    if (row >= this.firstRow + BAG_GRID.rows) this.firstRow = row - BAG_GRID.rows + 1;
    this.firstRow = Math.min(this.firstRow, this.maxFirstRow);
  }
}

export function inventoryEntries(ids: readonly string[], definitions: Readonly<Record<string, ItemDefinition>>): ItemDefinition[] {
  return [...new Set(ids)].map((id) => definitions[id] ?? {
    id, name: UI_COPY.bag.unknownName, description: UI_COPY.bag.unknownDescription, glyph: '?',
  });
}

export type FragmentState = 'missing' | 'found' | 'restored';
export type MemoryDiscoveryState = 'UNKNOWN' | 'DISCOVERING' | 'RESONATING' | 'RESTORED';
export function memoryDiscoveryState(memory: MemoryDefinition, progress?: MemoryProgress): MemoryDiscoveryState {
  if (progress?.restored) return 'RESTORED';
  const count = memory.fragmentIds.filter(id => progress?.foundFragmentIds.includes(id)).length;
  if (count === 0) return 'UNKNOWN';
  if (count >= memory.restoreAt) return 'RESONATING';
  return 'DISCOVERING';
}
export function memoryFragments(memory: MemoryDefinition, progress?: MemoryProgress): { id: string; state: FragmentState }[] {
  return memory.fragmentIds.map((id) => ({ id,
    state: progress?.restored ? 'restored' : progress?.foundFragmentIds.includes(id) ? 'found' : 'missing',
  }));
}

/** Order comes from authored memory definitions, not from save insertion order. */
export class ScrapbookSelection {
  private pages: readonly MemoryDefinition[] = [];
  private readonly fragmentIndexes = new Map<string, number>();
  index = 0;
  get count(): number { return this.pages.length; }
  get selected(): MemoryDefinition | undefined { return this.pages[this.index]; }
  get fragmentIndex(): number { return this.selected ? this.fragmentIndexes.get(this.selected.id) ?? 0 : 0; }
  setPages(pages: readonly MemoryDefinition[]): void {
    const previous = this.selected?.id;
    this.pages = pages;
    const preserved = pages.findIndex((page) => page.id === previous);
    this.index = preserved >= 0 ? preserved : Math.max(0, Math.min(this.index, pages.length - 1));
    this.clampFragment();
  }
  turn(direction: -1 | 1): boolean {
    const next = this.index + direction;
    if (next < 0 || next >= this.pages.length) return false;
    this.index = next;
    this.clampFragment();
    return true;
  }
  selectPage(id: string): boolean {
    const next = this.pages.findIndex(page => page.id === id);
    if (next < 0 || next === this.index) return false;
    this.index = next;
    this.clampFragment();
    return true;
  }
  selectFragment(index: number, progress?: MemoryProgress): boolean {
    const memory = this.selected;
    if (!memory || !Number.isInteger(index) || index < 0 || index >= memory.fragmentIds.length
      || !progress?.foundFragmentIds.includes(memory.fragmentIds[index]!) || index === this.fragmentIndex) return false;
    this.fragmentIndexes.set(memory.id, index);
    return true;
  }
  moveFragment(direction: -1|1, progress?: MemoryProgress): boolean {
    const memory = this.selected;
    if (!memory) return false;
    const found = memory.fragmentIds.map((_,index)=>index)
      .filter(index=>progress?.foundFragmentIds.includes(memory.fragmentIds[index]!));
    if (found.length < 2) return false;
    const current = Math.max(0,found.indexOf(this.fragmentIndex));
    const next = found[(current + direction + found.length) % found.length]!;
    return this.selectFragment(next,progress);
  }
  private clampFragment(): void {
    const memory=this.selected;
    if (!memory) return;
    const current=this.fragmentIndexes.get(memory.id)??0;
    this.fragmentIndexes.set(memory.id,Math.max(0,Math.min(memory.fragmentIds.length-1,current)));
  }
}
