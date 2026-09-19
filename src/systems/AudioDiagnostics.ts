import type Phaser from 'phaser';
import type { AudioChannel } from '../config/audio';

/** Opt-in read-only DOM evidence, installed only by the development build. */
export function installAudioDiagnostics(scene: Phaser.Scene, snapshot: () => object):
  (key: string, channel: AudioChannel, volume: number, loop: boolean) => void {
  const output = document.createElement('output');
  output.id = 'audio-diagnostics';
  output.hidden = true;
  document.body.append(output);
  const starts: { key: string; channel: AudioChannel; volume: number; loop: boolean; at: number }[] = [];
  const counts: Record<string, number> = {};
  const update = (): void => { output.dataset.sample = JSON.stringify({ ...snapshot(), starts, counts }); };
  const timer = window.setInterval(update, 50);
  scene.events.once('shutdown', () => { window.clearInterval(timer); output.remove(); });
  update();
  return (key, channel, volume, loop): void => {
    starts.push({ key, channel, volume, loop, at: performance.now() });
    if (starts.length > 120) starts.shift();
    counts[channel] = (counts[channel] ?? 0) + 1;
    update();
  };
}
