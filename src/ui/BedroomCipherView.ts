import type Phaser from 'phaser';
import { CIPHER_HINTS, CIPHER_MESSAGE, CIPHER_SOLUTION, decodeCaesar } from '../systems/BedroomCipher';
import { addBodyText, addHeadingText, addSmallText } from './PixelFont';
import { paperButton } from './TactileUI';
import { paperControlButton } from './ControllerGlyphs';
export function createCipherView(scene: Phaser.Scene, shift: number, hint: number, solved: boolean,
  actions: { shift: (step: number) => void; hint: () => void; submit: () => void; close: () => void }): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0);
  root.add(scene.add.rectangle(320, 180, 640, 360, 0x05090d, .94).setInteractive());
  const g = scene.add.graphics(); root.add(g);
  g.fillStyle(0x302d40).fillRect(47, 34, 546, 286);
  g.fillStyle(0x11241e).fillRect(59, 46, 522, 254);
  for (let y=50; y<294; y+=4) g.fillStyle(0x263a2f,.3).fillRect(61,y,518,1);
  root.add(addHeadingText(scene, 80, 66, solved ? 'SIGNAL FOUND' : 'A MESSAGE OUT OF PLACE', 0xb0e5bc));
  root.add(addSmallText(scene, 80, 95, 'LOCAL TERMINAL // NO CONNECTION', 0x719c82));
  root.add(addBodyText(scene, 80, 125, CIPHER_MESSAGE, 0x94ab96));
  root.add(addBodyText(scene, 80, 156, solved ? CIPHER_SOLUTION : decodeCaesar(CIPHER_MESSAGE,shift), 0xd5efd5).setMaxWidth(485));
  root.add(addBodyText(scene, 271, 213, `SHIFT ${shift}`, 0xc8e8c2));
  root.add(paperButton(scene, 80, 207, 120, '< BACK', () => actions.shift(-1)));
  root.add(paperButton(scene, 425, 207, 120, 'AHEAD >', () => actions.shift(1)));
  root.add(addSmallText(scene, 80, 249, solved ? 'Saved. The city can wait until you are ready.' : CIPHER_HINTS[hint]!, 0xc8e8c2).setMaxWidth(475));
  root.add(paperButton(scene, 64, 325, 110, '1  HINT', actions.hint));
  root.add(paperButton(scene, 216, 325, 168, '2  DECODE', actions.submit));
  root.add(paperControlButton(scene,460,325,120,'back','CLOSE',actions.close));
  return root;
}
