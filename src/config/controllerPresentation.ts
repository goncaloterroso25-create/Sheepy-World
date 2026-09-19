export type ControllerFamily = 'playstation' | 'generic';
export type InputPresentationMode = 'keyboard-mouse' | 'gamepad-playstation' | 'gamepad-generic';
export type ControlAction = 'interact' | 'confirm' | 'back' | 'pause' | 'sprint' | 'scrapbook' | 'bag' | 'movement' | 'together';

const PLAYSTATION_ID = /dualsense|dualshock|wireless controller|sony|playstation/i;
let activeFamily: ControllerFamily = 'generic';
let activeMode: InputPresentationMode = 'keyboard-mouse';

export function detectControllerFamily(id = ''): ControllerFamily {
  if (/xbox|microsoft|xinput/i.test(id)) return 'generic';
  return PLAYSTATION_ID.test(id) ? 'playstation' : 'generic';
}

export function observeController(id = ''): void {
  if (!id) return;
  activeFamily = detectControllerFamily(id);
  activeMode = activeFamily === 'playstation' ? 'gamepad-playstation' : 'gamepad-generic';
}

export function observeKeyboardMouse(): void { activeMode = 'keyboard-mouse'; }
export function observeControllerDisconnected(): void {
  if (activeMode !== 'keyboard-mouse') activeMode = 'keyboard-mouse';
}
export function currentInputPresentation(): InputPresentationMode { return activeMode; }
export function currentControllerFamily(): ControllerFamily { return activeFamily; }

export const CONTROLLER_LABELS = {
  playstation: { interact:'CROSS', back:'CIRCLE', inventory:'SQUARE', scrapbook:'TRIANGLE', sprint:'R2', pause:'OPTIONS' },
  generic: { interact:'A', back:'B', inventory:'X', scrapbook:'Y', sprint:'RT', pause:'MENU' },
} as const;

export function currentControllerLabels() { return CONTROLLER_LABELS[activeFamily]; }

const CONTROL_HINTS: Readonly<Record<InputPresentationMode, Readonly<Record<ControlAction, string>>>> = {
  'keyboard-mouse': {
    interact:'E', confirm:'E', back:'Q', pause:'Q', sprint:'SHIFT', scrapbook:'TAB', bag:'I', movement:'WASD', together:'C',
  },
  'gamepad-playstation': {
    interact:'CROSS', confirm:'CROSS', back:'CIRCLE', pause:'OPTIONS', sprint:'R2', scrapbook:'TRIANGLE', bag:'SQUARE', movement:'STICK / D-PAD', together:'R1',
  },
  'gamepad-generic': {
    interact:'A', confirm:'A', back:'B', pause:'MENU', sprint:'RT', scrapbook:'Y', bag:'X', movement:'STICK / D-PAD', together:'RB',
  },
};

export function getControlHint(action: ControlAction, mode = activeMode): string {
  return CONTROL_HINTS[mode][action];
}
