# Tile contact-sheet jpgs into one image. Usage: sheet.py <dir_with_s###.jpg> <out.jpg>
import glob, sys
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + '/s*.jpg')); W, H, cols = 270, 480, 7; rows = (len(fs) + cols - 1) // cols
im = Image.new('RGB', (W * cols, H * rows), 'black')
for i, f in enumerate(fs): im.paste(Image.open(f).resize((W, H)), ((i % cols) * W, (i // cols) * H))
im.save(sys.argv[2], quality=85); print(len(fs), 'shots')
