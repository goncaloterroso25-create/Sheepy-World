import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
vi.mock('../src/world/regions/RegionArt',()=>({
  bakeGround:(scene:{add:{graphics:()=>Phaser.GameObjects.Graphics}},_key:string,_w:number,_h:number,draw:(g:Phaser.GameObjects.Graphics)=>void)=>draw(scene.add.graphics()),
}));
import { riverGround, vilaGround } from '../src/art/riverVilaGround';
import { dayHouse, dayTree, dayPlanter, dayCafeTable } from '../src/art/townDayArt';
import { addGoncaloHomeStyle } from '../src/art/goncaloHomeStyle';
import { RIVER_HOUSES, RIVER_TREES, RIVER_CAFE_TABLES, VILA_HOUSES, VILA_TREES } from '../src/world/regions/layouts';
import { GONCALO_FURNITURE, GONCALO_WALLS } from '../src/world/regions/ExpansionLayout';

function recorder(){
  const rects:number[][]=[],depths:number[]=[];
  const g={fillStyle:()=>g,fillRect:(...r:number[])=>{rects.push(r);return g;},setDepth:(d:number)=>{depths.push(d);return g;}};
  const scene={add:{graphics:()=>g}} as unknown as Phaser.Scene;
  return {g:g as unknown as Phaser.GameObjects.Graphics,scene,rects,depths};
}
function valid(rects:number[][]){
  expect(rects.length).toBeGreaterThan(100);
  for(const r of rects){
    expect(r.every(Number.isInteger),`non-integer drawing ${r}`).toBe(true);
    expect(r[2],`non-positive width ${r}`).toBeGreaterThan(0);
    expect(r[3],`non-positive height ${r}`).toBeGreaterThan(0);
  }
}
describe('Batch 4 visual-only region art',()=>{
  it('draws both ground families with finite positive native pixel clusters',()=>{
    for(const draw of [riverGround,vilaGround]){const r=recorder();draw(r.g);valid(r.rects);}
  });
  it('keeps every existing facade base/depth and leaves layout data untouched',()=>{
    const before=JSON.stringify([RIVER_HOUSES,VILA_HOUSES]);
    for(const h of [...RIVER_HOUSES,...VILA_HOUSES]){
      const r=recorder();dayHouse(r.scene,h);valid(r.rects);
      expect(r.depths).toEqual([h.y+h.height-15]);
    }
    expect(JSON.stringify([RIVER_HOUSES,VILA_HOUSES])).toBe(before);
  });
  it('keeps planting and table renderers pixel-aligned without physics objects',()=>{
    const r=recorder();
    for(const [x,y]of [...RIVER_TREES,...VILA_TREES]){dayTree(r.scene,x,y);dayPlanter(r.scene,x,y);}
    RIVER_CAFE_TABLES.forEach(t=>dayCafeTable(r.scene,t));valid(r.rects);
  });
  it('reuses exact Gonçalo furniture/depth anchors and does not mutate geometry',()=>{
    const before=JSON.stringify([GONCALO_FURNITURE,GONCALO_WALLS]),r=recorder();
    addGoncaloHomeStyle(r.scene);valid(r.rects);
    for(const f of GONCALO_FURNITURE)expect(r.depths).toContain(f.y+f.height);
    expect(JSON.stringify([GONCALO_FURNITURE,GONCALO_WALLS])).toBe(before);
  });
});
