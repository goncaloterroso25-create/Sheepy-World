import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/ui/PixelFont',()=>({addSmallText:vi.fn()}));
vi.mock('../src/art/textureFactory',()=>({createPixelTexture:vi.fn()}));
import { drawPerformanceFan, drawPerformancePerformer, PERFORMANCE_AUDIENCE, PERFORMANCE_PLAYERS, addPerformancePerformance } from '../src/art/performanceStyle';
import { PORTO_SOLIDS, PORTO_PATHS } from '../src/world/regions/ExpansionLayout';

function graphics() {
  const rects:number[][]=[];
  const colors:number[]=[];
  const g={fillStyle:(color:number)=>{colors.push(color);return g;},fillRect:(...r:number[])=>{rects.push(r);return g;},clear:()=>g,
    setDepth:()=>g,setName:()=>g,setVisible:vi.fn(()=>g)};
  return {g,rects,colors};
}
describe('Porto visual-only production family',()=>{
  it('keeps all five performers and twelve fan variations within integer native canvases',()=>{
    const looks=new Set<string>();
    for(let i=0;i<17;i++){
      const {g,rects,colors}=graphics();
      (i<12?drawPerformanceFan:drawPerformancePerformer)(g as unknown as Phaser.GameObjects.Graphics,i<12?i:i-12);
      const [w,h]=i<12?[24,36]:[36,40];
      for(const [x,y,rw,rh]of rects){
        expect([x,y,rw,rh].every(Number.isInteger)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0);expect(y).toBeGreaterThanOrEqual(0);
        expect(rw).toBeGreaterThan(0);expect(rh).toBeGreaterThan(0);
        expect(x!+rw!).toBeLessThanOrEqual(w!);expect(y!+rh!).toBeLessThanOrEqual(h!);
      }
      looks.add(JSON.stringify({rects,colors}));
    }
    expect(looks.size).toBe(17);
  });
  it('retains the 28 existing irregular audience anchors and five performer anchors',()=>{
    expect(PERFORMANCE_AUDIENCE).toHaveLength(28);
    expect(PERFORMANCE_PLAYERS).toEqual([670,714,758,802,846]);
    // 24px canvas must not enter x740–790, the quiet player aisle.
    for(const [x]of PERFORMANCE_AUDIENCE)expect(x+12<=740||x-12>=790).toBe(true);
    expect(PORTO_SOLIDS).toHaveLength(13);expect(PORTO_PATHS).toHaveLength(9);
  });
  it('hides all performance art when dormant and keeps the remembered crowd after restoration',()=>{
    const containers:{setVisible:ReturnType<typeof vi.fn>}[]=[];
    const scene={add:{container:()=>{const c={setDepth:()=>c,setName:()=>c,add:()=>c,setVisible:vi.fn(()=>c)};containers.push(c);return c;},
      image:()=>({setOrigin(){return this;}}),graphics:()=>graphics().g},tweens:{add:vi.fn()}};
    const art=addPerformancePerformance(scene as unknown as Phaser.Scene);
    art.refresh(false,false);containers.forEach(c=>expect(c.setVisible).toHaveBeenLastCalledWith(false));
    art.refresh(true,false);containers.forEach(c=>expect(c.setVisible).toHaveBeenLastCalledWith(true));
    art.refresh(true,true);containers.forEach(c=>expect(c.setVisible).toHaveBeenLastCalledWith(true));
  });
});
