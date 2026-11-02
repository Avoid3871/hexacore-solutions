import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { state } from '../state';

const CELL_W = 8;
const CELL_H = 13;
const RAMP = ' .:-=+*#%@';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const snapX = (x: number) => Math.round(x / CELL_W) * CELL_W;
const snapY = (y: number) => Math.round(y / CELL_H) * CELL_H;

interface Flower {
  x: number; // fraction of width
  y: number; // hero: px offset from top of page (fraction of vh); other: fraction of document height
  r: number; // radius in px
  petals: number;
  depth: number; // hero parallax factor
  hero: boolean;
  dir: number;
}

const FLOWERS: Flower[] = [
  { x: 0.12, y: 0.95, r: 120, petals: 6, depth: 0.55, hero: true, dir: 1 },
  { x: 0.3, y: 1.15, r: 70, petals: 5, depth: 0.75, hero: true, dir: -1 },
  { x: 0.72, y: 1.0, r: 150, petals: 7, depth: 0.45, hero: true, dir: -1 },
  { x: 0.9, y: 1.2, r: 85, petals: 5, depth: 0.7, hero: true, dir: 1 },
  { x: 0.06, y: 0.34, r: 90, petals: 6, depth: 1, hero: false, dir: 1 },
  { x: 0.94, y: 0.52, r: 110, petals: 7, depth: 1, hero: false, dir: -1 },
  { x: 0.08, y: 0.74, r: 80, petals: 5, depth: 1, hero: false, dir: 1 },
];

export const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let W = 0;
    let H = 0;
    let vh = 0;
    let docH = 1;
    let sy = 0; // smoothed scroll
    let head = 0; // line head, document space
    let rings: HTMLElement[] = [];
    let frames: HTMLElement[] = [];
    let frameCount = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) state.intro = 1;

    const refresh = () => {
      rings = Array.from(document.querySelectorAll<HTMLElement>('[data-ring]'));
      frames = Array.from(document.querySelectorAll<HTMLElement>('[data-frame]'));
      docH = document.documentElement.scrollHeight;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      vh = H;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      refresh();
    };

    const pathX = (y: number) =>
      W * 0.5 + Math.sin(y * 0.0042) * W * 0.34 + Math.sin(y * 0.011) * W * 0.05;
    const pathSlope = (y: number) =>
      Math.cos(y * 0.0042) * 0.0042 * W * 0.34 + Math.cos(y * 0.011) * 0.011 * W * 0.05;

    const put = (ch: string, x: number, y: number, a: number) => {
      ctx.globalAlpha = a;
      ctx.fillText(ch, snapX(x), snapY(y));
    };

    const drawLine = () => {
      const start = Math.max(0, sy - 40);
      const end = Math.min(head, sy + vh + 40);
      let y = start;
      while (y <= end) {
        const slope = pathSlope(y);
        const x = pathX(y);
        const ch = Math.abs(slope) > 2.2 ? '-' : Math.abs(slope) < 0.45 ? '|' : slope > 0 ? '\\' : '/';
        const d = head - y;
        const a = 0.14 + 0.6 * Math.exp(-d / (vh * 0.55));
        put(ch, x, y - sy, a);
        y += CELL_H / Math.sqrt(1 + slope * slope);
      }
      // glowing head
      if (head > 0 && head <= docH) {
        const hx = pathX(head);
        const hy = head - sy;
        put('@', hx, hy, 1);
        put('*', hx - CELL_W, hy - 2, 0.5);
        put('*', hx + CELL_W, hy + 2, 0.5);
      }
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

    const drawFlower = (f: Flower, cx: number, topY: number, bloom: number, time: number) => {
      const R = f.r;
      const stemH = R * 2.6;
      if (topY > vh + 50 || topY + stemH < -R - 50) return;

      const stemProg = easeOut(clamp(bloom / 0.5));
      const headProg = easeOut(clamp((bloom - 0.3) / 0.7));

      // stem
      const nStem = Math.floor((stemH * stemProg) / CELL_H);
      for (let i = 0; i < nStem; i++) {
        const y = topY + stemH - i * CELL_H;
        const sway = Math.sin(i * 0.3 + time * 0.7) * 3 * (i / Math.max(1, nStem));
        put('|', cx + sway, y, 0.4);
        if (i % 5 === 3) {
          put(i % 10 === 3 ? ')' : '(', cx + sway + (i % 10 === 3 ? CELL_W : -CELL_W), y, 0.35);
        }
      }

      // head
      if (headProg <= 0.01) return;
      const cy = topY + stemH * (1 - stemProg);
      const Rc = R * headProg;
      const rot = time * 0.12 * f.dir + (1 - headProg) * 1.4 * f.dir;
      for (let r = 0; r <= Rc; r += CELL_H * 0.8) {
        const n = Math.max(1, Math.round((2 * Math.PI * r) / 8));
        for (let k = 0; k < n; k++) {
          const th = (k / n) * Math.PI * 2;
          const lobe = Math.pow(Math.abs(Math.cos((f.petals * (th - rot)) / 2)), 0.8);
          const petalR = Rc * (0.3 + 0.7 * lobe);
          if (r > petalR) continue;
          const inten = 1 - r / petalR;
          const center = r < Rc * 0.12;
          const idx = center ? 9 : Math.max(1, Math.min(8, Math.floor(inten * 8) + 1));
          put(RAMP[idx], cx + Math.cos(th) * r, cy + Math.sin(th) * r * 0.9, 0.18 + 0.5 * inten);
        }
      }
    };

    const tick = (time: number) => {
      const target = window.scrollY;
      sy += (target - sy) * 0.12;
      if (Math.abs(target - sy) < 0.1) sy = target;
      head += (target + vh * 0.78 - head) * 0.07;

      if (frameCount++ % 90 === 0) refresh();

      ctx.clearRect(0, 0, W, H);
      ctx.font = `${CELL_H - 1}px "Space Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';

      const heroScroll = clamp(sy / (vh * 0.9));

      for (const f of FLOWERS) {
        const cx = f.x * W;
        if (f.hero) {
          const topY = f.y * vh - sy * f.depth - f.r * 2.6;
          const bloom = clamp(state.intro * 0.35 + heroScroll * 0.65);
          drawFlower(f, cx, topY, bloom, time);
        } else {
          const docY = f.y * docH;
          const screen = docY - sy + (docY - sy - vh * 0.5) * 0.2;
          const bloom = clamp((vh * 0.95 - screen) / (vh * 0.7));
          drawFlower(f, cx, screen - f.r * 2.6, bloom, time);
        }
      }

      drawLine();
      drawRings();
      drawFrames();
      ctx.globalAlpha = 1;
    };

    resize();
    sy = window.scrollY;
    head = sy + vh * 0.2;
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
