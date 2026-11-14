#!/bin/bash
# Pratham Hindi voice (Piper) + multilingual whisper-small for the Hindi check. Usage: fetch_hindi.sh <models_dir>
set -e; D=${1:-/home/claude/models}; cd $D; R=https://github.com/k2-fsa/sherpa-onnx/releases/download
[ -f vits-piper-hi_IN-pratham-medium/hi_IN-pratham-medium.onnx ] || { curl -sSL --max-time 900 -o p.tar.bz2 $R/tts-models/vits-piper-hi_IN-pratham-medium.tar.bz2 && tar xjf p.tar.bz2 && rm p.tar.bz2; }
[ -f sherpa-onnx-whisper-small/small-encoder.int8.onnx ] || { curl -sSL --max-time 1500 -o w.tar.bz2 $R/asr-models/sherpa-onnx-whisper-small.tar.bz2 && tar xjf w.tar.bz2 && rm w.tar.bz2; }
pip install piper-tts sherpa-onnx soundfile --break-system-packages -q
