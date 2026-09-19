import type Phaser from 'phaser';
import { PALETTE as P } from './palette';
import { createPixelTexture } from './textureFactory';

/** Original compact silhouettes, not exact-object photo reproductions. */
export function createHomePropTextures(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'item-half-glasses', 16, 16, g => {
    g.fillStyle(P.shadowDeep).fillRect(1, 5, 7, 1).fillRect(1, 6, 1, 5).fillRect(7, 6, 1, 5)
      .fillRect(2, 11, 5, 1).fillRect(8, 7, 3, 1).fillRect(11, 5, 3, 1).fillRect(14, 4, 1, 2);
    g.fillStyle(P.waterLight).fillRect(3, 7, 3, 3);
    g.fillStyle(P.stoneLight).fillRect(2, 5, 5, 1).fillRect(11, 8, 2, 1);
  });
  createPixelTexture(scene, 'item-naruto-shuriken-keychain', 16, 16, g => {
    g.fillStyle(P.leafGold).fillRect(9, 0, 4, 1).fillRect(8, 1, 1, 3).fillRect(13, 1, 1, 3)
      .fillRect(9, 4, 4, 1).fillRect(10, 5, 1, 2);
    g.fillStyle(P.shadowDeep).fillRect(6, 6, 3, 9).fillRect(2, 9, 11, 3)
      .fillRect(7, 5, 2, 2).fillRect(0, 10, 3, 2).fillRect(12, 9, 3, 2);
    g.fillStyle(P.stoneLight).fillRect(7, 7, 1, 7).fillRect(3, 10, 9, 1);
    g.fillStyle(P.woodWarm).fillRect(7, 10, 1, 1);
  });
}
