#!/bin/bash
# Join rendered segments, burn captions + hook, add the mix. Usage: finish.sh <project_dir> <mix.wav> <out.mp4>
set -e
P=$1; MIX=$2; OUT=$3; cd "$P/out"
[ -f video_raw.mp4 ] || { ls segs/seg_*.mp4 | grep -v part | sort | sed "s#^#file '#; s#\$#'#" > segs.txt; ffmpeg -loglevel error -y -f concat -safe 0 -i segs.txt -c copy video_raw.mp4; }
mkdir -p fonts; cp -n ../render/fonts/*.ttf fonts/ 2>/dev/null || true
ffmpeg -loglevel error -y -i video_raw.mp4 -i "$MIX" -vf "ass=captions.ass:fontsdir=fonts" -map 0:v -map 1:a -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of csv=p=0 "$OUT"
