import { JOURNEY_PHOTOS } from './journeyPhotos';

/**
 * Public-safe media allowlist. Every file is fictional placeholder art made for this edition;
 * no photo or video from the private anniversary release is present.
 */
export const PERSONAL_PHOTOS = {
  ...JOURNEY_PHOTOS,
  notes: {
    key: 'memory-cozy-cat', url: '/assets/placeholders/cozy-cat.png',
    title: 'A PRIVATE NOTE', caption: 'Personal message omitted from the public portfolio edition.',
  },
  frame: {
    key: 'memory-autumn-bench', url: '/assets/placeholders/autumn-bench.png',
    title: 'A PLACEHOLDER FRAME', caption: 'Private photograph replaced with fictional game art.',
  },
  plate: {
    key: 'memory-evening-stage', url: '/assets/placeholders/evening-stage.png',
    title: 'A QUIET CLUE', caption: 'A public-safe card keeps this interaction demonstrable.',
  },
  jeronimo: {
    key: 'memory-snow-sheep', url: '/assets/placeholders/snow-sheep.png',
    title: 'SNOW SHEEP', caption: 'A fictional winter illustration for the portfolio demo.',
    gallery: [JOURNEY_PHOTOS.winter.gallery[0]],
  },
} as const;

export type PersonalPhotoId = keyof typeof PERSONAL_PHOTOS;
export interface PersonalMedia { key: string; url: string; kind: 'image' | 'video' }
export function personalMedia(id: PersonalPhotoId): readonly PersonalMedia[] {
  const photo = PERSONAL_PHOTOS[id];
  const frames = 'gallery' in photo ? photo.gallery : [photo];
  return frames.map((frame) => ({
    key: frame.key,
    url: frame.url,
    kind: 'kind' in frame ? frame.kind : 'image',
  }));
}

export const PHOTO_OPEN = 'personal-photo-open';
export const PHOTO_CLOSED = 'personal-photo-closed';
export const CIPHER_OPEN = 'bedroom-cipher-open';
