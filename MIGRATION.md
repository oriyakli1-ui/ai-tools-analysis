# Moving the video tool to your own computer (main Claude)

What is where:
- **In the repo (branch `ccr-4959ee78-tqz3ut`, safe):** the film source (`smishing-scam-cartoon/`: `film.js`, `script.js`, `music/score.py`, `mix.py`, `build.sh`, fonts, engine copy), the treatment, credits, subtitles, brand images, and all research files.
- **Only in the cloud session (lost when it closes):** the Lemo-Opuscar library clone (`/root/lemo-opuscar`), the installed plugin, the Python venv, the voice model, the downloaded instrument samples, ffmpeg 7, and the rendered `fake-bank-text.mp4` (142 MB, too big for GitHub, which has a 100 MB per-file limit; you already received it as a file in the chat; save it).

## Set up on your computer (macOS or Linux; on Windows use WSL2 Ubuntu)
1. Install Node 20+, ffmpeg 7+, and Python 3.11+ (or uv). Check: `node -v && ffmpeg -version && python3 --version`.
2. Install Claude Code, then the plugin:
```
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```
3. In Claude, run `/lemo-opuscar:lemo-opuscar`. It clones the library to `~/lemo-opuscar` and prints `LIB=<path>`. Then, from that folder, install the tools:
```
sh plugin/skills/lemo-opuscar/scripts/setup.sh deps
sh plugin/skills/lemo-opuscar/scripts/setup.sh deps voice music
sh tools/fetch.sh instruments vsco2ce
sh tools/fetch.sh instruments vcsl
sh tools/fetch.sh instruments karoryfer
sh tools/fetch.sh instruments freepats
```
4. Get the project: `git clone -b ccr-4959ee78-tqz3ut https://github.com/oriyakli1-ui/ai-tools-analysis.git`
5. Rebuild the film (about 40 min in the cloud; faster on a real machine, much faster with a GPU):
```
export LIB=~/lemo-opuscar
sh ai-tools-analysis/smishing-scam-cartoon/build.sh
```
The scripts read `LIB` from the environment, so no path edits are needed. The `chrome-nosandbox` wrapper and `LEMO_ANGLE=swiftshader` I used in the cloud are not needed on a normal machine.

Not covered: the Whisper line check (`core/tts/asr_check.py`) never ran in the cloud. On your machine it can download its model, so run it after step 5.
