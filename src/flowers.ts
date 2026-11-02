// Detailed colored ASCII flower renderer.
// Each flower is rasterised onto a fine character grid with vibrant botanical colors
// and cached in an offscreen sprite; the sprite is only redrawn when its bloom value changes.

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
  anchor?: 'services-row-1' | 'statement';
}

interface Layer {
  n: number;
  len: number;
  width: number;
  shape: Shape;
  rot: number;
  delay: number;
  bright: number;
  outlineCol: string;
  veinCol: string;
  fillInnerCol: string;
  fillOuterCol: string;
}

interface Spec {
  core: number;
  coreType: 'seeds' | 'swirl' | 'stamens';
  coreCenterCol: string;
  coreOuterCol: string;
  coreRimCol: string;
  stamenFilamentCol: string;
  stamenAntherCol: string;
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

// Vibrant botanical stem & foliage colors
const COL_STEM_MAIN = '#4ade80';
const COL_STEM_SHADE = '#22c55e';
const COL_LEAF_EDGE = '#86efac';
const COL_LEAF_VEIN = '#bbf7d0';
const COL_LEAF_FILL = '#4ade80';

// Crisp character grid
const FS = 10;
const FW = FS * 0.61;
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
    coreCenterCol: '#f59e0b',
    coreOuterCol: '#fbbf24',
    coreRimCol: '#fef08a',
    stamenFilamentCol: '#fcd34d',
    stamenAntherCol: '#fef08a',
    layers: [
      {
        n: 22,
        len: 1,
        width: 0.095,
        shape: 'thin',
        rot: 0,
        delay: 0,
        bright: 0.92,
        outlineCol: '#ffffff',
        veinCol: '#fde68a',
        fillInnerCol: '#fef08a',
        fillOuterCol: '#fffbeb',
      },
      {
        n: 22,
        len: 0.84,
        width: 0.09,
        shape: 'thin',
        rot: Math.PI / 22,
        delay: 0.12,
        bright: 1,
        outlineCol: '#ffffff',
        veinCol: '#fef08a',
        fillInnerCol: '#fde047',
        fillOuterCol: '#ffffff',
      },
    ],
  },
  lotus: {
    core: 0.14,
    coreType: 'stamens',
    coreCenterCol: '#f59e0b',
    coreOuterCol: '#fbbf24',
    coreRimCol: '#fde047',
    stamenFilamentCol: '#fdba74',
    stamenAntherCol: '#fef08a',
    layers: [
      {
        n: 8,
        len: 1,
        width: 0.26,
        shape: 'pointed',
        rot: 0,
        delay: 0,
        bright: 0.9,
        outlineCol: '#fbcfe8',
        veinCol: '#f472b6',
        fillInnerCol: '#ec4899',
        fillOuterCol: '#f9a8d4',
      },
      {
        n: 8,
        len: 0.74,
        width: 0.24,
        shape: 'pointed',
        rot: Math.PI / 8,
        delay: 0.14,
        bright: 0.96,
        outlineCol: '#fce7f3',
        veinCol: '#f9a8d4',
        fillInnerCol: '#f472b6',
        fillOuterCol: '#fbcfe8',
      },
      {
        n: 5,
        len: 0.46,
        width: 0.22,
        shape: 'pointed',
        rot: 0.3,
        delay: 0.28,
        bright: 1,
        outlineCol: '#ffffff',
        veinCol: '#fbcfe8',
        fillInnerCol: '#f9a8d4',
        fillOuterCol: '#fce7f3',
      },
    ],
  },
  rose: {
    core: 0.3,
    coreType: 'swirl',
    coreCenterCol: '#fb7185',
    coreOuterCol: '#f43f5e',
    coreRimCol: '#fecdd3',
    stamenFilamentCol: '#fda4af',
    stamenAntherCol: '#fef08a',
    layers: [
      {
        n: 5,
        len: 1,
        width: 0.42,
        shape: 'round',
        rot: 0,
        delay: 0,
        bright: 0.88,
        outlineCol: '#fda4af',
        veinCol: '#fb7185',
        fillInnerCol: '#e11d48',
        fillOuterCol: '#f43f5e',
      },
      {
        n: 5,
        len: 0.8,
        width: 0.4,
        shape: 'round',
        rot: GOLDEN,
        delay: 0.1,
        bright: 0.92,
        outlineCol: '#fecdd3',
        veinCol: '#fda4af',
        fillInnerCol: '#f43f5e',
        fillOuterCol: '#fb7185',
      },
      {
        n: 5,
        len: 0.6,
        width: 0.38,
        shape: 'round',
        rot: GOLDEN * 2,
        delay: 0.2,
        bright: 0.96,
        outlineCol: '#ffe4e6',
        veinCol: '#fecdd3',
        fillInnerCol: '#fb7185',
        fillOuterCol: '#fda4af',
      },
      {
        n: 5,
        len: 0.42,
        width: 0.36,
        shape: 'round',
        rot: GOLDEN * 3,
        delay: 0.3,
        bright: 1,
        outlineCol: '#fff1f2',
        veinCol: '#ffe4e6',
        fillInnerCol: '#fda4af',
        fillOuterCol: '#fecdd3',
      },
    ],
  },
  anemone: {
    core: 0.19,
    coreType: 'stamens',
    coreCenterCol: '#818cf8',
    coreOuterCol: '#a5b4fc',
    coreRimCol: '#e0e7ff',
    stamenFilamentCol: '#c7d2fe',
    stamenAntherCol: '#fde047',
    layers: [
      {
        n: 6,
        len: 1,
        width: 0.35,
        shape: 'round',
        rot: 0,
        delay: 0,
        bright: 0.92,
        outlineCol: '#e9d5ff',
        veinCol: '#c084fc',
        fillInnerCol: '#9333ea',
        fillOuterCol: '#a855f7',
      },
      {
        n: 6,
        len: 0.7,
        width: 0.31,
        shape: 'round',
        rot: Math.PI / 6,
        delay: 0.15,
        bright: 1,
        outlineCol: '#f3e8ff',
        veinCol: '#d8b4fe',
        fillInnerCol: '#a855f7',
        fillOuterCol: '#c084fc',
      },
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

  const s0 = L.delay + hash(ki * 1.7 + li * 13.3) * 0.16;
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

// Fuller, more legible ASCII ramp for petal surfaces
const PETAL_FILL = ' .:+*#%@';

const petalChar = (h: Hit, L: Layer): [string, number, string] => {
  const { t, v, len, hw, axis, wslope } = h;
  const av = Math.abs(v);
  const sgn = v < 0 ? -1 : 1;
  const light = 0.5 + 0.5 * Math.cos(axis + 2.36); // light from upper left

  // Crisp bright outline
  if ((1 - t) * len < FW * 0.95) return [dirChar(...headDir(axis + Math.PI / 2)), 1.0 * L.bright, L.outlineCol];
  if (hw - av < FW * 0.9) return [dirChar(...headDir(axis + Math.atan(sgn * wslope))), 0.98 * L.bright, L.outlineCol];

  // Midrib
  if (av < FW * 0.55 && t > 0.08 && t < 0.84) {
    return [dirChar(...headDir(axis)), (0.78 + 0.22 * light) * L.bright, L.veinCol];
  }

  // Side veins, angled towards the tip
  const period = len * 0.17;
  const q = t * len - av * 1.5;
  if (t < 0.85 && fract(q / period) * period < FW * 0.85) {
    return [dirChar(...headDir(axis + Math.atan2(sgn, 1.5))), (0.62 + 0.25 * light) * L.bright, L.veinCol];
  }

  // Shaded fill (inner base vs outer petal tone)
  const e = av / hw;
  let s = (1 - e * e) * (0.55 + 0.45 * light) * (1 - 0.3 * t);
  s *= 0.75 + 0.25 * Math.min(1, t * 3);
  const idx = Math.min(PETAL_FILL.length - 1, Math.max(1, Math.floor(s * (PETAL_FILL.length - 1)) + 1));
  const fillCol = t < 0.45 ? L.fillInnerCol : L.fillOuterCol;
  return [PETAL_FILL[idx], (0.52 + 0.44 * s) * L.bright, fillCol];
};

const sampleHead = (
  spec: Spec,
  R: number,
  r: number,
  th: number,
  prog: number,
  rotBase: number,
  seed: number
): [string, number, string] | null => {
  const coreProg = easeOut(clamp(prog / 0.5));
  const rc = R * spec.core * coreProg;

  // Stamens: thin filaments with golden anthers
  if (spec.coreType === 'stamens') {
    const sp = easeOut(clamp((prog - 0.35) / 0.65));
    if (sp > 0 && r > rc * 0.8) {
      const m = 18;
      const step = TAU / m;
      const k = Math.round((th - rotBase * 0.5) / step);
      const a = rotBase * 0.5 + k * step;
      const lenS = rc + R * (0.14 + 0.12 * hash(k + seed * 11)) * sp;
      const along = Math.cos(th - a) * r;
      const dperp = Math.abs(Math.sin(th - a)) * r;
      if (along > 0 && r < lenS + FH * 0.6) {
        if (Math.abs(r - lenS) < FH * 0.55 && dperp < FW * 0.95) {
          return [k % 3 === 0 ? '@' : 'o', 1.0, spec.stamenAntherCol];
        }
        if (dperp < FW * 0.5) return [dirChar(...headDir(a)), 0.85, spec.stamenFilamentCol];
      }
    }
  }

  // Core disc
  if (spec.coreType !== 'swirl' && r < rc) {
    const rn = r / rc;
    if (rc - r < FW * 0.95) return [dirChar(...headDir(th + Math.PI / 2)), 1.0, spec.coreRimCol];
    if (spec.coreType === 'seeds') {
      // phyllotaxis-like crossing log spirals
      const lr = Math.log(r + 1) * 2.4;
      const f = Math.cos(8 * (th + lr)) * Math.cos(13 * (th - lr * 0.62));
      if (f > 0.25) return [rn < 0.35 ? '@' : 'o', 0.88 + 0.12 * f, rn < 0.4 ? spec.coreCenterCol : spec.coreOuterCol];
      if (f < -0.25) return ['+', 0.72, spec.coreCenterCol];
      return ['*', 0.8, spec.coreOuterCol];
    }
    if (rn < 0.35) return ['@', 1.0, spec.coreCenterCol];
    return [
      hash(Math.round(th * 12) * 3.3 + Math.round(r / 3)) > 0.5 ? '%' : '#',
      0.82 + 0.18 * (1 - rn),
      spec.coreOuterCol,
    ];
  }

  // Rose: tightly wound spiral in the middle
  if (spec.coreType === 'swirl' && r < rc) {
    const b = rc / (TAU * 2.6);
    const th0 = th - rotBase;
    const phi0 = ((th0 % TAU) + TAU) % TAU;
    const n = Math.round((r / b - phi0) / TAU);
    const phi = phi0 + n * TAU;
    if (phi >= 0 && Math.abs(r - b * phi) < FW * 0.65) {
      const ang = phi + rotBase;
      const dx = b * Math.cos(ang) - b * phi * Math.sin(ang);
      const dy = b * Math.sin(ang) + b * phi * Math.cos(ang);
      return [dirChar(dx, dy * SQUASH), 1.0, spec.coreRimCol];
    }
    return [r / rc < 0.5 ? '+' : ':', 0.72, spec.coreCenterCol];
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
  const cells = new Map<number, { i: number; j: number; ch: string; a: number; col: string }>();
  const set = (i: number, j: number, ch: string, a: number, col: string) => {
    cells.set((i + 1000) * 10000 + (j + 5000), { i, j, ch, a, col });
  };

  const stemProg = easeOut(clamp(bloom / 0.45));
  const headProg = clamp((bloom - 0.15) / 0.85);
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
    set(i, j, ch, 0.92, COL_STEM_MAIN);
    set(i + 1, j, ch, 0.68, COL_STEM_SHADE);
    if (t < 0.5) set(i - 1, j, ch, 0.6, COL_STEM_SHADE); // fuller stalk
  }

  // ---- leaves ----
  const leaves = [
    { s: 0.28, side: lean >= 0 ? -1 : 1 },
    { s: 0.52, side: lean >= 0 ? 1 : -1 },
  ];
  leaves.forEach((ld, li) => {
    const lp = easeOut(clamp((stemProg - 0.25 - li * 0.15) / 0.5));
    if (lp <= 0) return;
    const P = bez(ld.s);
    const ang = -Math.PI / 2 + ld.side * (1.05 - 0.15 * li);
    const ax = Math.cos(ang), ay = Math.sin(ang);
    const px = -ay, py = ax;
    const Ll = R * 0.78 * lp;
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
        const hw = Ll * 0.27 * wfrac(t, 'pointed');
        const av = Math.abs(v);
        if (av > hw) continue;
        const sgn = v < 0 ? -1 : 1;
        const mid = 2 * bend * t;

        if ((1 - t) * Ll < FW) {
          set(i, j, dirChar(px, py), 0.94, COL_LEAF_EDGE);
        } else if (hw - av < FW * 0.9) {
          const ws = (0.27 * (wfrac(t + 0.01, 'pointed') - wfrac(t - 0.01, 'pointed'))) / 0.02;
          const sl = mid + sgn * ws;
          set(i, j, dirChar(ax + px * sl, ay + py * sl), 0.94, COL_LEAF_EDGE);
        } else if (av < FW * 0.55 && t < 0.9) {
          set(i, j, dirChar(ax + px * mid, ay + py * mid), 0.85, COL_LEAF_VEIN);
        } else {
          const period = Ll * 0.14;
          const q = t * Ll - av * 1.4;
          if (fract(q / period) * period < FW * 0.85) {
            set(i, j, dirChar(ax * 1.4 + px * sgn, ay * 1.4 + py * sgn), 0.72, COL_LEAF_VEIN);
          } else {
            set(i, j, (1 - av / hw) > 0.5 ? '+' : ':', 0.55, COL_LEAF_FILL);
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
        if (res) set(i, j, res[0], res[1], res[2]);
      }
    }
  }

  // ---- draw ----
  g.font = `bold ${FS}px "Space Mono", monospace`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  let lastCol = '';
  cells.forEach(({ i, j, ch, a, col }) => {
    if (ch === ' ') return;
    if (col !== lastCol) {
      g.fillStyle = col;
      lastCol = col;
    }
    g.globalAlpha = Math.min(1, a);
    g.fillText(ch, sp.ox + i * FW, sp.oy + j * FH);
  });
  g.globalAlpha = 1;
};
