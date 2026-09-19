import type { InteractionApproach } from '../../systems/InteractionGeometry';

/**
 * The familiar car is 48×20 pixels. Its interaction footprint follows that
 * visible silhouette with a few pixels of parking-space breathing room so a
 * player beside either door is measured to the car, not its centre point.
 */
export const FIRST_DATE_CAR = {
  id: 'first-date-car',
  texture: 'car-blue',
  x: 440,
  y: 130,
  visualBounds: { x: 416, y: 120, width: 48, height: 20 },
  approach: {
    anchor: { x: 440, y: 148 },
    shape: { x: 412, y: 116, width: 56, height: 32 },
    radius: 40,
    preferredFacing: 'up',
    promptAnchor: { x: 440, y: 120 },
  } satisfies InteractionApproach,
} as const;
