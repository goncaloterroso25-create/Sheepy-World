import Phaser from 'phaser';
import { createCharacterTextures } from '../art/characterTextures';
import { createWorldTextures } from '../art/worldTextures';
import { SCENE_KEYS } from '../config/constants';
import { createPlayerAnimations } from '../entities/playerAnimations';
import { createPixelUiFont } from '../ui/PixelFont';
import { CURATED_AUDIO } from '../config/audio';
import { createHomePropTextures } from '../art/homeProps';
import { createFestivalTextures } from '../art/festivalTextures';
import { PERSONAL_PHOTOS, personalMedia, type PersonalPhotoId } from '../data/personalPhotos';
import { createPeopleTextures } from '../art/peopleTextures';
import { createForestTextures } from '../art/forestTextures';
import { createPortraitTextures } from '../art/portraitTextures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot);
  }

  preload(): void {
    CURATED_AUDIO.assets.forEach((asset) => this.load.audio(asset.key, asset.url));
    const loaded=new Set<string>();
    (Object.keys(PERSONAL_PHOTOS) as PersonalPhotoId[]).flatMap(personalMedia).forEach(frame=>{
      if(frame.kind==='image'&&!loaded.has(frame.key)){this.load.image(frame.key,frame.url);loaded.add(frame.key);}
    }); // Videos stream only while their gallery item is active.
  }

  create(): void {
    createPixelUiFont(this);
    createPlayerAnimations(this);
    createCharacterTextures(this);
    createWorldTextures(this);
    createHomePropTextures(this);
    createFestivalTextures(this);
    createPeopleTextures(this);
    createForestTextures(this);
    createPortraitTextures(this);

    const preview = import.meta.env.DEV
      ? new URLSearchParams(window.location.search).get('preview')
      : null;
    if (preview === 'gallery') {
      this.scene.start(SCENE_KEYS.gallery);
      return;
    }
    if (preview && !['title', 'menu-yellow', 'menu-car'].includes(preview)) {
      this.scene.start(SCENE_KEYS.park);
      return;
    }
    this.scene.start(SCENE_KEYS.title);
  }
}
