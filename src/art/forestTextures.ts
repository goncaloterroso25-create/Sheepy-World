import type Phaser from 'phaser';
import { createPixelTexture } from './textureFactory';
import { forestTree, forestFern, forestBush } from './forestStyle';

export function createForestTextures(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'forest-bush', 38, 24, g => forestBush(g));
  for (let variant = 0; variant < 3; variant++)
    createPixelTexture(scene, `forest-tree-${variant}`, 104, 132, g => forestTree(g, variant));
  createPixelTexture(scene, 'forest-fern', 30, 22, g => forestFern(g));
}
