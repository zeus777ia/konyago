#!/usr/bin/env python3
import base64, pathlib, subprocess, sys, imghdr
ROOT = pathlib.Path(__file__).resolve().parents[1]
b64_path = ROOT / "scripts/brand-icon.b64"
if not b64_path.exists():
    print("missing brand-icon.b64", file=sys.stderr)
    sys.exit(1)

b64 = b64_path.read_text().strip()
try:
    data = base64.b64decode(b64)
except Exception as e:
    print("failed to decode base64 brand-icon.b64:", e, file=sys.stderr)
    sys.exit(1)

# Detect image type from bytes to avoid writing an incorrectly-typed file
img_type = imghdr.what(None, data)
if not img_type:
    print("decoded brand-icon data is not a recognized image format", file=sys.stderr)
    sys.exit(1)

ext = 'jpg' if img_type == 'jpeg' else img_type
src = ROOT / f"assets/img/brand-icon-src.{ext}"
src.parent.mkdir(parents=True, exist_ok=True)
src.write_bytes(data)
print("wrote", src, src.stat().st_size)

# Helper to run external commands and show output
def run(c):
    print("+", " ".join(c))
    subprocess.check_call(c)

# High quality resize with ImageMagick
sizes = [(48, "favicon-48.png"), (96, "favicon-96.png"), (192, "favicon-192.png"), (180, "apple-touch-icon.png")]
for size, name in sizes:
    out = ROOT / "assets/img" / name
    run([
        "convert", str(src),
        "-resize", f"{size}x{size}",
        "-quality", "95",
        "-background", "none",
        str(out)
    ])

# Multi-size ICO from the PNGs (48 + 96 is standard)
run([
    "convert",
    str(ROOT / "assets/img/favicon-48.png"),
    str(ROOT / "assets/img/favicon-96.png"),
    str(ROOT / "favicon.ico")
])
print("done - brand favicons generated from new KONYAGO app icon")
