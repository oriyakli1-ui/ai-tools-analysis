#!/bin/sh
# Rebuild "The Fake Bank Text": sh build.sh   (run from anywhere). LIB = the Lemo-Opuscar library folder.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}; export LIB
PY=$LIB/.venv/bin/python
cd "$LIB"
node "$HERE/tools/lines.mjs" "$HERE/lines.json"
$PY core/tts/tts.py "$HERE/lines.json" "$HERE/voices"                 # 1. Kokoro voice (bm_george)
node core/render/events.mjs "$HERE"                                   # 2. picture events -> events.json
$PY "$HERE/music/score.py"                                            # 3. original cool-jazz score
$PY "$HERE/mix.py"                                                    # 4. foley + voice + ducking + silences -> mix.wav
node "$HERE/tools/cues.mjs" > "$HERE/out/cues.json" && $PY core/render/srt.py "$HERE/out/cues.json" "$HERE/subtitles_en.srt"
node core/render/video.mjs "$HERE" --fps 24 --workers 3 --size 1080x1920 --out "$HERE/out/video24.mp4"   # 5. frames
sh core/render/mux.sh "$HERE/out/video24.mp4" "$HERE/mix.wav" "$HERE/fake-bank-text.mp4" 24 3            # 6. -14 LUFS, light grain
