import type Phaser from 'phaser';
import { PEOPLE_LOOKS } from '../../art/peopleTextures';
import { segmentHitsRect } from '../../systems/InteractionGeometry';
import { contains, type Rect, type RegionId } from './definitions';

// Compact authored loops: no navigation mesh, schedules or cross-region wandering.
const GROUPS: Partial<Record<RegionId, readonly (readonly [number, number, number])[]>> = {
  'autumn-parklands': [[390,470,2]],
  'river-town': [[1870,585,2],[2660,310,2],[570,1518,1]],
  'vila-meow': [[570,610,2]],
  porto: [[805,466,3],[1350,999,3],[267,700,2],[1171,1042,2]],
  'old-world-festival': [[361,633,3],[959,457,3],[689,944,4],[1024,896,3],[1091,746,3]],
};
export function installAmbientPeople(scene: Phaser.Scene, id: RegionId, solids: readonly Rect[], playerFeet?:()=>{x:number;y:number}): () => void {
  const people: { sprite: Phaser.GameObjects.Image; route: {x:number;y:number}[]; index:number; until:number; look:string; speed:number }[] = [];
  let serial=0;
  for (const [x,y,count] of GROUPS[id] ?? []) for (let i=0;i<count;i++) {
    const base={x:x+i*19,y:y+(i%2)*27};
    const route = [[0,0],[36,0],[36,34],[-13,34]].map(([dx,dy])=>({x:base.x+dx!,y:base.y+dy!}));
    if (solids.some(r => contains(r,base,8))) continue;
    const look=PEOPLE_LOOKS[serial % PEOPLE_LOOKS.length]!.id;
    const sprite=scene.add.image(base.x,base.y,`person-${look}-0`).setOrigin(.5,1).setDepth(base.y);
    people.push({sprite,route,index:0,until:700+serial*237,look,speed:12+serial%5*2}); serial++;
  }
  return () => {
    const dt=Math.min(50,scene.game.loop.delta)/1000;
    for (const p of people) {
      if (scene.time.now<p.until) continue;
      const target=p.route[(p.index+1)%p.route.length]!;
      const start={x:p.sprite.x,y:p.sprite.y};
      const feet=playerFeet?.();
      if(feet&&Math.hypot(feet.x-start.x,feet.y-start.y)<22){p.until=scene.time.now+500;continue;}
      const blocked=solids.some(r=>segmentHitsRect(start,target,{x:r.x-7,y:r.y-7,width:r.width+14,height:r.height+14}));
      if (blocked) { p.index=(p.index+1)%p.route.length; p.until=scene.time.now+900; continue; }
      const distance=Math.hypot(target.x-start.x,target.y-start.y);
      if (distance<1) { p.index=(p.index+1)%p.route.length; p.until=scene.time.now+900+Math.floor(Math.random()*2200); p.sprite.setTexture(`person-${p.look}-0`); continue; }
      const step=Math.min(distance,p.speed*dt);
      p.sprite.setPosition(start.x+(target.x-start.x)/distance*step,start.y+(target.y-start.y)/distance*step)
        .setDepth(Math.floor(p.sprite.y)).setFlipX(target.x<start.x).setTexture(`person-${p.look}-${Math.floor(scene.time.now/230)%2}`);
    }
  };
}
