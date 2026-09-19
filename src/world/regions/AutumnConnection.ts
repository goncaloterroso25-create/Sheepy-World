import type Phaser from 'phaser';
import { PALETTE as P } from '../../art/palette';
import { paving, stoneWall } from './RegionArt';
import { addSmallText } from '../../ui/PixelFont';

/** Local continuation of the existing eastern path; the park composition stays intact. */
export function buildAutumnConnection(scene: Phaser.Scene, obstacles: Phaser.Physics.Arcade.StaticGroup): void {
  const g = scene.add.graphics().setDepth(-20);
  g.fillStyle(P.stone).fillRect(9,355,62,14);
  addSmallText(scene,15,359,'PORTO',P.ink).setDepth(380);
  paving(g, { x: 1184, y: 598, width: 96, height: 82 });
  stoneWall(g, { x: 1194, y: 589, width: 86, height: 9 });
  g.fillStyle(P.waterShade).fillRect(1254, 682, 26, 37);
  g.fillStyle(P.waterLight).fillRect(1261, 690, 17, 2);
  g.fillStyle(P.stoneDeep).fillRect(1202, 674, 78, 3);
  for (let x = 1202; x < 1280; x += 13) g.fillRect(x, 666, 2, 16);
  // One terracotta eave beyond the hedge hints at the town ahead.
  g.fillStyle(P.plaster).fillRect(1257, 480, 23, 45);
  g.fillStyle(P.leafRed).fillRect(1251, 474, 29, 8);
  for (const [x, y, w, h] of [[420,134,40,12],[1194, 589, 86, 9], [1202, 674, 78, 4], [1254, 682, 26, 37]]) {
    const body = obstacles.create(x! + w! / 2, y! + h! / 2, 'collision') as Phaser.Physics.Arcade.Sprite;
    body.setDisplaySize(w!, h!).setVisible(false).refreshBody();
  }
}
