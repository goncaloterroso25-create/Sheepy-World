/** Small authored Home hooks; no food, wardrobe, voice, or buff system. */
export const HOME_DISCOVERIES = [
  { id: 'half-glasses', blueprintId: 'A03', interactionId: 'home-drawer', x: 126, y: 326, label: 'The dresser drawer' },
  { id: 'naruto-shuriken-keychain', blueprintId: 'A01', interactionId: 'home-keychain-drawer', x: 310, y: 248, label: 'The desk drawer' },
] as const;

export const HOME_FUTURE_HOOKS = {
  hairTie: { id: 'home-hair-tie', x: 345, y: 201, role: 'prop-only' },
  cof: {
    interactionId: 'home-cof', event: 'home:cof-inspected',
    futureVoice: [
      { id: 'cof-offer', text: 'You want cof?' },
      { id: 'cof-pretty-baby', text: 'I make cof for pretty baby!' },
    ],
  },
} as const;

export const HOME_INSPECT_COPY = {
  couch: 'Suspiciously effective at ending movies early.',
  snack: 'Nuggies. And a few things to nibble while they cool.',
} as const;
