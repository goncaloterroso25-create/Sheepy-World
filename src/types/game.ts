import type { WorldLocation } from '../world/regions/definitions';
import type { CatSave } from '../data/cats';

/** Stable authoring tiers. These describe release scope, not player progress. */
export type ContentPriority = 'MUST_SHIP' | 'IMPORTANT' | 'STRETCH' | 'CUT';

export type MemoryKind = 'CORE' | 'OPTIONAL';

export interface RegionDefinition {
  id: string;
  name: string;
  adjacentRegionIds: readonly string[];
  landmarkIds: readonly string[];
  memoryAnchorIds: readonly string[];
  ambientEventIds: readonly string[];
  priority: ContentPriority;
}

export interface MemoryDefinition {
  id: string;
  title: string;
  fragmentIds: readonly string[];
  fragmentClues: Readonly<Record<string, string>>;
  fragmentDetails?: Readonly<Record<string, { found: string; restored: string }>>;
  restoreAt: number;
  kind?: MemoryKind;
  regionIds?: readonly string[];
  emotionalPurpose?: string;
  restorationAnchorId?: string;
  date?: string;
  restoredText?: string;
  theme?: 'first-date' | 'performance' | 'snow';
  nextHint?: string;
  priority?: ContentPriority;
}

export interface MemoryFragmentDefinition {
  id: string;
  memoryId: string;
  regionId: string;
  firstClue: string;
  laterClue: string;
  discoveryId: string;
  priority: ContentPriority;
}

export interface ArtifactDefinition {
  id: string;
  name: string;
  description: string;
  regionId: string;
  discoveryId: string;
  glyph?: string;
  priority: ContentPriority;
}

export type NpcKind = 'CAT' | 'MEMORY_SILHOUETTE' | 'AMBIENT';

export interface NpcDefinition {
  id: string;
  name: string;
  kind: NpcKind;
  firstRegionId: string;
  interactionId?: string;
  authoredPerchIds?: readonly string[];
  priority: ContentPriority;
}

export type DiscoveryKind =
  | 'MEMORY_FRAGMENT'
  | 'ARTIFACT'
  | 'CAT'
  | 'LANDMARK'
  | 'SHORTCUT';

export interface DiscoveryDefinition {
  id: string;
  kind: DiscoveryKind;
  regionId: string;
  contentId: string;
  scrapbookEntryId?: string;
  achievementEventId?: string;
}

export interface HintDefinition {
  id: string;
  discoveryId: string;
  initialText: string;
  escalatedText: string;
  delayMs: number;
  visualCueId?: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  eventId: string;
  targetCount: number;
  priority: ContentPriority;
}

export interface AmbientEventDefinition {
  id: string;
  regionId: string;
  triggerId: string;
  weight: number;
  cooldownMs: number;
  requiredEventIds?: readonly string[];
  priority: ContentPriority;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  glyph: string;
  /** Presentation only. Item IDs and save format remain unchanged. */
  iconKey?: string;
  kind?: 'OBJECT' | 'CLOTHES' | 'PAPER';
  annotation?: string;
}

export interface DialogueChoice {
  id: string;
  label: string;
  nextId: string;
  condition?: { flag: string; equals?: string };
  setFlag?: { flag: string; value: string };
  /** Several sparse story flags may be written by one authored choice. */
  setFlags?: readonly { flag: string; value: string }[];
}

export const INTERACTION_MODES = {
  repeatable: 'REPEATABLE',
  oneShot: 'ONE_SHOT',
  branchExhaustible: 'BRANCH_EXHAUSTIBLE',
} as const;

export type InteractionMode = typeof INTERACTION_MODES[keyof typeof INTERACTION_MODES];

export interface DialogueInteractionDefinition {
  id: string;
  mode: InteractionMode;
  branchNodeId?: string;
  revisitNodeId?: string;
  completionNodeId?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  lines: readonly string[];
  choices?: readonly DialogueChoice[];
  nextId?: string;
  /** Fires once when this node is first rendered, keeping authored cues aligned with its caption/portrait. */
  onEnterEvent?: string;
  onCompleteEvent?: string;
  portraitKey?: string;
  expression?: 'neutral' | 'warm' | 'amused' | 'concerned' | 'serious';
  portraitSide?: 'left' | 'right';
  condition?: { flag: string; equals?: string };
}

export interface DialogueDefinition {
  id: string;
  startNodeId: string;
  nodes: Readonly<Record<string, DialogueNode>>;
  interaction: DialogueInteractionDefinition;
  portraitKey?: string;
  /** Optional authored world-space focus used to keep a tableau readable behind dialogue. */
  worldFocus?: Readonly<{ x: number; y: number }>;
}

export interface MemoryProgress {
  foundFragmentIds: string[];
  restored: boolean;
}

export interface InteractionProgress {
  seenBranchIds: string[];
  exhausted: boolean;
}

export interface GameSettings {
  masterVolume: number;
  footstepsVolume: number;
  musicVolume: number;
  ambienceVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  reducedCameraMotion: boolean;
}

export interface TutorialProgress {
  controlDockSeen: boolean;
  scrapbookOpened: boolean;
  bagOpened: boolean;
}

export interface SaveData {
  version: number;
  worldLocation: WorldLocation;
  cats: CatSave;
  encounters: string[];
  memories: Record<string, MemoryProgress>;
  interactions: Record<string, InteractionProgress>;
  /** Sparse authored story/conversation state; transient UI state never belongs here. */
  flags: Record<string, string>;
  inventory: string[];
  achievements: string[];
  discoveredLocations: string[];
  settings: GameSettings;
  tutorials: TutorialProgress;
  counters: {
    yellowCars: number;
  };
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
