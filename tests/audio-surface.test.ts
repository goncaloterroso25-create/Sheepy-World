import { describe, expect, it } from 'vitest';
import { AUDIO_DEFAULTS, audioGain, chooseFootstep, CURATED_AUDIO, MENU_VOICE_TRIM } from '../src/config/audio';
import { getParkSurfaceAt } from '../src/world/SurfaceQuery';
import { PARK_PATH_CLEARING, PARK_PATHS } from '../src/world/ParkComposition';
import { createDefaultSave, sanitizeSave } from '../src/systems/SaveSystem';

describe('feet surface query', () => {
  it('uses grass only on grass, not roads, pavement, path centres or the pond bank', () => {
    expect(getParkSurfaceAt({ x: 445, y: 420 })).toBe('grass');
    expect(getParkSurfaceAt({ x: 50, y: 60 })).toBe('pavement');
    expect(getParkSurfaceAt({ x: 50, y: 123 })).toBe('pavement');
    expect(getParkSurfaceAt({ x: 820, y: 350 })).toBe('stone');
    expect(getParkSurfaceAt({ x: 900, y: 270 })).toBe('water');
    PARK_PATH_CLEARING.forEach((point) => expect(getParkSurfaceAt(point)).toBe('gravel'));
    for (const path of PARK_PATHS) {
      for (const point of path.points.filter((p) => p.x >= 0 && p.x <= 1280 && p.y >= 124 && p.y <= 720)) {
        expect(getParkSurfaceAt(point)).toBe('gravel');
      }
    }
    expect(getParkSurfaceAt({ x: -1, y: 200 })).toBe('unknown');
    expect(getParkSurfaceAt({ x: NaN, y: 200 })).toBe('unknown');
  });

  it('classifies a feet crossing independently of the sprite centre', () => {
    expect(getParkSurfaceAt({ x: 630, y: 700 })).toBe('gravel');
    expect(getParkSurfaceAt({ x: 50, y: 118 })).toBe('pavement');
    expect(getParkSurfaceAt({ x: 50, y: 118 + 15 })).toBe('grass');
  });
});

describe('conservative audio routing', () => {
  const settings = createDefaultSave().settings;
  it('keeps ambience below steps and voice, and lowers menu PSHW', () => {
    expect(audioGain(settings, 'ambience')).toBeLessThan(audioGain(settings, 'footsteps'));
    expect(audioGain(settings, 'footsteps')).toBeLessThan(audioGain(settings, 'voice'));
    expect(audioGain(settings, 'voice', MENU_VOICE_TRIM)).toBeLessThan(audioGain(settings, 'voice'));
    expect(audioGain({ ...settings, masterVolume: 0 }, 'voice')).toBe(0);
    expect(audioGain({ ...settings, footstepsVolume: 0 }, 'footsteps')).toBe(0);
    expect(audioGain(settings, 'voice', NaN)).toBe(0);
    expect(audioGain(settings, 'voice', 20)).toBe(audioGain(settings, 'voice'));
  });

  it('never immediately repeats a variant when alternatives exist', () => {
    expect(chooseFootstep(['a', 'b', 'c'], 'a', 0)).toBe('b');
    expect(chooseFootstep(['a', 'b', 'c'], 'a', 0.99)).toBe('c');
    expect(chooseFootstep(['a'], 'a')).toBe('a');
    expect(chooseFootstep([])).toBeUndefined();
  });

  it('registers only the cleared original score and leaves optional public banks silent', () => {
    expect(CURATED_AUDIO.assets).toEqual([{
      key: 'sheepy-world-theme',
      url: '/assets/audio/music/sheepy-world-theme.mp3',
      channel: 'music',
      gain: .85,
    }]);
    expect(CURATED_AUDIO.footsteps).toEqual({});
    expect(CURATED_AUDIO.parkAmbience).toBeUndefined();
    expect(CURATED_AUDIO.menuAmbience).toBeUndefined();
    expect(CURATED_AUDIO.trafficAmbience).toBeUndefined();
    expect(CURATED_AUDIO.pshw).toBeUndefined();
  });

  it.each([1, 2, 3])('migrates schema %i with new mix defaults and existing progress intact', (version) => {
    const save = sanitizeSave({ version, inventory: ['bell'], settings: { voiceVolume: 0.7, sfxVolume: 0 } });
    expect(save.version).toBe(8);
    expect(save.inventory).toEqual(['bell']);
    expect(save.settings.masterVolume).toBe(AUDIO_DEFAULTS.masterVolume);
    expect(save.settings.footstepsVolume).toBe(AUDIO_DEFAULTS.footstepsVolume);
    expect(save.settings.voiceVolume).toBe(0.7);
    expect(save.settings.sfxVolume).toBe(0);
  });
});
