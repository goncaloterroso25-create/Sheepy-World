import { MOVEMENT, type Gait } from '../config/movement';

export const STRIDE_FRAMES = ['pass-a', 'step-a', 'pass-b', 'step-b'] as const;
export type StrideFrame = typeof STRIDE_FRAMES[number];

/** Actual travel advances authored frames. Only entering a plant frame emits a step. */
export class LocomotionCycle {
  private index = 0;
  private progress = 0;

  get frame(): StrideFrame { return STRIDE_FRAMES[this.index]!; }

  advance(distance: number, gait: Gait): boolean {
    if (!Number.isFinite(distance) || distance <= 0) return false;
    const frameDistance = gait === 'sprint' ? MOVEMENT.sprintFrameDistance : MOVEMENT.walkFrameDistance;
    // Never replay missed contacts after a hitch, teleport, or scene resume.
    this.progress += Math.min(distance / frameDistance, 1);
    if (this.progress < 1) return false;
    this.progress -= 1;
    this.index = (this.index + 1) % STRIDE_FRAMES.length;
    return this.frame === 'step-a' || this.frame === 'step-b';
  }

  reset(): void {
    this.index = 0;
    this.progress = 0;
  }
}
