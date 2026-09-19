import { JOURNEY_MEDIA } from './journeyMedia.generated';

type JourneyCategory = keyof typeof JOURNEY_MEDIA;
const album = (category: JourneyCategory, title: string, caption: string) => ({
  ...JOURNEY_MEDIA[category][0],
  title,
  caption,
  gallery: JOURNEY_MEDIA[category],
});

/** Public-edition albums retain the viewer flow with fictional illustrated cards. */
export const JOURNEY_PHOTOS = {
  firstDate: album('firstDate', 'TWO SEATS', 'A fictional keepsake card for the public portfolio edition.'),
  performanceDate: album('performanceDate', 'ONE MORE SONG', 'A fictional evening-stage illustration replaces private media.'),
  everyday: album('everyday', 'COZY EVENING', 'Ordinary moments, represented here by original placeholder art.'),
  winter: album('winter', 'A LITTLE SNOW', 'A fictional winter card for the public demo.'),
  eclipse: album('eclipse', 'QUIET SKY', 'A symbolic card preserves the memory-system flow.'),
  buggy: album('buggy', 'SCENIC DETOUR', 'Private trip media omitted; a fictional landscape stands in.'),
  'festival-clue': album('festival-clue', 'MASKED FESTIVAL', 'A generic festival card replaces the private event media.'),
  'travel-clue': album('travel-clue', 'HILLSIDE MUSIC', 'A generic stage card replaces private festival media.'),
  sleepy: album('sleepy', 'COZY CAT NAP', 'A sleeping-cat illustration powers the timed couch callback.'),
  pets: album('pets', 'THE SUPERVISORS', 'A fictional cat card represents the public gallery demo.'),
  keepsake: album('keepsake', 'A PLACE KEPT', 'Private anniversary details are generalized in this edition.'),
  badge: album('badge', 'A SMALL KEEPSAKE', 'Identifying details were removed from this public card.'),
} as const;
