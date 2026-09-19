import type Phaser from 'phaser';
import type { SaveData } from '../types/game';
import { currentInputPresentation } from '../config/controllerPresentation';
import { addSmallText } from './PixelFont';
import { steppedPanel, UI_MATERIAL as M } from './TactileUI';
import { memoryKeepsakes } from './MemoryKeepsakes';
import { keepsakeArt } from './PausePaper';
import { drawPlaystationGlyph } from './ControllerGlyphs';

export function createCompactDock(scene: Phaser.Scene, actions: { scrapbook: () => void; bag: () => void }, save: () => Readonly<SaveData>): Phaser.GameObjects.Container {
  const root=scene.add.container(522,330).setName('compact-paper-dock');
  const decoration=scene.add.graphics();root.add(decoration);
  const controllerGlyphs=scene.add.graphics();
  const keys: Phaser.GameObjects.BitmapText[]=[];
  for(const [i,name] of ['SCRAPBOOK','BAG'].entries()) {
    const x=i?66:0,w=i?42:60;
    const card=scene.add.container(x,0),g=scene.add.graphics();
    g.fillStyle(M.ink,.3).fillRect(2,3,w,21);
    steppedPanel(g,0,0,w,22,M.paper,M.pencil);
    g.fillStyle(M.paperLight).fillRect(4,3,w-8,1);
    const iconX=i?24:39;
    if(!i) {
      g.fillStyle(M.cover).fillRect(iconX,5,13,13);g.fillStyle(M.paperLight).fillRect(iconX+3,6,8,10);
      g.fillStyle(M.paperEdge).fillRect(iconX+5,8,5,1).fillRect(iconX+5,11,5,1);
      g.fillStyle(M.accent).fillRect(iconX+9,5,2,6);
    } else {
      g.fillStyle(M.fabricDeep).fillRect(iconX+3,4,6,3).fillRect(iconX,8,13,10);
      g.fillStyle(M.fabricLight).fillRect(iconX+1,8,11,7);
      g.fillStyle(M.stitch).fillRect(iconX+2,10,9,1).fillRect(iconX+6,10,2,3);
    }
    const key=addSmallText(scene,i?12:18,8,i?'I':'TAB',M.ink).setOrigin(.5,0);
    key.setFontSize(scene.cache.bitmapFont.get(key.font).data.size);keys.push(key);
    const tooltip=addSmallText(scene,w/2,-12,name,M.paperLight).setOrigin(.5).setVisible(false);
    const hit=scene.add.zone(w/2,11,w,24).setInteractive({useHandCursor:true});
    hit.on('pointerover',()=>{tooltip.setVisible(true);if(!save().settings.reducedCameraMotion)card.setY(-1);});
    hit.on('pointerout',()=>{tooltip.setVisible(false);card.setY(0);});
    hit.on('pointerdown',()=>{tooltip.setVisible(false);(i?actions.bag:actions.scrapbook)();});
    card.add([g,key,tooltip,hit]);root.add(card);
  }
  const refresh=():void=>{
    const mode=currentInputPresentation(),controller=mode!=='keyboard-mouse',playstation=mode==='gamepad-playstation';
    keys[0]!.setVisible(!playstation);keys[1]!.setVisible(!playstation);
    keys[0]!.setText(controller?'Y':'TAB');keys[1]!.setText(controller?'X':'I');
    controllerGlyphs.clear();
    if(playstation){drawPlaystationGlyph(controllerGlyphs,'triangle',18,11,M.ink);drawPlaystationGlyph(controllerGlyphs,'square',78,11,M.ink);}
    decoration.clear();keepsakeArt(decoration,memoryKeepsakes(save()).slice(-2),30,-10);
  };
  root.add(controllerGlyphs);root.setData('refresh',refresh);refresh();return root;
}
