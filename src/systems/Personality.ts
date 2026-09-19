export const PERSONALITY_TENDENCIES = ['SWEET', 'CHEEKY', 'CHAOTIC'] as const;
export type PersonalityTendency = typeof PERSONALITY_TENDENCIES[number];

export function personalityFlag(tendency: PersonalityTendency): string {
  return `personality-${tendency.toLowerCase()}`;
}

/** Hidden flavor state only: no meter, ranking, gate, or morality value. */
export function derivePersonalityTendencies(flags: Readonly<Record<string, string>>): PersonalityTendency[] {
  return PERSONALITY_TENDENCIES.filter(tendency => flags[personalityFlag(tendency)] === 'true');
}
