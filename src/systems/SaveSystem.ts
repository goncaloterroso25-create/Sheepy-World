import type {
  GameSettings,
  InteractionProgress,
  MemoryProgress,
  SaveData,
  StorageLike,
  TutorialProgress,
} from '../types/game';

import { AUDIO_DEFAULTS } from '../config/audio';
import { sanitizeWorldLocation, START_LOCATION } from '../world/regions/definitions';
import { sanitizeCats } from '../data/cats';
import { MEMORIES } from '../data/memories';

export const SAVE_SCHEMA_VERSION = 8;
export const SAVE_KEY = 'sheepy-world.save';

const DEFAULT_SETTINGS: GameSettings = {
  ...AUDIO_DEFAULTS,
  reducedCameraMotion: false,
};

export function createDefaultSave(): SaveData {
  return {
    version: SAVE_SCHEMA_VERSION,
    worldLocation: { ...START_LOCATION },
    cats: { tobias: 'outside', teemi: 'home' },
    encounters: [],
    memories: {},
    interactions: {},
    flags: {},
    inventory: [],
    achievements: [],
    discoveredLocations: ['prototype-autumn-park'],
    settings: { ...DEFAULT_SETTINGS },
    tutorials: {
      controlDockSeen: false,
      scrapbookOpened: false,
      bagOpened: false,
    },
    counters: { yellowCars: 0 },
  };
}

function uniqueStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === 'string'))]
    : [];
}

function stringFlags(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([key, flag]) => [key.slice(0, 80), flag.slice(0, 120)]));
}

function clampVolume(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback;
}

function sanitizeMemory(value: unknown): MemoryProgress {
  const record = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    foundFragmentIds: uniqueStrings(record.foundFragmentIds),
    restored: record.restored === true,
  };
}

function sanitizeInteraction(value: unknown): InteractionProgress {
  const record = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    seenBranchIds: uniqueStrings(record.seenBranchIds),
    exhausted: record.exhausted === true,
  };
}

function sanitizeTutorials(value: unknown): TutorialProgress {
  const record = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    controlDockSeen: record.controlDockSeen === true,
    scrapbookOpened: record.scrapbookOpened === true,
    bagOpened: record.bagOpened === true,
  };
}

export function sanitizeSave(value: unknown): SaveData {
  const defaults = createDefaultSave();
  if (!value || typeof value !== 'object') return defaults;

  const raw = value as Record<string, unknown>;
  if (![1, 2, 3, 4, 5, 6, 7, SAVE_SCHEMA_VERSION].includes(raw.version as number)) return defaults;

  const rawMemories = raw.memories && typeof raw.memories === 'object'
    ? raw.memories as Record<string, unknown>
    : {};
  const memories = Object.fromEntries(
    Object.entries(rawMemories).map(([id, progress]) => [id, sanitizeMemory(progress)]),
  );
  for (const memory of Object.values(MEMORIES).filter(m => m.kind === 'CORE')) {
    const progress = memories[memory.id];
    if (!progress) continue;
    progress.foundFragmentIds = progress.foundFragmentIds.filter(id => memory.fragmentIds.includes(id));
    // Old restored pages stay restored. Fresh Phase 4D saves may legitimately
    // hold every clue while waiting at the authored reconstruction anchor.
    progress.restored = progress.restored && progress.foundFragmentIds.length >= memory.restoreAt;
  }
  const rawInteractions = raw.interactions && typeof raw.interactions === 'object'
    ? raw.interactions as Record<string, unknown>
    : {};
  const interactions = Object.fromEntries(
    Object.entries(rawInteractions).map(([id, progress]) => [id, sanitizeInteraction(progress)]),
  );
  const rawSettings = raw.settings && typeof raw.settings === 'object'
    ? raw.settings as Record<string, unknown>
    : {};
  const rawCounters = raw.counters && typeof raw.counters === 'object'
    ? raw.counters as Record<string, unknown>
    : {};

  return {
    version: SAVE_SCHEMA_VERSION,
    worldLocation: sanitizeWorldLocation(raw.worldLocation),
    cats: sanitizeCats(raw.cats),
    encounters: uniqueStrings(raw.encounters),
    memories,
    interactions,
    flags: stringFlags(raw.flags),
    inventory: uniqueStrings(raw.inventory),
    achievements: uniqueStrings(raw.achievements),
    discoveredLocations: uniqueStrings(raw.discoveredLocations),
    settings: {
      masterVolume: clampVolume(rawSettings.masterVolume, defaults.settings.masterVolume),
      footstepsVolume: clampVolume(rawSettings.footstepsVolume, defaults.settings.footstepsVolume),
      musicVolume: clampVolume(rawSettings.musicVolume, defaults.settings.musicVolume),
      ambienceVolume: clampVolume(rawSettings.ambienceVolume, defaults.settings.ambienceVolume),
      sfxVolume: clampVolume(rawSettings.sfxVolume, defaults.settings.sfxVolume),
      voiceVolume: clampVolume(rawSettings.voiceVolume, defaults.settings.voiceVolume),
      reducedCameraMotion: rawSettings.reducedCameraMotion === true,
    },
    tutorials: sanitizeTutorials(raw.tutorials),
    counters: {
      yellowCars: typeof rawCounters.yellowCars === 'number' && Number.isFinite(rawCounters.yellowCars)
        ? Math.max(0, Math.floor(rawCounters.yellowCars))
        : 0,
    },
  };
}

export class SaveRepository {
  constructor(
    private readonly storage: StorageLike,
    private readonly key = SAVE_KEY,
  ) {}

  load(): SaveData {
    try {
      const serialized = this.storage.getItem(this.key);
      if (!serialized) return createDefaultSave();
      return sanitizeSave(JSON.parse(serialized));
    } catch {
      return createDefaultSave();
    }
  }

  save(data: SaveData): void {
    try {
      this.storage.setItem(this.key, JSON.stringify(sanitizeSave(data)));
    } catch {
      // A blocked or full localStorage should never stop the game loop.
    }
  }

  reset(): SaveData {
    try {
      this.storage.removeItem(this.key);
    } catch {
      // Defaults still provide a safe in-memory reset.
    }
    return createDefaultSave();
  }
}
