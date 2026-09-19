import { describe, expect, it } from 'vitest';
import { MOVEMENT, type MovementLock } from '../src/config/movement';
import { MovementState } from '../src/systems/MovementState';
import { LocomotionCycle } from '../src/systems/LocomotionCycle';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository, SAVE_KEY } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';

const advance = (state: MovementState, seconds: number, moving = true, shift = true): void => {
  for (let i = 0; i < seconds * 100; i++) state.update(10, moving, shift);
};

describe('exploration stamina', () => {
  it('sprints at a useful but restrained speed and drains only during travel', () => {
    expect(MOVEMENT.sprintSpeed / MOVEMENT.walkSpeed).toBeGreaterThanOrEqual(1.4);
    expect(MOVEMENT.sprintSpeed / MOVEMENT.walkSpeed).toBeLessThanOrEqual(2);
    const state = new MovementState();
    advance(state, 1, false);
    expect(state.stamina).toBe(100);
    expect(state.sprinting).toBe(false);
    advance(state, 1);
    expect(state.stamina).toBeCloseTo(82);
    expect(state.sprinting).toBe(true);
    advance(state, 0.5, true, false);
    expect(state.sprinting).toBe(false);
    expect(state.stamina).toBeCloseTo(94.5);
  });

  it('forces walking at zero, then waits for recovery threshold even with Shift held', () => {
    const state = new MovementState();
    while (state.stamina > 0) state.update(10, true, true);
    expect(state.sprinting).toBe(false);
    expect(state.canSprint(true)).toBe(false);
    advance(state, 0.8);
    expect(state.stamina).toBeCloseTo(20);
    expect(state.recovering).toBe(true);
    expect(state.canSprint(true)).toBe(false);
    advance(state, 0.21);
    expect(state.canSprint(true)).toBe(true);
    state.update(10, true, true);
    expect(state.sprinting).toBe(true);
  });

  it.each<MovementLock>(['modal', 'bench', 'cutscene', 'focus', 'interaction'])('blocks sprint under %s lock', (lock) => {
    const state = new MovementState();
    advance(state, 1);
    state.setLock(lock, true);
    expect(state.sprinting).toBe(false);
    expect(state.canSprint(true)).toBe(false);
    advance(state, 0.1);
    expect(state.stamina).toBeGreaterThan(82);
    state.setLock(lock, false);
    expect(state.canSprint(true)).toBe(true);
  });

  it('composes locks, supports independent future modifiers and bounds frame hitches', () => {
    const state = new MovementState();
    state.setLock('bench', true);
    state.setLock('modal', true);
    state.setLock('modal', false);
    expect(state.canSprint(true)).toBe(false);
    state.reset();
    state.setModifiers({ capacity: 2, drain: 0.5, regeneration: 2 });
    expect(state.stamina).toBe(200);
    advance(state, 1);
    expect(state.stamina).toBeCloseTo(191);
    advance(state, 0.1, false);
    expect(state.stamina).toBeCloseTo(196);
    state.setModifiers({ drain: 0 });
    advance(state, 5);
    expect(state.stamina).toBeCloseTo(196);
    state.reset();
    state.update(100000, true, true);
    expect(state.stamina).toBeCloseTo(98.2);
  });

  it('does not serialize stamina or locks; a new game session starts full', () => {
    const storage = new MemoryStorage();
    const repository = new SaveRepository(storage);
    const state = new GameStateStore(repository);
    advance(state.movement, 2);
    state.movement.setLock('bench', true);
    state.addArtifact('test');
    expect(storage.getItem(SAVE_KEY)).not.toMatch(/stamina|sprinting|locks|modifiers/);
    const reloaded = new GameStateStore(repository);
    expect(reloaded.movement.stamina).toBe(100);
    expect(reloaded.movement.locked).toBe(false);
    expect(reloaded.snapshot.inventory).toContain('test');
  });
});

describe('distance-driven visible foot plants', () => {
  it('emits exactly two contacts over four authored frames', () => {
    const cycle = new LocomotionCycle();
    const result = Array.from({ length: 4 }, () => {
      const plant = cycle.advance(MOVEMENT.walkFrameDistance, 'walk');
      return [cycle.frame, plant];
    });
    expect(result).toEqual([['step-a', true], ['pass-b', false], ['step-b', true], ['pass-a', false]]);
  });

  it('has no stationary/stop contacts or queued catch-up steps', () => {
    const cycle = new LocomotionCycle();
    expect(cycle.advance(0, 'walk')).toBe(false);
    cycle.advance(9, 'walk');
    cycle.reset();
    expect(cycle.advance(1, 'walk')).toBe(false);
    expect(cycle.advance(900, 'walk')).toBe(true);
    expect(cycle.advance(0, 'walk')).toBe(false);
    expect(cycle.advance(0.1, 'walk')).toBe(false);
  });

  it('preserves contact phase on gait changes and keeps diagonal cadence singular', () => {
    const straight = new LocomotionCycle();
    const diagonal = new LocomotionCycle();
    for (let i = 0; i < 30; i++) {
      const gait = i < 15 ? 'walk' : 'sprint';
      expect(diagonal.advance(Math.hypot(1 / Math.SQRT2, 1 / Math.SQRT2), gait))
        .toBe(straight.advance(1, gait));
      expect(diagonal.frame).toBe(straight.frame);
    }
  });

  it('gives sprint a faster foot-plant cadence at its actual travel speed', () => {
    const count = (gait: 'walk' | 'sprint'): number => {
      const cycle = new LocomotionCycle();
      let contacts = 0;
      for (let frame = 0; frame < 120; frame++) {
        if (cycle.advance((gait === 'walk' ? MOVEMENT.walkSpeed : MOVEMENT.sprintSpeed) / 60, gait)) contacts++;
      }
      return contacts;
    };
    expect(count('sprint')).toBeGreaterThan(count('walk'));
  });
});
