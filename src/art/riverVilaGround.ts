import type Phaser from 'phaser';
import { RIVER_BANKS, RIVER_PAVING, RIVER_WALLS, VILA_PAVING, VILA_ROADS, VILA_WALLS } from '../world/regions/layouts';
import { DAY as D, dayPaving, dayWall } from './townDayArt';
import { pixelOval, softBox } from './styleProofShapes';

function garden(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number):void {
  g.fillStyle(D.grassLight,.4);softBox(g,x,y,w,h,14);
  // Edge clusters only: no scatter over roads, gates or interaction approaches.
  for(let dx=10;dx<w-12;dx+=37){
    g.fillStyle(D.grassDeep,.38).fillRect(x+dx,y+h-9,3,4).fillRect(x+dx+4,y+h-12,2,7);
    g.fillStyle(D.grassLight).fillRect(x+dx+12,y+8,7,2);
  }
}

export function riverGround(g:Phaser.GameObjects.Graphics):void {
  g.fillStyle(D.grass).fillRect(0,0,3072,1792);
  for(const [x,y,w,h] of [[32,1180,960,470],[310,674,500,260],[1530,636,330,454],[2210,360,790,220]])garden(g,x!,y!,w!,h!);
  for(const b of RIVER_BANKS){
    const w=b.right-b.left;
    g.fillStyle(0x456e73).fillRect(b.left,b.y,w,b.height);
    g.fillStyle(0x5f8b89).fillRect(b.left+12,b.y,w-24,b.height);
    g.fillStyle(0x79a49a,.45).fillRect(b.left+35,b.y,w-78,b.height);
    for(let yy=b.y+8,i=0;yy<b.y+b.height-18;yy+=28,i++){
      const off=(i*19)%37;
      g.fillStyle(0xa9c7b0,.4).fillRect(b.left+45+off,yy,38+i%3*12,1);
      g.fillStyle(0x91b9ac,.6).fillRect(b.right-66-off,yy+13,23,2);
      g.fillStyle(0x456e73,.4).fillRect(b.left+18,yy+4,9+i%3*4,7);
      g.fillStyle(D.stoneDeep).fillRect(b.left,yy,7,12).fillRect(b.right-6,yy+4,6,9);
    }
    for(let yy=b.y+60;yy<b.y+b.height-20;yy+=102){
      g.fillStyle(D.grassDeep).fillRect(b.left+5,yy,2,13).fillRect(b.left+9,yy-4,2,17);
      g.fillStyle(D.leafLight).fillRect(b.left+6,yy+2,1,8);
    }
  }
  RIVER_PAVING.forEach((r,i)=>dayPaving(g,r,[2,3,11,13].includes(i)));
  RIVER_WALLS.forEach(r=>dayWall(g,r));
  for(const [x,start,end,w] of [[224,1056,1240,64],[980,1112,1320,84],[810,495,730,60],[1060,40,380,56]]){
    for(let y=start!;y<end!;y+=16){
      g.fillStyle(D.stoneDeep).fillRect(x!,y,w!,4);
      g.fillStyle(D.stoneLight).fillRect(x!+1,y+4,w!-2,3);
      g.fillStyle(D.seam).fillRect(x!+2,y+8,w!-4,1);
      g.fillStyle(D.stoneLight,.45).fillRect(x!+7,y+11,w!-14,1);
    }
  }
  // Arch faces are downstream of the original bridge blocker; deck stays exact.
  g.fillStyle(0x425e63,.3).fillRect(1116,1115,292,18);
  g.fillStyle(D.stoneDeep).fillRect(1116,1088,292,32);
  g.fillStyle(D.stone).fillRect(1116,1089,292,9);
  for(const ax of [1130,1230,1330]){
    g.fillStyle(0x35595f).fillRect(ax,1104,64,23).fillRect(ax+5,1098,54,10).fillRect(ax+14,1093,36,9);
    g.fillStyle(D.stoneLight).fillRect(ax-4,1104,4,17).fillRect(ax+64,1104,4,17)
      .fillRect(ax+3,1097,10,3).fillRect(ax+51,1097,10,3).fillRect(ax+17,1090,30,3);
    g.fillStyle(D.stoneDeep).fillRect(ax+28,1089,5,7);
    g.fillStyle(0xa9c7b0,.5).fillRect(ax+13,1140,40,1);
  }
  for(const x of [1098,1398])for(const y of [968,1072]){
    g.fillStyle(D.stoneDeep).fillRect(x,y,18,29);
    g.fillStyle(D.stone).fillRect(x+2,y+2,13,23);
    g.fillStyle(D.stoneLight).fillRect(x-1,y-3,20,4);
  }
  for(const y of [800,1460]){
    g.fillStyle(D.shadow).fillRect(1104,y,17,14);
    for(const x of [1107,1112,1117])g.fillStyle(D.stoneDeep).fillRect(x,y,2,14);
  }
  for(const [x,y,w] of [[368,1230,125],[736,910,38],[1570,721,204],[2390,379,68],[2822,366,149]]){
    g.fillStyle(D.woodDeep);softBox(g,x!,y!,w!,16,3);
    g.fillStyle(D.grassDeep);softBox(g,x!+2,y!-5,w!-4,17,5);
    for(let dx=6;dx<w!-8;dx+=17){
      g.fillStyle(D.leaf);pixelOval(g,x!+dx,y!-7,18,13);
      g.fillStyle(dx%3?0xc39eac:D.cream).fillRect(x!+dx+5,y!-6,3,3);
    }
    g.fillStyle(D.stoneLight).fillRect(x!,y!+14,w!,2);
  }
  g.fillStyle(0x7f8886).fillRect(910,342,219,49);
  g.fillStyle(D.stoneLight).fillRect(908,388,223,4);
  g.fillStyle(D.stone).fillRect(917,351,3,31).fillRect(1115,351,3,31);
}

export function vilaGround(g:Phaser.GameObjects.Graphics):void {
  g.fillStyle(D.grass).fillRect(0,0,1152,1056);
  for(const [x,y,w,h] of [[82,196,226,248],[362,118,212,270],[700,94,340,282],[192,776,298,236],[832,760,258,224]])garden(g,x!,y!,w!,h!);
  VILA_PAVING.forEach(r=>dayPaving(g,r));
  for(const {x,y,width:w,height:h} of VILA_ROADS){
    g.fillStyle(0x717d7d).fillRect(x,y,w,h);
    g.fillStyle(0x89938d).fillRect(x+2,y+2,w-4,h-4);
    g.fillStyle(0x9ca39a,.35).fillRect(x+7,y+7,w-14,h-14);
    const horizontal=w>h;
    for(let n=26;n<(horizontal?w:h)-12;n+=63){
      g.fillStyle(0xabb1a3,.4).fillRect(x+(horizontal?n:12),y+(horizontal?13:n),horizontal?13:2,horizontal?2:13);
    }
  }
  VILA_WALLS.forEach(r=>dayWall(g,r));
  for(const [x,y,w] of [[91,184,208],[370,106,197],[710,82,314],[205,796,50],[1068,804,16]]){
    g.fillStyle(D.grassDeep);softBox(g,x!,y!,w!,15,4);
    for(let dx=0;dx<w!-8;dx+=14){g.fillStyle(D.leaf);pixelOval(g,x!+dx,y!-4,17,13);g.fillStyle(D.leafLight).fillRect(x!+dx+4,y!-3,7,2);}
  }
  for(const [x,y,gap] of [[178,444,60],[444,388,60],[790,376,92],[920,984,56]]){
    for(const post of [x!,x!+gap!]){
      g.fillStyle(D.stoneDeep).fillRect(post,y!-6,4,26);
      g.fillStyle(D.stoneLight).fillRect(post-2,y!-8,8,3);
    }
    g.fillStyle(D.woodDeep).fillRect(x!-14,y!-5,16,3).fillRect(x!-14,y!+8,16,3);
    for(let dx=-13;dx<0;dx+=5)g.fillStyle(D.wood).fillRect(x!+dx,y!-5,2,16);
  }
  g.fillStyle(D.woodDeep);softBox(g,815,333,42,14,2);
  g.fillStyle(D.cream).fillRect(818,335,36,1).fillRect(818,343,36,1);
  for(const [x,y] of [[168,457],[435,400],[882,394]]){
    g.fillStyle(D.woodDeep).fillRect(x!,y!,3,14);
    g.fillStyle(0xad7577);softBox(g,x!-4,y!-4,12,8,2);
    g.fillStyle(D.cream).fillRect(x!-2,y!-3,6,1);
    g.fillStyle(D.shadow).fillRect(x!-2,y!-1,7,1);
  }
  for(const [x,y] of [[295,559],[723,511],[633,748]]){
    g.fillStyle(D.stoneDeep).fillRect(x!,y!,14,8);
    for(let dx=2;dx<13;dx+=4)g.fillStyle(D.stone).fillRect(x!+dx,y!+1,1,6);
  }
  for(const x of [714,740,963,994]){
    g.fillStyle(D.roofDeep);softBox(g,x,350,16,7,2);
    g.fillStyle(D.leaf).fillRect(x+4,342,8,10);
    g.fillStyle(0xc39eac).fillRect(x+3,339,9,5);
    g.fillStyle(D.cream).fillRect(x+6,340,2,2);
  }
}
