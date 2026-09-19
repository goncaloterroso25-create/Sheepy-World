import Phaser from 'phaser';

export type TextureDrawer = (graphics: Phaser.GameObjects.Graphics) => void;

export function createPixelTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: TextureDrawer,
): void {
  if (scene.textures.exists(key)) return;
  const graphics = scene.add.graphics();
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function mirroredX(x: number, width: number, textureWidth: number): number {
  return textureWidth - x - width;
}
