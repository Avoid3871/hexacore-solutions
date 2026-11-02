// Detailed ASCII flower renderer.
// Each flower is rasterised onto a fine character grid and cached in an
// offscreen sprite; the sprite is only redrawn when its bloom value changes.

export type Kind = 'daisy' | 'lotus' | 'rose' | 'anemone';
type Shape = 'round' | 'pointed' | 'thin';

export interface Flower {
  x: number; // fraction of viewport width
  y: number; // hero: fraction of vh (stem base) · other: fraction of document height
  r: number; // head radius (px, before responsive scale)
  kind: Kind;
  stem: number; // stem length as multiple of r
  depth: number; // hero parallax factor
  hero: boolean;
  lean: number; // -1 … 1
  seed: number;
}

interface Layer {
  n: number;
  len: number;
  width: number;
  shape: Shape;
  rot: number;
  delay: number;
  bright: number;
}

interface Spec {
  core: number;
  coreType: 'seeds' | 'swirl' | 'stamens';
  layers: Layer[];
}

export interface Sprite {
  c: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  key: number;
  ox: number;
  oy: number;
  w: number;
  h: number;
}

// Fine grid
const FS = 9;
const FW = FS * 0.612;
const FH = FS;
const SQUASH = 0.86; // slight perspective tilt of the flower heads

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const fract = (v: number) => v - Math.floor(v);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);

const SPECS: Record<Kind, Spec> = {
  daisy: {
    core: 0.26,
    coreType: 'seeds',
    layers: [
      { n: 22, len: 1, width: 0.09, shape: 'thin', rot: 0, delay: 0, bright: 0.8 },
      { n: 22, len: 0.84, width: 0.085, shape: 'thin', rot: Math.PI / 22, delay: 0.12, bright: 1 },
    ],
  },
  lotus: {
    core: 0.13,
    coreType: 'stamens',
    layers: [
      { n: 8, len: 1, width: 0.25, shape: 'pointed', rot: 0, delay: 0, bright: 0.7 },
      { n: 8, len: 0.74, width: 0.23, shape: 'pointed', rot: Math.PI / 8, delay: 0.14, bright: 0.85 },
      { n: 5, len: 0.46, width: 0.22, shape: 'pointed', rot: 0.3, delay: 0.28, bright: 1 },
    ],
  },
  rose: {
    core: 0.3,
    coreType: 'swirl',
    layers: [
      { n: 5, len: 1, width: 0.42, shape: 'round', rot: 0, delay: 0, bright: 0.65 },
      { n: 5, len: 0.8, width: 0.4, shape: 'round', rot: GOLDEN, delay: 0.1, bright: 0.75 },
      { n: 5, len: 0.6, width: 0.38, shape: 'round', rot: GOLDEN * 2, delay: 0.2, bright: 0.85 },
      { n: 5, len: 0.42, width: 0.36, shape: 'round', rot: GOLDEN * 3, delay: 0.3, bright: 1 },
    ],
  },
  anemone: {
    core: 0.19,
    coreType: 'stamens',
    layers: [
      { n: 6, len: 1, width: 0.34, shape: 'round', rot: 0, delay: 0, bright: 0.8 },
      { n: 6, len: 0.7, width: 0.3, shape: 'round', rot: Math.PI / 6, delay: 0.15, bright: 0.95 },
    ],
  },
};

/** Character that best follows a direction on screen (y points down). */
const dirChar = (dx: number, dy: number) => {
  let a = Math.atan2(dy, dx);
  if (a < 0) a += Math.PI;
  if (a >= Math.PI) a -= Math.PI;
  if (a < 0.3927 || a >= 2.7489) return '-';
  if (a < 1.1781) return '\\';
  if (a < 1.9635) return '|';
  return '/';
};

/** Petal half-width profile (fraction of length) along the petal, t ∈ [0,1]. */
const wfrac = (t: number, s: Shape) => {
  t = clamp(t);
  if (s === 'thin') return Math.sqrt(Math.sin(Math.PI * Math.pow(t, 0.6)));
  if (s === 'round') return Math.sqrt(Math.sin(Math.PI * Math.pow(t, 1.4)));
  return Math.pow(Math.sin(Math.PI * Math.pow(t, 1.15)), 0.85);
};

const headDir = (a: number): [number, number] => [Math.cos(a), Math.sin(a) * SQUASH];

interface Hit {
  t: number;
  v: number;
  len: number;
  hw: number;
  axis: number;
  wslope: number;
}

const sampleLayer = (
  L: Layer,
  li: number,
  R: number,
  r: number,
  th: number,
  prog: number,
  rotBase: number
): Hit | null => {
  const step = TAU / L.n;
  const base = L.rot + rotBase;
  const k = Math.round((th - base) / step);
  const ki = ((k % L.n) + L.n) % L.n;

  const s0 = L.delay + hash(ki * 1.7 + li * 13.3) * 0.2;
  const unfold = easeOut(clamp((prog - s0) / (1 - s0)));
  if (unfold <= 0) return null;

  const axis = base + k * step + (hash(ki * 5.3 + li) - 0.5) * step * 0.15;
  const len = R * L.len * (0.9 + 0.18 * hash(ki * 2.9 + li * 7.1)) * unfold;
  const phi = th - axis;
  const u = r * Math.cos(phi);
  const v = r * Math.sin(phi);
  const t = u / len;
  if (t <= 0.02 || t >= 1) return null;

  const mul = 0.45 + 0.55 * unfold; // petals open up while unfolding
  const hw = len * L.width * mul * wfrac(t, L.shape);
  if (Math.abs(v) > hw) return null;

  const wslope =
    (L.width * mul * (wfrac(Math.min(0.999, t + 0.01), L.shape) - wfrac(Math.max(0.001, t - 0.01), L.shape))) / 0.02;

  return { t, v, len, hw, axis, wslope };
};

const PETAL_FILL = ' .,:;-=+';

const petalChar = (h: Hit, L: Layer): [string, number] => {
  const { t, v, len, hw, axis, wslope } = h;
  const av = Math.abs(v);
  const sgn = v < 0 ? -1 : 1;
  const light = 0.5 + 0.5 * Math.cos(axis + 2.36); // light from upper left

  // outline
  if ((1 - t) * len < FW * 0.9) return [dirChar(...headDir(axis + Math.PI / 2)), 0.9 * L.bright];
  if (hw - av < FW * 0.85) return [dirChar(...headDir(axis + Math.atan(sgn * wslope))), 0.85 * L.bright];

  // midrib
  if (av < FW * 0.5 && t > 0.1 && t < 0.82) return [dirChar(...headDir(axis)), (0.4 + 0.2 * light) * L.bright];

  // side veins, angled towards the tip
  const period = len * 0.17;
  const q = t * len - av * 1.5;
  if (t < 0.85 && fract(q / period) * period < FW * 0.8) {
    return [dirChar(...headDir(axis + Math.atan2(sgn, 1.5))), (0.22 + 0.15 * light) * L.bright];
  }

  // shaded fill
  const e = av / hw;
  let s = (1 - e * e) * (0.55 + 0.45 * light) * (1 - 0.35 * t);
  s *= 0.7 + 0.3 * Math.min(1, t * 3);
  const idx = Math.min(PETAL_FILL.length - 1, Math.max(1, Math.floor(s * PETAL_FILL.length)));
  return [PETAL_FILL[idx], (0.14 + 0.3 * s) * L.bright];
};

const sampleHead = (
  spec: Spec,
  R: number,
  r: number,
  th: number,
  prog: number,
  rotBase: number,
  seed: number
): [string, number] | null => {
  const coreProg = easeOut(clamp(prog / 0.5));
  const rc = R * spec.core * coreProg;

  // Stamens: thin filaments with anthers
  if (spec.coreType === 'stamens') {
    const sp = easeOut(clamp((prog - 0.4) / 0.6));
    if (sp > 0 && r > rc * 0.8) {
      const m = 18;
      const step = TAU / m;
      const k = Math.round((th - rotBase * 0.5) / step);
      const a = rotBase * 0.5 + k * step;
      const lenS = rc + R * (0.14 + 0.12 * hash(k + seed * 11)) * sp;
      const along = Math.cos(th - a) * r;
      const dperp = Math.abs(Math.sin(th - a)) * r;
      if (along > 0 && r < lenS + FH * 0.6) {
        if (Math.abs(r - lenS) < FH * 0.55 && dperp < FW * 0.9) return [k % 3 === 0 ? '*' : 'o', 0.9];
        if (dperp < FW * 0.45) return [dirChar(...headDir(a)), 0.55];
      }
    }
  }

  // Core disc
  if (spec.coreType !== 'swirl' && r < rc) {
    const rn = r / rc;
    if (rc - r < FW * 0.9) return [dirChar(...headDir(th + Math.PI / 2)), 0.85];
    if (spec.coreType === 'seeds') {
      // phyllotaxis-like crossing log spirals
      const lr = Math.log(r + 1) * 2.4;
      const f = Math.cos(8 * (th + lr)) * Math.cos(13 * (th - lr * 0.62));
      if (f > 0.3) return [rn < 0.35 ? '@' : 'o', 0.6 + 0.3 * f];
      if (f < -0.3) return ['.', 0.35];
      return [':', 0.45];
    }
    if (rn < 0.35) return ['@', 0.9];
    return [hash(Math.round(th * 12) * 3.3 + Math.round(r / 3)) > 0.5 ? '%' : '#', 0.55 + 0.25 * (1 - rn)];
  }

  // Rose: tightly wound spiral in the middle
  if (spec.coreType === 'swirl' && r < rc) {
    const b = rc / (TAU * 2.6);
    const th0 = th - rotBase;
    const phi0 = ((th0 % TAU) + TAU) % TAU;
    const n = Math.round((r / b - phi0) / TAU);
    const phi = phi0 + n * TAU;
    if (phi >= 0 && Math.abs(r - b * phi) < FW * 0.6) {
      const ang = phi + rotBase;
      const dx = b * Math.cos(ang) - b * phi * Math.sin(ang);
      const dy = b * Math.sin(ang) + b * phi * Math.cos(ang);
      return [dirChar(dx, dy * SQUASH), 0.85];
    }
    return [r / rc < 0.5 ? ':' : '.', 0.3];
  }

  // Petal layers, innermost on top
  for (let li = spec.layers.length - 1; li >= 0; li--) {
    const L = spec.layers[li];
    const hit = sampleLayer(L, li, R, r, th, prog, rotBase);
    if (hit) return petalChar(hit, L);
  }
  return null;
};

export const createSprite = (f: Flower, R: number, dpr: number): Sprite => {
  const c = document.createElement('canvas');
  const ox = R * 1.6;
  const oy = R * f.stem + R * 1.25;
  const w = R * 3.2;
  const h = oy + FH * 2;
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);
  const g = c.getContext('2d')!;
  return { c, g, key: -1, ox, oy, w, h };
};

/** Rasterises a flower (stem, leaves, head) at a given bloom value into its sprite. */
export const renderFlower = (f: Flower, R: number, bloom: number, sp: Sprite, dpr: number) => {
  const g = sp.g;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, sp.w, sp.h);
  if (bloom <= 0.001) return;

  const spec = SPECS[f.kind];
  const cells = new Map<number, { i: number; j: number; ch: string; a: number }>();
  const set = (i: number, j: number, ch: string, a: number) => {
    cells.set((i + 1000) * 10000 + (j + 5000), { i, j, ch, a });
  };

  const stemProg = easeOut(clamp(bloom / 0.45));
  const headProg = clamp((bloom - 0.2) / 0.8);
  const stemH = R * f.stem;
  const lean = f.lean;

  // ---- stem (cubic bezier from base to head) ----
  const P0x = 0, P0y = 0;
  const P3x = lean * R * 0.35 * stemProg;
  const P3y = -stemH * stemProg;
  const P1x = -lean * R * 0.18, P1y = P3y * 0.35;
  const P2x = P3x + lean * R * 0.08, P2y = P3y * 0.72;

  const bez = (t: number) => {
    const m = 1 - t;
    return {
      x: m * m * m * P0x + 3 * m * m * t * P1x + 3 * m * t * t * P2x + t * t * t * P3x,
      y: m * m * m * P0y + 3 * m * m * t * P1y + 3 * m * t * t * P2y + t * t * t * P3y,
    };
  };
  const bezD = (t: number) => {
    const m = 1 - t;
    return {
      x: 3 * m * m * (P1x - P0x) + 6 * m * t * (P2x - P1x) + 3 * t * t * (P3x - P2x),
      y: 3 * m * m * (P1y - P0y) + 6 * m * t * (P2y - P1y) + 3 * t * t * (P3y - P2y),
    };
  };

  for (let t = 0; t <= 1; t += 0.0015) {
    const p = bez(t);
    const d = bezD(t);
    const ch = dirChar(d.x, d.y);
    const i = Math.round(p.x / FW);
    const j = Math.round(p.y / FH);
    set(i, j, ch, 0.55);
    if (t < 0.4) set(i + 1, j, ch, 0.35); // thicker towards the ground
  }

  // ---- leaves ----
  const leaves = [
    { s: 0.26, side: lean >= 0 ? -1 : 1 },
    { s: 0.5, side: lean >= 0 ? 1 : -1 },
  ];
  leaves.forEach((ld, li) => {
    const lp = easeOut(clamp((stemProg - 0.3 - li * 0.15) / 0.5));
    if (lp <= 0) return;
    const P = bez(ld.s);
    const ang = -Math.PI / 2 + ld.side * (1.05 - 0.15 * li);
    const ax = Math.cos(ang), ay = Math.sin(ang);
    const px = -ay, py = ax;
    const Ll = R * 0.72 * lp;
    const bend = 0.2 * ld.side;
    const cx = P.x + ax * Ll * 0.5;
    const cy = P.y + ay * Ll * 0.5;
    const ext = Ll * 0.65;

    for (let j = Math.floor((cy - ext) / FH); j <= Math.ceil((cy + ext) / FH); j++) {
      for (let i = Math.floor((cx - ext) / FW); i <= Math.ceil((cx + ext) / FW); i++) {
        const x = i * FW - P.x;
        const y = j * FH - P.y;
        const u = x * ax + y * ay;
        const t = u / Ll;
        if (t <= 0.02 || t >= 1) continue;
        const v = x * px + y * py - bend * Ll * t * t;
        const hw = Ll * 0.26 * wfrac(t, 'pointed');
        const av = Math.abs(v);
        if (av > hw) continue;
        const sgn = v < 0 ? -1 : 1;
        const mid = 2 * bend * t;

        if ((1 - t) * Ll < FW) {
          set(i, j, dirChar(px, py), 0.6);
        } else if (hw - av < FW * 0.85) {
          const ws = (0.26 * (wfrac(t + 0.01, 'pointed') - wfrac(t - 0.01, 'pointed'))) / 0.02;
          const sl = mid + sgn * ws;
          set(i, j, dirChar(ax + px * sl, ay + py * sl), 0.6);
        } else if (av < FW * 0.5 && t < 0.9) {
          set(i, j, dirChar(ax + px * mid, ay + py * mid), 0.45);
        } else {
          const period = Ll * 0.14;
          const q = t * Ll - av * 1.4;
          if (fract(q / period) * period < FW * 0.85) {
            set(i, j, dirChar(ax * 1.4 + px * sgn, ay * 1.4 + py * sgn), 0.32);
          } else {
            set(i, j, (1 - av / hw) > 0.5 ? ':' : '.', 0.2);
          }
        }
      }
    }
  });

  // ---- head ----
  if (headProg > 0) {
    const Hx = P3x;
    const Hy = P3y;
    const rotBase = f.seed * 1.37 + (1 - easeOut(headProg)) * 0.9 * (lean >= 0 ? 1 : -1);
    const ext = R * 1.12 + FW;
    for (let j = Math.floor((Hy - ext * SQUASH) / FH); j <= Math.ceil((Hy + ext * SQUASH) / FH); j++) {
      for (let i = Math.floor((Hx - ext) / FW); i <= Math.ceil((Hx + ext) / FW); i++) {
        const dx = i * FW - Hx;
        const dy = (j * FH - Hy) / SQUASH;
        const r = Math.hypot(dx, dy);
        if (r > ext) continue;
        const res = sampleHead(spec, R, r, Math.atan2(dy, dx), headProg, rotBase, f.seed);
        if (res) set(i, j, res[0], res[1]);
      }
    }
  }

  // ---- draw ----
  g.font = `${FS}px "Space Mono", monospace`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#fff';
  cells.forEach(({ i, j, ch, a }) => {
    if (ch === ' ') return;
    g.globalAlpha = Math.min(1, a);
    g.fillText(ch, sp.ox + i * FW, sp.oy + j * FH);
  });
  g.globalAlpha = 1;
};
