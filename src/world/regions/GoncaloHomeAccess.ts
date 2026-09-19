import type Phaser from 'phaser';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { goncaloHomeAvailable } from '../../data/homeAccess';
import { PALETTE as P } from '../../art/palette';
import type { RegionExit } from './definitions';

export const GONCALO_LANE = 'vila-south-home';

/** No zone, sign, cue or blocker before the late-memory threshold. */
export function installGoncaloHomeAccess(scene: Phaser.Scene, state: GameStateStore,
  interactions: InteractionSystem, exit: RegionExit, travel: () => void): void {
  let art: Phaser.GameObjects.Graphics | undefined;
  let target: Phaser.GameObjects.Zone | undefined;
  const clear = (): void => {
    interactions.unregister(exit.id); target?.destroy(); art?.destroy();
    target = undefined; art = undefined;
  };
  const refresh = (): void => {
    if (!goncaloHomeAvailable(state.snapshot)) { clear(); return; }
    if (target) return;
    art = scene.add.graphics().setDepth(-19);
    // Continue the existing lower village lane, with a small warm light beyond it.
    art.fillStyle(P.stone).fillRect(648,996,60,60);
    art.fillStyle(P.stoneDeep,.3).fillRect(648,996,2,60).fillRect(706,996,2,60);
    for(let y=1001;y<1056;y+=14) art.fillRect(658,y,29,1);
    art.fillStyle(P.paper,.12).fillRect(657,1015,42,36);
    art.fillStyle(P.paper,.2).fillRect(669,1032,18,24);
    target = scene.add.zone(678,1026,1,1);
    interactions.register({ id:exit.id, object:target, range:38, priority:100,
      prompt:'Follow the lane', interact:() => { if(goncaloHomeAvailable(state.snapshot)) travel(); } });
  };
  refresh();
  const unsubscribe = state.subscribe(refresh);
  scene.events.once('shutdown',()=>{ unsubscribe(); clear(); });
}
