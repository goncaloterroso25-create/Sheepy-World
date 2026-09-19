import type Phaser from 'phaser';
import type { FacingDirection } from '../entities/playerAnimations';
import { PALETTE } from './palette';
import { createPixelTexture, mirroredX } from './textureFactory';
import { createCatTextures } from './catSprites';

export interface AttachmentAnchor {
  x: number;
  y: number;
  flipX?: boolean;
}

export const TOBIAS_SHOULDER_ANCHORS: Readonly<Record<FacingDirection, AttachmentAnchor>> = {
  down: { x: 23, y: 11, flipX: false },
  up: { x: 1, y: 10, flipX: true },
  left: { x: 1, y: 11, flipX: true },
  right: { x: 23, y: 11, flipX: false },
};

function sideRect(
  graphics: Phaser.GameObjects.Graphics,
  direction: 'left' | 'right',
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  graphics.fillRect(direction === 'right' ? x : mirroredX(x, width, 24), y, width, height);
}

type DeveloperPhase = 'idle' | 'step-a' | 'step-b';

export function developerTextureKey(
  direction: FacingDirection,
  phase: DeveloperPhase = 'idle',
): string {
  return `developer-${direction}-${phase}`;
}

function developerStep(phase: DeveloperPhase): -1 | 0 | 1 {
  if (phase === 'step-a') return -1;
  if (phase === 'step-b') return 1;
  return 0;
}

function drawDeveloperLegs(
  graphics: Phaser.GameObjects.Graphics,
  phase: DeveloperPhase,
  bob: number,
): void {
  const step = developerStep(phase);
  const leftX = 7 + (step > 0 ? 1 : 0);
  const rightX = 13 - (step < 0 ? 1 : 0);
  graphics.fillStyle(PALETTE.denimDeep)
    .fillRect(leftX, 23 + bob + (step < 0 ? -1 : 0), 5, 12 - bob)
    .fillRect(rightX, 23 + bob + (step > 0 ? -1 : 0), 5, 12 - bob);
  graphics.fillStyle(PALETTE.denim)
    .fillRect(leftX + 1, 24 + bob, 2, 8)
    .fillRect(rightX + 1, 24 + bob, 2, 8);
  graphics.fillStyle(PALETTE.denimDeep)
    .fillRect(leftX, 29 + bob, 5, 1)
    .fillRect(rightX, 29 + bob, 5, 1);
  graphics.fillStyle(PALETTE.shadowDeep)
    .fillRect(leftX - (step < 0 ? 1 : 0), 34, 5, 2)
    .fillRect(rightX + (step > 0 ? 1 : 0), 34, 5, 2);
}

function drawDeveloperFront(
  graphics: Phaser.GameObjects.Graphics,
  direction: 'up' | 'down',
  phase: DeveloperPhase,
): void {
  const bob = phase === 'idle' ? 0 : -1;
  const sway = phase === 'step-a' ? -1 : phase === 'step-b' ? 1 : 0;

  graphics.fillStyle(PALETTE.brownHairDeep)
    .fillRect(7, 1 + bob, 10, 2)
    .fillRect(5, 3 + bob, 14, 7)
    .fillRect(5 + sway, 7 + bob, 3, 10)
    .fillRect(17 + sway, 7 + bob, 3, 10);
  graphics.fillStyle(PALETTE.brownHair)
    .fillRect(8, 2 + bob, 7, 2)
    .fillRect(6, 4 + bob, 11, 4)
    .fillRect(6 + sway, 9 + bob, 2, 7)
    .fillRect(18 + sway, 9 + bob, 1, 7);
  graphics.fillStyle(PALETTE.brownHairLight)
    .fillRect(9, 2 + bob, 4, 1)
    .fillRect(7 + sway, 9 + bob, 1, 5);

  if (direction === 'down') {
    graphics.fillStyle(PALETTE.skin).fillRect(8, 6 + bob, 9, 9);
    graphics.fillStyle(PALETTE.skinLight).fillRect(12, 7 + bob, 3, 4);
    graphics.fillStyle(PALETTE.brownHairDeep)
      .fillRect(7, 4 + bob, 5, 4)
      .fillRect(14, 4 + bob, 4, 3);
    graphics.fillStyle(PALETTE.brownHair).fillRect(9, 4 + bob, 3, 2);

    // Two independent glasses frames with a skin-colored gap eliminate the
    // previous eyebrow-like horizontal bar.
    graphics.fillStyle(PALETTE.shadowDeep)
      .fillRect(8, 9 + bob, 4, 1)
      .fillRect(8, 10 + bob, 1, 2)
      .fillRect(11, 10 + bob, 1, 2)
      .fillRect(14, 9 + bob, 4, 1)
      .fillRect(14, 10 + bob, 1, 2)
      .fillRect(17, 10 + bob, 1, 2)
      .fillRect(12, 10 + bob, 2, 1);
    graphics.fillStyle(PALETTE.brownEye)
      .fillRect(10, 10 + bob, 1, 1)
      .fillRect(15, 10 + bob, 1, 1);
    // A restrained moustache and tiny goatee; the cheeks stay skin-toned so
    // the face never reads as a full beard.
    graphics.fillStyle(PALETTE.brownHairDeep)
      .fillRect(10, 13 + bob, 2, 1)
      .fillRect(14, 13 + bob, 2, 1)
      .fillRect(12, 14 + bob, 2, 1);
  } else {
    graphics.fillStyle(PALETTE.brownHair)
      .fillRect(7, 7 + bob, 11, 8)
      .fillRect(6 + sway, 11 + bob, 2, 6)
      .fillRect(18 + sway, 11 + bob, 2, 6);
    graphics.fillStyle(PALETTE.brownHairLight).fillRect(9, 5 + bob, 4, 6);
  }

  graphics.fillStyle(PALETTE.plumDeep).fillRect(7, 15 + bob, 11, 10);
  graphics.fillStyle(PALETTE.plum).fillRect(8, 15 + bob, 9, 8);
  graphics.fillStyle(PALETTE.plumLight)
    .fillRect(9, 16 + bob, 7, 2)
    .fillRect(11, 18 + bob, 3, 2);
  graphics.fillStyle(PALETTE.plumDeep).fillRect(11, 15 + bob, 3, 4);

  const swing = developerStep(phase);
  graphics.fillStyle(PALETTE.plumDeep)
    .fillRect(5, 16 + bob + swing, 2, 7)
    .fillRect(18, 16 + bob - swing, 2, 7);
  graphics.fillStyle(PALETTE.skin)
    .fillRect(5, 22 + bob + swing, 2, 2)
    .fillRect(18, 22 + bob - swing, 2, 2);
  drawDeveloperLegs(graphics, phase, bob);
}

function drawDeveloperSide(
  graphics: Phaser.GameObjects.Graphics,
  direction: 'left' | 'right',
  phase: DeveloperPhase,
): void {
  const bob = phase === 'idle' ? 0 : -1;
  const sway = phase === 'step-a' ? -1 : phase === 'step-b' ? 1 : 0;
  graphics.fillStyle(PALETTE.brownHairDeep);
  sideRect(graphics, direction, 7, 1 + bob, 10, 3);
  sideRect(graphics, direction, 5, 4 + bob, 13, 7);
  sideRect(graphics, direction, 5 + sway, 8 + bob, 3, 9);
  graphics.fillStyle(PALETTE.brownHair);
  sideRect(graphics, direction, 8, 2 + bob, 7, 2);
  sideRect(graphics, direction, 6 + sway, 9 + bob, 2, 7);
  graphics.fillStyle(PALETTE.brownHairLight);
  sideRect(graphics, direction, 9, 2 + bob, 4, 1);

  graphics.fillStyle(PALETTE.skin);
  sideRect(graphics, direction, 11, 7 + bob, 7, 8);
  sideRect(graphics, direction, 17, 10 + bob, 2, 2);
  graphics.fillStyle(PALETTE.brownHairDeep);
  sideRect(graphics, direction, 9, 5 + bob, 6, 3);
  graphics.fillStyle(PALETTE.shadowDeep);
  sideRect(graphics, direction, 13, 9 + bob, 5, 1);
  sideRect(graphics, direction, 13, 10 + bob, 1, 3);
  sideRect(graphics, direction, 17, 10 + bob, 1, 3);
  sideRect(graphics, direction, 13, 12 + bob, 5, 1);
  sideRect(graphics, direction, 10, 10 + bob, 3, 1);
  graphics.fillStyle(PALETTE.brownEye);
  sideRect(graphics, direction, 16, 10 + bob, 1, 1);
  graphics.fillStyle(PALETTE.brownHairDeep);
  sideRect(graphics, direction, 15, 14 + bob, 3, 1);

  graphics.fillStyle(PALETTE.plumDeep);
  sideRect(graphics, direction, 7, 15 + bob, 11, 10);
  graphics.fillStyle(PALETTE.plum);
  sideRect(graphics, direction, 9, 15 + bob, 8, 8);
  graphics.fillStyle(PALETTE.plumLight);
  sideRect(graphics, direction, 10, 16 + bob, 5, 2);
  graphics.fillStyle(PALETTE.plumDeep);
  sideRect(graphics, direction, 15, 16 + bob, 3, 5);
  graphics.fillStyle(PALETTE.skin);
  sideRect(graphics, direction, phase === 'step-a' ? 17 : 16, 22 + bob, 2, 2);
  drawDeveloperLegs(graphics, phase, bob);
}

function drawDeveloper(
  graphics: Phaser.GameObjects.Graphics,
  direction: FacingDirection,
  phase: DeveloperPhase,
): void {
  if (direction === 'up' || direction === 'down') drawDeveloperFront(graphics, direction, phase);
  else drawDeveloperSide(graphics, direction, phase);
}


export function createCharacterTextures(scene: Phaser.Scene): void {
  const developerDirections: readonly FacingDirection[] = ['down', 'up', 'left', 'right'];
  const developerPhases: readonly DeveloperPhase[] = ['idle', 'step-a', 'step-b'];
  developerDirections.forEach((direction) => developerPhases.forEach((phase) => {
    createPixelTexture(scene, developerTextureKey(direction, phase), 24, 36, (g) => {
      drawDeveloper(g, direction, phase);
    });
  }));
  // Preserve the Phase 3 side key for callers and save-safe downstream art
  // references while the four-direction family becomes the canonical source.
  createPixelTexture(scene, 'developer-side-idle', 24, 36, (g) => {
    drawDeveloper(g, 'right', 'idle');
  });
  createPixelTexture(scene, 'npc-wanderer', 24, 32, (g) => {
    g.fillStyle(PALETTE.shadowDeep).fillRect(7, 3, 11, 4).fillRect(6, 6, 13, 4);
    g.fillStyle(PALETTE.festivalGold).fillRect(7, 2, 11, 3).fillRect(9, 0, 7, 2);
    g.fillStyle(PALETTE.skin).fillRect(8, 7, 9, 9);
    g.fillStyle(PALETTE.skinLight).fillRect(12, 8, 3, 4);
    g.fillStyle(PALETTE.shadowDeep).fillRect(9, 11, 3, 1).fillRect(14, 11, 3, 1);
    g.fillStyle(PALETTE.grassDeep).fillRect(7, 16, 11, 9);
    g.fillStyle(PALETTE.grassWarm).fillRect(8, 17, 9, 7);
    g.fillStyle(PALETTE.leafOrange).fillRect(5, 17, 2, 7);
    g.fillStyle(PALETTE.skin).fillRect(18, 18, 2, 6);
    g.fillStyle(PALETTE.denimDeep).fillRect(8, 24, 3, 7).fillRect(14, 24, 3, 7);
    g.fillStyle(PALETTE.denim).fillRect(9, 25, 1, 4).fillRect(15, 25, 1, 4);
    g.fillStyle(PALETTE.shadowDeep).fillRect(7, 30, 5, 2).fillRect(13, 30, 5, 2);
  });
  createCatTextures(scene);
}
