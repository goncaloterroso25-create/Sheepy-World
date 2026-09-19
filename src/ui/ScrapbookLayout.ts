/** Fixed zones at the canonical 640×360 size; prose never shares the control footer. */
export const SCRAPBOOK_NOTE = {
  x: 355, y: 181, width: 230, height: 127,
  textX: 367, headingY: 193, titleY: 211, bodyY: 233,
  textWidth: 208, bodyBottom: 283, footerY: 292,
} as const;

/** A layout measurement, not shortened copy. The current small font advances 8px. */
export function noteLines(text: string, columns = 26): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (line && line.length + word.length + 1 > columns) { lines.push(line); line = ''; }
      line = line ? `${line} ${word}` : word;
    }
    lines.push(line);
  }
  return lines;
}

/** Card is a teaser; the selected note always shows the complete authored clue. */
export function clueCardLabel(text: string, columns: number): string {
  const lines=noteLines(text.replaceAll('-', '- '),columns)
    .map(line=>line.length<=columns?line:`${line.slice(0,Math.max(1,columns-3))}...`);
  if(lines.length<=3)return lines.join('\n');
  return [...lines.slice(0,2),`${lines[2]!.slice(0,Math.max(1,columns-3)).trimEnd()}...`].join('\n');
}
