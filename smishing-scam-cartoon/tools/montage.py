import sys, glob
from PIL import Image
out, cols, *files = sys.argv[1:]
cols = int(cols); ims = [Image.open(f).convert('RGB') for f in files]
w, h = 360, 640; ims = [i.resize((w, h)) for i in ims]
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * h), 'white')
for k, i in enumerate(ims): S.paste(i, ((k % cols) * w, (k // cols) * h))
S.save(out, quality=88)
