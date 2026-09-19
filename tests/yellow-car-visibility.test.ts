import { describe, expect, it } from 'vitest';
import {
  YellowCarVisibilityGate,
  isMeaningfullyVisible,
  visibleAreaRatio,
} from '../src/systems/YellowCarVisibility';

const camera = { x: 100, y: 100, width: 640, height: 360 };
const clearCar = { x: 350, y: 220, width: 48, height: 20 };

describe('yellow-car visibility gate', () => {
  it('ignores off-camera and edge-only vehicle bounds', () => {
    expect(visibleAreaRatio({ x: 20, y: 220, width: 48, height: 20 }, camera)).toBe(0);
    expect(isMeaningfullyVisible({ x: 88, y: 220, width: 48, height: 20 }, camera)).toBe(false);
  });

  it('accepts a clearly framed car in the inner viewport', () => {
    expect(visibleAreaRatio(clearCar, camera)).toBe(1);
    expect(isMeaningfullyVisible(clearCar, camera)).toBe(true);
  });

  it('triggers once per stable encounter id, including after re-entry', () => {
    const gate = new YellowCarVisibilityGate();
    const observation = {
      encounterId: 'yellow-first-1',
      vehicleBounds: clearCar,
      cameraBounds: camera,
      explorationActive: true,
    };
    expect(gate.observe(observation)).toBe(true);
    expect(gate.observe(observation)).toBe(false);
    expect(gate.observe({ ...observation, vehicleBounds: { ...clearCar, x: 999 } })).toBe(false);
    expect(gate.observe(observation)).toBe(false);
  });

  it('waits until overlays close without consuming the encounter', () => {
    const gate = new YellowCarVisibilityGate();
    const observation = {
      encounterId: 'yellow-overlay-1',
      vehicleBounds: clearCar,
      cameraBounds: camera,
      explorationActive: false,
    };
    expect(gate.observe(observation)).toBe(false);
    expect(gate.hasObserved(observation.encounterId)).toBe(false);
    expect(gate.observe({ ...observation, explorationActive: true })).toBe(true);
  });

  it('tracks two authored encounters independently', () => {
    const gate = new YellowCarVisibilityGate();
    const observe = (encounterId: string) => gate.observe({
      encounterId,
      vehicleBounds: clearCar,
      cameraBounds: camera,
      explorationActive: true,
    });
    expect(observe('yellow-moving-1')).toBe(true);
    expect(observe('yellow-moving-2')).toBe(true);
  });
});
