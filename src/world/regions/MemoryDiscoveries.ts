import type Phaser from 'phaser';
import { MEMORIES } from '../../data/memories';
import { GAME_EVENTS } from '../../config/constants';
import { gameEvents } from '../../systems/events';
import type { GameStateStore } from '../../systems/GameStateStore';
import { SCRAPBOOK_LIVING_FLAGS } from '../../ui/LivingScrapbook';

export function remember(_scene: Phaser.Scene, state: GameStateStore, memoryId: string, fragmentId: string): boolean {
  const memory = MEMORIES[memoryId];
  if (!memory || !state.collectFragment(memoryId, fragmentId, memory.restoreAt)) return false;
  gameEvents.emit(GAME_EVENTS.notification, { title: memory.fragmentClues[fragmentId] ?? 'Something familiar',
    detail: 'A clue without its meaning yet. Kept in your Scrapbook.' });
  return true;
}

export function restoreMemory(scene: Phaser.Scene, state: GameStateStore, memoryId: string): boolean {
  const memory = MEMORIES[memoryId];
  if (!memory || !state.restoreMemory(memoryId)) return false;
  state.setFlag(SCRAPBOOK_LIVING_FLAGS.latestRestored, memoryId);
  const computerQueued=state.queueComputerMemoryUpdate(memoryId);
  gameEvents.emit(GAME_EVENTS.notification, { title: memory.title,
    detail: 'The pieces settle into place. A restored page is waiting in your Scrapbook.' });
  {
    scene.game.events.emit('memory-restored', memoryId);
    if(computerQueued)gameEvents.emit('world-cue',{
      title:'A quiet response',
      detail:'Somewhere, a screen flickers on.',
    });
    scene.game.events.emit('collection-ui-feedback', { surface: 'scrapbook', action: 'open' });
    if (!state.snapshot.settings.reducedCameraMotion) scene.cameras.main.flash(400, 255, 222, 173, false);
  }
  return true;
}
