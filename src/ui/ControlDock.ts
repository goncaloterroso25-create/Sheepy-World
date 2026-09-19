export const CONTROL_DOCK_ACTIONS = [
  { key: 'TAB', label: 'SCRAPBOOK' },
  { key: 'I', label: 'BAG' },
] as const;

export const CONTROL_DOCK_SIZE = { width: 108, height: 22 } as const;

import { UI_COPY } from '../data/uiCopy';

export const CONTROL_TUTORIAL_COPY = UI_COPY.controls.tutorial;

export function shouldShowControlTutorial(alreadyShown: boolean, uiIsClear: boolean): boolean {
  return !alreadyShown && uiIsClear;
}
