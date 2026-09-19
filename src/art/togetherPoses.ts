import type Phaser from 'phaser';
import type { FacingDirection } from '../entities/playerAnimations';
import { goncaloTextureKey, createGoncaloTextures } from './goncaloSprites';

export function createTogetherPoses(scene: Phaser.Scene): void {
  createGoncaloTextures(scene);
  for (const who of ['protagonist', 'goncalo'] as const) for (const direction of ['down', 'up', 'left', 'right'] as const) {
    for (const pose of ['sit', 'lie'] as const) {
      const key = `together-${who}-${pose}-${direction}`;
      if (scene.textures.exists(key)) continue;
      const texture = scene.textures.createCanvas(key, 24, 32)!;
      const c = texture.context;
      c.imageSmoothingEnabled = false;
      const source = scene.textures.get(who === 'protagonist' ? `player-${direction}-idle` : goncaloTextureKey(direction)).getSourceImage() as HTMLImageElement;
      const purple = who === 'goncalo';
      // Approved heads and anatomical-left playfulCallback; sleeping has a closed-eye variant.
      c.drawImage(source, 0, 0, 24, 16, 0, 0, 24, 16);
      const rect = (color: string, x: number, y: number, w: number, h: number): void => { c.fillStyle = color; c.fillRect(x, y, w, h); };
      if(pose==='lie' && (direction==='left'||direction==='right')) {
        if(!purple){
          const eyeX=direction==='right'?14:7;
          rect('#f2bd9f',eyeX,8,3,3);rect('#51444f',eyeX,9,3,1);
        } else {
          // Close only the lens interior; the rectangular frame and facial hair stay intact.
          rect('#24212a',direction==='right'?16:6,7,2,1);
        }
      }
      rect(purple ? '#302638' : '#b3abae', 7, 15, 11, pose === 'sit' ? 9 : 8);
      rect(purple ? '#534165' : '#eee8dd', 8, 16, 9, 6);
      if (direction === 'down') rect('#e6ddc4', 11, 17, 4, 2);
      if (pose === 'sit') {
        rect(purple ? '#303d56' : '#55505d', 6, 22, 13, 4);
        rect(purple ? '#536f94' : '#817b87', 7, 22, 11, 2);
        rect(purple ? '#536f94' : '#f2bd9f', 7, 25, 4, 3);
        rect(purple ? '#536f94' : '#f2bd9f', 14, 25, 4, 3);
        rect('#342e38', 6, 28, 5, 2); rect('#342e38', 14, 28, 5, 2);
        rect('#f5efe5', 6, 29, 5, 1); rect('#f5efe5', 14, 29, 5, 1);
        rect('#f0bb99', 6, 20, 2, 3); rect('#f0bb99', 17, 20, 2, 3);
      } else {
        // Tucked, bent knees under a small fold of the existing plum bed linen.
        const back = direction === 'left' || direction === 'right';
        rect('#72576e', back && direction === 'left' ? 8 : 6, 22, 13, 7);
        rect('#a18793', 7, 22, 11, 2); rect('#c4a9b4', 8, 24, 1, 3);
        rect('#f0bb99', direction === 'left' ? 6 : 16, 16, 3, 3);
        rect('#72576e', 8, 29, 9, 1);
      }
      if (direction === 'up') c.drawImage(source, 4, 11, 16, purple ? 6 : 10, 4, 11, 16, purple ? 6 : 10);
      texture.refresh(); texture.setFilter(0);
    }
  }
}

/** Two small bent forearms and touching palms, anchored to actual sleeve pixels. */
export function drawHeldHands(g: Phaser.GameObjects.Graphics, bx: number, by: number, gx: number, gy: number,
  direction: FacingDirection, bob: number, winter: boolean): void {
  const b = { x: Math.round(bx), y: Math.round(by - 12 + bob) };
  const a = { x: Math.round(gx), y: Math.round(gy - 12 + bob) };
  const sign = gx > bx ? 1 : -1;
  if (direction === 'up' || direction === 'down') {
    g.fillStyle(winter ? 0x363240 : 0xeee8dd).fillRect(b.x + (sign > 0 ? 5 : -8), b.y - 4, 3, 4);
    g.fillStyle(0x534165).fillRect(a.x + (sign > 0 ? -8 : 5), a.y - 4, 3, 4);
    g.fillStyle(0xc78d70).fillRect(b.x + (sign > 0 ? 6 : -9), b.y, 3, 5).fillRect(a.x + (sign > 0 ? -9 : 6), a.y, 3, 5);
    g.fillStyle(0xf2bd9f).fillRect(b.x + (sign > 0 ? 7 : -8), b.y, 2, 4).fillRect(a.x + (sign > 0 ? -8 : 7), a.y, 2, 4);
    g.fillStyle(0xffd3af).fillRect(Math.round((bx + gx) / 2) - 2, b.y + 3, 4, 2);
  } else {
    // Foreshortened upper/lower arms on the two depth planes, meeting at one palm.
    const x = b.x + sign * 5;
    g.fillStyle(winter ? 0x363240 : 0xeee8dd).fillRect(x - 1, b.y - 3, 3, 4);
    g.fillStyle(0xc78d70).fillRect(x, b.y + 1, 3, 5).fillRect(x + sign * 2, b.y + 4, 3, 4);
    g.fillStyle(0xf2bd9f).fillRect(x + 1, b.y + 1, 2, 4).fillRect(x + sign * 2 + 1, b.y + 4, 2, 3);
    g.fillStyle(0x534165).fillRect(a.x - sign * 5 - 1, a.y - 5, 3, 3);
    g.fillStyle(0xffd3af).fillRect(x + sign * 2, b.y + 6, 3, 2);
  }
}
