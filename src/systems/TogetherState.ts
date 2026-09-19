import { STORY_FLAGS } from '../data/storyCompletion';
import type { SaveData } from '../types/game';

export const TOGETHER_PREFERENCE = 'explore-together';
export const TOGETHER_RUNTIME = 'together-runtime';
export const togetherUnlocked = (save: Pick<SaveData, 'flags'>): boolean => save.flags[STORY_FLAGS.complete] === 'true';
export const togetherEnabled = (save: Pick<SaveData, 'flags'>): boolean => togetherUnlocked(save) && save.flags[TOGETHER_PREFERENCE] !== 'off';
export type TogetherMode = 'FOLLOWING' | 'APPROACH' | 'COUCH' | 'SHEEPING' | 'COF' | 'PINCH' | 'BUTT_BUMP' | 'PHOTO';
export type Partner = 'protagonist' | 'goncalo';

/** All clocks are eligible elapsed milliseconds, never frame-based random trials. */
export class TogetherState {
  mode: TogetherMode = 'FOLLOWING';
  elapsed = 0;
  couchElapsed = 0;
  couchPhotoShown = false;
  fartIn: number;
  bumpCooldown = 0;
  private nextGiver: Partner;
  constructor(private readonly random = Math.random) {
    this.fartIn = 30_000 + random() * 15_000;
    this.nextGiver = random() < .5 ? 'goncalo' : 'protagonist';
  }
  enter(mode: TogetherMode): void { this.mode = mode; this.elapsed = 0; }
  startCouch(): void { this.couchElapsed = 0; this.couchPhotoShown = false; this.enter('COUCH'); }
  pinch(): { giver: Partner; playfulCallback: boolean } {
    const giver = this.nextGiver;
    this.nextGiver = giver === 'goncalo' ? 'protagonist' : 'goncalo';
    this.enter('PINCH');
    return { giver, playfulCallback: giver === 'goncalo' && this.random() < .25 };
  }
  tick(ms: number, blocked: boolean, microEvent: boolean): { photo: boolean; farter?: Partner } {
    if (blocked) return { photo: false };
    const dt = Math.max(0, Math.min(ms, 100));
    this.elapsed += dt; this.bumpCooldown = Math.max(0, this.bumpCooldown - dt);
    if (this.mode === 'COUCH') {
      this.couchElapsed += dt;
      if (!this.couchPhotoShown && this.couchElapsed >= 20_000 && !microEvent) {
        this.couchPhotoShown = true; this.enter('PHOTO'); return { photo: true };
      }
    }
    if (!microEvent && ['FOLLOWING', 'COUCH', 'SHEEPING'].includes(this.mode)) {
      this.fartIn -= dt;
      if (this.fartIn <= 0) {
        this.fartIn = 45_000 + this.random() * 75_000;
        return { photo: false, farter: this.random() < .5 ? 'protagonist' : 'goncalo' };
      }
    }
    return { photo: false };
  }
}
