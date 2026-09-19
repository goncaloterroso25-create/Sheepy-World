import { existsSync, lstatSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', '.vite', 'target']);
const forbiddenRootEntries = ['references', 'private', 'private-assets', 'raw-assets', 'artifacts', 'release'];
const forbiddenBinaryExtensions = new Set(['.exe', '.msi', '.dll', '.zip', '.wav', '.mp4', '.webm', '.map']);
const textExtensions = new Set(['.ts', '.js', '.mjs', '.mts', '.json', '.md', '.html', '.css', '.toml', '.rs', '.lock', '.xml']);
const allowedPublicAssets = new Set([
  'public/assets/audio/music/sheepy-world-theme.mp3',
  'public/assets/placeholders/autumn-bench.png',
  'public/assets/placeholders/cozy-cat.png',
  'public/assets/placeholders/evening-stage.png',
  'public/assets/placeholders/snow-sheep.png',
]);
const contentScanExclusions = new Set([
  'scripts/privacy-check.mjs',
  'tests/privacy-public.test.ts',
  'PUBLIC-REPO-AUDIT.md',
]);
const forbiddenContent = [
  ['local user path', /C:\\Users\\/i],
  ['local project path', /C:\\CODEX Projects\\/i],
  ['private media route', /assets\/photos/i],
  ['date-shaped content identifier', /\b(?:date|september)[-_]\d{1,4}\b/i],
  ['private key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['probable OpenAI token', /sk-[A-Za-z0-9_-]{20,}/],
  ['probable GitHub token', /gh[pousr]_[A-Za-z0-9]{20,}/],
  ['probable AWS access key', /AKIA[0-9A-Z]{16}/],
];
const findings = [];

for (const entry of forbiddenRootEntries) {
  if (existsSync(resolve(root, entry))) findings.push(`${entry}/ must not exist`);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const absolute = resolve(directory, entry.name);
    const rel = relative(root, absolute).replaceAll('\\', '/');
    if (entry.isSymbolicLink() || lstatSync(absolute).isSymbolicLink()) {
      findings.push(`${rel}: symbolic links are not allowed in the review copy`);
      return [];
    }
    return entry.isDirectory() ? walk(absolute) : [{ absolute, rel }];
  });
}

for (const { absolute, rel } of walk(root)) {
  const extension = extname(rel).toLowerCase();
  if (forbiddenBinaryExtensions.has(extension)) findings.push(`${rel}: forbidden binary/archive type`);
  if (statSync(absolute).size > 15 * 1024 * 1024) findings.push(`${rel}: file exceeds the 15 MiB review threshold`);
  if (rel.startsWith('public/assets/') && !allowedPublicAssets.has(rel)) findings.push(`${rel}: public asset is not allowlisted`);
  if (rel.match(/\.(?:png|jpe?g|gif|webp)$/i)
      && !rel.startsWith('src-tauri/icons/')
      && !rel.startsWith('docs/screenshots/')
      && !allowedPublicAssets.has(rel)) {
    findings.push(`${rel}: image is outside approved public-art locations`);
  }
  if (!textExtensions.has(extension) || contentScanExclusions.has(rel)) continue;
  const text = readFileSync(absolute, 'utf8');
  for (const [label, pattern] of forbiddenContent) {
    if (pattern.test(text)) findings.push(`${rel}: ${label}`);
  }
}

const finalLetter = readFileSync(resolve(root, 'src/data/finalLetter.ts'), 'utf8');
const safeLetter = '[The original anniversary letter is private and has been omitted from the public portfolio edition.]';
const finalLetterExport = finalLetter.match(/export const FINAL_LETTER\s*=\s*'([^']*)';/s)?.[1];
if (finalLetterExport !== safeLetter) {
  findings.push('src/data/finalLetter.ts: public placeholder contract changed');
}

const storyCompletion = readFileSync(resolve(root, 'src/data/storyCompletion.ts'), 'utf8');
for (const token of ['anniversary-memory', 'keepsake-first', 'keepsake-second']) {
  if (!storyCompletion.includes(token)) {
    findings.push(`src/data/storyCompletion.ts: missing generalized ${token} contract`);
  }
}

if (findings.length) {
  console.error(`Privacy check failed (${findings.length} finding${findings.length === 1 ? '' : 's'}):`);
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log('Privacy check passed: public paths, media, generalized keepsakes, and secret-pattern contracts are intact.');
}
