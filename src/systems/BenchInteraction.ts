import type Phaser from 'phaser';
import type { Player } from '../entities/Player';
import type { GameStateStore } from './GameStateStore';
import { addSmallText } from '../ui/PixelFont';

/** Instantiated only for the authored memory bench, never for ordinary benches. */
export class BenchInteraction {
  private phase: 'standing' | 'settling' | 'seated' | 'rising' = 'standing';
  private readonly prompt: Phaser.GameObjects.BitmapText;
  private standArmed = false;
  private thoughtPending = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly bench: Phaser.Physics.Arcade.Sprite,
    private readonly state: GameStateStore,
    private readonly onSettled: () => void,
  ) {
    this.prompt = addSmallText(scene, bench.x, bench.y - 37, '[E] Stand', 0xffe5ac)
      .setOrigin(0.5).setDropShadow(1, 1, 0x33231e, 1).setDepth(5000).setVisible(false);
  }

  get active(): boolean { return this.phase !== 'standing'; }

  sit(): void {
    if (this.active || this.state.movement.locked) return;
    this.phase = 'settling';
    this.state.movement.setLock('bench', true);
    this.player.setVelocity(0);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.scene.tweens.add({
      targets: this.player, x: this.bench.x, y: this.bench.y - 7,
      duration: 360, ease: 'Stepped', easeParams: [6],
      onComplete: () => {
        this.player.setPosition(Math.round(this.player.x), Math.round(this.player.y));
        this.player.setSitting(true);
        this.player.setDepth(this.bench.depth + 1);
        this.phase = 'seated';
        this.standArmed = false;
        this.thoughtPending = true;
      },
    });
  }

  update(blocking: boolean, interactHeld: boolean, justInteracted: boolean): void {
    if (this.thoughtPending && !blocking) {
      this.thoughtPending = false;
      this.standArmed = false;
      this.prompt.setVisible(false);
      this.onSettled();
      return;
    }
    const available = this.phase === 'seated' && !blocking;
    this.prompt.setVisible(available);
    if (!available) { this.standArmed = false; return; }
    // A rapid keydown+keyup closing dialogue must not also become Stand,
    // regardless of which scene updates first in that frame.
    if (!interactHeld && !justInteracted) this.standArmed = true;
    if (this.standArmed && justInteracted) this.stand();
  }

  private stand(): void {
    this.phase = 'rising';
    this.prompt.setVisible(false);
    this.scene.tweens.add({
      targets: this.player, x: this.bench.x, y: this.bench.y + 29,
      duration: 260, ease: 'Stepped', easeParams: [5],
      onComplete: () => {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.enable = true;
        body.reset(this.bench.x, this.bench.y + 29);
        this.player.setSitting(false);
        this.state.movement.setLock('bench', false);
        this.phase = 'standing';
      },
    });
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.player);
    this.state.movement.setLock('bench', false);
    this.prompt.destroy();
  }
}
