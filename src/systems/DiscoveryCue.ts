import type Phaser from 'phaser';
import { GAME_EVENTS } from '../config/constants';
import type { Point } from './InteractionGeometry';
import { gameEvents } from './events';

export type DiscoveryCueLevel = 'NONE' | 'INTERESTING' | 'MEMORY_RESONANCE' | 'IMPORTANT_NPC';

export interface DiscoveryCueTarget {
  id: string;
  anchor: () => Point;
  level: DiscoveryCueLevel;
  enabled: () => boolean;
}

/** Tiny environmental glints, never loot beams or floating quest icons. */
export class DiscoveryCueSystem {
  private readonly cues = new Map<string, { target: DiscoveryCueTarget; pixels: Phaser.GameObjects.Rectangle[] }>();
  private resonanceNearby = false;

  constructor(private readonly scene: Phaser.Scene) {}

  register(target: DiscoveryCueTarget): void {
    if (target.level === 'NONE' || target.level === 'IMPORTANT_NPC') return;
    const color = target.level === 'MEMORY_RESONANCE' ? 0xffd39a : 0xd6b779;
    // Even the quiet tier uses a two-pixel wink: a single isolated pixel was
    // effectively invisible against several authored backgrounds at 3x.
    const count = target.level === 'MEMORY_RESONANCE' ? 3 : 2;
    const pixels = Array.from({ length: count }, (_, index) => this.scene.add.rectangle(0, 0, 2, 2, color)
      .setDepth(4800 + index).setVisible(false));
    this.cues.set(target.id, { target, pixels });
  }

  unregister(id: string): void {
    this.cues.get(id)?.pixels.forEach(pixel => pixel.destroy());
    this.cues.delete(id);
  }

  update(player: Point, blocked: boolean): void {
    const time = this.scene.time.now;
    let resonanceNearby=false;
    for (const { target, pixels } of this.cues.values()) {
      const anchor = target.anchor();
      const nearby = target.enabled() && Math.hypot(player.x - anchor.x, player.y - anchor.y) < 118;
      const visible = !blocked && nearby;
      // Modal UI may hide the world glint, but it must not manufacture a new
      // physical-entry edge when the player closes that UI without moving.
      if(nearby&&target.level==='MEMORY_RESONANCE')resonanceNearby=true;
      pixels.forEach((pixel, index) => {
        const step = Math.floor(time / 260 + index) % 4;
        pixel.setPosition(Math.round(anchor.x - (pixels.length - 1) * 2 + index * 4),
          Math.round(anchor.y - 19 - (step === 1 ? 1 : 0)))
          .setAlpha(target.level === 'MEMORY_RESONANCE' ? .55 + (step % 2) * .3 : .48 + (step === 1 ? .2 : 0))
          .setVisible(visible);
      });
    }
    // The HUD responds once on entering a resonance pocket. Remaining beside
    // a clue never turns the book into a repeating quest-marker animation.
    if(resonanceNearby&&!this.resonanceNearby){
      gameEvents.emit(GAME_EVENTS.memoryResonanceNearby);
    }
    this.resonanceNearby=resonanceNearby;
  }

  destroy(): void {
    for (const id of [...this.cues.keys()]) this.unregister(id);
  }
}
