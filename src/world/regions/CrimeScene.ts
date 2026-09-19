import type Phaser from 'phaser';
import { addSmallText } from '../../ui/PixelFont';

function solid(group: Phaser.Physics.Arcade.StaticGroup, x:number,y:number,w:number,h:number): void {
  const body=group.create(x+w/2,y+h/2,'collision') as Phaser.Physics.Arcade.Sprite;
  body.setDisplaySize(w,h).setAlpha(0).refreshBody();
}

export function buildCrimeScene(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  const g=scene.add.graphics().setDepth(-50);
  g.fillStyle(0x171824).fillRect(0,0,720,480);
  g.fillStyle(0x6e4b3d).fillRect(24,24,672,432);
  g.fillStyle(0x3b2d2d).fillRect(34,38,652,402);
  for(let y=46;y<438;y+=16){g.fillStyle(y%32?0x604c47:0x67504a).fillRect(36,y,648,15);for(let x=(y%32?44:101);x<680;x+=116)g.fillStyle(0x503e3c).fillRect(x,y,1,15);}
  // Shadowed shop walls, display shelves and an obviously disturbed till.
  g.fillStyle(0x201d25).fillRect(24,24,672,22).fillRect(24,24,22,432).fillRect(674,24,22,432);
  g.fillStyle(0x8a6848).fillRect(72,70,142,62).fillRect(504,70,142,62);
  g.fillStyle(0x2c2730).fillRect(79,78,128,45).fillRect(511,78,128,45);
  for(const x of [90,127,164,522,559,596]){g.fillStyle(0xb99258).fillRect(x,91,12,17);g.fillStyle(0x5b4037).fillRect(x+2,85,8,7);}
  g.fillStyle(0x5f4037).fillRect(88,318,148,44).fillRect(486,306,150,50);
  g.fillStyle(0xa27954).fillRect(88,316,148,7).fillRect(486,304,150,7);
  for(const [x,y,w]of [[88,323,148],[486,311,150]] as const){
    g.fillStyle(0x362b30,.3).fillRect(x+3,y+39,w,4);
    g.fillStyle(0x362b30).fillRect(x+3,y+31,5,9).fillRect(x+w-8,y+31,5,9);
    for(let dx=8;dx<w-15;dx+=44){
      g.fillStyle(0x704c3e).fillRect(x+dx,y+4,38,24);
      g.lineStyle(1,0x987151).strokeRect(x+dx+2,y+6,34,20);
      g.fillStyle(0xc0a16b).fillRect(x+dx+16,y+10,8,2);
    }
    g.fillStyle(0xc5a079).fillRect(x+1,y-6,w-2,1);
  }
  g.fillStyle(0x24212a).fillRect(124,305,30,15).fillRect(525,292,38,18);
  // Restraint over spectacle: covered body, a small blood trace, numbered evidence.
  g.fillStyle(0x4a252b,.58).fillRect(339,197,45,13).fillRect(366,207,23,8);
  g.fillStyle(0x292c34).fillRect(302,165,105,49).fillRect(315,151,67,19);
  g.fillStyle(0x4a4e57).fillRect(311,157,59,4).fillRect(305,171,93,3);
  g.fillStyle(0x181a20).fillRect(326,215,57,5);
  // Closed zipper, handles and a paper tag make this read as a restrained,
  // non-graphic body bag rather than an unexplained pale shape.
  g.fillStyle(0x777d83).fillRect(352,153,2,59);
  for(let y=157;y<207;y+=6)g.fillStyle(0xa1a5a5).fillRect(350,y,6,1);
  g.fillStyle(0x161820).fillRect(317,178,4,22).fillRect(389,178,4,22);
  g.fillStyle(0xd8c37b).fillRect(384,158,18,12);
  g.fillStyle(0x3b3230).fillRect(387,161,12,1).fillRect(387,165,8,1);
  for(const [x,y] of [[112,287],[566,277],[417,294]] as const){g.fillStyle(0xe2c45d).fillRect(x,y,18,15);g.fillStyle(0x282330).fillRect(x+3,y+3,12,9);g.fillStyle(0xf3d977).fillRect(x+7,y+4,3,6);}
  // Police tape reads from the doorway without turning the room into gore scenery.
  g.fillStyle(0xe5c14e).fillRect(48,141,180,4).fillRect(492,141,182,4);
  for(let x=52;x<670;x+=24)g.fillStyle(0x24212b).fillRect(x,141,8,4);
  // Warm shop light, sage wall panels and small curios soften the investigation tableau.
  g.fillStyle(0x51655e).fillRect(235,48,252,67);
  g.fillStyle(0x768578).fillRect(239,52,244,2);
  g.fillStyle(0xdac69a).fillRect(285,63,152,25);
  addSmallText(scene,361,72,'CURIOUS LITTLE THINGS',0x49362f).setOrigin(.5).setDepth(1);
  for(const x of [60,660]){
    g.fillStyle(0xe8c684,.04).fillRect(x-30,58,60,196);
    g.fillStyle(0xe8c684,.07).fillRect(x-18,72,36,128);
    g.fillStyle(0x342c32).fillRect(x-3,82,6,27);
    g.fillStyle(0xeac78e).fillRect(x-9,78,18,13);
    g.fillStyle(0xffe2ae).fillRect(x-6,81,12,7);
  }
  for(const [x,y]of [[95,93],[165,92],[560,95],[600,91]] as const){
    g.fillStyle(0x96a594).fillRect(x,y,9,16);
    g.fillStyle(0xb7c1a5).fillRect(x+2,y+2,3,9);
    g.fillStyle(0xdbc093).fillRect(x-2,y+16,13,2);
  }
  // Physical comparison: the dusty old outline is offset from the stand;
  // the restrained trace continues under it. No extra collision is introduced.
  g.lineStyle(1,0xb8a58c,.8).strokeRect(546,277,24,23);
  for(const [x,y]of [[411,230],[422,237],[436,246],[451,254],[468,263],[490,274],[512,283],[528,294]] as const){
    g.fillStyle(0x784a4d).fillRect(x,y,5,2).fillRect(x+2,y+2,2,2);
  }
  g.fillStyle(0x463b39).fillRect(523,287,22,14);
  g.fillStyle(0xa78159).fillRect(521,285,26,3);
  g.fillStyle(0xe8d6b4).fillRect(126,308,25,7);
  for(const x of [128,135,142])g.fillStyle(0xc5ad75).fillRect(x,309,4,4);
  // A welcome mat frames the safe exit; case notes stay readable in the center.
  g.fillStyle(0x354a48).fillRect(318,423,84,15);
  g.fillStyle(0x7e9480).fillRect(323,426,74,2).fillRect(323,433,74,2);
  // A few sale labels and keepsakes give the counters a purpose beyond evidence boxes.
  g.fillStyle(0xdfc69d).fillRect(185,311,23,8).fillRect(592,299,18,7);
  g.fillStyle(0x9a7f65).fillRect(189,314,12,1).fillRect(596,302,9,1);
  for(const [x,y]of [[70,375],[657,364]] as const){
    g.fillStyle(0x846252).fillRect(x-6,y,14,15);
    g.fillStyle(0xb18969).fillRect(x-8,y,18,4);
    g.fillStyle(0x496455).fillRect(x-10,y-12,9,12).fillRect(x-1,y-20,7,20).fillRect(x+5,y-9,9,10);
    g.fillStyle(0x809079).fillRect(x,y-18,2,15).fillRect(x-8,y-10,2,8);
  }
  const obstacles=scene.physics.add.staticGroup();
  solid(obstacles,0,0,720,24);solid(obstacles,0,0,24,480);solid(obstacles,696,0,24,480);
  solid(obstacles,0,440,328,40);solid(obstacles,392,440,328,40);
  solid(obstacles,72,70,142,62);solid(obstacles,504,70,142,62);
  solid(obstacles,88,316,148,46);solid(obstacles,486,304,150,52);solid(obstacles,302,151,105,68);
  return obstacles;
}
