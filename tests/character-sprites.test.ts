import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
const textures = vi.hoisted(() => new Map<string, { w:number; h:number; draw:(g:Phaser.GameObjects.Graphics)=>void }>());
vi.mock('../src/art/textureFactory', () => ({ createPixelTexture: (_s:unknown,key:string,w:number,h:number,draw:(g:Phaser.GameObjects.Graphics)=>void) => textures.set(key,{w,h,draw}) }));
import { createPlayerAnimations } from '../src/entities/playerAnimations';
import { drawHangeProof, drawJaneProof } from '../src/art/humanSpriteProofs';
import { PROTAGONIST_BLUSH_ACCENT as BLUSH_ACCENT } from '../src/art/protagonistChibi';

function raster() {
  let color = 0;
  const pixels = new Map<string,number>(); const rects:number[][]=[];
  const g = { fillStyle(c:number) { color=c; return g; }, fillRect(x:number,y:number,w:number,h:number) {
    rects.push([x,y,w,h]);
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++) pixels.set(`${xx},${yy}`,color);
    return g;
  } };
  return {g:g as unknown as Phaser.GameObjects.Graphics,pixels,rects};
}

describe('Gameplay character production families', () => {
  const animations:unknown[]=[];
  createPlayerAnimations({ anims:{exists:()=>false,create:(a:unknown)=>animations.push(a)} } as unknown as Phaser.Scene);
  it('retains all existing direction, stride, sprint, ponytail and seated texture contracts', () => {
    for(const family of ['player','player-ponytail','player-snow']) for(const direction of ['up','down','left','right']) {
      expect(textures.has(`${family}-${direction}-idle`)).toBe(true);
      for(const phase of ['step-a','pass-a','step-b','pass-b']) {
        expect(textures.has(`${family}-${direction}-${phase}`)).toBe(true);
        expect(textures.has(`${family}-sprint-${direction}-${phase}`)).toBe(true);
      }
    }
    expect(textures.has('player-seated')).toBe(true);
    expect(animations).toHaveLength(4);
    for(const animation of animations) expect(animation).toMatchObject({frameRate:8,repeat:-1});
  });
  it('keeps every production frame inside its original canvas on integer pixels', () => {
    for(const [key,texture] of textures) {
      const r=raster(); texture.draw(r.g);
      for(const [x,y,w,h] of r.rects) {
        expect([x,y,w,h].every(Number.isInteger),key).toBe(true);
        expect(w,key).toBeGreaterThan(0); expect(h,key).toBeGreaterThan(0);
        expect(x,key).toBeGreaterThanOrEqual(0); expect(y,key).toBeGreaterThanOrEqual(0);
        expect(x!+w!,key).toBeLessThanOrEqual(texture.w); expect(y!+h!,key).toBeLessThanOrEqual(texture.h);
      }
    }
  });
  it('preserves the left-cheek mark without mirroring it onto the other cheek', () => {
    for(const prefix of ['player','player-ponytail','player-snow']) for(const direction of ['down','right','up','left'])
      for(const gait of ['', 'sprint-']) for(const phase of ['idle','step-a','pass-a','step-b','pass-b']) {
      if(gait && phase==='idle') continue;
      const key=`${prefix}-${gait}${direction}-${phase}`;
      const r=raster(); textures.get(key)!.draw(r.g);
      const marks=[...r.pixels.entries()].filter(([,c])=>c===BLUSH_ACCENT);
      const y=phase.startsWith('step') ? 11 : 12;
      const x=15;
      expect(marks,key).toEqual(direction==='down'||direction==='right' ? [[`${x},${y}`,BLUSH_ACCENT]]:[]);
    }
    const seated=raster(); textures.get('player-seated')!.draw(seated.g);
    expect([...seated.pixels].filter(([,c])=>c===BLUSH_ACCENT)).toEqual([['15,12',BLUSH_ACCENT]]);
  });
  it('gives each Snow frame a visible red top and separates the four walking poses', () => {
    for(const [key,t] of textures) if(key.startsWith('player-snow-')) {
      const r=raster();t.draw(r.g);
      expect([...r.pixels.values()].filter(c=>c===0xb84d4d).length,key).toBeGreaterThanOrEqual(3);
    }
    for(const prefix of ['player','player-snow']) for(const direction of ['up','down','left','right']) {
      const frames=['step-a','pass-a','step-b','pass-b'].map(phase=>{
        const r=raster();textures.get(`${prefix}-${direction}-${phase}`)!.draw(r.g);
        return JSON.stringify([...r.pixels.entries()].sort());
      });
      expect(new Set(frames).size,`${prefix}-${direction}`).toBe(4);
    }
  });
  it('refines proportions without changing canvas height or the sole anchor', () => {
    for(const prefix of ['player','player-snow']) for(const direction of ['down','up','left','right']) {
      const r=raster(); textures.get(`${prefix}-${direction}-idle`)!.draw(r.g);
      const points=[...r.pixels.keys()].map(xy=>xy.split(',').map(Number));
      expect(Math.min(...points.map(([,y])=>y!))).toBe(1);
      expect(Math.max(...points.map(([,y])=>y!))).toBe(31);
      const crown=points.filter(([,y])=>y!<=13).map(([x])=>x!);
      expect(Math.max(...crown)-Math.min(...crown)+1).toBeLessThanOrEqual(prefix==='player'?16:18);
    }
  });
  it('retains the approved chibi face inside the Snow hood throughout movement', () => {
    const faceColors=[0xd39483,0xf2bd9f,0xffd9b9,0x9d7b63,0xfffaf0,0xc3817b,BLUSH_ACCENT];
    for(const direction of ['down','left','right']) for(const gait of ['','sprint-'])
      for(const phase of ['idle','step-a','pass-a','step-b','pass-b']) {
        if(gait && phase==='idle') continue;
        const normal=raster(), snow=raster();
        const suffix=`${gait}${direction}-${phase}`;
        textures.get(`player-${suffix}`)!.draw(normal.g);
        textures.get(`player-snow-${suffix}`)!.draw(snow.g);
        const bob=phase.startsWith('step')?-1:0;
        for(const [xy,color] of normal.pixels) {
          const y=Number(xy.split(',')[1])-bob;
          if(y>=4 && y<=13 && faceColors.includes(color))
            expect(snow.pixels.get(xy),suffix+' face '+xy).toBe(color);
        }
        expect(Math.max(...[...snow.pixels.keys()].map(xy=>Number(xy.split(',')[1]))),suffix+' sole').toBe(31);
        expect([...snow.pixels.values()].filter(c=>c===0xe8dbc6).length,suffix+' white scarf').toBeGreaterThan(10);
        expect([...snow.pixels.values()].filter(c=>c===0x46577c).length,suffix+' blue jeans').toBeGreaterThan(10);
      }
  });
  it('renders the reference outfit: white cropped tee, grey shorts, bare legs and high-tops', () => {
    for(const [key,t] of textures) if(key.startsWith('player-') && !key.startsWith('player-snow-')
      && key!=='player-contact-shadow' && key!=='player-seated') {
      const r=raster(); t.draw(r.g);
      const colors=[...r.pixels.values()];
      expect(colors.filter(c=>c===0xeee8dd || c===0xfffaf0).length,key+' tee/soles').toBeGreaterThan(8);
      expect(colors.includes(0x817b87),key+' grey shorts').toBe(true);
      expect([...r.pixels.entries()].some(([xy,c])=>Number(xy.split(',')[1])>=25 && c===0xf2bd9f),key+' bare legs').toBe(true);
      expect([...r.pixels.entries()].some(([xy,c])=>xy.endsWith(',31') && c===0xeee8dd),key+' sole anchor').toBe(true);
    }
    for(const direction of ['down','left','right']) {
      const r=raster(); textures.get(`player-${direction}-idle`)!.draw(r.g);
      expect([...r.pixels.values()].includes(0xd4c2a4),direction+' necklace').toBe(true);
    }
  });
  it('keeps the new profile heads stable and the opposite views consistent through all strides', () => {
    for(const prefix of ['player','player-ponytail','player-snow']) {
      const head=(pixels:Map<string,number>,bob:number)=>[...pixels.entries()].map(([xy,c])=>{
        const [x,y]=xy.split(',').map(Number); return [x!,y!-bob,c] as const;
      }).filter(([,y])=>y>=1 && y<=13).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
      const idle=raster(); textures.get(`${prefix}-right-idle`)!.draw(idle.g);
      for(const gait of ['', 'sprint-']) for(const phase of ['step-a','pass-a','step-b','pass-b']) {
        const key=`${prefix}-${gait}right-${phase}`;
        const right=raster(), left=raster();
        textures.get(key)!.draw(right.g);
        textures.get(`${prefix}-${gait}left-${phase}`)!.draw(left.g);
        const bob=phase.startsWith('step')?-1:0;
        expect(head(right.pixels,bob),key+' stable head').toEqual(head(idle.pixels,0));
        const mirror=new Map([...left.pixels].map(([xy,c])=>{
          const [x,y]=xy.split(',').map(Number); return [`${23-x!},${y}`,c];
        }));
        const mark=`15,${12+bob}`;
        right.pixels.delete(mark); mirror.delete(mark);
        expect([...mirror].sort(),key+' mirrored anatomy except left cheek').toEqual([...right.pixels].sort());
      }
    }
  });
  it('keeps both NPC proofs within their established feet/canvas budgets', () => {
    for(const [w,h,draw] of [[24,36,drawHangeProof],[28,40,(g:Phaser.GameObjects.Graphics)=>drawJaneProof(g,0)],
      [28,40,(g:Phaser.GameObjects.Graphics)=>drawJaneProof(g,1)]] as const) {
      const r=raster();draw(r.g);
      for(const [x,y,width,height] of r.rects) {
        expect(x).toBeGreaterThanOrEqual(0); expect(y).toBeGreaterThanOrEqual(0);
        expect(x!+width!).toBeLessThanOrEqual(w);expect(y!+height!).toBeLessThanOrEqual(h);
      }
    }
  });
});
