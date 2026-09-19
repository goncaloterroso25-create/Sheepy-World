import type Phaser from 'phaser';
import { PALETTE as P } from '../art/palette';
import { addSmallText } from './PixelFont';

/** Shared material roles. Geometry is authored at integer logical pixels. */
export const UI_MATERIAL = {
  ink: P.ink, paper: P.plasterLight, paperLight: P.creamLight,
  paperEdge: P.paperShade, pencil: P.paperShadow, tape: P.cream,
  cover: P.plumDeep, coverLight: P.plum, fabric: P.grassShade,
  fabricLight: P.grass, fabricDeep: P.grassDeep, stitch: P.stoneLight,
  accent: P.leafRed, gold: P.leafGold,
} as const;

export { UI_FEEDBACK_EVENT, type UiFeedback } from '../config/uiFeedback';

export function steppedPanel(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number,
  fill: number, edge: number = UI_MATERIAL.ink): void {
  g.fillStyle(edge).fillRect(x + 3, y, w - 6, h).fillRect(x, y + 3, w, h - 6);
  g.fillStyle(fill).fillRect(x + 3, y + 2, w - 6, h - 4).fillRect(x + 2, y + 4, w - 4, h - 8);
}

export function stitches(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number,
  color: number = UI_MATERIAL.stitch): void {
  g.fillStyle(color);
  for (let dx = 0; dx < w; dx += 7) g.fillRect(x + dx, y, 3, 1).fillRect(x + dx, y + h, 3, 1);
  for (let dy = 6; dy < h; dy += 7) g.fillRect(x, y + dy, 1, 3).fillRect(x + w, y + dy, 1, 3);
}

export function tornPaper(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number,
  fill: number = UI_MATERIAL.paperLight): void {
  g.fillStyle(UI_MATERIAL.paperEdge).fillRect(x + 2, y + 3, w, h - 2);
  g.fillStyle(fill).fillRect(x, y + 2, w, h - 5);
  for (let dx = 0; dx < w; dx += 8) {
    g.fillRect(x + dx, y + (dx % 16 ? 1 : 0), Math.min(8, w - dx), 3);
    g.fillRect(x + dx, y + h - (dx % 24 ? 4 : 2), Math.min(8, w - dx), 3);
  }
}

export function tape(g: Phaser.GameObjects.Graphics, x: number, y: number, w = 26): void {
  g.fillStyle(UI_MATERIAL.tape).fillRect(x + 1, y, w - 2, 6).fillRect(x, y + 1, w, 4);
  g.fillStyle(UI_MATERIAL.paperLight).fillRect(x + 3, y + 1, w - 6, 1);
}

export function leafDoodle(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number = UI_MATERIAL.accent): void {
  g.fillStyle(color).fillRect(x + 5, y, 2, 3).fillRect(x + 2, y + 3, 7, 2)
    .fillRect(x, y + 5, 9, 3).fillRect(x + 2, y + 8, 5, 2).fillRect(x + 3, y + 10, 1, 3);
  g.fillStyle(UI_MATERIAL.paperLight).fillRect(x + 4, y + 4, 1, 4);
}

export function paperButton(scene: Phaser.Scene, x: number, y: number, w: number, label: string,
  action: () => void, enabled = true): Phaser.GameObjects.Container {
  const background = scene.add.graphics();
  steppedPanel(background, 0, 0, w, 20, enabled ? UI_MATERIAL.tape : UI_MATERIAL.paperEdge, UI_MATERIAL.pencil);
  const text = addSmallText(scene, Math.floor(w / 2), 6, label,
    enabled ? UI_MATERIAL.ink : UI_MATERIAL.pencil).setOrigin(0.5, 0);
  const hit = scene.add.rectangle(0, 0, w, 20, 0, 0).setOrigin(0);
  if (enabled) {
    hit.setInteractive({ useHandCursor: true });
    hit.on('pointerover', () => text.setTint(P.leafRedDeep));
    hit.on('pointerout', () => text.setTint(UI_MATERIAL.ink));
    hit.on('pointerdown', action);
  }
  return scene.add.container(x, y, [background, text, hit]);
}

/** Two held integer positions, not an interpolated/rotated paper animation. */
export function settlePaper(scene: Phaser.Scene, container: Phaser.GameObjects.Container, reducedMotion: boolean): void {
  if (reducedMotion) return;
  const y = container.y;
  container.setY(y - 1);
  const timer = scene.time.delayedCall(85, () => { if (container.scene) container.setY(y); });
  container.once('destroy', () => timer.remove(false));
}
