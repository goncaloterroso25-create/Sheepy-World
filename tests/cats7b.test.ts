import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/art/textureFactory', () => ({ createPixelTexture: vi.fn() }));
import { CAT_DIRECTIONS, CAT_NAMES, catPixels, catTexture } from '../src/art/catSprites';
import { CatRoam, catStep, safeCatSegment } from '../src/systems/CatMotion';
import { HOME_SOLIDS } from '../src/world/regions/HomeLayout';
import { TEEMI_PERCHES } from '../src/data/cats';

describe('Batch 7B native cat art and transient movement', () => {
  it('keeps complete 24x24 directional families and feet inside the canvas', () => {
    const keys = new Set<string>();
    for (const cat of CAT_NAMES) for (const dir of CAT_DIRECTIONS) for (const pose of ['idle', 'walk', 'sit', 'sleep', 'warning', 'eat'] as const) {
      for (let frame = 0; frame < (pose === 'walk' ? 4 : 1); frame++) {
        const pixels = catPixels(cat, dir, pose, frame); keys.add(catTexture(cat, dir, pose, frame));
        expect(pixels).toHaveLength(24); expect(pixels.every(row => row.length === 24)).toBe(true);
        expect(pixels[22]!.some(p => p !== '.')).toBe(true); expect(pixels[23]!.every(p => p === '.')).toBe(true);
      }
    }
    expect(keys.size).toBe(108);
  });
  it('retains eye colors, blaze/chin, calico bridge and Siamese points without white socks', () => {
    const t = catPixels('tobias', 'down'), c = catPixels('chicho', 'down'), e = catPixels('teemi', 'down');
    expect(t[7]![11]).toBe('W'); expect(t[14]![11]).toBe('D'); expect(t.flat()).toContain('E');
    expect(e[8]![11]).toBe('D'); expect(e[8]![10]).toBe('W'); expect(e.flat()).toContain('A'); expect(e.flat()).toContain('E');
    expect(c.flat()).toContain('B'); expect(c[22]![9]).toBe('M'); expect(c.flat()).not.toContain('W'); expect(c.flat()).not.toContain('A');
  });
  it('authors Teemi sides independently and keeps markings stationary through walking', () => {
    const left = catPixels('teemi', 'left'), right = catPixels('teemi', 'right');
    expect(right).not.toEqual(left.map(row => [...row].reverse()));
    for (const cat of CAT_NAMES) for (const dir of CAT_DIRECTIONS) {
      const a = catPixels(cat, dir, 'walk', 0), b = catPixels(cat, dir, 'walk', 1);
      expect(a.slice(0,18)).toEqual(b.slice(0,18)); expect(a).not.toEqual(b);
    }
  });
  it('moves continuously in all directions, caps background-frame deltas and never overshoots', () => {
    for (const [x,y,dir] of [[0,20,'down'],[0,-20,'up'],[-20,0,'left'],[20,0,'right']] as const) {
      const p = catStep({x:0,y:0},{x,y},16,60); expect(p.direction).toBe(dir); expect(Math.hypot(p.x,p.y)).toBeCloseTo(.96);
    }
    expect(catStep({x:0,y:0},{x:1,y:0},10000,60).x).toBe(1);
    expect(catStep({x:0,y:0},{x:100,y:0},10000,60).x).toBe(3);
  });
  it('roams locally, sits/sleeps, freezes under interaction locks and resets after a deliberate drop', () => {
    const cat = new CatRoam({x:100,y:100}, []), poses = new Set();
    for(let i=0;i<2400;i++) { cat.update(50,false); poses.add(cat.pose); expect(Math.hypot(cat.position.x-100,cat.position.y-100)).toBeLessThanOrEqual(23); }
    expect(poses).toEqual(new Set(['idle','walk','sit','sleep']));
    const old = {...cat.position}; for(let i=0;i<500;i++)cat.update(50,true); expect(cat.position).toEqual(old);
    cat.place({x:300,y:300}); expect(cat.position).toEqual({x:300,y:300}); expect(cat.pose).toBe('idle');
  });
  it('never walks through local furniture and retains the authored Teemi retreat corridor', () => {
    const wall = [{x:86,y:80,width:5,height:80}];
    expect(safeCatSegment({x:100,y:100},{x:78,y:100},wall)).toBe(false);
    expect(safeCatSegment(TEEMI_PERCHES[0],TEEMI_PERCHES[1],HOME_SOLIDS)).toBe(true);
    const cat = new CatRoam(TEEMI_PERCHES[0],HOME_SOLIDS,1);
    for(let i=0;i<1800;i++) {
      const from={...cat.position};cat.update(50,false);expect(safeCatSegment(from,cat.position,HOME_SOLIDS)).toBe(true);
      // An interaction can interrupt any point of the local walk before retreating.
      expect(safeCatSegment(cat.position,TEEMI_PERCHES[1],HOME_SOLIDS)).toBe(true);
    }
  });
});
