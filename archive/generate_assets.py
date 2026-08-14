from PIL import Image, ImageDraw, ImageFilter
import math
import os

OUT_DIR = r'D:\Apps\fyg\微信小程序开发大赛\wxxapp\miniprogram\images'
os.makedirs(OUT_DIR, exist_ok=True)

COLOR_NORMAL = (136, 136, 136, 255)
COLOR_ACTIVE = (27, 58, 92, 255)
TAB_SIZE = 81


def new_icon(size=TAB_SIZE):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def draw_create(draw, color, s=TAB_SIZE):
    cx, cy = s / 2, s / 2
    pw = int(s * 0.08)
    pl = int(s * 0.42)
    px0 = cx + pl * math.cos(math.radians(35))
    py0 = cy + pl * math.sin(math.radians(35))
    px1 = cx + pl * math.cos(math.radians(215))
    py1 = cy + pl * math.sin(math.radians(215))
    draw.line([(px1, py1), (px0, py0)], fill=color, width=pw)
    tip = int(s * 0.10)
    draw.polygon([
        (px0 + tip, py0),
        (px0 - tip * 0.4, py0 - tip * 0.9),
        (px0 - tip * 0.4, py0 + tip * 0.9),
    ], fill=color)
    r = int(s * 0.05)
    draw.ellipse([px1 - r, py1 - r, px1 + r, py1 + r], fill=color)


def draw_gallery(draw, color, s=TAB_SIZE):
    m = int(s * 0.18)
    g = int(s * 0.06)
    cs = int((s - 2 * m - g) / 2)
    for row in range(2):
        for col in range(2):
            x0 = m + col * (cs + g)
            y0 = m + row * (cs + g)
            draw.rounded_rectangle([x0, y0, x0 + cs, y0 + cs], radius=int(cs * 0.2), fill=color)


def draw_mine(draw, color, s=TAB_SIZE):
    cx = s / 2
    hr = int(s * 0.16)
    hcy = int(s * 0.34)
    draw.ellipse([cx - hr, hcy - hr, cx + hr, hcy + hr], fill=color)
    bw = int(s * 0.48)
    bh = int(s * 0.30)
    by = int(s * 0.58)
    draw.rounded_rectangle([cx - bw / 2, by, cx + bw / 2, by + bh], radius=int(bh * 0.5), fill=color)


ICONS = {
    'create': draw_create,
    'gallery': draw_gallery,
    'mine': draw_mine,
}


def gen_tabbar():
    for name, fn in ICONS.items():
        img, d = new_icon()
        fn(d, COLOR_NORMAL)
        img.save(os.path.join(OUT_DIR, f'tab_{name}.png'))

        img, d = new_icon()
        fn(d, COLOR_ACTIVE)
        img.save(os.path.join(OUT_DIR, f'tab_{name}_active.png'))
    print('tabBar 图标 6 张已生成')


STYLES = [
    {'id': 1, 'name': 'ice', 'colors': [(27, 58, 92), (44, 95, 124), (74, 127, 168)], 'pattern': 'crackle'},
    {'id': 2, 'name': 'geo', 'colors': [(160, 82, 45), (196, 120, 62), (212, 160, 23)], 'pattern': 'geo'},
    {'id': 3, 'name': 'floral', 'colors': [(44, 95, 124), (91, 139, 175), (160, 82, 45)], 'pattern': 'floral'},
    {'id': 4, 'name': 'abstract', 'colors': [(160, 82, 45), (27, 58, 92), (212, 160, 23)], 'pattern': 'abstract'},
    {'id': 5, 'name': 'indigo', 'colors': [(13, 33, 55), (27, 58, 92), (44, 95, 124)], 'pattern': 'shibori'},
    {'id': 6, 'name': 'gradient', 'colors': [(212, 160, 23), (160, 82, 45), (27, 58, 92)], 'pattern': 'gradient'},
]

PREVIEW_SIZE = 300


def gradient_bg(colors, size=PREVIEW_SIZE):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    c0, c1, c2 = colors
    for y in range(size):
        for x in range(size):
            tx = x / size
            ty = y / size
            r = int(c0[0] * (1 - tx) * (1 - ty) + c1[0] * tx * (1 - ty) + c2[0] * tx * ty + c0[0] * (1 - tx) * ty * 0.4)
            g = int(c0[1] * (1 - tx) * (1 - ty) + c1[1] * tx * (1 - ty) + c2[1] * tx * ty + c0[1] * (1 - tx) * ty * 0.4)
            b = int(c0[2] * (1 - tx) * (1 - ty) + c1[2] * tx * (1 - ty) + c2[2] * tx * ty + c0[2] * (1 - tx) * ty * 0.4)
            r, g, b = min(255, r), min(255, g), min(255, b)
            img.putpixel((x, y), (r, g, b, 255))
    return img


def add_crackle(img, colors):
    d = ImageDraw.Draw(img)
    import random
    random.seed(42)
    cx, cy = img.size[0] / 2, img.size[1] / 2
    for _ in range(8):
        ang = random.uniform(0, 2 * math.pi)
        x, y = cx, cy
        light = (220, 230, 240, 60)
        for _ in range(20):
            nx = x + random.uniform(-15, 15) + math.cos(ang) * 10
            ny = y + random.uniform(-15, 15) + math.sin(ang) * 10
            d.line([(x, y), (nx, ny)], fill=light, width=1)
            x, y = nx, ny
            ang += random.uniform(-0.5, 0.5)
    return img.filter(ImageFilter.GaussianBlur(0.6))


def add_geo(img, colors):
    d = ImageDraw.Draw(img)
    import random
    random.seed(7)
    light = (255, 240, 210, 80)
    for _ in range(6):
        x = random.randint(40, img.size[0] - 40)
        y = random.randint(40, img.size[1] - 40)
        r = random.randint(25, 55)
        sides = random.choice([3, 4, 6])
        pts = []
        for i in range(sides):
            a = 2 * math.pi * i / sides + random.uniform(0, 0.5)
            pts.append((x + r * math.cos(a), y + r * math.sin(a)))
        d.polygon(pts, outline=light)
    return img


def add_floral(img, colors):
    d = ImageDraw.Draw(img)
    import random
    random.seed(21)
    light = (240, 220, 200, 90)
    for _ in range(5):
        cx = random.randint(50, img.size[0] - 50)
        cy = random.randint(50, img.size[1] - 50)
        r = random.randint(18, 32)
        for k in range(6):
            a = 2 * math.pi * k / 6
            px = cx + r * math.cos(a)
            py = cy + r * math.sin(a)
            d.ellipse([px - r * 0.6, py - r * 0.6, px + r * 0.6, py + r * 0.6], fill=light)
        d.ellipse([cx - r * 0.4, cy - r * 0.4, cx + r * 0.4, cy + r * 0.4], fill=(255, 250, 240, 120))
    return img.filter(ImageFilter.GaussianBlur(0.5))


def add_abstract(img, colors):
    d = ImageDraw.Draw(img)
    import random
    random.seed(99)
    for _ in range(7):
        x = random.randint(0, img.size[0])
        y = random.randint(0, img.size[1])
        r = random.randint(30, 70)
        c = random.choice(colors)
        alpha = random.randint(40, 90)
        for rr in range(r, 0, -2):
            a = int(alpha * (1 - rr / r))
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(c[0], c[1], c[2], a))
    return img.filter(ImageFilter.GaussianBlur(2))


def add_shibori(img, colors):
    d = ImageDraw.Draw(img)
    import random
    random.seed(5)
    dark = (8, 20, 35, 120)
    for _ in range(12):
        x = random.randint(20, img.size[0] - 20)
        y = random.randint(20, img.size[1] - 20)
        r = random.randint(15, 40)
        d.ellipse([x - r, y - r, x + r, y + r], fill=dark)
    return img.filter(ImageFilter.GaussianBlur(1.5))


def add_gradient(img, colors):
    return img.filter(ImageFilter.GaussianBlur(3))


PATTERN_FN = {
    'crackle': add_crackle,
    'geo': add_geo,
    'floral': add_floral,
    'abstract': add_abstract,
    'shibori': add_shibori,
    'gradient': add_gradient,
}


def gen_previews():
    for st in STYLES:
        img = gradient_bg(st['colors'])
        img = PATTERN_FN[st['pattern']](img, st['colors'])
        img = img.convert('RGB')
        img.save(os.path.join(OUT_DIR, f'style_{st["id"]}_{st["name"]}.png'))
    print('风格模板预览图 6 张已生成')


if __name__ == '__main__':
    gen_tabbar()
    gen_previews()
    print('全部资源生成完毕 ->', OUT_DIR)