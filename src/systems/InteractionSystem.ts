import type Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { INTERACTION_MODES, type InteractionMode } from '../types/game';
import { addSmallText } from '../ui/PixelFont';
import { selectInteraction } from './InteractionSelection';
import { approachDistance, promptPosition, type InteractionApproach } from './InteractionGeometry';
import type { Rect } from '../world/regions/definitions';
import { DiscoveryCueSystem, type DiscoveryCueLevel } from './DiscoveryCue';
import { addControlHint } from '../ui/ControllerGlyphs';
import { steppedPanel, UI_MATERIAL as M } from '../ui/TactileUI';

export interface InteractionTarget {
  id: string;
  object: Phaser.GameObjects.Components.Transform & { active: boolean };
  range?: number;
  prompt?: string | (() => string);
  priority?: number;
  approach?: InteractionApproach | (() => InteractionApproach);
  mode?: InteractionMode;
  exhausted?: () => boolean;
  enabled?: () => boolean;
  discoveryCue?: DiscoveryCueLevel;
  /** Lets persistent interactions quiet their cue after its authored discovery is complete. */
  discoveryCueEnabled?: () => boolean;
  interact: () => void;
}

export class InteractionSystem {
  private readonly targets = new Map<string, InteractionTarget>();
  private nearest?: InteractionTarget;
  private readonly marker: Phaser.GameObjects.Container;
  private readonly markerBackground: Phaser.GameObjects.Graphics;
  private readonly markerHint: Phaser.GameObjects.Container;
  private debug?: Phaser.GameObjects.Graphics;
  private debugVisible = false;
  private debugLabel?:Phaser.GameObjects.BitmapText;
  private readonly cues: DiscoveryCueSystem;

  constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    private readonly solids: readonly Rect[] = [],
  ) {
    this.cues = new DiscoveryCueSystem(scene);
    this.markerBackground = scene.add.graphics();
    this.markerHint=addControlHint(scene,'interact','Use',0,0,M.ink,'center');
    this.marker = scene.add.container(0, 0, [this.markerBackground,this.markerHint])
      .setDepth(5000)
      .setVisible(false);
    if (import.meta.env.DEV) {
      this.debug = scene.add.graphics().setDepth(4999);
      this.debugLabel=addSmallText(scene,8,8,'',0xffdf82).setScrollFactor(0).setDepth(5001);
      this.debugVisible = new URLSearchParams(location.search).has('interactionDebug');
      const toggle = (): void => { this.debugVisible = !this.debugVisible; };
      scene.input.keyboard?.on('keydown-F2', toggle);
      scene.events.once('shutdown', () => scene.input.keyboard?.off('keydown-F2', toggle));
    }
  }

  register(target: InteractionTarget): void {
    this.targets.set(target.id, target);
    this.cues.register({ id: target.id, level: target.discoveryCue ?? 'NONE',
      anchor: () => this.approach(target).promptAnchor ?? this.approach(target).anchor,
      enabled: () => this.isAvailable(target) && (target.discoveryCueEnabled?.() ?? true) });
  }

  unregister(id: string): void {
    this.targets.delete(id);
    this.cues.unregister(id);
    if (this.nearest?.id === id) {
      this.nearest = undefined;
      this.marker.setVisible(false);
    }
  }

  update(enabled = true): void {
    this.drawDebug();
    this.cues.update(this.player.feetPosition, !enabled);
    if (!enabled) {
      this.nearest = undefined;
      this.marker.setVisible(false);
      return;
    }
    const best = selectInteraction([...this.targets.values()].filter(target => this.isAvailable(target)).map(target => {
      const approach = this.approach(target);
      return { id: target.id, target, distance: approachDistance(this.player.feetPosition, approach, this.solids),
        priority: target.priority ?? 10, range: approach.radius ?? target.range ?? 34,
        facingScore: approach.preferredFacing === this.player.facingDirection ? 1 : 0 };
    }), this.nearest?.id)?.target;

    this.nearest = best;
    if (!best) {
      this.marker.setVisible(false);
      return;
    }

    const prompt=typeof best.prompt==='function'?best.prompt():best.prompt??'Use';
    this.markerHint.setData('label',prompt);
    this.markerHint.getData('refreshInputPresentation')();
    const width=Math.max(42,Math.ceil(Number(this.markerHint.getData('hintWidth')))+18);
    const left=-Math.floor(width/2),g=this.markerBackground.clear();
    g.fillStyle(M.ink,.22).fillRect(left+2,-6,width,17);
    steppedPanel(g,left,-9,width,18,M.paperLight,M.paperEdge);
    g.fillStyle(M.paper).fillRect(left+4,-7,width-8,1);
    g.fillStyle(M.paperEdge).fillRect(-2,9,4,1).fillRect(-1,10,2,1);
    const approach = this.approach(best);
    const point = promptPosition(approach.promptAnchor ?? approach.anchor, this.player.feetPosition, width,this.solids);
    this.marker.setPosition(point.x, point.y).setVisible(true);
  }

  interact(): boolean {
    if (!this.nearest) return false;
    const target = this.nearest;
    if (!this.isAvailable(target) || approachDistance(this.player.feetPosition, this.approach(target), this.solids)
      > (this.approach(target).radius ?? target.range ?? 34)) return false;
    this.player.faceToward(this.approach(target).anchor);
    target.interact();
    if (!this.isAvailable(target)) {
      this.nearest = undefined;
      this.marker.setVisible(false);
    }
    return true;
  }

  get selectedId(): string | undefined { return this.nearest?.id; }
  get reviewTargets(): unknown[] {
    return [...this.targets.values()].map(t => ({ id: t.id, x: t.object.x, y: t.object.y, range: t.range ?? 34,
      available: this.isAvailable(t), priority: t.priority ?? 10, approach: this.approach(t),
      selected: t.id === this.nearest?.id, prompt: typeof t.prompt === 'function' ? t.prompt() : t.prompt ?? 'Use' }));
  }

  private approach(target: InteractionTarget): InteractionApproach {
    return typeof target.approach === 'function' ? target.approach() : target.approach
      ?? { anchor: { x: target.object.x, y: target.object.y + 15 }, radius: target.range ?? 34 };
  }

  private drawDebug(): void {
    if (!this.debug) return;
    const g = this.debug.clear();
    this.debugLabel?.setVisible(this.debugVisible);
    if (!this.debugVisible) return;
    const selected=this.nearest;
    this.debugLabel?.setText(selected?`${selected.id}\nSIDE ${this.approach(selected).approachSide??'radial'} / PRIORITY ${selected.priority??10}`:'No selected approach');
    for (const target of this.targets.values()) {
      if (!this.isAvailable(target)) continue;
      const a = this.approach(target);
      g.lineStyle(1, target.id === this.nearest?.id ? 0xffdf82 : 0x80c8c2, 0.85);
      if (a.shape) g.strokeRect(a.shape.x, a.shape.y, a.shape.width, a.shape.height);
      else g.strokeCircle(a.anchor.x, a.anchor.y, a.radius ?? target.range ?? 34);
      g.fillStyle(0xffdf82).fillRect(a.anchor.x - 2, a.anchor.y - 2, 4, 4);
    }
  }

  private isAvailable(target: InteractionTarget): boolean {
    if (!target.object.active || target.enabled?.() === false) return false;
    const mode = target.mode ?? INTERACTION_MODES.repeatable;
    return mode === INTERACTION_MODES.repeatable || target.exhausted?.() !== true;
  }

  destroy(): void {
    this.marker.destroy(true);
    this.debug?.destroy();
    this.debugLabel?.destroy();
    this.cues.destroy();
    this.targets.clear();
  }
}
