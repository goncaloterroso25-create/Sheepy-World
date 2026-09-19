import type Phaser from 'phaser';
import type { FacingDirection } from '../entities/playerAnimations';
import type { ProtagonistPhase } from './protagonistSprites';
import { createPixelTexture } from './textureFactory';

// Hand-authored pixel clusters from the purple-shirt turnaround. No previous
// Goncalo body/head template is retained. 24x32, sole row 31, same frame keys.
export const GONCALO_COLORS = {
  hair: 0x946642, hairLight: 0xc19360, hairEdge: 0x4c352c,
  skin: 0xf0bb99, skinLight: 0xffd3af, skinEdge: 0xc78d70,
  glasses: 0x24212a, eye: 0x795238, lens: 0xf0e6dc,
  shirt: 0x534165, shirtEdge: 0x302638, shirtLight: 0x735880,
  graphic: 0xe6ddc4, denim: 0x536f94, denimEdge: 0x303d56,
  denimLight: 0x8495ac, sneaker: 0xf5efe5,
} as const;
const C = GONCALO_COLORS;
const INKS: Record<string, number> = {
  o:C.hairEdge, h:C.hair, H:C.hairLight, b:0x73503a,
  a:C.skinEdge, s:C.skin, l:C.skinLight, m:0x684632, r:0x553529,
  k:C.glasses, w:C.lens, e:C.eye, Q:C.shirtEdge, T:C.shirt,
  U:C.shirtLight, V:0x42344f, W:C.graphic,
  d:C.denimEdge, j:C.denim, J:C.denimLight, n:0x677e9e,
  f:C.sneaker, c:0xbfb6ba,
};
const DIRECTIONS: readonly FacingDirection[] = ['down','up','left','right'];
const PHASES: readonly ProtagonistPhase[] = ['idle','step-a','pass-a','step-b','pass-b'];

// Spaces group locks/lenses for editing; dots are transparent.
const FRONT = [
  '...ooo.oo.....',
  '..ohHhohhoo...',
  '.ohHHhobHHho..',
  'ohHHhossbHHho.',
  'oh s rrr ss rrr s ho',
  'hh a ssssssss a hh',
  'Hh kkkk ss kkkk hH',
  'oh kwek kk kewk ho',
  'hh kkkk ss kkkk hh',
  'hb ass mmmm ssa bh',
  'oh ha ssasss ah ho',
  'hh oHha mm ahHo hh',
  'bhh Hha mm ahH hhb',
];
const PROFILE = [
  '....oo.oo....',
  '...ohhhhoo...',
  '..ohhHHHhho..',
  '.ohhHHhhHhho.',
  'ohHHhhoo srrr .',
  'oHHhhoo sllla .',
  'oHhho ass kkkk .',
  'ohhho hkk kwek a',
  'hhbho hos kkkk s',
  'ohhho has sssa a',
  'hHhho ass ssmm .',
  '.ohhb .as sssa .',
  'ohHho ..a mmm. .',
];
const BACK = [
  '....oo.oo.....',
  '..oohhohhoo...',
  '..ohHHobhHho..',
  '.ohHHhobhHHho.',
  'ohHHhobhHHhhho',
  'ohHhobhhHHhbho',
  'ohhobHhhHhbhho',
  '.ohobHhhhbHho.',
  'ohhbHhhhobHhho',
  '.ohhHhhobhHho.',
  '..ohhhobhhHho.',
  '.ohhhobhhHhho.',
  '..ohhobhhHho..',
];
const FRONT_ENDS = [
  'bhhoh....hohhb',
  'ohhHh....hHhho',
  '.ohHh....hHho.',
  '..ohh....hho..',
  '...o......o...',
];
const SIDE_ENDS = [
  'ohHhho.',
  '.ohHhho',
  'ohhhho.',
  '.ohHho.',
  '..ohho.',
  '...oh..',
];
const BACK_ENDS = [
  'ohhbHhhobHhho',
  '.ohHhhobHhho.',
  '..ohhobhHho..',
  '...ohhhho....',
  '....ohho.....',
];
const TEE_FRONT = [
  '..QTTTTQ..',
  '.QTUTTUTQ.',
  'QTWWTWTTTQ',
  'QTTWWWWTTQ',
  'QTWTWTTWTQ',
  'QTTWTTTWTQ',
  'QTTWTTWTTQ',
  'QTTTTTTTVQ',
  '.QTTTTTVQ.',
];
const TEE_BACK = [
  '..QTTTTQ..',
  '.QTUTTUTQ.',
  'QTTUTTTUTQ',
  'QTTUTTTUTQ',
  'QTTTTTTUTQ',
  'QTUTTTTUTQ',
  'QTTUTTTTVQ',
  'QTTTTTTVVQ',
  '.QTTTTTVQ.',
];
const TEE_SIDE = [
  '..QTTQ..',
  '.QTTTTQ.',
  'QTTUTTWQ',
  'QTTUTWWQ',
  'QTTUTTWQ',
  'QTTTTTWQ',
  'QTTTTW TQ',
  'QTTTTVTQ',
  '.QTTTVQ.',
];

function pixels(g: Phaser.GameObjects.Graphics, x: number, y: number,
  rows: readonly string[], bob = 0): void {
  rows.forEach((row, dy) => [...row.replaceAll(' ', '')].forEach((ink, dx) => {
    if (ink !== '.') g.fillStyle(INKS[ink]!).fillRect(x + dx, Math.max(0, y + dy + bob), 1, 1);
  }));
}

function jeans(g: Phaser.GameObjects.Graphics, side: boolean, phase: ProtagonistPhase, sprint: boolean): void {
  const step=phase==='step-a'?-1:phase==='step-b'?1:0;
  const pass=phase==='pass-a'?-1:phase==='pass-b'?1:0;
  for(const [i, hip] of (side?[10,12]:[7,12]).entries()) {
    const dx=side?step*(sprint?2:1)*(i===0?1:-1):0;
    const lift=i===0?step>0||pass<0:step<0||pass>0;
    const foot=30-(lift?(sprint&&step!==0?2:1):0);
    for(let y=20;y<foot;y++) {
      const x=hip+Math.round(dx*(y-20)/Math.max(1,foot-20));
      // Broad fabric columns with restrained vertical folds and ankle stacking.
      const folds=['dnJjd','djJjd','djnjd','dJnjd','dnJjd','djjnd','djnJd','dnJjd','djjnd','djjjd'];
      pixels(g,x,y,[folds[y-20]!]);
    }
    const x=hip+dx;
    g.fillStyle(C.denimEdge).fillRect(x-(i===0?1:0),foot-1,6,1);
    g.fillStyle(C.denim).fillRect(x,foot-1,4,1);
    pixels(g,x,foot,['kcffk','kfffk']);
  }
}

export function goncaloTextureKey(direction: FacingDirection, phase: ProtagonistPhase='idle', sprint=false): string {
  return `goncalo-${sprint&&phase!=='idle'?'sprint-':''}${direction}-${phase}`;
}

export function drawGoncaloSprite(g: Phaser.GameObjects.Graphics, direction: FacingDirection,
  phase: ProtagonistPhase, sprint=false): void {
  const p=Object.create(g) as Phaser.GameObjects.Graphics;
  p.fillStyle=(color:number,alpha?:number)=>{g.fillStyle(color,alpha);return p;};
  p.fillRect=(x:number,y:number,w:number,h:number)=>{
    g.fillRect(direction==='left'?24-x-w:x,y,w,h);return p;
  };
  const side=direction==='left'||direction==='right', back=direction==='up';
  const bob=phase.startsWith('step')?-1:0;
  const swing=phase==='step-a'?-1:phase==='step-b'?1:0;
  jeans(p,side,phase,sprint);
  pixels(p,side?10:7,13,side?TEE_SIDE:back?TEE_BACK:TEE_FRONT,bob);
  // Elbow-length sleeves sit outside the torso; narrow bare forearms emerge.
  for(const [x,sign] of (side?[[12,1]]:[[6,1],[16,-1]])) {
    const shift=swing*sign!*(sprint?2:1);
    for(let y=17;y<=22-(sprint?1:0);y++) {
      pixels(p,x!+Math.round(shift*(y-17)/5),y+bob,['as']);
    }
    pixels(p,x!-1,14,['.QQ.','QTUQ','QTUQ','QVTQ'],bob);
  }
  pixels(p,side?14:10,11,['ass a','ass a','QssQ'],bob);
  if(side) {
    pixels(p,7,12,SIDE_ENDS,bob);
    pixels(p,7,0,PROFILE,bob);
  } else {
    pixels(p,back?6:5,12,back?BACK_ENDS:FRONT_ENDS,bob);
    pixels(p,5,0,back?BACK:FRONT,bob);
  }
}

export function createGoncaloTextures(scene: Phaser.Scene): void {
  for(const direction of DIRECTIONS) for(const phase of PHASES) {
    createPixelTexture(scene,goncaloTextureKey(direction,phase),24,32,
      g=>drawGoncaloSprite(g,direction,phase));
    if(phase!=='idle') createPixelTexture(scene,goncaloTextureKey(direction,phase,true),24,32,
      g=>drawGoncaloSprite(g,direction,phase,true));
  }
}
