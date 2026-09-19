import { describe, expect, it } from 'vitest';
import {
  COMPUTER_BOOT_MESSAGE,
  COMPUTER_OPEN,
  computerReadMemoryIds,
  computerTerminalSession,
} from '../src/data/computerTerminal';
import { MEMORIES } from '../src/data/memories';
import { COMPUTER_MEMORY_ORDER, MEMORY_WORLD_UPDATES } from '../src/data/worldMemoryUpdates';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';

function restore(state: GameStateStore, memoryId: keyof typeof MEMORIES): void {
  const memory = MEMORIES[memoryId]!;
  for (const fragmentId of memory.fragmentIds) {
    expect(state.collectFragment(memory.id, fragmentId, memory.restoreAt)).toBe(true);
  }
  expect(state.restoreMemory(memory.id)).toBe(true);
}

describe('Phase 4D.2 diegetic computer', () => {
  it('boots clinically, then evolves curious to cheeky to personal in read order', () => {
    const state = new GameStateStore(new SaveRepository(new MemoryStorage()));
    for (const memoryId of COMPUTER_MEMORY_ORDER) restore(state, memoryId);

    const firstDiscovery = state.discoverMemoryComputer();
    const boot = computerTerminalSession(state.snapshot, state.pendingComputerMemoryId, firstDiscovery);
    expect(COMPUTER_OPEN).toBe('computer-terminal-open');
    expect(boot).toMatchObject({ kind: 'BOOT', message: COMPUTER_BOOT_MESSAGE });

    const voices: string[] = [];
    const ids: string[] = [];
    while (state.pendingComputerMemoryId) {
      const session = computerTerminalSession(state.snapshot, state.pendingComputerMemoryId, false);
      expect(session.kind).toBe('UPDATE');
      voices.push(session.message.voice);
      ids.push(session.message.id);
      expect(state.readComputerMemoryUpdate(session.memoryId)).toBe(session.memoryId);
    }

    expect(voices).toEqual(['CURIOUS', 'CHEEKY', 'PERSONAL']);
    expect(new Set(ids).size).toBe(3);
    expect(computerReadMemoryIds(state.snapshot)).toEqual(COMPUTER_MEMORY_ORDER);
    expect(state.computerReadCount).toBe(3);
  });

  it('queues a restoration made after discovery and acknowledges only the displayed update', () => {
    const state = new GameStateStore(new SaveRepository(new MemoryStorage()));
    expect(state.discoverMemoryComputer()).toBe(true);
    expect(state.pendingComputerMemoryId).toBeUndefined();

    restore(state, 'snow-day');
    expect(state.queueComputerMemoryUpdate('snow-day')).toBe(true);
    expect(state.queueComputerMemoryUpdate('snow-day')).toBe(false);
    expect(state.readComputerMemoryUpdate('first-date')).toBeUndefined();
    expect(state.pendingComputerMemoryId).toBe('snow-day');
    expect(state.readComputerMemoryUpdate('snow-day')).toBe('snow-day');
    expect(state.readComputerMemoryUpdate('snow-day')).toBeUndefined();
  });

  it('discovers after restorations without losing or duplicating queued updates across reloads', () => {
    const storage = new MemoryStorage();
    const repository = new SaveRepository(storage);
    const state = new GameStateStore(repository);
    restore(state, 'snow-day');
    restore(state, 'first-date');

    expect(state.discoverMemoryComputer()).toBe(true);
    expect(state.pendingComputerMemoryId).toBe('first-date');
    expect(state.readComputerMemoryUpdate('first-date')).toBe('first-date');
    expect(state.pendingComputerMemoryId).toBe('snow-day');

    const reloaded = new GameStateStore(repository);
    expect(reloaded.pendingComputerMemoryId).toBe('snow-day');
    expect(reloaded.readComputerMemoryUpdate('snow-day')).toBe('snow-day');
    expect(reloaded.pendingComputerMemoryId).toBeUndefined();
    expect(reloaded.queueComputerMemoryUpdate('first-date')).toBe(false);
  });

  it('shows the legacy cipher only while unresolved and never above unread restoration content', () => {
    const state = new GameStateStore(new SaveRepository(new MemoryStorage()));
    state.discoverMemoryComputer();
    expect(computerTerminalSession(state.snapshot, undefined, false).kind).toBe('CIPHER');

    restore(state, 'porto-performance');
    expect(state.queueComputerMemoryUpdate('porto-performance')).toBe(true);
    expect(computerTerminalSession(state.snapshot, state.pendingComputerMemoryId, false).kind).toBe('UPDATE');
    state.readComputerMemoryUpdate('porto-performance');
    expect(computerTerminalSession(state.snapshot, undefined, false).kind).toBe('CIPHER');

    state.completeEncounter('bedroom-cipher-solved');
    expect(computerTerminalSession(state.snapshot, undefined, false).kind).toBe('IDLE');
    const reloaded = new GameStateStore(new SaveRepository(new MemoryStorage()));
    reloaded.completeEncounter('bedroom-cipher-solved');
    expect(computerTerminalSession(reloaded.snapshot, undefined, false).kind).toBe('IDLE');
  });

  it('keeps observer text anonymous, spoiler-safe, and free of fragment directions', () => {
    const state = new GameStateStore(new SaveRepository(new MemoryStorage()));
    const messages = [
      ...COMPUTER_BOOT_MESSAGE.pages,
      ...Object.values(MEMORY_WORLD_UPDATES).map(update => update.computerMessage),
    ];
    for (const memoryId of COMPUTER_MEMORY_ORDER) {
      restore(state, memoryId);
      state.discoverMemoryComputer();
      const session = computerTerminalSession(state.snapshot, state.pendingComputerMemoryId, false);
      messages.push(...session.message.pages);
      state.readComputerMemoryUpdate(session.memoryId);
    }
    const all = messages.join(' ');
    expect(all).not.toMatch(/Protagonist|Gon[cç]alo|bench|venue|snowman|bonnet|fragment|clue|Porto|PERFORMANCE/i);
  });
});
