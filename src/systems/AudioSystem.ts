import type Phaser from 'phaser';
import { audioGain, chooseFootstep, CURATED_AUDIO, MENU_VOICE_TRIM, type AudioChannel } from '../config/audio';
import type { Gait } from '../config/movement';
import type { GameSettings } from '../types/game';
import type { Surface } from '../world/SurfaceQuery';
import { installAudioDiagnostics } from './AudioDiagnostics';
import { collectionSoundKey, UI_FEEDBACK_EVENT, type CollectionFeedback } from '../config/uiFeedback';

type RuntimeSound = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
type AudioSlot = string;

export class AudioSystem {
  private scene?: Phaser.Scene;
  private ambienceKey?: string;
  private ambienceLevel = 1;
  private readonly playing = new Map<RuntimeSound, { channel: AudioChannel; gain: number; slot: AudioSlot }>();
  private previousStep?: string;
  private stepSurface?: Surface;
  private park = false;
  private roadLevel = 0;
  private blocked = false;
  private focused = true;
  private lastGoodbye = -Infinity;
  private missedGoodbyes = 0;
  private startedObserver?: (key: string, channel: AudioChannel, volume: number, loop: boolean) => void;

  constructor(private readonly settings: () => Readonly<GameSettings>) {}

  connect(scene: Phaser.Scene, location: 'park' | 'menu' | 'quiet' = 'park'): void {
    this.stopAll();
    this.scene = scene;
    this.blocked = false;
    this.park = location === 'park';
    this.roadLevel = 0;
    this.stepSurface = undefined;
    this.focused = !document.hidden;
    this.ambienceKey = location === 'park' ? CURATED_AUDIO.parkAmbience
      : location === 'menu' ? CURATED_AUDIO.menuAmbience : undefined;
    this.ambienceLevel = 1;
    // The shared game bus owns one semantic event per committed UI transition.
    // Scene lifecycle removes the router; no transient queue survives unlock/teardown.
    const collection = (event: CollectionFeedback): void => {
      if (this.scene !== scene) return;
      const key = collectionSoundKey(event);
      if (key) this.play(key, 'sfx');
    };
    scene.game.events.on(UI_FEEDBACK_EVENT, collection);
    const startAmbience = (): void => {
      if (this.scene !== scene || !this.focused || !this.ambienceKey) return;
      if ([...this.playing.keys()].some(({ key }) => key === this.ambienceKey)) return;
      this.play(this.ambienceKey, 'ambience',this.ambienceLevel);
    };
    const blur = (): void => { this.focused = false; this.stopAll(); };
    const focus = (): void => { this.focused = true; startAmbience(); };
    const context = 'context' in scene.sound ? (scene.sound as Phaser.Sound.WebAudioSoundManager).context : undefined;
    // Phaser unlocks initially. This also repairs a later suspended/interrupted context
    // on a genuine gesture, without replaying missed transient cues.
    const gesture = (): void => {
      if (context && context.state !== 'running' && context.state !== 'closed') {
        void context.resume().then(startAmbience).catch(() => { /* Retry on the next gesture. */ });
      } else startAmbience();
    };
    const contextChanged = (): void => {
      if (context?.state === 'running') startAmbience();
    };
    document.addEventListener('pointerdown', gesture);
    document.addEventListener('keydown', gesture);
    context?.addEventListener('statechange', contextChanged);
    scene.sound.on('unlocked', startAmbience);
    scene.game.events.on('blur', blur);
    scene.game.events.on('focus', focus);
    scene.events.once('shutdown', () => {
      scene.game.events.off(UI_FEEDBACK_EVENT, collection);
      scene.sound.off('unlocked', startAmbience);
      scene.game.events.off('blur', blur);
      scene.game.events.off('focus', focus);
      document.removeEventListener('pointerdown', gesture);
      document.removeEventListener('keydown', gesture);
      context?.removeEventListener('statechange', contextChanged);
      if (this.scene === scene) { this.startedObserver = undefined; this.stopAll(); this.scene = undefined; }
    });
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('audioDebug')) {
      this.startedObserver = installAudioDiagnostics(scene, () => this.effectiveGainSnapshot());
    }
    startAmbience();
  }

  play(key: string, channel: AudioChannel, gain = 1, explicitSlot?: string, allowWhileBlocked = false): RuntimeSound | undefined {
    const asset = CURATED_AUDIO.assets.find((entry) => entry.key === key && entry.channel === channel);
    const scene = this.scene;
    // Transient events are never queued behind a browser's autoplay lock.
    if (!asset || !scene || !this.focused || scene.sound.locked || !scene.cache.audio.exists(key)) return;
    if ('context' in scene.sound && (scene.sound as Phaser.Sound.WebAudioSoundManager).context.state !== 'running') return;
    if (this.blocked && (channel === 'footsteps' || channel === 'voice') && !allowWhileBlocked) return;
    const loop = channel === 'music' || channel === 'ambience';
    const slot: AudioSlot = explicitSlot ?? (key === CURATED_AUDIO.trafficAmbience ? 'traffic' : channel);
    if (channel === 'footsteps' || channel === 'voice' || loop) this.stopSlot(slot);
    const trim = gain * asset.gain;
    const volume = this.mixGain(channel, trim);
    const sound = scene.sound.add(key, { loop, volume }) as RuntimeSound;
    this.playing.set(sound, { channel, gain: trim, slot });
    sound.once('complete', () => { this.playing.delete(sound); sound.destroy(); });
    if (!sound.play()) { this.playing.delete(sound); sound.destroy(); return; }
    // AudioParam.value may still expose the old quantum immediately after scheduling.
    this.startedObserver?.(key, channel, volume, loop);
    return sound;
  }

  effectiveGainSnapshot(): object {
    const sound = this.scene?.sound;
    return {
      context: sound && 'context' in sound ? (sound as Phaser.Sound.WebAudioSoundManager).context.state : 'unavailable',
      locked: sound?.locked, focused: this.focused, blocked: this.blocked,
      roadLevel: this.roadLevel, stepSurface: this.stepSurface,
      cached: CURATED_AUDIO.assets.filter(({ key }) => this.scene?.cache.audio.exists(key)).map(({ key }) => key),
      active: [...this.playing].map(([instance, entry]) => ({ key: instance.key, channel: entry.channel,
        volume: instance.volume, loop: instance.loop, playing: instance.isPlaying, slot: entry.slot })),
    };
  }

  footstep(surface: Surface, gait: Gait): void {
    this.setFootstepSurface(surface);
    const bank = CURATED_AUDIO.footsteps[surface]?.[gait] ?? [];
    const key = chooseFootstep(bank, this.previousStep);
    if (!key) return; // No grass fallback on other surfaces.
    this.previousStep = key;
    this.play(key, 'footsteps', 0.94 + Math.random() * 0.06);
  }

  /** Material changes stop the old tail but never generate a new contact. */
  setFootstepSurface(surface: Surface): void {
    if (surface !== this.stepSurface) this.stopChannel('footsteps');
    this.stepSurface = surface;
  }

  /** Receives the already-smoothed road envelope; shares AMBIENCE settings, not its playback slot. */
  setRoadProximity(level: number): void {
    this.roadLevel = Number.isFinite(level) ? Math.max(0, Math.min(1, level)) : 0;
    const key = CURATED_AUDIO.trafficAmbience;
    if (!this.park || !key || this.roadLevel === 0) { this.stopSlot('traffic'); return; }
    const asset = CURATED_AUDIO.assets.find((entry) => entry.key === key)!;
    const sound = [...this.playing.keys()].find((instance) => instance.key === key) ?? this.play(key, 'ambience', 0);
    if (!sound) return; // Unlock/focus can retry; never create duplicate loop instances.
    const entry = this.playing.get(sound)!;
    entry.gain = asset.gain * this.roadLevel;
    sound.setVolume(this.mixGain('ambience', entry.gain));
  }

  pshw(location: 'park' | 'menu'): void {
    if (CURATED_AUDIO.pshw) this.play(CURATED_AUDIO.pshw, 'voice', location === 'menu' ? MENU_VOICE_TRIM : 1);
  }

  playAuthoredVoice(key: string, gain = 1): RuntimeSound | undefined {
    return this.play(key, 'voice', gain, `authored:${key}`, true);
  }

  /** Eligible departures build pity; blocked/muted departures never queue a voice. */
  contextualGoodbye(now = Date.now(), roll = Math.random()): boolean {
    const scene=this.scene;
    if (now - this.lastGoodbye < 300000 || this.blocked || !this.focused || !scene || scene.sound.locked || this.mixGain('voice',1)<=0) return false;
    if ('context' in scene.sound && (scene.sound as Phaser.Sound.WebAudioSoundManager).context.state !== 'running') return false;
    if (roll >= Math.min(1,.2+this.missedGoodbyes*.2)) { this.missedGoodbyes++; return false; }
    if (!this.play('goodbye-protagonist', 'voice')) return false;
    this.lastGoodbye = now;
    this.missedGoodbyes = 0;
    return true;
  }

  setMovementBlocked(blocked: boolean): void {
    const changed = this.blocked !== blocked;
    this.blocked = blocked;
    // Stop ordinary movement/voice tails only on the transition into a modal.
    // Authored modal voices are allowed to start while blocked and must not be
    // killed by ParkScene repeating this state on every PRE_UPDATE frame.
    if (blocked && changed) { this.stopChannel('footsteps'); this.stopChannel('voice'); }
    if (changed) this.refreshMix();
  }

  setRegionAmbience(key?: string,level=1): void {
    this.ambienceKey = key;
    this.ambienceLevel=Number.isFinite(level)?Math.max(0,Math.min(1,level)):1;
    if (key) this.play(key, 'ambience', this.ambienceLevel, 'ambience');
  }

  /** Each emitter owns one slot; retries unlock/focus without queuing one-shots. */
  emitter(id: string, key: string, channel: AudioChannel, level: number): void {
    const slot = `local:${id}`;
    if (level < .002) { this.stopSlot(slot); return; }
    const current = [...this.playing].find(([, entry]) => entry.slot === slot)?.[0];
    const sound = current ?? this.play(key, channel, 0, slot);
    if (!sound) return;
    const entry = this.playing.get(sound)!;
    entry.gain = Math.min(1, Math.max(0, level)) * (CURATED_AUDIO.assets.find(a => a.key === key)?.gain ?? 0);
    sound.setVolume(this.mixGain(channel, entry.gain));
  }

  private mixGain(channel: AudioChannel, gain: number): number {
    return audioGain(this.settings(), channel, gain) * (this.blocked && (channel === 'ambience' || channel === 'music') ? .25 : 1);
  }

  refreshMix(): void {
    this.playing.forEach(({ channel, gain }, sound) => sound.setVolume(this.mixGain(channel, gain)));
  }

  stopChannel(channel: AudioChannel): void {
    this.playing.forEach((entry, sound) => {
      if (entry.channel !== channel) return;
      sound.stop(); sound.destroy(); this.playing.delete(sound);
    });
  }

  private stopSlot(slot: AudioSlot): void {
    this.playing.forEach((entry, sound) => {
      if (entry.slot !== slot) return;
      sound.stop(); sound.destroy(); this.playing.delete(sound);
    });
  }

  stopAll(): void {
    this.playing.forEach((_, sound) => { sound.stop(); sound.destroy(); });
    this.playing.clear();
  }
}
