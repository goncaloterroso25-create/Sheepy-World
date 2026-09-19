import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/ui/PixelFont',()=>({addSmallText:vi.fn()}));
import { drawGrandma, drawLisbon, drawRecurringPortrait, GRANDMA_HAIR } from '../src/art/recurringNpcArt';
import { collectionFocus, finishBookPaper, finishSatchel } from '../src/ui/CollectionFinish';

function drawing(){
  const rects:number[][]=[],colors:number[]=[];
  const g={fillStyle:(c:number)=>{colors.push(c);return g;},fillRect:(...r:number[])=>{rects.push(r);return g;}};
  return {g:g as unknown as Phaser.GameObjects.Graphics,rects,colors};
}
function bounds(rects:number[][],w:number,h:number){
  for(const [x,y,rw,rh] of rects){
    expect([x,y,rw,rh].every(Number.isInteger)).toBe(true);
    expect(x).toBeGreaterThanOrEqual(0);expect(y).toBeGreaterThanOrEqual(0);
    expect(rw).toBeGreaterThan(0);expect(rh).toBeGreaterThan(0);
    expect(x!+rw!).toBeLessThanOrEqual(w);expect(y!+rh!).toBeLessThanOrEqual(h);
  }
}
describe('Batch 5 focused presentation art',()=>{
  it('keeps both authored cameos inside the original 28×40 canvas with stable soles',()=>{
    for(const draw of [drawGrandma,drawLisbon])for(const frame of [0,1]){
      const r=drawing();draw(r.g,frame);bounds(r.rects,28,40);
      expect(Math.max(...r.rects.map(v=>v[1]!+v[3]!))).toBe(40);
    }
  });
  it('keeps all six portrait variants within the existing 64×72 crop',()=>{
    for(const id of ['grandma','jane','lisbon'] as const)for(const expressive of [false,true]){
      const r=drawing();drawRecurringPortrait(r.g,id,expressive);bounds(r.rects,64,72);
    }
  });
  it('keeps Grandma hair explicitly dark brown in gameplay and portrait art',()=>{
    expect(GRANDMA_HAIR).toEqual({edge:0x251e23,base:0x302321,light:0x513b32});
    for(const draw of [(g:Phaser.GameObjects.Graphics)=>drawGrandma(g,0),(g:Phaser.GameObjects.Graphics)=>drawRecurringPortrait(g,'grandma',true)]){
      const r=drawing();draw(r.g);expect(r.colors).toContain(GRANDMA_HAIR.base);expect(r.colors).toContain(GRANDMA_HAIR.light);
    }
  });
  it('keeps collection decoration integer-aligned and distinct across living stages',()=>{
    const stages=new Set<string>();
    for(const stage of ['PLAIN','STIRRING','REMEMBERING','PERSONAL'] as const){
      const r=drawing();finishBookPaper(r.g,stage);bounds(r.rects,640,360);stages.add(JSON.stringify(r.rects));
    }
    expect(stages.size).toBe(4);
    const r=drawing();finishSatchel(r.g);collectionFocus(r.g,74,114,76,50,0xa15d64);bounds(r.rects,640,360);
  });
});
