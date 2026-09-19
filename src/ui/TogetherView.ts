import type Phaser from 'phaser';
import { addSmallText } from './PixelFont';
import { steppedPanel, UI_MATERIAL as M } from './TactileUI';
import { addControlHint } from './ControllerGlyphs';
import { JOURNEY_PHOTOS } from '../data/journeyPhotos';

export function togetherTag(scene: Phaser.Scene, action: 'together' | 'back', label: string): Phaser.GameObjects.Container {
  const g = scene.add.graphics(), hint = addControlHint(scene, action, label, 0, 0, M.ink, 'center');
  const root = scene.add.container(0, 0, [g, hint]).setDepth(5002);
  root.setData('refresh', (text: string) => {
    hint.setData('label', text); hint.getData('refreshInputPresentation')();
    const w = Math.ceil(Number(hint.getData('hintWidth'))) + 16;
    g.clear(); steppedPanel(g, -Math.floor(w / 2), -8, w, 16, M.paperLight, M.paperEdge);
  });
  root.getData('refresh')(label); return root;
}
export function coupleBubble(scene: Phaser.Scene, text: string, x: number, y: number): Phaser.GameObjects.Container {
  const copy = addSmallText(scene, 0, 0, text, M.ink).setOrigin(.5).setCenterAlign();
  copy.setFontSize(scene.cache.bitmapFont.get(copy.font).data.size);
  const w = Math.ceil(copy.width) + 16, h = Math.ceil(copy.height) + 12, g = scene.add.graphics();
  steppedPanel(g, -w / 2, -h / 2, w, h, M.paperLight, M.paperEdge);
  g.fillStyle(M.paperEdge).fillRect(-1, h / 2, 3, 3);
  return scene.add.container(Math.round(x), Math.round(y), [g, copy]).setDepth(5100);
}
export function cozyCallbackCard(scene: Phaser.Scene, index: number): Phaser.GameObjects.Container {
  const images = JOURNEY_PHOTOS.sleepy.gallery.filter(f => f.kind === 'image');
  const frame = images[index % images.length]!;
  const shade = scene.add.rectangle(320, 180, 640, 360, M.ink, .55).setInteractive();
  const g = scene.add.graphics(); steppedPanel(g, 206, 49, 228, 260, M.paperLight, M.paperEdge);
  const image = scene.add.image(320, 161, frame.key);
  image.setScale(Math.min(206 / image.width, 202 / image.height));
  const title = addSmallText(scene, 320, 270, 'COZY CAT NAP', M.ink).setOrigin(.5);
  const back = addControlHint(scene, 'back', 'BACK TO THE COUCH', 320, 293, M.pencil, 'center');
  const root = scene.add.container(0, 0, [shade, g, image, title, back]).setScrollFactor(0).setDepth(8000);
  root.setData('refresh', () => back.getData('refreshInputPresentation')());
  return root;
}
