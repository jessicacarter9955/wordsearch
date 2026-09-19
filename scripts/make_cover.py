#!/usr/bin/env python3
"""
Copertina itch.io 630x500 per Word Search — Crucipuzzle.
Ricostruisce lo stile del gioco (gradiente ws-bg, lettere di sfondo,
placca bubble con lente, mini-griglia con parola evidenziata,
bottone PLAY glossy). Font: Baloo 2 istanziato a wght 800 (OFL).
Render a 2x e downscale per antialias.
"""
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import random

S = 2                      # fattore di supersampling
W, H = 630 * S, 500 * S

WOFF2 = '/home/z/my-project/scripts/assets/baloo2-latin-var.woff2'
TTF = '/tmp/baloo2-800.ttf'

# ---------- font: istanzia il variable font a wght 800 ----------
font = TTFont(WOFF2)
inst = instancer.instantiateVariableFont(font, {'wght': 800})
inst.flavor = None
inst.save(TTF)

def F(size):
    return ImageFont.truetype(TTF, size)

# ---------- sfondo: gradiente radiale ws-bg ----------
img = Image.new('RGB', (W, H))
px = img.load()
cx, cy = W / 2, H * 0.30
maxd = ((W * 0.65) ** 2 + (H * 0.60) ** 2) ** 0.5
stops = [(0.00, (5, 210, 250)), (0.28, (10, 160, 246)), (0.55, (13, 114, 242)),
         (0.85, (26, 35, 228)), (1.00, (23, 24, 211))]
for y in range(H):
    for x in range(W):
        d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 / maxd
        d = min(d, 1.0)
        for i in range(len(stops) - 1):
            d0, c0 = stops[i]; d1, c1 = stops[i + 1]
            if d0 <= d <= d1:
                t = (d - d0) / (d1 - d0) if d1 > d0 else 0
                px[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(c0, c1))
                break

# ---------- lettere di sfondo (faint) ----------
bg_letters = Image.new('RGBA', (W, H), (0, 0, 0, 0))
bd = ImageDraw.Draw(bg_letters)
random.seed(7)
COLS, ROWS, CELL = 11, 9, 76 * S
gx0 = (W - COLS * CELL) // 2
gy0 = (H - ROWS * CELL) // 2
faint = F(int(CELL * 0.62))
alpha_text = 'LTBDHOGAQCNVSEMIRUZFP'
k = 0
for r in range(ROWS):
    for c in range(COLS):
        ch = alpha_text[k % len(alpha_text)]; k += 1
        bb = bd.textbbox((0, 0), ch, font=faint)
        bd.text((gx0 + c * CELL + (CELL - bb[2]) / 2, gy0 + r * CELL + (CELL - bb[3]) / 2 - bb[1]),
                ch, font=faint, fill=(255, 255, 255, 26))
img = Image.alpha_composite(img.convert('RGBA'), bg_letters)

draw = ImageDraw.Draw(img)

def rounded(draw, box, r, **kw):
    draw.rounded_rectangle(box, radius=r, **kw)

# ---------- placca ----------
PL = (56 * S, 52 * S, 500 * S, 252 * S)
# glow ciano
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
rounded(gd, [PL[0] - 6 * S, PL[1] - 6 * S, PL[2] + 6 * S, PL[3] + 6 * S], 36 * S, fill=(34, 211, 238, 200))
glow = glow.filter(ImageFilter.GaussianBlur(22 * S))
img = Image.alpha_composite(img, glow)
draw = ImageDraw.Draw(img)
# bordo ciano
rounded(draw, PL, 30 * S, fill=(34, 211, 238, 255))
inner = (PL[0] + 5 * S, PL[1] + 5 * S, PL[2] - 5 * S, PL[3] - 5 * S)
rounded(draw, inner, 26 * S, fill=(255, 255, 255, 255))
# riflesso interno superiore
refl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
rd = ImageDraw.Draw(refl)
rounded(rd, (inner[0] + 10 * S, inner[1] + 8 * S, inner[2] - 10 * S, inner[1] + 62 * S), 20 * S, fill=(255, 255, 255, 235))
refl = refl.filter(ImageFilter.GaussianBlur(6 * S))
img = Image.alpha_composite(img, refl)
draw = ImageDraw.Draw(img)

# ---------- testo bubble ----------
def render_bubble_text(img, xy, text, f, stroke_w):
    """estrusione navy + contorno bianco + riempimento sfumato verticale"""
    x, y = xy
    d = ImageDraw.Draw(img)
    for dx, dy, col in [(4*S, 5*S, (30, 58, 138, 255)), (6*S, 7*S, (23, 37, 84, 255)), (8*S, 10*S, (15, 30, 78, 255))]:
        d.text((x + dx, y + dy), text, font=f, fill=col)
    d.text((x, y), text, font=f, fill=(255, 255, 255, 255), stroke_width=stroke_w, stroke_fill=(255, 255, 255, 255))
    mask = Image.new('L', img.size, 0)
    md = ImageDraw.Draw(mask)
    md.text((x, y), text, font=f, fill=255)
    bb = md.textbbox((x, y), text, font=f)
    bb = (int(bb[0]), int(bb[1]), int(bb[2]), int(bb[3]))
    grad = Image.new('RGBA', img.size, (0, 0, 0, 0))
    g = Image.new('RGB', (max(bb[2]-bb[0], 1), max(bb[3]-bb[1], 1)))
    gp = g.load()
    gh = max(g.height, 1)
    cols = [(165, 216, 255), (79, 157, 255), (37, 99, 235)]
    for yy in range(g.height):
        t = yy / gh
        if t < 0.38:
            t2, cA, cB = t / 0.38, cols[0], cols[1]
        else:
            t2, cA, cB = (t - 0.38) / 0.62, cols[1], cols[2]
        col = tuple(round(a + (b - a) * t2) for a, b in zip(cA, cB))
        for xx in range(g.width):
            gp[xx, yy] = col
    grad.paste(g, (bb[0], bb[1]))
    grad.putalpha(mask)
    return Image.alpha_composite(img, grad)

# WORD (piccolo, spaziato)
f_word = F(30 * S)
word_txt = 'W O R D'
bbw = draw.textbbox((0, 0), word_txt, font=f_word)
xw = PL[0] + (PL[2] - PL[0] - (bbw[2] - bbw[0])) / 2 - bbw[0]

img = render_bubble_text(img, (xw, PL[1] + 34 * S), word_txt, f_word, 6 * S)

# SEARCH (grande)
f_search = F(92 * S)
bb = draw.textbbox((0, 0), 'SEARCH', font=f_search)
xs = PL[0] + (PL[2] - PL[0] - (bb[2] - bb[0])) / 2 - bb[0]
img = render_bubble_text(img, (xs, PL[1] + 78 * S), 'SEARCH', f_search, 13 * S)
draw = ImageDraw.Draw(img)

# ---------- lente d'ingrandimento ----------
lens = Image.new('RGBA', (260 * S, 260 * S), (0, 0, 0, 0))
ld = ImageDraw.Draw(lens)
LX, LY, LR = 130 * S, 108 * S, 74 * S
# anello metallico
ld.ellipse((LX - LR, LY - LR, LX + LR, LY + LR), fill=(148, 163, 184, 255))
ld.ellipse((LX - LR + 8*S, LY - LR + 8*S, LX + LR - 8*S, LY + LR - 8*S), fill=(241, 245, 249, 255))
ld.ellipse((LX - LR + 14*S, LY - LR + 14*S, LX + LR - 14*S, LY + LR - 14*S), fill=(203, 213, 225, 255))
# vetro
GR = LR - 22 * S
ld.ellipse((LX - GR, LY - GR, LX + GR, LY + GR), fill=(224, 242, 254, 255))
# riflesso mezzaluna
cres = Image.new('RGBA', lens.size, (0, 0, 0, 0))
cd = ImageDraw.Draw(cres)
cd.ellipse((LX - GR + 12*S, LY - GR + 8*S, LX - GR + 58*S, LY - GR + 54*S), fill=(255, 255, 255, 235))
cres = cres.filter(ImageFilter.GaussianBlur(3 * S))
lens = Image.alpha_composite(lens, cres)
ld = ImageDraw.Draw(lens)
# maniglia
ld.rounded_rectangle((LX - 12*S, LY + GR + 16*S, LX + 12*S, LY + GR + 40*S), radius=6*S, fill=(148, 163, 184, 255))
ld.rounded_rectangle((LX - 8*S, LY + GR + 34*S, LX + 8*S, LY + GR + 86*S), radius=8*S, fill=(30, 41, 59, 255))
lens = lens.rotate(-38, resample=Image.BICUBIC, expand=True)
img.alpha_composite(lens, (int(448 * S), int(96 * S)))
draw = ImageDraw.Draw(img)

# ---------- mini griglia di gioco ----------
GX0, GY0, GC, GCELL = 56 * S, 292 * S, 8, 34 * S
GW = GC * GCELL
# pannello bianco glow ciano
glow2 = Image.new('RGBA', (W, H), (0, 0, 0, 0))
g2 = ImageDraw.Draw(glow2)
rounded(g2, (GX0 - 3*S, GY0 - 3*S, GX0 + GW + 3*S, GY0 + 4 * GCELL + 3*S), 16 * S, fill=(0, 221, 255, 220))
glow2 = glow2.filter(ImageFilter.GaussianBlur(10 * S))
img = Image.alpha_composite(img, glow2)
draw = ImageDraw.Draw(img)
rounded(draw, (GX0, GY0, GX0 + GW, GY0 + 4 * GCELL), 14 * S, fill=(0, 221, 255, 255))
rounded(draw, (GX0 + 4*S, GY0 + 4*S, GX0 + GW - 4*S, GY0 + 4 * GCELL - 4*S), 11 * S, fill=(255, 255, 255, 255))

random.seed(42)
letters = [[random.choice('ABCDEFGHIJKLMNOPQRSTUVZ') for _ in range(GC)] for _ in range(4)]
# parola GIOCO su riga 2, colonne 1-5
word = 'GIOCO'
for i, ch in enumerate(word):
    letters[1][1 + i] = ch
f_cell = F(22 * S)
for r in range(4):
    for c in range(GC):
        ch = letters[r][c]
        bb = draw.textbbox((0, 0), ch, font=f_cell)
        x = GX0 + c * GCELL + (GCELL - (bb[2] - bb[0])) / 2 - bb[0]
        y = GY0 + r * GCELL + (GCELL - (bb[3] - bb[1])) / 2 - bb[1]
        draw.text((x, y), ch, font=f_cell, fill=(10, 25, 47, 255))
# evidenzia GIOCO (pill verde semitrasparente)
hl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
hd = ImageDraw.Draw(hl)
y2 = GY0 + 1 * GCELL + GCELL / 2
rounded(hd, (GX0 + 1 * GCELL + 3*S, y2 - 12*S, GX0 + 6 * GCELL - 3*S, y2 + 12*S), 12 * S, fill=(5, 150, 105, 130))
img = Image.alpha_composite(img, hl)
draw = ImageDraw.Draw(img)

# ---------- bottone PLAY glossy ----------
PBX, PBY, PBR = 508 * S, 396 * S, 54 * S
glow3 = Image.new('RGBA', (W, H), (0, 0, 0, 0))
g3 = ImageDraw.Draw(glow3)
g3.ellipse((PBX - PBR, PBY - PBR, PBX + PBR, PBY + PBR), fill=(139, 92, 246, 230))
glow3 = glow3.filter(ImageFilter.GaussianBlur(16 * S))
img = Image.alpha_composite(img, glow3)
draw = ImageDraw.Draw(img)
draw.ellipse((PBX - PBR, PBY - PBR, PBX + PBR, PBY + PBR), fill=(56, 130, 235, 255), outline=(255, 255, 255, 255), width=4 * S)
# cupola luce
dome = Image.new('RGBA', (W, H), (0, 0, 0, 0))
dd = ImageDraw.Draw(dome)
dd.ellipse((PBX - PBR + 8*S, PBY - PBR + 6*S, PBX + PBR - 8*S, PBY - PBR + PBR * 0.9), fill=(255, 255, 255, 120))
dome = dome.filter(ImageFilter.GaussianBlur(4 * S))
img = Image.alpha_composite(img, dome)
draw = ImageDraw.Draw(img)
# triangolo play
tri = [(PBX - 14*S, PBY - 22*S), (PBX - 14*S, PBY + 22*S), (PBX + 26*S, PBY)]
draw.polygon([(x + 4*S, y) for x, y in tri], fill=(255, 255, 255, 255))

# ---------- badge categorie ----------
badge = Image.new('RGBA', (W, H), (0, 0, 0, 0))
bdg = ImageDraw.Draw(badge)
txt = '15 CATEGORIE · 3 DIFFICOLTÀ · IT/EN'
f_b = F(19 * S)
tb = bdg.textbbox((0, 0), txt, font=f_b)
bw = tb[2] - tb[0] + 36 * S
bx, by = GX0, 448 * S
bdg.rounded_rectangle((bx, by, bx + bw, by + 34 * S), radius=17 * S, fill=(255, 255, 255, 60), outline=(136, 204, 255, 230), width=2 * S)
bdg.text((bx + 18 * S, by + (34 * S - (tb[3] - tb[1])) / 2 - tb[1]), txt, font=f_b, fill=(255, 255, 255, 255))
img = Image.alpha_composite(img, badge)

# ---------- downscale e salva ----------
final = img.convert('RGB').resize((630, 500), Image.LANCZOS)
out = '/home/z/my-project/download/crucipuzzle-assets/cover-itchio.png'
import os
os.makedirs(os.path.dirname(out), exist_ok=True)
final.save(out, 'PNG', optimize=True)
final.save('/home/z/my-project/download/crucipuzzle-assets/cover-itchio.jpg', 'JPEG', quality=92, optimize=True)
print('OK — copertina salvata:', out)
