import type Phaser from 'phaser';
import { createPixelTexture } from './textureFactory';
import { drawJaneProof } from './humanSpriteProofs';
import { drawGrandma, drawLisbon } from './recurringNpcArt';
import { createGoncaloTextures } from './goncaloSprites';

export interface PersonLook { id: string; skin: number; hair: number; coat: number; height: number; width: number;
  hairStyle: 'crop' | 'long' | 'curl' | 'bun' | 'bald'; hat?: number; skirt?: boolean; beard?: boolean; bag?: boolean; apron?: boolean }
export const PEOPLE_LOOKS: readonly PersonLook[] = [
  { id: 'beret', skin: 0xe5ae88, hair: 0x45332f, coat: 0x746a79, height: 31, width: 12, hairStyle: 'crop', hat: 0x803e43 },
  { id: 'braid', skin: 0xb77754, hair: 0x292330, coat: 0x3e7776, height: 34, width: 10, hairStyle: 'long', skirt: true },
  { id: 'stout', skin: 0xd19a77, hair: 0x614132, coat: 0x8b6b42, height: 29, width: 16, hairStyle: 'crop', beard: true },
  { id: 'reader', skin: 0xefc99c, hair: 0x743d32, coat: 0x796389, height: 33, width: 11, hairStyle: 'bun', bag: true },
  { id: 'elder', skin: 0xdca27e, hair: 0xd7d2c5, coat: 0x5d6d67, height: 30, width: 12, hairStyle: 'bald', beard: true },
  { id: 'apron', skin: 0x945c43, hair: 0x252332, coat: 0x8a5364, height: 32, width: 14, hairStyle: 'bun', apron: true },
  { id: 'tall', skin: 0xd59c70, hair: 0x433126, coat: 0x456375, height: 37, width: 10, hairStyle: 'crop', bag: true },
  { id: 'curl', skin: 0xb47f58, hair: 0x34272b, coat: 0xaa7445, height: 31, width: 13, hairStyle: 'curl' },
  { id: 'bonnet', skin: 0xe3b393, hair: 0x5a433a, coat: 0x746875, height: 29, width: 15, hairStyle: 'long', hat: 0xd4c1a4, skirt: true },
  { id: 'cap', skin: 0xbb805d, hair: 0x613e2b, coat: 0x76674c, height: 32, width: 12, hairStyle: 'crop', hat: 0x526850 },
  { id: 'waistcoat', skin: 0xedbd99, hair: 0x292532, coat: 0x713e47, height: 35, width: 14, hairStyle: 'bald', beard: true, apron: true },
  { id: 'shawl', skin: 0xb98064, hair: 0xb1a18d, coat: 0x447a71, height: 30, width: 12, hairStyle: 'bun', skirt: true, bag: true },
];
export const CAMEO_KEYS = ['astarion', 'shadowheart', 'daenerys', 'tyrion', 'dean', 'sam', 'grandma', 'jane', 'lisbon', 'sister'] as const;

function drawPerson(g: Phaser.GameObjects.Graphics, p: PersonLook, frame: number): void {
  const x = Math.floor((28-p.width)/2), top = 40-p.height, head = top+2;
  g.fillStyle(0x272331).fillRect(x+1,35+(frame ? 1 : 0),5,4).fillRect(x+p.width-6,35-(frame ? 1 : 0),5,4);
  g.fillStyle(0x393644).fillRect(x+2,top+19,4,17-(top+1)).fillRect(x+p.width-6,top+19,4,17-(top+1));
  g.fillStyle(p.coat).fillRect(x,top+11,p.width, p.skirt ? 22-top : 16);
  g.fillStyle(0x201f2b,.35).fillRect(x,top+13,1,13).fillRect(x+p.width-1,top+13,1,13)
    .fillRect(x+Math.floor(p.width/2),top+15,1,11);
  g.fillStyle(0xe4d3b8,.4).fillRect(x+3,top+13,3,1).fillRect(x+p.width-5,top+13,2,1);
  if (p.skirt) g.fillRect(x-2,top+23,p.width+4,11-top);
  g.fillStyle(p.skin).fillRect(9,head+2,10,9).fillRect(x-2,top+22+frame,3,4).fillRect(x+p.width-1,top+21-frame,3,4);
  g.fillStyle(p.hair).fillRect(8,head,12,4);
  if (p.hairStyle === 'long') g.fillRect(7,head+3,3,16).fillRect(18,head+3,3,16);
  if (p.hairStyle === 'curl') for (const [dx,dy] of [[6,3],[8,-1],[12,-2],[17,0],[19,4]]) g.fillRect(dx!,head+dy!,4,5);
  if (p.hairStyle === 'bun') g.fillRect(15,head-3,6,5).fillRect(18,head+2,2,9);
  if (p.hairStyle === 'bald') { g.fillStyle(p.skin).fillRect(10,head,8,4); g.fillStyle(p.hair).fillRect(7,head+5,2,4); }
  if (p.beard) g.fillStyle(p.hair).fillRect(10,head+9,8,3).fillRect(12,head+12,4,2);
  if (p.hat) g.fillStyle(p.hat).fillRect(6,head-1,16,3).fillRect(8,head-4,11,4);
  g.fillStyle(0x242332).fillRect(11,head+6,1,1).fillRect(16,head+6,1,1);
  g.fillStyle(0x8d584e,.5).fillRect(14,head+7,1,2).fillRect(13,head+10,3,1);
  if(p.hairStyle!=='bald')g.fillStyle(0xffffff,.15).fillRect(10,head+1,5,1).fillRect(8,head+3,2,1);
  g.fillStyle(0xffffff,.18).fillRect(x+2,top+12,2,10);
  if (p.apron) g.fillStyle(0xc7b698).fillRect(x+3,top+15,p.width-6,13);
  if (p.bag) { g.fillStyle(0x533b36).fillRect(x+p.width-1,top+15,6,9); g.fillStyle(0xbe946b).fillRect(x+p.width,top+14,4,2); }
}

export function createPeopleTextures(scene: Phaser.Scene): void {
  createPixelTexture(scene,'item-keepsake-badge',24,28,g=>{
    g.fillStyle(0x3b657b).fillRect(9,0,6,8);
    g.fillStyle(0x74665d).fillRect(1,6,22,19);
    g.fillStyle(0xf4eddf).fillRect(2,7,20,17);
    g.fillStyle(0x3b657b).fillRect(14,9,6,2).fillRect(12,13,8,1).fillRect(12,16,6,1);
    g.fillStyle(0x25242e).fillRect(4,11,6,9);
    g.fillStyle(0xe3a179).fillRect(5,13,4,4);
    g.fillStyle(0x25242e).fillRect(5,14,4,1);
    g.fillStyle(0xc9b9a1).fillRect(4,21,16,1);
  });
  createGoncaloTextures(scene);
  for (const look of PEOPLE_LOOKS) for (const frame of [0,1]) createPixelTexture(scene, `person-${look.id}-${frame}`, 28, 40, g => drawPerson(g,look,frame));
  for(const look of PEOPLE_LOOKS)createPixelTexture(scene,`person-${look.id}-back`,28,40,g=>{
    drawPerson(g,look,0);
    const y=44-look.height;
    g.fillStyle(look.hair).fillRect(9,y,10,10);
    g.fillStyle(0xffffff,.13).fillRect(10,y+1,4,2);
    if(look.hairStyle==='bald')g.fillStyle(look.skin).fillRect(10,y,8,7);
    if(look.hat)g.fillStyle(look.hat).fillRect(7,y,14,3);
    g.fillStyle(look.coat).fillRect(11,y+10,7,3);
  });
  const looks: PersonLook[] = [
    { id:'astarion',skin:0xf1d5c0,hair:0xe9e5e9,coat:0x652c50,height:36,width:12,hairStyle:'curl' },
    { id:'shadowheart',skin:0xe2bb9e,hair:0x252130,coat:0x767d89,height:35,width:12,hairStyle:'bun' },
    { id:'daenerys',skin:0xeac3a6,hair:0xe9e3d4,coat:0x276a98,height:35,width:10,hairStyle:'long',skirt:true },
    { id:'tyrion',skin:0xe3b28d,hair:0x8b653c,coat:0x713944,height:26,width:13,hairStyle:'curl',beard:true },
    { id:'dean',skin:0xddad88,hair:0x544637,coat:0x3d4643,height:33,width:14,hairStyle:'crop' },
    { id:'sam',skin:0xe3b895,hair:0x5d4032,coat:0x84775e,height:38,width:13,hairStyle:'long' },
    { id:'grandma',skin:0xe0b692,hair:0x2c211f,coat:0x77607b,height:28,width:15,hairStyle:'bun',skirt:true },
    { id:'jane',skin:0xe5b38d,hair:0xc49a68,coat:0x3b3c43,height:36,width:12,hairStyle:'curl' },
    { id:'lisbon',skin:0xdca079,hair:0x292027,coat:0x303239,height:34,width:11,hairStyle:'long' },
    { id:'sister',skin:0xdfad8b,hair:0x2c2228,coat:0x596b73,height:32,width:12,hairStyle:'long' },
  ];
  for (const look of looks) for (const frame of [0,1]) createPixelTexture(scene, `cameo-${look.id}-${frame}`,28,40,g => {
    if (look.id === 'jane') { drawJaneProof(g, frame); return; }
    if (look.id === 'grandma') { drawGrandma(g, frame); return; }
    if (look.id === 'lisbon') { drawLisbon(g, frame); return; }
    drawPerson(g,look,frame);
    if (look.id === 'astarion') {
      g.fillStyle(0xbe9858).fillRect(9,15,2,15).fillRect(17,15,2,15).fillRect(10,27,8,2);
      for (const [x,y] of [[6,16],[19,17],[6,22],[18,23]]) g.fillRect(x!,y!,3,1).fillRect(x!+1,y!-1,1,3);
      g.fillStyle(look.skin).fillRect(6,11,3,2).fillRect(19,11,3,2);
    }
    if (look.id === 'shadowheart') {
      g.fillStyle(0xc4c8d0).fillRect(6,16,5,5).fillRect(18,16,5,5).fillRect(12,18,5,5);
      g.fillStyle(0x543952).fillRect(11,25,8,10); g.fillStyle(0xd5c3a0).fillRect(14,26,1,9);
      g.fillStyle(0x302532).fillRect(19,7,3,18).fillRect(18,22,2,6);
    }
    if (look.id === 'daenerys') {
      g.fillStyle(0x7a393b).fillRect(20,14,6,5).fillRect(23,19,2,7).fillRect(17,12,6,2).fillRect(25,11,2,5);
      g.fillStyle(0xc69b52).fillRect(22,14,1,1);
    }
    if (look.id === 'tyrion') {
      g.fillStyle(0xc9a258).fillRect(18,25-frame*4,6,4).fillRect(21,28-frame*4,1,4).fillRect(19,32-frame*4,5,1);
    }
  });
  createPixelTexture(scene,'item-hydromel-cup',20,24,g => {
    g.fillStyle(0x252c31).fillRect(4,4,13,16).fillRect(2,6,3,9).fillRect(1,7,2,6);
    g.fillStyle(0x697078).fillRect(5,3,11,2); g.fillStyle(0xc09866).fillRect(5,19,12,2);
    g.fillStyle(0x998979).fillRect(10,6,2,11).fillRect(6,9,9,1).fillRect(7,13,8,1).fillRect(7,7,1,9);
  });
  createPixelTexture(scene,'item-hunger-games',20,24,g => {
    g.fillStyle(0x26304d).fillRect(3,2,15,20); g.fillStyle(0xccc8a5).fillRect(2,3,2,18);
    g.fillStyle(0xe5b653).fillRect(8,7,6,5).fillRect(6,5,2,8).fillRect(5,14,11,1).fillRect(13,12,2,3);
    g.fillStyle(0xd4d0bf).fillRect(7,18,8,1);
  });
  createPixelTexture(scene,'item-hollow-shirt',24,24,g => {
    g.fillStyle(0x242433).fillRect(5,4,14,18).fillRect(1,5,4,7).fillRect(19,5,4,7);
    g.fillStyle(0xe3e0ef).fillRect(8,10,8,7).fillRect(7,7,2,5).fillRect(15,7,2,5);
    g.fillStyle(0x252438).fillRect(10,13,1,2).fillRect(14,13,1,2);
  });
}
