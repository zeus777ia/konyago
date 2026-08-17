#!/usr/bin/env python3
"""Generate original KonyaGo social videos and procedural music.

No stock footage, third-party music, samples, loops, logos, or fonts are bundled.
Visuals are drawn with Pillow; audio is synthesized mathematically with NumPy.
"""
from __future__ import annotations

import math
import shutil
import subprocess
import sys
import wave
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import numpy as np
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 720, 1280
FPS = 24
DURATION = 10.0
SR = 44_100
FRAMES = int(FPS * DURATION)

NAVY = (5, 24, 39)
NAVY_2 = (9, 41, 60)
GOLD = (226, 177, 76)
GOLD_2 = (250, 211, 120)
WHITE = (245, 243, 235)
MUTED = (144, 161, 173)
GRID = (27, 59, 76)


def find_font(bold: bool = False) -> str:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for item in candidates:
        if Path(item).exists():
            return item
    raise FileNotFoundError("No supported system font found")


FONT_REG = find_font(False)
FONT_BOLD = find_font(True)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size=size)


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def ease(value: float) -> float:
    x = clamp(value)
    return 1.0 - (1.0 - x) ** 3


def smoothstep(value: float) -> float:
    x = clamp(value)
    return x * x * (3.0 - 2.0 * x)


def window(t: float, start: float, end: float, fade: float = 0.28) -> float:
    if t < start or t > end:
        return 0.0
    fade_in = smoothstep((t - start) / max(fade, 1e-6))
    fade_out = smoothstep((end - t) / max(fade, 1e-6))
    return min(fade_in, fade_out)


def rgba(color: tuple[int, int, int], alpha: float) -> tuple[int, int, int, int]:
    return (*color, int(255 * clamp(alpha)))


def gradient_background() -> Image.Image:
    y = np.linspace(0.0, 1.0, HEIGHT, dtype=np.float32)[:, None, None]
    top = np.array(NAVY, dtype=np.float32)[None, None, :]
    bottom = np.array(NAVY_2, dtype=np.float32)[None, None, :]
    arr = top * (1.0 - y) + bottom * y
    arr = np.repeat(arr, WIDTH, axis=1)
    yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH]
    dist = np.sqrt(((xx - WIDTH * 0.82) / WIDTH) ** 2 + ((yy - HEIGHT * 0.72) / HEIGHT) ** 2)
    glow = np.clip(1.0 - dist / 0.72, 0.0, 1.0)[..., None]
    arr += glow * np.array([9.0, 5.0, 0.0], dtype=np.float32)
    return Image.fromarray(np.uint8(np.clip(arr, 0, 255)), "RGB")


BASE_BG = gradient_background()


def draw_grid(draw: ImageDraw.ImageDraw, alpha: float = 0.72) -> None:
    color = rgba(GRID, alpha)
    for x in range(-80, WIDTH + 120, 105):
        draw.line([(x, 350), (x - 100, HEIGHT + 20)], fill=color, width=2)
    for y in range(420, HEIGHT + 40, 110):
        draw.line([(0, y), (WIDTH, y - 80)], fill=color, width=2)


def draw_brand(draw: ImageDraw.ImageDraw, t: float, label: str) -> None:
    a = ease(t / 0.55)
    x = int(42 - 30 * (1.0 - a))
    draw.ellipse((x, 42, x + 18, 60), outline=rgba(GOLD, a), width=4)
    draw.ellipse((x + 6, 48, x + 12, 54), fill=rgba(GOLD_2, a))
    draw.line((x + 9, 60, x + 9, 72), fill=rgba(GOLD, a), width=4)
    draw.text((x + 29, 39), "KonyaGo", font=font(31, True), fill=rgba(WHITE, a))
    tw = draw.textbbox((0, 0), label, font=font(17, False))[2]
    draw.text((WIDTH - tw - 42, 46), label, font=font(17), fill=rgba(MUTED, a))


def draw_route(draw: ImageDraw.ImageDraw, progress: float, offset: int = 0) -> None:
    points = [
        (72, 1015 + offset),
        (208, 900 + offset),
        (334, 990 + offset),
        (466, 790 + offset),
        (587, 864 + offset),
        (650, 690 + offset),
    ]
    lengths = []
    total = 0.0
    for p1, p2 in zip(points, points[1:]):
        length = math.dist(p1, p2)
        lengths.append(length)
        total += length
    target = clamp(progress) * total
    consumed = 0.0
    rendered: list[tuple[float, float]] = [points[0]]
    for i, length in enumerate(lengths):
        p1, p2 = points[i], points[i + 1]
        if consumed + length <= target:
            rendered.append(p2)
            consumed += length
            continue
        part = clamp((target - consumed) / max(length, 1e-6))
        rendered.append((p1[0] + (p2[0] - p1[0]) * part, p1[1] + (p2[1] - p1[1]) * part))
        break
    if len(rendered) > 1:
        draw.line(rendered, fill=GOLD, width=5, joint="curve")
    for idx, p in enumerate(points):
        node_pos = sum(lengths[:idx]) / total if idx else 0.0
        if progress + 0.02 >= node_pos:
            pulse = 1.0 + 0.10 * math.sin(2 * math.pi * (progress * 3.0 - node_pos))
            r = int(14 * pulse)
            draw.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=NAVY, outline=GOLD_2, width=4)
            draw.ellipse((p[0] - 4, p[1] - 4, p[0] + 4, p[1] + 4), fill=GOLD_2)


def draw_progress(draw: ImageDraw.ImageDraw, t: float) -> None:
    left, right, y = 42, WIDTH - 42, HEIGHT - 58
    draw.rounded_rectangle((left, y, right, y + 12), radius=6, fill=(70, 91, 104))
    width = int((right - left) * clamp(t / DURATION))
    draw.rounded_rectangle((left, y, left + max(width, 12), y + 12), radius=6, fill=GOLD)


def draw_tag(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, alpha: float) -> None:
    f = font(22, True)
    box = draw.textbbox((0, 0), text, font=f)
    w, h = box[2] + 42, box[3] + 24
    draw.rounded_rectangle((x, y, x + w, y + h), radius=h // 2, fill=rgba(GOLD, alpha))
    draw.text((x + 21, y + 10), text, font=f, fill=rgba(NAVY, alpha))


def draw_scene_text(
    draw: ImageDraw.ImageDraw,
    t: float,
    start: float,
    end: float,
    tag: str,
    title: str,
    subtitle: str | None = None,
) -> None:
    a = window(t, start, end)
    if a <= 0:
        return
    slide = int(44 * (1.0 - ease((t - start) / 0.42)))
    draw_tag(draw, tag, 42 - slide, 142, a)
    lines = title.split("\n")
    y = 230
    for line in lines:
        draw.text((42 - slide, y), line, font=font(68, True), fill=rgba(WHITE, a))
        y += 78
    if subtitle:
        draw.text((44 - slide, y + 10), subtitle, font=font(28), fill=rgba(MUTED, a))


def draw_final(draw: ImageDraw.ImageDraw, t: float, start: float, heading: str, subheading: str) -> None:
    a = ease((t - start) / 0.55) if t >= start else 0.0
    if a <= 0:
        return
    lift = int(32 * (1.0 - a))
    draw.text((42, 175 + lift), heading, font=font(68, True), fill=rgba(WHITE, a))
    draw.text((44, 345 + lift), subheading, font=font(31), fill=rgba(GOLD_2, a))
    draw.rounded_rectangle((42, 425 + lift, WIDTH - 42, 510 + lift), radius=22, fill=rgba((13, 52, 70), a), outline=rgba(GOLD, a), width=3)
    draw.text((75, 446 + lift), "konyago.com.tr", font=font(34, True), fill=rgba(WHITE, a))
    draw.text((75, 505 + lift), "Konya'nın yeni nesil şehir rehberi", font=font(20), fill=rgba(MUTED, a))


def render_three_questions(t: float) -> Image.Image:
    image = BASE_BG.copy().convert("RGBA")
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw_grid(draw)
    draw_brand(draw, t, "10 SANİYEDE PLAN")
    draw_route(draw, ease((t - 0.45) / 8.8))
    draw_scene_text(draw, t, 0.25, 2.7, "01", "Nereye\ngidelim?", "Ruhuna uygun bir rota")
    draw_scene_text(draw, t, 2.45, 4.95, "02", "Ne\nyiyelim?", "Konya'nın gerçek lezzetleri")
    draw_scene_text(draw, t, 4.70, 7.25, "03", "Yakınımda\nne var?", "Şehrin tamamı tek ekranda")
    draw_final(draw, t, 7.05, "Üç soru.\nTek cevap.", "KonyaGo AI'ya sor.")
    draw_progress(draw, t)
    return Image.alpha_composite(image, layer).convert("RGB")


def render_guest_route(t: float) -> Image.Image:
    image = BASE_BG.copy().convert("RGBA")
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw_grid(draw)
    draw_brand(draw, t, "ŞEHİR SENARYOSU / 01")
    draw_route(draw, ease((t - 0.55) / 8.4), offset=15)
    draw_scene_text(draw, t, 0.25, 2.25, "03 SAAT", "Misafirin\ngeldi.", "Panik yok.")
    draw_scene_text(draw, t, 2.0, 4.2, "01", "Tarih", "Şehrin hafızası")
    draw_scene_text(draw, t, 3.95, 6.15, "02", "Lezzet", "Masaya gelen Konya")
    draw_scene_text(draw, t, 5.90, 8.15, "03", "Gün batımı", "Günü doğru yerde bitir")
    draw_final(draw, t, 7.95, "Rotan hazır.", "KonyaGo AI'ya sor.")
    draw_progress(draw, t)
    return Image.alpha_composite(image, layer).convert("RGB")


@dataclass(frozen=True)
class AudioStyle:
    bpm: float
    lead_notes: tuple[float, ...]
    bass_notes: tuple[float, ...]
    seed: int


def midi(note: float) -> float:
    return 440.0 * 2.0 ** ((note - 69.0) / 12.0)


def adsr(local_t: np.ndarray, duration: float, attack: float, decay: float, sustain: float, release: float) -> np.ndarray:
    env = np.zeros_like(local_t)
    attack_mask = (local_t >= 0) & (local_t < attack)
    env[attack_mask] = local_t[attack_mask] / max(attack, 1e-6)
    decay_mask = (local_t >= attack) & (local_t < attack + decay)
    env[decay_mask] = 1.0 - (1.0 - sustain) * ((local_t[decay_mask] - attack) / max(decay, 1e-6))
    sustain_mask = (local_t >= attack + decay) & (local_t < duration - release)
    env[sustain_mask] = sustain
    release_mask = (local_t >= duration - release) & (local_t <= duration)
    env[release_mask] = sustain * (1.0 - (local_t[release_mask] - (duration - release)) / max(release, 1e-6))
    return np.clip(env, 0.0, 1.0)


def add_tone(track: np.ndarray, start: float, duration: float, freq: float, amp: float, kind: str = "sine", vibrato: float = 0.0) -> None:
    i0 = max(0, int(start * SR))
    i1 = min(track.size, int((start + duration) * SR))
    if i1 <= i0:
        return
    tt = np.arange(i1 - i0, dtype=np.float64) / SR
    phase = 2.0 * np.pi * freq * tt
    if vibrato:
        phase += (freq * vibrato / 5.2) * np.sin(2.0 * np.pi * 5.2 * tt)
    if kind == "triangle":
        wave_data = 2.0 / np.pi * np.arcsin(np.sin(phase))
    elif kind == "soft_saw":
        wave_data = np.zeros_like(tt)
        for h in range(1, 7):
            wave_data += ((-1.0) ** (h + 1)) * np.sin(h * phase) / h
        wave_data *= 0.55
    else:
        wave_data = np.sin(phase)
    env = adsr(tt, duration, 0.025, 0.10, 0.72, min(0.22, duration * 0.35))
    track[i0:i1] += amp * wave_data * env


def synth_audio(style: AudioStyle) -> np.ndarray:
    rng = np.random.default_rng(style.seed)
    n = int(DURATION * SR)
    music = np.zeros(n, dtype=np.float64)
    beat = 60.0 / style.bpm

    chord_roots = (50, 46, 48, 45)
    for bar, root in enumerate(chord_roots * 2):
        start = bar * 2.0 * beat
        if start >= DURATION:
            break
        for semitone, level in ((0, 0.050), (3, 0.042), (7, 0.038), (12, 0.025)):
            add_tone(music, start, min(2.05 * beat, DURATION - start), midi(root + semitone), level, "sine")

    for k in range(int(DURATION / beat) + 2):
        start = k * beat
        i0 = int(start * SR)
        i1 = min(n, i0 + int(0.22 * SR))
        if i0 >= n:
            break
        tt = np.arange(i1 - i0, dtype=np.float64) / SR
        freq = 82.0 * np.exp(-tt * 18.0) + 42.0
        phase = 2.0 * np.pi * np.cumsum(freq) / SR
        music[i0:i1] += 0.46 * np.sin(phase) * np.exp(-tt * 18.0)
        click_len = min(i1 - i0, int(0.018 * SR))
        music[i0:i0 + click_len] += 0.055 * rng.normal(size=click_len) * np.linspace(1.0, 0.0, click_len)

    for k in range(int(DURATION / (beat / 2.0)) + 2):
        start = k * beat / 2.0
        i0 = int(start * SR)
        i1 = min(n, i0 + int(0.065 * SR))
        if i0 >= n:
            break
        tt = np.arange(i1 - i0, dtype=np.float64) / SR
        noise = rng.normal(size=i1 - i0)
        noise = np.concatenate(([0.0], np.diff(noise)))
        music[i0:i1] += 0.026 * noise * np.exp(-tt * 55.0)

    for k in range(int(DURATION / beat) + 2):
        if k % 4 not in (1, 3):
            continue
        start = k * beat
        i0 = int(start * SR)
        i1 = min(n, i0 + int(0.16 * SR))
        if i0 >= n:
            break
        tt = np.arange(i1 - i0, dtype=np.float64) / SR
        noise = rng.normal(size=i1 - i0)
        clap_env = np.exp(-tt * 24.0) * (1.0 + 0.45 * np.sin(2 * np.pi * 36 * tt))
        music[i0:i1] += 0.070 * noise * clap_env

    for k in range(int(DURATION / beat) + 2):
        start = k * beat
        note = style.bass_notes[k % len(style.bass_notes)]
        add_tone(music, start + 0.03, min(0.72 * beat, DURATION - start), midi(note), 0.15, "triangle")

    phrase = beat * 2.0
    for k, note in enumerate(style.lead_notes * 3):
        start = 0.30 + k * phrase * 0.52
        if start >= DURATION - 0.25:
            break
        duration = min(phrase * 0.80, DURATION - start)
        freq = midi(note)
        i0 = int(start * SR)
        i1 = min(n, int((start + duration) * SR))
        tt = np.arange(i1 - i0, dtype=np.float64) / SR
        vib = 1.0 + 0.0045 * np.sin(2 * np.pi * 5.15 * tt)
        phase = 2 * np.pi * np.cumsum(freq * vib) / SR
        lead = np.sin(phase) + 0.24 * np.sin(2 * phase + 0.3) + 0.09 * np.sin(3 * phase + 0.7)
        breath = rng.normal(size=tt.size)
        breath = np.convolve(breath, np.ones(18) / 18.0, mode="same")
        env = adsr(tt, duration, 0.10, 0.16, 0.72, min(0.28, duration * 0.33))
        music[i0:i1] += (0.085 * lead + 0.012 * breath) * env

    delay = int(0.27 * SR)
    wet = music.copy()
    wet[delay:] += 0.23 * music[:-delay]
    delay2 = int(0.41 * SR)
    wet[delay2:] += 0.13 * music[:-delay2]
    left = wet.copy()
    right = wet.copy()
    stereo_delay = int(0.012 * SR)
    right[stereo_delay:] = 0.92 * wet[:-stereo_delay]
    stereo = np.stack([left, right], axis=1)
    stereo = np.tanh(stereo * 1.55)
    peak = float(np.max(np.abs(stereo))) or 1.0
    return (stereo / peak * 0.91).astype(np.float32)


def write_wav(path: Path, audio: np.ndarray) -> None:
    pcm = np.int16(np.clip(audio, -1.0, 1.0) * 32767)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(2)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        handle.writeframes(pcm.tobytes())


def encode_video(output: Path, renderer: Callable[[float], Image.Image], style: AudioStyle) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    work = output.parent / ".render"
    work.mkdir(parents=True, exist_ok=True)
    wav_path = work / f"{output.stem}.wav"
    write_wav(wav_path, synth_audio(style))
    command = [
        "ffmpeg", "-y",
        "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-",
        "-i", str(wav_path),
        "-c:v", "libx264", "-preset", "slow", "-crf", "24",
        "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k", "-ar", str(SR),
        "-movflags", "+faststart", "-shortest", str(output),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    try:
        for frame in range(FRAMES):
            t = frame / FPS
            process.stdin.write(renderer(t).tobytes())
    finally:
        process.stdin.close()
    result = process.wait()
    if result != 0:
        raise RuntimeError(f"ffmpeg failed for {output} with status {result}")
    wav_path.unlink(missing_ok=True)


def main() -> int:
    if shutil.which("ffmpeg") is None:
        print("ffmpeg is required", file=sys.stderr)
        return 2
    target = Path(sys.argv[1] if len(sys.argv) > 1 else "assets/social")
    target.mkdir(parents=True, exist_ok=True)
    encode_video(
        target / "konyago-3-soru-premium-reel.mp4",
        render_three_questions,
        AudioStyle(bpm=112.0, lead_notes=(62, 65, 69, 67, 65), bass_notes=(38, 38, 34, 36), seed=4201),
    )
    encode_video(
        target / "konyago-misafir-3-saat-premium-reel.mp4",
        render_guest_route,
        AudioStyle(bpm=104.0, lead_notes=(62, 65, 67, 69, 65), bass_notes=(38, 34, 36, 33), seed=4202),
    )
    manifest = target / "RIGHTS-MANIFEST.txt"
    manifest.write_text(
        "KonyaGo Premium Social Assets\n"
        "Generated entirely from original procedural vector graphics and mathematical audio synthesis.\n"
        "No third-party music, samples, loops, stock footage, or external images are included.\n"
        "Production format: 720x1280, 24 fps, H.264/AAC, 10 seconds.\n",
        encoding="utf-8",
    )
    print(f"Generated social assets in {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
