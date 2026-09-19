import type Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { GAME_EVENTS } from '../../config/constants';
import { BELGIUM_DIALOGUE, JOURNEY_POCKETS, PAPER_WISH, memoryEcho } from '../../data/finalJourney';
import { PHOTO_OPEN, type PersonalPhotoId } from '../../data/personalPhotos';
import { gameEvents } from '../../systems/events';
import { addSmallText } from '../../ui/PixelFont';
import { photoStand } from './FinalParkArt';
import { installFinalCats } from './FinalCats';

export function installFinalJourney(scene:Phaser.Scene,state:GameStateStore,interactions:InteractionSystem,player:Player):void {
  const tell=(title:string,detail:string)=>gameEvents.emit(GAME_EVENTS.notification,{title,detail});
  const target=(id:string,x:number,y:number,prompt:string,interact:()=>void)=>interactions.register({
    id,object:scene.add.zone(x,y,1,1),range:30,priority:25,prompt,discoveryCue:'INTERESTING',interact,
  });
  for(const pocket of JOURNEY_POCKETS){
    target(`journey-${pocket.id}`,215,pocket.y+14,'Look at the photograph',()=>{
      state.setFlag(`journey-seen:${pocket.id}`,'true');gameEvents.emit(PHOTO_OPEN,pocket.photo);
    });
    if(pocket.memory)addSmallText(scene,215,pocket.y+40,
      state.snapshot.memories[pocket.memory]?.restored?'A FAMILIAR PAGE':'A LITTLE MOMENT',0xe8c987).setOrigin(.5).setDepth(pocket.y+41);
  }
  // Neutral wording works even when First Date was the omitted fifth memory.
  target('final-familiarity',320,2540,'Listen',()=>tell('Two seats',memoryEcho(!!state.snapshot.memories['first-date']?.restored)));
  target('final-echoes',320,2260,'Listen to the leaves',()=>tell('One more song',memoryEcho(!!state.snapshot.memories['porto-performance']?.restored)));
  target('final-specificity',435,2030,'Read the tiny label',()=>tell('Cof','Not coffee. Cof. Some things need no translation.'));
  photoStand(scene,432,730);
  target('final-badge',432,744,'Pick up the keepsake badge',()=>{
    state.addArtifact('protagonist-keepsake-badge');gameEvents.emit(PHOTO_OPEN,'badge' satisfies PersonalPhotoId);
  });
  const paper=scene.add.graphics().setDepth(522);
  paper.fillStyle(0x684e42).fillRect(422,491,32,26);
  paper.fillStyle(0xe6d4ac).fillRect(425,494,26,20).fillRect(427,512,8,5);
  for(let i=0;i<3;i++)paper.fillStyle(0x87644b).fillRect(429,499+i*4,17-i*3,1);
  target('final-paper',438,530,'Read the surviving wish',()=>gameEvents.emit(GAME_EVENTS.dialogueStart,{
    id:'final-wish',startNodeId:'0',interaction:{id:'final-wish',mode:'REPEATABLE'},nodes:{'0':{id:'0',speaker:'The last surviving paper',lines:[PAPER_WISH]}},
  }));
  const flag=scene.add.graphics().setDepth(1885);
  flag.fillStyle(0x76513a).fillRect(425,1834,3,48);
  for(const [i,color]of [0x21191a,0xe1b848,0xac463e].entries())flag.fillStyle(color).fillRect(428+i*12,1834,12,24);
  target('final-belgium',446,1892,'Which country?',()=>gameEvents.emit(GAME_EVENTS.dialogueStart,BELGIUM_DIALOGUE));

  const updateCats = installFinalCats(scene, state, player);
  const car=scene.add.container(380,2410).setDepth(2411).setVisible(false);
  const carArt=scene.add.graphics();
  carArt.fillStyle(0x30292d).fillRect(-31,-8,12,16).fillRect(20,-8,12,16);
  carArt.fillStyle(0xe1a942).fillRect(-40,-22,80,23).fillRect(-22,-36,42,14);
  carArt.fillStyle(0x85aaa0).fillRect(-17,-32,32,10);
  carArt.fillStyle(0xffedbd).fillRect(32,-18,6,5);
  car.add(carArt);
  const carLine=addSmallText(scene,380,2373,'I won this time eheheh',0xffedbd).setOrigin(.5).setDepth(2420).setVisible(false);
  let kickedAt=0,lastX=player.x,lastY=player.y;
  let carTime=0;
  const motion=!state.snapshot.settings.reducedCameraMotion;
  const update=():void=>{
    const feet=player.feetPosition;
    if(feet.y<675&&state.flag('final-cats-joined')!=='true')state.setFlag('final-cats-joined','true');
    const joined=state.flag('final-cats-joined')==='true';
    updateCats(joined);
    const camera=scene.cameras.main.worldView;
    if(!state.movement.locked&&Math.abs(feet.y-2440)<45&&camera.contains(car.x,car.y)&&state.flag('final-yellow-car')!=='true'){
      car.setVisible(true);carLine.setVisible(true);state.setFlag('final-yellow-car','true');carTime=scene.time.now;
      tell('Yellow car!','I won this time eheheh');
    }
    if(carTime&&scene.time.now-carTime>3600){car.setVisible(false);carLine.setVisible(false);}
    if(motion&&!state.movement.locked&&scene.time.now-kickedAt>280&&Math.hypot(player.x-lastX,player.y-lastY)>7){
      const leaf=scene.add.rectangle(Math.round(feet.x)+5,Math.round(feet.y),3,2,0xe1a942,.6).setDepth(feet.y+1);
      scene.tweens.add({targets:leaf,x:leaf.x+8,y:leaf.y-5,alpha:0,duration:650,onComplete:()=>leaf.destroy()});
      kickedAt=scene.time.now;lastX=player.x;lastY=player.y;
    }
  };
  if(motion)for(let i=0;i<28;i++){
    const leaf=scene.add.rectangle(120+(i*89)%410,160+(i*107)%2630,2,2,i%2?0xe1a942:0xf2d69a,.55).setDepth(3000);
    scene.tweens.add({targets:leaf,x:leaf.x+16,y:leaf.y+37,alpha:.1,duration:4300+i%4*700,delay:i*120,repeat:-1});
  }
  scene.events.on('postupdate',update);update();
  scene.events.once('shutdown',()=>scene.events.off('postupdate',update));
}
