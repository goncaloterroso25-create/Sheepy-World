import type { InteractionApproach } from '../systems/InteractionGeometry';

/** Feet-space anchors sit outside visible bases; collision remains separately authored. */
export const HOME_APPROACHES: Readonly<Record<string, InteractionApproach>> = {
  'home-couch': { anchor: { x: 306, y: 676 }, shape: { x: 246, y: 664, width: 122, height: 24 }, radius: 36,
    preferredFacing: 'down', approachSide: 'up', body: { x: 236, y: 696, width: 140, height: 40 } },
  'home-bed': { anchor: { x: 180, y: 180 }, shape: { x: 168, y: 136, width: 24, height: 84 }, radius: 36,
    preferredFacing: 'left', approachSide: 'right', body: { x: 80, y: 114, width: 80, height: 112 } },
  'home-drawer': { anchor: { x: 126, y: 336 }, radius: 34, preferredFacing: 'up', approachSide: 'down',
    body: { x: 80, y: 284, width: 96, height: 32 } },
  'home-keychain-drawer': { anchor: { x: 310, y: 252 }, radius: 34, preferredFacing: 'up', approachSide: 'down',
    body: { x: 278, y: 198, width: 74, height: 34 } },
  'home-cof': { anchor: { x: 580, y: 542 }, radius: 34, preferredFacing: 'up' },
  'home-tv': { anchor: { x: 302, y: 538 }, radius: 20, preferredFacing: 'up' },
  'home-snack': { anchor: { x: 668, y: 732 }, radius: 34, preferredFacing: 'up' },
  'home-naruto-bowl': { anchor: { x: 630, y: 638 }, radius: 20, preferredFacing: 'down' },
};
