import { setup, srtCues } from '../film.js';
import fs from 'fs';
setup(JSON.parse(fs.readFileSync(new URL('../voices/dur.json', import.meta.url))));
console.log(JSON.stringify(srtCues()));
