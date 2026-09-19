import type Phaser from 'phaser';
import type { ComputerTerminalSession, ComputerVoice } from '../data/computerTerminal';
import { addBodyText, addHeadingText, addSmallText } from './PixelFont';
import { addControlHint } from './ControllerGlyphs';

export interface ComputerTerminalView {
  root: Phaser.GameObjects.Container;
  /** Reveals a typing page, advances pages, then reports session completion. */
  advance(): 'REVEALED' | 'ADVANCED' | 'COMPLETE';
  get page(): number;
  get typing(): boolean;
}

const VOICE_TINT: Readonly<Record<ComputerVoice, number>> = {
  CLINICAL: 0x91b9a7,
  CURIOUS: 0xa8d7b3,
  CHEEKY: 0xe4c56e,
  PERSONAL: 0xf0bca7,
};

/** Dedicated 640x360 diegetic monitor, intentionally unlike the paper UI. */
export function createComputerTerminalView(
  scene: Phaser.Scene,
  session: ComputerTerminalSession,
  actions: { close: () => void; complete: () => void },
): ComputerTerminalView {
  const root = scene.add.container(0, 0).setDepth(8000);
  const accent = VOICE_TINT[session.message.voice];
  const background = scene.add.rectangle(320, 180, 640, 360, 0x05080a, .96).setInteractive();
  const frame = scene.add.graphics();
  frame.fillStyle(0x181d20).fillRect(44, 24, 552, 312);
  frame.fillStyle(0x3d4745).fillRect(48, 28, 544, 304);
  frame.fillStyle(0x07110e).fillRect(57, 37, 526, 286);
  frame.fillStyle(0x10231c).fillRect(62, 42, 516, 276);
  frame.fillStyle(accent, .12).fillRect(65, 45, 510, 270);
  frame.fillStyle(0x080d0c, .65).fillRect(68, 93, 504, 166);
  frame.lineStyle(1, accent, .45).strokeRect(68, 93, 504, 166);
  for (let y = 48; y < 314; y += 4) frame.fillStyle(0xb9ddc8, .035).fillRect(65, y, 510, 1);

  const heading = addHeadingText(scene, 79, 57, session.message.heading, accent);
  const channel = addSmallText(scene, 80, 83,
    `LOCAL // ${session.message.voice} // ${session.kind}`, 0x6f9988);
  const body = addBodyText(scene, 82, 118, '', 0xd7eadf).setMaxWidth(472).setLineSpacing(5);
  const counter = addSmallText(scene, 497, 273, '', 0x6f9988);
  const hint=addControlHint(scene,'interact','ADVANCE',81,296,accent);
  const exit=addControlHint(scene,'back','EXIT',432,296,0x789286);
  const cursor = scene.add.rectangle(82, 240, 5, 8, accent).setOrigin(0);
  const status = scene.add.graphics();
  status.fillStyle(0x35443e).fillRect(543, 60, 20, 6);
  status.fillStyle(accent).fillRect(545, 62, session.kind === 'IDLE' ? 4 : 15, 2);
  const advanceHit = scene.add.rectangle(68, 280, 345, 31, 0, 0).setOrigin(0).setInteractive({ useHandCursor: true });
  const closeHit = scene.add.rectangle(420, 280, 152, 31, 0, 0).setOrigin(0).setInteractive({ useHandCursor: true });

  root.add([background, frame, heading, channel, body, counter, hint, exit, cursor, status, advanceHit, closeHit]);

  let page = 0;
  let character = 0;
  let typing = false;
  let typeTimer: Phaser.Time.TimerEvent | undefined;
  let completed = false;

  const currentText = (): string => session.message.pages[page] ?? '';
  const placeCursor = (): void => {
    const bounds = body.getTextBounds().local;
    cursor.setPosition(
      Math.min(548, Math.round(body.x + bounds.width + 3)),
      Math.min(243, Math.round(body.y + bounds.height - 8)),
    );
  };
  const stopTyping = (): void => {
    typeTimer?.remove(false);
    typeTimer = undefined;
    typing = false;
  };
  const reveal = (): void => {
    stopTyping();
    character = currentText().length;
    body.setText(currentText());
    placeCursor();
  };
  const typePage = (): void => {
    stopTyping();
    character = 0;
    body.setText('');
    counter.setText(`${page + 1} / ${session.message.pages.length}`);
    typing = true;
    typeTimer = scene.time.addEvent({
      delay: 24,
      repeat: Math.max(0, currentText().length - 1),
      callback: () => {
        character += 1;
        body.setText(currentText().slice(0, character));
        placeCursor();
        if (character >= currentText().length) stopTyping();
      },
    });
  };

  const advance = (): 'REVEALED' | 'ADVANCED' | 'COMPLETE' => {
    if (typing) {
      reveal();
      return 'REVEALED';
    }
    if (page < session.message.pages.length - 1) {
      page += 1;
      typePage();
      return 'ADVANCED';
    }
    if (!completed) {
      completed = true;
      actions.complete();
    }
    return 'COMPLETE';
  };

  advanceHit.on('pointerdown', advance);
  closeHit.on('pointerdown', actions.close);
  const cursorTween = scene.tweens.add({
    targets: cursor,
    alpha: { from: 1, to: .12 },
    duration: 440,
    yoyo: true,
    repeat: -1,
    ease: 'Stepped',
    easeParams: [1],
  });
  const flicker = scene.time.addEvent({
    delay: 880,
    loop: true,
    callback: () => {
      if (!root.scene) return;
      frame.setAlpha(.88);
      scene.time.delayedCall(34, () => { if (frame.scene) frame.setAlpha(1); });
    },
  });
  root.setAlpha(.18);
  const bootA = scene.time.delayedCall(42, () => { if (root.scene) root.setAlpha(.86); });
  const bootB = scene.time.delayedCall(78, () => { if (root.scene) root.setAlpha(1); });
  root.once('destroy', () => {
    stopTyping();
    flicker.remove(false);
    bootA.remove(false);
    bootB.remove(false);
    cursorTween.stop();
  });
  typePage();

  return {
    root,
    advance,
    get page(): number { return page; },
    get typing(): boolean { return typing; },
  };
}
