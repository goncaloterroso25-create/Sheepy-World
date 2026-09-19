import type { PairPoint } from '../systems/TogetherMotion';
import type { RegionId, Rect } from '../world/regions/definitions';
export interface TogetherActivity {
  id: string; region: RegionId; kind: 'COUCH' | 'SHEEPING' | 'COF'; label: string;
  approach: PairPoint; seats: readonly [PairPoint, PairPoint]; tv?: Rect;
}
// Feet anchors on existing furniture; no new walls, rooms, solo interactions or save positions.
export const TOGETHER_ACTIVITIES: readonly TogetherActivity[] = [
  { id:'together-home-tv', region:'home-interior', kind:'COUCH', label:'Watch together', approach:{x:306,y:760}, seats:[{x:296,y:694},{x:315,y:694}], tv:{x:260,y:448,width:86,height:35} },
  { id:'together-goncalo-tv', region:'goncalo-home', kind:'COUCH', label:'Watch together', approach:{x:880,y:350}, seats:[{x:870,y:284},{x:889,y:284}], tv:{x:826,y:84,width:114,height:35} },
  { id:'together-home-bed', region:'home-interior', kind:'SHEEPING', label:'Sheep together', approach:{x:186,y:194}, seats:[{x:108,y:162},{x:130,y:162}] },
  { id:'together-goncalo-bed', region:'goncalo-home', kind:'SHEEPING', label:'Sheep together', approach:{x:252,y:228}, seats:[{x:136,y:174},{x:158,y:174}] },
  { id:'together-home-cof', region:'home-interior', kind:'COF', label:'COF together', approach:{x:580,y:542}, seats:[{x:571,y:548},{x:590,y:548}] },
  { id:'together-goncalo-cof', region:'goncalo-home', kind:'COF', label:'COF together', approach:{x:808,y:680}, seats:[{x:794,y:680},{x:813,y:680}] },
  { id:'together-porto-cof', region:'porto', kind:'COF', label:'COF together', approach:{x:405,y:426}, seats:[{x:390,y:426},{x:409,y:426}] },
];
