import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
vi.mock('../src/art/textureFactory', () => ({ createPixelTexture: vi.fn() }));
import { drawAutumnProofTree, drawAutumnProofBench, drawAutumnMeadow, drawAutumnDressing } from '../src/art/autumnStyleProof';
import { drawProtagonistPortrait } from '../src/art/protagonistPortrait';
import { dialogueLayout } from '../src/ui/DialogueLayout';

function graphics() {
  const rects: number[][] = [];
  const g = {
    fillStyle: () => g,
    fillRect: (...args: number[]) => { rects.push(args); return g; },
  };
  return { g: g as unknown as Phaser.GameObjects.Graphics, rects };
}

describe('Autumn and dialogue proof presentation', () => {
  it('keeps local tree and bench art inside the original texture footprints', () => {
    for (const [w, h, draw] of [
      ...[0, 1, 2, 3].map(i => [64, 76, (g: Phaser.GameObjects.Graphics) => drawAutumnProofTree(g, i)] as const),
      [60, 30, (g: Phaser.GameObjects.Graphics) => drawAutumnProofBench(g, true)] as const,
      [56, 28, (g: Phaser.GameObjects.Graphics) => drawAutumnProofBench(g, false)] as const,
    ]) {
      const { g, rects } = graphics(); draw(g);
      expect(rects.length).toBeGreaterThan(20);
      for (const [x, y, width, height] of rects) {
        expect(x).toBeGreaterThanOrEqual(0); expect(y).toBeGreaterThanOrEqual(0);
        expect(x! + width!).toBeLessThanOrEqual(w); expect(y! + height!).toBeLessThanOrEqual(h);
      }
    }
  });
  it('uses positive integer pixel clusters for all new native drawings', () => {
    const { g, rects } = graphics();
    drawAutumnMeadow(g); drawAutumnDressing(g);
    drawProtagonistPortrait(g, false); drawProtagonistPortrait(g, true);
    for (const args of rects) {
      expect(args.every(Number.isInteger)).toBe(true);
      expect(args[2]).toBeGreaterThan(0); expect(args[3]).toBeGreaterThan(0);
    }
  });
  it('reserves separate portrait, prose and three-choice columns on either side', () => {
    for (const side of ['left', 'right'] as const) {
      const l = dialogueLayout(side);
      const portrait = [l.portraitX - 32, l.portraitX + 32];
      expect(side === 'left' ? portrait[1]! <= l.textX : portrait[0]! >= l.textX + l.textWidth).toBe(true);
      expect(l.choiceX - l.choiceWidth / 2).toBe(l.textX);
      expect(l.choiceX + l.choiceWidth / 2).toBe(l.textX + l.textWidth);
      expect(l.choiceY + 2 * 21 + 9).toBeLessThan(346);
      expect(l.textY + 2 * 16).toBeLessThan(l.choiceY - 9);
    }
  });
});
