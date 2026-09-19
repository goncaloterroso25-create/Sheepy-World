import { describe, expect, it } from 'vitest';
import { calculatePixelPerfectSize } from '../src/systems/PixelScaleManager';

describe('pixel-perfect presentation sizing', () => {
  it('uses whole logical-pixel multiples at standard desktop sizes', () => {
    expect(calculatePixelPerfectSize(1366, 768, 1)).toEqual({
      cssWidth: 1280,
      cssHeight: 720,
      physicalScale: 2,
    });
    expect(calculatePixelPerfectSize(1600, 900, 1)).toEqual({
      cssWidth: 1280,
      cssHeight: 720,
      physicalScale: 2,
    });
    expect(calculatePixelPerfectSize(1920, 1080, 1)).toEqual({
      cssWidth: 1920,
      cssHeight: 1080,
      physicalScale: 3,
    });
  });

  it('keeps the physical multiplier whole at fractional device scale', () => {
    const size = calculatePixelPerfectSize(1024, 768, 1.25);
    expect(size.physicalScale).toBe(2);
    expect(size.cssWidth * 1.25 / 640).toBe(2);
    expect(size.cssHeight * 1.25 / 360).toBe(2);
  });
});
