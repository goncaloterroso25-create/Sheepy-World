import Phaser from 'phaser';
import { TitleRoom, TITLE_GLASS } from '../art/titleRoom';
import { AUDIO_CONTROLS, SHEEPY_WORLD_THEME } from '../config/audio';
import { InputController } from '../config/controls';
import { currentInputPresentation, getControlHint } from '../config/controllerPresentation';
import { fullscreen } from '../systems/Fullscreen';
import { REGISTRY_KEYS, SCENE_KEYS } from '../config/constants';
import { STORY_FLAGS } from '../data/storyCompletion';
import type { GameStateStore } from '../systems/GameStateStore';
import type { AudioSystem } from '../systems/AudioSystem';
import { MENU_YELLOW_CAR_COOLDOWN_MS, chooseMenuCar, isMenuCarFullyVisible, menuCarDelay } from '../systems/MenuRoadAmbience';
import { hasMeaningfulProgress, titleActionsForSave, titleCreditsAvailable, type TitleAction } from '../systems/TitleFlow';
import { addBodyText, addHeadingText, addSmallText } from '../ui/PixelFont';
import { addControlLegend } from '../ui/ControllerGlyphs';

type Page = 'menu' | 'settings' | 'credits' | 'confirm';
interface PaperRow { label: string; action: () => void }
const INK = 0x614953, PAPER = 0xf0dfba;

export class TitleScene extends Phaser.Scene {
  private state!: GameStateStore;
  private audio!: AudioSystem;
  private controls!: InputController;
  private enter!: Phaser.Input.Keyboard.Key;
  private room!: TitleRoom;
  private paper!: Phaser.GameObjects.Container;
  private heading!: Phaser.GameObjects.Container;
  private prompt!: Phaser.GameObjects.BitmapText;
  private marker!: Phaser.GameObjects.Graphics;
  private rows: PaperRow[] = [];
  private page: Page = 'menu';
  private selected = 0;
  private stage: 'breathing' | 'waiting' | 'revealing' | 'menu' | 'leaving' = 'breathing';
  private readyAt = 0;
  private audioLevel = 1;
  private stickLatch = 0;
  private horizontalLatch = 0;
  private lastYellowCarAt = -Infinity;
  private previousCarYellow = false;
  private rowY = 0;
  private rowSpacing = 23;
  private lastInputPresentation = '';

  constructor() { super(SCENE_KEYS.title); }

  create(): void {
    this.state = this.registry.get(REGISTRY_KEYS.state) as GameStateStore;
    this.audio = this.registry.get(REGISTRY_KEYS.audio) as AudioSystem;
    this.audio.connect(this, 'menu');
    this.stage = 'breathing'; this.page = 'menu'; this.selected = 0;
    this.audioLevel = 1; this.stickLatch = 0; this.horizontalLatch = 0;
    this.lastYellowCarAt = -Infinity; this.previousCarYellow = false;
    this.readyAt = this.time.now + 1900;
    this.cameras.main.setZoom(1).setScroll(0, 0).setRoundPixels(true).fadeIn(950, 25, 20, 24);
    this.room = new TitleRoom(this, this.state.snapshot);
    this.paper = this.add.container(0, 0).setDepth(30).setAlpha(0);
    this.heading = this.add.container(0, 0).setDepth(9).setAlpha(0);
    const shadow = this.nativeText(addHeadingText(this, 291, 71, 'SHEEPY WORLD', 0x323247), 3).setOrigin(.5);
    const title = this.nativeText(addHeadingText(this, 290, 69, 'SHEEPY WORLD', 0xf5e6cb), 3).setOrigin(.5);
    const subtitle = this.nativeText(addBodyText(this, 290, 95, 'A CHEEKY TALE', 0xf0d8bb)).setOrigin(.5).setAlpha(0);
    this.heading.add([shadow, title, subtitle]); this.heading.setData('subtitle', subtitle);
    this.prompt = this.nativeText(addSmallText(this, 290, 158, 'PRESS ANY KEY / BUTTON', 0xf3e6cc)).setOrigin(.5).setDepth(9).setAlpha(0);
    this.controls = new InputController(this);
    this.lastInputPresentation = currentInputPresentation();
    const unwatchFullscreen=fullscreen.subscribe(()=>{if(this.page==='settings')this.renderPaper();});
    this.events.once('shutdown',unwatchFullscreen);
    this.enter = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, true);
    const wake = (): void => this.wake();
    this.input.keyboard!.on('keydown', wake); this.input.gamepad?.on('down', wake); this.input.on('pointerdown', wake);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', wake); this.input.gamepad?.off('down', wake); this.input.off('pointerdown', wake);
    });
    this.renderPaper();
    const preview = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('preview') : null;
    this.scheduleRoadCar(preview === 'menu-yellow' ? 2400 : 4400, preview === 'menu-yellow');
  }

  update(): void {
    this.controls.pollPresentation();
    this.room.update(this.time.now, this.state.snapshot.settings.reducedCameraMotion);
    this.audio.emitter('title-score', SHEEPY_WORLD_THEME, 'music', .8 * this.audioLevel);
    this.audio.emitter('title-air', 'autumn-park-bed', 'ambience', .1 * this.audioLevel);
    // Drain edges during reveals: a wake gesture must never also start a game.
    const up = this.controls.justDirection('up'), down = this.controls.justDirection('down');
    const left = this.controls.justDirection('left'), right = this.controls.justDirection('right');
    const enter = this.controls.justPressed(this.enter), confirm = this.controls.justInteracted(), back = this.controls.justClosed();
    const stick = this.input.gamepad?.getPad(0)?.leftStick;
    const vertical = Math.abs(stick?.y ?? 0) > .55 ? Math.sign(stick!.y) : 0;
    const horizontal = Math.abs(stick?.x ?? 0) > .55 ? Math.sign(stick!.x) : 0;
    const step = up ? -1 : down ? 1 : vertical !== this.stickLatch ? vertical : 0;
    const adjust = left ? -1 : right ? 1 : horizontal !== this.horizontalLatch ? horizontal : 0;
    this.stickLatch = vertical; this.horizontalLatch = horizontal;
    const presentation = currentInputPresentation();
    if (presentation !== this.lastInputPresentation && this.stage === 'menu') {
      this.lastInputPresentation = presentation; this.renderPaper();
    }
    if (this.stage === 'breathing' && this.time.now >= this.readyAt) {
      this.stage = 'waiting'; this.tweens.add({ targets: this.prompt, alpha: .85, duration: 500 });
    }
    if (this.stage !== 'menu') return;
    if (step) { this.selected = Phaser.Math.Wrap(this.selected + step, 0, this.rows.length); this.updateSelection(); }
    if (back && this.page !== 'menu') { this.showPage('menu'); return; }
    if (adjust && this.page === 'settings' && this.selected < AUDIO_CONTROLS.length) this.adjustVolume(adjust);
    else if (enter || confirm) this.rows[this.selected]?.action();
  }

  private wake(): void {
    if (this.stage !== 'waiting') return;
    this.stage = 'revealing';
    this.lastInputPresentation = currentInputPresentation(); this.renderPaper();
    this.tweens.killTweensOf(this.prompt);
    this.tweens.add({ targets: this.prompt, alpha: 0, duration: 200, onComplete: () => this.prompt.setVisible(false) });
    this.tweens.add({ targets: this.heading, alpha: 1, duration: 650 });
    this.tweens.add({ targets: this.heading.getData('subtitle'), alpha: 1, delay: 350, duration: 600 });
    this.tweens.add({ targets: this.paper, alpha: 1, delay: 700, duration: 450, onComplete: () => { this.stage = 'menu'; } });
  }

  private showPage(page: Page): void {
    this.page = page === 'credits' && !titleCreditsAvailable(this.state.snapshot) ? 'menu' : page;
    this.selected = 0;
    this.renderPaper();
  }
  private renderPaper(): void {
    this.paper.removeAll(true);
    const modal = this.page !== 'menu', x = modal ? 329 : 376, y = modal ? 133 : 218;
    const width = modal ? 266 : 217, height = modal ? 211 : 126;
    const g = this.add.graphics(); this.paper.add(g);
    g.fillStyle(0x372938, .42).fillRect(x + 5, y + 6, width, height);
    g.fillStyle(0xb99a78).fillRect(x - 2, y - 2, width + 4, height + 4);
    g.fillStyle(PAPER).fillRect(x, y, width, height);
    g.fillStyle(0xffedcc).fillRect(x + 2, y + 2, width - 4, 2);
    g.fillStyle(0xd5bd99).fillRect(x + 10, y + 9, 2, height - 18).fillRect(x + 16, y + height - 11, width - 28, 1);
    g.fillStyle(0xad7362, .55).fillRect(x + width - 29, y - 5, 18, 10);
    const text = (px: number, py: number, value: string, small = false): Phaser.GameObjects.BitmapText => {
      const label = small ? addSmallText(this, px, py, value, INK) : addBodyText(this, px, py, value, INK);
      this.nativeText(label); this.paper.add(label); return label;
    };
    this.rows = []; this.rowSpacing = 23;
    if (this.page === 'menu') {
      this.rows = titleActionsForSave(this.state.snapshot).map(action => ({ label: action === 'CONTINUE' ? 'CONTINUE' : 'NEW GAME', action: () => this.activate(action) }));
      this.rows.push({ label: 'SETTINGS', action: () => this.showPage('settings') });
      if (titleCreditsAvailable(this.state.snapshot)) {
        this.rows.push({ label: 'CREDITS', action: () => this.showPage('credits') });
      }
      this.rowY = y + (this.rows.length === 4 ? 18 : 27);
      this.paper.add(addControlLegend(this,[[['movement','MOVE'],['confirm','SELECT'],['back','BACK']]],
        x+20,y+height-19,width-32,INK));
      if (this.state.snapshot.flags[STORY_FLAGS.complete] === 'true') text(36, 330, 'YEAR ONE COMPLETE', true).setTint(0xe8c79e);
    } else if (this.page === 'settings') {
      text(x + 25, y + 15, 'A LITTLE BALANCE'); this.rowY = y + 42; this.rowSpacing = 18;
      this.rows = AUDIO_CONTROLS.map(control => ({ label: `${control.label.padEnd(10)} ${String(Math.round(this.state.snapshot.settings[control.setting] * 100)).padStart(3)}`, action: () => this.adjustVolume(1) }));
      this.rows.push({label:fullscreen.label,action:()=>{void fullscreen.toggle();}});
      this.rows.push({ label: 'BACK', action: () => this.showPage('menu') });
      text(x + 25,y + height - 17,`LEFT / RIGHT ADJUST   ${getControlHint('back')} BACK`,true).setAlpha(.65);
    } else if (this.page === 'credits') {
      text(x + 25, y + 18, 'SHEEPY WORLD'); text(x + 25, y + 38, 'A CHEEKY TALE', true);
      text(x + 25, y + 75, 'A LITTLE WORLD FOR PROTAGONIST.\n\nMADE WITH LOVE, BY GONCALO.\n\nBUILT WITH PHASER.', true);
      this.rowY = y + 176; this.rows = [{ label: 'BACK', action: () => this.showPage('menu') }];
      text(x+25,y+height-17,`${getControlHint('back')} BACK`,true).setAlpha(.65);
    } else {
      text(x + 25, y + 20, 'BEGIN AGAIN?');
      text(x + 25, y + 59, 'THIS REPLACES YOUR SAVED\nJOURNEY. YOUR CURRENT SAVE\nSTAYS UNTIL YOU CONFIRM.', true);
      this.rowY = y + 137;
      this.rows = [{ label: 'KEEP MY JOURNEY', action: () => this.showPage('menu') }, { label: 'START A NEW GAME', action: () => this.leave(true) }];
      text(x+25,y+height-17,`${getControlHint('back')} BACK`,true).setAlpha(.65);
    }
    this.rows.forEach((row, index) => {
      const py = this.rowY + index * this.rowSpacing;
      text(x + 39, py, row.label);
      const target = this.add.zone(x + 26, py - 4, this.page === 'settings' ? 168 : width - 37, this.page === 'settings' ? 18 : 21).setOrigin(0).setInteractive({ useHandCursor: true });
      this.paper.add(target);
      target.on('pointerover', () => { if (this.stage === 'menu') { this.selected = index; this.updateSelection(); } });
      target.on('pointerdown', () => { if (this.stage === 'menu') { this.selected = index; row.action(); } });
      if (this.page === 'settings' && index < AUDIO_CONTROLS.length) {
        for (const [offset, delta, symbol] of [[211, -1, '-'], [238, 1, '+']] as const) {
          text(x + offset, py, symbol);
          const button = this.add.zone(x + offset - 7, py - 4, 22, 18).setOrigin(0).setInteractive({ useHandCursor: true }); this.paper.add(button);
          button.on('pointerdown', () => { if (this.stage === 'menu') { this.selected = index; this.adjustVolume(delta); } });
        }
      }
    });
    this.marker = this.add.graphics().setData('x', x); this.paper.add(this.marker); this.updateSelection();
  }

  private updateSelection(): void {
    const x = Number(this.marker.getData('x')) + 21, y = this.rowY + this.selected * this.rowSpacing + 3;
    this.marker.clear().fillStyle(0x9b705a).fillRect(x, y + 1, 12, 7).fillRect(x + 3, y - 1, 6, 10);
    this.marker.fillStyle(0xffefcc).fillRect(x + 1, y + 1, 9, 5).fillRect(x + 3, y, 5, 7);
    this.marker.fillStyle(INK).fillRect(x + 9, y + 2, 4, 4).fillRect(x + 2, y + 8, 2, 2).fillRect(x + 7, y + 8, 2, 2);
    this.marker.fillStyle(0xa87969, .8).fillRect(x + 18, y + 11, Math.min(146, this.rows[this.selected]!.label.trim().length * 7), 1);
  }

  private nativeText(label: Phaser.GameObjects.BitmapText, scale = 1): Phaser.GameObjects.BitmapText {
    // RetroFont's nominal size differs from its cell height. Use whole atlas pixels.
    return label.setFontSize(this.cache.bitmapFont.get(label.font).data.size * scale);
  }

  private adjustVolume(delta: number): void {
    const control = AUDIO_CONTROLS[this.selected]; if (!control) return;
    this.state.setVolume(control.setting, Math.round((this.state.snapshot.settings[control.setting] + delta * .05) * 100) / 100);
    this.renderPaper();
  }
  private activate(action: TitleAction): void {
    if (action === 'NEW_GAME' && hasMeaningfulProgress(this.state.snapshot)) this.showPage('confirm');
    else this.leave(action === 'NEW_GAME');
  }
  private leave(reset: boolean): void {
    if (this.stage !== 'menu') return;
    this.stage = 'leaving';
    const duration = hasMeaningfulProgress(this.state.snapshot) && !reset ? 900 : 1500;
    this.tweens.add({ targets: [this.heading, this.paper, this.room.foreground], alpha: 0, duration: duration * .7 });
    this.tweens.add({ targets: this, audioLevel: 0, duration });
    if (!this.state.snapshot.settings.reducedCameraMotion) {
      this.cameras.main.zoomTo(2.25, duration, 'Sine.easeInOut'); this.cameras.main.pan(290, 139, duration, 'Sine.easeInOut');
    }
    this.time.delayedCall(duration - 220, () => this.cameras.main.fadeOut(220, 25, 20, 24));
    this.time.delayedCall(duration, () => { if (reset) this.state.reset(); this.scene.start(SCENE_KEYS.park); });
  }
  private scheduleRoadCar(delay?: number, forceYellow = false): void {
    this.time.delayedCall(delay ?? menuCarDelay(Math.random()), () => this.spawnRoadCar(forceYellow));
  }
  private spawnRoadCar(forceYellow = false): void {
    if (this.stage === 'leaving') return;
    const allowed = !this.previousCarYellow && this.time.now - this.lastYellowCarAt >= MENU_YELLOW_CAR_COOLDOWN_MS;
    const choice = forceYellow ? { textureKey: 'car-yellow', yellow: true } : chooseMenuCar(Math.random(), allowed);
    this.previousCarYellow = choice.yellow;
    if (choice.yellow) this.lastYellowCarAt = this.time.now;
    const car = this.add.image(38, 187, choice.textureKey).setScale(.5).setAlpha(.8).setName('title-road-car');
    this.room.exterior.add(car);
    this.tweens.add({ targets: car, x: 542, duration: 6200, ease: 'Linear', onUpdate: () => {
      car.x = Math.round(car.x);
      if (choice.yellow && !car.getData('nudged') && car.x >= 210 && isMenuCarFullyVisible(car.x, car.displayWidth / 2, TITLE_GLASS.x, TITLE_GLASS.x + TITLE_GLASS.width)) {
        car.setData('nudged', true); this.room.nudge();
      }
    }, onComplete: () => { car.destroy(); this.scheduleRoadCar(); } });
  }
}
