import type { SaveData } from '../types/game';
import { COMPUTER_MEMORY_ORDER, MEMORY_WORLD_UPDATES } from './worldMemoryUpdates';

/** Emitted by the authored bedroom PC. UIScene owns the modal lifecycle. */
export const COMPUTER_OPEN = 'computer-terminal-open';

export type ComputerVoice = 'CLINICAL' | 'CURIOUS' | 'CHEEKY' | 'PERSONAL';
export type ComputerSessionKind = 'BOOT' | 'UPDATE' | 'CIPHER' | 'IDLE';

export interface ComputerTerminalMessage {
  id: string;
  voice: ComputerVoice;
  heading: string;
  pages: readonly string[];
}

export interface ComputerTerminalSession {
  kind: ComputerSessionKind;
  message: ComputerTerminalMessage;
  /** A completed update acknowledges exactly this queued restoration. */
  memoryId?: string;
}

export interface ComputerOpenPayload {
  session: ComputerTerminalSession;
}

export const COMPUTER_BOOT_MESSAGE: ComputerTerminalMessage = {
  id: 'pc-boot',
  voice: 'CLINICAL',
  heading: 'LOCAL OBSERVER',
  pages: [
    'LOCAL OBSERVER ONLINE.\nRESTORATION CHANNEL: QUIET.\nSOURCE: UNKNOWN.',
    'WORLD STATE: STABLE.\nCHANGES WILL BE RECORDED.\nAUTHOR: NOT FOUND.',
  ],
};

const ORDERED_UPDATE_MESSAGES: readonly ComputerTerminalMessage[] = [
  {
    id: 'pc-update-curious',
    voice: 'CURIOUS',
    heading: 'CHANGE DETECTED',
    pages: [
      'RESTORATION EVENT ACCEPTED.\nTHE WORLD CHANGED WITHOUT AN AUTHOR.',
      'I AM RECORDING THE DIFFERENCE.\nWHO TAUGHT THIS PLACE TO REMEMBER?',
    ],
  },
  {
    id: 'pc-update-cheeky',
    voice: 'CHEEKY',
    heading: 'ANOTHER CHANGE',
    pages: [
      'THE WORLD ADJUSTED BEFORE I ASKED IT TO.\nTHAT IS BECOMING A HABIT.',
      'YOU KEEP FINDING THE LOOSE THREADS.\nIT APPEARS TO ENJOY THAT.',
    ],
  },
  {
    id: 'pc-update-personal',
    voice: 'PERSONAL',
    heading: 'PATTERN UPDATED',
    pages: [
      'PATTERN CONFIDENCE: HIGH.\nTHIS PLACE IS NOT ASSEMBLING AT RANDOM.',
      'IT KEEPS MAKING ROOM FOR YOU.\nI DO NOT THINK THAT IS AN ACCIDENT.',
    ],
  },
] as const;

const CIPHER_MESSAGE: ComputerTerminalMessage = {
  id: 'pc-cipher',
  voice: 'CLINICAL',
  heading: 'UNRESOLVED SIGNAL',
  pages: ['ONE LOCAL SIGNAL REMAINS UNRESOLVED.\nMANUAL DECODING IS AVAILABLE.'],
};

function readUpdateCount(save: Readonly<SaveData>): number {
  return COMPUTER_MEMORY_ORDER.filter(memoryId => save.flags[`pc-read-${memoryId}`] === 'true').length;
}

export function computerUpdateMessage(save: Readonly<SaveData>, memoryId: string): ComputerTerminalMessage {
  const ordinal = Math.min(readUpdateCount(save), ORDERED_UPDATE_MESSAGES.length - 1);
  const base = ORDERED_UPDATE_MESSAGES[ordinal]!;
  return { ...base, id: `${base.id}-${memoryId}` };
}

export function computerIdleMessage(save: Readonly<SaveData>): ComputerTerminalMessage {
  const restored = COMPUTER_MEMORY_ORDER.filter(memoryId => save.memories[memoryId]?.restored === true).length;
  if (restored === COMPUTER_MEMORY_ORDER.length) {
    return {
      id: 'pc-idle-personal',
      voice: 'PERSONAL',
      heading: 'OBSERVER IDLE',
      pages: ['NO UNREAD CHANGES.\nTHE PATTERN IS WARMER THAN EXPECTED.'],
    };
  }
  return {
    id: 'pc-idle',
    voice: restored > 0 ? 'CURIOUS' : 'CLINICAL',
    heading: 'OBSERVER IDLE',
    pages: [restored > 0
      ? 'NO UNREAD CHANGES.\nOBSERVATION CONTINUES.'
      : 'NO NEW SIGNALS.\nTHE WORLD IS LISTENING.'],
  };
}

/**
 * Pure session selection. First discovery always gets a clinical boot; unread
 * restorations then take priority over the one-off legacy cipher.
 */
export function computerTerminalSession(
  save: Readonly<SaveData>,
  pendingMemoryId: string | undefined,
  firstDiscovery: boolean,
): ComputerTerminalSession {
  if (firstDiscovery) return { kind: 'BOOT', message: COMPUTER_BOOT_MESSAGE };
  if (pendingMemoryId && Object.hasOwn(MEMORY_WORLD_UPDATES, pendingMemoryId)) {
    return {
      kind: 'UPDATE',
      memoryId: pendingMemoryId,
      message: computerUpdateMessage(save, pendingMemoryId),
    };
  }
  if (!save.encounters.includes('bedroom-cipher-solved')) {
    return { kind: 'CIPHER', message: CIPHER_MESSAGE };
  }
  return { kind: 'IDLE', message: computerIdleMessage(save) };
}

/** Exposed for deterministic tests and state diagnostics. */
export function computerReadMemoryIds(save: Readonly<SaveData>): readonly string[] {
  return COMPUTER_MEMORY_ORDER.filter(memoryId => save.flags[`pc-read-${memoryId}`] === 'true');
}
