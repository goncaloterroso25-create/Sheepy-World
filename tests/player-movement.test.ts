import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { MovementState } from '../src/systems/MovementState';
import { DEFAULT_STAMINA_MODIFIERS, MOVEMENT } from '../src/config/movement';

vi.mock('phaser', () => {
  class Sprite {
    x: number;
    y: number;
    texture: string;
    velocity = { x: 0, y: 0 };
    anims = { stop: vi.fn() };
    body = {
      enable: true,
      position: { x: 0, y: 0 },
      prev: { x: 0, y: 0 },
      setSize: () => this.body,
      setOffset: () => this.body,
      setVelocity: (x: number, y = x) => { this.velocity = { x, y }; },
    };
    constructor(_scene: unknown, x: number, y: number, texture: string) {
      this.x = x; this.y = y; this.texture = texture;
    }
    setCollideWorldBounds() { return this; }
    setDepth() { return this; }
    setTexture(key: string) { this.texture = key; return this; }
    setVelocity(x: number, y = x) { this.body.setVelocity(x, y); return this; }
  }
  return { default: { Physics: { Arcade: { Sprite } } } };
});

import { Player } from '../src/entities/Player';

function fixture() {
  const scene = { add: { existing: vi.fn() }, physics: { add: { existing: vi.fn() } } } as unknown as Phaser.Scene;
  const movement = new MovementState();
  const footPlant = vi.fn();
  const player = new Player(scene, 445, 405, movement, footPlant);
  const axis = (x: number, y: number) => ({ x, y, lengthSq: () => x * x + y * y }) as Phaser.Math.Vector2;
  const sprite = player as unknown as { velocity: { x: number; y: number }; texture: string };
  const tick = (seconds = 1 / 60, blocked = false, present = true) => {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.prev.x = body.position.x;
    body.prev.y = body.position.y;
    const dx = blocked ? 0 : sprite.velocity.x * seconds;
    const dy = blocked ? 0 : sprite.velocity.y * seconds;
    body.position.x += dx;
    body.position.y += dy;
    player.physicsStep(seconds);
    player.x += dx;
    player.y += dy;
    if (present) player.presentMovement();
  };
  return { player, movement, footPlant, axis, sprite, tick };
}

describe('Player movement integration', () => {
  it('changes speed and artwork for sprint, with contact callbacks matching the displayed frame and feet', () => {
    const { player, footPlant, axis, sprite, tick } = fixture();
    player.move(axis(1, 0), true, true);
    expect(sprite.velocity.x).toBe(MOVEMENT.sprintSpeed);
    tick(MOVEMENT.sprintFrameDistance / MOVEMENT.sprintSpeed);
    expect(sprite.texture).toBe('player-sprint-right-step-a');
    expect(footPlant).toHaveBeenCalledExactlyOnceWith('sprint', { x: player.x, y: player.y + 15 });
    player.move(axis(1, 0), true, false);
    tick(1 / MOVEMENT.walkSpeed);
    expect(sprite.velocity.x).toBe(MOVEMENT.walkSpeed);
    expect(sprite.texture).toBe('player-right-step-a');
    expect(footPlant).toHaveBeenCalledTimes(1);
  });

  it('does not animate, drain or emit while pushing into a wall', () => {
    const { player, movement, footPlant, axis, sprite, tick } = fixture();
    for (let frame = 0; frame < 100; frame++) {
      player.move(axis(1, 0), true, true);
      tick(1 / 60, true);
    }
    expect(movement.stamina).toBe(100);
    expect(sprite.texture).toBe('player-right-idle');
    expect(footPlant).not.toHaveBeenCalled();
  });

  it('suppresses a pending plant immediately on release or modal/cutscene locks', () => {
    const { player, movement, footPlant, axis, sprite, tick } = fixture();
    player.move(axis(1, 0), true, true);
    tick(MOVEMENT.sprintFrameDistance / MOVEMENT.sprintSpeed, false, false);
    player.move(axis(0, 0), true, false);
    player.presentMovement();
    expect(sprite.velocity).toEqual({ x: 0, y: 0 });
    expect(footPlant).not.toHaveBeenCalled();
    movement.setLock('cutscene', true);
    player.move(axis(1, 0), true, true);
    tick();
    expect(sprite.velocity).toEqual({ x: 0, y: 0 });
    expect(footPlant).not.toHaveBeenCalled();
  });

  it('keeps seated texture and zero velocity with movement keys held', () => {
    const { player, movement, axis, sprite } = fixture();
    movement.setLock('bench', true);
    player.setSitting(true);
    player.move(axis(1, 0), true, true);
    expect(sprite.texture).toBe('player-seated');
    expect(sprite.velocity).toEqual({ x: 0, y: 0 });
    expect(movement.sprinting).toBe(false);
  });

  it.each([30, 60, 75, 120, 144, 165, 240])('accounts identical simulation time at %i render Hz', (renderHz) => {
    const { player, movement, axis, tick } = fixture();
    const simulate = (seconds: number, sprint: boolean) => {
      let ticks = 0;
      for (let frame = 1; frame <= seconds * renderHz; frame++) {
        player.move(axis(1, 0), true, sprint);
        const targetTicks = Math.floor(frame * 60 / renderHz + 1e-8);
        while (ticks < targetTicks) { tick(1 / 60, false, false); ticks++; }
        player.presentMovement();
      }
      expect(ticks).toBe(seconds * 60);
    };
    simulate(1, true);
    expect(movement.stamina).toBeCloseTo(82, 8);
    simulate(1, true);
    expect(movement.stamina).toBeCloseTo(64, 8);
    simulate(1, false);
    expect(movement.stamina).toBeCloseTo(89, 8);
  });

  it('default modifiers reach zero, force walk speed/art, and resume held Shift only after recovery', () => {
    expect(DEFAULT_STAMINA_MODIFIERS.drain).toBe(1);
    const { player, movement, axis, sprite, tick } = fixture();
    let ticks = 0;
    while (!movement.recovering && ticks < 600) {
      player.move(axis(1, 0), true, true);
      tick(); ticks++;
    }
    expect(ticks / 60).toBeCloseTo(5.5666667, 5);
    expect(movement.stamina).toBe(0);
    expect(sprite.velocity.x).toBe(MOVEMENT.walkSpeed);
    expect(sprite.texture).toMatch(/^player-right-/);
    expect(sprite.texture).not.toContain('sprint');
    for (let frame = 0; frame < 59; frame++) {
      player.move(axis(1, 0), true, true); tick();
      expect(sprite.velocity.x).toBe(MOVEMENT.walkSpeed);
    }
    expect(movement.stamina).toBeGreaterThan(24);
    expect(movement.stamina).toBeLessThan(25);
    for (let frame = 0; frame < 2; frame++) { player.move(axis(1, 0), true, true); tick(); }
    expect(sprite.velocity.x).toBe(MOVEMENT.sprintSpeed);
    expect(sprite.texture).toContain('sprint');
  });

  it('extra render frames neither regenerate stamina nor erase a moving pose', () => {
    const { player, movement, axis, sprite, tick, footPlant } = fixture();
    player.move(axis(1, 0), true, true);
    tick(MOVEMENT.sprintFrameDistance / MOVEMENT.sprintSpeed);
    const stamina = movement.stamina;
    const texture = sprite.texture;
    for (let i = 0; i < 100; i++) { player.move(axis(1, 0), true, true); player.presentMovement(); }
    expect(movement.stamina).toBe(stamina);
    expect(sprite.texture).toBe(texture);
    expect(player.isTravelling).toBe(true);
    expect(footPlant).toHaveBeenCalledTimes(1);
  });
});
