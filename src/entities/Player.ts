import Phaser from 'phaser';
import {
  idleTextureKey,
  locomotionTextureKey,
  SEATED_TEXTURE_KEY,
  type FacingDirection,
  type PlayerOutfit,
} from './playerAnimations';
import { MOVEMENT, movementState, type Gait } from '../config/movement';
import { LocomotionCycle } from '../systems/LocomotionCycle';
import type { MovementState } from '../systems/MovementState';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private facing: FacingDirection = 'down';
  private reactionVersion = 0;
  private readonly cycle = new LocomotionCycle();
  private sitting = false;
  private gait: Gait = 'walk';
  private travelling = false;
  private direction = { x: 0, y: 0 };
  private requested = false;
  private sprintRequested = false;
  private completedStep = false;
  private pendingDistance = 0;

  constructor(scene: Phaser.Scene, x: number, y: number,
    private readonly movement: MovementState,
    private readonly footPlant: (gait: Gait, feet: { x: number; y: number }) => void,
    private readonly outfit: PlayerOutfit = 'normal',
  ) {
    super(scene, x, y, idleTextureKey('down',outfit));
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(y);
    this.body?.setSize(12, 10).setOffset(6, 21);
  }

  /** Input/velocity request only. Render cadence never accounts for stamina. */
  move(direction: Phaser.Math.Vector2, enabled: boolean, sprintHeld = false): void {
    this.direction = { x: direction.x, y: direction.y };
    this.requested = enabled && direction.lengthSq() > 0;
    this.sprintRequested = sprintHeld;
    this.applyVelocity();
    if (!this.canMove()) {
      this.travelling = false;
      this.pendingDistance = 0;
      this.cycle.reset();
      if (!this.sitting) this.showIdle();
    }
  }

  /** WORLD_STEP fires after collision resolution; its delta is in seconds. */
  physicsStep(deltaSeconds: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const distance = body.enable ? Math.hypot(body.position.x - body.prev.x, body.position.y - body.prev.y) : 0;
    this.travelling = this.canMove() && distance > 0.01 && distance < 20;
    this.completedStep = true;
    this.movement.update(deltaSeconds * 1000, this.travelling,
      this.sprintRequested && this.gait === 'sprint');
    if (this.travelling) this.pendingDistance += distance;
    // Exhaustion changes the next physics velocity immediately, including
    // additional fixed steps within a slow render frame.
    this.applyVelocity();
  }

  /** POST_UPDATE: body results are now on the sprite, so plant and feet agree. */
  presentMovement(): void {
    if (!this.canMove()) {
      this.pendingDistance = 0;
      this.completedStep = false;
      if (!this.sitting) this.showIdle();
      return;
    }
    this.facing = this.directionFor(this.direction);
    this.anims.stop();
    if (this.travelling) {
      const plant = this.completedStep && this.cycle.advance(this.pendingDistance, this.gait);
      this.setTexture(locomotionTextureKey(this.facing, this.cycle.frame, this.gait,'loose',this.outfit));
      if (plant) this.footPlant(this.gait, this.feetPosition);
    } else {
      this.showIdle();
    }
    this.pendingDistance = 0;
    this.completedStep = false;
    this.setDepth(Math.floor(this.y));
  }

  private canMove(): boolean { return this.requested && !this.movement.locked && !this.sitting; }

  private applyVelocity(): void {
    this.gait = this.movement.canSprint(this.sprintRequested) ? 'sprint' : 'walk';
    const speed = !this.canMove() ? 0 : this.gait === 'sprint' ? movementState.sprintSpeed : MOVEMENT.walkSpeed;
    this.setVelocity(this.direction.x * speed, this.direction.y * speed);
  }

  get feetPosition(): { x: number; y: number } { return { x: this.x, y: this.y + 15 }; }
  get isTravelling(): boolean { return this.travelling; }

  setSitting(sitting: boolean): void {
    this.sitting = sitting;
    this.travelling = false;
    this.pendingDistance = 0;
    this.cycle.reset();
    this.setVelocity(0);
    this.anims.stop();
    if (sitting) this.setTexture(SEATED_TEXTURE_KEY);
    else {
      this.facing = 'down';
      this.showIdle();
    }
  }

  get facingDirection(): FacingDirection {
    return this.facing;
  }

  faceToward(point: { x: number; y: number }): void {
    const dx = point.x - this.x;
    const dy = point.y - this.feetPosition.y;
    if (Math.abs(dx) > Math.abs(dy)) this.facing = dx < 0 ? 'left' : 'right';
    else if (Math.abs(dy) > 1) this.facing = dy < 0 ? 'up' : 'down';
    if (!this.travelling && !this.sitting) this.showIdle();
  }

  playPshwReaction(): void {
    const version = ++this.reactionVersion;
    const direction = this.facing === 'left' ? -1 : 1;
    const reset = (): void => {
      if (version !== this.reactionVersion || !this.active) return;
      this.setDisplayOrigin(12, 16).clearTint();
    };

    this.setDisplayOrigin(12 - direction * 3, 17).setTint(0xffe28b);
    this.scene.time.delayedCall(85, () => {
      if (version !== this.reactionVersion || !this.active) return;
      this.setDisplayOrigin(12 + direction * 2, 15);
    });
    this.scene.time.delayedCall(170, () => {
      if (version !== this.reactionVersion || !this.active) return;
      this.setDisplayOrigin(12 - direction, 16);
    });
    this.scene.time.delayedCall(340, reset);
  }

  private directionFor(direction: { x: number; y: number }): FacingDirection {
    if (direction.y < 0) return 'up';
    if (direction.y > 0) return 'down';
    return direction.x < 0 ? 'left' : 'right';
  }

  private showIdle(): void {
    this.anims.stop();
    this.setTexture(idleTextureKey(this.facing,this.outfit));
  }
}
