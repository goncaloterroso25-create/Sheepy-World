import type Phaser from 'phaser';
import { softBox } from '../art/styleProofShapes';
import { addSmallText } from './PixelFont';
import { dialogueLayout } from './DialogueLayout';

/** Presentation only. Portrait keys and dialogue/audio events stay with UIScene. */
export function createDialogueFrame(scene: Phaser.Scene, side: 'left' | 'right', speaker: string,
  portraitKey?: string): Phaser.GameObjects.Container {
  const l = dialogueLayout(side), g = scene.add.graphics();
  g.fillStyle(0x332c3d, 0.5); softBox(g, 20, 223, 604, 132, 5);
  g.fillStyle(0x69545b); softBox(g, 16, 217, 608, 134, 5);
  g.fillStyle(0xd0b093); softBox(g, 18, 219, 604, 130, 4);
  g.fillStyle(0xf0dfc2); softBox(g, 21, 222, 598, 124, 3);
  g.fillStyle(0xf7e9ce).fillRect(25, 223, 590, 2);
  // A small plum cloth name tab, aligned to the text column rather than floating over the face.
  g.fillStyle(0x695267); softBox(g, l.textX - 7, 209, 204, 25, 3);
  g.fillStyle(0x987482).fillRect(l.textX - 3, 210, 196, 2);
  g.fillStyle(0x9b817c); softBox(g, l.portraitX - 37, 248, 74, 83, 3);
  g.fillStyle(0xf7e7c7); softBox(g, l.portraitX - 35, 250, 70, 79, 2);
  const name = addSmallText(scene, l.textX + 4, 217, speaker, 0xffedce);
  const art = portraitKey && scene.textures.exists(portraitKey)
    ? scene.add.image(l.portraitX, l.portraitY, portraitKey) // Native dimensions: no fractional scaling.
    : addSmallText(scene, l.portraitX, l.portraitY - 4, speaker.slice(0, 1), 0x695267).setOrigin(0.5, 0);
  return scene.add.container(0, 0, [g, name, art]);
}
