import { describe, expect, it } from 'vitest';
import {
  MENU_CAR_DELAY_RANGE_MS,
  MENU_YELLOW_CAR_CHANCE,
  chooseMenuCar,
  isMenuCarFullyVisible,
  menuCarDelay,
} from '../src/systems/MenuRoadAmbience';

describe('menu road ambience', () => {
  it('keeps passing cars infrequent', () => {
    expect(menuCarDelay(0)).toBe(MENU_CAR_DELAY_RANGE_MS.min);
    expect(menuCarDelay(0.999_999)).toBeLessThanOrEqual(MENU_CAR_DELAY_RANGE_MS.max);
  });

  it('reserves fifteen percent of eligible rolls for yellow (with repeat suppression)', () => {
    expect(MENU_YELLOW_CAR_CHANCE).toBe(.15);
    expect(chooseMenuCar(MENU_YELLOW_CAR_CHANCE - 0.001, true)).toEqual({
      textureKey: 'car-yellow', yellow: true,
    });
    expect(chooseMenuCar(MENU_YELLOW_CAR_CHANCE, true).yellow).toBe(false);
  });

  it('never selects yellow while its menu cooldown is active', () => {
    expect(chooseMenuCar(0, false).yellow).toBe(false);
  });

  it('only allows the rare flourish while the whole car is inside the glass', () => {
    expect(isMenuCarFullyVisible(159, 20)).toBe(true);
    expect(isMenuCarFullyVisible(49, 20)).toBe(false);
    expect(isMenuCarFullyVisible(269, 20)).toBe(false);
  });
});
