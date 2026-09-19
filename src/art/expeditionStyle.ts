import type Phaser from 'phaser';
import type { ExpeditionLook } from './festivalTextures';
import { characterContact, characterFace, CHARACTER_INK } from './characterFoundation';
import { pixelOval, softBox } from './styleProofShapes';
import { drawHangeProof } from './humanSpriteProofs';

/** Four authored silhouettes, same 24×36 canvases/feet as the existing cast. */
export function expeditionStyle(g: Phaser.GameObjects.Graphics, look: ExpeditionLook): void {
  if (look.id === 'hange') { drawHangeProof(g); return; }
  const eren = look.id === 'eren', armin = look.id === 'armin';
  const hx = eren ? 8 : 6, hy = 4;
  characterContact(g, 3, 33, 19);
  // Quiet narrow stance / forward stagger / grounded wide stance are not recolors.
  const legs = armin ? [8, 13] : eren ? [7, 15] : [5, 15];
  for (const [i, x] of legs.entries()) {
    g.fillStyle(0x776a61).fillRect(x, 23, 4, 9);
    g.fillStyle(0xb5aa8e).fillRect(x + 1, 24, 2, 5);
    g.fillStyle(CHARACTER_INK).fillRect(x - 1, eren && i === 0 ? 30 : 32, 6, eren && i === 0 ? 5 : 3);
    g.fillStyle(0x53505a).fillRect(x, 32, 3, 1);
  }
  g.fillStyle(0x3e5048); softBox(g, armin ? 7 : 4, 14, armin ? 12 : 16, 12, 2);
  g.fillStyle(look.coat); softBox(g, armin ? 8 : 5, 14, armin ? 10 : 14, 10, 2);
  g.fillStyle(0xd7c9a7).fillRect(10, 14, 5, 8);
  g.fillStyle(0xa98765).fillRect(7, 15, 3, 8).fillRect(15, 15, 3, 8);
  g.fillStyle(0x574d49).fillRect(6, 24, 13, 2).fillRect(11, 20, 2, 5);
  g.fillStyle(0xccb68e).fillRect(11, 24, 3, 1);
  characterFace(g, hx, hy, 11, 10, look.skin);
  g.fillStyle(look.hair);
  if (armin) {
    pixelOval(g, 4, 1, 16, 10);
    g.fillRect(4, 7, 3, 6).fillRect(18, 7, 2, 6).fillRect(7, 6, 3, 2);
    g.fillStyle(0xe1c88d).fillRect(7, 2, 9, 2).fillRect(5, 5, 2, 5);
  } else if (eren) {
    g.fillRect(7, 3, 14, 4).fillRect(8, 1, 3, 4).fillRect(13, 0, 3, 5)
      .fillRect(18, 2, 3, 7).fillRect(7, 6, 3, 4);
    g.fillStyle(0x715345).fillRect(11, 3, 5, 2);
  } else {
    pixelOval(g, 4, 1, 16, 10);
    g.fillRect(4, 6, 4, 9).fillRect(18, 5, 3, 10).fillRect(7, 6, 4, 2);
    g.fillStyle(0x4b4653).fillRect(6, 3, 7, 1).fillRect(5, 9, 1, 4);
  }
  if (armin || look.id === 'mikasa') {
    characterFace(g, 8, 8, 9, 5, look.skin);
    g.fillStyle(CHARACTER_INK).fillRect(9, 10, 1, 1).fillRect(15, 10, 1, 1);
  } else g.fillStyle(CHARACTER_INK).fillRect(hx + 3, hy + 5, 1, 1).fillRect(hx + 8, hy + 5, 1, 1);
  if (eren) {
    g.fillStyle(look.coat).fillRect(3, 15, 5, 7);
    g.fillStyle(look.skin).fillRect(4, 20, 3, 3).fillRect(19, 15, 3, 4);
  } else {
    g.fillStyle(look.coat).fillRect(armin ? 6 : 2, 16, 3, 7).fillRect(armin ? 17 : 20, 16, 3, 7);
    g.fillStyle(look.skin).fillRect(armin ? 8 : 3, 22, 2, 2).fillRect(armin ? 16 : 20, 22, 2, 2);
  }
  if (look.id === 'mikasa') {
    g.fillStyle(0x984f5d).fillRect(6, 13, 14, 3).fillRect(18, 15, 4, 8).fillRect(20, 21, 3, 2);
    g.fillStyle(0xc57679).fillRect(7, 13, 10, 1).fillRect(19, 16, 1, 5);
  }
}
