import type Phaser from 'phaser';
import { PALETTE } from '../art/palette';
import type { MovementState } from '../systems/MovementState';
import { addSmallText } from './PixelFont';
import { UI_COPY } from '../data/uiCopy';

export class StaminaMeter {
  private readonly container: Phaser.GameObjects.Container;
  private readonly fill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, private readonly movement: MovementState) {
    const paper = scene.add.rectangle(0, 0, 106, 30, PALETTE.paper).setOrigin(0)
      .setStrokeStyle(1, PALETTE.paperShade);
    const label = addSmallText(scene, 8, 5, UI_COPY.controls.staminaLabel, PALETTE.ink);
    const track = scene.add.rectangle(8, 19, 90, 4, PALETTE.paperShade).setOrigin(0);
    this.fill = scene.add.rectangle(8, 19, 90, 4, PALETTE.grassShade).setOrigin(0);
    this.container = scene.add.container(12, 12, [paper, label, track, this.fill])
      .setDepth(80).setAlpha(0);
  }

  update(delta: number, obscured: boolean): void {
    const visible = !obscured && (this.movement.sprinting || this.movement.fraction < 1);
    const alpha = visible ? 1 : Math.max(0, this.container.alpha - Math.min(delta, 100) / 350);
    this.container.setAlpha(obscured ? 0 : alpha).setVisible(alpha > 0 && !obscured);
    this.fill.width = Math.round(90 * this.movement.fraction);
    this.fill.setFillStyle(this.movement.recovering ? PALETTE.leafRed : PALETTE.grassShade);
  }
}
