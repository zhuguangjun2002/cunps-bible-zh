"""新标点和合本（CUNP）抓取工具。

子命令：
  fetch    从 fhl.net API 抓取所有章节，按卷写入 JSON（含错字订正，见 corrections.py）
  derive   从 JSON 派生纯文本（每章一份）
  validate 与 bolls.life CUNPS 参考数据逐节比对

用法：
  python cunps.py fetch [--only CODE] [--force]
  python cunps.py derive [--only CODE]
  python cunps.py validate [--refresh]
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import random
import re
import sys
import time
import unicodedata
from pathlib import Path
from typing import Iterable

import requests

from books import BOOKS, BY_CODE
from corrections import apply_corrections

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "cunps"
BOOKS_DIR = DATA / "books"
TEXT_DIR = DATA / "text"
REPORT_DIR = DATA / "report"
CACHE_DIR = ROOT / ".cache" / "nstrunv"

FHL_ENDPOINT = "https://bible.fhl.net/json/qb.php"
USER_AGENT = "cunps-fetcher/1.0 (private archive; contact: zhuguangjun2002@gmail.com)"

# ---- fetch ----------------------------------------------------------------


def _fetch_chapter(session: requests.Session, fhl_name: str, chap: int) -> dict:
    """单章抓取，含指数退避重试。返回 raw JSON。

    注意：FHL API 在 gb=1 时必须送简体简称（fhl_s），否则 fallback 到默认「罗」。
    响应的 record[0].chineses 必须等于送出的 fhl_name，否则视为失败。
    """
    delay = 1.0
    last_err: Exception | None = None
    for attempt in range(3):
        try:
            r = session.get(
                FHL_ENDPOINT,
                params={
                    "chineses": fhl_name,
                    "chap": chap,
                    "version": "nstrunv",
                    "gb": 1,  # 簡體
                },
                timeout=20,
            )
            r.raise_for_status()
            data = r.json()
            if data.get("status") != "success":
                raise RuntimeError(f"API status={data.get('status')} msg={data.get('msg')}")
            if not data.get("record"):
                raise RuntimeError("Empty record array")
            got = data["record"][0].get("chineses", "")
            if got != fhl_name:
                raise RuntimeError(f"book mismatch: sent {fhl_name!r}, got {got!r}")
            return data
        except Exception as e:  # noqa: BLE001
            last_err = e
            if attempt < 2:
                time.sleep(delay)
                delay *= 2
    raise RuntimeError(f"Failed to fetch {fhl_name} {chap}: {last_err}")


def _cached_chapter(session: requests.Session, code: str, fhl_name: str, chap: int, force: bool) -> dict:
    """读缓存，缺则抓并写缓存。"""
    cache_path = CACHE_DIR / code / f"{chap:03d}.json"
    if cache_path.exists() and not force:
        return json.loads(cache_path.read_text(encoding="utf-8"))
    data = _fetch_chapter(session, fhl_name, chap)
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    time.sleep(random.uniform(0.5, 1.0))  # 限流
    return data


def cmd_fetch(args: argparse.Namespace) -> int:
    BOOKS_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    targets = _filter_books(args.only)
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    manifest_books = []
    total_verses_all = 0

    for i, book in enumerate(targets, 1):
        code = book["code"]
        chapters_data = []
        verses_total = 0
        chap_count = book["chapters"]
        for chap in range(1, chap_count + 1):
            data = _cached_chapter(session, code, book["fhl_s"], chap, args.force)
            verses = []
            for rec in data["record"]:
                text = rec["bible_text"].strip()
                # FHL 在 CUNP「并于上节」（内容已并入前一节以保持节号）响应 placeholder 'a'
                if text == "a":
                    text = "并于上节"
                verses.append({"sec": int(rec["sec"]), "text": text})
            chapters_data.append({"chapter": chap, "verses": verses})
            verses_total += len(verses)
            print(f"  [{i:02d}/{len(targets):02d}] {code} {chap:>3}/{chap_count}  verses={len(verses)}", flush=True)

        # 应用上游错字订正（见 corrections.py）
        n_fixed = apply_corrections(code, chapters_data)
        if n_fixed:
            print(f"  -> {code}: 应用 {n_fixed} 条订正", flush=True)

        out = {
            "code": code,
            "fhl": book["fhl_s"],
            "name_traditional": book["name_t"],
            "name_simplified": book["name_s"],
            "chapters": chap_count,
            "verses_total": verses_total,
            "source": "fhl.net nstrunv (gb=1)",
            "fetched_at": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "chapters_data": chapters_data,
        }
        (BOOKS_DIR / f"{code}.json").write_text(
            json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        manifest_books.append({
            "code": code,
            "name": book["name_s"],
            "chapters": chap_count,
            "verses_total": verses_total,
        })
        total_verses_all += verses_total
        print(f"  -> wrote {code}.json  ({verses_total} verses)", flush=True)

    # 只有抓全本时才写 manifest
    if not args.only:
        manifest = {
            "version": "nstrunv (新标点和合本，简体)",
            "source": FHL_ENDPOINT,
            "generated_at": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "books": manifest_books,
            "totals": {
                "books": len(manifest_books),
                "chapters": sum(b["chapters"] for b in manifest_books),
                "verses": total_verses_all,
            },
        }
        (DATA / "manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"\nmanifest.json: {len(manifest_books)} books, "
              f"{manifest['totals']['chapters']} chapters, "
              f"{manifest['totals']['verses']} verses")
    return 0


# ---- derive ---------------------------------------------------------------


def cmd_derive(args: argparse.Namespace) -> int:
    targets = _filter_books(args.only)
    for book in targets:
        code = book["code"]
        src = BOOKS_DIR / f"{code}.json"
        if not src.exists():
            print(f"  SKIP {code}: {src} not found", file=sys.stderr)
            continue
        data = json.loads(src.read_text(encoding="utf-8"))
        out_dir = TEXT_DIR / code
        out_dir.mkdir(parents=True, exist_ok=True)
        for ch in data["chapters_data"]:
            lines = [f"{data['name_simplified']} {ch['chapter']}"]
            for v in ch["verses"]:
                lines.append(f"{v['sec']} {v['text']}")
            (out_dir / f"{ch['chapter']:02d}.txt").write_text(
                "\n".join(lines) + "\n", encoding="utf-8"
            )
        print(f"  {code}: {len(data['chapters_data'])} chapter files")
    return 0


# ---- validate -------------------------------------------------------------

# CUNP 简体参考数据来源（GitHub raw URL）。实作时择优使用。
REFERENCE_URLS = [
    # bolls.life 开放 API（CUV 简体，字段 pk/chapter/verse/text）
    "https://bolls.life/get-text/CUNPS/{book}/{chap}/",
]

# bolls.life 使用 1..66 的书卷编号（与我们的 BOOKS 顺序一致）


_TAG_RE = re.compile(r"<[^>]+>")


def _normalize(s: str) -> str:
    s = unicodedata.normalize("NFC", s)
    # 剥除 bolls.life 内嵌的标示 HTML（<i> 翻译插入字 / <e> 专有名词 / <sup> 注解 / <br>）
    s = _TAG_RE.sub("", s)
    # 各家用词 / 字形差异
    for src, dst in [
        ("甚麼", "什麼"), ("甚么", "什么"),  # FHL 用「甚」，bolls 用「什」
        ("──", "—"), ("―", "—"), ("--", "—"),  # 破折号统一
    ]:
        s = s.replace(src, dst)
    # 标点与空白统一移除（只比较汉字 / 数字内容）
    drop = set("　 \t\r\n「」“”『』‘’\"'（）()〔〕[]【】《》、，。．,.;:!?？！…─—－–-·•‧・*")
    s = "".join(ch for ch in s if ch not in drop)
    # 古字 ↔ 现代字（CUNP 不同版本互换）
    char_map = str.maketrans({"牠": "它", "祂": "他", "妳": "你"})
    return s.translate(char_map)


def _fetch_reference_book(session: requests.Session, book_idx: int, chapters: int) -> dict[tuple[int, int], str]:
    """从 bolls.life 抓参考数据，返回 {(chap, sec): text}。"""
    out: dict[tuple[int, int], str] = {}
    for chap in range(1, chapters + 1):
        url = f"https://bolls.life/get-text/CUNPS/{book_idx}/{chap}/"
        for attempt in range(3):
            try:
                r = session.get(url, timeout=20)
                r.raise_for_status()
                verses = r.json()
                for v in verses:
                    out[(chap, int(v["verse"]))] = v["text"]
                break
            except Exception:  # noqa: BLE001
                if attempt == 2:
                    raise
                time.sleep(2 ** attempt)
        time.sleep(random.uniform(0.3, 0.6))
    return out


def cmd_validate(args: argparse.Namespace) -> int:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    ref_cache = ROOT / ".cache" / "reference_bolls.json"

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    # 加载或抓取参考数据
    if ref_cache.exists() and not args.refresh:
        reference = json.loads(ref_cache.read_text(encoding="utf-8"))
        print(f"loaded reference from cache: {ref_cache}")
    else:
        print("fetching reference from bolls.life (CUNPS)…")
        reference = {}
        for idx, book in enumerate(BOOKS, 1):
            print(f"  ref {idx:02d} {book['code']}", flush=True)
            book_ref = _fetch_reference_book(session, idx, book["chapters"])
            reference[book["code"]] = {f"{c}:{s}": t for (c, s), t in book_ref.items()}
        ref_cache.parent.mkdir(parents=True, exist_ok=True)
        ref_cache.write_text(json.dumps(reference, ensure_ascii=False), encoding="utf-8")

    # 逐节比对
    diffs = []
    total = 0
    mismatches = 0
    missing_in_ref = 0
    for book in BOOKS:
        code = book["code"]
        src = BOOKS_DIR / f"{code}.json"
        if not src.exists():
            print(f"  SKIP {code}: local JSON missing")
            continue
        local = json.loads(src.read_text(encoding="utf-8"))
        ref_book = reference.get(code, {})
        for ch in local["chapters_data"]:
            for v in ch["verses"]:
                key = f"{ch['chapter']}:{v['sec']}"
                total += 1
                ref_text = ref_book.get(key)
                if ref_text is None:
                    missing_in_ref += 1
                    continue
                if _normalize(v["text"]) != _normalize(ref_text):
                    mismatches += 1
                    if len(diffs) < 500:  # 限制 diff 体积
                        diffs.append({
                            "code": code,
                            "chap": ch["chapter"],
                            "sec": v["sec"],
                            "fhl": v["text"],
                            "ref": ref_text,
                        })

    report = {
        "totals": {
            "compared": total,
            "mismatches": mismatches,
            "missing_in_ref": missing_in_ref,
            "mismatch_rate": round(mismatches / max(total, 1), 6),
        },
        "diffs_sample": diffs,
    }
    (REPORT_DIR / "diff.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nTotal: {total} verses, Mismatches: {mismatches} "
          f"({report['totals']['mismatch_rate']*100:.3f}%), "
          f"Missing in ref: {missing_in_ref}")
    print(f"Report: {REPORT_DIR / 'diff.json'}")
    return 0


# ---- helpers --------------------------------------------------------------


def _filter_books(only: str | None) -> list[dict]:
    if not only:
        return BOOKS
    codes = [c.strip().upper() for c in only.split(",")]
    out = []
    for c in codes:
        if c not in BY_CODE:
            raise SystemExit(f"unknown book code: {c}")
        out.append(BY_CODE[c])
    return out


def main(argv: Iterable[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="CUNP (新标点和合本) 抓取工具")
    sub = p.add_subparsers(dest="cmd", required=True)

    p_fetch = sub.add_parser("fetch", help="从 fhl.net 抓取 JSON")
    p_fetch.add_argument("--only", help="只抓特定书卷（逗号分隔 USFM 代码，如 GEN,EXO）")
    p_fetch.add_argument("--force", action="store_true", help="忽略缓存重抓")
    p_fetch.set_defaults(func=cmd_fetch)

    p_derive = sub.add_parser("derive", help="从 JSON 派生纯文本")
    p_derive.add_argument("--only", help="只派生特定书卷")
    p_derive.set_defaults(func=cmd_derive)

    p_val = sub.add_parser("validate", help="与 bolls.life CUNPS 交叉校对")
    p_val.add_argument("--refresh", action="store_true", help="忽略参考缓存重抓")
    p_val.set_defaults(func=cmd_validate)

    args = p.parse_args(list(argv) if argv is not None else None)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
