export const MENU_YELLOW_CAR_CHANCE = 0.15;
export const MENU_YELLOW_CAR_COOLDOWN_MS = 25_000;
export const MENU_CAR_DELAY_RANGE_MS = { min: 8_000, max: 18_000 } as const;

export const MENU_ORDINARY_CAR_KEYS = [
  'car-red',
  'car-blue',
  'car-green',
  'car-cream',
] as const;

export interface MenuCarChoice {
  textureKey: typeof MENU_ORDINARY_CAR_KEYS[number] | 'car-yellow';
  yellow: boolean;
}

function unitInterval(value: number): number {
  return Math.max(0, Math.min(0.999_999, value));
}

export function menuCarDelay(randomValue: number): number {
  const range = MENU_CAR_DELAY_RANGE_MS.max - MENU_CAR_DELAY_RANGE_MS.min;
  return Math.round(MENU_CAR_DELAY_RANGE_MS.min + unitInterval(randomValue) * range);
}

export function chooseMenuCar(randomValue: number, yellowAllowed: boolean): MenuCarChoice {
  const roll = unitInterval(randomValue);
  if (yellowAllowed && roll < MENU_YELLOW_CAR_CHANCE) {
    return { textureKey: 'car-yellow', yellow: true };
  }
  const ordinaryRoll = yellowAllowed
    ? (roll - MENU_YELLOW_CAR_CHANCE) / (1 - MENU_YELLOW_CAR_CHANCE)
    : roll;
  const index = Math.min(
    MENU_ORDINARY_CAR_KEYS.length - 1,
    Math.floor(unitInterval(ordinaryRoll) * MENU_ORDINARY_CAR_KEYS.length),
  );
  return { textureKey: MENU_ORDINARY_CAR_KEYS[index] ?? 'car-cream', yellow: false };
}

export function isMenuCarFullyVisible(
  centerX: number,
  halfWidth: number,
  glassLeft = 38,
  glassRight = 280,
): boolean {
  return centerX - halfWidth >= glassLeft && centerX + halfWidth <= glassRight;
}
