"""CUNP 简体版上游错字订正。

fhl.net 的 nstrunv（gb=1）数据在少数节里出现明显错字，
经 bolls.life CUNPS 交叉确认后在此集中修正。

每条订正用 (code, chapter, verse, from, to) 精确锁定；
应用时若找不到 `from` 子串会 raise，提示订正已失效（fhl 自己修了或文本变化）。

判别原则：
- 是「字形/编辑变体」的（藉/借、覆/复、姊/姐 …）—— 保持原版，不在这里订正
- 是明显的错字、且 bolls.life CUNPS 同节是正确写法的 —— 在这里订正
"""
from __future__ import annotations

# (book_code, chapter, verse, from_substr, to_substr)
CORRECTIONS: list[tuple[str, int, int, str, str]] = [
    # 着 ↔ 著（fhl 把作动词/形容词的「著」也写成了「着」）
    # 助词「着」（按着、遵着、照着 …）保持不变
    ("1CH",  8, 28, "着名", "著名"),  # 这些人都是著名的族长
    ("1CH",  9, 34, "着名", "著名"),  # 利未人著名的族长
    ("1CH", 12, 30, "着名", "著名"),  # 在本族著名的有二万零八百人
    ("AMO",  6,  1, "着名", "著名"),  # 国为列国之首，人最著名
    ("ECC", 12, 12, "着书", "著书"),  # 著书多，没有穷尽
]


def apply_corrections(code: str, chapters_data: list[dict]) -> int:
    """对 chapters_data 原地应用订正，返回应用条数。"""
    expected = sum(1 for c in CORRECTIONS if c[0] == code)
    applied = 0
    for entry_code, ch, sec, src, dst in CORRECTIONS:
        if entry_code != code:
            continue
        target = next(
            (
                v
                for chap in chapters_data
                if chap["chapter"] == ch
                for v in chap["verses"]
                if v["sec"] == sec
            ),
            None,
        )
        if target is None:
            raise RuntimeError(
                f"corrections: {code} {ch}:{sec} 不存在（订正表过期？）"
            )
        if src not in target["text"]:
            raise RuntimeError(
                f"corrections: {code} {ch}:{sec} 找不到「{src}」（上游已修复？）\n"
                f"  当前文本: {target['text']}"
            )
        target["text"] = target["text"].replace(src, dst)
        applied += 1
    if applied != expected:
        raise RuntimeError(
            f"corrections: {code} 期望应用 {expected} 条，实际 {applied}"
        )
    return applied
