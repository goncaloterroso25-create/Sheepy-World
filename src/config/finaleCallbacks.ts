/** Private finale recordings are intentionally silent in the public edition. */
export const FINALE_CALLBACKS: Record<'ending-song' | 'found-player' | 'farewell', string | undefined> = {
  'ending-song': undefined,
  'found-player': undefined,
  farewell: undefined,
};
