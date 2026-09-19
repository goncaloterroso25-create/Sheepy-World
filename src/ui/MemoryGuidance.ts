import { FINAL_MEMORY, finalGateOpen, NON_FINAL_MEMORIES } from '../data/storyCompletion';
import type { SaveData } from '../types/game';

type MemoryState = Pick<SaveData, 'memories'>;

/** Marginal handwriting, not a second progression system or an early quest hint. */
export function lateMemoryNote(state: MemoryState): string | undefined {
  if (state.memories[FINAL_MEMORY]?.restored) return undefined;
  const whole = NON_FINAL_MEMORIES.filter(id => state.memories[id]?.restored).length;
  if (whole < 3) return undefined;
  if (finalGateOpen(state)) return 'Something feels different.\nEven the familiar paths.';
  return whole >= 4 ? 'Whole pages, loose ends.\nSomething has not settled.'
    : 'More than loose pieces.\nSome pages are still waiting.';
}

export const ROUTE_READY_NOTE = {
  title: 'Something changed',
  detail: 'In Autumn, petals stir where there were only leaves.',
} as const;

/** Scene-local, monotonic observation. Loading an already-ready save is silent. */
export class RouteReadyObservation {
  private ready: boolean;
  private pending = false;
  private presented = false;

  constructor(state: MemoryState) { this.ready = finalGateOpen(state); }

  observe(state: MemoryState): void {
    const ready = finalGateOpen(state);
    if (ready && !this.ready && !this.presented) this.pending = true;
    this.ready = ready;
  }

  take(canPresent: boolean): typeof ROUTE_READY_NOTE | undefined {
    if (!canPresent || !this.pending || !this.ready) return undefined;
    this.pending = false;
    this.presented = true;
    return ROUTE_READY_NOTE;
  }
}
