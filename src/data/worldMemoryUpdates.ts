export interface MemoryWorldUpdate {
  memoryId: string;
  effectId: string;
  /**
   * Anonymous observer trace used by diagnostics and older call sites. The
   * terminal presentation itself is selected by read order so its voice can
   * evolve from clinical to personal regardless of restoration order.
   */
  computerMessage: string;
}

/** Stable queue order when several restorations happened before the PC was found. */
export const COMPUTER_MEMORY_ORDER = ['first-date', 'porto-performance', 'snow-day'] as const;

/** Small, order-independent callbacks. They never expose the future partner. */
export const MEMORY_WORLD_UPDATES: Readonly<Record<string, MemoryWorldUpdate>> = {
  'first-date': {
    memoryId:'first-date',
    effectId:'autumn-bench-warmth',
    computerMessage:'Restoration registered. The world altered its own record before the observer could ask why.',
  },
  'porto-performance': {
    memoryId:'porto-performance',
    effectId:'porto-venue-afterglow',
    computerMessage:'Restoration registered. Another recovered pattern settled without an identified author.',
  },
  'snow-day': {
    memoryId:'snow-day',
    effectId:'snow-jeronimo-remains',
    computerMessage:'Restoration registered. The world retained the change and appears unexpectedly pleased.',
  },
};
