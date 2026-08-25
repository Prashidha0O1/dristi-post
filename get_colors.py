import sys
from PIL import Image
from collections import Counter

img = Image.open("/Users/apple/.gemini/antigravity/brain/e84cdb8d-bfca-4d8e-a33a-8addff68c6f5/.user_uploaded/media_1787650477811.png")
img = img.convert('RGB')
pixels = list(img.getdata())

# Filter out white/near-white and black
valid_pixels = [p for p in pixels if not (p[0]>240 and p[1]>240 and p[2]>240) and not (p[0]<10 and p[1]<10 and p[2]<10)]

counter = Counter(valid_pixels)
most_common = counter.most_common(20)

for color, count in most_common:
    hex_color = "#{:02x}{:02x}{:02x}".format(color[0], color[1], color[2])
    print(f"{hex_color} - count: {count}")
