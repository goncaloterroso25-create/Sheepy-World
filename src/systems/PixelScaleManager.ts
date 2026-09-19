import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';

export interface PixelPerfectSize {
  cssWidth: number;
  cssHeight: number;
  physicalScale: number;
}

export function calculatePixelPerfectSize(
  viewportWidth: number,
  viewportHeight: number,
  devicePixelRatio = 1,
): PixelPerfectSize {
  const safeDpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const availablePhysicalWidth = Math.max(1, viewportWidth) * safeDpr;
  const availablePhysicalHeight = Math.max(1, viewportHeight) * safeDpr;
  const fittingScale = Math.min(
    availablePhysicalWidth / GAME_WIDTH,
    availablePhysicalHeight / GAME_HEIGHT,
  );
  const physicalScale = fittingScale < 1 ? fittingScale : Math.floor(fittingScale);

  return {
    cssWidth: GAME_WIDTH * physicalScale / safeDpr,
    cssHeight: GAME_HEIGHT * physicalScale / safeDpr,
    physicalScale,
  };
}

export function installPixelPerfectScaling(gameRoot: HTMLElement, refreshBounds: () => void = () => {}): void {
  let lastDiagnostic = '';

  const report = (): void => {
    window.requestAnimationFrame(() => {
      const canvas = gameRoot.querySelector('canvas');
      if (!canvas) return;
      const cssRect = canvas.getBoundingClientRect();
      const diagnostic = [
        `logical: ${GAME_WIDTH}x${GAME_HEIGHT}`,
        `backing: ${canvas.width}x${canvas.height}`,
        `CSS: ${Math.round(cssRect.width)}x${Math.round(cssRect.height)}`,
        `DPR: ${window.devicePixelRatio}`,
        `physical scale: ${gameRoot.dataset.physicalScale ?? '?'}`,
      ].join(' | ');
      if (import.meta.env.DEV && diagnostic !== lastDiagnostic) {
        console.info(`[Sheepy World render] ${diagnostic}`);
        lastDiagnostic = diagnostic;
      }
    });
  };

  const resize = (): void => {
    const size = calculatePixelPerfectSize(
      window.innerWidth,
      window.innerHeight,
      window.devicePixelRatio,
    );
    gameRoot.style.setProperty('--game-present-width', `${size.cssWidth}px`);
    gameRoot.style.setProperty('--game-present-height', `${size.cssHeight}px`);
    gameRoot.dataset.physicalScale = String(size.physicalScale);
    window.requestAnimationFrame(refreshBounds);
    report();
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('fullscreenchange', resize);
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
}
