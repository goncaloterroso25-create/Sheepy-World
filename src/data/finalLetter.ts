/** Public-edition placeholder. The private anniversary letter is not present in this repository. */
export const FINAL_LETTER =
  '[The original anniversary letter is private and has been omitted from the public portfolio edition.]';

export function letterPages(text = FINAL_LETTER): string[] {
  if (text === FINAL_LETTER) return [FINAL_LETTER];
  return text.split('\n\n').flatMap((paragraph) => {
    const pages: string[] = [];
    let page = '';
    for (const sentence of paragraph.match(/[^.!?]+[.!?]*\s*/g) ?? [paragraph]) {
      for (const word of sentence.trim().split(/\s+/)) {
        if (page.length + word.length + 1 > 180) {
          pages.push(page);
          page = '';
        }
        page += `${page ? ' ' : ''}${word}`;
      }
      if (page) {
        pages.push(page);
        page = '';
      }
    }
    return pages;
  });
}
