import { describe, expect, it } from 'vitest';
import { approachDistance } from '../src/systems/InteractionGeometry';
import { selectInteraction } from '../src/systems/InteractionSelection';
import { FIRST_DATE_CAR } from '../src/world/regions/ParkInteractionGeometry';

const ROAD_CURB = { x: 0, y: 108, width: 1280, height: 8 } as const;

describe('Phase 4D.2 familiar car authored geometry', () => {
  it('reproduces the former point-anchor dead zone beside a visibly nearby door', () => {
    const feet = { x: 392, y: 174 };
    const formerPointApproach = { anchor: { x: 440, y: 160 }, radius: 34 };

    expect(approachDistance(feet, formerPointApproach, [ROAD_CURB]))
      .toBeGreaterThan(formerPointApproach.radius);
    expect(approachDistance(feet, FIRST_DATE_CAR.approach, [ROAD_CURB]))
      .toBeLessThanOrEqual(FIRST_DATE_CAR.approach.radius);
  });

  it('covers the visible blue car with one broad nearest-point approach', () => {
    const visual = FIRST_DATE_CAR.visualBounds;
    const shape = FIRST_DATE_CAR.approach.shape;

    expect(shape.x).toBeLessThanOrEqual(visual.x);
    expect(shape.y).toBeLessThanOrEqual(visual.y);
    expect(shape.x + shape.width).toBeGreaterThanOrEqual(visual.x + visual.width);
    expect(shape.y + shape.height).toBeGreaterThanOrEqual(visual.y + visual.height);
  });

  it.each([
    ['below', { x: 440, y: 185 }],
    ['left door', { x: 392, y: 174 }],
    ['right door', { x: 488, y: 174 }],
    ['close left flank', { x: 402, y: 156 }],
    ['close right flank', { x: 478, y: 156 }],
  ] as const)('is usable from the walkable %s approach regardless of facing', (_label, feet) => {
    const distance = approachDistance(feet, FIRST_DATE_CAR.approach, [ROAD_CURB]);
    expect(distance).toBeLessThanOrEqual(FIRST_DATE_CAR.approach.radius);

    for (const facingScore of [0, 1]) {
      expect(selectInteraction([{
        id: FIRST_DATE_CAR.id,
        distance,
        range: FIRST_DATE_CAR.approach.radius,
        priority: 10,
        facingScore,
      }])?.id).toBe(FIRST_DATE_CAR.id);
    }
  });

  it('does not pretend the road side is reachable through the continuous curb', () => {
    expect(approachDistance({ x: 440, y: 80 }, FIRST_DATE_CAR.approach, [ROAD_CURB]))
      .toBe(Infinity);
  });

  it('wins selection from a nearby ordinary target when the car is genuinely closer', () => {
    const feet = { x: 488, y: 174 };
    const distance = approachDistance(feet, FIRST_DATE_CAR.approach, [ROAD_CURB]);
    const selected = selectInteraction([
      { id: 'nearby-scenery', distance: 36, range: 40, priority: 10 },
      { id: FIRST_DATE_CAR.id, distance, range: FIRST_DATE_CAR.approach.radius, priority: 10 },
    ]);

    expect(distance).toBeLessThan(36);
    expect(selected?.id).toBe(FIRST_DATE_CAR.id);
  });
});
