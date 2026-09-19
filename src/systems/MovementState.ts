import { DEFAULT_STAMINA_MODIFIERS, MOVEMENT, type MovementLock, type StaminaModifiers } from '../config/movement';

/** Session-only exploration state. Intentionally absent from the save schema. */
export class MovementState {
  private value: number = MOVEMENT.capacity;
  private exhausted = false;
  private running = false;
  private readonly locks = new Set<MovementLock>();
  private modifiers: StaminaModifiers = { ...DEFAULT_STAMINA_MODIFIERS };

  get stamina(): number { return this.value; }
  get capacity(): number { return MOVEMENT.capacity * this.modifiers.capacity; }
  get fraction(): number { return this.value / this.capacity; }
  get sprinting(): boolean { return this.running; }
  get recovering(): boolean { return this.exhausted; }
  get locked(): boolean { return this.locks.size > 0; }
  isLockedBy(reason: MovementLock): boolean { return this.locks.has(reason); }

  canSprint(requested: boolean): boolean {
    return requested && !this.locked && !this.exhausted && this.value > 0;
  }

  setLock(reason: MovementLock, locked: boolean): void {
    if (locked) this.locks.add(reason);
    else this.locks.delete(reason);
    if (this.locked) this.running = false;
  }

  /** Called once per completed simulation step, never from a render update. */
  update(deltaMs: number, moving: boolean, requested: boolean): void {
    const seconds = Number.isFinite(deltaMs) ? Math.min(100, Math.max(0, deltaMs)) / 1000 : 0;
    this.running = moving && this.canSprint(requested);
    if (this.running) {
      this.value = Math.max(0, this.value - MOVEMENT.drainPerSecond * this.modifiers.drain * seconds);
      if (this.value <= 0) {
        this.exhausted = true;
        this.running = false;
      }
    } else {
      this.value = Math.min(this.capacity, this.value + MOVEMENT.regenPerSecond * this.modifiers.regeneration * seconds);
      if (this.value >= this.capacity * MOVEMENT.recoveryFraction) this.exhausted = false;
    }
  }

  /** Future COF effects can supply any combination; no buff policy lives here. */
  setModifiers(modifiers: Partial<StaminaModifiers>): void {
    const oldCapacity = this.capacity;
    for (const key of ['capacity', 'drain', 'regeneration'] as const) {
      const value = modifiers[key];
      if (value !== undefined && Number.isFinite(value)) {
        this.modifiers[key] = Math.max(key === 'capacity' ? 0.1 : 0, value);
      }
    }
    this.value = Math.min(this.capacity, this.value * this.capacity / oldCapacity);
  }

  reset(): void {
    this.modifiers = { ...DEFAULT_STAMINA_MODIFIERS };
    this.value = this.capacity;
    this.exhausted = false;
    this.running = false;
    this.locks.clear();
  }
}
