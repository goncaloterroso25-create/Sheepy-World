import {describe,it,expect} from 'vitest';
import {approachDistance,promptPosition,segmentHitsRect} from '../src/systems/InteractionGeometry';
import {GameStateStore} from '../src/systems/GameStateStore';
import {SaveRepository,createDefaultSave,sanitizeSave} from '../src/systems/SaveSystem';
import {MemoryStorage} from './helpers/MemoryStorage';
import {MEMORIES} from '../src/data/memories';
import {emitterGain} from '../src/systems/SpatialAudio';
import {CIPHER_MESSAGE,CIPHER_SOLUTION,decodeCaesar} from '../src/systems/BedroomCipher';
import {PERSONAL_PHOTOS} from '../src/data/personalPhotos';
import {JOURNEY_PHOTOS} from '../src/data/journeyPhotos';
import {regionSurfaceAt} from '../src/world/regions/RegionSurface';
import {GONCALO_SOLIDS,PORTO_SOLIDS,SNOW_SOLIDS,FOREST_TRUNKS} from '../src/world/regions/ExpansionLayout';
import {WORLD_REGIONS,contains} from '../src/world/regions/definitions';
import {CAT_PERCHES} from '../src/data/cats';

describe('authored Phase 4C contracts',()=>{
 it('treats approach side as staging guidance, ignores the target body, and rejects real walls',()=>{
   const body={x:20,y:20,width:50,height:30};const a={anchor:{x:45,y:65},radius:20,body,approachSide:'down' as const};
   expect(approachDistance({x:45,y:58},a,[body])).toBe(7);
   expect(approachDistance({x:45,y:12},a,[])).toBe(53);
   expect(approachDistance({x:45,y:12},a,[body])).toBe(53);
   expect(approachDistance({x:45,y:95},a,[{x:30,y:77,width:40,height:3}])).toBe(Infinity);
   expect(segmentHitsRect({x:0,y:0},{x:0,y:60},body)).toBe(false);
 });
 it('measures nearest shape edge rather than furniture sprite center',()=>{
   expect(approachDistance({x:29,y:68},{anchor:{x:60,y:80},shape:{x:30,y:70,width:60,height:20}})).toBeCloseTo(Math.sqrt(5));
   const p=promptPosition({x:50,y:100},{x:50,y:100},80,[{x:70,y:60,width:80,height:35}]);
   expect(p.x).not.toBe(110);expect(Math.abs(p.y-75)>18||Math.abs(p.x-50)>50).toBe(true);
 });
 it('keeps complete clue sets unresolved until authored restoration and survives reload',()=>{
   const repository=new SaveRepository(new MemoryStorage());let state=new GameStateStore(repository);
   for(const id of ['first-date','porto-performance']){
     const m=MEMORIES[id]!;expect(state.collectFragment(id,'invented',1)).toBe(false);
     for(const fragment of m.fragmentIds){
       expect(state.collectFragment(id,fragment,1)).toBe(true);expect(state.collectFragment(id,fragment,1)).toBe(false);
       expect(state.snapshot.memories[id]?.restored).toBe(false);
     }
     expect(state.restoreMemory(id)).toBe(true);
   }
   state=new GameStateStore(repository);expect(state.snapshot.memories['porto-performance']?.restored).toBe(true);
   expect(state.completeEncounter('impala-brothers-arrived')).toBe(true);expect(state.completeEncounter('impala-brothers-arrived')).toBe(false);
   expect(state.unlockAchievement('cozy-nap')).toBe(true);expect(state.unlockAchievement('cozy-nap')).toBe(false);
 });
 it.each([1,2,3,4,5,6,7])('migrates schema %i with old IDs, cats and new encounter state preserved',version=>{
   const saved=sanitizeSave({...createDefaultSave(),version,inventory:['prototype-brass-bell','half-glasses'],encounters:['photo-notes-seen','photo-notes-seen'],cats:{tobias:'carried'}});
   expect(saved.inventory).toEqual(['prototype-brass-bell','half-glasses']);expect(saved.cats.tobias).toBe('carried');expect(saved.encounters).toEqual(['photo-notes-seen']);expect(saved.version).toBe(8);
 });
 it('sanitizes false restoration claims and leaves Chicho session-only',()=>{
   expect(sanitizeSave({...createDefaultSave(),memories:{'first-date':{foundFragmentIds:['wrong'],restored:true}}}).memories['first-date']).toEqual({foundFragmentIds:[],restored:false});
   const repository=new SaveRepository(new MemoryStorage()),state=new GameStateStore(repository);state.updateChicho({mode:'carried'});
   expect(state.chicho.mode).toBe('carried');expect(new GameStateStore(repository).chicho.mode).toBe('ground');
 });
 it('preserves four public placeholders alongside the final-journey albums',()=>{
   expect(Object.keys(PERSONAL_PHOTOS)).toEqual([...Object.keys(JOURNEY_PHOTOS),'notes','frame','plate','jeronimo']);
   for(const p of Object.values(PERSONAL_PHOTOS))expect(p.url).toMatch(/^\/assets\/placeholders\//);
   expect(new Set(Object.values(PERSONAL_PHOTOS).map(p=>p.url))).toHaveLength(4);
 });
 it('solves the optional hint without arbitrary code or input evaluation',()=>{
   expect(decodeCaesar(CIPHER_MESSAGE,3)).toBe(CIPHER_SOLUTION);expect(decodeCaesar(CIPHER_MESSAGE,29)).toBe(CIPHER_SOLUTION);
   expect(decodeCaesar('ABC ! 123',-1)).toBe('BCD ! 123');
 });
 it('has a continuous, bounded emitter falloff',()=>{
   expect(emitterGain(0,40,200)).toBe(1);expect(emitterGain(40,40,200)).toBe(1);
   expect(emitterGain(120,40,200)).toBe(.5);expect(emitterGain(201,40,200)).toBe(0);expect(emitterGain(NaN,40,200)).toBe(0);
 });
 it('selects physical material at feet and never invents a grass fallback indoors',()=>{
   expect(regionSurfaceAt('goncalo-home',{x:945,y:760})).toBe('tile');expect(regionSurfaceAt('goncalo-home',{x:888,y:230})).toBe('carpet');
   expect(regionSurfaceAt('home-interior',{x:530,y:210})).toBe('tile');expect(regionSurfaceAt('old-world-festival',{x:704,y:1780})).toBe('wood');
   expect(regionSurfaceAt('snow-highlands',{x:640,y:550})).toBe('snow');
 });
 it('keeps new region arrivals and cat perches outside solid bodies',()=>{
   const solids={'goncalo-home':GONCALO_SOLIDS,porto:PORTO_SOLIDS,'snow-highlands':SNOW_SOLIDS};
   for(const id of ['goncalo-home','porto','snow-highlands']as const){
     for(const p of Object.values(WORLD_REGIONS[id].entries))expect(solids[id].some(r=>contains(r,{x:p.x,y:p.y+11},7)),id).toBe(false);
     for(const p of CAT_PERCHES.filter(p=>p.regionId===id))expect(solids[id].some(r=>contains(r,{x:p.x,y:p.y+11},7)),p.id).toBe(false);
   }
   for(const p of CAT_PERCHES.filter(p=>p.id.startsWith('forest')))expect(FOREST_TRUNKS.some(r=>contains(r,{x:p.x,y:p.y+11},7)),p.id).toBe(false);
 });
});
