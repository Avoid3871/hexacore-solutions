import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { state } from '../state';
import { createSprite, renderFlower, type Flower, type Sprite } from '../flowers';
import { createBee, updateAndDrawBee, type FlowerTarget } from '../bee';

const CELL_W = 8;
const CELL_H = 13;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const snapX = (x: number) => Math.round(x / CELL_W) * CELL_W;
const snapY = (y: number) => Math.round(y / CELL_H) * CELL_H;

const FLOWERS: Flower[] = [
  { x: 0.14, y: 0.94, r: 165, kind: 'lotus', stem: 2.0, depth: 0.5, hero: true, lean: 0.45, seed: 1 },
  { x: 0.35, y: 1.02, r: 110, kind: 'daisy', stem: 2.3, depth: 0.72, hero: true, lean: -0.35, seed: 2 },
  { x: 0.69, y: 0.95, r: 195, kind: 'rose', stem: 1.85, depth: 0.42, hero: true, lean: -0.5, seed: 3 },
  { x: 0.88, y: 1.04, r: 125, kind: 'anemone', stem: 2.2, depth: 0.65, hero: true, lean: 0.25, seed: 4 },
  { x: 0.48, y: 0.31, r: 105, kind: 'daisy', stem: 1.35, depth: 1, hero: false, lean: -0.15, seed: 5, anchor: 'services-row-1' },
  { x: 0.85, y: 0.6, r: 155, kind: 'lotus', stem: 1.9, depth: 1, hero: false, lean: -0.35, seed: 6, anchor: 'statement' },
  { x: 0.15, y: 0.76, r: 130, kind: 'anemone', stem: 2.0, depth: 1, hero: false, lean: 0.45, seed: 7 },
  { x: 0.85, y: 0.92, r: 145, kind: 'rose', stem: 1.9, depth: 1, hero: false, lean: -0.45, seed: 8 },
];

export const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let W = 0;
    let H = 0;
    let vh = 0;
    let dpr = 1;
    let scale = 1;
    let docH = 1;
    let sy = 0; // smoothed scroll
    let rings: HTMLElement[] = [];
    let frames: HTMLElement[] = [];
    let firstServiceRow: HTMLElement | null = null;
    let frameCount = 0;
    let sprites: Sprite[] = [];
    const bee = createBee();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) state.intro = 1;

    const refresh = () => {
      rings = Array.from(document.querySelectorAll<HTMLElement>('[data-ring]'));
      frames = Array.from(document.querySelectorAll<HTMLElement>('[data-frame]'));
      firstServiceRow = document.querySelector<HTMLElement>('.sv-row');
      docH = document.documentElement.scrollHeight;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      vh = H;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = clamp(W / 1400, 0.55, 1.15);
      sprites = FLOWERS.map((f) => createSprite(f, f.r * scale, dpr));
      refresh();
    };

    const put = (ch: string, x: number, y: number, a: number) => {
      ctx.globalAlpha = a;
      ctx.fillText(ch, snapX(x), snapY(y));
    };

    const drawRings = () => {
      for (const el of rings) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -150 || r.top > vh + 150) continue;
        const t = easeOut(clamp((vh * 0.92 - r.top) / (vh * 0.45)));
        if (t <= 0) continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const rad = r.width / 2 + 14;
        const n = Math.floor((2 * Math.PI * rad) / 9);
        const upto = Math.floor(n * t);
        for (let k = 0; k < upto; k++) {
          const th = -Math.PI / 2 + (k / n) * Math.PI * 2;
          put(k === upto - 1 ? '*' : 'o', cx + Math.cos(th) * rad, cy + Math.sin(th) * rad * 0.92, 0.55);
        }
        const rad2 = rad + 12;
        const n2 = Math.floor((2 * Math.PI * rad2) / 10);
        const upto2 = Math.floor(n2 * t);
        for (let k = 0; k < upto2; k++) {
          const th = -Math.PI / 2 - (k / n2) * Math.PI * 2;
          put('.', cx + Math.cos(th) * rad2, cy + Math.sin(th) * rad2 * 0.92, 0.3);
        }
      }
    };

    const drawFrames = () => {
      for (const el of frames) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) continue;
        const t = easeOut(clamp((vh * 0.85 - r.top) / (r.height * 0.8 + vh * 0.25)));
        if (t <= 0) continue;
        const pad = 0;
        const x0 = r.left - pad;
        const y0 = r.top - pad;
        const w = r.width + pad * 2;
        const h = r.height + pad * 2;
        const P = 2 * (w + h);
        const lim = P * t;
        for (let s = 0; s <= lim; s += 9) {
          let x: number, y: number, ch: string;
          if (s < w) { x = x0 + s; y = y0; ch = '-'; }
          else if (s < w + h) { x = x0 + w; y = y0 + (s - w); ch = '|'; }
          else if (s < 2 * w + h) { x = x0 + w - (s - w - h); y = y0 + h; ch = '-'; }
          else { x = x0; y = y0 + h - (s - 2 * w - h); ch = '|'; }
          put(s === 0 ? '+' : ch, x, y, 0.4);
        }
      }
    };

    const drawFlower = (f: Flower, sp: Sprite, baseX: number, baseY: number, bloom: number, sway: number) => {
      const R = f.r * scale;
      const top = baseY - sp.oy;
      if (top > vh + 60 || baseY < -60) return;

      const qKey = Math.round(bloom * 120);
      if (qKey <= 0) return;
      if (sp.key !== qKey) {
        sp.key = qKey;
        renderFlower(f, R, qKey / 120, sp, dpr);
      }

      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.rotate(sway);
      ctx.drawImage(sp.c, -sp.ox, -sp.oy, sp.w, sp.h);
      ctx.restore();
    };

    const tick = (time: number) => {
      const target = window.scrollY;
      sy += (target - sy) * 0.12;
      if (Math.abs(target - sy) < 0.1) sy = target;

      if (frameCount++ % 90 === 0) refresh();

      ctx.clearRect(0, 0, W, H);

      const heroScroll = clamp(sy / (vh * 0.85));
      const flowerTargets: FlowerTarget[] = [];

      for (let i = 0; i < FLOWERS.length; i++) {
        const f = FLOWERS[i];
        const sp = sprites[i];
        if (!sp) continue;
        const R = f.r * scale;
        const baseX = f.x * W;
        const sway = Math.sin(time * 0.55 + f.seed * 1.9) * 0.018;

        let baseY: number;
        let bloom: number;
        if (f.hero) {
          baseY = f.y * vh - sy * f.depth;
          bloom = clamp(state.intro * 0.85 + heroScroll * 0.15);
        } else {
          if (f.anchor === 'services-row-1' && firstServiceRow) {
            const rect = firstServiceRow.getBoundingClientRect();
            baseY = rect.bottom;
          } else if (f.anchor === 'statement' && frames[0]) {
            const rect = frames[0].getBoundingClientRect();
            baseY = rect.top + rect.height * 0.52 + R * f.stem;
          } else {
            const docY = f.y * docH;
            baseY = docY - sy + (docY - sy - vh * 0.5) * 0.2;
          }
          bloom = clamp((vh * 1.18 - (baseY - R * f.stem)) / (vh * 0.65));
        }

        drawFlower(f, sp, baseX, baseY, bloom, sway);

        // Compute blossom head position in screen space for the bee's flight & orbit
        const stemProg = Math.max(0.75, easeOut(clamp(bloom / 0.45)));
        const dx0 = f.lean * R * 0.35 * stemProg;
        const dy0 = -R * f.stem * stemProg;
        const hx = baseX + dx0 * Math.cos(sway) - dy0 * Math.sin(sway);
        const hy = baseY + dx0 * Math.sin(sway) + dy0 * Math.cos(sway);

        flowerTargets.push({ hx, hy, r: R, bloom, hero: f.hero });
      }

      ctx.font = `${CELL_H - 1}px "Space Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';

      drawRings();
      drawFrames();

      // Update and render the ASCII Bee + circular flower orbits + trail
      updateAndDrawBee(ctx, bee, flowerTargets, sy, vh, docH, W, H, time, state.intro);

      ctx.globalAlpha = 1;
    };

    resize();
    sy = window.scrollY;
    gsap.ticker.add(tick);
    window.addEventListener('resize', resize);
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', resize);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden />;
};
