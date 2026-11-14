#!/bin/bash
# Hindi narration with the free Piper voice hi_IN-pratham-medium (owner's pick, 2026-11-14). Usage: voice.sh <project_dir>
# Needs: pip install piper-tts sherpa-onnx soundfile --break-system-packages; models from fetch_hindi.sh
set -e; P=$1; M=${MODELS:-/home/claude/models}; mkdir -p $P/voice/l; i=0
while IFS='|' read -r h r; do i=$((i+1)); echo "$h" | python3 -m piper -m $M/vits-piper-hi_IN-pratham-medium/hi_IN-pratham-medium.onnx --length-scale ${LS:-0.9} --sentence-silence 0.12 -f $P/voice/l/$(printf %02d $i).wav 2>/dev/null; done < $P/lines.txt
python3 $(dirname $0)/build_voice.py $P
ffmpeg -loglevel error -y -i $P/voice/tts.wav -ar 48000 -ac 1 $P/voice/voice.wav
