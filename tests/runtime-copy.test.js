import { it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

it('runtime copy has no malformed partner spelling and bitmap fonts cover cedilla cases', () => {
  const files = dir => readdirSync(dir).flatMap(f => statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]);
  for (const file of files('src').filter(f => f.endsWith('.ts'))) {
    expect(readFileSync(file, 'utf8'), file).not.toMatch(/GonÃ|Gon�|Gonc[ae]llo/);
  }
  const font = readFileSync('src/ui/PixelFont.ts', 'utf8');
  expect(font).toContain("...'Çç"); expect(font).toContain('ç:'); expect(font).toContain('Ç:');
  expect(font).toContain('Éé'); expect(font).toContain('Óó'); expect(font).toContain("normalize('NFD')");
});
