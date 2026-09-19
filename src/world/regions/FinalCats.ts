import type Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import type { GameStateStore } from '../../systems/GameStateStore';
import { gameEvents } from '../../systems/events';
import type { CatPoint } from '../../systems/CatMotion';
import { CatActor } from './CatActor';

/** Presentation only: the journey still owns the join flag and the reunion owns the ending. */
export function installFinalCats(scene: Phaser.Scene, state: GameStateStore, player: Player): (joined: boolean) => void {
  const cats = (['teemi', 'tobias', 'chicho'] as const).map((name, i) => {
    const cat = new CatActor(scene, name, { x: 276 + i * 31, y: 579 }, [], i, true);
    cat.sprite.setVisible(false); return cat;
  });
  const trail: CatPoint[] = [];
  let appeared = false, staging = false;
  const gather = (): void => { staging = true; };
  gameEvents.on('finale-reunion-start', gather);
  scene.events.once('shutdown', () => gameEvents.off('finale-reunion-start', gather));
  const safe = (point: CatPoint): CatPoint => ({ x: Math.max(180, Math.min(455, point.x)), y: Math.max(245, Math.min(2830, point.y)) });
  return joined => {
    if (!joined && !staging) return;
    const feet = safe(player.feetPosition);
    if (!appeared) {
      appeared = true;
      // Only initial invisible placement. Returning saves enter with their companions nearby.
      if (Math.abs(feet.y - 579) > 180) cats.forEach((cat, i) => cat.place(safe({ x: feet.x - 30 + i * 28, y: feet.y + 45 + i * 7 })));
      cats.forEach(cat => cat.sprite.setVisible(true)); trail.push(feet);
    }
    const last = trail[trail.length - 1]!;
    if (!state.movement.locked && Math.hypot(feet.x - last.x, feet.y - last.y) >= 6) {
      trail.push(feet); if (trail.length > 200) trail.shift();
    }
    cats.forEach((cat, i) => {
      let target: CatPoint;
      if (staging) target = [{ x: 284, y: 265 }, { x: 362, y: 268 }, { x: 342, y: 286 }][i]!;
      else if (feet.y < 340) target = [{ x: 276, y: 333 }, { x: 368, y: 327 }, { x: 350, y: 345 }][i]!;
      else {
        let distance = 0, index = trail.length - 1;
        while (index > 0 && distance < 28 + i * 24) {
          distance += Math.hypot(trail[index]!.x - trail[index - 1]!.x, trail[index]!.y - trail[index - 1]!.y); index--;
        }
        const behind = trail[index]!;
        target = safe({ x: behind.x + [-17, 16, -5][i]!, y: behind.y + 10 + i * 3 });
      }
      const distance = Math.hypot(target.x - cat.motion.position.x, target.y - cat.motion.position.y);
      if (distance > (staging ? 1 : 5)) cat.walkTo(target, staging ? 70 : distance > 110 ? 138 - i * 3 : 53 + i * 4, !staging && state.movement.locked);
      else cat.pose(staging && i === 2 ? 'sleep' : 'sit', 'down');
      cat.sprite.setData('cat-stage', staging ? 'finale' : feet.y < 340 ? 'picnic' : 'follow');
    });
  };
}
