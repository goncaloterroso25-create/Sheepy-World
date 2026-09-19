import type { AudioChannel } from '../config/audio';
import type { AudioSystem } from './AudioSystem';
export interface SoundEmitter { id: string; key: string; channel: AudioChannel; x: number; y: number; inner: number; radius: number; gain: number; enabled?: () => boolean }
export function emitterGain(distance: number, inner: number, radius: number): number {
  if (!Number.isFinite(distance) || radius <= inner) return 0;
  const t = Math.max(0, Math.min(1, (distance - inner) / (radius - inner)));
  return 1 - t * t * (3 - 2 * t);
}
export class SpatialAudio {
  private readonly levels = new Map<string, number>();
  constructor(private readonly audio: AudioSystem, readonly emitters: readonly SoundEmitter[]) {}
  update(point: { x: number; y: number }, delta: number): void {
    for (const emitter of this.emitters) {
      const target = emitter.enabled?.() === false ? 0 : emitter.gain * emitterGain(Math.hypot(point.x-emitter.x, point.y-emitter.y), emitter.inner, emitter.radius);
      const previous = this.levels.get(emitter.id) ?? 0;
      const level = previous + (target-previous) * Math.min(1, delta/200);
      this.levels.set(emitter.id, level);
      this.audio.emitter(emitter.id, emitter.key, emitter.channel, level);
    }
  }
}
