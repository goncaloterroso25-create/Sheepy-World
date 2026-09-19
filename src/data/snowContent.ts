import type { InteractionApproach } from '../systems/InteractionGeometry';

/**
 * Permanent post-restoration landmark contract. The broad bonnet-shaped area
 * is the exact geometry registered at runtime, so reloads and every input path
 * resolve the same interaction from natural positions around the car.
 */
export const RESTORED_JERONIMO_INTERACTION = {
  id: 'jeronimo-gallery',
  prompt: 'REMEMBER',
  priority: 35,
  discoveryCue: 'INTERESTING',
  approach: {
    anchor: { x: 603, y: 423 },
    shape: { x: 548, y: 392, width: 110, height: 66 },
    radius: 42,
    preferredFacing: 'up',
    promptAnchor: { x: 603, y: 382 },
  } satisfies InteractionApproach,
} as const;
