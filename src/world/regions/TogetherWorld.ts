import Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import type { FacingDirection } from '../../entities/playerAnimations';
import type { ProtagonistPhase } from '../../art/protagonistSprites';
import { goncaloTextureKey } from '../../art/goncaloSprites';
import { createTogetherPoses, drawHeldHands } from '../../art/togetherPoses';
import { TOGETHER_ACTIVITIES, type TogetherActivity } from '../../data/togetherActivities';
import { GAME_EVENTS } from '../../config/constants';
import { gameEvents } from '../../systems/events';
import type { GameStateStore } from '../../systems/GameStateStore';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import { TogetherMotion, pairDistance, pairSafe, safeJoin, type PairPoint } from '../../systems/TogetherMotion';
import { TogetherState, togetherEnabled, TOGETHER_RUNTIME, type Partner } from '../../systems/TogetherState';
import { cozyCallbackCard, coupleBubble, togetherTag } from '../../ui/TogetherView';
import { PUBLIC_TOGETHER_COPY } from '../../data/publicEdition';
import type { Rect, WorldRegion } from './definitions';

const facing = (a: PairPoint, b: PairPoint): FacingDirection => Math.abs(b.x-a.x) > Math.abs(b.y-a.y)
  ? b.x > a.x ? 'right' : 'left' : b.y > a.y ? 'down' : 'up';
const mix = (a: PairPoint, b: PairPoint, t: number): PairPoint => ({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});

/** One scene-local owner: no physics body, delayed calls, tweens, save positions or extra cats. */
export class TogetherWorld {
  model?: TogetherState;
  actor?: Phaser.GameObjects.Image;
  private motion?: TogetherMotion;
  private hands?: Phaser.GameObjects.Graphics;
  private prompt?: Phaser.GameObjects.Container;
  private backPrompt?: Phaser.GameObjects.Container;
  private pose?: Phaser.GameObjects.Image;
  private props?: Phaser.GameObjects.Graphics;
  private television?: Phaser.GameObjects.Graphics;
  private photo?: Phaser.GameObjects.Container;
  private bubble?: Phaser.GameObjects.Container;
  private puff?: Phaser.GameObjects.Graphics;
  private microAge = 0;
  private farter?: Partner;
  private pinch?: {giver: Partner; playfulCallback: boolean};
  private activity?: TogetherActivity;
  private starts?: readonly [PairPoint, PairPoint];
  private ends?: readonly [PairPoint, PairPoint];
  private home?: readonly [PairPoint, PairPoint];
  private returning = false;
  private approachDuration = 900;
  private walkingClock = 0;
  private idleStillMs = 0;
  private squeezeIn = 30_000 + Math.random() * 25_000;
  private ownedLock = false;
  private blocked = false;
  private destroyed = false;
  private anchors: Phaser.GameObjects.Zone[] = [];
  private readonly unsubscribe: () => void;
  private readonly onBlocking = (value: boolean): void => { this.blocked = value; };
  private readonly onUpdate = (_time: number, delta: number): void => this.update(delta);
  private readonly safe = (p: PairPoint): boolean => pairSafe(p, this.solids, this.region);

  constructor(private readonly scene: Phaser.Scene, private readonly state: GameStateStore,
    private readonly player: Player, private readonly interactions: InteractionSystem,
    private readonly region: WorldRegion, private readonly solids: readonly Rect[]) {
    // The finale already owns its Gonçalo and reunion. Never instantiate a second one there.
    this.unsubscribe = state.subscribe(() => { if (!this.enabled) this.deactivate(); });
    scene.registry.set(TOGETHER_RUNTIME, this);
    gameEvents.on(GAME_EVENTS.uiBlockingChanged, this.onBlocking);
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.onUpdate);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }
  get enabled(): boolean { return togetherEnabled(this.state.snapshot) && this.region.id !== 'final-park'; }
  get busy(): boolean { return !!this.model && this.model.mode !== 'FOLLOWING'; }
  private get carrying(): boolean { return this.state.snapshot.cats.tobias === 'carried' || this.state.chicho.mode === 'carried'; }
  private get suspended(): boolean {
    return this.blocked || document.hidden || (this.ownedLock
      ? (['modal','bench','cutscene','focus'] as const).some(reason=>this.state.movement.isLockedBy(reason))
      : this.state.movement.locked);
  }

  private activate(): void {
    const start = safeJoin(this.player.feetPosition, this.player.facingDirection, 1, this.safe);
    if (!start) return; // Door fades / very tight entries may defer the first safe appearance.
    createTogetherPoses(this.scene);
    this.model = new TogetherState(); this.motion = new TogetherMotion(start, this.safe);
    this.actor = this.scene.add.image(start.x, start.y, goncaloTextureKey(this.player.facingDirection)).setOrigin(.5,1).setName('together-goncalo');
    this.hands = this.scene.add.graphics().setName('together-held-hands');
    this.props = this.scene.add.graphics();
    this.prompt = togetherTag(this.scene,'together','Pinch cheeks?').setVisible(false);
    this.backPrompt = togetherTag(this.scene,'back','GET UP').setVisible(false);
    for (const item of TOGETHER_ACTIVITIES.filter(a => a.region === this.region.id)) {
      const anchor = this.scene.add.zone(item.approach.x, item.approach.y, 1, 1);
      this.anchors.push(anchor);
      this.interactions.register({id:item.id,object:anchor,prompt:item.label,priority:45,
        approach:{anchor:item.approach,radius:24,promptAnchor:{x:item.approach.x,y:item.approach.y-35}},
        enabled:()=>this.enabled && !this.busy && !this.suspended && !this.carrying && !!this.actor && pairDistance(this.actor,this.player.feetPosition)<36,
        interact:()=>this.beginActivity(item)});
    }
    if (import.meta.env.DEV) {
      const preview = new URLSearchParams(window.location.search).get('view');
      const kind = preview === 'together-couch-callback' ? 'COUCH'
        : preview === 'together-sheeping' || preview === 'together-bump' ? 'SHEEPING' : undefined;
      const fixture = kind && TOGETHER_ACTIVITIES.find(item => item.region === this.region.id && item.kind === kind);
      if (fixture) {
        this.beginActivity(fixture);
        this.model!.elapsed = 60_000;
        this.scene.cameras.main.stopFollow().centerOn(
          (fixture.seats[0].x + fixture.seats[1].x) / 2,
          (fixture.seats[0].y + fixture.seats[1].y) / 2,
        );
      }
    }
  }

  /** Called only after the existing world's Interact edge has had priority. */
  action(): boolean {
    if (!this.model || !this.actor || this.suspended || this.carrying) return false;
    if (this.model.mode === 'SHEEPING') {
      if (this.model.bumpCooldown > 0 || this.bubble) return true;
      this.model.enter('BUTT_BUMP'); this.model.bumpCooldown = 3500;
      this.bubble = coupleBubble(this.scene,PUBLIC_TOGETHER_COPY.bump,(this.pose!.x+this.actor.x)/2,this.actor.y-40);
      return true;
    }
    if (this.busy || pairDistance(this.actor,this.player.feetPosition)>27) return false;
    this.clearMicro(); this.capturePair(); this.pinch = this.model.pinch();
    return true;
  }

  back(): boolean {
    if (!this.busy || !this.model) return false;
    if (this.model.mode === 'PHOTO') {
      this.photo?.destroy(true); this.photo = undefined; this.model.enter('COUCH'); return true;
    }
    if (this.model.mode === 'PINCH') { this.finishPair(); return true; }
    if (this.returning) return true;
    this.clearMicro();
    this.starts = [{x:this.pose!.x,y:this.pose!.y},{x:this.actor!.x,y:this.actor!.y}];
    this.ends = this.home; this.returning = true;
    this.approachDuration = this.travelDuration(); this.model.enter('APPROACH');
    this.television?.destroy(); this.television = undefined;
    this.scene.cameras.main.startFollow(this.player,true,.12,.12);
    return true;
  }

  private capturePair(): void {
    this.home = [{...this.player.feetPosition},{x:this.actor!.x,y:this.actor!.y}];
    this.ownedLock = true; this.state.movement.setLock('interaction',true);
    this.player.setVelocity(0).setVisible(false);
    this.pose = this.scene.add.image(this.home[0].x,this.home[0].y,this.player.texture.key).setOrigin(.5,1);
    this.player.body!.enable = false;
  }
  private beginActivity(activity: TogetherActivity): void {
    if (this.busy || this.suspended || !this.actor || this.carrying) return;
    this.clearMicro(); this.capturePair(); this.activity = activity; this.starts = this.home;
    this.ends = activity.seats; this.returning = false;
    this.approachDuration = this.travelDuration(); this.model!.enter('APPROACH');
  }
  private travelDuration(): number {
    return Math.max(750,...this.starts!.map((start,i)=>pairDistance(start,this.ends![i]!)/65*1000));
  }
  private finishPair(): void {
    this.photo?.destroy(true); this.photo = undefined;
    this.television?.destroy(); this.television = undefined;
    this.pose?.destroy(); this.pose = undefined; this.props?.clear();
    if (this.home) { const p=this.home[0]; this.player.setPosition(p.x,p.y-15); this.player.body!.reset(p.x,p.y-15); }
    this.player.setVisible(true); this.player.body!.enable = true;
    if (this.ownedLock) this.state.movement.setLock('interaction',false);
    this.ownedLock=false; this.home=undefined; this.activity=undefined; this.pinch=undefined; this.returning=false;
    this.clearMicro(); this.model?.enter('FOLLOWING');
    if (this.actor && this.motion) this.motion.position={x:this.actor.x,y:this.actor.y};
    this.backPrompt?.setVisible(false);
    this.scene.cameras.main.startFollow(this.player,true,.12,.12);
  }

  private update(ms: number): void {
    if (this.destroyed) return;
    if (!this.enabled) { if(this.model)this.deactivate(); return; }
    if (!this.model) {
      if (!this.suspended && this.player.visible && !this.scene.cameras.main.fadeEffect.isRunning) this.activate();
      if (!this.model) return;
    }
    this.hands!.clear(); this.props!.clear(); this.prompt!.setVisible(false); this.backPrompt!.setVisible(false);
    if (this.suspended || this.busy) this.idleStillMs = 0;
    if (this.suspended) { this.actor!.setVisible(this.ownedLock || this.player.visible); return; }
    this.actor!.setVisible(true);
    const dt=Math.max(0,Math.min(ms,100)); this.walkingClock+=dt;
    const events=this.model.tick(dt,false,!!this.bubble);
    if (events.farter) { this.farter=events.farter; this.microAge=0; this.puff=this.scene.add.graphics().setDepth(5090); }
    if (this.model.mode === 'FOLLOWING') this.follow(dt);
    else this.activityFrame();
    if (events.photo) { this.photo=cozyCallbackCard(this.scene,Math.floor(Math.random()*100)); }
    this.photo?.getData('refresh')();
    this.renderMicro(dt);
    if (this.busy && this.model.mode!=='PHOTO') {
      this.backPrompt!.setPosition((this.pose!.x+this.actor!.x)/2,Math.max(this.pose!.y,this.actor!.y)+16).setVisible(true);
      this.backPrompt!.getData('refresh')(this.model.mode==='PINCH'?'BACK':'GET UP');
    }
  }

  private follow(dt: number): void {
    const actor=this.actor!, motion=this.motion!, p=this.player.feetPosition;
    const old={...motion.position}; motion.update(p,this.player.facingDirection,dt);
    // Safety recovery is permitted only when the companion is genuinely off-camera.
    if (pairDistance(motion.position,p)>170 && !Phaser.Geom.Rectangle.Overlaps(this.scene.cameras.main.worldView,
      new Phaser.Geom.Rectangle(motion.position.x-12,motion.position.y-32,24,32))) {
      const join=safeJoin(p,this.player.facingDirection,motion.side,this.safe); if(join)motion.position=join;
    }
    actor.setPosition(Math.round(motion.position.x),Math.round(motion.position.y)).setDepth(Math.floor(motion.position.y));
    const moved=pairDistance(old,motion.position)>.15;
    const direction=motion.joined?this.player.facingDirection:moved?facing(old,motion.position):this.player.facingDirection;
    const phase=(this.player.texture.key.match(/(idle|step-a|pass-a|step-b|pass-b)$/)?.[1]??'idle') as ProtagonistPhase;
    actor.setTexture(goncaloTextureKey(direction,moved?(this.player.isTravelling?phase:this.walkPhase()):'idle',this.state.movement.sprinting));
    // Cosmetic only: one quiet hand squeeze, never a pose, lock, timer or saved state.
    const idleEligible = motion.joined && this.player.visible && !this.player.isTravelling && !moved
      && !this.carrying && !this.bubble && !this.farter && !this.interactions.selectedId
      && !this.scene.cameras.main.fadeEffect.isRunning;
    this.idleStillMs = idleEligible ? this.idleStillMs + dt : 0;
    if (this.idleStillMs >= this.squeezeIn + 1000) {
      this.idleStillMs = 0; this.squeezeIn = 60_000 + Math.random() * 30_000;
    }
    const squeeze = this.idleStillMs >= this.squeezeIn ? -1 : 0;
    if(motion.joined && this.player.visible)drawHeldHands(this.hands!,p.x,p.y,actor.x,actor.y,direction,squeeze,this.region.id==='snow-highlands');
    this.hands!.setDepth(Math.max(p.y,actor.y)+1);
    if(!this.player.isTravelling && pairDistance(actor,p)<27 && !this.carrying && !this.bubble && !this.interactions.selectedId) {
      this.prompt!.setPosition(Math.round((p.x+actor.x)/2),Math.round(Math.min(p.y,actor.y)-44)).setVisible(true);
      this.prompt!.getData('refresh')('Pinch cheeks?');
    }
  }
  private walkPhase(): ProtagonistPhase { return ['step-a','pass-a','step-b','pass-b'][Math.floor(this.walkingClock/120)%4] as ProtagonistPhase; }
  private walking(actor: Phaser.GameObjects.Image, who: Partner, from: PairPoint, to: PairPoint, progress: number): void {
    const point=mix(from,to,progress), direction=facing(from,to), phase=this.walkPhase();
    actor.setPosition(Math.round(point.x),Math.round(point.y)).setTexture(who==='goncalo'?goncaloTextureKey(direction,phase):`player-${direction}-${phase}`);
  }
  private activityFrame(): void {
    const model=this.model!, b=this.pose!, g=this.actor!, props=this.props!, age=model.elapsed;
    this.player.setVisible(false).setVelocity(0);
    if (model.mode==='APPROACH') {
      const t=Math.min(1,age/this.approachDuration);
      this.walking(b,'protagonist',this.starts![0],this.ends![0],t);
      this.walking(g,'goncalo',this.starts![1],this.ends![1],t);
      if(t===1) {
        if(this.returning){this.finishPair();return;}
        if(this.activity!.kind==='COUCH'){
          model.startCouch(); this.television=this.scene.add.graphics().setDepth(2000);
          if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('view') === 'together-couch-callback') {
            model.couchElapsed = 20_000;
            model.couchPhotoShown = true;
            model.enter('PHOTO');
            this.photo = cozyCallbackCard(this.scene, 0);
          }
          const screen=this.activity!.tv!;
          this.scene.cameras.main.stopFollow().pan(b.x,(b.y+screen.y)/2,600,'Sine.easeInOut');
        } else {
          model.enter(this.activity!.kind);
          if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('view') === 'together-bump') {
            this.action();
            model.elapsed = -60_000;
          }
        }
      }
    } else if(model.mode==='PINCH') this.pinchFrame();
    else {
      const [bp,gp]=this.activity!.seats;
      b.setPosition(bp.x,bp.y);g.setPosition(gp.x,gp.y);
      if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('view')?.startsWith('together-')) {
        this.scene.cameras.main.stopFollow().centerOn((bp.x + gp.x) / 2, (bp.y + gp.y) / 2);
      }
      if(model.mode==='COUCH'||model.mode==='PHOTO'){
        b.setTexture('together-protagonist-sit-up');g.setTexture('together-goncalo-sit-up');this.tvFrame();
        // A small foreground section of the existing couch back covers bent legs.
        props.fillStyle(0x886681).fillRect(b.x-9,b.y-6,g.x-b.x+19,9);
        props.fillStyle(0xab8499).fillRect(b.x-9,b.y-6,g.x-b.x+19,1);
      } else if(model.mode==='SHEEPING'||model.mode==='BUTT_BUMP') {
        const bumping=model.mode==='BUTT_BUMP';
        b.setTexture(`together-protagonist-lie-${bumping?'left':'right'}`);
        g.setTexture(`together-goncalo-lie-${bumping?'right':'left'}`);
        if(model.mode==='BUTT_BUMP'){
          const bump=age>200&&age<650?2:age<850?1:0;b.x+=bump;g.x-=bump;
          if(age>=1000){this.clearMicro();model.enter('SHEEPING');}
        } else if(model.bumpCooldown===0&&!this.bubble){
          this.prompt!.setPosition((b.x+g.x)/2,b.y-42).setVisible(true);this.prompt!.getData('refresh')(PUBLIC_TOGETHER_COPY.switchSides);
        }
        // Each curled body has its own tucked duvet contour. No standing legs or shoes.
        for(const person of [b,g]) {
          props.fillStyle(0x634d68).fillRect(person.x-9,person.y-13,19,27);
          props.fillStyle(0x886681).fillRect(person.x-8,person.y-13,17,25);
          props.fillStyle(0xab8499).fillRect(person.x-8,person.y-13,17,3);
          props.fillStyle(0x634d68,.4).fillRect(person.x+5,person.y-6,1,16);
        }
      } else if(model.mode==='COF') {
        b.setTexture('player-down-idle');g.setTexture(goncaloTextureKey('down'));
        const sip=age>1800&&age<2800||age>4200&&age<5000;
        for(const person of [b,g]){
          const x=person.x+4,y=person.y-(sip?22:15);
          props.fillStyle(0x6e5048).fillRect(x-1,y,6,6).fillRect(x+5,y+1,2,3);
          props.fillStyle(0xf3e3bd).fillRect(x,y+1,4,4).fillStyle(0x96664e).fillRect(x,y,4,1);
          props.fillStyle(0xe9e3dc,.55).fillRect(x+1,y-4-Math.floor(age/700)%2,1,3);
        }
        if(age>6500)this.back();
      }
    }
    if(!this.pose)return;
    // Furniture owns its geometry; activity-only poses sit on its visual depth plane.
    const furnitureDepth=this.activity?.kind==='SHEEPING'?(this.region.id==='home-interior'?230:300)
      :this.activity?.kind==='COUCH'?(this.region.id==='home-interior'?752:340):0;
    const depth=Math.max(b.y,g.y,furnitureDepth)+12;
    b.setDepth(depth);g.setDepth(depth+1);props.setDepth(depth+2);
  }
  private pinchFrame(): void {
    const age=this.model!.elapsed,b=this.pose!,g=this.actor!,[bp,gp]=this.home!;
    const side=gp.x>=bp.x?1:-1;
    const target={x:bp.x+side*16,y:bp.y};
    const p=mix(gp,target,Math.min(1,age/250));g.setPosition(Math.round(p.x),Math.round(p.y));b.setPosition(bp.x,bp.y);
    b.setTexture(`player-${side>0?'right':'left'}-idle`);g.setTexture(goncaloTextureKey(side>0?'left':'right'));
    if(age>320&&age<1150){
      const receiver=this.pinch!.giver==='goncalo'?b:g,giver=receiver===b?g:b;
      receiver.x+=Math.floor(age/100)%2?1:-1;
      const reach=receiver.x>giver.x?1:-1,x=giver.x+reach*5,y=receiver.y-23;
      this.props!.fillStyle(0xc78d70).fillRect(x-1,y+2,3,6).fillStyle(0xf2bd9f).fillRect(x+reach,y,3,3);
      if(this.pinch!.playfulCallback&&!this.bubble)this.bubble=coupleBubble(this.scene,PUBLIC_TOGETHER_COPY.pinchCallback,b.x,b.y-46);
    }
    if(age>=1600)this.finishPair();
  }
  private tvFrame(): void {
    const screen=this.activity!.tv!,g=this.television!;g.clear();
    const beat=Math.floor(this.model!.couchElapsed/2600)%4;
    const colors=[0x71877e,0x777796,0x967e6b,0x343747];
    g.fillStyle(colors[beat]!).fillRect(screen.x,screen.y,screen.width,screen.height);
    if(beat!==3){
      g.fillStyle(0xd1bc9a,.6).fillRect(screen.x+8+beat*12,screen.y+7,18,13);
      g.fillStyle(0x4a586d,.8).fillRect(screen.x+screen.width-30,screen.y+13,21,17);
      g.fillStyle(0xc8cdb9,.45).fillRect(screen.x+4,screen.y+screen.height-6,screen.width-8,2);
    }
    g.fillStyle(colors[beat]!,.035).fillRect(screen.x-5,screen.y-5,screen.width+10,screen.height+10);
  }
  private renderMicro(dt: number): void {
    if(!this.farter)return;
    this.microAge+=dt;
    const b=this.pose??this.player;
    const bp=this.pose?{x:b.x,y:b.y}:this.player.feetPosition;
    const person=this.farter==='protagonist'?bp:this.actor!,other=this.farter==='protagonist'?this.actor!:bp;
    if(!this.bubble)this.bubble=coupleBubble(this.scene,'Damn baby it shtinks!!!',other.x,other.y-46);
    this.bubble.setPosition(Math.round(other.x),Math.round(other.y-46));
    const drift=Math.floor(this.microAge/450),g=this.puff!.clear();
    if(this.microAge<2100){
      g.fillStyle(0x90a576,.5*(1-this.microAge/2300));
      for(const [dx,dy,size] of [[-2,0,4],[3,-3,3],[-5,-6,3]])g.fillRect(Math.round(person.x+dx!-drift),Math.round(person.y-10+dy!-drift),size!,size!);
    }
    if(this.microAge>=2700)this.clearMicro();
  }
  private clearMicro(): void { this.bubble?.destroy(true);this.bubble=undefined;this.puff?.destroy();this.puff=undefined;this.farter=undefined;this.microAge=0; }
  private deactivate(): void {
    this.idleStillMs = 0;
    if(this.ownedLock)this.finishPair();
    for(const item of TOGETHER_ACTIVITIES.filter(a=>a.region===this.region.id))this.interactions.unregister(item.id);
    this.anchors.forEach(a=>a.destroy());this.anchors=[];
    this.actor?.destroy();this.actor=undefined;this.hands?.destroy();this.props?.destroy();
    this.prompt?.destroy(true);this.backPrompt?.destroy(true);this.clearMicro();this.model=undefined;this.motion=undefined;
  }
  private destroy(): void {
    this.destroyed=true;this.unsubscribe();
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE,this.onUpdate);
    gameEvents.off(GAME_EVENTS.uiBlockingChanged,this.onBlocking);
    // Scene shutdown destroys sprites/physics first. Do not resurrect the hidden player here.
    if(this.ownedLock)this.state.movement.setLock('interaction',false);
    if(this.scene.registry.get(TOGETHER_RUNTIME)===this)this.scene.registry.remove(TOGETHER_RUNTIME);
  }
}
