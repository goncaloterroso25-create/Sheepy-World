import type Phaser from 'phaser';
import { PALETTE } from './palette';

/** Rectangular writing table, keeping the existing menu's footprint and prop anchors. */
export function drawMenuDesk(g: Phaser.GameObjects.Graphics): void {
  // Floor contact and quieter rear supports, all joined to the apron.
  g.fillStyle(PALETTE.shadowDeep, 0.45).fillRect(38, 326, 214, 7);
  g.fillStyle(PALETTE.shadowWarm).fillRect(58, 225, 9, 86).fillRect(221, 225, 9, 86);
  // Straight top plane: a shallow elevation suits the front-facing room.
  g.fillStyle(PALETTE.woodDeep).fillRect(30, 200, 230, 29);
  g.fillStyle(PALETTE.wood).fillRect(33, 201, 224, 21);
  g.fillStyle(PALETTE.woodWarm).fillRect(34, 201, 221, 2);
  g.fillStyle(PALETTE.woodDeep).fillRect(35, 212, 216, 1);
  g.fillStyle(PALETTE.woodWarm).fillRect(33, 222, 224, 2);
  // Coherent top thickness and a single shallow drawer/apron, not floating bars.
  g.fillStyle(PALETTE.woodDeep).fillRect(33, 224, 224, 7).fillRect(45, 231, 200, 15);
  g.fillStyle(PALETTE.wood).fillRect(61, 233, 169, 10);
  g.fillStyle(PALETTE.woodWarm).fillRect(65, 234, 160, 1);
  g.fillStyle(PALETTE.paperShadow).fillRect(139, 237, 11, 2);
  // Near legs seat directly under the apron; matching side planes ground the table.
  g.fillStyle(PALETTE.woodDeep).fillRect(45, 231, 13, 97).fillRect(233, 231, 13, 97);
  g.fillStyle(PALETTE.wood).fillRect(47, 245, 7, 79).fillRect(235, 245, 7, 79);
  g.fillStyle(PALETTE.woodWarm).fillRect(47, 245, 2, 77).fillRect(235, 245, 2, 77);
}

/** Final menu-only readability pass; the shared Home textures stay unchanged. */
export function drawMenuDeskProps(g: Phaser.GameObjects.Graphics): void {
  const P = PALETTE;
  // Base sits on the desk's top plane, with a tall stem and stepped shade.
  g.fillStyle(P.shadowDeep, .3).fillRect(61, 210, 28, 3).fillRect(165, 210, 29, 3);
  g.fillStyle(P.woodDeep).fillRect(61, 206, 28, 5).fillRect(71, 176, 6, 30);
  g.fillStyle(P.woodWarm).fillRect(65, 205, 20, 3).fillRect(73, 178, 2, 27);
  g.fillStyle(P.paperShade).fillRect(62, 165, 26, 17).fillRect(58, 177, 34, 6);
  g.fillStyle(P.cream).fillRect(65, 167, 20, 12).fillRect(61, 177, 28, 3);
  g.fillStyle(P.creamLight).fillRect(66, 168, 5, 9);
  // Twelve-pixel ceramic cup body plus separate handle and a modest saucer.
  g.fillStyle(P.paperShade).fillRect(165, 209, 29, 3);
  g.fillStyle(P.cream).fillRect(168, 208, 23, 2);
  g.fillStyle(P.woodDeep).fillRect(171, 194, 15, 15).fillRect(185, 197, 7, 9);
  g.fillStyle(P.cream).fillRect(172, 195, 12, 12).fillRect(185, 199, 5, 5);
  g.fillStyle(P.wood).fillRect(186, 200, 3, 3);
  g.fillStyle(P.woodDeep).fillRect(173, 195, 10, 3);
  g.fillStyle(P.creamLight).fillRect(173, 199, 2, 7).fillRect(176, 188, 1, 4).fillRect(180, 185, 1, 4);
}
