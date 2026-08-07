#!/usr/bin/env python3
import base64, pathlib, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
b64_path = ROOT / "scripts/brand-icon.b64"
if not b64_path.exists():
    print("missing brand-icon.b64", file=sys.stderr)
    sys.exit(1)
b64 = b64_path.read_text().strip()
src = ROOT / "assets/img/brand-icon-src.jpg"
src.parent.mkdir(parents=True, exist_ok=True)
src.write_bytes(base64.b64decode(b64))
print("wrote", src, src.stat().st_size)

def run(c):
    print("+", " ".join(c))
    subprocess.check_call(c)

# High quality resize with ImageMagick
for size, name in [(48, "favicon-48.png"), (96, "favicon-96.png"), (192, "favicon-192.png"), (180, "apple-touch-icon.png")]:
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
