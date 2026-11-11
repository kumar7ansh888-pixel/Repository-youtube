#!/bin/bash
# Download the free models the pipeline needs (all from GitHub; ~650 MB). Usage: fetch_models.sh <dir>
set -e
D=${1:-/tmp/models}; mkdir -p "$D"; cd "$D"
R=https://github.com/k2-fsa/sherpa-onnx/releases/download
[ -f kokoro-en-v0_19/model.onnx ] || { curl -sSL --max-time 1200 -o k.tar.bz2 $R/tts-models/kokoro-en-v0_19.tar.bz2 && tar -xjf k.tar.bz2 && rm k.tar.bz2; }
[ -f sherpa-onnx-whisper-base.en/base.en-encoder.int8.onnx ] || { curl -sSL --max-time 1200 -o w.tar.bz2 $R/asr-models/sherpa-onnx-whisper-base.en.tar.bz2 && tar -xjf w.tar.bz2 && rm w.tar.bz2; }
[ -f cmudict/cmudict.dict ] || git clone -q --depth 1 https://github.com/cmusphinx/cmudict cmudict
ls "$D"
