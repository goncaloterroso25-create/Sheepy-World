/** Curated fictional artwork for the privacy-safe public portfolio edition. */
const image = (key: string, file: string) => ({
  key,
  url: `/assets/placeholders/${file}`,
  kind: 'image' as const,
});

export const JOURNEY_MEDIA = {
  firstDate: [image('memory-autumn-bench', 'autumn-bench.png')],
  performanceDate: [image('memory-evening-stage', 'evening-stage.png')],
  everyday: [image('memory-cozy-cat', 'cozy-cat.png')],
  winter: [image('memory-snow-sheep', 'snow-sheep.png')],
  eclipse: [image('memory-quiet-sky', 'evening-stage.png')],
  buggy: [image('memory-scenic-detour', 'autumn-bench.png')],
  'festival-clue': [image('memory-festival-lanterns', 'evening-stage.png')],
  'travel-clue': [image('memory-hillside', 'autumn-bench.png')],
  sleepy: [image('memory-cozy-callback', 'cozy-cat.png')],
  pets: [image('memory-cat-companion', 'cozy-cat.png')],
  keepsake: [image('memory-kept-place', 'autumn-bench.png')],
  badge: [image('memory-keepsake-card', 'evening-stage.png')],
} as const;
