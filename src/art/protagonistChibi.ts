import type Phaser from 'phaser';
import type { FacingDirection, PlayerHairstyle } from '../entities/playerAnimations';
import type { ProtagonistPhase } from './protagonistSprites';
import { clothLimb, silhouette } from './humanPixelGrammar';

// Native 24×32 interpretation of the supplied white-tee chibi reference.
// The head is authored once per view; only its vertical bob changes in motion.
const H = { edge: 0x231f28, base: 0x342e38, light: 0x51444f };
const S = { edge: 0xd39483, base: 0xf2bd9f, light: 0xffd9b9 };
const T = { edge: 0xb3abae, base: 0xeee8dd, light: 0xfffaf0 };
const G = { edge: 0x55505d, base: 0x817b87, light: 0xaaa1ac };
// Higher contrast at one native pixel, without enlarging it into cheek blush.
export const PROTAGONIST_BLUSH_ACCENT = 0xa93e4b;
export const CHIBI_MARK = { down: [15, 12], right: [15, 12] } as const;

function highTop(g: Phaser.GameObjects.Graphics, x: number, y: number, side: boolean): void {
  g.fillStyle(H.edge).fillRect(x, y, 4, 3).fillRect(x - (side ? 0 : 1), y + 2, 5, 2);
  g.fillStyle(0x66606a).fillRect(x + 1, y, 2, 1);
  g.fillStyle(T.base).fillRect(x + 1, y + 1, 2, 1).fillRect(x + 3, y + 2, 1, 1)
    .fillRect(x - (side ? 0 : 1), y + 3, 5, 1);
}

function lowerBody(g: Phaser.GameObjects.Graphics, side: boolean, phase: ProtagonistPhase,
  sprint: boolean, seated: boolean): void {
  const step = phase === 'step-a' ? -1 : phase === 'step-b' ? 1 : 0;
  const pass = phase === 'pass-a' ? -1 : phase === 'pass-b' ? 1 : 0;
  const reach = sprint ? 2 : 1;
  for (const [i, hip] of (side ? [10, 13] : [7, 13]).entries()) {
    const x = hip + (side ? step * reach * (i === 0 ? 1 : -1) : 0);
    const lifted = (i === 0 ? step > 0 || pass < 0 : step < 0 || pass > 0);
    const shoeY = seated ? 27 : 28 - (lifted ? (sprint && step !== 0 ? 2 : 1) : 0);
    clothLimb(g, hip, 23, x, shoeY, 4, 3, S);
    highTop(g, x, shoeY, side);
  }
  g.fillStyle(G.edge); silhouette(g, side ? 10 : 7, 21, [[1,side ? 7 : 10,1],[0,side ? 8 : 11,2]]);
  if (side) g.fillRect(11,24,7,1);
  else g.fillRect(7,24,5,1).fillRect(13,24,5,1);
  g.fillStyle(G.base).fillRect(side ? 11 : 8, 22, side ? 6 : 9, 1);
  g.fillStyle(G.light).fillRect(side ? 15 : 8, 22, 2, 1);
  if (!side) g.fillStyle(G.edge).fillRect(12, 22, 1, 2);
}

function longHair(g: Phaser.GameObjects.Graphics, side: boolean, back: boolean,
  bob: number, phase: ProtagonistPhase, tied: boolean): void {
  const sway = phase === 'pass-a' ? -1 : phase === 'pass-b' ? 1 : 0;
  g.fillStyle(H.edge);
  if (side) {
    silhouette(g, 6, 9 + bob, [[1,7,5],[0,7,6],[1,6,3],[2,3,1]]);
    g.fillStyle(H.base).fillRect(8, 11 + bob, 3, 9);
    g.fillStyle(H.light).fillRect(8, 14 + bob, 1, 5);
    g.fillStyle(H.edge).fillRect(7 + sway, 22 + bob, 3, 2);
  } else {
    silhouette(g, 4, 9 + bob, [[1,14,5],[0,16,7],[1,14,2],[2,3,1]]);
    g.fillStyle(H.base);
    if (back) silhouette(g, 6, 10 + bob, [[1,10,7],[0,12,4],[2,8,2],[4,4,1]]);
    else g.fillRect(5, 11 + bob, 2, 10).fillRect(17, 11 + bob, 2, 11);
    g.fillStyle(H.light).fillRect(5, 14 + bob, 1, 5).fillRect(18, 16 + bob, 1, 4);
    g.fillStyle(H.edge).fillRect(5 + sway, 22 + bob, 2, 1).fillRect(17 + sway, 22 + bob, 2, 1);
  }
  // Existing ponytail texture keys remain supported without changing the face.
  if (tied) {
    g.fillStyle(H.edge); silhouette(g, 2, 9 + bob, [[2,4,3],[1,4,5],[2,3,4]]);
    g.fillStyle(0x996570).fillRect(5, 10 + bob, 2, 1);
  }
}

export function drawChibiHead(g: Phaser.GameObjects.Graphics, direction: FacingDirection, bob: number): void {
  const side = direction === 'left' || direction === 'right';
  g.fillStyle(H.edge);
  silhouette(g, side ? 6 : 4, 1 + bob, side
    ? [[3,6,1],[1,10,1],[0,12,2],[0,14,5],[1,12,3],[3,8,1]]
    : [[5,6,1],[3,10,1],[1,14,2],[0,16,6],[1,14,2],[3,10,1]]);
  // Lift the face/neck one row while keeping crown clearance for the step bob.
  bob -= 1;
  g.fillStyle(H.base); silhouette(g, side ? 7 : 6, 3 + bob, [[3,6,1],[1,10,3],[0,12,5],[1,10,2]]);
  g.fillStyle(H.light).fillRect(7, 4 + bob, 3, 1).fillRect(6, 5 + bob, 2, 2)
    .fillRect(15, 5 + bob, 2, 1);
  if (direction === 'up') {
    g.fillStyle(H.base).fillRect(7, 10 + bob, 10, 6);
    g.fillStyle(H.light).fillRect(8, 7 + bob, 2, 1).fillRect(15, 8 + bob, 2, 1);
    return;
  }
  g.fillStyle(S.edge);
  if (side) {
    silhouette(g, 10, 6 + bob, [[3,4,1],[1,7,2],[0,8,3],[0,9,1],[1,7,2],[2,5,1]]);
    g.fillStyle(S.base); silhouette(g, 11, 7 + bob, [[1,5,1],[0,6,3],[0,7,2],[1,5,2]]);
    g.fillStyle(S.light).fillRect(13, 8 + bob, 3, 1);
    // One large soft eye, a short nose and a tucked-under mouth/chin.
    g.fillStyle(H.edge).fillRect(14, 9 + bob, 3, 1).fillRect(15, 10 + bob, 2, 2);
    g.fillStyle(0x9d7b63).fillRect(15, 11 + bob, 1, 1);
    g.fillStyle(T.light).fillRect(15, 10 + bob, 1, 1);
    g.fillStyle(0xc3817b).fillRect(17, 13 + bob, 1, 1);
    g.fillStyle(S.edge).fillRect(11, 10 + bob, 1, 2);
    g.fillStyle(H.edge).fillRect(10, 6 + bob, 4, 2).fillRect(10, 8 + bob, 2, 2);
    g.fillStyle(H.base).fillRect(10, 10 + bob, 1, 7);
  } else {
    silhouette(g, 6, 5 + bob, [[5,2,1],[4,4,1],[2,8,1],[0,12,5],[1,10,1],[2,8,1],[4,4,1]]);
    g.fillStyle(S.base); silhouette(g, 7, 7 + bob, [[2,6,1],[0,10,4],[1,8,2],[3,4,1]]);
    g.fillStyle(S.light).fillRect(10, 8 + bob, 4, 2);
    for (const x of [7,14]) {
      g.fillStyle(H.edge).fillRect(x, 9 + bob, 3, 1).fillRect(x + 1, 10 + bob, 2, 2);
      g.fillStyle(0x9d7b63).fillRect(x + 1, 11 + bob, 1, 1);
      g.fillStyle(T.light).fillRect(x + 1, 10 + bob, 1, 1);
    }
    g.fillStyle(0xc3817b).fillRect(11, 13 + bob, 2, 1);
    g.fillStyle(H.edge).fillRect(6, 6 + bob, 4, 1).fillRect(6, 7 + bob, 2, 1)
      .fillRect(14, 6 + bob, 4, 1).fillRect(16, 7 + bob, 2, 1);
  }
  if (direction === 'down' || direction === 'right') {
    const [x, y] = CHIBI_MARK[direction];
    g.fillStyle(PROTAGONIST_BLUSH_ACCENT).fillRect(x, y + bob + 1, 1, 1);
  }
}

export function drawChibiProtagonist(g: Phaser.GameObjects.Graphics, direction: FacingDirection,
  phase: ProtagonistPhase, sprint = false, hairstyle: PlayerHairstyle = 'loose', seated = false): void {
  const p = Object.create(g) as Phaser.GameObjects.Graphics;
  p.fillStyle = (color: number, alpha?: number) => { g.fillStyle(color,alpha); return p; };
  p.fillRect = (x:number,y:number,w:number,h:number) => {
    g.fillRect(direction === 'left' ? 24-x-w : x,y,w,h); return p;
  };
  const side = direction === 'left' || direction === 'right';
  const back = direction === 'up';
  const bob = phase.startsWith('step') ? -2 : -1;
  const swing = phase === 'step-a' ? -1 : phase === 'step-b' ? 1 : 0;
  lowerBody(p,side,phase,sprint,seated);
  longHair(p,side,back,bob,phase,hairstyle==='ponytail');
  p.fillStyle(S.edge).fillRect(side?12:9,20,side?5:7,1);
  p.fillStyle(S.base).fillRect(side?13:10,20,side?3:5,1);
  // Fitted short-sleeve tee: a small waist, separate sleeves, no hood/collar mass.
  p.fillStyle(T.edge); silhouette(p,side?11:8,16+bob,[[2,5,1],[0,side?7:8,2],[1,side?5:6,3]]);
  p.fillStyle(T.base).fillRect(side?12:9,17+bob,side?5:6,3);
  p.fillStyle(T.light).fillRect(side?14:10,18+bob,3,2);
  p.fillStyle(S.edge).fillRect(side?13:10,14+bob,4,2);
  p.fillStyle(S.base).fillRect(side?14:11,15+bob,2,1);
  for (const x of (side ? [12] : [6,16])) {
    const shift = swing*(side ? 1 : x<12 ? 1 : -1)*(sprint?2:1);
    const handY=22+bob-(sprint?1:0);
    clothLimb(p,x,18+bob,x+shift,handY,3,2,S);
    p.fillStyle(T.edge).fillRect(x,16+bob,3,3);
    p.fillStyle(T.base).fillRect(x,17+bob,3,1);
    p.fillStyle(T.light).fillRect(x,16+bob,2,1);
  }
  if (!back) {
    p.fillStyle(0x625459).fillRect(side?16:10,16+bob,1,1).fillRect(side?16:13,16+bob,1,1);
    p.fillStyle(0x625459).fillRect(side?16:11,17+bob,2,2);
    p.fillStyle(0xd4c2a4).fillRect(side?16:12,17+bob,1,1);
  } else {
    // Rear hair lies over the tee, without hiding the exposed lower legs.
    p.fillStyle(H.base); silhouette(p,7,14+bob,[[0,10,5],[1,8,2],[3,4,1]]);
    p.fillStyle(H.edge).fillRect(11,18+bob,1,4);
  }
  drawChibiHead(p,direction,bob+1);
  if (!back) p.fillStyle(S.base).fillRect(side?14:11,15+bob,2,1);
}
