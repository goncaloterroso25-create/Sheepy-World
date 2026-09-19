import { describe, expect, it } from 'vitest';
import { TrafficProximity, trafficTarget } from '../src/systems/TrafficProximity';

describe('authored north-road ambience envelope', () => {
  it('is silent deep in the park, rises toward the road and respects zone ends', () => {
    expect(trafficTarget({ x: 400, y: 500 })).toBe(0);
    expect(trafficTarget({ x: 400, y: 350 })).toBeGreaterThan(0);
    expect(trafficTarget({ x: 400, y: 200 })).toBeGreaterThan(trafficTarget({ x: 400, y: 350 }));
    expect(trafficTarget({ x: 400, y: 150 })).toBe(1);
    expect(trafficTarget({ x: -600, y: 80 })).toBe(0);
    expect(trafficTarget({ x: NaN, y: 100 })).toBe(0);
  });

  it.each([30, 60, 144, 240])('fades in/out over elapsed time at %i render Hz without toggling', (rate) => {
    const fade = new TrafficProximity();
    expect(fade.update({ x: 400, y: 500 }, 1000)).toBe(0);
    let current = 0;
    for (let i = 0; i < rate * 1.5; i++) current = fade.update({ x: 400, y: 150 }, 1000 / rate);
    expect(current).toBeCloseTo(1 - Math.exp(-3), 8);
    const firstLeaving = fade.update({ x: 400, y: 500 }, 1000 / rate);
    expect(firstLeaving).toBeGreaterThan(0.88);
    expect(firstLeaving).toBeLessThan(current);
    for (let i = 1; i < rate * 1.5; i++) current = fade.update({ x: 400, y: 500 }, 1000 / rate);
    expect(current).toBeCloseTo((1 - Math.exp(-3)) * Math.exp(-3), 8);
    expect(fade.update({ x: 400, y: 500 }, 5000)).toBe(0);
  });
});
