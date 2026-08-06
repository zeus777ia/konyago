#!/usr/bin/env python3
"""KonyaGo — Meta Model API (Muse Spark) Responses ornegi.

Kullanim:
  export MODEL_API_KEY="sk-..."
  python3 scripts/meta_responses.py "web sitesi icin bir mesajlasma bolumu tasarla"

Not: API anahtarini asla GitHub'a commit etme.
Docs: https://dev.meta.ai/docs/quickstart
"""
from __future__ import annotations

import json
import os
import sys

import requests

API_URL = "https://api.meta.ai/v1/responses"
MODEL = "muse-spark-1.2"


def main() -> int:
    api_key = os.environ.get("MODEL_API_KEY", "").strip()
    if not api_key:
        print("HATA: MODEL_API_KEY ortam degiskeni yok.", file=sys.stderr)
        return 1

    prompt = " ".join(sys.argv[1:]).strip() or (
        "KonyaGo sehir rehberi sitesi icin modern, mobil uyumlu bir mesajlasma / iletisim "
        "bolumu tasarla. HTML+CSS yapisi, alanlar, validasyon ve KVKK notu oner."
    )

    # Responses API: input duz metin olabilir (resmi quickstart).
    # Bos assistant mesaji GONDERME — gereksiz ve hatali.
    payload = {
        "model": MODEL,
        "input": prompt,
        "stream": True,
        "temperature": 0.6,
        "max_output_tokens": 2048,
        "top_p": 0.9,
        "reasoning": {"effort": "medium"},
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    try:
        with requests.post(
            API_URL, headers=headers, json=payload, stream=True, timeout=120
        ) as response:
            if response.status_code >= 400:
                print(
                    f"HATA HTTP {response.status_code}: {response.text[:800]}",
                    file=sys.stderr,
                )
                return 1

            for raw in response.iter_lines(decode_unicode=True):
                if not raw:
                    continue
                line = raw.strip()
                if not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    event = json.loads(data)
                except json.JSONDecodeError:
                    print(data)
                    continue

                # Olası stream formatlari (API surumune gore degisebilir)
                if isinstance(event, dict):
                    if event.get("type") == "response.output_text.delta":
                        print(event.get("delta", ""), end="", flush=True)
                    elif "delta" in event and isinstance(event["delta"], str):
                        print(event["delta"], end="", flush=True)
                    elif event.get("output_text"):
                        print(event["output_text"], end="", flush=True)
                    else:
                        # Ham olay — debug icin
                        text = (
                            event.get("text")
                            or event.get("content")
                            or ""
                        )
                        if text:
                            print(text, end="", flush=True)
                else:
                    print(event, end="", flush=True)

            print()
            return 0
    except requests.RequestException as exc:
        print(f"Istek hatasi: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
