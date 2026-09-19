/**
 * Player-facing shell copy lives here so later localization can replace text
 * without excavating scene layout code. Personal Portuguese joke phrases stay
 * intentionally untranslated when they enter authored content.
 */
export const UI_COPY = {
  title: {
    heading: 'Something\nis waiting.',
    subtitle: 'A quiet room.\nA page waits.',
    controls: 'Arrows / Enter',
    pageNote: 'Next page waits.',
  },
  scrapbook: {
    title: 'Scrapbook',
    progressLabel: 'pieces found',
    leftCaption: 'A page for what we find',
    notesHeading: 'Notes & small things',
    photoEmpty: 'A photograph belongs here',
    footer: 'Tab or Q to close',
    fallbackHint: 'This page is waiting for something to be found.',
    chapter: 'Little things, kept',
    assembled: 'One little piece at a time.',
    restored: 'All the pieces, together.',
    notesLabel: 'A small note',
    photoCaption: 'A space saved for us.',
    pageLabel: 'Page',
    fragmentMissing: 'still missing',
    fragmentFound: 'kept',
    close: 'Close',
  },
  bag: {
    title: 'Bag',
    section: 'What came along',
    emptyTitle: 'The bag is light.\nFor now.',
    emptyDetail: 'Take a little wander.\nOdd things turn up.',
    footer: 'I or Q to close',
    subtitle: 'Little things that came along',
    pocket: 'For safe keeping',
    keepsake: 'A little keepsake',
    emptyTag: 'Room for a story',
    emptyPocket: 'Nothing tucked away. Yet.',
    selectionHint: 'Arrows / WASD to choose',
    scrollHint: 'Scroll for more',
    unknownName: 'An unnamed keepsake',
    unknownDescription: 'Its label is missing. The story is still safe.',
  },
  controls: {
    tutorial: 'Your Scrapbook and Bag travel with you.',
    staminaLabel: 'NARUTO RUN!',
  },
  park: {
    arrivalTitle: 'Autumn Parklands',
    arrivalDetail: 'Quiet paths, bright leaves, and a glint beyond the trees.',
  },
} as const;
