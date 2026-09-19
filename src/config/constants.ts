export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;
export const TILE_SIZE = 16;

export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 768;

export const SCENE_KEYS = {
  boot: 'boot',
  title: 'title',
  park: 'park',
  ui: 'ui',
  gallery: 'art-gallery',
} as const;

export const REGISTRY_KEYS = {
  state: 'game-state',
  audio: 'audio-system',
  controlTutorialSeen: 'control-tutorial-seen',
} as const;

export const GAME_EVENTS = {
  dialogueStart: 'dialogue:start',
  interactionHint: 'interaction:hint',
  notification: 'ui:notification',
  uiBlockingChanged: 'ui:blocking-changed',
  stateChanged: 'state:changed',
  yellowCar: 'ambient:yellow-car',
  memoryResonanceNearby: 'memory:resonance-nearby',
} as const;

export const COLORS = {
  ink: 0x35251f,
  cream: 0xf4dfb3,
  paper: 0xe9cf9d,
  paperShadow: 0x5b3d32,
  rust: 0xa94e32,
  gold: 0xe0a83b,
  grass: 0x617844,
  grassDark: 0x3f5939,
  grassLight: 0x829358,
  path: 0xc39b68,
  pathDark: 0xa57b50,
  road: 0x3d4142,
} as const;
