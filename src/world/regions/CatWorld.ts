import type Phaser from 'phaser';
import { TOBIAS_SHOULDER_ANCHORS } from '../../art/characterTextures';
import { PALETTE as P } from '../../art/palette';
import { CAT_EVENTS, safeCatDrop, TEEMI_PERCHES, TOBIAS_DIALOGUE, tobiasPerch } from '../../data/cats';
import { GAME_EVENTS } from '../../config/constants';
import type { Player } from '../../entities/Player';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { TeemiInteraction } from '../../systems/TeemiInteraction';
import { gameEvents } from '../../systems/events';
import type { Rect, RegionId } from './definitions';
import { installChicho } from './ChichoWorld';
import { CatActor } from './CatActor';

export function installCats(scene: Phaser.Scene, id: RegionId, state: GameStateStore,
  interactions: InteractionSystem, player: Player, solids: readonly Rect[]): () => void {
  const shoulder = scene.add.image(0, 0, 'cat-tobias-shoulder').setVisible(false);
  const finaleJoined = (): boolean => id === 'final-park' && state.flag('final-cats-joined') === 'true';
  const updateShoulder = (): void => {
    shoulder.setVisible(!finaleJoined() && player.visible && state.snapshot.cats.tobias === 'carried');
    if (!shoulder.visible) return;
    const anchor = TOBIAS_SHOULDER_ANCHORS[player.facingDirection];
    shoulder.setPosition(Math.round(player.x - 12 + anchor.x), Math.round(player.y - 16 + anchor.y))
      .setFlipX(anchor.flipX ?? false).setDepth(player.depth + (player.facingDirection === 'up' ? -1 : 1));
  };
  // The finale owns its three ground actors; keep only the pre-join carried attachment here.
  if (id === 'final-park') return updateShoulder;
  const tobiasActor = new CatActor(scene, 'tobias', { x: 0, y: 0 }, solids);
  const tobias = tobiasActor.sprite.setVisible(false);
  let currentPerch: string | undefined;
  const groundAvailable = (): boolean => !finaleJoined() && tobiasPerch(state.snapshot.cats)?.regionId === id;
  const closeToTobias = (): boolean => groundAvailable() && Math.hypot(player.x - tobias.x, player.y - tobias.y) <= 40;
  const tell = (title: string, detail: string): void => { gameEvents.emit(GAME_EVENTS.notification, { title, detail }); };
  const heart = (x: number, y: number): void => {
    const g = scene.add.graphics().setDepth(4900);
    g.fillStyle(P.plumLight).fillRect(x - 4, y - 3, 3, 3).fillRect(x + 1, y - 3, 3, 3)
      .fillRect(x - 4, y, 8, 2).fillRect(x - 2, y + 2, 4, 2).fillRect(x - 1, y + 4, 2, 1);
    scene.time.delayedCall(520, () => g.destroy());
  };
  interactions.register({ id: 'tobias-actions', object: tobias, prompt: 'Pet / Pick up', priority: 0, range: 42,
    enabled: groundAvailable, interact: () => { tobiasActor.hold(); gameEvents.emit(GAME_EVENTS.dialogueStart, TOBIAS_DIALOGUE); } });
  const pet = (): void => { if (closeToTobias()) { tobiasActor.hold(); heart(Math.round(tobias.x), Math.round(tobias.y - 22)); } };
  const pick = (): void => {
    if (!closeToTobias()) return;
    if (state.chicho.mode === 'carried') { tell('Tobias', 'One passenger at a time, please.'); return; }
    state.carryTobias();
  };
  gameEvents.on(CAT_EVENTS.pet, pet);
  gameEvents.on(CAT_EVENTS.pickup, pick);
  // A deliberately lower-ranked player-following target. All nearby world actions win.
  interactions.register({ id: 'tobias-set-down', object: player, priority: -100, prompt: 'Set down Tobias', range: 1,
    enabled: () => !finaleJoined() && state.snapshot.cats.tobias === 'carried' && Boolean(safeCatDrop(id, player, solids)),
    interact: () => {
      const drop = safeCatDrop(id, player, solids);
      if (drop && state.setDownTobias(drop.id)) tell('Tobias', 'Same cat. New excellent sitting place.');
    } });
  const mood = new TeemiInteraction();
  const teemiActor = id === 'home-interior' ? new CatActor(scene, 'teemi', TEEMI_PERCHES[0], solids, 1) : undefined;
  const teemi = teemiActor?.sprite;
  let retreating = false;
  let chompAt = 0;
  if (teemi) interactions.register({ id: 'teemi-pet', object: teemi, range: 42, priority: 0,
    prompt: () => mood.prompt, enabled: () => mood.available && !retreating,
    interact: () => {
      teemiActor?.hold();
      const action = mood.pet(scene.time.now);
      if (action === 'pet') { heart(teemi.x, teemi.y - 22); tell('Teemi', mood.stage === 'warning' ? 'The ears have filed a warning. That tail means stop.' : 'Pat accepted. For now.'); }
      if (action === 'chomp') {
        retreating = true;
        chompAt = scene.time.now;
        player.playPshwReaction();
        if(!state.snapshot.settings.reducedCameraMotion) scene.cameras.main.shake(110,.0014);
        tell('Teemi', 'CHOMP. The warning was apparently legally binding.');
        const impact = scene.add.image(player.x, player.y - 5, 'pshw-impact').setDepth(player.depth + 4);
        scene.time.delayedCall(180, () => impact.destroy());
      }
    } });
  scene.events.once('shutdown', () => {
    gameEvents.off(CAT_EVENTS.pet, pet); gameEvents.off(CAT_EVENTS.pickup, pick);
  });
  const chicho=installChicho(scene,id,state,interactions,player,solids);
  return () => {
    chicho();
    const perch = tobiasPerch(state.snapshot.cats);
    tobias.setVisible(groundAvailable());
    if (tobias.visible && perch) {
      if (currentPerch !== perch.id) { tobiasActor.place(perch); currentPerch = perch.id; }
      tobiasActor.roam(state.movement.locked);
    } else { currentPerch = undefined; tobias.anims.stop(); }
    updateShoulder();
    if (teemi && teemiActor) {
      mood.update(scene.time.now);
      const point = TEEMI_PERCHES[mood.perch]!;
      const lunge = mood.stage === 'chomp' && scene.time.now - chompAt < 130 ? 4 : 0;
      if (mood.stage === 'warning' || mood.stage === 'chomp') {
        teemiActor.render(); teemi.setX(teemi.x + lunge); teemiActor.pose('warning', 'down');
      } else if (retreating) {
        if (teemiActor.walkTo(point, 96, state.movement.locked)) { retreating = false; teemiActor.place(point); }
      } else teemiActor.roam(state.movement.locked || mood.stage !== 'ready');
      teemi.setData('cat-mood', mood.stage);
    }
  };
}
