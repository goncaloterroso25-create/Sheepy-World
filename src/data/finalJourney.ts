import type { PersonalPhotoId } from './personalPhotos';
import type { DialogueDefinition } from '../types/game';

export const FINAL_PARK_HEIGHT=2880;
export const JOURNEY_POCKETS:readonly {id:string;y:number;photo:PersonalPhotoId;motif:string;memory?:string}[]=[
  {id:'first-date',y:2510,photo:'firstDate',motif:'bench',memory:'first-date'},
  {id:'performance',y:2250,photo:'performanceDate',motif:'music',memory:'porto-performance'},
  {id:'everyday',y:2000,photo:'everyday',motif:'couch',memory:'everyday-us'},
  {id:'snow',y:1740,photo:'winter',motif:'snow',memory:'snow-day'},
  {id:'eclipse',y:1510,photo:'eclipse',motif:'eclipse',memory:'adventures'},
  {id:'buggy',y:1350,photo:'buggy',motif:'buggy'},
  {id:'festival-clue',y:1190,photo:'festival-clue',motif:'festival-clue'},
  {id:'travel-clue',y:990,photo:'travel-clue',motif:'climb'},
  {id:'sleepy',y:800,photo:'sleepy',motif:'couch'},
  {id:'pets',y:610,photo:'pets',motif:'basket'},
  {id:'keepsake',y:420,photo:'keepsake',motif:'heart'},
];
export const PAPER_WISH='[A private personal wish has been omitted from the public portfolio edition.]';
export function memoryEcho(restored:boolean):string {
  return restored?'A little echo of a page you have restored.':'A photograph, waiting quietly for you.';
}
export const BELGIUM_DIALOGUE:DialogueDefinition={id:'final-belgium',startNodeId:'flag',interaction:{id:'final-belgium',mode:'REPEATABLE'},nodes:{
  flag:{id:'flag',speaker:'Gonçalo, on a little card',lines:['Quick question... which country is this?'],choices:[
    {id:'belgium',label:'Belgium',nextId:'right'},{id:'germany',label:'Germany',nextId:'germany'},
  ]},
  right:{id:'right',speaker:'The card',lines:['Belgium! Suspiciously good. eheheh']},
  germany:{id:'germany',speaker:'The card',lines:['Germany?! The stripes are standing up! ehehehe. Still my favourite travel companion.']},
}};
// Public-edition station IDs remain stable within this source snapshot.
export const ADVENTURE_STATIONS=[
  {id:'adventure-festival-clue',regionId:'old-world-festival',fragment:'adventures-flags',label:'FESTIVAL MASK',x:346,y:690,motif:'festival-clue',line:'A towering mask, bells, and laughter in the crowd.'},
  {id:'adventure-buggy',regionId:'river-town',fragment:'adventures-cup',label:'DUST & WIND',x:820,y:1550,motif:'buggy',line:'Dust everywhere. Wind in our hair. Every detour became a story.'},
  {id:'adventure-eclipse',regionId:'porto',fragment:'adventures-view',label:'QUIET SKY',x:470,y:740,motif:'eclipse',line:'The sky went quiet. For a little while we just stood there, looking up together.'},
] as const;
