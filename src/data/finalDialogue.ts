import type { DialogueDefinition, DialogueNode } from '../types/game';
import { letterPages } from './finalLetter';

function conversation(id:string,lines:readonly (readonly [string,string])[],event?:string):DialogueDefinition {
  const nodes:Record<string,DialogueNode>={};
  lines.forEach(([speaker,line],i)=>{nodes[String(i)]={id:String(i),speaker,lines:[line],
    ...(i+1<lines.length?{nextId:String(i+1)}:{onCompleteEvent:event})};});
  return {id,startNodeId:'0',nodes,interaction:{id,mode:'REPEATABLE'},worldFocus:{x:365,y:180}};
}
export const FINAL_AUTHOR_DIALOGUE=conversation('final-author',[
  ...letterPages().map((line,i)=>[`Gonçalo · ${i+1} / ${letterPages().length}`,line] as const),
  ['Gonçalo','A little further. I am here.'],
],'final-author-read');
export const FINAL_MEETING_DIALOGUE=conversation('final-meeting',[
  ['Protagonist','I found you.'],
  ['Gonçalo',"I knew you'd find me. eheheh"],
  ['','The last few steps are behind her. He leaves the space beside him open.'],
  ['Protagonist','All of this... for me?'],
  ['Gonçalo','For you. For the things I wanted us to keep.'],
  ['Protagonist','Even the very ordinary things.'],
  ['Gonçalo','Especially those.'],
  ['Gonçalo','I could not fit a whole year into a world. Just enough little pieces to bring you here.'],
  ['Protagonist','I think I knew you were here before I knew why.'],
  ['Protagonist','Stay here with me a little?'],
  ['Gonçalo','Of course.'],
  ['','For a little while, there is nowhere else to go.'],
  ['Protagonist','One important question. Did you bring cof?'],
  ['Gonçalo','I was not going to risk the ending.'],
  ['','Two cups. A place kept. Nothing more to prove.'],
],'final-meeting-finished');
export const FINAL_AFTER_DIALOGUE=conversation('final-together',[
  ['Gonçalo','No hurry. The paths are still there.'],['Protagonist','So are we.'],
]);
FINAL_MEETING_DIALOGUE.nodes['1']!.onEnterEvent='finale-voice:found-player';
