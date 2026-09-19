import type Phaser from 'phaser';
import {
  currentInputPresentation,
  getControlHint,
  type ControlAction,
} from '../config/controllerPresentation';
import { addSmallText } from './PixelFont';
import { paperButton, UI_MATERIAL as M } from './TactileUI';

export type PlaystationGlyph = 'cross' | 'circle' | 'square' | 'triangle' | 'options' | 'r2' | 'movement';

const FACE_PATTERNS: Readonly<Record<Exclude<PlaystationGlyph,'r2'>, readonly string[]>> = {
  cross: [
    '1000001','0100010','0010100','0001000','0010100','0100010','1000001',
  ],
  circle: [
    '0011100','0100010','1000001','1000001','1000001','0100010','0011100',
  ],
  square: [
    '1111111','1000001','1000001','1000001','1000001','1000001','1111111',
  ],
  triangle: [
    '0001000','0010100','0010100','0100010','0100010','1000001','1111111',
  ],
  options: ['0000000','1111111','0000000','1111111','0000000','1111111','0000000'],
  movement: ['0001000','0011100','0101010','1111111','0101010','0011100','0001000'],
};

export function playstationGlyphForAction(action: ControlAction): PlaystationGlyph | undefined {
  if(action==='interact'||action==='confirm')return 'cross';
  if(action==='back')return 'circle';
  if(action==='scrapbook')return 'triangle';
  if(action==='bag')return 'square';
  if(action==='sprint')return 'r2';
  if(action==='pause')return 'options';
  if(action==='movement')return 'movement';
  return undefined;
}

/** Tiny nearest-neighbour DualSense marks drawn in logical pixels. */
export function drawPlaystationGlyph(g: Phaser.GameObjects.Graphics, glyph: PlaystationGlyph,
  x: number, y: number, color: number): void {
  g.fillStyle(color,1);
  if (glyph in FACE_PATTERNS) {
    const pattern=FACE_PATTERNS[glyph as keyof typeof FACE_PATTERNS];
    pattern.forEach((row,py)=>[...row].forEach((pixel,px)=>{
      if(pixel==='1')g.fillRect(Math.round(x)+px-3,Math.round(y)+py-3,1,1);
    }));
  } else {
    g.fillRect(x-6,y+5,12,1);
  }
}

export function addPlaystationGlyph(scene: Phaser.Scene, glyph: PlaystationGlyph,
  x: number, y: number, color: number): Phaser.GameObjects.Container {
  const g=scene.add.graphics();drawPlaystationGlyph(g,glyph,0,0,color);
  const root=scene.add.container(x,y,[g]);
  if(glyph==='r2'){
    const text=addSmallText(scene,-6,-4,'R2',color);
    text.setFontSize(scene.cache.bitmapFont.get(text.font).data.size);root.add(text);
  }
  return root;
}

const GLYPH_WIDTH: Readonly<Record<PlaystationGlyph,number>> = {
  cross:7,circle:7,square:7,triangle:7,r2:12,options:7,movement:7,
};

/** One active-family hint; PlayStation face actions use native pixel marks. */
export function addControlHint(scene: Phaser.Scene, action: ControlAction, label: string,
  x: number, y: number, color: number, align: 'left'|'center'|'right' = 'left'): Phaser.GameObjects.Container {
  const glyphName=playstationGlyphForAction(action);
  const glyph=glyphName?addPlaystationGlyph(scene,glyphName,0,0,color):undefined;
  const text=addSmallText(scene,0,0,'',color).setOrigin(0,.5);
  text.setFontSize(scene.cache.bitmapFont.get(text.font).data.size);
  const root=scene.add.container(x,y,glyph?[glyph,text]:[text]);
  root.setData('label',label);
  const refresh=():void=>{
    const label=String(root.getData('label'));
    const playstation=(currentInputPresentation()==='gamepad-playstation'
      ||(action==='movement'&&currentInputPresentation()==='gamepad-generic'))&&glyphName;
    glyph?.setVisible(!!playstation);
    text.setText(playstation?label:`${getControlHint(action)}${label?`  ${label}`:''}`);
    const glyphWidth=playstation?GLYPH_WIDTH[glyphName]:0;
    const gap=playstation&&label?4:0;
    const total=glyphWidth+gap+text.width;
    const start=align==='center'?-Math.floor(total/2):align==='right'?-total:0;
    glyph?.setX(start+Math.floor(glyphWidth/2));
    text.setX(start+glyphWidth+gap);
    root.setData('hintWidth',total);
  };
  root.setData('refreshInputPresentation',refresh);refresh();return root;
}

/** Measured groups at native font size; callers only author rows, never text offsets. */
export function addControlLegend(scene: Phaser.Scene, rows: readonly (readonly [ControlAction,string][])[],
  x: number, y: number, width: number, color: number): Phaser.GameObjects.Container {
  const root=scene.add.container(x,y);
  const groups=rows.map((row,i)=>row.map(([action,label])=>{
    const hint=addControlHint(scene,action,label,0,i*17,color);root.add(hint);return hint;
  }));
  const refresh=():void=>{
    groups.forEach(row=>{
      row.forEach(h=>h.getData('refreshInputPresentation')());
      const total=row.reduce((sum,h)=>sum+Number(h.getData('hintWidth')),0);
      const gap=row.length>1?Math.min(14,Math.floor((width-total)/(row.length-1))):0;
      let offset=Math.floor((width-total-gap*(row.length-1))/2);
      row.forEach(h=>{h.setX(offset);offset+=Number(h.getData('hintWidth'))+gap;});
    });
  };
  root.setData('refreshInputPresentation',refresh);refresh();return root;
}

export function paperControlButton(scene: Phaser.Scene, x: number, y: number, width: number,
  action: ControlAction, label: string, callback: () => void, enabled = true): Phaser.GameObjects.Container {
  const button=paperButton(scene,x,y,width,'',callback,enabled);
  const hint=addControlHint(scene,action,label,Math.floor(width/2),10,enabled?M.ink:M.pencil,'center');
  button.add(hint);
  button.setData('refreshInputPresentation',()=>hint.getData('refreshInputPresentation')?.());
  return button;
}

export function refreshControlHints(root?: Phaser.GameObjects.Container): void {
  if(!root)return;
  const visit=(object:Phaser.GameObjects.GameObject):void=>{
    const refresh=object.getData('refreshInputPresentation') as (()=>void)|undefined;
    refresh?.();
    const children=(object as Phaser.GameObjects.Container).list;
    if(Array.isArray(children))children.forEach(visit);
  };
  visit(root);
}
