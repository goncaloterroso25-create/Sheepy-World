import type Phaser from 'phaser';
import { drawProtagonistSprite, drawProtagonistSeated, WINTER_RED } from '../art/protagonistSprites';
import { characterContact } from '../art/characterFoundation';
import { createPixelTexture } from '../art/textureFactory';
import type { Gait } from '../config/movement';
import type { StrideFrame } from '../systems/LocomotionCycle';

export type FacingDirection = 'up' | 'down' | 'left' | 'right';
export type PlayerHairstyle = 'loose' | 'ponytail';
export type PlayerOutfit = 'normal' | 'snow';

export const PLAYER_TEXTURE_SIZE = { width: 24, height: 32 } as const;
export const SNOW_SHIRT_COLOR = WINTER_RED;

const DIRECTIONS: readonly FacingDirection[] = ['up', 'down', 'left', 'right'];
const PHASES = ['idle', 'step-a', 'pass-a', 'step-b', 'pass-b'] as const;

type WalkPhase = typeof PHASES[number];

function textureKey(
  direction: FacingDirection,
  phase: WalkPhase,
  hairstyle: PlayerHairstyle = 'loose',
): string {
  return hairstyle === 'loose'
    ? `player-${direction}-${phase}`
    : `player-ponytail-${direction}-${phase}`;
}

export function idleTextureKey(direction: FacingDirection, outfit: PlayerOutfit = 'normal'): string {
  return outfit === 'snow' ? `player-snow-${direction}-idle` : textureKey(direction, 'idle');
}

export function walkAnimationKey(direction: FacingDirection): string {
  return `player-walk-${direction}`;
}

export function locomotionTextureKey(direction: FacingDirection, phase: StrideFrame, gait: Gait,
  hairstyle: PlayerHairstyle = 'loose',
  outfit: PlayerOutfit = 'normal',
): string {
  if (outfit === 'snow') return gait === 'walk'
    ? `player-snow-${direction}-${phase}`
    : `player-snow-sprint-${direction}-${phase}`;
  return gait === 'walk' ? textureKey(direction, phase, hairstyle)
    : `player-${hairstyle === 'ponytail' ? 'ponytail-' : ''}sprint-${direction}-${phase}`;
}

export const SEATED_TEXTURE_KEY = 'player-seated';

export function ponytailTextureKey(
  direction: FacingDirection,
  phase: WalkPhase = 'idle',
): string {
  return textureKey(direction, phase, 'ponytail');
}

export function createPlayerAnimations(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'player-contact-shadow', 22, 8, g => characterContact(g, 3, 3, 16));
  DIRECTIONS.forEach(direction=>PHASES.forEach(phase=>{
    createPixelTexture(scene,`player-snow-${direction}-${phase}`,24,32,g=>drawProtagonistSprite(g,direction,phase,'snow'));
    if(phase!=='idle')createPixelTexture(scene,`player-snow-sprint-${direction}-${phase}`,24,32,g=>drawProtagonistSprite(g,direction,phase,'snow',true));
  }));
  DIRECTIONS.forEach((direction) => {
    (['step-a', 'pass-a', 'step-b', 'pass-b'] as const).forEach((phase) => {
      (['loose', 'ponytail'] as const).forEach((hairstyle) => {
        createPixelTexture(scene, locomotionTextureKey(direction, phase, 'sprint', hairstyle), 24, 32,
          (graphics) => drawProtagonistSprite(graphics, direction, phase, 'normal', true, hairstyle));
      });
    });
  });
  createPixelTexture(scene, SEATED_TEXTURE_KEY, 24, 32, drawProtagonistSeated);
  DIRECTIONS.forEach((direction) => {
    PHASES.forEach((phase) => {
      createPixelTexture(
        scene,
        textureKey(direction, phase),
        PLAYER_TEXTURE_SIZE.width,
        PLAYER_TEXTURE_SIZE.height,
        (graphics) => drawProtagonistSprite(graphics, direction, phase),
      );
    });
  });

  DIRECTIONS.forEach((direction) => {
    PHASES.forEach((phase) => {
      createPixelTexture(
        scene,
        textureKey(direction, phase, 'ponytail'),
        PLAYER_TEXTURE_SIZE.width,
        PLAYER_TEXTURE_SIZE.height,
        (graphics) => drawProtagonistSprite(graphics, direction, phase, 'normal', false, 'ponytail'),
      );
    });
  });

  DIRECTIONS.forEach((direction) => {
    const key = walkAnimationKey(direction);
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: [
        { key: textureKey(direction, 'step-a') },
        { key: textureKey(direction, 'pass-a') },
        { key: textureKey(direction, 'step-b') },
        { key: textureKey(direction, 'pass-b') },
      ],
      frameRate: 8,
      repeat: -1,
    });
  });
}
