// Lightweight favicon spinner over base /icon.png during client-side loading
// Usage: startFaviconSpinner(); stopFaviconSpinner();

let spinnerTimer: number | null = null;
let originalHref: string | null = null;
let baseImg: HTMLImageElement | null = null;
let angle = 0;

function getFaviconLink(): HTMLLinkElement {
  let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  return link;
}

function ensureBaseImage(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (baseImg && baseImg.complete) {
      resolve(baseImg);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/icon.png';
    img.onload = () => {
      baseImg = img;
      resolve(img);
    };
    img.onerror = reject;
  });
}

function drawFrame(ctx: CanvasRenderingContext2D, size: number) {
  if (!baseImg) return;
  ctx.clearRect(0, 0, size, size);
  // Draw base icon centered
  ctx.drawImage(baseImg, 0, 0, size, size);

  // Spinner ring
  const lineWidth = Math.max(2, Math.floor(size * 0.07));
  const radius = size / 2 - lineWidth;
  ctx.lineCap = 'round';
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = '#4F46E5'; // indigo-600

  const start = angle;
  const end = angle + Math.PI * 1.2; // arc length
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, start, end);
  ctx.stroke();

  angle += Math.PI / 30; // speed
}

export async function startFaviconSpinner() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (spinnerTimer !== null) return; // already running

  const link = getFaviconLink();
  if (!originalHref) originalHref = link.href || '/icon.png';

  const img = await ensureBaseImage().catch(() => null);
  if (!img) return;

  const size = 64; // favicon size
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const step = () => {
    drawFrame(ctx, size);
    const url = canvas.toDataURL('image/png');
    link.href = url;
  };

  // Initial render and then animate
  step();
  spinnerTimer = window.setInterval(step, 50);
}

export function stopFaviconSpinner() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (spinnerTimer !== null) {
    window.clearInterval(spinnerTimer);
    spinnerTimer = null;
  }
  const link = getFaviconLink();
  if (originalHref) {
    link.href = originalHref;
  } else {
    link.href = '/icon.png';
  }
}
