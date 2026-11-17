// The script: scenes (bar grid: bpm 100, bar = 2.4 s), narration lines and their caption parts ('|' splits a caption).
export const BPM = 100, BEAT = 60 / BPM, BAR = BEAT * 4;
// id, start (s), length (s), first-line offset (s)
export const SCENES = [
  { id: 'hook', t0: 0, d: 12, kind: 'hook', first: 2.2 },
  { id: 'title', t0: 12, d: 12, kind: 'title', first: 0.9 },
  { id: 't1', t0: 24, d: 24, kind: 'trick', n: 1, first: 1.0 },
  { id: 't2', t0: 48, d: 24, kind: 'trick', n: 2, first: 1.0 },
  { id: 't3', t0: 72, d: 24, kind: 'trick', n: 3, first: 1.0 },
  { id: 't4', t0: 96, d: 24, kind: 'trick', n: 4, first: 1.0 },
  { id: 't5', t0: 120, d: 24, kind: 'trick', n: 5, first: 1.0 },
  { id: 'rew', t0: 144, d: 4.8, kind: 'rewind', first: 1.4 },
  { id: 'r1', t0: 148.8, d: 21.6, kind: 'rule', n: 1, first: 1.0 },
  { id: 'r2', t0: 170.4, d: 21.6, kind: 'rule', n: 2, first: 1.0 },
  { id: 'r3', t0: 192.0, d: 21.6, kind: 'rule', n: 3, first: 1.6 },
  { id: 'r4', t0: 213.6, d: 21.6, kind: 'rule', n: 4, first: 1.0 },
  { id: 'r5', t0: 235.2, d: 21.6, kind: 'rule', n: 5, first: 1.0 },
  { id: 'fix', t0: 256.8, d: 24, kind: 'fix', first: 0.9 },
  { id: 'out', t0: 280.8, d: 19.2, kind: 'outro', first: 0.8 },
];
export const DURATION = 300;
// [id, text (voice), caption (with | parts), gap before (s)]
export const LINES = {
  hook: [
    ['hook1', "This text looks like it's from your bank.", "This text looks like it's from your bank.", 0],
    ['hook2', "It isn't.", "It isn't.", 0.9],
    ['hook3', "Let's take it apart.", "Let's take it apart.", 0.6],
  ],
  title: [
    ['title1', "Welcome to the safety classroom.", "Welcome to the safety classroom.", 0],
    ['title2', "Today's lesson: the fake bank text.", "Today's lesson: the fake bank text.", 0.6],
    ['title3', "Five tricks. And five answers.", "Five tricks. And five answers.", 0.6],
  ],
  t1: [
    ['t1a', "Trick one. The bait.", "Trick one. The bait.", 0],
    ['t1b', "A message arrives from a bank you may even use.", "A message arrives from a bank|you may even use.", 0.5],
    ['t1c', "It says there is a problem with your account.", "It says there is a problem|with your account.", 0.7],
    ['t1d', "It uses the bank's name, and it sounds official.", "It uses the bank's name,|and it sounds official.", 0.7],
    ['t1e', "But anyone can type any name into a text.", "But anyone can type any name|into a text.", 0.7],
  ],
  t2: [
    ['t2a', "Trick two. The panic.", "Trick two. The panic.", 0],
    ['t2b', "The message gives you a deadline.", "The message gives you a deadline.", 0.5],
    ['t2c', "Act in ten minutes, or your account will be frozen.", "Act in ten minutes,|or your account will be frozen.", 0.7],
    ['t2d', "Real problems rarely arrive with a countdown.", "Real problems rarely arrive|with a countdown.", 0.7],
    ['t2e', "The clock is there to stop you from thinking.", "The clock is there|to stop you from thinking.", 0.7],
  ],
  t3: [
    ['t3a', "Trick three. The link.", "Trick three. The link.", 0],
    ['t3b', "To fix everything, you only have to tap one link.", "To fix everything,|you only have to tap one link.", 0.5],
    ['t3c', "Look closely. The address is close to the real one, but not quite right.", "Look closely. The address is close|to the real one, but not quite right.", 0.7],
    ['t3d', "One small change in one word is all it takes.", "One small change in one word|is all it takes.", 0.7],
  ],
  t4: [
    ['t4a', "Trick four. The copycat.", "Trick four. The copycat.", 0],
    ['t4b', "The page behind the link looks just like your bank.", "The page behind the link|looks just like your bank.", 0.5],
    ['t4c', "Same colors. Same logo.", "Same colors. Same logo.", 0.6],
    ['t4d', "But it is only a costume.", "But it is only a costume.", 0.6],
    ['t4e', "Everything you type goes straight to the thief.", "Everything you type goes|straight to the thief.", 0.7],
  ],
  t5: [
    ['t5a', "Trick five. The code.", "Trick five. The code.", 0],
    ['t5b', "Now the thief tries to log in to your real account.", "Now the thief tries to log in|to your real account.", 0.5],
    ['t5c', "Your bank sends you a one-time code.", "Your bank sends you a one-time code.", 0.6],
    ['t5d', "The thief asks you for it, by text or on the phone.", "The thief asks you for it,|by text or on the phone.", 0.6],
    ['t5e', "That code is a key. Hand it over, and the door opens.", "That code is a key.|Hand it over, and the door opens.", 0.6],
  ],
  rew: [
    ['rew1', "Let's go back.", "Let's go back.", 0],
  ],
  r1: [
    ['r1a', "Answer one. Pause.", "Answer one. Pause.", 0],
    ['r1b', "A message that rushes you is a warning sign.", "A message that rushes you|is a warning sign.", 0.6],
    ['r1c', "Put the phone down. Take one slow breath.", "Put the phone down.|Take one slow breath.", 0.7],
    ['r1d', "Nothing real disappears in the time it takes to breathe.", "Nothing real disappears|in the time it takes to breathe.", 0.7],
  ],
  r2: [
    ['r2a', "Answer two. Don't tap.", "Answer two. Don't tap.", 0],
    ['r2b', "Ignore the link in the message.", "Ignore the link in the message.", 0.6],
    ['r2c', "Open your bank's app yourself, or type the address you know.", "Open your bank's app yourself,|or type the address you know.", 0.7],
    ['r2d', "If there is a real problem, it will be waiting for you there.", "If there is a real problem,|it will be waiting for you there.", 0.7],
  ],
  r3: [
    ['r3a', "Answer three. Keep the code.", "Answer three. Keep the code.", 0],
    ['r3b', "A one-time code is for you alone.", "A one-time code is for you alone.", 0.6],
    ['r3c', "Your bank will never ask you to read it out. Not in a text. Not on a call.", "Your bank will never ask you to read it out.|Not in a text. Not on a call.", 0.7],
    ['r3d', "If someone asks, that is the scam.", "If someone asks, that is the scam.", 0.7],
  ],
  r4: [
    ['r4a', "Answer four. Call back.", "Answer four. Call back.", 0],
    ['r4b', "If you are unsure, hang up.", "If you are unsure, hang up.", 0.6],
    ['r4c', "Then call the number printed on your card.", "Then call the number|printed on your card.", 0.7],
    ['r4d', "Not the number in the message. Not the number a caller gives you.", "Not the number in the message.|Not the number a caller gives you.", 0.7],
  ],
  r5: [
    ['r5a', "Answer five. Lock the door.", "Answer five. Lock the door.", 0],
    ['r5b', "Turn on alerts for every payment.", "Turn on alerts for every payment.", 0.6],
    ['r5c', "Use your bank's app sign-in, or a passkey, if it offers one.", "Use your bank's app sign-in,|or a passkey, if it offers one.", 0.7],
    ['r5d', "Then a stolen password alone is not enough.", "Then a stolen password|alone is not enough.", 0.7],
  ],
  fix: [
    ['fix0', "Already tapped? Don't panic. It happens to careful people.", "Already tapped? Don't panic.|It happens to careful people.", 0],
    ['fix1', "One. Call your bank, using the number on your card.", "One. Call your bank,|using the number on your card.", 0.8],
    ['fix2', "Two. Change the password you used, everywhere you used it.", "Two. Change the password you used,|everywhere you used it.", 0.6],
    ['fix3', "Three. Turn on two-step sign-in.", "Three. Turn on two-step sign-in.", 0.6],
    ['fix4', "Four. Check your statements, and report the message.", "Four. Check your statements,|and report the message.", 0.6],
  ],
  out: [
    ['out1', "Remember.", "Remember.", 0],
    ['out2', "Pause. Don't tap. Keep the code. Call back. Lock the door.", "Pause. Don't tap. Keep the code.|Call back. Lock the door.", 0.5],
    ['out3', "And share this with someone you care about.", "And share this with someone|you care about.", 1.0],
  ],
};
