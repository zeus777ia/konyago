#!/usr/bin/env python3
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw

import generate_social_assets as base

W, H = base.WIDTH, base.HEIGHT
WHITE, GOLD2 = base.WHITE, base.GOLD_2


def fade(t: float, start: float, end: float, edge: float = 0.24) -> float:
    return base.window(t, start, end, edge)


def title(draw: ImageDraw.ImageDraw, text: str, t: float, start: float, end: float,
          tag: str | None = None, y: int = 178, size: int = 63) -> None:
    alpha = fade(t, start, end)
    if alpha <= 0:
        return
    slide = int(32 * (1 - base.ease((t - start) / 0.35)))
    x = 42 - slide
    if tag:
        base.draw_tag(draw, tag, x, 128, alpha)
    yy = y
    for line in text.split('\n'):
        draw.text((x, yy), line, font=base.font(size, True), fill=base.rgba(WHITE, alpha))
        yy += int(size * 1.03)


def prompt_box(draw: ImageDraw.ImageDraw, text: str, alpha: float) -> None:
    y = 470
    draw.rounded_rectangle((42, y, W - 42, y + 73), radius=19,
                           fill=base.rgba((246, 243, 235), alpha))
    draw.text((66, y + 23), text, font=base.font(17, True),
              fill=base.rgba((17, 33, 44), alpha))


def footer(draw: ImageDraw.ImageDraw, alpha: float) -> None:
    draw.text((42, H - 92), 'konyago.com.tr', font=base.font(17, True),
              fill=base.rgba(GOLD2, alpha))


def render_questions(t: float) -> Image.Image:
    image = base.BASE_BG.copy().convert('RGBA')
    layer = Image.new('RGBA', image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    base.draw_grid(draw, 0.68)
    base.draw_brand(draw, t, '10 SANİYEDE PLAN')
    base.draw_route(draw, base.ease((t + 0.3) / 2.0))

    title(draw, "Konya'da\nplan mı lazım?", t, 0.0, 2.05, y=196, size=62)
    title(draw, 'Nereye\ngidelim?', t, 1.85, 3.75, tag='01', y=190, size=63)
    title(draw, 'Ne\nyiyelim?', t, 3.55, 5.35, tag='02', y=190, size=63)
    title(draw, 'Yakınımda\nne var?', t, 5.10, 7.15, tag='03', y=190, size=60)

    alpha = fade(t, 6.90, 10.0, 0.35)
    if alpha:
        base.draw_tag(draw, 'ÜCRETSİZ', 42, 128, alpha)
        draw.text((42, 190), 'Üçünü de', font=base.font(56, True), fill=base.rgba(WHITE, alpha))
        draw.text((42, 248), "KonyaGo AI'ya sor.", font=base.font(48, True), fill=base.rgba(WHITE, alpha))
        prompt_box(draw, '2 saatin var; sakin bir rota hazırla.', alpha)
        footer(draw, alpha)

    base.draw_progress(draw, t)
    return Image.alpha_composite(image, layer).convert('RGB')


def render_guest(t: float) -> Image.Image:
    image = base.BASE_BG.copy().convert('RGBA')
    layer = Image.new('RGBA', image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    base.draw_grid(draw, 0.68)
    base.draw_brand(draw, t, 'ŞEHİR SENARYOSU / 01')
    base.draw_route(draw, base.ease((t - 0.55) / 6.4), offset=12)

    title(draw, 'Misafirin geldi.', t, 0.0, 1.95, y=195, size=59)
    title(draw, '3 saatin var.', t, 1.70, 3.20, tag='PANİK YOK', y=190, size=60)
    title(draw, 'Tarih', t, 3.0, 4.55, tag='01', y=190, size=65)
    title(draw, 'Lezzet', t, 4.35, 5.95, tag='02', y=190, size=65)
    title(draw, 'Gün batımı', t, 5.75, 7.65, tag='03', y=190, size=60)

    alpha = fade(t, 7.40, 10.0, 0.35)
    if alpha:
        base.draw_tag(draw, 'ÜCRETSİZ', 42, 128, alpha)
        draw.text((42, 190), 'Rotanı KonyaGo', font=base.font(52, True), fill=base.rgba(WHITE, alpha))
        draw.text((42, 247), "AI'ya sor.", font=base.font(52, True), fill=base.rgba(WHITE, alpha))
        prompt_box(draw, 'Tarih + lezzet + gün batımı', alpha)
        footer(draw, alpha)

    base.draw_progress(draw, t)
    return Image.alpha_composite(image, layer).convert('RGB')


def upscale(source: Path, destination: Path, metadata_title: str) -> None:
    subprocess.run([
        'ffmpeg', '-y', '-i', str(source), '-vf', 'scale=1080:1920:flags=lanczos,fps=30',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-profile:v', 'high',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-ar', '44100',
        '-movflags', '+faststart', '-metadata', f'title={metadata_title}',
        '-metadata', 'comment=Original KonyaGo organic-house and ney-inspired soundtrack; no third-party samples or loops.',
        str(destination)
    ], check=True)


def make(output: Path, name: str, renderer: Callable[[float], Image.Image],
         style: base.AudioStyle, metadata_title: str) -> None:
    temporary = output / f'.{name}.720.mp4'
    final = output / f'{name}.mp4'
    base.encode_video(temporary, renderer, style)
    upscale(temporary, final, metadata_title)
    temporary.unlink(missing_ok=True)


def main() -> int:
    if shutil.which('ffmpeg') is None:
        raise SystemExit('ffmpeg is required')
    output = Path(sys.argv[1] if len(sys.argv) > 1 else 'media/social')
    output.mkdir(parents=True, exist_ok=True)
    make(output, 'konyago-3-soru-premium-reel', render_questions,
         base.AudioStyle(112.0, (62, 65, 69, 67, 65), (38, 38, 34, 36), 4201),
         'KonyaGo - 3 Soru Premium Reels')
    make(output, 'konyago-misafir-3-saat-premium-reel', render_guest,
         base.AudioStyle(104.0, (62, 65, 67, 69, 65), (38, 34, 36, 33), 4202),
         'KonyaGo - Misafirin Geldi Premium Reels')
    (output / 'RIGHTS-MANIFEST.txt').write_text(
        'KonyaGo Premium Reels\nVisuals: original procedural graphics.\n'
        'Audio: original mathematical synthesis; no third-party songs, samples or loops.\n'
        'Format: 1080x1920, 30 fps, H.264/AAC, 10 seconds.\n', encoding='utf-8')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
