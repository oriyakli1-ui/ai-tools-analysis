import { PAL, setClock, shape, ink, text, star, sparkle, rays, ellipse, rrect, spline, kidney, boomerang, textures, paperFinish } from './engine/toon.js';
import { icon } from './engine/icons.js';
const Q = new URLSearchParams(location.search), mode = Q.get('mode') || 'banner';
const cv = document.getElementById('c');
const W = mode === 'banner' ? 2560 : 800, H = mode === 'banner' ? 1440 : 800; cv.width = W; cv.height = H;
const g = cv.getContext('2d');
await Promise.all(['700 80px Oleo', '80px Slab', '500 40px Jost'].map(f => document.fonts.load(f)));
textures();
const INK = PAL.ink;
function magnifier(ctx, cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ink(ctx, [[120, 120], [330, 330]], 70, { taper: false, seed: 5, color: INK });
  ink(ctx, [[120, 120], [330, 330]], 46, { taper: false, seed: 6, color: PAL.coral });
  shape(ctx, ellipse(0, 0, 200, 200, 72), { fill: PAL.white, line: 18, seed: 7, grain: 0.2, off: [8, 6] });
  ink(ctx, ellipse(0, 0, 160, 160, 72, -2.6, -1.2), 14, { seed: 8, color: PAL.tealL, taper: true });
  // a tick inside the lens: you looked twice, it checks out
  ink(ctx, [[-80, 5], [-25, 65], [90, -70]], 38, { color: '#3A9D6B', taper: false, seed: 9 });
  ctx.restore();
}
function phoneBubble(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  shape(ctx, rrect(-120, -210, 240, 420, 34), { fill: '#3E3B44', line: 6, seed: 11, grain: 0.15 });
  shape(ctx, rrect(-100, -180, 200, 360, 18), { fill: PAL.white, line: 0, off: [0, 0] });
  shape(ctx, rrect(-86, -150, 172, 110, 26), { fill: PAL.paperD, line: 3, seed: 12, grain: 0.1, off: [3, 3] });
  [-120, -92, -64].forEach((yy, i) => ink(ctx, [[-66, yy], [30 - i * 14, yy]], 8, { color: PAL.inkSoft, taper: false, seed: 13 + i }));
  shape(ctx, rrect(-86, -10, 172, 80, 22), { fill: PAL.tealL, line: 3, seed: 16, grain: 0.1, off: [3, 3] });
  ctx.restore();
}
function banner(ctx) {
  setClock(1);
  ctx.fillStyle = PAL.tealL; ctx.fillRect(0, 0, W, H);
  rays(ctx, W / 2, H / 2, 40, 2600, PAL.teal, { rot: 0.1, alpha: 0.3 });
  shape(ctx, kidney(260, 330, 330, -0.3), { fill: PAL.mustardL, line: 0, grain: 0.3, off: [0, 0], alpha: 0.7 });
  shape(ctx, boomerang(2330, 1120, 330, 0.5), { fill: PAL.pink, line: 0, grain: 0.3, off: [0, 0], alpha: 0.7 });
  for (let i = 0; i < 14; i++) sparkle(ctx, 120 + ((i * 397) % 2320), 80 + ((i * 211) % 1280), 22 + (i % 4) * 8, { fill: PAL.white, alpha: 0.8, rot: i });
  // art: left and right edges only (outside the mobile safe area 1546 x 423)
  phoneBubble(ctx, 330, 860, 1.5, -0.12);
  magnifier(ctx, 2200, 600, 1.3);
  // centre: name (inside the safe area)
  ctx.save(); ctx.translate(W / 2, H / 2);
  text(ctx, 'Slow down. Look again. Stay safe.', 0, -215, { font: '700 64px Oleo', fill: INK, align: 'center', plate: PAL.white, off: [3, 3] });
  text(ctx, 'THE SECOND', 0, -20, { font: '170px Slab', fill: INK, align: 'center', plate: PAL.coral, off: [8, 8], maxW: 1150 });
  text(ctx, 'LOOK', 0, 150, { font: '170px Slab', fill: INK, align: 'center', plate: PAL.coral, off: [8, 8], maxW: 1400 });
  ctx.restore();
  paperFinish(ctx, W, H, 1);
}
function profile(ctx) {
  setClock(1);
  ctx.fillStyle = PAL.mustard; ctx.fillRect(0, 0, W, H);
  rays(ctx, W / 2, H / 2, 24, 900, PAL.mustardL, { rot: 0.1, alpha: 0.55 });
  magnifier(ctx, 330, 330, 0.95);
  sparkle(ctx, 640, 150, 46, { fill: PAL.white }); sparkle(ctx, 150, 620, 34, { fill: PAL.white });
  paperFinish(ctx, W, H, 0.8);
}
window.DUR = 1; window.render = () => (mode === 'banner' ? banner : profile)(g); window.READY = true;
