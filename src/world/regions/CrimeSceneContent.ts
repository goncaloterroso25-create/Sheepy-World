import type Phaser from 'phaser';
import { GAME_EVENTS, REGISTRY_KEYS } from '../../config/constants';
import {
  JANE_CASE_DIALOGUE,
  LISBON_DIALOGUE,
  MENTALIST_DEDUCTION_DIALOGUE,
  MENTALIST_INTRO,
  MENTALIST_LISBOOOON_CALLBACK,
  MENTALIST_LISBOOOON_EVENT,
  MENTALIST_LISBOOOON_V2_FLAG,
  MENTALIST_RESOLUTION_DIALOGUE,
} from '../../data/namedDialogues';
import type { Player } from '../../entities/Player';
import type { AudioSystem } from '../../systems/AudioSystem';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { SpatialAudio } from '../../systems/SpatialAudio';
import { gameEvents } from '../../systems/events';
import { remember } from './MemoryDiscoveries';
import { addSmallText } from '../../ui/PixelFont';
import { CASE_COMPARISON_FLAG, CASE_OBSERVATIONS, MENTALIST_CASE_CLUES, MENTALIST_COMPARISON,
  canDeduceCase, caseNotebook, hasCaseClues, mentalistCaseStage, type MentalistCaseStage } from '../../data/mentalistCase';
export { MENTALIST_CASE_CLUES, mentalistCaseStage } from '../../data/mentalistCase';

export function installCrimeSceneContent(
  scene: Phaser.Scene,
  state: GameStateStore,
  interactions: InteractionSystem,
  player: Player,
): () => void {
  const audio = scene.registry.get(REGISTRY_KEYS.audio) as AudioSystem;
  const jane = scene.add.image(174, 409, 'cameo-jane-0').setOrigin(.5, 1).setDepth(409);
  const lisbon = scene.add.image(246, 409, 'cameo-lisbon-0').setOrigin(.5, 1).setDepth(409);
  const knife = scene.add.graphics().setDepth(300);
  knife.fillStyle(0xd9dde3).fillRect(417,282,18,3).fillRect(432,281,7,5);
  knife.fillStyle(0x7d513d).fillRect(407,281,11,5);
  knife.fillStyle(0x24212b).fillRect(410,282,2,3);

  // Temporary evidence is shown in Protagonist's hand, never in the Bag or the
  // Tobias shoulder slot. Its persisted flag survives exits and reloads.
  const carriedKnife = scene.add.graphics().setDepth(5000);
  carriedKnife.fillStyle(0x7d513d).fillRect(0,1,5,3);
  carriedKnife.fillStyle(0xd9dde3).fillRect(5,1,10,2).fillRect(14,0,3,4);
  const hasAllClues = (): boolean => hasCaseClues(state.snapshot);
  const stage = (): MentalistCaseStage => mentalistCaseStage(state.snapshot);
  // A small field notebook belongs to the room, below the evidence and above the investigators.
  const paper=scene.add.graphics().setDepth(369);
  paper.fillStyle(0x302633).fillRect(279,359,188,34);
  paper.fillStyle(0xe8d7b5).fillRect(276,356,188,34);
  paper.fillStyle(0xa86757).fillRect(281,361,2,24);
  const progress=addSmallText(scene,289,362,'',0x49362f).setDepth(370);
  const marks=CASE_OBSERVATIONS.map((_,i)=>addSmallText(scene,[112,566,414][i]!,[279,267,246][i]!,String(i+1),0xf2deab).setDepth(370));
  const refreshEvidence = (): void => {
    knife.setVisible(stage() === 'EVIDENCE' && !state.snapshot.encounters.includes('mentalist-knife-picked'));
    carriedKnife.setVisible(state.flag('mentalist-knife') === 'carried');
    const count=MENTALIST_CASE_CLUES.filter(id=>state.snapshot.encounters.includes(id)).length;
    progress.setText(stage()==='INTRO'?'FIELD NOTES\nSPEAK TO LISBON':stage()==='RESOLVED'?'CASE CLOSED\nA DETAIL TO REMEMBER':
      stage()==='EVIDENCE'?'CHECK THE HIDDEN OBJECT':stage()==='HANDOVER'?'BRING EVIDENCE TO LISBON':
      `OBSERVED ${count} / 3\n${hasAllClues()?(canDeduceCase(state.snapshot)?'TEST YOUR THEORY':'COMPARE WITH LISBON'):'TILL / CABINET / TRACE'}`);
    marks.forEach((mark,i)=>mark.setTint(state.snapshot.encounters.includes(MENTALIST_CASE_CLUES[i]!)?0x97baa5:0xf2deab));
  };
  refreshEvidence();
  const unsubscribe = state.subscribe(refreshEvidence);

  const talk = (person: 'jane'|'lisbon'): void => {
    const current = stage();
    if (current === 'INTRO') {
      gameEvents.emit(GAME_EVENTS.dialogueStart, MENTALIST_INTRO);
      return;
    }
    if (current === 'HANDOVER') {
      state.setFlag('mentalist-knife-handed-to', person);
      state.setFlag('mentalist-knife', 'handed-over');
      gameEvents.emit(GAME_EVENTS.dialogueStart, MENTALIST_RESOLUTION_DIALOGUE);
      return;
    }
    if (current === 'DEDUCTION') {
      gameEvents.emit(GAME_EVENTS.dialogueStart, canDeduceCase(state.snapshot)?MENTALIST_DEDUCTION_DIALOGUE:MENTALIST_COMPARISON);
      return;
    }
    if (state.flag(MENTALIST_LISBOOOON_V2_FLAG) !== 'true') {
      gameEvents.emit(GAME_EVENTS.dialogueStart, MENTALIST_LISBOOOON_CALLBACK);
      return;
    }
    gameEvents.emit(GAME_EVENTS.dialogueStart, person === 'jane' ? JANE_CASE_DIALOGUE : LISBON_DIALOGUE);
  };
  const personTarget = (person: 'jane'|'lisbon', object: Phaser.GameObjects.Image, priority: number): void => {
    interactions.register({
      id: person === 'jane' ? 'patrick-jane' : 'teresa-lisbon',
      object,
      prompt: () => stage() === 'HANDOVER'
        ? state.flag('mentalist-knife') === 'carried' ? 'Hand over knife' : 'Finish handover'
        : stage()==='DEDUCTION'?(canDeduceCase(state.snapshot)?'Test your theory':'Compare clues'):'Talk',
      priority,
      discoveryCue:'IMPORTANT_NPC',
      approach:{anchor:{x:object.x,y:418},shape:{x:object.x-22,y:403,width:44,height:23},radius:48,preferredFacing:'up'},
      interact:()=>talk(person),
    });
  };
  personTarget('jane', jane, 30);
  personTarget('lisbon', lisbon, 29);
  interactions.register({id:'mentalist-field-notes',object:scene.add.zone(370,370,1,1),prompt:'Review field notes',range:32,
    enabled:()=>stage()!=='INTRO',interact:()=>gameEvents.emit(GAME_EVENTS.dialogueStart,caseNotebook(state.snapshot))});

  const clue = (
    id:string,
    x:number,
    y:number,
    shape:{x:number;y:number;width:number;height:number},
    title:string,
    detail:string,
  ):void => {
    interactions.register({
      id,
      object:scene.add.zone(x,y,1,1),
      prompt:()=>state.snapshot.encounters.includes(id)?'Look again':'Examine',
      discoveryCue:'INTERESTING',
      enabled:()=>state.snapshot.encounters.includes('mentalist-honorary'),
      approach:{anchor:{x,y},shape,radius:38,preferredFacing:'up'},
      interact:()=>{
        state.completeEncounter(id);
        gameEvents.emit(GAME_EVENTS.dialogueStart,{id:`observe-${id}`,startNodeId:'0',
          interaction:{id:`observe-${id}`,mode:'REPEATABLE'},nodes:{'0':{id:'0',speaker:title,lines:[detail]}}});
      },
    });
  };
  clue(MENTALIST_CASE_CLUES[0],162,315,{x:98,y:286,width:128,height:25},
    ...CASE_OBSERVATIONS[0]);
  clue(MENTALIST_CASE_CLUES[1],570,299,{x:506,y:268,width:128,height:30},
    ...CASE_OBSERVATIONS[1]);
  clue(MENTALIST_CASE_CLUES[2],411,226,{x:392,y:217,width:54,height:30},
    ...CASE_OBSERVATIONS[2]);

  interactions.register({
    id:'mentalist-ornate-knife',
    object:scene.add.zone(420,291,1,1),
    prompt:'Take evidence',
    priority:45,
    discoveryCue:'MEMORY_RESONANCE',
    enabled:()=>stage()==='EVIDENCE'&&!state.snapshot.encounters.includes('mentalist-knife-picked'),
    approach:{anchor:{x:420,y:291},shape:{x:404,y:276,width:40,height:25},radius:38},
    interact:()=>{
      state.setFlag('mentalist-knife','carried');
      state.completeEncounter('mentalist-knife-picked');
      gameEvents.emit(GAME_EVENTS.notification,{
        title:'Ornate knife',
        detail:'Temporary evidence. Bring it to Jane or Lisbon.',
      });
    },
  });

  const honorary = (): void => {
    state.completeEncounter('mentalist-honorary');
    state.setFlag('mentalist-intro','complete');
  };
  const deduction = (): void => {
    if (!canDeduceCase(state.snapshot)) return;
    state.completeEncounter('mentalist-deduction-solved');
    state.setFlag('mentalist-deduction','solved');
  };
  const compared=():void=>{if(hasAllClues())state.setFlag(CASE_COMPARISON_FLAG,'true');};
  const resolve = (): void => {
    if (!state.completeEncounter('mentalist-case-resolved')) return;
    state.setFlag('mentalist-case','resolved');
    state.setFlag('mentalist-knife','forensics');
    remember(scene,state,'first-date','first-date-sleep');
  };
  const lisboooon = (): void => {
    if (state.flag(MENTALIST_LISBOOOON_V2_FLAG) === 'true') return;
    const deadline = scene.time.now + 1_250;
    const attempt = (): void => {
      if (!scene.scene.isActive() || state.flag(MENTALIST_LISBOOOON_V2_FLAG) === 'true') return;
      if (audio.playAuthoredVoice('lisboooon')) {
        state.setFlag(MENTALIST_LISBOOOON_V2_FLAG, 'true');
      } else if (scene.time.now < deadline) {
        scene.time.delayedCall(70, attempt);
      }
    };
    attempt();
  };
  gameEvents.on('mentalist-honorary', honorary);
  gameEvents.on('mentalist-deduction-solved', deduction);
  gameEvents.on('mentalist-comparison-linked', compared);
  gameEvents.on('mentalist-case-resolved', resolve);
  gameEvents.on(MENTALIST_LISBOOOON_EVENT, lisboooon);

  const spatial = new SpatialAudio(audio,[{
    id:'mentalist-room',
    key:'mentalist-theme',
    channel:'music',
    x:350,
    y:270,
    inner:330,
    radius:520,
    gain:.72,
    enabled:()=>stage()!=='INTRO'&&stage()!=='RESOLVED',
  }]);
  scene.events.once('shutdown',()=>{
    unsubscribe();
    gameEvents.off('mentalist-honorary', honorary);
    gameEvents.off('mentalist-deduction-solved', deduction);
    gameEvents.off('mentalist-comparison-linked', compared);
    gameEvents.off('mentalist-case-resolved', resolve);
    gameEvents.off(MENTALIST_LISBOOOON_EVENT, lisboooon);
  });
  return () => {
    if (stage() === 'HANDOVER') {
      const side = player.facingDirection === 'left' ? -13 : 9;
      carriedKnife.setPosition(Math.round(player.x + side), Math.round(player.y - 13));
    }
    spatial.update(player.feetPosition,scene.game.loop.delta);
  };
}
