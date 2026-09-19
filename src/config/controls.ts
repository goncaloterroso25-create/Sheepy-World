import Phaser from 'phaser';
import {
  currentInputPresentation as presentationMode,
  observeController,
  observeControllerDisconnected,
  observeKeyboardMouse,
} from './controllerPresentation';

export const currentInput = (): 'keyboard' | 'controller' => presentationMode() === 'keyboard-mouse' ? 'keyboard' : 'controller';
export const currentInputPresentation = presentationMode;

export const CONTROL_KEYS = {
  up: [Phaser.Input.Keyboard.KeyCodes.W, Phaser.Input.Keyboard.KeyCodes.UP],
  down: [Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.DOWN],
  left: [Phaser.Input.Keyboard.KeyCodes.A, Phaser.Input.Keyboard.KeyCodes.LEFT],
  right: [Phaser.Input.Keyboard.KeyCodes.D, Phaser.Input.Keyboard.KeyCodes.RIGHT],
  interact: [Phaser.Input.Keyboard.KeyCodes.E, Phaser.Input.Keyboard.KeyCodes.SPACE],
  scrapbook: Phaser.Input.Keyboard.KeyCodes.TAB,
  inventory: Phaser.Input.Keyboard.KeyCodes.I,
  together: Phaser.Input.Keyboard.KeyCodes.C,
  close: [Phaser.Input.Keyboard.KeyCodes.Q, Phaser.Input.Keyboard.KeyCodes.ESC],
  sprint: 'ShiftLeft',
} as const;

/** Standard-layout indices: labels are selected separately for the active controller family. */
export const GAMEPAD_BUTTONS = {
  interact: 0, // A
  close: 1, // B
  inventory: 2, // X
  scrapbook: 3, // Y
  sprint: 7, // RT
  pause: 9, // Menu / Options
  together: 5, // R1 / RB
  up: 12,
  down: 13,
  left: 14,
  right: 15,
} as const;

export class InputController {
  private leftShiftDown = false;
  private readonly pendingPresses = new Set<number>();
  private readonly pendingGamepadPresses = new Set<number>();
  private readonly gamepad?: Phaser.Input.Gamepad.GamepadPlugin;
  private analogIntent = false;
  private triggerIntent = false;
  readonly up: Phaser.Input.Keyboard.Key[];
  readonly down: Phaser.Input.Keyboard.Key[];
  readonly left: Phaser.Input.Keyboard.Key[];
  readonly right: Phaser.Input.Keyboard.Key[];
  readonly interact: Phaser.Input.Keyboard.Key[];
  readonly scrapbook: Phaser.Input.Keyboard.Key;
  readonly inventory: Phaser.Input.Keyboard.Key;
  readonly together: Phaser.Input.Keyboard.Key;
  readonly close: Phaser.Input.Keyboard.Key[];

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable.');

    this.up = CONTROL_KEYS.up.map((code) => keyboard.addKey(code, true));
    this.down = CONTROL_KEYS.down.map((code) => keyboard.addKey(code, true));
    this.left = CONTROL_KEYS.left.map((code) => keyboard.addKey(code, true));
    this.right = CONTROL_KEYS.right.map((code) => keyboard.addKey(code, true));
    this.interact = CONTROL_KEYS.interact.map((code) => keyboard.addKey(code, true));
    this.scrapbook = keyboard.addKey(CONTROL_KEYS.scrapbook, true);
    this.inventory = keyboard.addKey(CONTROL_KEYS.inventory, true);
    this.together = keyboard.addKey(CONTROL_KEYS.together, true);
    this.close = CONTROL_KEYS.close.map(code=>keyboard.addKey(code,true));
    this.gamepad = scene.input.gamepad ?? undefined;
    const keyDown = (event: KeyboardEvent): void => {
      observeKeyboardMouse();
      if (event.code === CONTROL_KEYS.sprint) this.leftShiftDown = true;
      if (!event.repeat) this.pendingPresses.add(event.keyCode);
    };
    const keyUp = (event: KeyboardEvent): void => {
      if (event.code === CONTROL_KEYS.sprint) this.leftShiftDown = false;
    };
    const clear = (): void => { this.leftShiftDown = false; this.pendingPresses.clear(); };
    const gamepadDown = (pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button): void => {
      observeController(pad.id);
      this.pendingGamepadPresses.add(button.index);
    };
    const pointerDown = (): void => observeKeyboardMouse();
    const gamepadDisconnected = (): void => observeControllerDisconnected();
    const clearAll = (): void => { clear(); this.pendingGamepadPresses.clear(); };
    keyboard.on('keydown', keyDown);
    keyboard.on('keyup', keyUp);
    scene.input.on('pointerdown', pointerDown);
    this.gamepad?.on('down', gamepadDown);
    this.gamepad?.on('disconnected', gamepadDisconnected);
    scene.game.events.on(Phaser.Core.Events.BLUR, clearAll);
    scene.events.on(Phaser.Scenes.Events.PAUSE, clearAll);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      keyboard.off('keydown', keyDown);
      keyboard.off('keyup', keyUp);
      scene.input.off('pointerdown', pointerDown);
      this.gamepad?.off('down', gamepadDown);
      this.gamepad?.off('disconnected', gamepadDisconnected);
      scene.game.events.off(Phaser.Core.Events.BLUR, clearAll);
      scene.events.off(Phaser.Scenes.Events.PAUSE, clearAll);
    });
  }

  sprintHeld(): boolean { return this.leftShiftDown || this.gamepadButtonHeld(GAMEPAD_BUTTONS.sprint); }

  /** Latch discrete actions even when keydown and keyup arrive within one frame. */
  justPressed(key: Phaser.Input.Keyboard.Key): boolean {
    return this.pendingPresses.delete(key.keyCode);
  }

  justDirection(direction: 'up'|'down'|'left'|'right'): boolean {
    const keyboard=this[direction].map(key=>this.justPressed(key)).some(Boolean);
    return this.pendingGamepadPresses.delete(GAMEPAD_BUTTONS[direction]) || keyboard;
  }

  justScrapbook(): boolean {
    return this.pendingGamepadPresses.delete(GAMEPAD_BUTTONS.scrapbook) || this.justPressed(this.scrapbook);
  }

  justInventory(): boolean {
    return this.pendingGamepadPresses.delete(GAMEPAD_BUTTONS.inventory) || this.justPressed(this.inventory);
  }

  justClosed(): boolean {
    const keyboard=this.close.map(key=>this.justPressed(key)).some(Boolean);
    return this.pendingGamepadPresses.delete(GAMEPAD_BUTTONS.close) || keyboard;
  }

  justPaused(): boolean { return this.pendingGamepadPresses.delete(GAMEPAD_BUTTONS.pause); }

  justTogether(): boolean {
    const keyboard = this.justPressed(this.together);
    return this.pendingGamepadPresses.delete(GAMEPAD_BUTTONS.together) || keyboard;
  }

  /** Tracks deliberate stick/trigger intent without letting analog drift steal UI hints. */
  pollPresentation(): void {
    const pad=this.gamepad?.getPad(0);
    if(!pad) return;
    const x=Math.abs(pad.leftStick?.x??0),y=Math.abs(pad.leftStick?.y??0);
    const analogActive=Math.max(x,y)>=.42;
    if(analogActive&&!this.analogIntent)observeController(pad.id);
    this.analogIntent=analogActive||(this.analogIntent&&Math.max(x,y)>.24);
    const trigger=pad.buttons[GAMEPAD_BUTTONS.sprint];
    const triggerValue=Math.max(trigger?.pressed?1:0,trigger?.value??0);
    const triggerActive=triggerValue>=.35;
    if(triggerActive&&!this.triggerIntent)observeController(pad.id);
    this.triggerIntent=triggerActive||(this.triggerIntent&&triggerValue>.15);
  }

  axis(): Phaser.Math.Vector2 {
    this.pollPresentation();
    const pad=this.gamepad?.getPad(0),stick=pad?.leftStick;
    const stickX=Math.abs(stick?.x??0)>=.24?(stick?.x??0):0;
    const stickY=Math.abs(stick?.y??0)>=.24?(stick?.y??0):0;
    const x = Phaser.Math.Clamp(Number(this.right.some((key) => key.isDown)||this.gamepadButtonHeld(GAMEPAD_BUTTONS.right))
      - Number(this.left.some((key) => key.isDown)||this.gamepadButtonHeld(GAMEPAD_BUTTONS.left))+stickX,-1,1);
    const y = Phaser.Math.Clamp(Number(this.down.some((key) => key.isDown)||this.gamepadButtonHeld(GAMEPAD_BUTTONS.down))
      - Number(this.up.some((key) => key.isDown)||this.gamepadButtonHeld(GAMEPAD_BUTTONS.up))+stickY,-1,1);
    return new Phaser.Math.Vector2(x, y).normalize();
  }

  justInteracted(): boolean {
    const presses = this.interact.map((key) => this.justPressed(key));
    return this.pendingGamepadPresses.delete(GAMEPAD_BUTTONS.interact) || presses.some(Boolean);
  }

  interactHeld(): boolean {
    return this.interact.some(key=>key.isDown)||this.gamepadButtonHeld(GAMEPAD_BUTTONS.interact);
  }

  private gamepadButtonHeld(index:number):boolean {
    return this.gamepad?.getPad(0)?.buttons[index]?.pressed===true;
  }
}
