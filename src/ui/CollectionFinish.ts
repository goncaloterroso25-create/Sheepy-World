import type Phaser from 'phaser';
import { UI_MATERIAL } from './TactileUI';
import type { ScrapbookLivingStage } from './LivingScrapbook';

/** Collection-only material refinement. Other menus/dialogue retain their art. */
export const COLLECTION_MATERIAL = {
  ...UI_MATERIAL, ink:0x40343e, pencil:0x78616a,
  paper:0xead9b9, paperLight:0xf6e8ce, paperEdge:0xcbb697, tape:0xe5cda1,
  cover:0x564250, coverLight:0x826475, fabric:0x768a7b,
  fabricDeep:0x455f56, fabricLight:0x9baa8e, stitch:0xd5c5a3,
  accent:0xa15d64, gold:0xc4a26b,
} as const;

/** Open corner brackets communicate focus through shape, not just color. */
export function collectionFocus(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,color:number):void {
  g.fillStyle(color);
  for(const [cx,cy,sx,sy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){
    g.fillRect(cx!+(sx!<0?-6:0),cy!,8,2);
    g.fillRect(cx!,cy!+(sy!<0?-6:0),2,8);
  }
}

export function finishBookPaper(g:Phaser.GameObjects.Graphics,stage:ScrapbookLivingStage):void {
  const M=COLLECTION_MATERIAL;
  // Stacked leaves and a softly stepped gutter, kept outside all text zones.
  for(const y of [310,312])g.fillStyle(M.paperEdge).fillRect(41,y,261,1).fillRect(335,y,257,1);
  g.fillStyle(M.pencil,.13).fillRect(297,34,5,260).fillRect(332,34,5,260);
  g.fillStyle(M.paperLight,.6).fillRect(291,36,3,257).fillRect(340,34,2,260);
  g.fillStyle(M.pencil,.28).fillRect(49,97,232,1).fillRect(49,99,72,1);
  // Blank margin fibres and cover seams are never clue or progression indicators.
  for(const [x,y] of [[44,119],[47,243],[289,190],[345,122],[580,164],[580,276]]){
    g.fillStyle(M.paperEdge,.6).fillRect(x!,y!,3,1);
  }
  for(let x=36;x<602;x+=11)g.fillStyle(M.coverLight).fillRect(x,318,5,1);
  if(stage!=='PLAIN'){
    g.fillStyle(M.gold,.65).fillRect(47,288,3,1).fillRect(51,286,4,1);
    g.fillStyle(M.paperEdge).fillRect(581,42,9,1).fillRect(586,44,4,1);
  }
  if(stage==='REMEMBERING'||stage==='PERSONAL'){
    g.fillStyle(M.accent).fillRect(597,124,10,23).fillRect(597,147,4,3).fillRect(604,147,3,3);
    g.fillStyle(M.paperLight).fillRect(600,127,1,13);
  }
  if(stage==='PERSONAL'){
    // A repaired page corner and tiny thread; no titles, dates or future icons.
    g.fillStyle(M.tape).fillRect(42,273,6,16).fillRect(39,278,14,5);
    g.fillStyle(M.paperLight).fillRect(43,275,1,12);
    g.fillStyle(M.gold).fillRect(602,266,2,38).fillRect(601,301,4,7);
  }
}

export function finishSatchel(g:Phaser.GameObjects.Graphics):void {
  const M=COLLECTION_MATERIAL;
  // Rolled piping, gusset seams, two quiet brass rivets and a woven lining.
  g.fillStyle(M.fabricLight).fillRect(48,99,2,187).fillRect(348,99,2,187);
  g.fillStyle(M.fabricDeep).fillRect(39,103,4,184).fillRect(354,103,4,184);
  g.fillStyle(M.gold).fillRect(54,91,4,4).fillRect(340,91,4,4);
  g.fillStyle(M.paperLight).fillRect(55,91,2,1).fillRect(341,91,2,1);
  for(let y=117;y<273;y+=11){
    g.fillStyle(M.fabricLight,.4).fillRect(65,y,4,1).fillRect(327,y+3,3,1);
  }
  g.fillStyle(M.fabricDeep).fillRect(83,300,238,2);
  g.fillStyle(M.fabricLight).fillRect(87,298,230,1);
}

export function fitKeepsakeIcon(icon:Phaser.GameObjects.Image,width:number,height:number,maxScale:number):void {
  icon.setScale(Math.max(1,Math.min(maxScale,Math.floor(width/icon.width),Math.floor(height/icon.height))));
}
