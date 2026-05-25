"""Genera PNG transparente, favicon.ico y PNGs de icono desde el logo SisPark."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
IMAGES = PUBLIC / "images"
SRC = IMAGES / "logo_moderno_de_sispark.png"


def remove_near_black_background(img: Image.Image, threshold: int = 42) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r <= threshold and g <= threshold and b <= threshold:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def content_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    alpha = img.split()[-1]
    return alpha.getbbox() or (0, 0, img.width, img.height)


def crop_square_mark(img: Image.Image) -> Image.Image:
    """Recorte cuadrado del isotipo (P + auto), sin el texto inferior."""
    w, h = img.size
    mark_h = int(h * 0.72)
    mark = img.crop((0, 0, w, mark_h))
    bbox = content_bbox(mark)
    if not bbox:
        return mark
    left, top, right, bottom = bbox
    cropped = mark.crop(bbox)
    side = max(cropped.width, cropped.height)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    offset = ((side - cropped.width) // 2, (side - cropped.height) // 2)
    canvas.paste(cropped, offset)
    return canvas


def save_ico(mark: Image.Image, dest: Path) -> None:
    sizes = [(16, 16), (32, 32), (48, 48)]
    icons = [mark.resize(size, Image.Resampling.LANCZOS) for size in sizes]
    icons[0].save(dest, format="ICO", sizes=[(i.width, i.height) for i in icons], append_images=icons[1:])


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"No existe {SRC}")

    logo = remove_near_black_background(Image.open(SRC))
    logo.save(SRC)

    full_transparent = IMAGES / "sispark-logo.png"
    logo.save(full_transparent)

    mark = crop_square_mark(logo)
    mark.save(IMAGES / "sispark-mark.png")

    for size in (32, 48, 180):
        mark.resize((size, size), Image.Resampling.LANCZOS).save(PUBLIC / f"favicon-{size}.png")

    save_ico(mark, PUBLIC / "favicon.ico")
    print("OK:", SRC, PUBLIC / "favicon.ico")


if __name__ == "__main__":
    main()
