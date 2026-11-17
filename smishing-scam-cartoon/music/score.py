"""The Fake Bank Text: score, a 1950s West Coast cool-jazz combo (original composition for this film; helpers adapted from the library demo)
vibraphone (lead) / flute (melody) / pizzicato double bass / brushed drums + ride / celesta (glockenspiel played soft + additive sine partials)
132 BPM, 4/4, 40.000 s = 22 bars, F major → G major from the climax on.
Run from the repo root: .venv/bin/python styles/midcentury-toon/demo/music/score.py
"""
import sys, os, json
sys.path.insert(0, os.environ.get('LIB', '/root/lemo-opuscar'))
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from core.audio import sampler as S
from core.audio.sfx import SR, add

OUT = os.path.dirname(os.path.abspath(__file__))
S.seed(48)
rng = np.random.default_rng(48)

B = 60 / 100           # 1 beat
BAR = 4 * B
DUR = 300.0
N = int(round(DUR * SR))
SW = 0.60              # swing eighths: the off-beat lands at 60% of the beat


def T(bar, beat=0.0, swing=SW):
    """bar counts from 1, beat from 0 (fractions allowed); x.5 off-beats are swung automatically"""
    whole = np.floor(beat + 1e-9); frac = beat - whole
    if abs(frac - .5) < 1e-6: frac = swing
    return (bar - 1) * BAR + (whole + frac) * B


def M(p): return S.midi(p) if isinstance(p, str) else p


stems = {k: np.zeros((N, 2), np.float32) for k in ('drums', 'bass', 'vib', 'lead')}
hits = []
def hit(t, label): hits.append(dict(t=round(float(t), 4), label=label))
def jit(ms=6): return float(rng.uniform(-ms, ms)) / 1000


# ---------------------------------------------------------------- instrument wrappers
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lpf(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)


def motor(x, rate=5.2, depth=.32, t0=0.0):
    """vibraphone motor tremolo: amplitude modulation"""
    t = np.arange(len(x)) / SR + t0
    return x * (1 - depth * (.5 + .5 * np.sin(2 * np.pi * rate * t))).astype(np.float32)


def vib(t, pitches, dur, vel=.5, pan=-.25, hard=False, trem=0.0, gain=1.0):
    inst = 'vibraphone_hard' if hard else 'vibraphone'
    for i, p in enumerate(pitches if isinstance(pitches, (list, tuple)) else [pitches]):
        x = S.note(inst, M(p), dur, vel=vel)
        if trem: x = motor(x, depth=trem, t0=i * .013)
        add(stems['vib'], x, t, gain, pan + (i - 1.5) * .08)


def vib_run(t0, pitches, step, vel0=.35, vel1=.6, pan=-.2, ring=1.2, gain=1.0):
    """glissando / arpeggio: notes start one after another, velocity changes linearly"""
    n = len(pitches)
    for i, p in enumerate(pitches):
        v = vel0 + (vel1 - vel0) * i / max(1, n - 1)
        add(stems['vib'], S.note('vibraphone_hard', M(p), ring, vel=v), t0 + i * step, gain, pan + .5 * i / n - .25)


def flute(t, p, beats, vel=.55, stac=False, pan=.2, gain=1.0):
    if stac and M(p) >= 69:
        x = S.note('flute_stac', M(p), .2, vel=vel)
    else:
        x = S.note('flute', M(p), max(.12, beats * B * .92), vel=vel, release=.09)
    add(stems['lead'], x, t - .02, gain, pan)


def celesta(t, p, vel=.5, pan=.4, gain=1.0):
    """celesta: soft glockenspiel (bright attack) + additive sine partials (warm celesta overtones)"""
    g = S.note('glockenspiel', M(p), 2.0, vel=min(.5, vel * .7))
    f = S.hz(M(p)); d = 1.6; tt = np.arange(int(d * SR)) / SR
    s = (np.sin(2 * np.pi * f * tt) * np.exp(-tt / .55) + .35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / .18)
         + .12 * np.sin(2 * np.pi * 4.03 * f * tt) * np.exp(-tt / .05))
    s *= np.minimum(1, tt / .002)
    x = np.zeros(max(len(g), len(s)), np.float32); x[:len(g)] += g * .6; x[:len(s)] += (s * .22 * vel).astype(np.float32)
    add(stems['lead'], x, t, gain, pan)


def bass(t, p, beats=.9, vel=.6, gain=1.0):
    add(stems['bass'], S.note('jazz_bass', M(p), max(.1, beats * B), vel=vel, release=.08), t - .015, gain, 0)


def dk(t, var, vel, dur=None, pan=.3, gain=1.0):
    add(stems['drums'], S.hit('drum_kit', var, vel, dur), t, gain, pan)


def brush_tap(t, v=.5, pan=-.1):
    d = .16; tt = np.arange(int(d * SR)) / SR
    n = rng.standard_normal(len(tt))
    x = bp(n, 1500, 9000) * np.exp(-tt / .045) + .5 * bp(n, 300, 1200) * np.exp(-tt / .02)
    x += .25 * np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / .03)
    add(stems['drums'], (x / 3.2 * v).astype(np.float32), t, 1, pan)


def brush_sweep(t, d, v=.3, pan=-.15, shape='arc'):
    tt = np.arange(int(d * SR)) / SR
    n = rng.standard_normal(len(tt))
    x = bp(n, 1800, 7500) + .35 * bp(n, 500, 1800)
    if shape == 'arc':
        env = np.sin(np.pi * tt / d) ** 1.5
    else:                                   # 'hit': a smear of accent, fast attack, slow release
        env = np.minimum(1, tt / .012) * np.exp(-tt / (d * .35))
    add(stems['drums'], (x * env / 4 * v).astype(np.float32), t, 1, pan)


def brushes(bar0, bar1, v=.3, taps=True, swirl=True, pedal=True):
    """brushes: left-hand circle (one per 2 beats) + taps on 2 and 4 + hi-hat pedal on 2 and 4"""
    for bar in range(bar0, bar1):
        for h in (0, 2):
            if swirl: brush_sweep(T(bar, h) + jit(4), 2 * B * 1.05, v * .8)
        for bt in (1, 3):
            if taps: brush_tap(T(bar, bt) + jit(4), v * 1.25)
            if pedal: add(stems['drums'], S.hit('hihat', 'pedal', .35 * v / .3, .3), T(bar, bt) + .004, .45, .45)


def ride(bar0, bar1, vel=.3, stick=False, eighths=False):
    for bar in range(bar0, bar1):
        pat = [0, .5, 1, 1.5, 2, 2.5, 3, 3.5] if eighths else [0, 1, 1.5, 2, 3, 3.5]
        for b in pat:
            acc = 1.0 if b in (1, 3) or (eighths and b == int(b)) else .7
            if stick: sw = .56
            else: sw = SW
            dk(T(bar, b, sw) + jit(4), 'ride_right', vel * acc, dur=1.4, pan=.35, gain=.55 if not stick else .6)


# ---------------------------------------------------------------- harmony (vibraphone voicings / bass roots)
V = {
    'Dm9':  ['F3','A3','C4','E4'], 'Gm9': ['F3','Bb3','D4','A4'], 'Em7b5': ['G3','Bb3','D4','E4'], 'A7b9': ['G3','C#4','Bb4'.replace('Bb4','Bb4')], 'A7': ['G3','C#4','E4'],
    'Fmaj9': ['E3','A3','C4','G4'], 'Bbmaj9': ['A3','D4','F4','C5'], 'Gm11': ['F3','Bb3','C4','D4'], 'Am7b': ['G3','C4','E4'], 'D9b': ['F#3','C4','E4','A4'], 'Cmaj9': ['E3','B3','D4','G4'], 'Dm7': ['F3','A3','C4'],
    'F6':   ['A3', 'C4', 'D4', 'F4'],
    'F69':  ['F3', 'A3', 'D4', 'G4', 'C5'],
    'Dm9':  ['F3', 'A3', 'C4', 'E4'],
    'G13':  ['F3', 'B3', 'E4'],
    'Gm7':  ['F3', 'Bb3', 'D4'],
    'C13':  ['Bb3', 'E4', 'A4'],
    'Bbmaj7': ['Bb3', 'D4', 'F4', 'A4'],
    'Am7':  ['G3', 'C4', 'E4'],
    'C6':   ['E4', 'G4', 'A4', 'C5'],
    'Bbm6': ['Db4', 'F4', 'G4', 'Bb4'],
    'C9':   ['Bb3', 'D4', 'E4', 'G4'],
    # G major
    'G69':  ['G3', 'B3', 'E4', 'A4', 'D5'],
    'G6':   ['B3', 'D4', 'E4', 'G4'],
    'Em9':  ['G3', 'B3', 'D4', 'F#4'],
    'A13':  ['G3', 'C#4', 'F#4'],
    'Am7g': ['G3', 'C4', 'E4'],
    'D13':  ['F#3', 'C4', 'E4', 'B4'],
    'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
    'D9':   ['F#3', 'C4', 'E4', 'A4'],
    'Gmaj7': ['F#3', 'B3', 'D4', 'G4'],
}


def comp(bar, chord, vel=.32, charleston=True, second=None):
    """vibraphone comping: long on beat 1 + short on the off-beat of beat 2 (Charleston)"""
    vib(T(bar, 0) + jit(3), V[chord], 1.4 * B, vel)
    if charleston: vib(T(bar, 1.5) + jit(3), V[second or chord], .6 * B, vel * .8)


# ================================================================ hook A 0–1.364: complete silence
# ================================================================ hook B 1.364: rising vibraphone glissando + suspended-cymbal swell

# ================================================================ composition
D_ = os.path.dirname(OUT)
EV = json.load(open(os.path.join(D_, 'events.json')))['ev']
ROOT_OF = {'Dm9': 'D2', 'Dm7': 'D2', 'Gm7': 'G2', 'Gm9': 'G2', 'Gm11': 'G2', 'A7': 'A1', 'A7b9': 'A1', 'Em7b5': 'E2', 'Bbmaj7': 'Bb1', 'Bbmaj9': 'Bb1',
           'Fmaj9': 'F2', 'F69': 'F2', 'Cmaj9': 'C2', 'C13': 'C2', 'Am7': 'A1', 'D9b': 'D2', 'D13': 'D2', 'C9': 'C2', 'F6': 'F2'}
FIFTH = {'D': 'A', 'G': 'D', 'A': 'E', 'E': 'B', 'B': 'F', 'F': 'C', 'C': 'G'}
def mname(p): return S.name(M(p))
def walk(bar, chord, nxt, vel=.6, gain=1.0, pedal=False):
    r = ROOT_OF[chord]; rn = M(r); nn = M(ROOT_OF[nxt])
    if pedal:
        bass(T(bar, 0), r, 1.8, vel, gain); bass(T(bar, 2) + jit(3), r, 1.8, vel * .8, gain); return
    third = rn + (3 if 'm' in chord and 'maj' not in chord else 4); fifth = rn + 7
    app = nn + (1 if rn >= nn else -1)
    for i, p in enumerate([rn, fifth, third + 12 if third + 12 < 50 else third, app]):
        bass(T(bar, i) + jit(4), mname(p), .9, vel * (1.0 if i == 0 else .82), gain)

# --- progression helpers: each section is (first bar, number of bars, 4-bar cycle of chords)
def run(bar0, n, cycle, sig=None, **kw):
    out = []
    for i in range(n):
        out.append(cycle[i % len(cycle)])
    if sig: out[0] = sig
    return [(bar0 + i, c) for i, c in enumerate(out)]

SEC = {}
def section(name, bar0, n, cycle, sig=None): SEC[name] = run(bar0, n, cycle, sig)

section('hook', 1, 5, ['Dm9'])
section('title', 6, 5, ['Fmaj9', 'Bbmaj9', 'Gm9', 'C13'], 'Fmaj9')
section('t1', 11, 10, ['Dm9', 'Dm9', 'Gm7', 'A7'], 'Dm9')
section('t2', 21, 10, ['Gm9', 'Gm9', 'Dm7', 'A7'], 'Gm9')
section('t3', 31, 10, ['Em7b5', 'A7b9', 'Dm9', 'A7'], 'Em7b5')
section('t4', 41, 10, ['Bbmaj9', 'Gm7', 'Em7b5', 'A7'], 'Bbmaj9')
section('t5', 51, 10, ['A7b9', 'Dm9', 'A7b9', 'Dm9'], 'A7b9')
section('r1', 63, 9, ['Fmaj9', 'Gm9', 'C13', 'Fmaj9'], 'Fmaj9')
section('r2', 72, 9, ['Bbmaj9', 'Gm9', 'C13', 'Fmaj9'], 'Bbmaj9')
section('r3', 81, 9, ['Gm9', 'C13', 'Fmaj9', 'Bbmaj9'], 'Gm9')
section('r4', 90, 9, ['Am7', 'D9b', 'Gm9', 'C13'], 'Am7')
section('r5', 99, 9, ['Cmaj9', 'Fmaj9', 'Gm9', 'C13'], 'Cmaj9')
section('fix', 108, 10, ['Fmaj9', 'Gm9', 'C13', 'Fmaj9'], 'Fmaj9')

def all_chords():
    seq = []
    for k in SEC: seq += SEC[k]
    return sorted(seq)
CH = all_chords(); CHD = dict(CH)
def nxt_of(bar): return CHD.get(bar + 1, CHD[bar])

# ---- hook (bars 1-5): the buzz owns bar 1; low pedal, sparse vibraphone
for bar, c in SEC['hook']:
    if bar >= 2: bass(T(bar, 0), ROOT_OF[c], 2.2, .55); vib(T(bar, 0), V[c], 2.0 * B, .22 + .03 * bar)
    if bar >= 4: brush_sweep(T(bar, 0), 2.2 * B, .22); brush_tap(T(bar, 1), .35); brush_tap(T(bar, 3), .35)
vib_run(T(5, 2), ['A3', 'C4', 'E4', 'G4', 'A4', 'C5'], .12, .3, .55, ring=1.2)

# ---- title (6-10): the groove arrives, flute states a friendly motif in F
for bar, c in SEC['title']:
    comp(bar, c, .3); walk(bar, c, nxt_of(bar), .6)
brushes(6, 11, .3); ride(8, 11, .18)
MOT = [(0, 1.0, 'A4', .5), (0, 1.5, 'C5', .5), (0, 2.0, 'F5', 1.0), (0, 3.0, 'E5', .5), (0, 3.5, 'D5', .5), (1, 0.0, 'C5', 2.0), (1, 2.5, 'D5', .5), (1, 3.0, 'F5', 1.0)]
for off in (0, 2):
    for bo, bt, p, ln in MOT[: 8 if off == 0 else 6]: flute(T(7 + off, bt) + (bo * BAR if False else 0) if False else T(7 + off + bo, bt) + jit(4), p, ln, .45)

# ---- Part I: minor, tense, more instruments each stage
stage_vel = {'t1': .26, 't2': .28, 't3': .3, 't4': .32, 't5': .34}
for name in ['t1', 't2', 't3', 't4', 't5']:
    b0 = SEC[name][0][0]; k = int(name[1])
    for bar, c in SEC[name]:
        comp(bar, c, stage_vel[name], charleston=(bar - b0) % 2 == 1)
        walk(bar, c, nxt_of(bar), .5 + .04 * k, pedal=(name == 't5' and bar - b0 >= 6))
    brushes(b0, b0 + 10, .22 + .03 * k)
    if k >= 2: ride(b0 + 2, b0 + 10, .16 + .02 * k, stick=(k >= 4))
    # the signature chord of the stage: long, loud, starts with its medallion
    vib(T(b0, 0), V[SEC[name][0][1]], 3 * B, .62, hard=True, trem=.3)
    hit(T(b0, 0), f'{name} signature chord')
# muted trumpet motif (the thief's whisper), stages 3-5
TRU = [('D5', .5), ('F5', .5), ('E5', 1.0), ('D5', .5), ('C#5', 1.5)]
def trumpet(t, p, beats, vel=.5): add(stems['lead'], S.note('trumpet_mute', M(p), max(.15, beats * B * .9), vel=vel, release=.1), t, .9, .25)
for bar in (36, 38, 44, 46, 54, 56, 58):
    t = T(bar, 1.0)
    for p, ln in TRU: trumpet(t, p, ln, .42); t += ln * B
# stage-5 tension: vibraphone tremolo, then everything thins out for the silence at 144 s
for k in range(8): vib(T(59, 0) + k * B / 2, ['A3', 'C#4', 'G4'], .5 * B, .2 + .03 * k, trem=.5, gain=.8)

# ---- rewind: reversed swell into the first answer
n_rev = int(2.8 * SR); rev = np.zeros((n_rev, 2), np.float32)
for i, p in enumerate(V['Fmaj9']): add(rev, S.note('vibraphone', M(p), 2.6, vel=.55), 0.0, 1.0, -.3 + i * .2)
rev = (rev.mean(1)[::-1].copy() * np.linspace(0, 1, n_rev) ** 1.5).astype(np.float32)
add(stems['vib'], rev, 148.8 - 2.8, .9, 0)

# ---- Part II: major, brighter, flute leads
fl_vel = .46
ANS = {'r1': [('A4', 1.0, .5), ('C5', 1.5, .5), ('F5', 2.0, 2.0), ('E5', 0, 0)],
       'r2': [('D5', 1.0, .5), ('F5', 1.5, .5), ('Bb5', 2.0, 2.0)],
       'r3': [('G5', 1.0, .5), ('Bb5', 1.5, .5), ('D6', 2.0, 2.0)],
       'r4': [('C5', 1.0, .5), ('E5', 1.5, .5), ('A5', 2.0, 2.0)],
       'r5': [('E5', 1.0, .5), ('G5', 1.5, .5), ('C6', 2.0, 3.0)]}
for name in ['r1', 'r2', 'r3', 'r4', 'r5']:
    b0 = SEC[name][0][0]; k = int(name[1])
    for bar, c in SEC[name]:
        if name == 'r3' and bar == b0: continue   # the near-silence: only a bare chord at the end of the pause
        comp(bar, c, .3 + .01 * k, charleston=True); walk(bar, c, nxt_of(bar), .58 + .02 * k)
    brushes(b0 + (1 if name == 'r3' else 0), b0 + 9, .26); ride(b0 + 2, b0 + 9, .2, stick=(k >= 3), eighths=(k == 5))
    vib(T(b0, 0) + (1.1 if name == 'r3' else 0), V[SEC[name][0][1]], 3 * B, .6, hard=True, trem=.3)
    hit(T(b0, 0), f'{name} signature chord')
    for p, bt, ln in ANS[name][:3]:
        for rep in (2, 6): flute(T(b0 + rep, bt) + jit(4), p, ln if ln > 0 else .5, fl_vel + .03 * k, stac=False)
    for rep in (4,): flute(T(b0 + rep, 1.0), 'G5', .5, fl_vel); flute(T(b0 + rep, 1.5), 'F5', .5, fl_vel); flute(T(b0 + rep, 2.0), 'E5', 1.5, fl_vel)

# ---- already tapped: brisk, staccato, one chord per step
for bar, c in SEC['fix']:
    comp(bar, c, .32); walk(bar, c, nxt_of(bar), .65)
brushes(108, 118, .3); ride(108, 118, .2, stick=True)
for bar in range(109, 118): 
    for bt, p in [(0.0, 'F5'), (1.0, 'A5'), (1.5, 'G5'), (2.5, 'C6')]: flute(T(bar, bt) + jit(3), p, .4, .38, stac=True)

# ---- outro: the five chords come back, one per tick; then a held chord and silence
dings = sorted([e['t'] for e in EV if e['type'] == 'ding' and e['t'] > 280])
sig5 = ['Fmaj9', 'Bbmaj9', 'Gm9', 'Am7', 'Cmaj9']
for t, c in zip(dings, sig5): vib(t - .01, V[c], 1.8 * B, .55, hard=True); hit(t, f'outro chord {c}')
for bar in (118, 119): bass(T(bar, 0), 'F2', 3.5, .55)
brushes(118, 121, .2)
tend = dings[-1] + 1.2 if dings else 292
vib(tend, V['Fmaj9'], 6.0, .6, trem=.4); bass(tend, 'F1', 5.0, .6); celesta(tend, 'C6', .55)
for k in range(1, 7): vib(tend + k * B / 2, ['A4', 'E5'], .5 * B, max(.04, .2 - .03 * k), trem=.4, gain=.7)

# ---------------------------------------------------------------- reverb, silence mask, bus
ROOM = dict(drums=(.3, .1), bass=(.22, .06), vib=(.45, .2), lead=(.4, .18))
GAIN = dict(drums=.9, bass=1.05, vib=.95, lead=.85)
for k in stems: stems[k] = S.room(stems[k] * GAIN[k], size=ROOM[k][0], mix=ROOM[k][1]).astype(np.float32)
tt = np.arange(N) / SR
mask = np.ones(N)
def fade_out(a, b):
    s = (tt >= a) & (tt < b); mask[s] *= .5 + .5 * np.cos(np.pi * (tt[s] - a) / (b - a)); mask[tt >= b] = 0
def gap(a, b, f=.15):
    s = (tt >= a) & (tt < b); mask[s] = 0
    s2 = (tt >= a - f) & (tt < a); mask[s2] *= .5 + .5 * np.cos(np.pi * (tt[s2] - (a - f)) / f)
    s3 = (tt >= b) & (tt < b + .05); mask[s3] *= np.minimum(1, (tt[s3] - b) / .05)
mask[tt < 1.3] = 0
gap(140.4, 146.0, .5)        # thin-out, total silence, then the reversed swell comes in (added after the gap)
gap(192.0, 193.1)            # near-silence before "Keep the code"
fade_out(296.8, 300.0)
for k in stems: stems[k] *= mask[:, None].astype(np.float32)
# the reversed swell must survive the silence gap
mix = sum(stems.values())
from scipy.ndimage import maximum_filter1d, uniform_filter1d
ceil = 10 ** (-1.3 / 20)
pk = np.abs(mix).max(axis=1)
pre = min(1.0, .98 / max(np.percentile(pk[pk > 0], 99.9), 1e-9)); pk = pk * pre
n = int(.005 * SR)
g = np.minimum(1, ceil / np.maximum(maximum_filter1d(pk, 2 * n + 1), 1e-9)); g = uniform_filter1d(g, n) * pre
g = np.minimum(g, ceil / np.maximum(np.abs(mix).max(axis=1), 1e-9))
for k in stems: stems[k] *= g[:, None].astype(np.float32)
mix = sum(stems.values())
os.makedirs(f'{OUT}/stems', exist_ok=True)
sf.write(f'{OUT}/score.wav', mix.astype(np.float32), SR, subtype='PCM_24')
hits.sort(key=lambda h: h['t'])
json.dump(dict(bpm=100, beat=B, bar=BAR, duration=DUR, hits=hits), open(f'{OUT}/hits.json', 'w'), indent=1)
used = ['vibraphone', 'vibraphone_hard', 'flute', 'flute_stac', 'trumpet_mute', 'jazz_bass', 'drum_kit', 'hihat', 'sus_cymbal', 'glockenspiel']
open(f'{OUT}/CREDITS_music.txt', 'w').write('Music: "The Fake Bank Text" original score, generated in code\n' + '\n'.join(S.credits(used)) + '\n')
print('done', mix.shape, 'peak dBFS', 20 * np.log10(np.abs(mix).max()))
