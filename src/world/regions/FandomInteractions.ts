import type Phaser from 'phaser';
import { storyMoment, storyPrompt } from './StoryMoments';
import { PALETTE as P } from '../../art/palette';
import { GAME_EVENTS } from '../../config/constants';
import { DAENERYS_STAGE, FESTIVAL_CURIOS, FESTIVAL_DETAILS, HANGE_DIALOGUE, OLD_WORLD_GUESTS,
  SCOUT_GROUP_DIALOGUE } from '../../data/festivalContent';
import { NAMED_DIALOGUES } from '../../data/namedDialogues';
import { PHOTO_OPEN, PHOTO_CLOSED, type PersonalPhotoId } from '../../data/personalPhotos';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { gameEvents } from '../../systems/events';
import type { RegionId } from './definitions';
export const CAMEO_DIALOGUES = NAMED_DIALOGUES;

export function installFandomInteractions(scene: Phaser.Scene, id: RegionId, state: GameStateStore, interactions: InteractionSystem): void {
  const tell = (title: string, detail: string): void => { gameEvents.emit(GAME_EVENTS.notification, { title, detail }); };
  const cameo = (key: keyof typeof CAMEO_DIALOGUES, x: number, y: number): Phaser.GameObjects.Image => {
    const sprite = scene.add.image(x, y, `cameo-${key}-0`).setOrigin(.5, 1).setDepth(y);
    interactions.register({ id: CAMEO_DIALOGUES[key].id, object: sprite, prompt: 'Talk',
      approach: () => ({ anchor: { x: sprite.x, y: sprite.y + 8 }, radius: 46 }),discoveryCue:'IMPORTANT_NPC',
      interact: () => gameEvents.emit(GAME_EVENTS.dialogueStart, CAMEO_DIALOGUES[key]) });
    if (key === 'tyrion' || key === 'grandma') {
      const timer = scene.time.addEvent({ delay: key === 'grandma' ? 1100 : 1900, loop: true, callback: () => {
        sprite.setTexture(`cameo-${key}-${sprite.texture.key.endsWith('0') ? 1 : 0}`);
      } });
      scene.events.once('shutdown', () => timer.remove());
    }
    return sprite;
  };
  if (id === 'vila-meow') {
    cameo('grandma', 562, 366);
    interactions.register({ id: 'grandma-door', object: scene.add.zone(476, 338, 1, 1), prompt: 'Knock',
      approach: { anchor: { x: 476, y: 348 }, radius: 38, preferredFacing: 'up' },
      interact: () => tell("Avó's house", 'Closed for now. The garden is very much open.') });
  }
  if (id === 'river-town') {
    scene.add.image(995, 360, 'classic-black-car').setDepth(381);
    const stranger = scene.add.image(933, 421, 'npc-trench-coat').setDepth(437);
    let arrived = false;
    const arrive = (animate = false): void => {
      if (arrived) return; arrived = true;
      const dean = cameo('dean', 1065, 429), sam = cameo('sam', 1106, 433);
      if (animate) for (const sprite of [dean, sam]) {
        const target = sprite.y; sprite.y += 66;
        scene.tweens.add({ targets: sprite, y: target, duration: 1200, ease: 'Linear',
          onUpdate: () => sprite.setDepth(Math.round(sprite.y)) });
      }
    };
    if (state.snapshot.encounters.includes('impala-brothers-arrived')) arrive();
    const closed = (photo: PersonalPhotoId): void => {
      if (photo !== 'plate') return;
      state.completeEncounter('photo-plate-seen');
      if (state.completeEncounter('impala-brothers-arrived')) arrive(true);
    };
    gameEvents.on(PHOTO_CLOSED, closed); scene.events.once('shutdown', () => gameEvents.off(PHOTO_CLOSED, closed));
    interactions.register({ id: 'classic-car-plate', object: scene.add.zone(995, 400, 1, 1), prompt: 'Read plate',
      approach: { anchor: { x: 995, y: 410 }, radius: 26, preferredFacing: 'up' },
      interact: () => gameEvents.emit(PHOTO_OPEN, 'plate') });
    interactions.register({ id: 'roadside-stranger', object: stranger, prompt: 'Talk', range: 32,
      interact: () => {
        if (!state.isInteractionExhausted('castiel-wing-seen')) {
          state.exhaustInteraction('castiel-wing-seen');
          const wing = scene.add.graphics().setDepth(stranger.depth - 1);
          for (const sign of [-1, 1]) for (let i = 0; i < 7; i++) {
            const x = 933 + sign * (12 + i * 7);
            wing.fillStyle(P.jetHairDeep, .82).fillRect(x, 396 - i * 3, 8, 24 + i * 2);
            wing.fillRect(x + sign * 5, 390 - i * 3, 5, 9);
          }
          scene.time.delayedCall(380, () => wing.destroy());
        }
        gameEvents.emit(GAME_EVENTS.dialogueStart, CAMEO_DIALOGUES.castiel);
      } });
  }
  if (id !== 'old-world-festival') return;
  cameo('astarion', 925, 431); cameo('shadowheart', 470, 1834);
  const daenerys = scene.add.image(DAENERYS_STAGE.x, DAENERYS_STAGE.y, DAENERYS_STAGE.sprite.texture)
    .setOrigin(.5, 1).setDepth(DAENERYS_STAGE.y);
  interactions.register({
    id: DAENERYS_STAGE.interactionId,
    object: daenerys,
    prompt: 'Talk',
    priority: 55,
    approach: DAENERYS_STAGE.approach,
    discoveryCue: 'IMPORTANT_NPC',
    interact: () => gameEvents.emit(GAME_EVENTS.dialogueStart, CAMEO_DIALOGUES.daenerys),
  });
  for (const dragon of DAENERYS_STAGE.dragons) {
    const depth = DAENERYS_STAGE.y + dragon.depthOffset;
    scene.add.image(dragon.x, dragon.y, dragon.texture).setOrigin(.5, 1).setDepth(depth);
  }
  cameo('tyrion', 580, 896);

  for (const detail of FESTIVAL_DETAILS.filter(d => d.id !== 'hydromel-cup')) interactions.register({
    id: detail.id, object: scene.add.zone(detail.x, detail.y, 1, 1),
    approach: detail.id==='fair-overlook'?{anchor:{x:704,y:318},shape:{x:696,y:304,width:16,height:28},radius:18,
      promptAnchor:{x:758,y:292}}:detail.approach,
    discoveryCue: detail.discoveryCue, prompt:()=>storyPrompt(state,detail.id,'Inspect'),
    interact: () => {tell(detail.title, detail.text);storyMoment(scene,state,detail.id);},
  });
  for (const item of FESTIVAL_CURIOS) interactions.register({
    id: item.id, object: scene.add.zone(item.x, item.y, 1, 1), approach: item.approach, discoveryCue: item.discoveryCue,
    prompt: () => state.snapshot.inventory.includes(item.id) ? 'Inspect' : 'Take', interact: () => {
      if (state.addArtifact(item.id)) tell(item.title, `${item.description} Tucked into your Bag.`);
      else tell(item.title, `${item.description} Already in your Bag.`);
    } });
  scene.add.image(493, 859, 'item-hydromel-cup').setDepth(889);
  const hydromel=FESTIVAL_DETAILS.find(detail => detail.id === 'hydromel-cup')!;
  interactions.register({ id:'hydromel-cup',object:scene.add.zone(hydromel.x,hydromel.y,1,1),approach:hydromel.approach,prompt:'Inspect cup',
    interact:()=> { state.addArtifact('hydromel-horn-cup'); tell('Hydromel Horn Cup','A tiny feast with a very dramatic handle. Kept in your Bag.');storyMoment(scene,state,'hydromel-cup'); } });

  const hange=scene.add.image(OLD_WORLD_GUESTS.hange.x,OLD_WORLD_GUESTS.hange.y,'festival-hange').setOrigin(.5,1)
    .setDepth(OLD_WORLD_GUESTS.hange.y);
  interactions.register({ id:HANGE_DIALOGUE.id,object:hange,prompt:'Talk',priority:OLD_WORLD_GUESTS.hange.priority,
    approach:{anchor:{x:hange.x,y:hange.y+6},shape:{x:hange.x-20,y:hange.y-2,width:40,height:24},radius:46,
      promptAnchor:{x:hange.x,y:hange.y-30}},discoveryCue:'IMPORTANT_NPC',
    interact:()=>gameEvents.emit(GAME_EVENTS.dialogueStart,HANGE_DIALOGUE) });
  for(const member of OLD_WORLD_GUESTS.scouts.members)scene.add.image(member.x,member.y,`festival-${member.id}`).setOrigin(.5,1).setDepth(member.y);
  const group=OLD_WORLD_GUESTS.scouts.interaction;
  interactions.register({id:SCOUT_GROUP_DIALOGUE.id,object:scene.add.zone(group.x,group.y,1,1),prompt:'Talk to group',priority:32,
    approach:group.approach,
    discoveryCue:'IMPORTANT_NPC',interact:()=>gameEvents.emit(GAME_EVENTS.dialogueStart,SCOUT_GROUP_DIALOGUE)});
}
