import { installFinalGate } from '../world/regions/FinalGate';
import { GONCALO_LANE, installGoncaloHomeAccess } from '../world/regions/GoncaloHomeAccess';
import Phaser from 'phaser';
import { InputController } from '../config/controls';
import {
  GAME_EVENTS,
  REGISTRY_KEYS,
  SCENE_KEYS,
} from '../config/constants';
import { UI_COPY } from '../data/uiCopy';
import { Player } from '../entities/Player';
import { AmbientCarSystem } from '../systems/AmbientCarSystem';
import type { YellowCarEvent } from '../systems/AmbientCarSystem';
import type { AudioSystem } from '../systems/AudioSystem';
import type { GameStateStore } from '../systems/GameStateStore';
import { InteractionSystem } from '../systems/InteractionSystem';
import { gameEvents } from '../systems/events';
import { buildPark } from '../world/ParkBuilder';
import { regionSurfaceAt } from '../world/regions/RegionSurface';
import type { BenchInteraction } from '../systems/BenchInteraction';
import { installMovementDiagnostics } from '../systems/MovementDiagnostics';
import { TrafficProximity } from '../systems/TrafficProximity';
import { contains, RegionTransitionGate, WORLD_REGIONS, type WorldLocation, type WorldRegion } from '../world/regions/definitions';
import { buildRiverTown } from '../world/regions/RiverTown';
import { buildVilaMeow } from '../world/regions/VilaMeow';
import { buildHomeInterior } from '../world/regions/HomeInterior';
import { buildAutumnConnection } from '../world/regions/AutumnConnection';
import { installParkContent } from '../world/regions/ParkContent';
import { installRegionContent } from '../world/regions/RegionContent';
import { buildOldWorldFestival } from '../world/regions/OldWorldFestival';
import { REGION_REVIEW_VIEWS } from '../dev/regionReview';
import { buildPorto, buildSnow, buildGoncaloHome } from '../world/regions/ExpansionWorld';
import { buildCrimeScene } from '../world/regions/CrimeScene';
import type { DialogueDefinition } from '../types/game';
import { buildFinalPark, installFinalPark } from '../world/regions/FinalPark';
import { TogetherWorld } from '../world/regions/TogetherWorld';

export class ParkScene extends Phaser.Scene {
  private player!: Player;
  private controls!: InputController;
  private interactions!: InteractionSystem;
  private state!: GameStateStore;
  private uiBlocking = false;
  private cars?: AmbientCarSystem;
  private playerShadow!: Phaser.GameObjects.Image;
  private audio!: AudioSystem;
  private benchInteraction?: BenchInteraction;
  private region!: WorldRegion;
  private arrival?: WorldLocation;
  private arrivalDoor?: 'door-open' | 'door-close';
  private transition = new RegionTransitionGate();
  private dialogueCameraFocused = false;

  constructor() {
    super(SCENE_KEYS.park);
  }

  init(data: { location?: WorldLocation; door?: 'door-open' | 'door-close' } = {}): void {
    this.arrival = data.location;
    this.arrivalDoor = data.door;
    this.transition = new RegionTransitionGate();
    this.cars = undefined;
    this.benchInteraction = undefined;
  }

  create(): void {
    this.state = this.registry.get(REGISTRY_KEYS.state) as GameStateStore;
    if (!this.arrival) this.state.movement.reset();
    this.state.movement.setLock('cutscene', false);
    this.state.movement.setLock('focus', document.hidden);
    this.uiBlocking = false;
    let location = this.arrival ?? this.state.snapshot.worldLocation;
    if(location.regionId==='final-park'&&!this.state.finalRouteReady){
      location={regionId:'autumn-parklands',entryId:'from-final'};this.state.arriveAt(location);
    }
    this.region = WORLD_REGIONS[location.regionId];
    this.audio = this.registry.get(REGISTRY_KEYS.audio) as AudioSystem;
    this.audio.connect(this, this.region.audio);
    // Play once on the receiving scene so shutdown cannot truncate the foley tail.
    if (this.arrivalDoor) {
      this.audio.play(this.arrivalDoor, 'sfx');
      if (this.arrivalDoor === 'door-close') this.time.delayedCall(420, () => this.audio.contextualGoodbye());
    }

    this.physics.world.setBounds(0, 0, this.region.width, this.region.height);
    const park = this.region.id === 'autumn-parklands' ? buildPark(this) : undefined;
    if (park) buildAutumnConnection(this, park.obstacles);
    const obstacles = park?.obstacles ?? (this.region.id === 'final-park' ? buildFinalPark(this) : this.region.id === 'river-town' ? buildRiverTown(this)
      : this.region.id === 'vila-meow' ? buildVilaMeow(this) : this.region.id === 'old-world-festival' ? buildOldWorldFestival(this)
      : this.region.id === 'porto' ? buildPorto(this) : this.region.id === 'snow-highlands' ? buildSnow(this)
      : this.region.id === 'river-crime-scene' ? buildCrimeScene(this)
      : this.region.id === 'goncalo-home' ? buildGoncaloHome(this) : buildHomeInterior(this));
    const spawn = this.previewSpawn(location);
    const surfaceAt = (feet: { x: number; y: number }) => regionSurfaceAt(this.region.id, feet);
    this.playerShadow = this.add.image(spawn.x, spawn.y + 13, 'player-contact-shadow')
      .setDepth(spawn.y - 1);
    this.player = new Player(this, spawn.x, spawn.y, this.state.movement,
      (gait, feet) => this.audio.footstep(surfaceAt(feet), gait),this.region.id==='snow-highlands'?'snow':'normal');
    this.physics.add.collider(this.player, obstacles);
    if (this.arrival) this.state.arriveAt(location);

    this.cameras.main
      .setBounds(0, 0, this.region.width, this.region.height)
      .setRoundPixels(true)
      .startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(108, 64);
    this.cameras.main.centerOn(spawn.x, spawn.y);
    if(import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview')==='region') {
      const view=new URLSearchParams(window.location.search).get('view')??'';
      if(view.startsWith('performance-')||view==='castle') {
        this.cameras.main.setFollowOffset(0,70).centerOn(spawn.x,spawn.y-70);
      }
    }
    this.cameras.main.fadeIn(220, 25, 20, 24);

    this.controls = new InputController(this);
    const requestMovement = (): void => {
      this.audio.setMovementBlocked(this.state.movement.locked);
      this.player.move(this.controls.axis(), !this.uiBlocking, this.controls.sprintHeld());
    };
    const simulateMovement = (seconds: number): void => this.player.physicsStep(seconds);
    const traffic = new TrafficProximity();
    const presentMovement = (_time: number, delta: number): void => {
      this.player.presentMovement();
      this.audio.setFootstepSurface(surfaceAt(this.player.feetPosition));
      this.audio.setRoadProximity(park ? traffic.update(this.player.feetPosition, delta) : 0);
      if (!this.player.isTravelling || this.state.movement.locked) this.audio.stopChannel('footsteps');
      this.playerShadow.setPosition(Math.round(this.player.x), Math.round(this.player.y + 13))
        .setDepth(Math.floor(this.player.y - 1)).setVisible(this.player.visible && !this.benchInteraction?.active);
    };
    this.events.on(Phaser.Scenes.Events.PRE_UPDATE, requestMovement);
    // Arcade clears scene.physics.world before later shutdown listeners run.
    const physicsWorld = this.physics.world;
    physicsWorld.on(Phaser.Physics.Arcade.Events.WORLD_STEP, simulateMovement);
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, presentMovement);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.PRE_UPDATE, requestMovement);
      physicsWorld.off(Phaser.Physics.Arcade.Events.WORLD_STEP, simulateMovement);
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, presentMovement);
    });
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('movementDebug')) {
      installMovementDiagnostics(this, this.player, this.state.movement, this.controls);
    }
    const collisionRects = obstacles.getChildren().map(object => {
      const body = (object as Phaser.Physics.Arcade.Sprite).body!;
      return { x: body.x, y: body.y, width: body.width, height: body.height };
    });
    this.interactions = new InteractionSystem(this, this.player, collisionRects);
    const updateCats = installRegionContent(this, this.region.id, this.state, this.interactions, this.player, collisionRects);
    updateCats();
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, updateCats);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(Phaser.Scenes.Events.POST_UPDATE, updateCats));
    if (park) this.benchInteraction = installParkContent(this, park, this.player, this.state, this.interactions);
    if(this.region.id==='final-park')installFinalPark(this,this.state,this.interactions,this.player);
    if(park)installFinalGate(this,this.state,this.interactions,()=>this.travel({regionId:'final-park',entryId:'quiet-branch'}));
    new TogetherWorld(this,this.state,this.player,this.interactions,this.region,collisionRects);

    if (park) this.cars = new AmbientCarSystem(
      this,
      this.state,
      () => !this.state.movement.locked && this.scene.isActive(SCENE_KEYS.park),
      (event) => this.handleYellowCar(event),
    );
    gameEvents.on(GAME_EVENTS.uiBlockingChanged, this.handleUiBlocking, this);
    gameEvents.on(GAME_EVENTS.dialogueStart, this.handleDialogueCameraFocus, this);
    const blur = (): void => {
      this.state.movement.setLock('focus', true);
      this.player.move(new Phaser.Math.Vector2(), false);
      this.audio.setMovementBlocked(true);
    };
    const focus = (): void => { this.state.movement.setLock('focus', false); };
    this.game.events.on(Phaser.Core.Events.BLUR, blur);
    this.game.events.on(Phaser.Core.Events.FOCUS, focus);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off(GAME_EVENTS.uiBlockingChanged, this.handleUiBlocking, this);
      gameEvents.off(GAME_EVENTS.dialogueStart, this.handleDialogueCameraFocus, this);
      this.interactions.destroy();
      this.benchInteraction?.destroy();
      this.game.events.off(Phaser.Core.Events.BLUR, blur);
      this.game.events.off(Phaser.Core.Events.FOCUS, focus);
    });

    if (this.scene.isPaused(SCENE_KEYS.ui)) this.scene.resume(SCENE_KEYS.ui);
    else if (!this.scene.isActive(SCENE_KEYS.ui)) this.scene.launch(SCENE_KEYS.ui);
    for (const exit of this.region.exits.filter((entry) => entry.door && entry.id !== GONCALO_LANE)) {
      this.interactions.register({ id: exit.id, object: this.add.zone(exit.area.x + exit.area.width / 2,
        exit.area.y + exit.area.height / 2 - 12, 1, 1), range: 38, priority: 100,
        prompt: this.region.id === 'home-interior' || this.region.id === 'goncalo-home' || this.region.id === 'river-crime-scene' ? 'Go out' : 'Enter',
        interact: () => this.travel(this.transition.request(exit, this.state.movement.locked, false, true)) });
    }
    const homeLane = this.region.exits.find(exit => exit.id === GONCALO_LANE);
    if (homeLane) installGoncaloHomeAccess(this,this.state,this.interactions,homeLane,
      () => this.travel(this.transition.request(homeLane,this.state.movement.locked,false,true)));
    if(park)this.time.delayedCall(500, () => gameEvents.emit(GAME_EVENTS.notification, {
      title: UI_COPY.park.arrivalTitle,detail:UI_COPY.park.arrivalDetail,
    }));
    if (import.meta.env.DEV && window.__SHEEPY_DEV__) {
      const dev = window.__SHEEPY_DEV__;
      dev.getWorld = () => ({ regionId: this.region.id, x: this.player.x, y: this.player.y,
        feet: this.player.feetPosition, surface: surfaceAt(this.player.feetPosition),
        transition: this.transition.active, locked: this.state.movement.locked,
        carrying: this.state.snapshot.cats.tobias === 'carried', chicho: this.state.chicho,
        facing: this.player.facingDirection, texture: this.player.texture.key, interaction: this.interactions.selectedId,
        targets: this.interactions.reviewTargets, geometry: collisionRects,
        width: this.region.width, height: this.region.height, entries: this.region.entries, exits: this.region.exits,
        children: this.children.length, obstacles: obstacles.getChildren().length });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { delete dev.getWorld; });
    }
  }

  update(): void {
    // Consume even under a modal so closing dialogue never queues a world action.
    const justInteracted = this.controls.justInteracted();
    this.cars?.update();
    if (this.benchInteraction?.active) {
      this.interactions.update(false);
      this.benchInteraction.update(this.uiBlocking,
        this.controls.interactHeld(),
        !this.uiBlocking && justInteracted);
      return;
    }
    if (this.state.movement.locked) { this.interactions.update(false); return; }

    const exit = this.region.exits.find((entry) => !entry.door && contains(entry.area, this.player.feetPosition));
    this.travel(this.transition.request(exit, this.uiBlocking, this.player.isTravelling, false));
    if (this.transition.active) return;

    this.interactions.update();
    if (justInteracted) this.interactions.interact();
  }

  private handleUiBlocking(blocking: boolean): void {
    // UI may update before this scene. Its closing press belongs to the modal,
    // even though movement has become unlocked before our update this frame.
    if (this.uiBlocking && !blocking) this.controls.justInteracted();
    this.uiBlocking = blocking;
    this.state.movement.setLock('modal', blocking);
    this.audio.setMovementBlocked(this.state.movement.locked);
    if (blocking) {
      this.interactions.update(false);
      this.player.move(new Phaser.Math.Vector2(), false);
    } else if (this.dialogueCameraFocused) {
      this.dialogueCameraFocused = false;
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12).setDeadzone(108, 64);
    }
  }

  private handleDialogueCameraFocus(dialogue: DialogueDefinition): void {
    if (!dialogue.worldFocus) return;
    this.dialogueCameraFocused = true;
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(Math.round(dialogue.worldFocus.x), Math.round(dialogue.worldFocus.y));
  }

  private handleYellowCar(event: YellowCarEvent): void {
    this.audio.pshw('park');
    this.player.playPshwReaction();
    const direction = this.player.facingDirection === 'left' ? -1 : 1;
    const impact = this.add.image(
      Math.round(this.player.x + direction * 16),
      Math.round(this.player.y - 8),
      'pshw-impact',
    ).setDepth(this.player.depth + 4);
    this.tweens.add({
      targets: impact,
      x: impact.x + direction * 5,
      y: impact.y - 5,
      alpha: 0,
      duration: 420,
      ease: 'Stepped',
      easeParams: [5],
      onComplete: () => impact.destroy(),
    });
    if (!this.state.snapshot.settings.reducedCameraMotion) {
      this.cameras.main.shake(330, 0.0042);
    }
    gameEvents.emit(GAME_EVENTS.yellowCar, event);
  }

  private travel(location: WorldLocation | undefined): void {
    if (!location) return;
    const interior = (id: string): boolean => id === 'home-interior' || id === 'goncalo-home' || id === 'river-crime-scene';
    const door = interior(location.regionId) ? 'door-open' : interior(this.region.id) ? 'door-close' : undefined;
    this.state.movement.setLock('cutscene', true);
    this.player.move(new Phaser.Math.Vector2(), false);
    this.audio.setMovementBlocked(true);
    this.interactions.update(false);
    this.scene.pause(SCENE_KEYS.ui);
    this.cameras.main.fadeOut(220, 25, 20, 24);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.restart({ location, door }));
  }

  private previewSpawn(location: WorldLocation): Phaser.Math.Vector2 {
    const entry = this.region.entries[location.entryId] ?? this.region.entries[this.region.defaultEntry]!;
    if (import.meta.env.DEV && !this.arrival) {
      const query = new URLSearchParams(window.location.search);
      if (query.get('preview') === 'region') {
        const views = REGION_REVIEW_VIEWS[this.region.id];
        const view = views[query.get('view') ?? ''];
        if (view) return new Phaser.Math.Vector2(view[0], view[1]);
      }
    }
    if (!import.meta.env.DEV || this.arrival || this.region.id !== 'autumn-parklands') return new Phaser.Math.Vector2(entry.x, entry.y);
    const focus = new URLSearchParams(window.location.search).get('focus');
    if (focus === 'sprint-test') return new Phaser.Math.Vector2(350, 752);
    if (focus === 'road') return new Phaser.Math.Vector2(390, 170);
    if (focus === 'path') return new Phaser.Math.Vector2(406, 252);
    if (focus === 'bench') return new Phaser.Math.Vector2(900, 420);
    if (focus === 'water') return new Phaser.Math.Vector2(746, 322);
    if (focus === 'npc') return new Phaser.Math.Vector2(535, 300);
    return new Phaser.Math.Vector2(entry.x, entry.y);
  }
}
