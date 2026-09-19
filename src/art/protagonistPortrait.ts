import type Phaser from 'phaser';
import { pixelOval, softBox } from './styleProofShapes';
import { BLUSH_ACCENT } from './characterFoundation';

/** Original native-pixel portrait; long black waves and a quiet black top.
 * Keep the stable 64×72 key/crop so an approved future portrait can replace it. */
export function drawProtagonistPortrait(g: Phaser.GameObjects.Graphics, warm: boolean): void {
  g.fillStyle(0x716275).fillRect(0, 0, 64, 72);
  g.fillStyle(0x94818a); pixelOval(g, 1, 1, 62, 69);
  g.fillStyle(0xaf9799); pixelOval(g, 7, 4, 42, 48);
  // Rounded silhouette, uneven crown and continuous waves (not a rectangular curtain).
  g.fillStyle(0x262733);
  pixelOval(g, 12, 5, 43, 53); pixelOval(g, 8, 31, 46, 39);
  g.fillStyle(0x383542);
  pixelOval(g, 12, 10, 15, 42); pixelOval(g, 39, 13, 13, 43);
  g.fillStyle(0x30313b); pixelOval(g, 13, 55, 44, 32);
  g.fillStyle(0x47434d); pixelOval(g, 18, 60, 36, 23);
  g.fillStyle(0xd29b85); softBox(g, 27, 46, 12, 14, 3);
  g.fillStyle(0xeab49a); softBox(g, 29, 48, 9, 10, 2);
  // Broad cheeks and a short rounded chin; no outlined nose or cheek creases.
  g.fillStyle(0xdba28c); pixelOval(g, 17, 17, 31, 35);
  g.fillStyle(0xefbda1); pixelOval(g, 18, 17, 28, 33);
  g.fillStyle(0xf5ccb0); pixelOval(g, 20, 20, 20, 22);
  g.fillStyle(0xe5a495); pixelOval(g, 19, 37, 7, 4); pixelOval(g, 39, 37, 6, 4);
  // Her anatomical LEFT is viewer-right. Distinct warm-red mark, below the eye.
  g.fillStyle(BLUSH_ACCENT).fillRect(41, 40, 2, 2);
  // Soft brows, little brown eyes and one deliberate catchlight per eye.
  g.fillStyle(0x66504e).fillRect(23, 29, 5, 1).fillRect(36, 29, 5, 1);
  g.fillStyle(0x443c42).fillRect(23, 33, 5, 2).fillRect(36, 33, 5, 2);
  g.fillStyle(0x765b48).fillRect(25, 34, 3, 3).fillRect(36, 34, 3, 3);
  g.fillStyle(0xffe6c7).fillRect(25, 33, 1, 1).fillRect(36, 33, 1, 1);
  g.fillStyle(0xd49b85).fillRect(32, 38, 2, 1);
  g.fillStyle(0xaa6a70).fillRect(30, 44, 6, 1);
  if (warm) g.fillRect(28, 43, 2, 1).fillRect(36, 43, 2, 1);
  g.fillStyle(0xf3c8aa).fillRect(31, 46, 4, 1);
  // Side-parted fringe exposes the face; the two wavy locks frame rather than bisect it.
  g.fillStyle(0x292a35);
  pixelOval(g, 14, 9, 24, 16); pixelOval(g, 34, 11, 16, 14);
  pixelOval(g, 11, 22, 10, 24); pixelOval(g, 9, 41, 12, 22);
  pixelOval(g, 43, 22, 9, 26); pixelOval(g, 44, 44, 10, 24);
  g.fillStyle(0x4a4351);
  pixelOval(g, 19, 12, 13, 3); pixelOval(g, 14, 27, 3, 11);
  pixelOval(g, 12, 48, 3, 10); pixelOval(g, 47, 32, 2, 10);
  g.fillStyle(0x3c3845).fillRect(43, 54, 3, 12).fillRect(18, 53, 3, 12);
}
