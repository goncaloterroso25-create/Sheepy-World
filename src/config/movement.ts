export const MOVEMENT = {
  walkSpeed: 78,
  sprintSpeed: 150,
  capacity: 100,
  drainPerSecond: 18,
  regenPerSecond: 25,
  recoveryFraction: 0.25,
  walkFrameDistance: 9.75,
  sprintFrameDistance: 10.5,
} as const;

export type Gait = 'walk' | 'sprint';
export type MovementLock = 'modal' | 'bench' | 'cutscene' | 'focus' | 'interaction';

export interface StaminaModifiers {
  capacity: number;
  drain: number;
  regeneration: number;
}

export const DEFAULT_STAMINA_MODIFIERS: Readonly<StaminaModifiers> = {
  capacity: 1, drain: 1, regeneration: 1,
};

// --- estado runtime de movimento ---
export const movementState = {
  sprintSpeed: MOVEMENT.sprintSpeed as number,
  turboAtivo: false,
};

function toggleTurboSprint(): void {
  movementState.turboAtivo = !movementState.turboAtivo;
  movementState.sprintSpeed = movementState.turboAtivo ? 500 : MOVEMENT.sprintSpeed;
}

// Authoring-only shortcut. Never expose turbo/debug movement in the release build.
if (import.meta.env.DEV && typeof window !== 'undefined') window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'y') {
    toggleTurboSprint();
  }
});
