/**
 * Draws the barcodes (<canvas data-code="…">): each bar edge falls on a real device pixel, so bars
 * stay sharp at any zoom or Windows scaling (125 %, 150 %…). The canvas is drawn at twice that
 * resolution so it also stays clean when tilted (the crew pass), where the browser resamples it.
 */
const OVERSAMPLE = 2;

export function drawBarcode(canvas: HTMLCanvasElement) {
  const code = canvas.dataset.code;
  if (!code) return;
  const style = getComputedStyle(canvas);
  const dpr = window.devicePixelRatio || 1;
  // Size in device pixels
  const width = Math.round(parseFloat(style.width) * dpr);
  const height = Math.round(parseFloat(style.height) * dpr);
  if (!width || !height) return;
  canvas.width = width * OVERSAMPLE;
  canvas.height = height * OVERSAMPLE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = style.color;
  const modules = [...code].reduce((sum, w) => sum + Number(w), 0);
  const edge = (m: number) => Math.round((m * width) / modules) * OVERSAMPLE;
  let x = 0;
  [...code].forEach((w, i) => {
    const start = edge(x);
    x += Number(w);
    // Even positions are bars, odd ones are spaces
    if (i % 2 === 0) ctx.fillRect(start, 0, edge(x) - start, canvas.height);
  });
}

const drawAll = () => document.querySelectorAll<HTMLCanvasElement>('canvas[data-code]').forEach(drawBarcode);

// Redraw when the colors change (light/dark theme, HUD easter egg) or the screen scaling changes
if (typeof window !== 'undefined' && !(window as { __barcodes?: boolean }).__barcodes) {
  (window as { __barcodes?: boolean }).__barcodes = true;
  drawAll();
  new MutationObserver(() => requestAnimationFrame(drawAll)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class'],
  });
  window.addEventListener('resize', drawAll);
  // Browser zoom or window moved to another screen: the pixel density changes
  const watchDensity = () =>
    matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
      'change',
      () => {
        drawAll();
        watchDensity();
      },
      { once: true },
    );
  watchDensity();
}
