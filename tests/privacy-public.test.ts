import { describe, expect, it } from 'vitest';
import { FINAL_LETTER } from '../src/data/finalLetter';
import { JOURNEY_PHOTOS } from '../src/data/journeyPhotos';
import { PUBLIC_TOGETHER_COPY } from '../src/data/publicEdition';

describe('public portfolio privacy contracts', () => {
  it('contains only the explicit final-letter omission notice', () => {
    expect(FINAL_LETTER).toBe(
      '[The original anniversary letter is private and has been omitted from the public portfolio edition.]',
    );
  });

  it('uses only fictional placeholder images for every public gallery album', () => {
    const frames = Object.values(JOURNEY_PHOTOS).flatMap((album) => album.gallery);
    expect(frames.length).toBeGreaterThan(0);
    expect(frames.every((frame) => frame.kind === 'image')).toBe(true);
    expect(new Set(frames.map((frame) => frame.url))).toEqual(new Set([
      '/assets/placeholders/autumn-bench.png',
      '/assets/placeholders/cozy-cat.png',
      '/assets/placeholders/evening-stage.png',
      '/assets/placeholders/snow-sheep.png',
    ]));
  });

  it('keeps the public Together interaction and removes the private callback wording', () => {
    expect(PUBLIC_TOGETHER_COPY).toEqual({
      switchSides: 'Switch sides?',
      bump: 'BUMP',
      pinchCallback: 'Got your nose!!!',
    });
  });
});
