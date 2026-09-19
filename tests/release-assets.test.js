import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { CURATED_AUDIO } from '../src/config/audio';
import { PERSONAL_PHOTOS, personalMedia } from '../src/data/personalPhotos';

const walk = dir => readdirSync(dir, {withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name).replaceAll('\\','/')]);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

it.skipIf(!existsSync('dist/index.html'))('RC build ships exactly approved runtime media, unchanged bytes, and no source/proof/debug payload', () => {
  const approved=[...new Set([...CURATED_AUDIO.assets.map(a=>a.url),...Object.keys(PERSONAL_PHOTOS).flatMap(id=>personalMedia(id).map(p=>p.url))])].sort();
  const files=walk('dist');
  expect(files.filter(p=>!/^dist\/(index\.html|assets\/index-[\w-]+\.(js|css))$/.test(p)).map(p=>p.slice(4)).sort()).toEqual(approved);
  for(const url of approved)expect(hash(readFileSync('dist'+url)),url).toBe(hash(readFileSync('public'+url)));
  expect(approved.some(p=>/sheepy world\.wav|menu-window|finale-theme|references|raw-assets|private-assets/i.test(p))).toBe(false);
  const source=files.filter(p=>/\.(js|css|html)$/.test(p)).map(p=>readFileSync(p,'utf8')).join('\n');
  expect(source).not.toMatch(/__SHEEPY_DEV__|movementDebug|turboAtivo|ArtGalleryScene|sourceMappingURL|C:\\Users\\|C:\/Users\/|BEGIN (?:RSA )?PRIVATE KEY|sk-proj-[\w-]+/);
});
