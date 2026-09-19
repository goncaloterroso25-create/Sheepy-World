import type Phaser from 'phaser';
import type { FacingDirection, PlayerHairstyle, PlayerOutfit } from '../entities/playerAnimations';
import { silhouette, clothLimb, shoe } from './humanPixelGrammar';
import { drawChibiProtagonist, drawChibiHead } from './protagonistChibi';

export type ProtagonistPhase = 'idle' | 'step-a' | 'pass-a' | 'step-b' | 'pass-b';
export const WINTER_RED = 0xb84d4d;
const COAT = { edge: 0x25232e, base: 0x363240, light: 0x504957 };
const DENIM = { edge: 0x303b58, base: 0x46577c, light: 0x65759a };
const SCARF = { edge: 0xb8a89b, base: 0xe8dbc6, light: 0xfff3df };
const HAIR = { edge: 0x231f28, base: 0x342e38, light: 0x51444f };

// Native Snow art only. Canvas 24×32; sole row 31, center x12. Existing
// texture keys, stride clock, collider and carry anchors stay intact.
function winterLegs(g: Phaser.GameObjects.Graphics, side: boolean, phase: ProtagonistPhase, sprint: boolean): void {
  const step = phase === 'step-a' ? -1 : phase === 'step-b' ? 1 : 0;
  const pass = phase === 'pass-a' ? -1 : phase === 'pass-b' ? 1 : 0;
  for (const [i, hip] of (side ? [10,13] : [7,13]).entries()) {
    const x = hip + (side ? step * (sprint ? 2 : 1) * (i===0 ? 1 : -1) : 0);
    const lift = i===0 ? step>0 || pass<0 : step<0 || pass>0;
    const foot = 30 - (lift ? (sprint && step!==0 ? 2 : 1) : 0);
    clothLimb(g,hip,22,x,foot-1,5,5,DENIM);
    shoe(g,x,foot,5,0x56505c);
  }
  g.fillStyle(DENIM.base).fillRect(side?11:10,22,5,2);
  if (!side) g.fillStyle(DENIM.edge).fillRect(12,25,1,3);
}

function winterHood(g: Phaser.GameObjects.Graphics, direction: FacingDirection, bob: number): void {
  // Identical face/eye/cheek drawing to the approved normal character. The
  // coat's hood is an outer rim; it never repaints her eyes or cheek mark.
  drawChibiHead(g,direction,bob+1);
  const back=direction==='up', side=direction==='left'||direction==='right';
  if (back) {
    g.fillStyle(COAT.edge);
    silhouette(g,3,2+bob,[[6,6,1],[4,10,1],[2,14,2],[1,16,2],[0,18,4],[1,16,2],[3,12,1]]);
    g.fillStyle(COAT.base);
    silhouette(g,5,3+bob,[[4,6,1],[2,10,3],[1,12,5],[2,10,2]]);
    g.fillStyle(COAT.light).fillRect(9,4+bob,5,1).fillRect(6,7+bob,2,2);
    g.fillStyle(COAT.edge).fillRect(9,11+bob,7,1).fillRect(7,12+bob,2,1).fillRect(16,12+bob,2,1);
    return;
  }
  g.fillStyle(COAT.edge);
  silhouette(g,3,2+bob,[[6,6,1],[4,10,1],[2,14,1]]);
  g.fillRect(side?5:3,6+bob,2,6).fillRect(side?6:4,5+bob,2,2)
    .fillRect(19,6+bob,2,6).fillRect(18,5+bob,2,2)
    .fillRect(side?6:4,12+bob,2,2).fillRect(side?19:18,12+bob,2,2);
  g.fillStyle(COAT.base).fillRect(7,3+bob,10,1).fillRect(5,4+bob,3,1)
    .fillRect(17,4+bob,2,2).fillRect(side?6:4,7+bob,1,5).fillRect(19,7+bob,1,5);
  g.fillStyle(COAT.light).fillRect(8,3+bob,4,1).fillRect(5,5+bob,1,2);
  if (side) {
    // Cloth rear panel follows the same rounded skull rather than a separate
    // bulge; leave the normal face and its small hair-framing lock exposed.
    g.fillStyle(COAT.base).fillRect(7,7+bob,2,5);
    g.fillStyle(COAT.light).fillRect(7,8+bob,1,2);
  }
}

function winterScarf(g: Phaser.GameObjects.Graphics, side: boolean, back: boolean,
  bob: number, phase: ProtagonistPhase): void {
  const tailX=side?7:back?6:16;
  const sway=phase==='pass-b'?1:0;
  // Low broad wrap beneath the chin; the hanging end stays away from the red
  // opening. A two-pixel fringe is enough at this scale.
  g.fillStyle(SCARF.edge);
  silhouette(g,5,15+bob,[[2,12,1],[0,15,2],[2,12,1],[4,8,1]]);
  g.fillStyle(SCARF.base).fillRect(7,15+bob,11,2).fillRect(7,17+bob,10,1);
  g.fillStyle(SCARF.light).fillRect(7,15+bob,10,1).fillRect(8,17+bob,8,1);
  g.fillStyle(SCARF.edge).fillRect(tailX,18+bob,4,6);
  g.fillStyle(SCARF.base).fillRect(tailX+1,18+bob,2,6);
  g.fillStyle(SCARF.light).fillRect(tailX+1,19+bob,1,3);
  g.fillStyle(SCARF.base).fillRect(tailX+sway,24+bob,1,1).fillRect(tailX+2,24+bob,1,2);
  // Hair visible below the hood and across the scarf, as in the reference.
  g.fillStyle(HAIR.edge);
  if (back) {
    silhouette(g,11,13+bob,[[0,4,5],[0,4,3],[1,3,2],[1,2,1]]);
    g.fillStyle(HAIR.light).fillRect(12,17+bob,1,3);
  } else if (side) {
    g.fillRect(9,13+bob,2,7).fillRect(10,20+bob,1,2);
    g.fillStyle(HAIR.base).fillRect(9,16+bob,1,4);
  } else {
    g.fillRect(6,14+bob,2,6).fillRect(7,20+bob,1,2).fillRect(18,13+bob,1,3);
    g.fillStyle(HAIR.base).fillRect(7,16+bob,1,4);
  }
}

function drawSnow(g: Phaser.GameObjects.Graphics, direction: FacingDirection,
  phase: ProtagonistPhase, sprint: boolean): void {
  const p=Object.create(g) as Phaser.GameObjects.Graphics;
  p.fillStyle=(color:number,alpha?:number)=>{g.fillStyle(color,alpha);return p;};
  p.fillRect=(x:number,y:number,w:number,h:number)=>{
    g.fillRect(direction==='left'?24-x-w:x,y,w,h);return p;
  };
  const side=direction==='left'||direction==='right', back=direction==='up';
  const bob=phase.startsWith('step')?-2:-1;
  const swing=phase==='step-a'?-1:phase==='step-b'?1:0;
  winterLegs(p,side,phase,sprint);
  p.fillStyle(COAT.edge);
  silhouette(p,side?8:6,15+bob,[[2,side?7:9,1],[1,side?9:11,3],[0,side?11:13,3],[1,side?9:11,3]]);
  p.fillStyle(COAT.base).fillRect(side?10:8,18+bob,side?7:9,5);
  const redX=side?16:back?9:10;
  p.fillStyle(WINTER_RED).fillRect(redX,back?23+bob:19+bob,side?3:back?9:5,back?2:6);
  p.fillStyle(0x873743).fillRect(redX,24+bob,side?3:back?9:5,1);
  if (side) {
    const handX=11+swing*(sprint?2:1);
    clothLimb(p,11,18+bob,handX,22+bob,4,3,COAT);
    p.fillStyle(COAT.edge).fillRect(handX,23+bob,3,1);
  } else {
    for(const [x,sign] of [[4,1],[17,-1]]) {
      const handX=x!+swing*sign!*(sprint?2:1);
      clothLimb(p,x!,17+bob,handX,22+bob,4,3,COAT);
      p.fillStyle(COAT.edge).fillRect(handX,23+bob,3,1);
    }
  }
  winterHood(p,direction,bob);
  winterScarf(p,side,back,bob,phase);
}

export function drawProtagonistSprite(g: Phaser.GameObjects.Graphics, direction: FacingDirection,
  phase: ProtagonistPhase, outfit: PlayerOutfit = 'normal', sprint = false, hairstyle: PlayerHairstyle = 'loose'): void {
  if (outfit === 'normal') drawChibiProtagonist(g,direction,phase,sprint,hairstyle);
  else drawSnow(g,direction,phase,sprint);
}

export function drawProtagonistSeated(g: Phaser.GameObjects.Graphics): void {
  drawChibiProtagonist(g,'down','idle',false,'loose',true);
}
