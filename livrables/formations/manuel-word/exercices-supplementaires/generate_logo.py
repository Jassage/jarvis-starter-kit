"""Genere une image logo de substitution (placeholder) pour l'exercice 7."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 500, 300
img = Image.new("RGB", (W, H), color="#1B4F72")
draw = ImageDraw.Draw(img)

# Cercle decoratif
draw.ellipse((40, 40, 460, 260), outline="#FFFFFF", width=6)

try:
    font_big = ImageFont.truetype("arialbd.ttf", 46)
    font_small = ImageFont.truetype("arial.ttf", 22)
except Exception:
    font_big = ImageFont.load_default()
    font_small = ImageFont.load_default()

text1 = "LES AMIS"
text2 = "DU QUARTIER"

def center_text(draw, text, y, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    draw.text(((W - w) / 2, y), text, font=font, fill=fill)

center_text(draw, text1, 105, font_big, "#FFFFFF")
center_text(draw, text2, 160, font_small, "#F4D03F")

out_dir = os.path.dirname(os.path.abspath(__file__))
out_path = os.path.join(out_dir, "assets", "logo_association.png")
img.save(out_path)
print("Logo genere :", out_path)
