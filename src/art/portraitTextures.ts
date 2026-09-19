import type Phaser from 'phaser';
import { createPixelTexture } from './textureFactory';
import { PALETTE as P } from './palette';
import { drawProtagonistPortrait } from './protagonistPortrait';
import { drawRecurringPortrait } from './recurringNpcArt';

type PortraitExpression = 'neutral' | 'warm' | 'amused' | 'serious';
interface PortraitLook { id: string; skin: number; hair: number; coat: number; shirt: number;
  style: 'crop' | 'curl' | 'long' | 'bun' | 'waves'; beard?: boolean; necklace?: boolean; }

const LOOKS: readonly PortraitLook[] = [
  { id:'jane',skin:0xe5b38d,hair:0xc49a68,coat:0x373a42,shirt:0xe6e4dc,style:'curl' },
  { id:'lisbon',skin:0xdca079,hair:0x2a2026,coat:0x2e3139,shirt:0x753b50,style:'long',necklace:true },
  { id:'astarion',skin:0xefcfbd,hair:0xe7e3ea,coat:0x652c50,shirt:0x2f3545,style:'curl' },
  { id:'shadowheart',skin:0xe0b18f,hair:0x211e2a,coat:0x68717f,shirt:0x4c354f,style:'long' },
  { id:'daenerys',skin:0xe9c0a2,hair:0xe8e2d4,coat:0x2b6f99,shirt:0x214b6b,style:'waves' },
  { id:'tyrion',skin:0xdfae87,hair:0x8a623d,coat:0x703947,shirt:0xb08a58,style:'curl',beard:true },
  { id:'castiel',skin:0xdfb18c,hair:0x43362e,coat:0xc3aa78,shirt:0xe1dfd7,style:'crop' },
  { id:'dean',skin:0xdfad88,hair:0x524439,coat:0x343d3b,shirt:0x242831,style:'crop' },
  { id:'sam',skin:0xe3b895,hair:0x49342d,coat:0x726651,shirt:0x493e3d,style:'long' },
  { id:'grandma',skin:0xdfb28d,hair:0x2c211f,coat:0x765d78,shirt:0xc69b7d,style:'bun' },
  { id:'sister',skin:0xdfad8b,hair:0x2c2228,coat:0x596b73,shirt:0x9a6b76,style:'long' },
  { id:'protagonist',skin:P.skin,hair:P.jetHair,coat:P.blackCloth,shirt:P.blackCloth,style:'waves' },
  { id:'traveller',skin:0xc98966,hair:0x2a2730,coat:0x426d72,shirt:0xd4a25b,style:'bun' },
] as const;

function portrait(g: Phaser.GameObjects.Graphics, look: PortraitLook, expression: PortraitExpression): void {
  if (look.id === 'protagonist') { drawProtagonistPortrait(g, expression === 'warm'); return; }
  if (look.id === 'grandma' || look.id === 'jane' || look.id === 'lisbon') {
    drawRecurringPortrait(g, look.id, expression !== 'neutral'); return;
  }
  g.fillStyle(0x282536).fillRect(0,0,64,72);
  g.fillStyle(0x3b3447).fillRect(3,3,58,66);
  g.fillStyle(look.coat).fillRect(8,52,48,20).fillRect(3,62,58,10);
  g.fillStyle(look.shirt).fillRect(25,52,14,20);
  g.fillStyle(look.skin).fillRect(20,17,25,34).fillRect(26,49,13,8);
  g.fillStyle(0xf4c8a3,.55).fillRect(23,22,5,20);
  g.fillStyle(look.hair).fillRect(17,11,31,12).fillRect(15,18,7,25);
  if (look.style === 'long' || look.style === 'waves') g.fillStyle(look.hair).fillRect(43,19,8,39).fillRect(13,30,7,27);
  if (look.style === 'curl') for (const [x,y] of [[15,17],[18,10],[27,7],[37,8],[44,12],[47,20]]) g.fillStyle(look.hair).fillRect(x!,y!,10,10);
  if (look.style === 'bun') g.fillStyle(look.hair).fillRect(37,5,14,13).fillRect(16,12,28,9);
  if (look.style === 'waves') for(let y=18;y<48;y+=9) g.fillStyle(0xffffff,.13).fillRect(15,y,5,3).fillRect(44,y+3,6,3);
  g.fillStyle(0x322735).fillRect(25,32,4,2).fillRect(37,32,4,2);
  if (expression === 'serious') g.fillStyle(0x322735).fillRect(24,28,6,2).fillRect(36,28,6,2);
  if (expression === 'amused') g.fillStyle(0x322735).fillRect(24,29,6,1).fillRect(36,27,6,2);
  g.fillStyle(0x54343a).fillRect(32,42,5,2);
  if (expression === 'warm' || expression === 'amused') g.fillRect(29,41,3,1).fillRect(37,41,3,1).fillRect(31,44,7,1);
  if (look.beard) g.fillStyle(look.hair).fillRect(24,42,19,8).fillRect(28,50,11,3);
  if (look.necklace) g.fillStyle(0xd6c6a2).fillRect(32,54,2,8).fillRect(30,60,6,2);
  g.fillStyle(0xffffff,.16).fillRect(8,54,3,16).fillRect(22,18,2,11);
}

export function createPortraitTextures(scene: Phaser.Scene): void {
  for (const look of LOOKS) {
    createPixelTexture(scene, `portrait-${look.id}`, 64, 72, g => portrait(g, look, 'neutral'));
  }
  for (const [id, expression] of [['jane','amused'],['lisbon','serious'],['protagonist','warm'],['grandma','warm']] as const) {
    const look = LOOKS.find(entry => entry.id === id)!;
    createPixelTexture(scene, `portrait-${id}-${expression}`, 64, 72, g => portrait(g, look, expression));
  }
}
