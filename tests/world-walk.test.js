import { describe, expect, it } from 'vitest';
import walker from '../scripts/world-walk.cjs';

describe('real-input QA path planning', () => {
  it('keeps cardinal turns around a stall rather than assuming arbitrary-angle keyboard steering', () => {
    const world = { x: 144, y: 149, width: 256, height: 256, geometry: [{ x: 64, y: 64, width: 64, height: 64 }] };
    const points = walker.route(world, { x: 32, y: 37 });
    let previous = { x: world.x, y: world.y };
    for (const point of points) {
      expect(point.x === previous.x || point.y === previous.y).toBe(true);
      previous = point;
    }
    expect(points.at(-1)).toEqual({ x: 32, y: 37 });
  });
});
