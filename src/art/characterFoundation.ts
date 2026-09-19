import type Phaser from 'phaser';
import { PALETTE } from './palette';
import { pixelOval, softBox } from './styleProofShapes';

/** Small-cast art contract: 24px canvas, 10–13px head, shoulders below the
 * jaw, grounded feet. Silhouette/hair precede costume, face detail comes last.
 * Helpers supply material hierarchy, never a mandatory identical body. */
export const CHARACTER_INK = 0x30303b;
export const BLUSH_ACCENT = 0xb95658;
export const PROTAGONIST_COLORS = {
  ...PALETTE, skin: 0xe9b59b, skinLight: 0xf4ccb0, skinShade: 0xcb9383,
  jetHairDeep: 0x252631, jetHair: 0x34323e, jetHairLight: 0x504654,
  blackCloth: 0x363741, blackClothLight: 0x56515d,
  snowShadow: 0xb5bdba, snowLight: 0xf0eddf, gummyRed: BLUSH_ACCENT,
} as const;

export function characterFace(g: Phaser.GameObjects.Graphics, x: number, y: number,
  w: number, h: number, skin: number): void {
  g.fillStyle(skin); softBox(g, x, y, w, h, 1);
  g.fillStyle(0xffdfbb, 0.25).fillRect(x + 1, y + 1, Math.max(1, w - 4), Math.max(1, h - 4));
}

export function characterContact(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number): void {
  g.fillStyle(0x33443f, 0.25); pixelOval(g, x, y, w, 3);
}
