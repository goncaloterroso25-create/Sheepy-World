import type { Gait } from './movement';
import type { Surface } from '../world/SurfaceQuery';
import type { GameSettings } from '../types/game';

export type AudioChannel = 'music' | 'ambience' | 'sfx' | 'footsteps' | 'voice';
export type VolumeSetting = `${AudioChannel}Volume` | 'masterVolume';
export const AUDIO_CONTROLS: readonly { label: string; setting: VolumeSetting }[] = [
  { label: 'MASTER', setting: 'masterVolume' },
  { label: 'MUSIC', setting: 'musicVolume' },
  { label: 'AMBIENCE', setting: 'ambienceVolume' },
  { label: 'SFX', setting: 'sfxVolume' },
  { label: 'FOOTSTEPS', setting: 'footstepsVolume' },
  { label: 'VOICE', setting: 'voiceVolume' },
];
export const AUDIO_DEFAULTS = {
  masterVolume: 0.65, musicVolume: 0.7, ambienceVolume: 0.3,
  sfxVolume: 0.65, footstepsVolume: 0.5, voiceVolume: 0.8,
} as const;
const CHANNEL_TRIM: Record<AudioChannel, number> = {
  music: 0.3, ambience: 0.14, sfx: 0.45, footsteps: 0.3, voice: 0.65,
};
export const MENU_VOICE_TRIM = 0.45;
export const SHEEPY_WORLD_THEME = 'sheepy-world-theme';
export interface AudioAsset { key: string; url: string; channel: AudioChannel; gain: number }
export interface AudioCuration {
  assets: readonly AudioAsset[];
  footsteps: Partial<Record<Surface, Partial<Record<Gait, readonly string[]>>>>;
  parkAmbience?: string;
  menuAmbience?: string;
  trafficAmbience?: string;
  pshw?: string;
}

// The public edition intentionally ships only the cleared original score. The
// mixer, emitters, settings and surface routing remain available to demonstrate
// the architecture without distributing private voice or source/master audio.
export const CURATED_AUDIO: AudioCuration = {
  assets: [
    { key: SHEEPY_WORLD_THEME, url: '/assets/audio/music/sheepy-world-theme.mp3', channel: 'music', gain: .85 },
  ],
  footsteps: {},
};

export function audioGain(settings: Readonly<GameSettings>, channel: AudioChannel, gain = 1): number {
  const clamp = (value: number): number => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  return clamp(settings.masterVolume) * clamp(settings[`${channel}Volume`])
    * CHANNEL_TRIM[channel] * clamp(gain);
}

export function chooseFootstep(bank: readonly string[], previous?: string, random = Math.random()): string | undefined {
  const choices = bank.length > 1 ? bank.filter((key) => key !== previous) : bank;
  return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random * choices.length)))];
}
