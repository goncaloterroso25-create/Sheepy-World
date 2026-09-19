import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import type { Player } from '../src/entities/Player';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';
vi.mock('../src/ui/PixelFont', () => ({ addSmallText: () => {
  const label = { setOrigin: () => label, setDropShadow: () => label, setDepth: () => label,
    setVisible: () => label, destroy: vi.fn() };
  return label;
} }));
import { BenchInteraction } from '../src/systems/BenchInteraction';

function fixture() {
  const state = new GameStateStore(new SaveRepository(new MemoryStorage()));
  const tweens: { onComplete: () => void }[] = [];
  const scene = { tweens: { add: (tween: { onComplete: () => void }) => tweens.push(tween), killTweensOf: vi.fn() } } as unknown as Phaser.Scene;
  const actor = { x: 900, y: 415, body: { enable: true, reset: vi.fn() },
    setVelocity: vi.fn(), setPosition: vi.fn(), setSitting: vi.fn(), setDepth: vi.fn() };
  const bench = { x: 900, y: 386, depth: 401 } as Phaser.Physics.Arcade.Sprite;
  const thought = vi.fn();
  const interaction = new BenchInteraction(scene, actor as unknown as Player, bench, state, thought);
  return { state, tweens, actor, thought, interaction };
}

describe('unique bench interaction', () => {
  it('settles before thinking and defers the thought while another modal is open', () => {
    const { interaction, tweens, state, actor, thought } = fixture();
    interaction.sit();
    expect(state.movement.locked).toBe(true);
    expect(actor.body.enable).toBe(false);
    expect(thought).not.toHaveBeenCalled();
    tweens[0]!.onComplete();
    expect(actor.setSitting).toHaveBeenCalledWith(true);
    interaction.update(true, false, false);
    expect(thought).not.toHaveBeenCalled();
    interaction.update(false, false, false);
    expect(thought).toHaveBeenCalledTimes(1);
  });
  it('does not stand on the same short tap that closes dialogue; a fresh press stands safely', () => {
    const { interaction, tweens, state, actor } = fixture();
    interaction.sit();
    tweens[0]!.onComplete();
    interaction.update(false, false, false); // Emit the thought.
    interaction.update(true, false, false);
    interaction.update(false, false, true); // Closing E down+up in one frame.
    expect(tweens).toHaveLength(1);
    expect(state.movement.locked).toBe(true);
    interaction.update(false, false, false); // Release/quiet frame.
    interaction.update(false, false, true); // Deliberate fresh Stand press.
    expect(tweens).toHaveLength(2);
    tweens[1]!.onComplete();
    expect(actor.body.reset).toHaveBeenCalledWith(900, 415);
    expect(actor.body.enable).toBe(true);
    expect(state.movement.locked).toBe(false);
    expect(interaction.active).toBe(false);
  });
});
