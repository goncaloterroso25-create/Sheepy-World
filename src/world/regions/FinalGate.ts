import type Phaser from 'phaser';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { addSmallText } from '../../ui/PixelFont';

export function installFinalGate(scene:Phaser.Scene,state:GameStateStore,interactions:InteractionSystem,enter:()=>void):void {
  let route:Phaser.GameObjects.Container|undefined;

  const reveal=():void=>{
    if(route)return;
    const art=scene.add.graphics();
    art.fillStyle(0xf5d99d,.08).fillEllipse(0,-24,104,88);
    art.fillStyle(0x77432b).fillRect(-36,-49,4,45).fillRect(33,-49,4,45);
    art.lineStyle(3,0x77432b).lineBetween(-34,-47,0,-61).lineBetween(0,-61,35,-47);
    for(let i=0;i<9;i++)art.fillStyle(i%2?0xa45b75:0xf2d69a).fillRect(-34+i*8,-55-Math.min(i,8-i)*2,6,5);
    for(const x of [-47,48]){
      art.fillStyle(0xffe5ac,.07).fillCircle(x,-17,23);
      art.fillStyle(0x654536).fillRect(x-1,-17,3,29).fillRect(x-7,-26,15,3);
      art.fillStyle(0xe1a942).fillRect(x-5,-23,11,13);
      art.fillStyle(0xffedbd).fillRect(x-3,-21,7,8);
    }
    for(const [x,y]of [[-49,5],[-26,-2],[23,1],[47,7]] as const)
      art.fillStyle(0xd18a9b).fillRect(x,y,4,3).fillStyle(0xf2d69a).fillRect(x+1,y-2,2,2);
    const label=addSmallText(scene,0,-27,'A PLACE KEPT',0xffe5ac).setOrigin(.5);
    route=scene.add.container(600,680,[art,label]).setName('final-route-visible').setDepth(672).setAlpha(0);
    scene.tweens.add({targets:route,alpha:1,duration:state.snapshot.settings.reducedCameraMotion?1:900});
    interactions.register({id:'final-gate',object:route,range:38,prompt:'Follow the petals',interact:enter});
  };

  const refresh=():void=>{if(state.finalRouteReady)reveal();};
  refresh();const unsubscribe=state.subscribe(refresh);
  scene.events.once('shutdown',()=>{unsubscribe();interactions.unregister('final-gate');});
}
