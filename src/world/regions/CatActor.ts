import type Phaser from 'phaser';
import { catTexture, type CatDirection, type CatName, type CatPose } from '../../art/catSprites';
import { CatRoam, catStep, type CatPoint } from '../../systems/CatMotion';
import type { Rect } from './definitions';

/** One sprite/animation controller per cat; the scene owns its lifetime. */
export class CatActor {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly motion: CatRoam;
  constructor(private readonly scene: Phaser.Scene, readonly name: CatName, point: CatPoint, solids: readonly Rect[] = [], seed = 0, feetOrigin = false) {
    this.motion = new CatRoam(point, solids, seed);
    this.sprite = scene.add.sprite(point.x, point.y, catTexture(name, 'down', 'idle')).setOrigin(.5, feetOrigin ? 23 / 24 : .5);
    this.sprite.setName(`living-cat-${name}`).setData('cat', name);
  }
  pose(pose: CatPose, direction: CatDirection = this.motion.direction): void {
    this.motion.direction = direction;
    if (pose === 'walk') this.sprite.play(`cat-${this.name}-walk-${direction}`, true);
    else { this.sprite.anims.stop(); this.sprite.setTexture(catTexture(this.name, direction, pose)); }
    this.sprite.setFlipX(false).setData('cat-pose', pose).setData('cat-direction', direction);
  }
  render(): void {
    const p = this.motion.position;
    this.sprite.setPosition(Math.round(p.x), Math.round(p.y)).setDepth(p.y + (this.sprite.originY === .5 ? 12 : 1));
  }
  place(point: CatPoint): void { this.motion.place(point); this.render(); }
  hold(): void { this.motion.hold(); this.pose('idle'); }
  roam(paused: boolean): void {
    this.motion.update(this.scene.game.loop.delta, paused); this.render(); this.pose(this.motion.pose);
  }
  walkTo(point: CatPoint, speed: number, paused = false): boolean {
    if (paused) { this.pose('idle'); return false; }
    const next = catStep(this.motion.position, point, this.scene.game.loop.delta, speed);
    this.motion.position = { x: next.x, y: next.y }; this.render();
    this.pose(next.moving ? 'walk' : 'sit', next.moving ? next.direction : this.motion.direction);
    return Math.hypot(next.x - point.x, next.y - point.y) < 1;
  }
}
