export type UiFeedback = 'open' | 'close' | 'select' | 'page-turn' | 'item-select';
export const UI_FEEDBACK_EVENT = 'collection-ui-feedback';
export interface CollectionFeedback { action: UiFeedback; surface: string }

export function collectionSoundKey({ action, surface }: CollectionFeedback): string | undefined {
  if (action !== 'open' && action !== 'close') return;
  if (surface === 'inventory') return `bag-${action}`;
  if (surface === 'scrapbook') return `scrapbook-${action}`;
}
