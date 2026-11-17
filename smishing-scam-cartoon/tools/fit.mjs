import { SCENES, LINES } from '../script.js';
import fs from 'fs';
const D = JSON.parse(fs.readFileSync('voices/dur.json'));
for (const s of SCENES) { let t = s.first; for (const [id, , , gap] of LINES[s.id]) { t += gap; t += D[id]; } console.log(s.id.padEnd(6), 'speech ends', t.toFixed(1), 'of', s.d, t > s.d - 0.8 ? '  <-- TOO LONG' : ''); }
