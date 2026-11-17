// "The Fake Bank Text": a 5-minute 1950s-classroom-film cartoon (Mid-century Cartoon style), 1080x1920.
// One timeline (script.js + voices/dur.json) drives pictures, captions, foley and music.
import { PAL, setClock, shape, ink, plane, text, fit, measure, star, starPts, sparkle, rays, dashed, arrow, spline, ellipse, rect, rrect, move, xform, clamp, lerp, seg, ss, eo, eio, back, twos, TAU, paperFinish, subpath, kidney, boomerang, hash } from './engine/toon.js';
import { drawOwner, drawHand } from './engine/chars.js';
import { icon } from './engine/icons.js';
import { SCENES, LINES, BEAT, BAR, DURATION } from './script.js';

const W = 1080, H = 1920;
const COL = { ink: PAL.ink, paper: PAL.paper, accent: PAL.coral, bank: PAL.teal, bankD: PAL.tealD, bad: '#D4452F', good: '#3A9D6B' };
export const DUR = () => DURATION;

// ---------------------------------------------------------------- layout: line start times, captions, events
const LT = {}, LD = {}, SC = {};
let CUES = [], EVS = [];
export function setup(durs) {
  for (const s of SCENES) {
    SC[s.id] = { ...s, t1: s.t0 + s.d };
    const L = LINES[s.id]; let end = s.first; const gaps = L.map((l, i) => i ? l[3] : 0);
    for (const [id] of L) end += durs[id] || 2;
    end += gaps.reduce((a, b) => a + b, 0);
    const room = Math.max(0, s.d - 1.8 - end), sg = gaps.reduce((a, b) => a + b, 0) || 1;
    let t = s.t0 + s.first;
    L.forEach(([id, , cap, gap], i) => {
      if (i) t += gap + Math.min(2.4, room * gap / sg);
      LT[id] = t; LD[id] = durs[id] || 2; t += LD[id];
    });
  }
  // captions: split on '|', time by character share, hold >= 1.8 s and speech + 0.6 s
  CUES = [];
  for (const s of SCENES) LINES[s.id].forEach(([id, , cap]) => {
    const parts = cap.split('|'), n = parts.reduce((a, p) => a + p.length, 0); let t = LT[id];
    parts.forEach(p => { const d = LD[id] * p.length / n; CUES.push({ t0: t, t1: t + d, text: p, line: id }); t += d; });
  });
  CUES.sort((a, b) => a.t0 - b.t0);
  CUES.forEach((c, i) => { const nx = CUES[i + 1]; const want = Math.max(c.t1 + 0.55, c.t0 + 1.8); c.t1 = nx ? Math.min(want, nx.t0 - 0.02) : want; });
  buildEvents();
}
export const srtCues = () => CUES.map(c => ({ t0: c.t0, t1: c.t1, text: c.text }));
export const events = () => EVS;
const ev = (t, type, o = {}) => EVS.push({ t: +t.toFixed(4), type, ...o });
const L0 = id => LT[id];
const sc = id => SC[id];

// ---------------------------------------------------------------- small helpers
const pop = (t, t0, d = 0.28) => back(seg(t, t0, t0 + d), 1.9);
const bg = (ctx, col) => { ctx.fillStyle = col; ctx.fillRect(-100, -100, W + 200, H + 200); };
const T2 = t => twos(t);
const fam = { slab: '{px}px Slab', oleo: '700 {px}px Oleo', jost: '500 {px}px Jost', jostB: '600 {px}px Jost' };
function cam(ctx, cx, cy, z = 1, r = 0) { ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(r); ctx.translate(-cx, -cy); }
function floor(ctx, col, y) { shape(ctx, rect(-60, y, W + 120, H - y + 60), { fill: col, line: 0, grain: 0.3, off: [0, 0] }); ink(ctx, [[-20, y], [300, y + 2], [420, y], [760, y + 3], [W + 20, y]], 4, { seed: 5, breaks: 0.3 }); }
function motifs(ctx, t, c1, c2, seed = 0) {
  // abstract atomic-age colour plane decor
  shape(ctx, kidney(250, 420, 220, -0.3), { fill: c1, line: 0, grain: 0.3, off: [0, 0], alpha: 0.55 });
  shape(ctx, boomerang(860, 1230, 200, 0.5), { fill: c2, line: 0, grain: 0.3, off: [0, 0], alpha: 0.5 });
  for (let i = 0; i < 6; i++) sparkle(ctx, 120 + hash(i, seed, 1) * 840, 330 + hash(i, seed, 2) * 1100, 14 + hash(i, seed, 3) * 18, { fill: PAL.white, alpha: 0.7 * (0.6 + 0.4 * Math.sin(t * 3 + i)), rot: t * 0.3 });
}
function xmark(ctx, x, y, r, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  shape(ctx, ellipse(0, 0, r, r, 40), { fill: COL.bad, line: 4.5, seed: 61, grain: 0.3 });
  ink(ctx, [[-r * .42, -r * .42], [r * .42, r * .42]], r * 0.26, { color: PAL.white, taper: false, seed: 62 });
  ink(ctx, [[r * .42, -r * .42], [-r * .42, r * .42]], r * 0.26, { color: PAL.white, taper: false, seed: 63 }); ctx.restore();
}
function tick(ctx, x, y, r, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  shape(ctx, ellipse(0, 0, r, r, 40), { fill: COL.good, line: 4.5, seed: 64, grain: 0.3 });
  ink(ctx, [[-r * .5, 0], [-r * .12, r * .38], [r * .52, -r * .4]], r * 0.28, { color: PAL.white, taper: false, seed: 65 }); ctx.restore();
}
function card(ctx, x, y, w, h, fill = PAL.white, seed = 3, r = 20) { shape(ctx, rrect(x, y, w, h, r), { fill, line: 4, seed, grain: 0.2, breaks: 0.1, off: [7, 6] }); }
function tagCard(ctx, t, t0, str, cx, y, o = {}) {
  const k = pop(t, t0); if (k <= 0) return;
  const f = fit(ctx, str, fam.jost, o.px || 44, o.maxW || 800, 2, 28);
  const w = Math.max(...f.lines.map(l => measure(ctx, l, f.font))) + 120, h = 36 + f.lines.length * f.px * 1.22;
  ctx.save(); ctx.translate(cx, y + h / 2); ctx.scale(k, k); ctx.translate(-cx, -(y + h / 2));
  shape(ctx, rrect(cx - w / 2, y, w, h, 16), { fill: COL.paper, line: 4, seed: 710, grain: 0.15, off: [6, 5] });
  star(ctx, cx - w / 2 + 40, y + h / 2, 18, { n: 8, inner: 0.42, fill: o.star || COL.accent, off: [0, 0], rot: t * 0.6 });
  f.lines.forEach((l, i) => text(ctx, l, cx - w / 2 + 76, y + 18 + f.px * 0.92 + i * f.px * 1.22, { font: f.font, fill: COL.ink }));
  ctx.restore();
}
function header(ctx, t, s, label, title, color) {
  const k = eo(seg(T2(t), s.t0 + 0.05, s.t0 + 0.45)); if (k <= 0) return;
  ctx.save(); ctx.translate(-(1 - k) * 700, 0);
  shape(ctx, ellipse(120, 150, 62, 62, 40), { fill: COL.ink, line: 0, seed: 700, grain: 0.1, off: [0, 0] });
  text(ctx, String(s.n), 120, 176, { font: '72px Slab', fill: COL.paper, align: 'center' });
  text(ctx, label, 214, 118, { font: '600 26px Jost', fill: COL.ink, track: 6 });
  const f = fit(ctx, title, fam.slab, 76, 780, 1, 44);
  text(ctx, f.lines[0], 210, 196, { font: f.font, fill: COL.ink, plate: color || PAL.white, off: [5, 5] });
  ctx.restore();
}
function bubble(ctx, x, y, w, h, fill, seed, tail = 'left') {
  const body = rrect(x, y, w, h, 34);
  shape(ctx, body, { fill, line: 3.4, seed, grain: 0.1, breaks: 0.05, off: [4, 4] });
  const tp = tail === 'left' ? [[x + 6, y + h - 40], [x - 26, y + h + 4], [x + 56, y + h - 6]] : [[x + w - 6, y + h - 40], [x + w + 26, y + h + 4], [x + w - 56, y + h - 6]];
  shape(ctx, tp, { fill, line: 0, off: [4, 4], grain: 0 });
}
// phone: body centred at (cx,cy); content(ctx) draws in screen-local coords (0,0 = screen centre, 332 x 680)
function phone(ctx, cx, cy, s, content, o = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  shape(ctx, rrect(-190, -380, 380, 760, 48), { fill: o.body || '#3E3B44', line: 4.5, seed: 21, grain: 0.15, breaks: 0.05, off: [8, 6] });
  const scr = rrect(-166, -340, 332, 680, 24);
  shape(ctx, scr, { fill: o.screen || PAL.white, line: 0, off: [0, 0], grain: 0.1 });
  ctx.save(); ctx.beginPath(); scr.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip();
  if (content) content(ctx);
  ctx.restore();
  shape(ctx, rrect(-34, -362, 68, 12, 6), { fill: '#1d1b20', line: 0, off: [0, 0], grain: 0 });
  ctx.restore();
}
function june(ctx, t, x, y, s, o = {}) {
  const k = Math.floor(t * 12);
  const blink = (k % 38 === 0) || (k % 38 === 1) ? 1 : 0;
  drawOwner(ctx, { x, y, s, dir: o.dir ?? 1, view: o.view || 'q', face: o.face || 'happy', blink, armF: o.armF, armB: o.armB, handF: o.handF || 'open', handB: o.handB || 'open', prop: o.prop, look: o.look }, t);
}

// ================================================================= scenes
function sceneHook(ctx, t, s) {
  const u = t - s.t0, c = cam;
  bg(ctx, PAL.mustardL);
  rays(ctx, W / 2, 880, 30, 1700, PAL.mustard, { rot: u * 0.05, alpha: 0.4 });
  motifs(ctx, t, PAL.tealL, PAL.coralL, 3);
  ctx.save(); const z = lerp(1.0, 1.06, ss(u / 9)); cam(ctx, W / 2, 900, z);
  const buzzing = u > 0.7 && u < 1.9, sh = buzzing ? Math.sin(u * 80) * 7 : 0;
  const shrink = ss(seg(u, 9.2, 11.6));
  const msgK = pop(t, s.t0 + 1.2, 0.35);
  phone(ctx, 540 + sh, lerp(900, 880, shrink), lerp(1.7, 1.3, shrink), g => {
    shape(g, rect(-170, -344, 340, 120), { fill: PAL.tealL, line: 0, off: [0, 0], grain: 0.1 });
    text(g, 'Messages', -150, -280, { font: '600 36px Jost', fill: COL.ink });
    icon(g, 'leaf', 120, -285, 64, { main: COL.bank, dark: COL.bankD });
    g.save(); g.translate(0, -140); g.scale(msgK, msgK);
    bubble(g, -150, -90, 300, 380, PAL.paperD, 31, 'left');
    text(g, 'Maple Trust', -130, -45, { font: '700 36px Jost', fill: COL.bankD });
    ['Unusual activity was', 'found on your account.', 'Your card will be', 'blocked in 10 minutes.', 'Verify now:'].forEach((l, i) => text(g, l, -130, 8 + i * 44, { font: '500 27px Jost', fill: COL.ink }));
    shape(g, rrect(-130, 230, 262, 40, 10), { fill: PAL.blueL, line: 0, off: [3, 3], grain: 0.1 });
    text(g, 'rnapletrust-secure.example', -122, 258, { font: '500 20px Jost', fill: '#1d3c78' });
    g.restore();
    for (let i = 0; i < 3; i++) shape(g, ellipse(-120 + i * 26, 300, 8, 8, 12), { fill: PAL.paperDD, line: 0, off: [0, 0], grain: 0 });
  }, { rot: buzzing ? Math.sin(u * 70) * 0.04 : 0 });
  if (buzzing) for (let i = 0; i < 3; i++) { const a = 1 - i * 0.28; ink(ctx, [[130 - i * 22 + 540 + 270, 520 + i * 40], [200 + 540 + 270 - i * 22, 560 + i * 40]], 6, { color: COL.ink, seed: 80 + i, taper: false, alpha: a * 0.7 }); ink(ctx, [[540 - 270 - 130 + i * 22, 520 + i * 40], [540 - 270 - 200 + i * 22, 560 + i * 40]], 6, { color: COL.ink, seed: 90 + i, taper: false, alpha: a * 0.7 }); }
  ctx.restore();
  // the stamp that tells the truth
  const k = pop(t, L0('hook2'), 0.3);
  if (k > 0) {
    ctx.save(); ctx.translate(540, 1230); ctx.rotate(-0.1); ctx.scale(k, k);
    shape(ctx, rrect(-420, -96, 840, 192, 20), { fill: COL.bad, line: 6, seed: 41, grain: 0.35, breaks: 0.15, off: [8, 7] });
    text(ctx, 'NOT FROM YOUR BANK', 0, 30, { font: '88px Slab', fill: PAL.white, align: 'center', plate: COL.ink, off: [4, 4], maxW: 780 });
    ctx.restore();
  }
}

function sceneTitle(ctx, t, s) {
  const u = t - s.t0;
  bg(ctx, PAL.tealL);
  rays(ctx, W / 2, 640, 28, 1700, PAL.teal, { rot: -u * 0.06, alpha: 0.35 });
  motifs(ctx, t, PAL.mustardL, PAL.pink, 8);
  const k0 = pop(t, s.t0 + 0.3, 0.4);
  ctx.save(); ctx.translate(540, 360); ctx.scale(k0, k0);
  text(ctx, 'Safety Classroom  ·  Lesson One', 0, 0, { font: fam.oleo.replace('{px}', 54), fill: COL.ink, align: 'center', plate: PAL.white, off: [3, 3] });
  ctx.restore();
  const k1 = pop(t, s.t0 + 0.7, 0.45);
  ctx.save(); ctx.translate(540, 640); ctx.scale(k1, k1);
  text(ctx, 'THE FAKE', 0, -40, { font: fam.slab.replace('{px}', 168), fill: COL.ink, align: 'center', plate: COL.accent, off: [8, 8], maxW: 960 });
  text(ctx, 'BANK TEXT', 0, 150, { font: fam.slab.replace('{px}', 168), fill: COL.ink, align: 'center', plate: COL.accent, off: [8, 8], maxW: 960 });
  ctx.restore();
  // medallion "5 tricks, 5 answers"
  const k2 = pop(t, L0('title3') - 0.1, 0.4);
  if (k2 > 0) { ctx.save(); ctx.translate(820, 1010); ctx.scale(k2, k2); ctx.rotate(0.12);
    star(ctx, 0, 0, 170, { n: 16, inner: 0.84, fill: PAL.white, off: [0, 0], rot: u * 0.2 });
    shape(ctx, ellipse(0, 0, 140, 140, 60), { fill: PAL.mustard, line: 5, seed: 33, grain: 0.35 });
    text(ctx, '5 TRICKS', 0, -10, { font: '46px Slab', fill: COL.ink, align: 'center', plate: PAL.white, off: [3, 3] });
    text(ctx, '5 ANSWERS', 0, 50, { font: '46px Slab', fill: COL.ink, align: 'center', plate: PAL.white, off: [3, 3], maxW: 240 });
    ctx.restore(); }
  floor(ctx, PAL.tealD, 1620);
  const wave = Math.sin(T2(t) * 5) * 0.3;
  june(ctx, t, 330, 1700, 1.25, { armF: { a1: -0.9 + wave * .5, a2: -1.7 + wave }, handF: 'open', face: 'happy' });
}

// ---- trick scenes: shared frame
const TRICK = {
  1: { bg: PAL.mustardL, c1: PAL.tealL, c2: PAL.pink, title: 'THE BAIT', plate: PAL.mustard },
  2: { bg: PAL.coralL, c1: PAL.mustardL, c2: PAL.tealL, title: 'THE PANIC', plate: PAL.mustardL },
  3: { bg: PAL.blueL, c1: PAL.mustardL, c2: PAL.pink, title: 'THE LINK', plate: PAL.white },
  4: { bg: PAL.avocadoL, c1: PAL.mustardL, c2: PAL.tealL, title: 'THE COPYCAT', plate: PAL.mustardL },
  5: { bg: PAL.pink, c1: PAL.tealL, c2: PAL.mustardL, title: 'THE CODE', plate: PAL.white },
};
function sceneTrick(ctx, t, s) {
  const K = TRICK[s.n], u = t - s.t0;
  bg(ctx, K.bg); motifs(ctx, t, K.c1, K.c2, s.n);
  ({ 1: bait, 2: panic, 3: link, 4: copycat, 5: code })[s.n](ctx, t, s, u);
  header(ctx, t, s, `TRICK ${s.n} OF 5`, K.title, K.plate);
}

function bait(ctx, t, s, u) {
  const slow = lerp(1, 1.04, ss(u / 24));
  ctx.save(); cam(ctx, 540, 1000, slow);
  phone(ctx, 390, 1020, 1.35, g => {
    shape(g, rect(-170, -344, 340, 110), { fill: PAL.tealL, line: 0, off: [0, 0], grain: 0.1 });
    text(g, 'Messages', -150, -278, { font: '600 36px Jost', fill: COL.ink });
    const rows = [['Maple Trust', 'Unusual activity on your…', true], ['Mum', 'Dinner at 7?', false], ['Parcel Hub', 'Your parcel is on its way', false]];
    rows.forEach((r, i) => { const y = -170 + i * 150, hl = r[2] && t > L0('t1b') + 0.4;
      shape(g, rect(-166, y - 66, 332, 140), { fill: hl ? PAL.mustardL : PAL.white, line: 0, off: [0, 0], grain: 0.05 });
      shape(g, ellipse(-120, y + 4, 34, 34, 20), { fill: r[2] ? COL.bank : [PAL.pink, PAL.blueL, PAL.mustardL][i], line: 3, seed: 50 + i, grain: 0.2 });
      text(g, r[0], -70, y - 4, { font: '700 30px Jost', fill: COL.ink }); text(g, r[1], -70, y + 38, { font: '500 24px Jost', fill: PAL.inkSoft, maxW: 220 }); });
  });
  // callout: the sender name is just letters
  const t0 = L0('t1c') + 0.3;
  const cx = 780, cy = 560, r = 230;
  const k = back(seg(t, t0, t0 + 0.35), 1.5);
  if (k > 0) {
    dashed(ctx, [[cx - 170, cy + 150], [470, 790]], 4, 14, 10, -t * 40, COL.ink, clamp(k));
    shape(ctx, ellipse(cx, cy, r * k + 16, r * k + 16, 72), { fill: COL.paper, line: 4.5, seed: 720, grain: 0.15, breaks: 0.05 });
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, TAU); ctx.clip(); ctx.fillStyle = PAL.white; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.translate(cx, cy); ctx.scale(k, k);
    icon(ctx, 'leaf', 0, -100, 130, { main: COL.bank, dark: COL.bankD });
    text(ctx, 'Maple Trust', 0, 60, { font: '700 54px Jost', fill: COL.bankD, align: 'center' });
    const typed = Math.floor(seg(t, L0('t1e'), L0('t1e') + 1.0) * 11);
    text(ctx, 'sender name: ' + 'anything'.slice(0, Math.min(8, typed)), 0, 130, { font: '500 28px Jost', fill: PAL.inkSoft, align: 'center' });
    ctx.restore(); ink(ctx, ellipse(cx, cy, r * k, r * k, 72), 4, { closed: true, seed: 721, breaks: 0.1 });
  }
  ctx.restore();
  tagCard(ctx, t, L0('t1e') + 0.9, 'Anyone can type any name', 540, 1500, { px: 46 });
}

function panic(ctx, t, s, u) {
  const sec = Math.max(0, 600 - (t - L0('t2c')) * 38), shown = t < L0('t2c') ? 600 : sec;
  const spin = t < L0('t2c') ? 0 : (t - L0('t2c')) * 5;
  // clock face
  ctx.save(); ctx.translate(540, 820); const shake = t > L0('t2d') ? Math.sin(T2(t) * 40) * 3 : 0; ctx.translate(shake, 0);
  star(ctx, 0, 0, 420, { n: 24, inner: 0.82, fill: PAL.white, off: [0, 0], rot: u * 0.1 });
  shape(ctx, ellipse(0, 0, 330, 330, 72), { fill: PAL.white, line: 8, seed: 71, grain: 0.2 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink(ctx, [[Math.cos(a) * 270, Math.sin(a) * 270], [Math.cos(a) * 310, Math.sin(a) * 310]], 9, { taper: false, seed: 72 + i }); }
  const ma = -Math.PI / 2 + spin, ha = -Math.PI / 2 + spin / 12;
  ink(ctx, [[0, 0], [Math.cos(ha) * 150, Math.sin(ha) * 150]], 16, { seed: 90 }); ink(ctx, [[0, 0], [Math.cos(ma) * 250, Math.sin(ma) * 250]], 10, { seed: 91, color: COL.bad });
  shape(ctx, ellipse(0, 0, 20, 20, 16), { fill: COL.ink, line: 0, grain: 0 });
  // alarm bells
  [-1, 1].forEach((d, i) => shape(ctx, ellipse(d * 230, -290, 70, 54, 24, 0, TAU, d * 0.6), { fill: COL.bad, line: 5, seed: 75 + i, grain: 0.3 }));
  ctx.restore();
  // the countdown card
  const mm = Math.floor(shown / 60), ss2 = Math.floor(shown % 60);
  card(ctx, 290, 1230, 500, 170, PAL.ink, 79, 24);
  text(ctx, `${String(mm).padStart(2, '0')}:${String(ss2).padStart(2, '0')}`, 540, 1355, { font: '130px Slab', fill: '#FF8A6A', align: 'center' });
  // warning banner
  const kb = eio(seg(t, L0('t2c') - 0.2, L0('t2c') + 0.35));
  if (kb > 0) { ctx.save(); ctx.translate(540, 1000); ctx.rotate(-0.07); ctx.beginPath(); ctx.rect(540 - 1100 * kb, -90, 1100 * kb * 2, 180); ctx.clip();
    shape(ctx, rect(-640, -86, 1280, 172), { fill: COL.bad, line: 6, seed: 81, grain: 0.35, breaks: 0.1, off: [8, 7] });
    text(ctx, 'ACT IN 10 MINUTES!', 0, 28, { font: '92px Slab', fill: PAL.white, align: 'center', plate: COL.ink, off: [4, 4], maxW: 960 });
    ctx.restore(); }
  tagCard(ctx, t, L0('t2e') + 0.3, 'A deadline stops you thinking', 540, 1520, { px: 44 });
}

function link(ctx, t, s, u) {
  ctx.save(); cam(ctx, 540, 900, lerp(1, 1.05, ss(u / 24)));
  const t0 = L0('t3c');
  phone(ctx, 540, 740, 1.12, g => {
    shape(g, rect(-170, -344, 340, 96), { fill: PAL.tealL, line: 0, off: [0, 0], grain: 0.1 });
    text(g, 'Maple Trust', -140, -283, { font: '700 36px Jost', fill: COL.bankD });
    bubble(g, -150, -170, 300, 250, PAL.paperD, 32, 'left');
    ['To fix this, tap', 'the link below:'].forEach((l, i) => text(g, l, -130, -112 + i * 44, { font: '500 31px Jost', fill: COL.ink }));
    shape(g, rrect(-134, -10, 268, 56, 12), { fill: PAL.blueL, line: 0, off: [3, 3], grain: 0.1 });
    text(g, 'rnapletrust.example', -126, 28, { font: '600 25px Jost', fill: '#1d3c78' });
  });
  // the finger hovers, then stops short of the link
  const hk = ss(seg(t, L0('t3b') + 0.6, L0('t3b') + 1.8)), hx = lerp(900, 640, hk), hy = lerp(1300, 775 + Math.sin(t * 6) * 6 * seg(t, t0, t0 + 2), hk);
  drawHand(ctx, hx, hy, Math.PI * 1.08, 'point', 1, 3.0);
  ctx.restore();
  // magnifier call-out with the two addresses
  const k = back(seg(t, t0 + 0.8, t0 + 1.2), 1.5);
  if (k > 0) {
    ctx.save(); ctx.translate(540, 1420); ctx.scale(k, k); ctx.translate(-540, -1420);
    card(ctx, 90, 1250, 900, 340, PAL.white, 722, 30);
    tick(ctx, 150, 1330, 34); text(ctx, 'mapletrust.example', 210, 1348, { font: '600 54px Jost', fill: COL.ink });
    xmark(ctx, 150, 1495, 34); text(ctx, 'rnapletrust.example', 210, 1513, { font: '600 54px Jost', fill: COL.ink });
    const wd = measure(ctx, 'rn', '600 54px Jost'), hl = seg(t, L0('t3d'), L0('t3d') + 0.5);
    if (hl > 0) ink(ctx, ellipse(210 + wd / 2, 1498, wd / 2 + 16, 44, 40), 7, { closed: true, color: COL.bad, upto: hl, seed: 723 });
    ctx.restore();
  }
}

function copycat(ctx, t, s, u) {
  ctx.save(); cam(ctx, 540, 960, lerp(1, 1.04, ss(u / 24)));
  // the fake page
  card(ctx, 140, 380, 620, 900, PAL.white, 41, 30);
  shape(ctx, rrect(140, 380, 620, 150, 30), { fill: COL.bank, line: 4, seed: 42, grain: 0.3, off: [7, 6] });
  icon(ctx, 'leaf', 240, 455, 100, { main: PAL.white, dark: PAL.tealL, light: PAL.white });
  text(ctx, 'Maple Trust', 310, 478, { font: '700 54px Jost', fill: PAL.white });
  const kt = seg(t, L0('t4c'), L0('t4c') + 3);
  ['Username', 'Password'].forEach((l, i) => { const y = 590 + i * 190;
    text(ctx, l, 190, y + 30, { font: '600 34px Jost', fill: PAL.inkSoft });
    shape(ctx, rrect(190, y + 50, 520, 80, 14), { fill: PAL.paperD, line: 3.4, seed: 43 + i, grain: 0.1, off: [4, 4] });
    const n = Math.floor(clamp(kt * 2 - i) * 9); for (let j = 0; j < n; j++) shape(ctx, ellipse(232 + j * 44, y + 90, 13, 13, 12), { fill: COL.ink, line: 0, off: [0, 0], grain: 0 });
  });
  shape(ctx, rrect(190, 980, 520, 100, 16), { fill: COL.bank, line: 4, seed: 46, grain: 0.3, off: [6, 5] });
  text(ctx, 'LOG IN', 450, 1048, { font: '52px Slab', fill: PAL.white, align: 'center' });
  // the costume: a mask pinned on the page, then lifted
  const km = back(seg(t, L0('t4d') - 0.2, L0('t4d') + 0.35), 1.6), lift = ss(seg(t, L0('t4d') + 1.0, L0('t4d') + 1.7));
  if (km > 0) { ctx.save(); ctx.translate(690, 440 - lift * 60); ctx.rotate(0.35 - lift * 0.5); ctx.scale(km, km);
    shape(ctx, spline([[-140, -30], [-60, -62], [0, -40], [60, -62], [140, -30], [130, 40], [60, 60], [0, 30], [-60, 60], [-130, 40]], true, 8), { fill: PAL.ink, line: 4, seed: 47, grain: 0.15, off: [4, 4] });
    shape(ctx, ellipse(-62, 0, 34, 22, 20), { fill: PAL.mustardL, line: 0, off: [0, 0], grain: 0 }); shape(ctx, ellipse(62, 0, 34, 22, 20), { fill: PAL.mustardL, line: 0, off: [0, 0], grain: 0 });
    ctx.restore(); }
  // the sack: what you type travels to the thief
  const ks = back(seg(t, L0('t4e'), L0('t4e') + 0.4), 1.6);
  if (ks > 0) { ctx.save(); ctx.translate(860, 1380); ctx.scale(ks, ks);
    shape(ctx, spline([[-120, 160], [-150, 40], [-70, -60], [-40, -120], [40, -120], [70, -60], [150, 40], [120, 160]], true, 8), { fill: PAL.kraft, line: 5, seed: 48, grain: 0.4, shade: [{ pts: [[20, -140], [200, -140], [200, 200], [40, 200]], color: PAL.kraftD, alpha: 0.5 }] });
    ink(ctx, [[-44, -112], [44, -112]], 12, { seed: 49, color: PAL.brown });
    text(ctx, '$', 0, 70, { font: '130px Slab', fill: PAL.ink, align: 'center', plate: PAL.mustard, off: [4, 4] });
    ctx.restore();
    const f = seg(t, L0('t4e') + 0.3, L0('t4e') + 2.4);
    arrow(ctx, [700, 1000], [790, 1230], { u: ss(f), bend: -0.35, fill: COL.bad, w: 8 });
    for (let j = 0; j < 7; j++) { const p = ((t * 0.7 + j / 7) % 1) * ss(seg(t, L0('t4e') + 0.4, L0('t4e') + 1)); if (p > 0) shape(ctx, ellipse(lerp(700, 850, p), lerp(1000, 1260, p) + Math.sin(p * 6) * 40, 11, 11, 10), { fill: COL.ink, line: 0, off: [0, 0], grain: 0 }); }
  }
  ctx.restore();
}

function code(ctx, t, s, u) {
  ctx.save(); cam(ctx, 540, 960, lerp(1, 1.04, ss(u / 24)));
  // victim phone with the real bank code
  phone(ctx, 290, 780, 1.0, g => {
    shape(g, rect(-170, -344, 340, 90), { fill: PAL.tealL, line: 0, off: [0, 0], grain: 0.1 });
    text(g, 'Maple Trust', -140, -285, { font: '700 36px Jost', fill: COL.bankD });
    const kc = pop(t, L0('t5c'), 0.35); g.save(); g.scale(kc, kc);
    bubble(g, -150, -190, 300, 280, PAL.paperD, 51, 'left');
    text(g, 'Your one-time code:', -130, -130, { font: '500 29px Jost', fill: COL.ink });
    text(g, '4 8 1 7 2 9', -130, -60, { font: '66px Slab', fill: COL.ink, plate: PAL.mustard, off: [4, 4], maxW: 260 });
    text(g, 'Never share it.', -130, 20, { font: '600 28px Jost', fill: COL.bad });
    g.restore();
  });
  // the thief asks
  const kq = pop(t, L0('t5d'), 0.35);
  phone(ctx, 800, 1060, 0.85, g => {
    shape(g, rect(-170, -344, 340, 90), { fill: PAL.pinkD, line: 0, off: [0, 0], grain: 0.1 });
    text(g, 'Unknown number', -140, -285, { font: '700 34px Jost', fill: COL.ink });
    g.save(); g.scale(kq, kq); bubble(g, -150, -190, 300, 230, PAL.paperD, 52, 'right');
    ['Please read me', 'the code you just', 'received.'].forEach((l, i) => text(g, l, -130, -126 + i * 48, { font: '500 31px Jost', fill: COL.ink })); g.restore();
  });
  // the door and the key
  const door = ss(seg(t, L0('t5e') + 1.8, L0('t5e') + 2.6));
  ctx.save(); ctx.translate(300, 1380);
  shape(ctx, rect(-130, -190, 260, 380), { fill: PAL.brownL, line: 5, seed: 53, grain: 0.35, shade: [{ pts: [[0, -190], [160, -190], [160, 190], [0, 190]], color: PAL.brown, alpha: 0.35 }] });
  if (door > 0) { shape(ctx, [[-130, -190], [-130 + 260 * (1 - door * 0.8), -190 - 20 * door], [-130 + 260 * (1 - door * 0.8), 190 + 20 * door], [-130, 190]], { fill: PAL.brownL, line: 5, seed: 54, grain: 0.35 }); shape(ctx, rect(-110, -170, 40 + 190 * door, 340), { fill: PAL.mustardL, line: 0, off: [0, 0], alpha: door * 0.9 }); }
  shape(ctx, ellipse(70, 10, 14, 14, 12), { fill: PAL.mustard, line: 3, seed: 55, grain: 0.1 });
  ctx.restore();
  const kk = ss(seg(t, L0('t5e'), L0('t5e') + 1.7));
  if (t > L0('t5e')) { ctx.save(); ctx.translate(lerp(560, 380, kk), lerp(980, 1390, kk)); ctx.rotate(lerp(-0.4, 0, kk)); icon(ctx, 'key', 0, 0, 180, { main: PAL.mustard, dark: PAL.mustardD }); ctx.restore(); arrow(ctx, [470, 830], [420, 1240], { u: kk, bend: -0.3, fill: COL.bad, w: 8 }); }
  ctx.restore();
  tagCard(ctx, t, L0('t5e') + 2.6, 'A code is a key', 540, 1560, { px: 48 });
}

// ---- the rewind
function sceneRewind(ctx, t, s) {
  const u = t - s.t0;
  bg(ctx, PAL.paperD);
  if (u < 1.0) return;
  const n = Math.max(1, 5 - Math.floor(seg(t, s.t0 + 1.6, s.t0 + 4.4) * 5));
  const R = 250, k = pop(t, s.t0 + 1.0, 0.4);
  ctx.save(); ctx.translate(540, 860); ctx.scale(k, k);
  star(ctx, 0, 0, R * 1.2, { n: 16, inner: 0.84, fill: PAL.white, off: [0, 0], rot: -u * 1.2 });
  shape(ctx, ellipse(0, 0, R, R, 72), { fill: PAL.mustard, line: 6, seed: 301, grain: 0.35 });
  text(ctx, String(n), 0, R * 0.38, { font: `${Math.round(R * 1.15)}px Slab`, fill: COL.ink, align: 'center', plate: PAL.white, off: [6, 6] });
  ctx.restore();
  // rewind arrows
  for (let i = 0; i < 3; i++) { const x = 540 - 150 + i * 150, a = 0.5 + 0.5 * Math.sin(u * 8 - i * 1.2); ctx.save(); ctx.globalAlpha = a; shape(ctx, [[x + 52, 1250], [x - 42, 1310], [x + 52, 1370]], { fill: COL.accent, line: 5, seed: 302 + i, grain: 0.3 }); ctx.restore(); }
  text(ctx, 'REWIND', 540, 1500, { font: '110px Slab', fill: COL.ink, align: 'center', plate: PAL.white, off: [5, 5] });
}

// ---- rule scenes: DON'T / DO split frame
const RULE = {
  1: { bg: PAL.paperD, title: 'PAUSE' }, 2: { bg: PAL.paperD, title: "DON'T TAP" }, 3: { bg: PAL.paperD, title: 'KEEP THE CODE' }, 4: { bg: PAL.paperD, title: 'CALL BACK' }, 5: { bg: PAL.paperD, title: 'LOCK THE DOOR' },
};
function panel(ctx, x, y, w, h, fill, label, labelCol, k, fn) {
  if (k <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.translate(0, (1 - k) * 60); ctx.globalAlpha = Math.min(1, k * 2);
  shape(ctx, rect(x, y, w, h), { fill, line: 0, grain: 0.3, off: [0, 0] });
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); fn(ctx, w, h); ctx.restore();
  ctx.restore();
  ink(ctx, rrect(x, y, w, h, 6), 5, { closed: true, seed: 91, breaks: 0.1 });
  shape(ctx, rrect(x + 20, y + 18, 220, 76, 14), { fill: labelCol, line: 4, seed: 92, grain: 0.3, off: [5, 5] });
  text(ctx, label, x + 130, y + 76, { font: '52px Slab', fill: PAL.white, align: 'center', plate: COL.ink, off: [3, 3] });
}
function sceneRule(ctx, t, s) {
  const u = t - s.t0, R = RULE[s.n];
  bg(ctx, R.bg);
  const kDont = eio(seg(T2(t), s.t0 + 0.5, s.t0 + 0.9));
  const dt = ({ 1: 'r1b', 2: 'r2b', 3: 'r3b', 4: 'r4b', 5: 'r5b' })[s.n], dd = ({ 1: 'r1c', 2: 'r2c', 3: 'r3c', 4: 'r4c', 5: 'r5c' })[s.n];
  const kDo = eio(seg(T2(t), L0(dd) - 0.4, L0(dd) - 0.05));
  const PW = 960, PH = 640, PX = 60;
  panel(ctx, PX, 300, PW, PH, PAL.coralL, "DON'T", COL.bad, kDont, (g) => DONT[s.n](g, t, s, L0(dt)));
  panel(ctx, PX, 990, PW, PH, PAL.tealL, 'DO', COL.good, kDo, (g) => DO[s.n](g, t, s, L0(dd)));
  header(ctx, t, s, `ANSWER ${s.n} OF 5`, R.title, PAL.mustardL);
}
// panel contents are drawn around the panel centre (0,0); size 960x640
const DONT = {
  1: (g, t, s, t0) => { // rushing: shaking phone, countdown
    const sh = Math.sin(t * 60) * 5 * (t > t0 ? 1 : 0.3);
    phone(g, -150 + sh, 20, 0.62, p => { text(p, '09:58', 0, -120, { font: '84px Slab', fill: COL.bad, align: 'center' }); text(p, 'ACT NOW!', 0, -20, { font: '50px Slab', fill: COL.ink, align: 'center' }); });
    drawHand(g, 40 + sh, 180, Math.PI * 1.05, 'grip', 1, 3.0);
    for (let i = 0; i < 4; i++) ink(g, [[200, -100 + i * 60], [330 - (i % 2) * 40, -100 + i * 60]], 7, { color: COL.ink, taper: false, seed: 100 + i, alpha: 0.6 });
    xmark(g, 300, 170, 70, pop(t, t0 + 1.5, 0.3));
  },
  2: (g, t, s, t0) => {
    phone(g, -190, 20, 0.62, p => { bubble(p, -150, -190, 300, 230, PAL.paperD, 32, 'left'); text(p, 'Tap the link:', -130, -130, { font: '500 30px Jost', fill: COL.ink }); shape(p, rrect(-134, -90, 268, 56, 12), { fill: PAL.blueL, line: 0, off: [3, 3], grain: 0.1 }); text(p, 'rnapletrust.example', -126, -52, { font: '600 24px Jost', fill: '#1d3c78' }); });
    const k = 0.5 + 0.5 * Math.sin(t * 7); drawHand(g, 40, 90 + k * 14, Math.PI * 1.05, 'point', 1, 3.2);
    xmark(g, 240, -20, 110, pop(t, t0 + 1.2, 0.3));
  },
  3: (g, t, s, t0) => { // reading the code out loud
    shape(g, ellipse(-260, 40, 60, 70, 24), { fill: PAL.skin, line: 4, seed: 110, grain: 0.2 });
    shape(g, spline([[-210, 40], [-120, 0], [-100, 80], [-210, 85]], true, 6), { fill: PAL.skin, line: 0, off: [0, 0], grain: 0 });
    const k = pop(t, t0 + 0.6, 0.35);
    g.save(); g.scale(k, k); bubble(g, -120, -190, 420, 150, PAL.white, 111, 'left'); text(g, '4 8 1 7 2 9 …', -100, -88, { font: '84px Slab', fill: COL.ink, maxW: 380 }); g.restore();
    phone(g, 330, 70, 0.4, p => text(p, 'thief', 0, 0, { font: '120px Slab', fill: COL.bad, align: 'center' }));
    xmark(g, 120, 180, 76, pop(t, t0 + 1.3, 0.3));
  },
  4: (g, t, s, t0) => { // dialling the number from the message
    phone(g, -220, 10, 0.62, p => { bubble(p, -150, -190, 300, 240, PAL.paperD, 32, 'left'); text(p, 'Call us now:', -130, -130, { font: '500 30px Jost', fill: COL.ink }); text(p, '555-0143', -130, -70, { font: '58px Slab', fill: COL.ink }); });
    arrow(g, [-70, -40], [120, 0], { u: seg(t, t0 + 0.4, t0 + 1.2), fill: COL.bad });
    shape(g, rrect(130, -120, 250, 280, 24), { fill: PAL.white, line: 5, seed: 113, grain: 0.1 });
    for (let i = 0; i < 9; i++) shape(g, ellipse(172 + (i % 3) * 78, -70 + Math.floor(i / 3) * 76, 28, 28, 14), { fill: PAL.paperD, line: 3, seed: 114 + i, grain: 0.1 });
    xmark(g, 340, 150, 70, pop(t, t0 + 1.4, 0.3));
  },
  5: (g, t, s, t0) => { // one weak lock
    lockDoor(g, 0, 0, 1, 1);
    drawHand(g, 330, 110, Math.PI * 1.0, 'grip', 1, 3.0); icon(g, 'key', 235, 60, 110, { main: PAL.mustard, dark: PAL.mustardD });
    text(g, 'password only', 0, 230, { font: '600 40px Jost', fill: COL.ink, align: 'center' });
    xmark(g, -260, -150, 66, pop(t, t0 + 1.0, 0.3));
  },
};
function lockDoor(g, x, y, locks, open) {
  g.save(); g.translate(x, y);
  shape(g, rect(-110, -190, 220, 380), { fill: PAL.brownL, line: 5, seed: 120, grain: 0.35, shade: [{ pts: [[0, -190], [160, -190], [160, 190], [0, 190]], color: PAL.brown, alpha: 0.35 }] });
  for (let i = 0; i < locks; i++) { const ly = locks === 1 ? 10 : -50 + i * 100; shape(g, rrect(40, ly - 24, 56, 48, 8), { fill: PAL.mustard, line: 3.5, seed: 121 + i, grain: 0.2 }); ink(g, spline([[52, ly - 24], [52, ly - 46], [84, ly - 46], [84, ly - 24]], false, 6), 6, { seed: 125 + i, taper: false }); }
  g.restore();
}
const DO = {
  1: (g, t, s, t0) => { // breathe: phone face-down on table, breath puffs, thirty-second arc
    shape(g, rect(-480, 150, 960, 40), { fill: PAL.kraft, line: 0, off: [0, 0], grain: 0.4 });
    shape(g, rrect(-270, 100, 210, 52, 14), { fill: '#3E3B44', line: 4, seed: 130, grain: 0.15 });
    june(g, t, 250, 190, 0.62, { face: 'happy', armF: { a1: 1.2, a2: 1.6 } });
    for (let i = 0; i < 4; i++) { const p = ((t * 0.5 + i / 4) % 1); shape(g, ellipse(120 - p * 150, -60 - p * 40, 18 + p * 40, 14 + p * 28, 20), { fill: PAL.white, line: 0, off: [0, 0], alpha: (1 - p) * 0.9, grain: 0 }); }
    const k = pop(t, t0 + 1.2, 0.35); g.save(); g.translate(-230, -90); g.scale(k, k); shape(g, ellipse(0, 0, 90, 90, 40), { fill: PAL.white, line: 6, seed: 131, grain: 0.2 });
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 70, -Math.PI / 2, -Math.PI / 2 + TAU * clamp((t - t0 - 1.2) / 3), false); g.closePath(); g.fillStyle = PAL.mustard; g.fill();
    text(g, '30', 0, 20, { font: '56px Slab', fill: COL.ink, align: 'center' }); g.restore();
    tick(g, 380, -170, 66, pop(t, t0 + 2.0, 0.3));
  },
  2: (g, t, s, t0) => { // open the app yourself
    phone(g, -210, 10, 0.62, p => {
      shape(p, rect(-166, -340, 332, 680), { fill: PAL.blueL, line: 0, off: [0, 0] });
      for (let i = 0; i < 9; i++) { const cx = -100 + (i % 3) * 100, cy = -200 + Math.floor(i / 3) * 120; const bank = i === 4;
        shape(p, rrect(cx - 38, cy - 38, 76, 76, 18), { fill: bank ? COL.bank : [PAL.pink, PAL.mustardL, PAL.avocadoL][i % 3], line: 3.5, seed: 140 + i, grain: 0.2 }); if (bank) icon(p, 'leaf', cx, cy, 52, { main: PAL.white, dark: PAL.tealL }); }
    });
    const k = seg(t, t0 + 0.6, t0 + 1.6); drawHand(g, lerp(120, -150, ss(k)), lerp(260, 40, ss(k)), Math.PI * 1.25, 'point', 1, 3.0);
    arrow(g, [200, -120], [60, -30], { u: ss(seg(t, t0 + 0.2, t0 + 0.9)), fill: COL.good });
    text(g, 'your app', 200, -150, { font: '700 52px Oleo', fill: COL.ink });
    tick(g, 340, 150, 66, pop(t, t0 + 1.8, 0.3));
  },
  3: (g, t, s, t0) => { // the code stays locked
    card(g, -260, -150, 520, 240, PAL.white, 150, 26); text(g, '4 8 1 7 2 9', 0, 0, { font: '92px Slab', fill: COL.ink, align: 'center', plate: PAL.mustard, off: [5, 5] });
    const k = pop(t, t0 + 0.6, 0.4); g.save(); g.translate(0, 120); g.scale(k, k);
    shape(g, rrect(-70, -10, 140, 120, 18), { fill: PAL.mustard, line: 5, seed: 151, grain: 0.3 }); ink(g, spline([[-40, -10], [-40, -70], [40, -70], [40, -10]], false, 8), 14, { seed: 152, taper: false });
    shape(g, ellipse(0, 44, 16, 16, 12), { fill: COL.ink, line: 0, off: [0, 0], grain: 0 }); g.restore();
    tick(g, 360, -170, 66, pop(t, t0 + 1.4, 0.3));
  },
  4: (g, t, s, t0) => { // the number on your card
    shape(g, rrect(-420, -150, 480, 300, 26), { fill: COL.bank, line: 5, seed: 160, grain: 0.35, off: [8, 7] });
    shape(g, rect(-420, -80, 480, 56), { fill: PAL.ink, line: 0, off: [0, 0] });
    text(g, 'MAPLE TRUST', -380, -100, { font: '36px Slab', fill: PAL.white });
    text(g, 'on the back of your card:', -380, 40, { font: '500 28px Jost', fill: PAL.white }); text(g, '555-0100', -380, 110, { font: '62px Slab', fill: PAL.white });
    const k = pop(t, t0 + 0.8, 0.35); g.save(); g.translate(250, 20); g.scale(k, k);
    shape(g, rrect(-90, -170, 180, 340, 26), { fill: '#3E3B44', line: 5, seed: 161, grain: 0.15 }); shape(g, rrect(-72, -140, 144, 250, 12), { fill: PAL.white, line: 0, off: [0, 0] }); icon(g, 'phone', 0, -15, 110, { main: COL.good, dark: PAL.tealD }); g.restore();
    arrow(g, [80, -20], [150, -20], { u: ss(seg(t, t0 + 0.4, t0 + 1.0)), fill: COL.good, head: 28 });
    tick(g, 390, -190, 62, pop(t, t0 + 1.6, 0.3));
  },
  5: (g, t, s, t0) => { // two locks + an alert bell
    lockDoor(g, -200, 0, 2, 1);
    const k = pop(t, t0 + 0.8, 0.35); g.save(); g.translate(210, -50); g.scale(k, k);
    shape(g, spline([[-70, 60], [-60, -10], [-30, -70], [0, -90], [30, -70], [60, -10], [70, 60]], true, 8), { fill: PAL.mustard, line: 5, seed: 170, grain: 0.3 }); shape(g, ellipse(0, 72, 22, 16, 14), { fill: COL.ink, line: 0, off: [0, 0], grain: 0 });
    for (let i = 0; i < 2; i++) ink(g, [[-100 - i * 22 + Math.sin(t * 20) * 3, -20], [-100 - i * 22 + Math.sin(t * 20) * 3, 20]], 6, { taper: false, seed: 171 + i }); g.restore();
    card(g, 100, 100, 330, 110, PAL.white, 172, 22); text(g, 'Payment alert', 130, 168, { font: '600 36px Jost', fill: COL.ink });
    tick(g, 390, -190, 62, pop(t, t0 + 1.8, 0.3));
  },
};

// ---- already tapped? four steps
function sceneFix(ctx, t, s) {
  const u = t - s.t0;
  bg(ctx, PAL.mustardL); motifs(ctx, t, PAL.tealL, PAL.pink, 21);
  // header (not numbered)
  const k = eo(seg(T2(t), s.t0 + 0.05, s.t0 + 0.45));
  ctx.save(); ctx.translate(-(1 - k) * 800, 0);
  text(ctx, 'Already tapped?', 70, 215, { font: fam.slab.replace('{px}', 100), fill: COL.ink, plate: PAL.white, off: [5, 5] });
  text(ctx, 'FOUR STEPS, RIGHT NOW', 74, 108, { font: '600 28px Jost', fill: COL.ink, track: 6 });
  ctx.restore();
  const items = [['fix1', 'Call your bank', 'using the number on your card', 'phone'], ['fix2', 'Change the password', 'everywhere you used it', 'key'], ['fix3', 'Turn on two-step sign-in', 'a second lock on the door', 'gear'], ['fix4', 'Check your statements', 'and report the message', 'check']];
  items.forEach(([id, a, b, ic], i) => {
    const kk = pop(t, L0(id), 0.35); if (kk <= 0) return; const y = 330 + i * 350;
    ctx.save(); ctx.translate(540, y + 140); ctx.scale(kk, kk); ctx.translate(-540, -(y + 140));
    card(ctx, 60, y, 960, 290, PAL.white, 200 + i, 30);
    shape(ctx, ellipse(170, y + 145, 90, 90, 40), { fill: [PAL.coral, PAL.mustard, PAL.teal, PAL.avocado][i], line: 5, seed: 210 + i, grain: 0.3 });
    icon(ctx, ic, 170, y + 150, 120, { main: PAL.white, light: PAL.white, dark: COL.ink });
    shape(ctx, ellipse(100, y + 60, 34, 34, 20), { fill: COL.ink, line: 0, off: [0, 0], grain: 0 }); text(ctx, String(i + 1), 100, y + 82, { font: '48px Slab', fill: PAL.paper, align: 'center' });
    text(ctx, a, 290, y + 130, { font: '56px Slab', fill: COL.ink, maxW: 700 }); text(ctx, b, 292, y + 205, { font: '500 42px Jost', fill: PAL.inkSoft, maxW: 700 });
    ctx.restore();
  });
}

// ---- the end: a checklist that ticks itself, then one still frame
const OUTRO_ITEMS = ['Pause', "Don't tap", 'Keep the code', 'Call back', 'Lock the door'];
function sceneOutro(ctx, t, s) {
  const u = t - s.t0, still = u > s.d - 3.4;
  const tt = still ? s.t0 + s.d - 3.4 : t;
  bg(ctx, PAL.tealL); rays(ctx, W / 2, 900, 30, 1700, PAL.teal, { rot: still ? 0.2 : u * 0.04 + 0.2, alpha: 0.32 });
  const k0 = pop(t, s.t0 + 0.2, 0.4); ctx.save(); ctx.translate(540, 250); ctx.scale(k0, k0);
  text(ctx, 'REMEMBER', 0, 0, { font: '130px Slab', fill: COL.ink, align: 'center', plate: PAL.mustard, off: [7, 7], maxW: 900 }); ctx.restore();
  const t0 = L0('out2'), dd = LD.out2 / 5;
  OUTRO_ITEMS.forEach((l, i) => {
    const y = 420 + i * 200, kk = pop(tt, s.t0 + 0.6 + i * 0.12, 0.3); if (kk <= 0) return;
    ctx.save(); ctx.translate(540, y + 70); ctx.scale(kk, kk); ctx.translate(-540, -(y + 70));
    card(ctx, 90, y, 900, 150, PAL.white, 230 + i, 28);
    shape(ctx, rrect(130, y + 30, 90, 90, 18), { fill: PAL.paperD, line: 5, seed: 240 + i, grain: 0.2 });
    const tk = pop(tt, t0 + i * dd, 0.25); if (tk > 0) { ctx.save(); ctx.translate(175, y + 75); ctx.scale(tk, tk); ink(ctx, [[-30, 2], [-8, 28], [36, -28]], 18, { color: COL.good, taper: false, seed: 250 + i }); ctx.restore(); }
    text(ctx, l.toUpperCase(), 270, y + 100, { font: '72px Slab', fill: COL.ink, maxW: 680, plate: PAL.mustardL, off: [4, 4] });
    ctx.restore();
  });
  const kc = pop(tt, L0('out3'), 0.4);
  if (kc > 0) { ctx.save(); ctx.translate(540, 1500); ctx.scale(kc, kc);
    shape(ctx, rrect(-440, -90, 880, 180, 34), { fill: COL.accent, line: 6, seed: 260, grain: 0.35, off: [8, 7] });
    text(ctx, 'SHARE IT WITH SOMEONE', 0, -10, { font: '56px Slab', fill: PAL.white, align: 'center', plate: COL.ink, off: [3, 3], maxW: 780 });
    text(ctx, 'YOU CARE ABOUT', 0, 55, { font: '56px Slab', fill: PAL.white, align: 'center', plate: COL.ink, off: [3, 3], maxW: 780 });
    ctx.restore(); }
}

// ---------------------------------------------------------------- transitions + render
function drawScene(ctx, t, s) {
  ({ hook: sceneHook, title: sceneTitle, trick: sceneTrick, rewind: sceneRewind, rule: sceneRule, fix: sceneFix, outro: sceneOutro })[s.kind](ctx, t, s);
}
const ORDER = SCENES.map(s => s.id);
function sectionAt(t) { for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i].t0) return i; return 0; }
function subtitle(ctx, t) {
  const cue = CUES.find(c => t >= c.t0 && t < c.t1); if (!cue) return;
  const a = Math.min(ss(seg(t, cue.t0, cue.t0 + 0.16)), 1 - ss(seg(t, cue.t1 - 0.16, cue.t1)));
  const f = fit(ctx, cue.text, '500 {px}px Jost', 46, 900, 1, 32);
  const w = measure(ctx, f.lines[0], f.font) + 130, h = 84, x = W / 2 - w / 2, y = H - 54 - h;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 10);
  shape(ctx, rrect(x, y, w, h, 14), { fill: COL.paper, line: 3.4, seed: 901, grain: 0.15, breaks: 0.08, off: [5, 5] });
  star(ctx, x + 32, y + h / 2, 15, { n: 8, inner: 0.4, fill: COL.accent, off: [0, 0], rot: t * 0.8 });
  star(ctx, x + w - 32, y + h / 2, 15, { n: 8, inner: 0.4, fill: COL.accent, off: [0, 0], rot: -t * 0.8 });
  text(ctx, f.lines[0], W / 2, y + h / 2 + f.px * 0.34, { font: f.font, fill: COL.ink, align: 'center' });
  ctx.restore();
}
export function renderFilm(ctx, t, Q) {
  setClock(t);
  const i = sectionAt(t), s = SC[ORDER[i]], nx = SC[ORDER[i + 1]], pv = SC[ORDER[i - 1]];
  const num = x => x.n || (x.kind === 'title' ? 0 : 0);
  ctx.save();
  const irisKind = x => x && (x.kind === 'trick' || x.kind === 'rule');
  if (irisKind(nx) && t >= nx.t0 - 0.3) {
    // iris through the numbered medallion: the next scene opens inside a circle stamped on the outgoing one
    const k = eio(seg(t, nx.t0 - 0.3, nx.t0 + 0.35));
    drawScene(ctx, Math.min(t, nx.t0 - 1e-3), s);
    const r = lerp(120, 1500, k * k);
    ctx.save(); ctx.beginPath(); ctx.arc(540, 960, r, 0, TAU); ctx.clip(); drawScene(ctx, Math.max(t, nx.t0 + 1e-3), nx); ctx.restore();
    ink(ctx, ellipse(540, 960, r, r, 90), 8, { closed: true, seed: 960 });
    if (k < 0.55) { ctx.save(); ctx.globalAlpha = 1 - k * 1.8; ctx.translate(540, 960); ctx.scale(1 + k * 4, 1 + k * 4); text(ctx, String(nx.n), 0, 46, { font: '150px Slab', fill: COL.ink, align: 'center', plate: PAL.white, off: [6, 6] }); ctx.restore(); }
  } else if (s.kind !== 'hook' && !irisKind(s) && pv && t < s.t0 + 0.32) {
    // colour block wipe from the right (bottom-up for the outro)
    const k = eio(seg(t, s.t0, s.t0 + 0.3));
    drawScene(ctx, pv.t1 - 1e-3, pv); ctx.save(); ctx.beginPath();
    if (s.kind === 'outro') ctx.rect(0, H * (1 - k), W, H); else ctx.rect(W * (1 - k), 0, W, H);
    ctx.clip(); drawScene(ctx, t, s); ctx.restore();
    if (s.kind === 'outro') ink(ctx, [[-10, H * (1 - k)], [W + 10, H * (1 - k)]], 7, { seed: 962 }); else ink(ctx, [[W * (1 - k), -10], [W * (1 - k), H + 10]], 7, { seed: 962 });
  } else if (s.kind === 'rule' && pv && pv.kind === 'rewind' && t < s.t0 + 0.4) {
    drawScene(ctx, t, s);
  } else drawScene(ctx, t, s);
  ctx.restore();
  paperFinish(ctx, W, H, 1);
  if (!(Q && Q.has('nosubs'))) subtitle(ctx, t);
}

// ---------------------------------------------------------------- sound events (same times drive the pictures)
function buildEvents() {
  EVS = [];
  for (const s of SCENES) for (const [id] of LINES[s.id]) ev(LT[id], 'vo', { id });
  const S_ = id => SC[id];
  // hook
  ev(0.8, 'buzz', { dur: 1.2 }); ev(1.25, 'pop', { gain: 1 }); ev(L0('hook2') - 0.02, 'stamp', {}); ev(L0('hook2') + 0.0, 'thump', {});
  ev(11.7, 'whoosh', { dur: 0.35 });
  // title
  ev(12.4, 'whoosh', {}); ev(12.7, 'stamp', { gain: .6 }); ev(13.2, 'stamp', { gain: .7 }); ev(L0('title3') - 0.1, 'stamp', {});
  // tricks and rules: medallion iris just before each section
  for (const s of SCENES) if (s.kind === 'trick' || s.kind === 'rule') { ev(s.t0 - 0.3, 'stamp', {}); ev(s.t0 - 0.28, 'iris', { dur: 0.6 }); }
  // trick details
  ev(L0('t1b') + 0.4, 'tap', {}); ev(L0('t1c') + 0.3, 'pop', {}); ev(L0('t1e') + 0.1, 'type', { n: 8 }); ev(L0('t1e') + 0.9, 'pop', {});
  ev(L0('t2c') - 0.2, 'whoosh', { dur: 0.4 }); ev(L0('t2c'), 'stamp', {}); for (let k = 0; k < 30; k++) ev(L0('t2c') + k * 0.6, 'clock', { n: k % 2 }); ev(L0('t2e') + 0.3, 'pop', {});
  ev(L0('t3b') + 0.6, 'whoosh', { dur: 0.5 }); ev(L0('t3c') + 0.8, 'pop', {}); ev(L0('t3d'), 'pen_write', { dur: 0.5 });
  ev(L0('t4c'), 'type', { n: 18 }); ev(L0('t4d') - 0.2, 'pop', {}); ev(L0('t4d') + 1.0, 'paper_swish', {}); ev(L0('t4e'), 'pop', {}); ev(L0('t4e') + 0.3, 'slide', {});
  ev(L0('t5c'), 'ding', {}); ev(L0('t5d'), 'pop', {}); ev(L0('t5e'), 'slide', {}); ev(L0('t5e') + 1.7, 'click', {}); ev(L0('t5e') + 1.8, 'creak', {}); ev(L0('t5e') + 2.6, 'pop', {});
  // rewind: total silence then tape whirr and the stamp
  ev(S_('rew').t0 + 2.0, 'rewind', { dur: 2.6 });
  // rules
  for (const s of SCENES) if (s.kind === 'rule') { const dt = L0(({1:'r1b',2:'r2b',3:'r3b',4:'r4b',5:'r5b'})[s.n]), dd = L0(({1:'r1c',2:'r2c',3:'r3c',4:'r4c',5:'r5c'})[s.n]);
    ev(s.t0 + 0.55, 'paper_swish', {}); ev(dt + 1.2, 'pop', {}); ev(dt + 1.5, 'thump', { gain: .7 }); ev(dd - 0.4, 'paper_swish', {}); ev(dd + 1.9, 'beep', { n: 0 }); ev(dd + 2.0, 'beep', { n: 1 }); ev(dd + 2.1, 'beep', { n: 2 }); }
  // fix
  ['fix1', 'fix2', 'fix3', 'fix4'].forEach(id => { ev(L0(id), 'stamp', { gain: .8 }); ev(L0(id) + 0.2, 'pop', {}); });
  // outro: a tick per item, then the still frame
  const dd = LD.out2 / 5; for (let i = 0; i < 5; i++) { ev(L0('out2') + i * dd, 'ding', { n: i }); ev(L0('out2') + i * dd + 0.05, 'pop', {}); }
  ev(L0('out3'), 'stamp', {}); ev(S_('out').t0 + 0.2, 'whoosh', { dur: 0.4 });
  EVS.sort((a, b) => a.t - b.t);
}
