import type Phaser from 'phaser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SHEEPY_WORLD_THEME } from '../src/config/audio';
import { createDefaultSave } from '../src/systems/SaveSystem';
import { AudioSystem } from '../src/systems/AudioSystem';

afterEach(() => vi.unstubAllGlobals());

class EventEmitter {
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  on(event: string, listener: (...args: unknown[]) => void) {
    const callbacks = this.listeners.get(event) ?? new Set<(...args: unknown[]) => void>();
    callbacks.add(listener);
    this.listeners.set(event, callbacks);
    return this;
  }
  once(event: string, listener: () => void) {
    const wrapped = () => { this.off(event, wrapped); listener(); };
    return this.on(event, wrapped);
  }
  off(event: string, listener: () => void) {
    this.listeners.get(event)?.delete(listener);
    return this;
  }
  emit(event: string, ...args: unknown[]) {
    [...(this.listeners.get(event) ?? [])].forEach((listener) => listener(...args));
  }
}

function fixture() {
  const document = new EventTarget();
  vi.stubGlobal('document', document);
  vi.stubGlobal('window', { location: { search: '' } });
  const settings = createDefaultSave().settings;
  const context = Object.assign(new EventTarget(), {
    state: 'suspended',
    resume: vi.fn(async () => {
      context.state = 'running';
      context.dispatchEvent(new Event('statechange'));
    }),
  });
  const sounds: (EventEmitter & {
    key: string;
    volume: number;
    loop: boolean;
    isPlaying: boolean;
    play: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    setVolume: (volume: number) => void;
  })[] = [];
  const manager = Object.assign(new EventEmitter(), {
    locked: true,
    context,
    add: vi.fn((key: string, options: { volume: number; loop: boolean }) => {
      const instance = Object.assign(new EventEmitter(), {
        key,
        ...options,
        isPlaying: true,
        play: vi.fn(() => true),
        stop: vi.fn(),
        destroy: vi.fn(),
        setVolume: (volume: number) => { instance.volume = volume; },
      });
      sounds.push(instance);
      return instance;
    }),
  });
  const events = new EventEmitter();
  const scene = {
    sound: manager,
    cache: { audio: { exists: (key: string) => key === SHEEPY_WORLD_THEME } },
    events,
    game: { events: new EventEmitter() },
  } as unknown as Phaser.Scene;
  const audio = new AudioSystem(() => settings);
  audio.connect(scene);
  const unlock = () => {
    context.state = 'running';
    manager.locked = false;
    manager.emit('unlocked');
  };
  return { audio, document, settings, context, manager, sounds, scene, events, unlock };
}

describe('public-edition AudioSystem lifetime', () => {
  it('loops the original score once per emitter slot and cleans it on shutdown', () => {
    const f = fixture();
    f.audio.emitter('title', SHEEPY_WORLD_THEME, 'music', .8);
    expect(f.sounds).toHaveLength(0);
    f.unlock();
    f.audio.emitter('title', SHEEPY_WORLD_THEME, 'music', .8);
    const score = f.sounds[0]!;
    expect(score.key).toBe(SHEEPY_WORLD_THEME);
    expect(score.loop).toBe(true);
    for (let i = 0; i < 50; i++) f.audio.emitter('title', SHEEPY_WORLD_THEME, 'music', .8);
    expect(f.sounds).toHaveLength(1);
    f.events.emit('shutdown');
    expect(score.stop).toHaveBeenCalledOnce();
    expect(score.destroy).toHaveBeenCalledOnce();
  });

  it('ducks the score for blocking UI and restores the live mix', () => {
    const f = fixture();
    f.unlock();
    f.audio.emitter('title', SHEEPY_WORLD_THEME, 'music', .8);
    const score = f.sounds[0]!;
    const normal = score.volume;
    f.audio.setMovementBlocked(true);
    expect(score.volume).toBeCloseTo(normal * .25);
    expect(score.stop).not.toHaveBeenCalled();
    f.audio.setMovementBlocked(false);
    expect(score.volume).toBeCloseTo(normal);
    f.settings.musicVolume = 0;
    f.audio.refreshMix();
    expect(score.volume).toBe(0);
    f.events.emit('shutdown');
  });

  it('stops on blur and permits one explicit emitter restart after focus', () => {
    const f = fixture();
    f.unlock();
    f.audio.emitter('finale', SHEEPY_WORLD_THEME, 'music', .66);
    const first = f.sounds[0]!;
    f.scene.game.events.emit('blur');
    expect(first.stop).toHaveBeenCalledOnce();
    f.audio.emitter('finale', SHEEPY_WORLD_THEME, 'music', .66);
    expect(f.sounds).toHaveLength(1);
    f.scene.game.events.emit('focus');
    f.audio.emitter('finale', SHEEPY_WORLD_THEME, 'music', .66);
    expect(f.sounds).toHaveLength(2);
    expect(f.sounds[1]?.key).toBe(SHEEPY_WORLD_THEME);
    f.events.emit('shutdown');
  });

  it('keeps excluded optional audio silent without queuing fallbacks', () => {
    const f = fixture();
    f.unlock();
    expect(f.audio.playAuthoredVoice('lisboooon')).toBeUndefined();
    expect(f.audio.contextualGoodbye(0, 0)).toBe(false);
    f.audio.pshw('park');
    f.audio.footstep('grass', 'walk');
    f.audio.setRoadProximity(1);
    f.audio.setRegionAmbience('forest-bed');
    f.scene.game.events.emit('collection-ui-feedback', { surface: 'inventory', action: 'open' });
    expect(f.sounds).toHaveLength(0);
    f.events.emit('shutdown');
  });

  it('reports the included score in diagnostics while active', () => {
    const f = fixture();
    f.unlock();
    f.audio.emitter('title', SHEEPY_WORLD_THEME, 'music', .8);
    expect(f.audio.effectiveGainSnapshot()).toMatchObject({
      blocked: false,
      cached: [SHEEPY_WORLD_THEME],
      active: [expect.objectContaining({ key: SHEEPY_WORLD_THEME, channel: 'music', loop: true })],
    });
    f.events.emit('shutdown');
  });

  it('repairs a suspended context only on a genuine gesture', async () => {
    const f = fixture();
    f.manager.locked = false;
    f.document.dispatchEvent(new Event('keydown'));
    await Promise.resolve();
    expect(f.context.resume).toHaveBeenCalledOnce();
    f.audio.emitter('title', SHEEPY_WORLD_THEME, 'music', .8);
    expect(f.sounds).toHaveLength(1);
    f.events.emit('shutdown');
    f.context.state = 'suspended';
    f.document.dispatchEvent(new Event('keydown'));
    expect(f.context.resume).toHaveBeenCalledOnce();
  });
});
