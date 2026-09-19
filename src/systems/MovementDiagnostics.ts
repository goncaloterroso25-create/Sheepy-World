import type Phaser from 'phaser';
import type { Player } from '../entities/Player';
import type { MovementState } from './MovementState';
import type { InputController } from '../config/controls';

/** Opt-in, read-only runtime evidence. Never enabled in a production build. */
export function installMovementDiagnostics(
  scene: Phaser.Scene, player: Player, movement: MovementState, controls: InputController,
): void {
  const output = document.createElement('output');
  output.id = 'movement-diagnostics';
  output.setAttribute('aria-label', 'Development movement diagnostics');
  output.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:10000;padding:8px;background:#21191aee;color:#ffedbd;font:12px monospace;white-space:pre;pointer-events:none';
  document.body.append(output);
  let frames = 0;
  let ticks = 0;
  let elapsed = 0;
  let movedFrames = 0;
  let zeroFrames = 0;
  let heldMs = 0;
  let minStamina = movement.stamina;
  let firstExhaustedMs: number | null = null;
  let lastDisplay = 0;
  let heldPhysicsMs = 0;
  let firstHeldWallAt: number | null = null;
  let exhaustion: { simulationMs: number; wallMs: number; stamina: number; speed: number } | null = null;
  const physicsStep = (seconds: number): void => {
    ticks++;
    if (controls.sprintHeld() && controls.axis().lengthSq() > 0) {
      firstHeldWallAt ??= performance.now();
      heldPhysicsMs += seconds * 1000;
      minStamina = Math.min(minStamina, movement.stamina);
      if (!exhaustion && movement.recovering) {
        exhaustion = { simulationMs: heldPhysicsMs, wallMs: performance.now() - firstHeldWallAt,
          stamina: movement.stamina, speed: (player.body as Phaser.Physics.Arcade.Body).velocity.length() };
      }
    }
  };
  const update = (_time: number, delta: number): void => {
    frames++;
    elapsed += delta;
    const requested = controls.sprintHeld() && controls.axis().lengthSq() > 0;
    if (requested) {
      heldMs += delta;
      if (player.isTravelling) movedFrames++;
      else zeroFrames++;
      minStamina = Math.min(minStamina, movement.stamina);
      if (firstExhaustedMs === null && movement.recovering) firstExhaustedMs = heldMs;
    }
    const body = player.body as Phaser.Physics.Arcade.Body;
    const data = {
      elapsedMs: elapsed, renderHz: frames / elapsed * 1000, physicsHz: ticks / elapsed * 1000,
      heldPhysicsMs, exhaustion,
      heldMs, movedFrames, zeroFrames, stamina: movement.stamina, minStamina,
      firstExhaustedMs, sprinting: movement.sprinting, recovering: movement.recovering,
      locked: movement.locked, shift: controls.sprintHeld(), speed: body.velocity.length(),
      x: player.x, y: player.y, texture: player.texture.key,
    };
    if (elapsed - lastDisplay < 100) return;
    lastDisplay = elapsed;
    output.dataset.sample = JSON.stringify(data);
    output.textContent = `DEV / render ${data.renderHz.toFixed(0)} Hz / physics ${data.physicsHz.toFixed(0)} Hz\n`
      + `Stamina ${data.stamina.toFixed(2)} / speed ${data.speed.toFixed(1)} / ${data.texture}\n`
      + `Shift ${data.shift} / locked ${data.locked} / held ${(heldMs / 1000).toFixed(2)}s\n`
      + `Travel frames ${movedFrames} / zero frames ${zeroFrames} / first empty ${firstExhaustedMs === null ? '-' : (firstExhaustedMs / 1000).toFixed(2) + 's'}`;
  };
  const physicsWorld = scene.physics.world;
  physicsWorld.on('worldstep', physicsStep);
  scene.events.on('postupdate', update);
  scene.events.once('shutdown', () => {
    output.remove();
    physicsWorld.off('worldstep', physicsStep);
    scene.events.off('postupdate', update);
  });
}
