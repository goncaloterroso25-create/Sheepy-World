import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PUBLIC_TOGETHER_COPY } from '../src/data/publicEdition';
it('keeps one local Together owner without timers, saved positions or a second finale actor',()=>{
  const source=readFileSync('src/world/regions/TogetherWorld.ts','utf8');
  expect(source).not.toMatch(/setTimeout|setInterval|delayedCall|time\.addEvent|tweens\.add|setFlag/);
  expect(source).toContain("this.region.id !== 'final-park'");
  expect(source).toContain('this.unsubscribe()');expect(source).toContain('gameEvents.off');expect(source).toContain('registry.remove(TOGETHER_RUNTIME)');
  expect(source).toContain('Damn baby it shtinks!!!');expect(PUBLIC_TOGETHER_COPY.pinchCallback).toBe('Got your nose!!!');
});
