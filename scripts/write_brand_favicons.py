#!/usr/bin/env python3
import base64, pathlib, subprocess
ROOT = pathlib.Path(__file__).resolve().parents[1]
b64 = (ROOT / "scripts/brand-icon.b64").read_text().strip()
src = ROOT / "assets/img/brand-icon-src.jpg"
src.parent.mkdir(parents=True, exist_ok=True)
src.write_bytes(base64.b64decode(b64))
print("wrote", src, src.stat().st_size)
def run(c):
    print("+", " ".join(c)); subprocess.check_call(c)
run(["convert", str(src), "-resize", "48x48", str(ROOT/"assets/img/favicon-48.png")])
run(["convert", str(src), "-resize", "96x96", str(ROOT/"assets/img/favicon-96.png")])
run(["convert", str(src), "-resize", "192x192", str(ROOT/"assets/img/favicon-192.png")])
run(["convert", str(src), "-resize", "180x180", str(ROOT/"assets/img/apple-touch-icon.png")])
run(["convert", str(ROOT/"assets/img/favicon-48.png"), str(ROOT/"assets/img/favicon-96.png"), str(ROOT/"favicon.ico")])
print("done")
