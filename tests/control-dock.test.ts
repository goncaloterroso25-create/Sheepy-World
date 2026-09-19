import { describe, expect, it } from 'vitest';
import {
  CONTROL_DOCK_ACTIONS,
  CONTROL_TUTORIAL_COPY,
  shouldShowControlTutorial,
} from '../src/ui/ControlDock';

describe('focused gameplay control dock', () => {
  it('teaches only the scrapbook and bag systems', () => {
    expect(CONTROL_DOCK_ACTIONS).toEqual([
      { key: 'TAB', label: 'SCRAPBOOK' },
      { key: 'I', label: 'BAG' },
    ]);
    expect(CONTROL_TUTORIAL_COPY).not.toMatch(/MOVE|INTERACT|ESC/i);
  });

  it('shows the tutorial once and only while gameplay UI is clear', () => {
    expect(shouldShowControlTutorial(false, true)).toBe(true);
    expect(shouldShowControlTutorial(true, true)).toBe(false);
    expect(shouldShowControlTutorial(false, false)).toBe(false);
  });
});
