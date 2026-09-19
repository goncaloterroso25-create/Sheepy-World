import { describe, expect, it } from 'vitest';
import {
  CONTROLLER_LABELS,
  currentControllerLabels,
  currentInputPresentation,
  detectControllerFamily,
  getControlHint,
  observeController,
  observeKeyboardMouse,
} from '../src/config/controllerPresentation';

describe('DualSense presentation labels',()=>{
  it.each(['DualSense Wireless Controller','DualShock 4','Sony Interactive Entertainment','PlayStation 5'])('detects %s as PlayStation',id=>{
    expect(detectControllerFamily(id)).toBe('playstation');
  });
  it('keeps a generic fallback for unknown/Xbox ids',()=>{
    observeController('Xbox Wireless Controller');expect(currentControllerLabels()).toEqual(CONTROLLER_LABELS.generic);
  });
  it('exposes the approved PlayStation mapping',()=>{
    observeController('Wireless Controller');expect(currentControllerLabels()).toEqual(CONTROLLER_LABELS.playstation);
    expect(currentInputPresentation()).toBe('gamepad-playstation');
    expect(CONTROLLER_LABELS.playstation).toMatchObject({interact:'CROSS',back:'CIRCLE',inventory:'SQUARE',scrapbook:'TRIANGLE',sprint:'R2',pause:'OPTIONS'});
  });
  it('resolves every player-facing hint from one active presentation mode',()=>{
    observeKeyboardMouse();expect(getControlHint('back')).toBe('Q');expect(getControlHint('bag')).toBe('I');
    observeController('DualSense Wireless Controller');
    expect([getControlHint('interact'),getControlHint('back'),getControlHint('bag'),getControlHint('scrapbook'),getControlHint('sprint'),getControlHint('pause')])
      .toEqual(['CROSS','CIRCLE','SQUARE','TRIANGLE','R2','OPTIONS']);
    observeController('Xbox Controller');expect(currentInputPresentation()).toBe('gamepad-generic');expect(getControlHint('back')).toBe('B');
  });
});
