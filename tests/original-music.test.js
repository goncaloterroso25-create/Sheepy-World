import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CURATED_AUDIO, SHEEPY_WORLD_THEME } from '../src/config/audio';

describe('original Sheepy World music integration', () => {
  it('registers one browser-ready canonical theme and retires both generated score keys', () => {
    const themes=CURATED_AUDIO.assets.filter(({key})=>key===SHEEPY_WORLD_THEME);
    expect(themes).toEqual([{
      key:SHEEPY_WORLD_THEME,
      url:'/assets/audio/music/sheepy-world-theme.mp3',
      channel:'music',
      gain:.85,
    }]);
    expect(CURATED_AUDIO.assets.some(({key})=>key==='menu-window-theme'||key==='finale-theme')).toBe(false);
    const file=readFileSync(`public${themes[0].url}`);
    expect(file.length).toBeGreaterThan(10_000_000);
    expect(file.toString('ascii',0,3)==='ID3'||file[0]===0xff).toBe(true);
  });
});
