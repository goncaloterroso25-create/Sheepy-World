import type { AudioAsset } from './audio';

/** Private/supplied expansion recordings are deliberately absent in the public edition. */
export const EXPANSION_STEPS = {} as const;
export const EXPANSION_AUDIO: readonly AudioAsset[] = [];
