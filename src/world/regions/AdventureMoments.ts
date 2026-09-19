import type Phaser from 'phaser';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { ADVENTURE_STATIONS } from '../../data/finalJourney';
import { STORY_MEMORIES } from '../../data/storyCompletion';
import { addSmallText } from '../../ui/PixelFont';
import { journeyMotif } from './FinalParkArt';
import { remember, restoreMemory } from './MemoryDiscoveries';
import type { RegionId } from './definitions';

export function installAdventureMoments(scene:Phaser.Scene,state:GameStateStore,interactions:InteractionSystem,regionId:RegionId):void {
  const ready=()=>!state.snapshot.memories.adventures?.restored&&STORY_MEMORIES.adventures!.fragmentIds.every(id=>state.memoryHasClue('adventures',id));
  for(const station of ADVENTURE_STATIONS.filter(station=>station.regionId===regionId)){
    journeyMotif(scene,station.x,station.y-25,station.motif);
    addSmallText(scene,station.x,station.y+34,station.label,0xf2d69a).setOrigin(.5).setDepth(station.y+35);
    interactions.register({id:station.id,object:scene.add.zone(station.x,station.y+8,1,1),range:24,priority:30,
      prompt:()=>ready()?'Remember our adventures':'Look closer',discoveryCue:'MEMORY_RESONANCE',interact:()=>{
        if(ready()){restoreMemory(scene,state,'adventures');return;}
        remember(scene,state,'adventures',station.fragment);
      },
    });
  }
}
