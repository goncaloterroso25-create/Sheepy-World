import Phaser from 'phaser';
import './styles.css';
import { createGameConfig } from './config/game';
import { AudioSystem } from './systems/AudioSystem';
import { GameStateStore } from './systems/GameStateStore';
import { installPixelPerfectScaling } from './systems/PixelScaleManager';
import { SaveRepository } from './systems/SaveSystem';
import { sanitizeWorldLocation } from './world/regions/definitions';
import { STORY_FLAGS } from './data/storyCompletion';

declare global {
  interface Window {
    __SHEEPY_DEV__?: {
      resetSave: () => void;
      getState: () => unknown;
      getUiState?: () => unknown;
      getWorld?: () => unknown;
      getAudioMix: () => unknown;
      logAudioMix: () => unknown;
    };
  }
}

let repository = new SaveRepository(window.localStorage);
// Preview fixtures must never read, clear, migrate, or mutate the normal save.
const previewMode=import.meta.env.DEV?new URLSearchParams(window.location.search).get('preview'):null;
if (import.meta.env.DEV && (previewMode === 'region' || previewMode === 'memory-reveal' || previewMode === 'computer')) {
  let serialized: string | null = null;
  repository = new SaveRepository({ getItem: () => serialized,
    setItem: (_key, value) => { serialized = value; }, removeItem: () => { serialized = null; } });
}
const state = new GameStateStore(repository);
if (import.meta.env.DEV) {
  const query = new URLSearchParams(window.location.search);
  const regionPreview=query.get('preview')==='region';
  const view=query.get('view')??'';
  if(query.get('preview')==='memory-reveal'&&query.get('seen')==='1'){
    state.setFlag(`memory-reveal-seen:${query.get('memory')??'first-date'}`,'true');
  }
  if (regionPreview) state.arriveAt(sanitizeWorldLocation({ regionId: query.get('region'), entryId: query.get('entry') }));
  if (regionPreview && view.startsWith('together')) state.setFlag(STORY_FLAGS.complete, 'true');
  const collect=(memoryId:string,fragments:readonly string[]):void=>fragments.forEach(fragment=>state.collectFragment(memoryId,fragment,fragments.length));
  const seedMentalist=(clues=false,deduction=false,knife?:'carried'|'handed-over'|'forensics'):void=>{
    state.completeEncounter('mentalist-honorary');
    if(clues)for(const id of ['mentalist-clue-till','mentalist-clue-cabinet','mentalist-clue-blood'])state.completeEncounter(id);
    if(deduction)state.completeEncounter('mentalist-deduction-solved');
    if(knife){state.completeEncounter('mentalist-knife-picked');state.setFlag('mentalist-knife',knife);}
  };
  if(regionPreview&&view==='mentalist-clues')seedMentalist();
  if(regionPreview&&view==='mentalist-deduction')seedMentalist(true);
  if(regionPreview&&view==='mentalist-evidence')seedMentalist(true,true);
  if(regionPreview&&view==='mentalist-carried')seedMentalist(true,true,'carried');
  if(regionPreview&&view==='mentalist-handover')seedMentalist(true,true,'handed-over');
  if(regionPreview&&view==='mentalist-resolved'){
    seedMentalist(true,true,'forensics');state.completeEncounter('mentalist-case-resolved');
    state.collectFragment('first-date','first-date-sleep',3);
  }
  if(regionPreview&&view==='performance-poster-seen')state.collectFragment('porto-performance','performance-fourth-date',3);
  if (query.get('preview') === 'region' && query.get('view') === 'performance-restored') {
    collect('porto-performance',['performance-fourth-date','performance-night','performance-venue']);
    state.restoreMemory('porto-performance');state.completeEncounter('performance-concert-awake');
  }
  if (query.get('preview') === 'region' && query.get('view') === 'performance-active') {
    collect('porto-performance',['performance-fourth-date','performance-night']);
    state.completeEncounter('performance-concert-awake');
  }
  if(regionPreview&&(view==='snow-ready'||view==='snow-restored')){
    state.setFlag('snow-car-stage','3');
    collect('snow-day',['snow-jeronimo','snow-weather','snow-play']);
    if(view==='snow-restored'){state.setFlag('snow-jeronimo-built','true');state.restoreMemory('snow-day');}
  }
  if(regionPreview&&view==='snow-brushed'){
    state.setFlag('snow-car-stage','3');state.collectFragment('snow-day','snow-jeronimo',3);
  }
  if(regionPreview&&view.startsWith('computer-unread-')){
    const memoryId=view.slice('computer-unread-'.length);
    const fragments:Record<string,readonly string[]>={
      'first-date':['first-date-sleep','first-date-bench','first-date-car'],
      'porto-performance':['performance-fourth-date','performance-night','performance-venue'],
      'snow-day':['snow-jeronimo','snow-weather','snow-play'],
    };
    const found=fragments[memoryId];
    if(found){state.discoverMemoryComputer();collect(memoryId,found);state.restoreMemory(memoryId);state.queueComputerMemoryUpdate(memoryId);}
  }
  if(query.get('preview')==='region' && query.get('view')==='memory-pages') {
    for(const fragment of ['first-date-sleep','first-date-bench','first-date-car'])state.collectFragment('first-date',fragment,3);
    for(const fragment of ['performance-fourth-date','performance-night','performance-venue'])state.collectFragment('porto-performance',fragment,3);
    state.restoreMemory('first-date');state.restoreMemory('porto-performance');
  }
  if(query.get('preview')==='region' && query.get('view')==='home-sleep-carry') {
    const destination=state.snapshot.worldLocation;
    state.arriveAt({regionId:'vila-meow',entryId:'from-river'});
    state.carryTobias();
    state.arriveAt(destination);
  }
  if(query.get('preview')==='region' && query.get('view')==='dean-sam')state.completeEncounter('impala-brothers-arrived');
}
const audio = new AudioSystem(() => state.snapshot.settings);
state.subscribe(() => audio.refreshMix());
const gameRoot = document.querySelector<HTMLElement>('#game');
if (!gameRoot) throw new Error('Game root element is missing.');

if (import.meta.env.DEV) {
  window.__SHEEPY_DEV__ = {
    resetSave: () => {
      state.reset();
      window.location.reload();
    },
    getState: () => state.snapshot,
    getAudioMix:()=>audio.effectiveGainSnapshot(),
    logAudioMix:()=>{const snapshot=audio.effectiveGainSnapshot();console.info('[Sheepy World audio mix]',snapshot);return snapshot;},
  };
}

const game = new Phaser.Game(createGameConfig(state, audio));
installPixelPerfectScaling(gameRoot, () => game.scale?.updateBounds());
