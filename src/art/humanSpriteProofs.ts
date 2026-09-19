import type Phaser from 'phaser';
import { characterContact, characterFace } from './characterFoundation';
import { clothLimb, shoe, silhouette } from './humanPixelGrammar';

/** These are two authored bodies, deliberately not a universal NPC generator.
 * Hange: short coat, open stance, raised arm. Jane: longer waistcoat, relaxed
 * dropped shoulder and a pocketed hand. Original keys/feet remain unchanged. */
export function drawHangeProof(g: Phaser.GameObjects.Graphics): void {
  characterContact(g, 3, 33, 19);
  const trousers = { edge: 0x544c48, base: 0xb0a388, light: 0xd0c2a3 };
  clothLimb(g, 6, 24, 5, 32, 5, 4, trousers); shoe(g, 4, 33, 6);
  clothLimb(g, 13, 24, 15, 31, 5, 4, trousers); shoe(g, 15, 32, 6);
  g.fillStyle(0x303e3d); silhouette(g, 4, 14, [[4,7,1],[2,12,2],[1,14,3],[2,12,4],[3,10,2]]);
  g.fillStyle(0x63806a); silhouette(g, 5, 15, [[2,9,2],[0,13,2],[1,11,3],[2,9,2]]);
  g.fillStyle(0x927054).fillRect(8, 18, 3, 6).fillRect(15, 18, 2, 5);
  g.fillStyle(0xe0d1af); silhouette(g, 10, 15, [[1,4,2],[0,5,4],[1,3,2]]);
  g.fillStyle(0x554841).fillRect(8, 24, 10, 2);
  g.fillStyle(0xcfb68b).fillRect(12, 24, 2, 1);
  const coat = { edge: 0x303e3d, base: 0x63806a, light: 0x849078 };
  clothLimb(g, 3, 15, 1, 19, 4, 3, coat);
  g.fillStyle(0x63806a).fillRect(1, 12, 2, 5);
  g.fillStyle(0xe2b494).fillRect(1, 10, 2, 3);
  clothLimb(g, 18, 17, 19, 24, 3, 2, coat);
  g.fillStyle(0xe2b494).fillRect(19, 24, 2, 2);
  // A high untidy knot and a tapered falling ponytail, separate from the head.
  g.fillStyle(0x342b2d); silhouette(g, 17, 0, [[2,3,1],[1,5,3],[0,6,3],[2,5,3],[3,4,4],[2,3,4]]);
  g.fillStyle(0x725442).fillRect(19, 2, 2, 4).fillRect(21, 10, 1, 4);
  g.fillStyle(0x342b2d); silhouette(g, 4, 3, [[4,7,1],[2,11,2],[1,13,5],[0,4,4],[1,2,3]]);
  characterFace(g, 7, 7, 11, 8, 0xe2b494);
  g.fillStyle(0x4e3932).fillRect(7, 5, 7, 3).fillRect(6, 7, 3, 3).fillRect(16, 6, 3, 4);
  g.fillStyle(0x89654c).fillRect(9, 5, 4, 1);
  // Thin rims leave visible skin inside each lens instead of a pale eye-mask.
  g.fillStyle(0xbfac89).fillRect(8, 9, 4, 1).fillRect(8, 12, 4, 1)
    .fillRect(8, 10, 1, 2).fillRect(11, 10, 1, 2)
    .fillRect(14, 9, 4, 1).fillRect(14, 12, 4, 1).fillRect(14, 10, 1, 2).fillRect(17, 10, 1, 2);
  g.fillStyle(0x3a3032).fillRect(10, 10, 1, 1).fillRect(15, 10, 1, 1).fillRect(12, 10, 2, 1);
  g.fillStyle(0x9a675e).fillRect(12, 14, 2, 1);
  g.fillStyle(0x5a4b43).fillRect(20, 22, 4, 7);
  g.fillStyle(0xd5c4a1).fillRect(21, 23, 2, 5);
}

export function drawJaneProof(g: Phaser.GameObjects.Graphics, frame: number): void {
  characterContact(g, 4, 37, 20);
  const suit = { edge: 0x30303a, base: 0x50515b, light: 0x77747a };
  clothLimb(g, 9, 25, 8, 36, 5, 4, suit); shoe(g, 7, 37, 6);
  clothLimb(g, 15, 25, 16, 37, 5, 4, suit); shoe(g, 16, 38, 6);
  g.fillStyle(suit.edge); silhouette(g, 6, 17, [[4,8,1],[2,12,2],[1,14,3],[2,12,4],[3,10,2]]);
  g.fillStyle(suit.base); silhouette(g, 8, 19, [[1,9,3],[0,11,3],[1,9,3]]);
  g.fillStyle(0xdfd8c2).fillRect(12, 16, 4, 4).fillRect(13, 20, 3, 4);
  g.fillStyle(0xa7aca3).fillRect(11, 18, 2, 2).fillRect(16, 18, 2, 2);
  g.fillStyle(0x77747a).fillRect(10, 21, 1, 5).fillRect(17, 21, 1, 5);
  g.fillStyle(0xc0b9a3).fillRect(14, 25, 1, 1).fillRect(14, 28, 1, 1);
  clothLimb(g, 5, 20, 6, 26, 4, 3, suit);
  g.fillStyle(0xe5b38d).fillRect(8, 26, 3, 2); // relaxed pocketed hand
  clothLimb(g, 20, 20, 21, 28 + frame, 3, 2, suit);
  g.fillStyle(0xe5b38d).fillRect(21, 29 + frame, 2, 2);
  g.fillStyle(0x89694c); silhouette(g, 7, 4, [[4,7,1],[2,11,1],[1,13,3],[0,14,4],[1,12,3]]);
  characterFace(g, 9, 8, 11, 9, 0xe5b38d);
  g.fillStyle(0xc7a26a); silhouette(g, 7, 5, [[3,8,1],[1,11,2],[0,7,2],[1,4,2]]);
  g.fillRect(18, 7, 3, 4).fillRect(8, 10, 2, 3);
  g.fillStyle(0xe3c68c).fillRect(11, 5, 6, 1).fillRect(8, 8, 3, 1);
  g.fillStyle(0x554335).fillRect(11, 11, 2, 1).fillRect(16, 11, 2, 1);
  g.fillStyle(0x7b9495).fillRect(12, 12, 1, 1).fillRect(17, 12, 1, 1);
  g.fillStyle(0xac7d70).fillRect(14, 15, 3, 1);
}
