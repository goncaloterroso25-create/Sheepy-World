import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CURATED_AUDIO } from '../src/config/audio';

function waveFormat(file) {
  let offset = 12;
  while (offset + 8 < file.length) {
    const id = file.toString('ascii', offset, offset + 4);
    const size = file.readUInt32LE(offset + 4);
    if (id === 'fmt ') return { format:file.readUInt16LE(offset+8),rate:file.readUInt32LE(offset+12),bits:file.readUInt16LE(offset+22) };
    offset += 8 + size + (size % 2);
  }
}

it('ships valid full-source MP3 or nonempty 48 kHz PCM audio for every manifest URL', () => {
  for (const asset of CURATED_AUDIO.assets) {
    const file = readFileSync(`public${asset.url}`);
    if (asset.url.endsWith('.mp3')) {
      expect(file.length).toBeGreaterThan(100_000);
      expect(file.toString('ascii',0,3)==='ID3'||file[0]===0xff).toBe(true);
      continue;
    }
    expect(file.toString('ascii', 0, 4)).toBe('RIFF');
    expect(file.toString('ascii', 8, 12)).toBe('WAVE');
    const format=waveFormat(file);expect(format?.format).toBe(1);expect(format?.rate).toBe(48000);expect([16,24]).toContain(format?.bits);
    expect(file.length).toBeGreaterThan(100);
    if (asset.channel === 'footsteps') expect(file.length).toBeLessThan(23000);
  }
});
