import type Phaser from 'phaser';
import { addBodyText, addHeadingText, addSmallText } from './PixelFont';
import { addControlHint } from './ControllerGlyphs';

export const ENDING_SETTLE_MS = 6200;

/** A living keepsake, held indefinitely. UIScene alone owns the exit input. */
export function createFinaleView(scene:Phaser.Scene,reducedMotion:boolean):Phaser.GameObjects.Container {
  const root=scene.add.container(0,0).setDepth(10000);
  const art=scene.add.graphics();root.add(art);
  art.fillStyle(0x343c42).fillRect(0,0,640,360);
  art.fillStyle(0x697565).fillRect(42,18,556,314);
  art.fillStyle(0x8b9277).fillRect(76,36,488,284);
  art.fillStyle(0xb6aa84).fillEllipse(320,214,430,212);
  art.fillStyle(0xc9b790).fillEllipse(320,216,350,164);
  art.fillStyle(0xdcc9a2).fillEllipse(320,210,276,128);
  art.fillStyle(0x504b43,.25).fillEllipse(320,244,176,28);
  art.fillStyle(0x8c6062).fillRect(246,225,148,41);
  art.fillStyle(0xe3cba9).fillRect(250,228,140,34);
  for(let x=255;x<390;x+=18)art.fillStyle(0xbc8984).fillRect(x,228,3,34);
  for(let y=233;y<262;y+=10)art.fillStyle(0xbc8984).fillRect(250,y,140,2);
  for(const x of [284,348]){
    art.fillStyle(0x725245).fillRect(x,247,10,3);
    art.fillStyle(0xf4e2be).fillRect(x+1,239,7,8).fillRect(x+8,241,3,4);
  }
  art.fillStyle(0x9c7050).fillRect(264,223,15,14);
  art.lineStyle(2,0x9c7050).strokeRect(267,218,9,8);
  const trees=[[40,166,0],[603,170,1],[112,82,1],[535,80,2]] as const;
  for(const [x,y,i]of trees)root.add(scene.add.image(x,y,`final-tree-${i}`).setOrigin(.5,1).setScale(1.35));
  const protagonist=scene.add.image(310,239,'player-seated').setOrigin(.5,1).setScale(2);
  const goncalo=scene.add.image(340,239,'final-goncalo-seated').setOrigin(.5,1).setScale(2);
  root.add([protagonist,goncalo]);
  const cats=['teemi','tobias','chicho'].map((name,i)=>scene.add.image([236,406,370][i]!,[258,255,276][i]!,`cat-${name}-idle`).setOrigin(.5,1).setScale(2));
  root.add(cats);
  const heart=scene.add.graphics();heart.fillStyle(0xc67f83).fillRect(320,177,3,3).fillRect(325,177,3,3).fillRect(321,180,6,3).fillRect(323,183,2,2);root.add(heart);
  const heading=addSmallText(scene,320,34,'SHEEPY WORLD: A CHEEKY TALE',0xffedce).setOrigin(.5);
  const complete=addHeadingText(scene,320,80,'YEAR ONE COMPLETE.',0xffedce).setOrigin(.5).setAlpha(0);
  const next=addBodyText(scene,320,113,'YEAR TWO COMING SOON....',0xffe1ad).setOrigin(.5).setAlpha(0);
  const dedication=addSmallText(scene,320,298,'A little world, made with love.',0xffedce).setOrigin(.5).setAlpha(0);
  const hint=addControlHint(scene,'back','RETURN WHEN YOU ARE READY',320,340,0xd4c7ad,'center').setAlpha(0);
  root.add([heading,complete,next,dedication,hint]);
  const tweens:Phaser.Tweens.Tween[]=[];
  const tween=(config:Phaser.Types.Tweens.TweenBuilderConfig):void=>{tweens.push(scene.tweens.add(config));};
  tween({targets:complete,alpha:1,delay:700,duration:reducedMotion?1:800});
  tween({targets:next,alpha:1,delay:3400,duration:reducedMotion?1:900});
  tween({targets:dedication,alpha:1,delay:4700,duration:600});
  tween({targets:hint,alpha:1,delay:ENDING_SETTLE_MS,duration:600});
  if(!reducedMotion){
    cats.forEach((cat,i)=>tween({targets:cat,y:cat.y-1,duration:1250+i*170,yoyo:true,repeat:-1,hold:900}));
    tween({targets:heart,alpha:.4,duration:2200,yoyo:true,repeat:-1});
    for(let i=0;i<25;i++){
      const mote=scene.add.rectangle(65+(i*83)%510,133+(i*41)%157,i%3?2:3,2,i%3?0xf5d99d:0xd6a2a0,.7);root.add(mote);
      tween({targets:mote,y:mote.y-12,x:mote.x+6,alpha:.15,duration:2300+(i%5)*430,delay:i*70,yoyo:true,repeat:-1});
    }
  }
  root.once('destroy',()=>tweens.forEach(t=>t.remove()));
  return root;
}
