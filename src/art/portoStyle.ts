import type Phaser from 'phaser';
import { PORTO_HOUSES, PORTO_PATHS } from '../world/regions/ExpansionLayout';
import { bakeGround } from '../world/regions/RegionArt';
import { addSmallText } from '../ui/PixelFont';
import { PORTO as C, nightFacade, nightLamp, nightPaving, riverNight } from './portoUrban';
import { addPortoGarden, gardenGround, gardenSteps } from './portoGardens';
import { addPerformanceShell } from './performanceStyle';

/** Art only: callers keep the existing PORTO_SOLIDS and all content contracts. */
export function addPortoStyle(scene: Phaser.Scene): void {
  bakeGround(scene,'porto-ground-v2',1792,1408,g=>{
    g.fillStyle(C.night).fillRect(0,0,1792,1408);
    gardenGround(g);
    nightPaving(g,PORTO_PATHS);
    gardenSteps(g);
    // Sparse paving wear and amber slivers near the existing nighttime shops.
    for(const [x,y]of [[786,435],[839,443],[1564,982],[1593,989],[1111,899]] as const){
      g.fillStyle(0xb49c98,.24).fillRect(x,y,17,1).fillRect(x-4,y+5,27,1);
    }
    riverNight(g);
  });
  PORTO_HOUSES.forEach((h,i)=>{
    nightFacade(scene,h,i);
    if(h.variant==='shop')addSmallText(scene,h.x+16,h.y+h.height-77,h.x<1000?'AFTER DARK':'JANTAR',C.warm).setDepth(h.y+h.height+1);
  });
  addPortoGarden(scene);
  for(const [x,y]of [[1184,940],[881,452],[1405,691],[540,1048],[1568,1047]])nightLamp(scene,x!,y!);
  scene.add.image(1500,1060,'car-blue').setDepth(1073);
  addPerformanceShell(scene);
}
