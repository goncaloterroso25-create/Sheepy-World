import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
vi.mock('phaser', () => ({ default: {
  Input: { Keyboard: { KeyCodes: {
    W: 87, UP: 38, S: 83, DOWN: 40, A: 65, LEFT: 37, D: 68, RIGHT: 39,
    E: 69, SPACE: 32, TAB: 9, I: 73, ESC: 27, Q: 81, C: 67,
  } } }, Core: { Events: { BLUR: 'blur' } }, Scenes: { Events: { PAUSE: 'pause', SHUTDOWN: 'shutdown' } },
  Math: { Clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
    Vector2: class { constructor(public x=0,public y=0){} normalize(){const length=Math.hypot(this.x,this.y);if(length){this.x/=length;this.y/=length;}return this;} } },
} }));
import { GAMEPAD_BUTTONS, InputController } from '../src/config/controls';
import { currentInputPresentation } from '../src/config/controllerPresentation';

class EventEmitter {
  private listeners = new Map<string, { callback: (...args: unknown[]) => void; once: boolean }[]>();
  on(name: string, callback: (...args: unknown[]) => void) {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), { callback, once: false }]);
  }
  once(name: string, callback: (...args: unknown[]) => void) {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), { callback, once: true }]);
  }
  off(name: string, callback: (...args: unknown[]) => void) {
    this.listeners.set(name, (this.listeners.get(name) ?? []).filter((entry) => entry.callback !== callback));
  }
  emit(name: string, ...args: unknown[]) {
    (this.listeners.get(name) ?? []).forEach((entry) => {
      if (entry.once) this.off(name, entry.callback);
      entry.callback(...args);
    });
  }
  listenerCount(name: string) { return this.listeners.get(name)?.length ?? 0; }
}

function fixture() {
  const keyboard = Object.assign(new EventEmitter(), {
    addKey: (keyCode: number) => ({ keyCode, isDown: false }),
  });
  const events = new EventEmitter();
  const gameEvents = new EventEmitter();
  const pad={id:'Wireless Controller',leftStick:{x:0,y:0},buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
  const gamepad=Object.assign(new EventEmitter(),{getPad:()=>pad});
  const input=Object.assign(new EventEmitter(),{keyboard,gamepad});
  const scene = { input, events, game: { events: gameEvents } } as unknown as Phaser.Scene;
  return { keyboard,gamepad,pad,input,events,gameEvents,controls: new InputController(scene) };
}

describe('central action input', () => {
  it('consumes C/R1 once independently of Interact, Back, Pause and sprint',()=>{
    const {controls,keyboard,gamepad,pad}=fixture();
    keyboard.emit('keydown',{code:'KeyC',keyCode:67,repeat:false});
    gamepad.emit('down',pad,{index:5});
    expect(controls.justTogether()).toBe(true);expect(controls.justTogether()).toBe(false);
    expect(controls.justInteracted()).toBe(false);expect(controls.justClosed()).toBe(false);
    expect(controls.justPaused()).toBe(false);expect(controls.sprintHeld()).toBe(false);
    keyboard.emit('keydown',{code:'KeyC',keyCode:67,repeat:true});expect(controls.justTogether()).toBe(false);
    expect(GAMEPAD_BUTTONS).toMatchObject({together:5,interact:0,close:1,inventory:2,scrapbook:3,sprint:7,pause:9});
  });
  it('retains a short tap across keyup until it is consumed once', () => {
    const { keyboard, controls } = fixture();
    keyboard.emit('keydown', { code: 'KeyE', keyCode: 69, repeat: false });
    keyboard.emit('keyup', { code: 'KeyE', keyCode: 69 });
    expect(controls.justInteracted()).toBe(true);
    expect(controls.justInteracted()).toBe(false);
    keyboard.emit('keydown', { code: 'KeyE', keyCode: 69, repeat: true });
    expect(controls.justInteracted()).toBe(false);
  });
  it('consumes simultaneous interaction aliases as one action', () => {
    const { keyboard, controls } = fixture();
    keyboard.emit('keydown', { code: 'KeyE', keyCode: 69 });
    keyboard.emit('keydown', { code: 'Space', keyCode: 32 });
    expect(controls.justInteracted()).toBe(true);
    expect(controls.justInteracted()).toBe(false);
  });
  it('requires Left Shift, ignores Right Shift release, and clears on blur/pause', () => {
    const { keyboard, controls, events, gameEvents } = fixture();
    keyboard.emit('keydown', { code: 'ShiftRight', keyCode: 16 });
    expect(controls.sprintHeld()).toBe(false);
    keyboard.emit('keydown', { code: 'ShiftLeft', keyCode: 16 });
    keyboard.emit('keyup', { code: 'ShiftRight', keyCode: 16 });
    expect(controls.sprintHeld()).toBe(true);
    gameEvents.emit('blur');
    expect(controls.sprintHeld()).toBe(false);
    keyboard.emit('keydown', { code: 'ShiftLeft', keyCode: 16 });
    keyboard.emit('keydown', { code: 'KeyE', keyCode: 69 });
    events.emit('pause');
    expect(controls.sprintHeld()).toBe(false);
    expect(controls.justInteracted()).toBe(false);
  });
  it('detaches event listeners on scene shutdown', () => {
    const { keyboard,gamepad,events,gameEvents } = fixture();
    events.emit('shutdown');
    expect(keyboard.listenerCount('keydown')).toBe(0);
    expect(keyboard.listenerCount('keyup')).toBe(0);
    expect(gamepad.listenerCount('down')).toBe(0);
    expect(gameEvents.listenerCount('blur')).toBe(0);
    expect(events.listenerCount('pause')).toBe(0);
  });
  it('maps standard controller buttons, d-pad, stick and trigger through the same actions',()=>{
    const {controls,gamepad,pad,events}=fixture();
    gamepad.emit('down',{}, {index:GAMEPAD_BUTTONS.scrapbook});
    expect(controls.justScrapbook()).toBe(true);expect(controls.justScrapbook()).toBe(false);
    gamepad.emit('down',{}, {index:GAMEPAD_BUTTONS.inventory});expect(controls.justInventory()).toBe(true);
    gamepad.emit('down',{}, {index:GAMEPAD_BUTTONS.close});expect(controls.justClosed()).toBe(true);
    gamepad.emit('down',{}, {index:GAMEPAD_BUTTONS.interact});expect(controls.justInteracted()).toBe(true);
    gamepad.emit('down',{}, {index:GAMEPAD_BUTTONS.down});expect(controls.justDirection('down')).toBe(true);
    pad.leftStick.x=.8;expect(controls.axis().x).toBeCloseTo(1);
    pad.buttons[GAMEPAD_BUTTONS.sprint]!.pressed=true;expect(controls.sprintHeld()).toBe(true);
    events.emit('pause');expect(controls.justDirection('down')).toBe(false);
  });
  it('routes Q through the shared Back action and Options through Pause',()=>{
    const {controls,keyboard,gamepad}=fixture();
    keyboard.emit('keydown',{code:'KeyQ',keyCode:81,repeat:false});
    expect(controls.justClosed()).toBe(true);expect(controls.justClosed()).toBe(false);
    gamepad.emit('down',{id:'Sony DualSense Wireless Controller'},{index:GAMEPAD_BUTTONS.pause});
    expect(controls.justPaused()).toBe(true);expect(controls.justPaused()).toBe(false);
  });
  it('tracks the last meaningful keyboard, pointer, and controller input',()=>{
    const {controls,keyboard,gamepad,pad,input}=fixture();
    keyboard.emit('keydown',{code:'KeyW',keyCode:87,repeat:false});
    expect(currentInputPresentation()).toBe('keyboard-mouse');
    gamepad.emit('down',pad,{index:GAMEPAD_BUTTONS.interact});
    expect(currentInputPresentation()).toBe('gamepad-playstation');
    keyboard.emit('keydown',{code:'KeyE',keyCode:69,repeat:false});
    expect(currentInputPresentation()).toBe('keyboard-mouse');
    gamepad.emit('down',pad,{index:GAMEPAD_BUTTONS.close});
    input.emit('pointerdown',{});
    expect(currentInputPresentation()).toBe('keyboard-mouse');
    controls.justClosed();
  });
  it('ignores analog drift and switches only on a fresh deliberate stick or trigger edge',()=>{
    const {controls,keyboard,pad}=fixture();
    keyboard.emit('keydown',{code:'KeyW',keyCode:87,repeat:false});
    pad.leftStick.x=.03;controls.pollPresentation();
    expect(currentInputPresentation()).toBe('keyboard-mouse');
    pad.leftStick.x=.55;controls.pollPresentation();
    expect(currentInputPresentation()).toBe('gamepad-playstation');
    keyboard.emit('keydown',{code:'KeyE',keyCode:69,repeat:false});controls.pollPresentation();
    expect(currentInputPresentation()).toBe('keyboard-mouse');
    pad.leftStick.x=.1;controls.pollPresentation();pad.leftStick.x=.55;controls.pollPresentation();
    expect(currentInputPresentation()).toBe('gamepad-playstation');
    keyboard.emit('keydown',{code:'KeyE',keyCode:69,repeat:false});
    pad.leftStick.x=0;controls.pollPresentation();pad.buttons[GAMEPAD_BUTTONS.sprint]!.value=.5;controls.pollPresentation();
    expect(currentInputPresentation()).toBe('gamepad-playstation');
  });
  it('falls back safely when the active controller disconnects',()=>{
    const {gamepad,pad}=fixture();
    gamepad.emit('down',pad,{index:GAMEPAD_BUTTONS.interact});
    expect(currentInputPresentation()).toBe('gamepad-playstation');
    gamepad.emit('disconnected',pad);
    expect(currentInputPresentation()).toBe('keyboard-mouse');
  });

  it.each([
    ['NPC', 'patrick-jane'],
    ['cat', 'tobias-actions'],
    ['collectible', 'the-hunger-games'],
    ['large furniture', 'home-couch'],
    ['vehicle', 'first-date-car'],
    ['door', 'vila-home-door'],
  ] as const)('routes controller A through the shared world action for %s (%s)', () => {
    const { controls, gamepad } = fixture();
    gamepad.emit('down', {}, { index: GAMEPAD_BUTTONS.interact });
    expect(controls.justInteracted()).toBe(true);
    expect(controls.justInteracted()).toBe(false);
  });

  it.each([
    ['Scrapbook', GAMEPAD_BUTTONS.scrapbook, 'justScrapbook'],
    ['Bag', GAMEPAD_BUTTONS.inventory, 'justInventory'],
  ] as const)('routes %s through its centralized controller action', (_label, button, method) => {
    const { controls, gamepad } = fixture();
    gamepad.emit('down', {}, { index: button });
    expect(controls[method]()).toBe(true);
    expect(controls[method]()).toBe(false);
  });
});
