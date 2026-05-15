# cunps-bible-zh

新標點和合本（**CUNP**，簡體）聖經抓取工具與全本資料。

- **譯本**：新標點和合本 簡體字版（CUNP Simplified）
- **資料來源**：[信望愛 fhl.net](https://bible.fhl.net) JSON API（`version=nstrunv`）
- **規模**：66 卷 / 1,189 章 / 31,103 節（含 71 節「並於上節」標記）

## 檔案結構

```
.
├── cunps.py                 # 主腳本（fetch / derive / validate）
├── books.py                 # 66 卷中繼資料
├── requirements.txt         # 依賴：requests
└── data/cunps/
    ├── books/<CODE>.json    # 每卷一檔，結構化 JSON
    ├── text/<CODE>/NN.txt   # 每章一檔，純文字（便於 grep）
    ├── manifest.json        # 全本索引
    └── report/diff.json     # 與 bolls.life CUNPS 交叉校對結果
```

`<CODE>` 為 USFM 標準三字母代碼（`GEN`, `EXO`, …, `REV`）。

## 用法

```bash
pip install -r requirements.txt

# 抓取（有快取於 .cache/，重跑秒級）
python cunps.py fetch [--only GEN,EXO] [--force]

# JSON → 純文字
python cunps.py derive [--only GEN]

# 與 bolls.life CUNPS 交叉校對
python cunps.py validate [--refresh]
```

## JSON 結構（樣例）

```json
{
  "code": "GEN",
  "name_simplified": "创世记",
  "name_traditional": "創世記",
  "chapters": 50,
  "verses_total": 1533,
  "source": "fhl.net nstrunv (gb=1)",
  "chapters_data": [
    {
      "chapter": 1,
      "verses": [
        {"sec": 1, "text": "起初，神创造天地。"},
        {"sec": 2, "text": "..."}
      ]
    }
  ]
}
```

## 純文字樣例

```
诗篇 23
1 （大卫的诗。）耶和华是我的牧者，我必不致缺乏。
2 他使我躺卧在青草地上，领我在可安歇的水边。
3 他使我的灵魂苏醒，为自己的名引导我走义路。
...
```

## 交叉校對

與 [bolls.life](https://bolls.life) `CUNPS` 版本逐節比對結果：

| 指標 | 數字 |
|---|---|
| 比對節數 | 31,103 |
| 字字一致（規範化後） | **93.5%** |
| 編輯版本實質差異 | 6.5%（2,007 節） |
| 兩家節號落差 | 2 節（DEU 13:18、PSA 116:19） |

規範化步驟：去空白、剝 HTML 標籤、統一引號（「」/“” → `"`）／破折號／中黑、古字現代字（牠/它、祂/他、妳/你）、CUNP 編輯變體（甚么/什么）。

剩餘 6.5% 已驗證為兩家編輯版本的實質差異，並非抓取錯誤，主要類別：
- 註釋用語：「或译」/「或作」、「原文是」/「原文作」
- 字形變體：藉/借、姊/姐、合适/合式
- 註釋插入位置不同
- 約 1 處方向字（GEN 14:15 北/左）

完整 diff 報告見 `data/cunps/report/diff.json`。

## 「並於上節」處理

CUNP 中部分節為保持節號與英／希伯來原文一致，但內容已併入上節。
共 **71 節** 屬此類，FHL API 回應 `'a'` placeholder，已自動填為 `并于上节`，
與 bolls.life CUNPS 的 `<sup>并于上节</sup>` 標記語意一致。

## 授權與聲明

- 程式碼：MIT
- 聖經文本：屬於原譯本及聖經公會的版權。本倉庫僅作個人研究／程式介接之用，
  請尊重原譯本版權。商業／公開散布請洽相關聖經公會。
