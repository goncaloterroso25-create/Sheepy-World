import Phaser from 'phaser';
import { WORLD_WIDTH } from '../config/constants';
import type { GameStateStore } from './GameStateStore';
import { YellowCarVisibilityGate } from './YellowCarVisibility';

interface ActiveCar {
  id: string;
  sprite: Phaser.GameObjects.Image;
  yellow: boolean;
}

export interface YellowCarEvent {
  count: number;
  worldX: number;
  worldY: number;
  encounterId: string;
}

const ORDINARY_CAR_KEYS = ['car-red', 'car-blue', 'car-green', 'car-cream'] as const;
const AUTHORED_CAR_CROSSING_MS = 6600;
const AMBIENT_CAR_CROSSING_MS = 5900;

export class AmbientCarSystem {
  private stopped = false;
  private encounterSequence = 0;
  private authoredSequenceRunning = false;
  private ambientScheduled = false;
  private readonly activeCars: ActiveCar[] = [];
  private readonly visibilityGate = new YellowCarVisibilityGate();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly state: GameStateStore,
    private readonly explorationActive: () => boolean,
    private readonly onYellowObserved: (event: YellowCarEvent) => void,
  ) {
    if (state.snapshot.counters.yellowCars > 0) this.scheduleAmbient(2200);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.stopped = true; });
  }

  update(): void {
    if (this.stopped) return;
    if (this.state.snapshot.counters.yellowCars === 0) this.tryStartAuthoredSequence();
    else if (!this.ambientScheduled) this.scheduleAmbient();

    const camera = this.scene.cameras.main.worldView;
    const cameraBounds = { x: camera.x, y: camera.y, width: camera.width, height: camera.height };
    for (const car of this.activeCars) {
      if (!car.yellow || !car.sprite.active) continue;
      const bounds = car.sprite.getBounds();
      if (!this.visibilityGate.observe({
        encounterId: car.id,
        vehicleBounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
        cameraBounds,
        explorationActive: this.explorationActive(),
      })) continue;

      const count = this.state.incrementYellowCars();
      this.onYellowObserved({
        count,
        worldX: Math.round(car.sprite.x),
        worldY: Math.round(car.sprite.y),
        encounterId: car.id,
      });
    }
  }

  private tryStartAuthoredSequence(): void {
    if (this.authoredSequenceRunning || !this.explorationActive()) return;
    const view = this.scene.cameras.main.worldView;
    const roadIsReadable = view.y <= 48 && view.bottom >= 96;
    if (!roadIsReadable) return;

    this.authoredSequenceRunning = true;
    this.spawn(false, 'first-normal-a');
    this.scene.time.delayedCall(1900, () => this.spawn(false, 'first-normal-b'));
    this.scene.time.delayedCall(4300, () => this.spawn(true, 'first-yellow'));
    this.scene.time.delayedCall(11200, () => {
      this.authoredSequenceRunning = false;
      if (this.state.snapshot.counters.yellowCars > 0) this.scheduleAmbient(3800);
    });
  }

  private scheduleAmbient(delay?: number): void {
    if (this.stopped || this.ambientScheduled) return;
    this.ambientScheduled = true;
    this.scene.time.delayedCall(delay ?? Phaser.Math.Between(6200, 10400), () => {
      this.ambientScheduled = false;
      if (this.stopped) return;
      this.spawn(Math.random() < 0.18);
    });
  }

  private spawn(yellow: boolean, authoredId?: string): void {
    if (this.stopped) return;
    const travelsRight = authoredId ? true : Math.random() > 0.5;
    const y = travelsRight ? 39 : 74;
    const startX = travelsRight ? -32 : WORLD_WIDTH + 32;
    const endX = travelsRight ? WORLD_WIDTH + 32 : -32;
    const id = authoredId ?? `ambient-car-${this.encounterSequence += 1}`;
    const key = yellow
      ? 'car-yellow'
      : ORDINARY_CAR_KEYS[Phaser.Math.Between(0, ORDINARY_CAR_KEYS.length - 1)] ?? 'car-cream';
    const sprite = this.scene.add.image(startX, y, key)
      .setFlipX(!travelsRight)
      .setDepth(y + 3);
    const car = { id, sprite, yellow };
    this.activeCars.push(car);

    this.scene.tweens.add({
      targets: sprite,
      x: endX,
      duration: authoredId ? AUTHORED_CAR_CROSSING_MS : AMBIENT_CAR_CROSSING_MS,
      ease: 'Linear',
      onComplete: () => {
        sprite.destroy();
        const index = this.activeCars.indexOf(car);
        if (index >= 0) this.activeCars.splice(index, 1);
      },
    });
  }
}
