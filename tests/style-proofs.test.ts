import { describe, expect, it } from 'vitest';
import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../src/config/constants';
import { MEMORIES } from '../src/data/memories';
import { noteLines, clueCardLabel, SCRAPBOOK_NOTE as N } from '../src/ui/ScrapbookLayout';
import { pixelOval, softBox } from '../src/art/styleProofShapes';
import { homeProofFurniture } from '../src/art/homeProofFurniture';
import { HOME_FURNITURE } from '../src/world/regions/HomeLayout';

describe('bounded Visual Identity 2.0 proof contract',()=>{
  it('keeps the canonical 16:9 logical presentation',()=>{
    expect([GAME_WIDTH,GAME_HEIGHT]).toEqual([640,360]);
  });
  it('fits every current authored found/restored clue without shortening its words',()=>{
    for(const memory of Object.values(MEMORIES))for(const detail of Object.values(memory.fragmentDetails??{})) {
      for(const text of [detail.found,detail.restored]) {
        const lines=noteLines(text);
        expect(lines.join(' ')).toBe(text);
        expect(Math.max(...lines.map(line=>line.length))*8).toBeLessThanOrEqual(N.textWidth);
        expect(lines.length*(8+1)*8/6).toBeLessThanOrEqual(N.bodyBottom-N.bodyY);
      }
    }
    expect(N.bodyBottom).toBeLessThan(N.footerY);
    expect(N.footerY+11).toBeLessThan(N.y+N.height);
  });
  it('preserves explicit paragraphs in note layout',()=>{
    expect(noteLines('First line.\nSecond line.')).toEqual(['First line.','Second line.']);
  });
  it('keeps legacy clue teasers on their card without shrinking type',()=>{
    const full=MEMORIES['test-memory']!.fragmentClues['test-memory-fragment-a']!;
    const label=clueCardLabel(full,10);
    expect(label.split('\n')).toHaveLength(3);
    expect(label.endsWith('...')).toBe(true);
    expect(label.split('\n').every(line=>line.length<=10)).toBe(true);
    expect(MEMORIES['test-memory']!.fragmentClues['test-memory-fragment-a']).toBe(full);
    expect(clueCardLabel('TWO HEADLIGHTS',10)).toBe('TWO\nHEADLIGHTS');
    for(const memory of Object.values(MEMORIES))for(const clue of Object.values(memory.fragmentClues))
      expect(clueCardLabel(clue,10).split('\n').every(line=>line.length<=10)).toBe(true);
  });
  it('draws every furniture family on positive integer pixels with the old depth anchors',()=>{
    const depths:number[]=[];
    let rectangles=0;
    const g={
      fillStyle:()=>g,
      setDepth:(depth:number)=>{depths.push(depth);return g;},
      fillRect:(...args:number[])=>{
        rectangles++;
        expect(args.every(Number.isInteger)).toBe(true);
        expect(args[2]).toBeGreaterThan(0);expect(args[3]).toBeGreaterThan(0);
        return g;
      },
    };
    const scene={add:{graphics:()=>g}} as unknown as Phaser.Scene;
    HOME_FURNITURE.forEach(f=>homeProofFurniture(scene,f));
    expect(depths).toEqual(HOME_FURNITURE.map(f=>f.y+f.height));
    expect(rectangles).toBeGreaterThan(300);
    const graphics=g as unknown as Phaser.GameObjects.Graphics;
    pixelOval(graphics,0,0,7,5);
    softBox(graphics,0,0,3,3,8);
  });
});
