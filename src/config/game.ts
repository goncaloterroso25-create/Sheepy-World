import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, REGISTRY_KEYS } from './constants';
import { BootScene } from '../scenes/BootScene';
import { ParkScene } from '../scenes/ParkScene';
import { UIScene } from '../scenes/UIScene';
import { TitleScene } from '../scenes/TitleScene';
import { ArtGalleryScene } from '../scenes/ArtGalleryScene';
import type { AudioSystem } from '../systems/AudioSystem';
import type { GameStateStore } from '../systems/GameStateStore';
import { fullscreen } from '../systems/Fullscreen';

export function createGameConfig(state: GameStateStore, audio: AudioSystem): Phaser.Types.Core.GameConfig {
  fullscreen.install();
  return {
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#263824',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    render: { antialias: false, pixelArt: true, roundPixels: true },
    input: { gamepad: true },
    scale: {
      mode: Phaser.Scale.NONE,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [BootScene, TitleScene, ParkScene, UIScene, ...(import.meta.env.DEV ? [ArtGalleryScene] : [])],
    callbacks: {
      preBoot: (game) => {
        game.registry.set(REGISTRY_KEYS.state, state);
        game.registry.set(REGISTRY_KEYS.audio, audio);
      },
    },
  };
}
