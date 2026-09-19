import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
vi.mock('../src/art/textureFactory', () => ({ createPixelTexture: vi.fn() }));
import { forestTree } from '../src/art/forestStyle';
import { expeditionStyle } from '../src/art/expeditionStyle';
import { EXPEDITION_LOOKS } from '../src/art/festivalTextures';
import { drawProtagonistPortrait } from '../src/art/protagonistPortrait';
import { BLUSH_ACCENT } from '../src/art/characterFoundation';

function raster(w: number, h: number) {
  const pixels = new Map<string, number>();
  const rects: number[][] = [];
  let color = 0;
  const g = { fillStyle: (c: number) => { color = c; return g; },
    fillRect: (x: number, y: number, width: number, height: number) => {
      rects.push([x, y, width, height]);
      for (let yy = y; yy < y + height; yy++) for (let xx = x; xx < x + width; xx++) {
        if (xx >= 0 && yy >= 0 && xx < w && yy < h) pixels.set(`${xx},${yy}`, color);
      }
      return g;
    } };
  return { g: g as unknown as Phaser.GameObjects.Graphics, pixels, rects };
}
describe('Batch 2 authored art contracts', () => {
  it('keeps the anatomical left playfulCallback visible after all hair layers in both portraits', () => {
    for (const warm of [true, false]) {
      const r = raster(64, 72); drawProtagonistPortrait(r.g, warm);
      expect(r.pixels.get('41,40')).toBe(BLUSH_ACCENT);
      expect(r.pixels.get('42,41')).toBe(BLUSH_ACCENT);
      expect(r.pixels.get('22,40')).not.toBe(BLUSH_ACCENT);
    }
  });
  it('creates three genuinely distinct tree masks within the existing footprint', () => {
    const masks = [0, 1, 2].map(i => {
      const r = raster(104, 132); forestTree(r.g, i);
      for (const [x, y, w, h] of r.rects) {
        expect([x, y, w, h].every(Number.isInteger)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0); expect(y).toBeGreaterThanOrEqual(0);
        expect(x! + w!).toBeLessThanOrEqual(104); expect(y! + h!).toBeLessThanOrEqual(132);
      }
      return [...r.pixels.keys()].sort().join(';');
    });
    expect(new Set(masks).size).toBe(3);
  });
  it('gives the four expedition characters different silhouettes on unchanged canvases', () => {
    const masks = EXPEDITION_LOOKS.map(look => {
      const r = raster(24, 36); expeditionStyle(r.g, look);
      for (const [x, y, w, h] of r.rects) {
        expect([x, y, w, h].every(Number.isInteger)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0); expect(y).toBeGreaterThanOrEqual(0);
        expect(x! + w!).toBeLessThanOrEqual(24); expect(y! + h!).toBeLessThanOrEqual(36);
      }
      return [...r.pixels.keys()].sort().join(';');
    });
    expect(new Set(masks).size).toBe(4);
  });
});
