from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

size = 144
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

for y in range(size):
    for x in range(size):
        cx, cy = size / 2, size / 2
        dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        max_dist = math.sqrt(2) * size / 2
        ratio = min(dist / max_dist, 1.0)
        r = int(44 + (27 - 44) * ratio)
        g = int(95 + (58 - 95) * ratio)
        b = int(124 + (92 - 124) * ratio)
        img.putpixel((x, y), (r, g, b, 255))

overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))

spots = [
    (36, 36, 28, 74, 127, 168, 60),
    (108, 36, 24, 160, 82, 45, 50),
    (36, 108, 26, 212, 160, 23, 40),
    (108, 108, 30, 44, 95, 124, 55),
    (72, 72, 20, 212, 160, 23, 30),
]
for sx, sy, sr, cr, cg, cb, ca in spots:
    for y in range(max(0, sy - sr), min(size, sy + sr)):
        for x in range(max(0, sx - sr), min(size, sx + sr)):
            d = math.sqrt((x - sx) ** 2 + (y - sy) ** 2)
            if d < sr:
                alpha = int(ca * (1 - d / sr))
                overlay.putpixel((x, y), (cr, cg, cb, alpha))

overlay = overlay.filter(ImageFilter.GaussianBlur(3))
img = Image.alpha_composite(img, overlay)
draw = ImageDraw.Draw(img)

font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 72)
text = '纹'
bbox = draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
tx = (size - tw) / 2 - bbox[0]
ty = (size - th) / 2 - bbox[1]

shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
shadow_draw = ImageDraw.Draw(shadow)
shadow_draw.text((tx + 2, ty + 2), text, font=font, fill=(0, 0, 0, 80))
img = Image.alpha_composite(img, shadow)
draw = ImageDraw.Draw(img)

draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

img = img.convert('RGB')
output_path = r'D:\Apps\fyg\微信小程序开发大赛\wxxapp\miniprogram\images\avatar.png'
img.save(output_path, 'PNG')
print(f'头像已保存到: {output_path}')
print(f'尺寸: {img.size}')