import type Phaser from 'phaser';
import { GAME_EVENTS } from '../../config/constants';
import type { Player } from '../../entities/Player';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { gameEvents } from '../../systems/events';
import type { Rect, RegionId } from './definitions';
import { installCats } from './CatWorld';
import { installFandomInteractions } from './FandomInteractions';
import { HOME_DISCOVERIES, HOME_FUTURE_HOOKS, HOME_INSPECT_COPY } from '../../data/homeContent';
import { ITEMS } from '../../data/items';
import { HOME_APPROACHES } from '../../data/interactionApproaches';
import { installExpansionContent } from './ExpansionContent';
import { installAmbientPeople } from './AmbientPeople';
import { installCrimeSceneContent } from './CrimeSceneContent';
import { storyMoment, storyPrompt } from './StoryMoments';
import { installAdventureMoments } from './AdventureMoments';

interface Detail { id: string; x: number; y: number; title: string; text: string; prompt?: string }
export const REGION_DETAILS: Partial<Record<RegionId, readonly Detail[]>> = {
  'river-town': [
  ],
  'vila-meow': [
    { id: 'vila-laundry', x: 471, y: 420, title: 'The laundry', text: 'Even the laundry looks like it knows the neighbours.' },
    { id: 'home-garden', x: 916, y: 416, title: 'The garden', text: 'Someone watered the plants. Someone else ate one.' },
  ],
  'home-interior': [
    { id: 'home-cof', x: 581, y: 546, title: 'Cof', text: 'Not coffee. Cof.' },
    { id: 'home-couch', x: 307, y: 750, title: 'The couch', text: HOME_INSPECT_COPY.couch },
    { id: 'home-snack', x: 668, y: 732, title: 'Snack board', text: HOME_INSPECT_COPY.snack },
  ],
};

export function installRegionContent(scene: Phaser.Scene, id: RegionId, state: GameStateStore,
  interactions: InteractionSystem, player: Player, solids: readonly Rect[]): () => void {
  if (id === 'river-crime-scene') return installCrimeSceneContent(scene,state,interactions,player);
  const tell = (title: string, detail: string): void => { gameEvents.emit(GAME_EVENTS.notification, { title, detail }); };
  for (const detail of REGION_DETAILS[id] ?? []) {
    interactions.register({ id: detail.id, object: scene.add.zone(detail.x, detail.y, 1, 1),
      range: 34, approach: HOME_APPROACHES[detail.id], prompt:()=>storyPrompt(state,detail.id,detail.prompt??'Inspect'), interact: () => {
        tell(detail.title, detail.text);
        storyMoment(scene,state,detail.id);
        if (detail.id === HOME_FUTURE_HOOKS.cof.interactionId) {
          // Semantic readiness only: no audio subscriber, clip, buff, or voice substitution.
          scene.game.events.emit(HOME_FUTURE_HOOKS.cof.event, { interactionId: detail.id });
        }
      } });
  }
  if (id === 'home-interior') {
    const warmth=scene.add.graphics().setDepth(751);
    warmth.fillStyle(0xe8c987).fillRect(264,693,19,14).fillStyle(0xa45b75).fillRect(269,697,4,4).fillRect(276,697,4,4).fillRect(272,701,5,4);
    const refresh=()=>warmth.setVisible(!!state.snapshot.memories['everyday-us']?.restored);
    refresh();const unsub=state.subscribe(refresh);scene.events.once('shutdown',unsub);
    for (const discovery of HOME_DISCOVERIES) {
      interactions.register({ id: discovery.interactionId, object: scene.add.zone(discovery.x, discovery.y, 1, 1), prompt: 'Open', range: 34,discoveryCue:'INTERESTING',
        approach: HOME_APPROACHES[discovery.interactionId],
        interact: () => {
          const found = state.addArtifact(discovery.id);
          tell(found ? ITEMS[discovery.id]!.name : discovery.label,
            found ? 'Tucked into your Bag.' : 'Only ordinary drawer things now.');
        } });
    }
  }
  installFandomInteractions(scene, id, state, interactions);
  if(id==='old-world-festival'||id==='river-town'||id==='porto')installAdventureMoments(scene,state,interactions,id);
  const cats=installCats(scene, id, state, interactions, player, solids);
  const expansion=installExpansionContent(scene,id,state,interactions,player);
  const people=installAmbientPeople(scene,id,solids,()=>player.feetPosition);
  return ()=>{cats();expansion();people();};
}
