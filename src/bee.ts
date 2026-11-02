// Autonomous ASCII Bee with organic steering, flower orbits, mid-air loops,
// blossom landings (nectar sipping with folded wings), and scroll-following behavior.

const CELL_W = 8;
const CELL_H = 13;
const TAU = Math.PI * 2;
const SQUASH = 0.86;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const snapX = (x: number) => Math.round(x / CELL_W) * CELL_W;
const snapY = (y: number) => Math.round(y / CELL_H) * CELL_H;

export interface FlowerTarget {
  hx: number; // flower head center X (screen space)
  hy: number; // flower head center Y (screen space)
  r: number;  // flower head radius (px)
  bloom: number;
  hero: boolean;
}

interface TrailPoint {
  x: number;   // world X
  y: number;   // world Y (screenY + sy)
  dx: number;
  dy: number;
  born: number;
  ring: boolean;
}

interface Dust {
  x: number;   // world X
  y: number;   // world Y
  vx: number;
  vy: number;
  born: number;
  ch: string;
}

type BeeMode = 'wander' | 'orbit' | 'land' | 'landed';

export interface BeeState {
  inited: boolean;
  x: number;          // world X
  y: number;          // world Y (screenY + sy)
  vx: number;
  vy: number;
  angle: number;
  mode: BeeMode;
  modeTime: number;   // time spent in current mode
  modeDur: number;    // planned duration of current mode
  targetFlower: number;
  lastFlower: number;
  willLand: boolean;
  orbitAngle: number;
  orbitDir: number;
  orbitRadius: number;
  landOffX: number;
  landOffY: number;
  crawlPhase: number;
  wanderX: number;    // screen-relative target X
  wanderY: number;    // screen-relative target Y
  wanderTimer: number;
  loopTimer: number;  // > 0 when doing a spontaneous mid-air loop
  loopDir: number;
  lastSy: number;
  lastTime: number;
  trail: TrailPoint[];
  lastTrailX: number;
  lastTrailY: number;
  dust: Dust[];
}

export const createBee = (): BeeState => ({
  inited: false,
  x: 0,
  y: -50,
  vx: 0,
  vy: 160,
  angle: Math.PI / 2,
  mode: 'wander',
  modeTime: 0,
  modeDur: 1.2,
  targetFlower: -1,
  lastFlower: -1,
  willLand: true,
  orbitAngle: 0,
  orbitDir: 1,
  orbitRadius: 80,
  landOffX: 0,
  landOffY: 0,
  crawlPhase: 0,
  wanderX: 0,
  wanderY: 0,
  wanderTimer: 0,
  loopTimer: 0,
  loopDir: 1,
  lastSy: 0,
  lastTime: 0,
  trail: [],
  lastTrailX: 0,
  lastTrailY: 0,
  dust: [],
});

const dirChar = (dx: number, dy: number) => {
  let a = Math.atan2(dy, dx);
  if (a < 0) a += Math.PI;
  if (a >= Math.PI) a -= Math.PI;
  if (a < 0.3927 || a >= 2.7489) return '-';
  if (a < 1.1781) return '\\';
  if (a < 1.9635) return '|';
  return '/';
};

const shortAngleDist = (from: number, to: number) => {
  let d = (to - from) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};

/** Draws the ASCII bee at screen position (sx, sy) with heading angle and wing state. */
const drawBeeGlyph = (
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  angle: number,
  time: number,
  landed: boolean
) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const px = -sin;
  const py = cos;

  const putLocal = (along: number, side: number, ch: string, alpha: number, size = 11) => {
    ctx.font = `bold ${size}px "Space Mono", monospace`;
    ctx.globalAlpha = clamp(alpha);
    ctx.fillText(ch, sx + cos * along + px * side, sy + sin * along + py * side);
  };

  if (landed) {
    // Resting on flower: wings folded back along the abdomen with an occasional subtle twitch
    const twitch = Math.pow(Math.max(0, Math.sin(time * 3.2)), 14);
    const sideDist = 6 + twitch * 4;
    for (const side of [-1, 1]) {
      putLocal(-2, side * sideDist, side < 0 ? '(' : ')', 0.75, 10);
      putLocal(-7, side * (sideDist + 1), '.', 0.55, 10);
    }
  } else {
    // Airborne: rapidly buzzing ASCII wings
    const flap = Math.sin(time * 44);
    const wingReach = 12 + 5 * Math.abs(flap);
    const wingSweep = -3 + 4 * flap;

    for (const side of [-1, 1]) {
      const wCharInner = flap > 0 ? (side < 0 ? '(' : ')') : side < 0 ? '/' : '\\';
      const wCharOuter = flap > 0 ? (side < 0 ? '{' : '}') : '~';
      putLocal(2 + wingSweep * 0.5, side * 8, wCharInner, 0.85, 11);
      putLocal(wingSweep, side * wingReach, wCharOuter, 0.75, 11);
      putLocal(wingSweep - 4, side * (wingReach + 5), '.', 0.55, 10);
      putLocal(-5 + wingSweep * 0.3, side * 9, side < 0 ? '(' : ')', 0.6, 9);
    }
  }

  // Stinger & striped abdomen
  putLocal(-16, 0, dirChar(cos, sin), 0.75, 10);
  putLocal(-11, 0, '@', 0.95, 11);
  putLocal(-11, -4, '(', 0.6, 10);
  putLocal(-11, 4, ')', 0.6, 10);

  putLocal(-6, 0, '=', 0.9, 11);

  putLocal(-1, 0, '#', 1, 12);
  putLocal(-1, -5, '(', 0.7, 10);
  putLocal(-1, 5, ')', 0.7, 10);

  // Thorax & head
  putLocal(5, 0, '@', 1, 12);
  putLocal(11, 0, 'o', 1, 11);

  // Antennae (slightly animated feelers)
  const feelerWiggle = landed ? Math.sin(time * 7) * 1.2 : 0;
  putLocal(16, -4 + feelerWiggle, '/', 0.8, 9);
  putLocal(16, 4 + feelerWiggle, '\\', 0.8, 9);
  putLocal(19, -6 + feelerWiggle, '·', 0.65, 9);
  putLocal(19, 6 + feelerWiggle, '·', 0.65, 9);
};

/** Picks an attractive visible flower for the bee to visit next. */
const pickFlower = (
  bee: BeeState,
  targets: FlowerTarget[],
  sy: number,
  vh: number,
  W: number
): number => {
  const screenX = bee.x;
  const screenY = bee.y - sy;

  const candidates: { idx: number; score: number }[] = [];
  for (let i = 0; i < targets.length; i++) {
    if (i === bee.lastFlower && Math.random() < 0.78) continue;
    const f = targets[i];
    if (f.bloom < 0.5) continue;
    // Must be comfortably inside the current viewport
    if (f.hy < vh * 0.1 || f.hy > vh * 0.9 || f.hx < 40 || f.hx > W - 40) continue;

    const d = Math.hypot(f.hx - screenX, f.hy - screenY);
    // Prefer flowers at a medium distance (not too far, not 0)
    const distScore = 1 / (120 + d);
    const randomBoost = 0.6 + Math.random() * 0.8;
    candidates.push({ idx: i, score: distScore * randomBoost });
  }

  if (candidates.length === 0) return -1;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].idx;
};

export const updateAndDrawBee = (
  ctx: CanvasRenderingContext2D,
  bee: BeeState,
  targets: FlowerTarget[],
  sy: number,
  vh: number,
  _docH: number,
  W: number,
  H: number,
  time: number,
  intro: number
) => {
  if (W <= 0 || H <= 0 || intro < 0.05) return;

  if (!bee.inited) {
    bee.inited = true;
    bee.x = W * 0.46;
    bee.y = sy - 35;
    bee.vx = -40;
    bee.vy = 210;
    bee.angle = Math.atan2(bee.vy, bee.vx);
    bee.wanderX = W * 0.36;
    bee.wanderY = vh * 0.52;
    bee.wanderTimer = 1.1;
    bee.lastSy = sy;
    bee.lastTime = time;
    bee.lastTrailX = bee.x;
    bee.lastTrailY = bee.y;
  }

  const dt = Math.min(0.04, Math.max(0.004, time - bee.lastTime));
  bee.lastTime = time;

  const scrollVel = (sy - bee.lastSy) / dt;
  bee.lastSy = sy;
  bee.modeTime += dt;

  const screenX = bee.x;
  const screenY = bee.y - sy;

  // Check if the currently targeted flower is still valid & on screen
  const activeF = bee.targetFlower >= 0 ? targets[bee.targetFlower] : undefined;
  const flowerOffscreen =
    !activeF ||
    activeF.hy < vh * 0.06 ||
    activeF.hy > vh * 0.95 ||
    activeF.bloom < 0.35;

  // Wake up from landing/orbit if the user scrolls fast or the flower leaves the viewport
  if (
    (bee.mode === 'landed' || bee.mode === 'land' || bee.mode === 'orbit') &&
    (flowerOffscreen || Math.abs(scrollVel) > 340)
  ) {
    bee.lastFlower = bee.targetFlower;
    bee.mode = 'wander';
    bee.modeTime = 0;
    bee.wanderTimer = 0.2;
    // Give a lively takeoff boost in the direction of scroll
    bee.vy += clamp(scrollVel * 0.45, -180, 220) - 90;
    bee.vx += (W * 0.5 - screenX) * 0.35;
  }

  // ---- State Machine ----
  if (bee.mode === 'wander') {
    bee.wanderTimer -= dt;

    // Keep wander waypoint inside the current viewport, leading into scroll direction
    const outOfView = screenY < vh * 0.1 || screenY > vh * 0.9;
    if (bee.wanderTimer <= 0 || outOfView || Math.abs(scrollVel) > 140) {
      const marginX = W * 0.16;
      bee.wanderX = marginX + Math.random() * (W - marginX * 2);
      const scrollBias = clamp(scrollVel * 0.0012, -0.22, 0.28);
      bee.wanderY = vh * clamp(0.48 + scrollBias + (Math.random() - 0.5) * 0.36, 0.18, 0.82);
      bee.wanderTimer = 1.1 + Math.random() * 1.4;

      // Occasional spontaneous mid-air loop when flying across open space
      if (bee.loopTimer <= 0 && !outOfView && Math.random() < 0.28) {
        bee.loopTimer = 0.85;
        bee.loopDir = Math.random() < 0.5 ? 1 : -1;
      }
    }

    // Try to pick a flower to visit once the bee has wandered briefly and scroll is calm
    if (bee.modeTime > 1.1 && Math.abs(scrollVel) < 160 && bee.loopTimer <= 0) {
      const nextIdx = pickFlower(bee, targets, sy, vh, W);
      if (nextIdx >= 0) {
        const nf = targets[nextIdx];
        bee.targetFlower = nextIdx;
        bee.mode = 'orbit';
        bee.modeTime = 0;
        // 0.65 to 1.35 full turns around the flower
        const turns = 0.65 + Math.random() * 0.7;
        bee.orbitDir = nf.hx < screenX ? -1 : 1;
        bee.orbitRadius = nf.r * (0.72 + Math.random() * 0.25);
        bee.orbitAngle = Math.atan2((screenY - nf.hy) / SQUASH, screenX - nf.hx);
        bee.modeDur = turns * 2.1;
        // ~68% chance to land on the flower after circling it; otherwise just a playful fly-by!
        bee.willLand = Math.random() < 0.68;
      }
    }

    // Steer toward (wanderX, sy + wanderY) with organic curl waves
    const tx = bee.wanderX;
    const ty = sy + bee.wanderY;
    const dx = tx - bee.x;
    const dy = ty - bee.y;
    const dist = Math.hypot(dx, dy) || 1;

    // Base desired velocity toward wander point + scroll velocity catch-up
    const desiredSpeed = clamp(150 + dist * 0.45 + Math.abs(scrollVel) * 0.55, 130, 440);
    let desiredVx = (dx / dist) * desiredSpeed;
    let desiredVy = (dy / dist) * desiredSpeed + scrollVel * 0.35;

    // Add organic insect weaving perpendicular to flight
    const weave = Math.sin(time * 4.2) * 65 + Math.cos(time * 2.7) * 40;
    desiredVx += (-dy / dist) * weave;
    desiredVy += (dx / dist) * weave;

    // Spontaneous mid-air loop-the-loop
    if (bee.loopTimer > 0) {
      bee.loopTimer -= dt;
      const loopAng = bee.angle + bee.loopDir * 7.4 * dt;
      const spd = 230;
      desiredVx = Math.cos(loopAng) * spd;
      desiredVy = Math.sin(loopAng) * spd + scrollVel * 0.25;
    }

    const steerRate = outOfView ? 6.5 : 4.2;
    bee.vx += (desiredVx - bee.vx) * steerRate * dt;
    bee.vy += (desiredVy - bee.vy) * steerRate * dt;
    bee.x += bee.vx * dt;
    bee.y += bee.vy * dt;
  } else if (bee.mode === 'orbit' && activeF) {
    // Advance angle along the circular/spiral orbit around the blossom head
    const angularSpeed = 2.9 * bee.orbitDir;
    const fhx = activeF.hx;
    const fhy = activeF.hy + sy;

    // Only advance orbitAngle once the bee gets reasonably close to the flower
    const distToCenter = Math.hypot(bee.x - fhx, bee.y - fhy);
    if (distToCenter < activeF.r * 1.9) {
      bee.orbitAngle += angularSpeed * dt;
    } else {
      // Keep entry angle aligned with approach side while flying in
      bee.orbitAngle = Math.atan2((bee.y - fhy) / SQUASH, bee.x - fhx) + bee.orbitDir * 0.45;
    }

    // Spiral slightly inward as orbit progresses
    const prog = clamp(bee.modeTime / bee.modeDur);
    const rad = bee.orbitRadius * (1 - 0.28 * prog + 0.08 * Math.sin(bee.modeTime * 6));

    const ox = fhx + Math.cos(bee.orbitAngle) * rad;
    const oy = fhy + Math.sin(bee.orbitAngle) * rad * SQUASH;

    // Tangent velocity along the orbit
    const tanVx = -Math.sin(bee.orbitAngle) * rad * angularSpeed;
    const tanVy = Math.cos(bee.orbitAngle) * rad * SQUASH * angularSpeed;

    const desiredVx = (ox - bee.x) * 4.5 + tanVx * 0.85;
    const desiredVy = (oy - bee.y) * 4.5 + tanVy * 0.85 + scrollVel * 0.2;

    bee.vx += (desiredVx - bee.vx) * 6.5 * dt;
    bee.vy += (desiredVy - bee.vy) * 6.5 * dt;
    bee.x += bee.vx * dt;
    bee.y += bee.vy * dt;

    if (bee.modeTime >= bee.modeDur) {
      if (bee.willLand) {
        bee.mode = 'land';
        bee.modeTime = 0;
        bee.modeDur = 1.2;
        const landAng = Math.random() * TAU;
        const landR = activeF.r * (0.06 + Math.random() * 0.16);
        bee.landOffX = Math.cos(landAng) * landR;
        bee.landOffY = Math.sin(landAng) * landR * SQUASH;
      } else {
        bee.lastFlower = bee.targetFlower;
        bee.mode = 'wander';
        bee.modeTime = 0;
        bee.wanderTimer = 0;
      }
    }
  } else if (bee.mode === 'land' && activeF) {
    // Smoothly approach the landing spot on the blossom core
    const tx = activeF.hx + bee.landOffX;
    const ty = activeF.hy + sy + bee.landOffY;
    const dx = tx - bee.x;
    const dy = ty - bee.y;
    const dist = Math.hypot(dx, dy);

    const desiredVx = dx * 5.2;
    const desiredVy = dy * 5.2;
    bee.vx += (desiredVx - bee.vx) * 8 * dt;
    bee.vy += (desiredVy - bee.vy) * 8 * dt;
    bee.x += bee.vx * dt;
    bee.y += bee.vy * dt;

    if (dist < 7 || bee.modeTime > 1.4) {
      bee.mode = 'landed';
      bee.modeTime = 0;
      bee.modeDur = 2.0 + Math.random() * 2.2; // sit on the flower for 2.0–4.2s
      bee.crawlPhase = Math.random() * TAU;
      bee.vx = 0;
      bee.vy = 0;
    }
  } else if (bee.mode === 'landed' && activeF) {
    // Rest on the swaying flower head and take tiny nectar-gathering steps
    bee.crawlPhase += dt * 1.4;
    const crawlX = Math.cos(bee.crawlPhase) * 3.5;
    const crawlY = Math.sin(bee.crawlPhase * 1.3) * 2.5;

    bee.x = activeF.hx + bee.landOffX + crawlX;
    bee.y = activeF.hy + sy + bee.landOffY + crawlY;

    // Slowly turn slightly while inspecting the flower core
    bee.angle += Math.sin(time * 2.1) * 0.35 * dt;

    if (bee.modeTime >= bee.modeDur) {
      bee.lastFlower = bee.targetFlower;
      bee.mode = 'wander';
      bee.modeTime = 0;
      bee.wanderTimer = 0;
      // Gentle takeoff upward and outward
      const takeOffAng = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      bee.vx = Math.cos(takeOffAng) * 150;
      bee.vy = Math.sin(takeOffAng) * 150;
    }
  }

  // Update heading angle when airborne
  if (bee.mode !== 'landed') {
    const speed = Math.hypot(bee.vx, bee.vy);
    if (speed > 8) {
      const targetAngle = Math.atan2(bee.vy, bee.vx);
      bee.angle += shortAngleDist(bee.angle, targetAngle) * Math.min(1, 12 * dt);
    }
  }

  // ---- Record Flight Trail Points (world space) ----
  const trailMaxAge = 3.8;
  if (bee.mode !== 'landed') {
    const stepDist = Math.hypot(bee.x - bee.lastTrailX, bee.y - bee.lastTrailY);
    if (stepDist >= 7) {
      bee.trail.push({
        x: bee.x,
        y: bee.y,
        dx: bee.x - bee.lastTrailX,
        dy: bee.y - bee.lastTrailY,
        born: time,
        ring: bee.mode === 'orbit' || bee.loopTimer > 0,
      });
      bee.lastTrailX = bee.x;
      bee.lastTrailY = bee.y;
      if (bee.trail.length > 260) bee.trail.shift();
    }
  } else {
    bee.lastTrailX = bee.x;
    bee.lastTrailY = bee.y;
  }

  // Prune old trail points
  while (bee.trail.length > 0 && time - bee.trail[0].born > trailMaxAge) {
    bee.trail.shift();
  }

  // ---- 1. Render Flight Trail ----
  ctx.font = `${CELL_H - 1}px "Space Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';

  const drawnCells = new Set<number>();
  for (let i = bee.trail.length - 1; i >= 0; i--) {
    const pt = bee.trail[i];
    const sx = pt.x;
    const syPt = pt.y - sy;
    if (syPt < -40 || syPt > H + 40 || sx < -40 || sx > W + 40) continue;

    const gx = Math.round(sx / CELL_W);
    const gy = Math.round(syPt / CELL_H);
    const key = (gx + 2000) * 10000 + (gy + 2000);
    if (drawnCells.has(key)) continue;
    drawnCells.add(key);

    const age = (time - pt.born) / trailMaxAge;
    const fade = Math.pow(clamp(1 - age), 1.5);

    const ch = pt.ring
      ? i % 4 === 0
        ? '*'
        : i % 2 === 0
        ? 'o'
        : '·'
      : i % 3 === 0
      ? '·'
      : dirChar(pt.dx, pt.dy);

    ctx.globalAlpha = clamp((pt.ring ? 0.56 : 0.42) * fade);
    ctx.fillText(ch, snapX(sx), snapY(syPt));
  }

  // ---- 2. Spawn & Render Pollen Dust ----
  if (bee.mode !== 'landed' && Math.random() < 0.4) {
    const chars = ['·', '.', '*', '+'];
    bee.dust.push({
      x: bee.x - Math.cos(bee.angle) * 12 + (Math.random() - 0.5) * 10,
      y: bee.y - Math.sin(bee.angle) * 12 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 14,
      vy: 8 + Math.random() * 16,
      born: time,
      ch: chars[Math.floor(Math.random() * chars.length)],
    });
    if (bee.dust.length > 35) bee.dust.shift();
  }

  ctx.font = `10px "Space Mono", monospace`;
  for (let i = bee.dust.length - 1; i >= 0; i--) {
    const p = bee.dust[i];
    const age = time - p.born;
    if (age > 1.1) {
      bee.dust.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    ctx.globalAlpha = (1 - age / 1.1) * 0.5;
    ctx.fillText(p.ch, p.x, p.y - sy);
  }

  // ---- 3. Render the Bee Glyph ----
  drawBeeGlyph(ctx, bee.x, bee.y - sy, bee.angle, time, bee.mode === 'landed');
  ctx.globalAlpha = 1;
};
