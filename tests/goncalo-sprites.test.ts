import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
const textures = vi.hoisted(() => new Map<string, { w: number; h: number; draw: (g: Phaser.GameObjects.Graphics) => void }>());
vi.mock('../src/art/textureFactory', () => ({ createPixelTexture: (_s: unknown, key: string, w: number, h: number,
  draw: (g: Phaser.GameObjects.Graphics) => void) => textures.set(key, { w, h, draw }) }));
import { createGoncaloTextures, GONCALO_COLORS as C, goncaloTextureKey } from '../src/art/goncaloSprites';
import { drawProtagonistSprite } from '../src/art/protagonistSprites';

function raster(key: string, draw = textures.get(key)!.draw) {
  let color = 0;
  const pixels = new Map<string, number>();
  const g = { fillStyle(c: number) { color = c; return g; }, fillRect(x: number, y: number, w: number, h: number) {
    expect([x,y,w,h].every(Number.isInteger), key).toBe(true);
    expect(x, key).toBeGreaterThanOrEqual(0); expect(y, key).toBeGreaterThanOrEqual(0);
    expect(w, key).toBeGreaterThan(0); expect(h, key).toBeGreaterThan(0);
    expect(x+w, key).toBeLessThanOrEqual(24); expect(y+h, key).toBeLessThanOrEqual(32);
    for(let yy=y; yy<y+h; yy++) for(let xx=x; xx<x+w; xx++) pixels.set(`${xx},${yy}`, color);
    return g;
  } };
  draw(g as unknown as Phaser.GameObjects.Graphics);
  return pixels;
}

describe('Goncalo normal sprite family', () => {
  createGoncaloTextures({} as Phaser.Scene);
  it('registers 36 native frames with idle and existing four-phase walk/run semantics', () => {
    expect(textures.size).toBe(36);
    for (const d of ['down','up','left','right'] as const) {
      expect(textures.has(goncaloTextureKey(d))).toBe(true);
      for (const sprint of [false,true]) for (const p of ['step-a','pass-a','step-b','pass-b'] as const)
        expect(textures.get(goncaloTextureKey(d,p,sprint))).toMatchObject({w:24,h:32});
    }
  });
  it('keeps integer pixels, ground contact and readable outfit/face colours in every frame', () => {
    expect(C.shirt).toBe(0x534165);
    expect(C.graphic).toBe(0xe6ddc4);
    for (const key of textures.keys()) {
      const pixels = raster(key), colors = [...pixels.values()];
      expect(Math.max(...[...pixels.keys()].map(xy=>Number(xy.split(',')[1]))),key).toBe(31);
      for (const c of [C.hair,C.hairLight,C.shirt,C.denim,C.sneaker]) expect(colors,key).toContain(c);
      if (!key.includes('-up-')) for (const c of [C.glasses,C.eye,C.graphic,0x684632]) expect(colors,key).toContain(c);
      else expect(colors,key+' no rear shirt emblem').not.toContain(C.graphic);
    }
  });
  it('keeps left/right anatomy mirrored and heads stable through all gaits', () => {
    const head = (p: Map<string,number>, bob: number) => [...p].map(([xy,c])=>{
      const [x,y]=xy.split(',').map(Number); return [x!,y!-bob,c];
    // The top tuft stays at row 0; the face/hair below it retain the stride bob.
    }).filter(([,y])=>y!>=2 && y!<=13).sort((a,b)=>a[1]!-b[1]!||a[0]!-b[0]!);
    const idle=head(raster('goncalo-right-idle'),0);
    for (const gait of ['','sprint-']) for (const phase of ['step-a','pass-a','step-b','pass-b']) {
      const right=raster(`goncalo-${gait}right-${phase}`), left=raster(`goncalo-${gait}left-${phase}`);
      expect(head(right,phase.startsWith('step')?-1:0)).toEqual(idle);
      const mirror=[...left].map(([xy,c])=>{const [x,y]=xy.split(',').map(Number);return [`${23-x!},${y}`,c];});
      expect(mirror.sort()).toEqual([...right].sort());
    }
  });
  it('keeps rectangular lenses connected at the bridge and a separate visible moustache/goatee', () => {
    for (const gait of ['','sprint-']) for (const phase of ['idle','step-a','pass-a','step-b','pass-b']) {
      if(gait && phase==='idle') continue;
      const bob=phase.startsWith('step')?-1:0;
      const front=raster(`goncalo-${gait}down-${phase}`);
      for(const x of [7,13]) for(const y of [6,8]) for(let dx=0;dx<4;dx++)
        expect(front.get(`${x+dx},${y+bob}`)).toBe(C.glasses);
      for(const x of [11,12]) expect(front.get(`${x},${7+bob}`)).toBe(C.glasses);
      expect([...front].filter(([,c])=>c===0x684632)).toHaveLength(8);
      const right=raster(`goncalo-${gait}right-${phase}`);
      expect([...right].filter(([,c])=>c===0x684632)).toHaveLength(5);
    }
  });
  it('distinguishes all four movement poses in every view and gait', () => {
    for (const d of ['down','up','left','right']) for (const gait of ['','sprint-']) {
      const poses=['step-a','pass-a','step-b','pass-b'].map(p=>JSON.stringify([...raster(`goncalo-${gait}${d}-${p}`)].sort()));
      expect(new Set(poses).size,`${d}/${gait}`).toBe(4);
    }
  });
  it('has a taller crown and narrower silhouette than unchanged Protagonist at the same sole', () => {
    const bounds = (pixels: Map<string,number>) => {
      const points=[...pixels.keys()].map(xy=>xy.split(',').map(Number));
      return {top:Math.min(...points.map(([,y])=>y!)),
        width:Math.max(...points.map(([x])=>x!))-Math.min(...points.map(([x])=>x!))+1};
    };
    for (const direction of ['down','up','left','right'] as const) {
      const goncalo=bounds(raster(goncaloTextureKey(direction)));
      const protagonist=bounds(raster('Protagonist comparison',g=>drawProtagonistSprite(g,direction,'idle')));
      expect(goncalo.top,direction).toBeLessThan(protagonist.top);
      expect(goncalo.width,direction).toBeLessThan(protagonist.width);
    }
  });
  it('preserves back frames and all pixels below the corrected hair framing', () => {
    let hash=2166136261;
    for(const key of textures.keys()) {
      const retained=[...raster(key)].filter(([xy])=>key.includes('-up-') || Number(xy.split(',')[1])>=18).sort();
      for(const c of key+JSON.stringify(retained)) hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
    }
    expect(hash.toString(16)).toMatchSnapshot();
  });
  it('connects front hair to the neck and keeps brows and partially hidden ears readable', () => {
    const hair=[C.hair,C.hairLight,C.hairEdge,0x73503a];
    for(const gait of ['','sprint-']) for(const phase of ['idle','step-a','pass-a','step-b','pass-b']) {
      if(gait && phase==='idle') continue;
      const bob=phase.startsWith('step')?-1:0;
      const front=raster(`goncalo-${gait}down-${phase}`);
      for(const x of [8,9,10,13,14,15]) expect(front.get(`${x},${4+bob}`)).toBe(0x553529);
      for(const x of [8,9,14,15]) for(const y of [11,12,13,14])
        expect(hair,`front hair ${x},${y}/${phase}`).toContain(front.get(`${x},${y+bob}`));
      const right=raster(`goncalo-${gait}right-${phase}`);
      for(const x of [16,17,18]) expect(right.get(`${x},${4+bob}`)).toBe(0x553529);
      for(const [x,y] of [[12,7],[12,8],[13,8]]) expect(hair).toContain(right.get(`${x},${y!+bob}`));
      expect(right.get(`13,${9+bob}`)).toBe(C.skinEdge); // One exposed ear-edge pixel.
    }
  });
});
