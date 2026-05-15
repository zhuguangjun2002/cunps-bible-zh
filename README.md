# cunps-bible-zh

新标点和合本（**CUNP**，简体）圣经抓取工具、全本数据，与网页阅读器。

- **译本**：新标点和合本 简体字版（CUNP Simplified）
- **数据来源**：[信望爱 fhl.net](https://bible.fhl.net) JSON API（`version=nstrunv`，`gb=1`）
- **规模**：66 卷 / 1,189 章 / 31,103 节（含 71 节「并于上节」标记）
- **网页阅读器**：[`https://zhuguangjun2002.github.io/cunps-bible-zh/`](https://zhuguangjun2002.github.io/cunps-bible-zh/)（Next.js 静态站，PWA 可离线）

## 文件结构

```
.
├── cunps.py                 # 主脚本（fetch / derive / validate）
├── books.py                 # 66 卷中继数据
├── corrections.py           # 上游错字订正表（fetch 时应用）
├── requirements.txt         # Python 依赖（requests）
├── data/cunps/
│   ├── books/<CODE>.json    # 每卷一份结构化 JSON
│   ├── text/<CODE>/NN.txt   # 每章一份纯文本（便于 grep）
│   ├── manifest.json        # 全本索引
│   └── report/diff.json     # 与 bolls.life CUNPS 交叉校对结果
├── web/                     # Next.js 静态阅读器（详见下方「网页版」）
└── .github/workflows/       # GitHub Pages 自动部署
```

`<CODE>` 为 USFM 标准三字母代码（`GEN`、`EXO`、…、`REV`）。

## Python 抓取工具

```bash
pip install -r requirements.txt

# 抓取（缓存在 .cache/，重跑秒级）
python cunps.py fetch [--only GEN,EXO] [--force]

# JSON → 纯文本
python cunps.py derive [--only GEN]

# 与 bolls.life CUNPS 交叉校对
python cunps.py validate [--refresh]
```

### JSON 结构（样例）

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

### 纯文本样例

```
诗篇 23
1 （大卫的诗。）耶和华是我的牧者，我必不致缺乏。
2 他使我躺卧在青草地上，领我在可安歇的水边。
3 他使我的灵魂苏醒，为自己的名引导我走义路。
...
```

## 上游错字订正

fhl.net 的 CUNP 简体数据有少数明显错字（经 bolls.life CUNPS 交叉确认），
在 `fetch` 步骤就地修正后才写入 `data/cunps/books/*.json` 与
`data/cunps/text/*/*.txt`。当前订正 **5 处**：

| 经文 | fhl.net | 正确 |
|---|---|---|
| 1CH 8:28 | 着名 | 著名 |
| 1CH 9:34 | 着名 | 著名 |
| 1CH 12:30 | 着名 | 著名 |
| AMO 6:1 | 着名 | 著名 |
| ECC 12:12 | 着书 | 著书 |

订正表见 `corrections.py`，若 `from` 子串找不到（上游修复或文本变化）脚本会
`raise` 报错提醒。仅修正**明显错字**，CUNP 编辑变体字（藉/借、覆/复、姊/姐 …）
按译本原貌保留。

### 注意区分助词「着」

以下两节里的「着名／着书」是助词组合（按着、遵着），不可一并替换：

- 2KI 22:13 — 没有遵**着**书上所吩咐我们的去行
- JHN 10:3 — 他按**着**名叫自己的羊

## 交叉校对

与 [bolls.life](https://bolls.life) `CUNPS` 版本逐节比对结果：

| 指标 | 数字 |
|---|---|
| 比对节数 | 31,103 |
| 字字一致（规范化后） | **93.5%** |
| 编辑版本实质差异 | 6.5%（2,007 节） |
| 两家节号落差 | 2 节（DEU 13:18、PSA 116:19） |

规范化步骤：去空白、剥 HTML 标签、统一引号（「」/“” → `"`）/ 破折号 / 中黑、
古字现代字（牠/它、祂/他、妳/你）、CUNP 编辑变体（甚么/什么）。

剩余 6.5% 已验证为两家编辑版本的实质差异，并非抓取错误，主要类别：

- 注释用语：「或译」/「或作」、「原文是」/「原文作」
- 字形变体：藉/借、姊/姐、合适/合式
- 注释插入位置不同
- 约 1 处方向字（GEN 14:15 北/左）

完整 diff 报告见 `data/cunps/report/diff.json`。

## 「并于上节」处理

CUNP 中部分节为保持节号与英 / 希伯来原文一致，但内容已并入上节。
共 **71 节** 属此类，FHL API 回应 `'a'` placeholder，已自动填为「并于上节」，
与 bolls.life CUNPS 的 `<sup>并于上节</sup>` 标记语义一致。

## 网页版（web/）

基于本仓库数据的 Next.js 静态阅读器，仅简体显示、可装为 PWA、离线可读。

### 功能

- 66 卷书卷网格 → 章节阅读，URL 形如 `/read/GEN/1/`，每节有 `#vN` 锚点便于分享
- 顶部输入框两用：
  - 经文引用直接跳转：`诗 23:1`、`Gen 1:1`、`PSA.23.1` 都识别
  - 否则走全文搜索（MiniSearch + 中文 bigram 分词，毫秒级）
- 键盘：`←` / `→` 翻章、`/` 聚焦搜索框
- 深色模式（持久化 localStorage，避免 FOUC）
- Service Worker：阅读页 stale-while-revalidate、搜索索引 cache-first，离线可读
- PWA：可装到桌面 / 手机

### 本地开发

```bash
cd web
npm install
npm run dev          # http://localhost:3000
npm run build        # 静态导出到 web/out/
npx serve out -p 8080
```

### 数据流

构建前置脚本会从仓库数据派生：

- `scripts/export-data.mjs`：读 `../data/cunps/books/*.json` → 写每章 JSON 到
  `web/public/bible/<CODE>/<NN>.json`，同时生成 `web/lib/generated/books.ts`
  供前端 import
- `scripts/build-search-index.mjs`：读上一步产物，建 MiniSearch 索引到
  `web/public/search-index.json`

构建产物（`web/out/`、`web/public/bible/`、`web/public/search-index.json`、
`web/lib/generated/`）都不入库 —— 它们是可重新生成的派生物。

### 部署

`.github/workflows/deploy.yml` 在 push to `main` 时自动构建并发布到 GitHub Pages
（仅当 `web/**`、`data/cunps/books/**` 或 workflow 本身有变化时触发）。
首次需要在仓库 `Settings → Pages` 把 Source 切到 `GitHub Actions`。

## 授权与声明

- 程式码：MIT
- 圣经文本：属于原译本及圣经公会的版权。本仓库仅作个人研究 / 程式介接之用，
  请尊重原译本版权。商业 / 公开散布请洽相关圣经公会。
