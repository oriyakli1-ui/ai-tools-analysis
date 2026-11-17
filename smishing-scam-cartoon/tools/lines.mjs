import { LINES } from '../script.js';
import fs from 'fs';
const out = [];
for (const k of Object.keys(LINES)) for (const [id, text] of LINES[k]) out.push({ id, text, asr: text, voice: 'bm_george', speed: 0.94 });
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(out.length, 'lines', out.reduce((a, l) => a + l.text.split(/\s+/).length, 0), 'words');
