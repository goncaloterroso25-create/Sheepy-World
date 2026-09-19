import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { CURATED_AUDIO } from '../src/config/audio.ts';
import { PERSONAL_PHOTOS, personalMedia } from '../src/data/personalPhotos.ts';

/** Build-only allowlist, sourced from the existing explicit runtime registrations. */
export default function approvedRuntimeMedia() {
  return {
    name: 'approved-runtime-media', apply: 'build',
    async buildStart() {
      const urls = new Set([
        ...CURATED_AUDIO.assets.map(asset => asset.url),
        ...Object.keys(PERSONAL_PHOTOS).flatMap(id => personalMedia(id).map(frame => frame.url)),
      ]);
      await Promise.all([...urls].map(async url => {
        if (!url.startsWith('/assets/') || url.includes('..')) throw new Error('Invalid runtime asset path');
        this.emitFile({ type: 'asset', fileName: url.slice(1), source: await readFile(new URL(`../public${url}`, import.meta.url)) });
      }));
    },
  };
}
