"""扫描 web/out 与 web/public/bible 下所有 HTML/JSON/JS 文件，
用 OpenCC t2s 反向核对，列出任何含有繁体字的位置。

跑法：
    conda activate cunps-bible
    python web/scripts/check-simplified.py
"""
from __future__ import annotations

import sys
from pathlib import Path

import opencc

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "out",
    ROOT / "public" / "bible",
    ROOT / "public" / "manifest.webmanifest",
]
EXTS = {".html", ".htm", ".json", ".js", ".css", ".webmanifest", ".txt"}

# 这些字串里可能掺杂英文/USFM/拉丁标点：只看中文统一字段。
CJK_RANGE = (0x4E00, 0x9FFF)


def is_cjk(ch: str) -> bool:
    return CJK_RANGE[0] <= ord(ch) <= CJK_RANGE[1]


def iter_files() -> list[Path]:
    out: list[Path] = []
    for t in TARGETS:
        if t.is_file():
            out.append(t)
        elif t.is_dir():
            for p in t.rglob("*"):
                if p.is_file() and (p.suffix in EXTS or p.name.endswith(".webmanifest")):
                    out.append(p)
    return out


def main() -> int:
    cc = opencc.OpenCC("t2s")
    files = iter_files()
    print(f"扫描 {len(files)} 个文件…", file=sys.stderr)
    bad: list[tuple[Path, list[tuple[int, str, str]]]] = []
    for f in files:
        try:
            text = f.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        converted = cc.convert(text)
        if converted == text:
            continue
        # 收集所有差异点
        diffs: list[tuple[int, str, str]] = []
        for i, (a, b) in enumerate(zip(text, converted)):
            if a != b and is_cjk(a):
                diffs.append((i, a, b))
        if diffs:
            bad.append((f, diffs))
    if not bad:
        print("✓ 全部文件均为简体，未发现繁体字。")
        return 0
    print(f"✗ 发现 {len(bad)} 个文件含繁体字：")
    for f, diffs in bad:
        rel = f.relative_to(ROOT)
        unique = sorted({d[1] for d in diffs})
        sample_idx = diffs[0][0]
        ctx = f.read_text(encoding="utf-8")[max(0, sample_idx - 30):sample_idx + 30]
        print(f"  {rel}  繁体字 {len(diffs)} 处，独立字符: {''.join(unique[:30])}")
        print(f"    例: …{ctx}…")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
