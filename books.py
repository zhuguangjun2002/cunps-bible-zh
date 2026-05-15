"""66 卷圣经中继数据。

- code: USFM 标准三字母代码（文件名用）
- fhl_t: 信望爱 API `chineses` 参数（繁体简称，gb=0 用）
- fhl_s: 信望爱 API `chineses` 参数（简体简称，gb=1 用 —— 否则 API 会 fallback 到 default「罗」）
- name_t: 繁体正式名
- name_s: 简体正式名
- chapters: 章数
"""

BOOKS = [
    # 舊約 39 卷
    {"code": "GEN", "fhl_t": "創",   "fhl_s": "创",   "name_t": "創世記",       "name_s": "创世记",       "chapters": 50},
    {"code": "EXO", "fhl_t": "出",   "fhl_s": "出",   "name_t": "出埃及記",     "name_s": "出埃及记",     "chapters": 40},
    {"code": "LEV", "fhl_t": "利",   "fhl_s": "利",   "name_t": "利未記",       "name_s": "利未记",       "chapters": 27},
    {"code": "NUM", "fhl_t": "民",   "fhl_s": "民",   "name_t": "民數記",       "name_s": "民数记",       "chapters": 36},
    {"code": "DEU", "fhl_t": "申",   "fhl_s": "申",   "name_t": "申命記",       "name_s": "申命记",       "chapters": 34},
    {"code": "JOS", "fhl_t": "書",   "fhl_s": "书",   "name_t": "約書亞記",     "name_s": "约书亚记",     "chapters": 24},
    {"code": "JDG", "fhl_t": "士",   "fhl_s": "士",   "name_t": "士師記",       "name_s": "士师记",       "chapters": 21},
    {"code": "RUT", "fhl_t": "得",   "fhl_s": "得",   "name_t": "路得記",       "name_s": "路得记",       "chapters": 4},
    {"code": "1SA", "fhl_t": "撒上", "fhl_s": "撒上", "name_t": "撒母耳記上",   "name_s": "撒母耳记上",   "chapters": 31},
    {"code": "2SA", "fhl_t": "撒下", "fhl_s": "撒下", "name_t": "撒母耳記下",   "name_s": "撒母耳记下",   "chapters": 24},
    {"code": "1KI", "fhl_t": "王上", "fhl_s": "王上", "name_t": "列王紀上",     "name_s": "列王纪上",     "chapters": 22},
    {"code": "2KI", "fhl_t": "王下", "fhl_s": "王下", "name_t": "列王紀下",     "name_s": "列王纪下",     "chapters": 25},
    {"code": "1CH", "fhl_t": "代上", "fhl_s": "代上", "name_t": "歷代志上",     "name_s": "历代志上",     "chapters": 29},
    {"code": "2CH", "fhl_t": "代下", "fhl_s": "代下", "name_t": "歷代志下",     "name_s": "历代志下",     "chapters": 36},
    {"code": "EZR", "fhl_t": "拉",   "fhl_s": "拉",   "name_t": "以斯拉記",     "name_s": "以斯拉记",     "chapters": 10},
    {"code": "NEH", "fhl_t": "尼",   "fhl_s": "尼",   "name_t": "尼希米記",     "name_s": "尼希米记",     "chapters": 13},
    {"code": "EST", "fhl_t": "斯",   "fhl_s": "斯",   "name_t": "以斯帖記",     "name_s": "以斯帖记",     "chapters": 10},
    {"code": "JOB", "fhl_t": "伯",   "fhl_s": "伯",   "name_t": "約伯記",       "name_s": "约伯记",       "chapters": 42},
    {"code": "PSA", "fhl_t": "詩",   "fhl_s": "诗",   "name_t": "詩篇",         "name_s": "诗篇",         "chapters": 150},
    {"code": "PRO", "fhl_t": "箴",   "fhl_s": "箴",   "name_t": "箴言",         "name_s": "箴言",         "chapters": 31},
    {"code": "ECC", "fhl_t": "傳",   "fhl_s": "传",   "name_t": "傳道書",       "name_s": "传道书",       "chapters": 12},
    {"code": "SNG", "fhl_t": "歌",   "fhl_s": "歌",   "name_t": "雅歌",         "name_s": "雅歌",         "chapters": 8},
    {"code": "ISA", "fhl_t": "賽",   "fhl_s": "赛",   "name_t": "以賽亞書",     "name_s": "以赛亚书",     "chapters": 66},
    {"code": "JER", "fhl_t": "耶",   "fhl_s": "耶",   "name_t": "耶利米書",     "name_s": "耶利米书",     "chapters": 52},
    {"code": "LAM", "fhl_t": "哀",   "fhl_s": "哀",   "name_t": "耶利米哀歌",   "name_s": "耶利米哀歌",   "chapters": 5},
    {"code": "EZK", "fhl_t": "結",   "fhl_s": "结",   "name_t": "以西結書",     "name_s": "以西结书",     "chapters": 48},
    {"code": "DAN", "fhl_t": "但",   "fhl_s": "但",   "name_t": "但以理書",     "name_s": "但以理书",     "chapters": 12},
    {"code": "HOS", "fhl_t": "何",   "fhl_s": "何",   "name_t": "何西阿書",     "name_s": "何西阿书",     "chapters": 14},
    {"code": "JOL", "fhl_t": "珥",   "fhl_s": "珥",   "name_t": "約珥書",       "name_s": "约珥书",       "chapters": 3},
    {"code": "AMO", "fhl_t": "摩",   "fhl_s": "摩",   "name_t": "阿摩司書",     "name_s": "阿摩司书",     "chapters": 9},
    {"code": "OBA", "fhl_t": "俄",   "fhl_s": "俄",   "name_t": "俄巴底亞書",   "name_s": "俄巴底亚书",   "chapters": 1},
    {"code": "JON", "fhl_t": "拿",   "fhl_s": "拿",   "name_t": "約拿書",       "name_s": "约拿书",       "chapters": 4},
    {"code": "MIC", "fhl_t": "彌",   "fhl_s": "弥",   "name_t": "彌迦書",       "name_s": "弥迦书",       "chapters": 7},
    {"code": "NAM", "fhl_t": "鴻",   "fhl_s": "鸿",   "name_t": "那鴻書",       "name_s": "那鸿书",       "chapters": 3},
    {"code": "HAB", "fhl_t": "哈",   "fhl_s": "哈",   "name_t": "哈巴谷書",     "name_s": "哈巴谷书",     "chapters": 3},
    {"code": "ZEP", "fhl_t": "番",   "fhl_s": "番",   "name_t": "西番雅書",     "name_s": "西番雅书",     "chapters": 3},
    {"code": "HAG", "fhl_t": "該",   "fhl_s": "该",   "name_t": "哈該書",       "name_s": "哈该书",       "chapters": 2},
    {"code": "ZEC", "fhl_t": "亞",   "fhl_s": "亚",   "name_t": "撒迦利亞書",   "name_s": "撒迦利亚书",   "chapters": 14},
    {"code": "MAL", "fhl_t": "瑪",   "fhl_s": "玛",   "name_t": "瑪拉基書",     "name_s": "玛拉基书",     "chapters": 4},
    # 新約 27 卷
    {"code": "MAT", "fhl_t": "太",   "fhl_s": "太",   "name_t": "馬太福音",     "name_s": "马太福音",     "chapters": 28},
    {"code": "MRK", "fhl_t": "可",   "fhl_s": "可",   "name_t": "馬可福音",     "name_s": "马可福音",     "chapters": 16},
    {"code": "LUK", "fhl_t": "路",   "fhl_s": "路",   "name_t": "路加福音",     "name_s": "路加福音",     "chapters": 24},
    {"code": "JHN", "fhl_t": "約",   "fhl_s": "约",   "name_t": "約翰福音",     "name_s": "约翰福音",     "chapters": 21},
    {"code": "ACT", "fhl_t": "徒",   "fhl_s": "徒",   "name_t": "使徒行傳",     "name_s": "使徒行传",     "chapters": 28},
    {"code": "ROM", "fhl_t": "羅",   "fhl_s": "罗",   "name_t": "羅馬書",       "name_s": "罗马书",       "chapters": 16},
    {"code": "1CO", "fhl_t": "林前", "fhl_s": "林前", "name_t": "哥林多前書",   "name_s": "哥林多前书",   "chapters": 16},
    {"code": "2CO", "fhl_t": "林後", "fhl_s": "林后", "name_t": "哥林多後書",   "name_s": "哥林多后书",   "chapters": 13},
    {"code": "GAL", "fhl_t": "加",   "fhl_s": "加",   "name_t": "加拉太書",     "name_s": "加拉太书",     "chapters": 6},
    {"code": "EPH", "fhl_t": "弗",   "fhl_s": "弗",   "name_t": "以弗所書",     "name_s": "以弗所书",     "chapters": 6},
    {"code": "PHP", "fhl_t": "腓",   "fhl_s": "腓",   "name_t": "腓立比書",     "name_s": "腓立比书",     "chapters": 4},
    {"code": "COL", "fhl_t": "西",   "fhl_s": "西",   "name_t": "歌羅西書",     "name_s": "歌罗西书",     "chapters": 4},
    {"code": "1TH", "fhl_t": "帖前", "fhl_s": "帖前", "name_t": "帖撒羅尼迦前書", "name_s": "帖撒罗尼迦前书", "chapters": 5},
    {"code": "2TH", "fhl_t": "帖後", "fhl_s": "帖后", "name_t": "帖撒羅尼迦後書", "name_s": "帖撒罗尼迦后书", "chapters": 3},
    {"code": "1TI", "fhl_t": "提前", "fhl_s": "提前", "name_t": "提摩太前書",   "name_s": "提摩太前书",   "chapters": 6},
    {"code": "2TI", "fhl_t": "提後", "fhl_s": "提后", "name_t": "提摩太後書",   "name_s": "提摩太后书",   "chapters": 4},
    {"code": "TIT", "fhl_t": "多",   "fhl_s": "多",   "name_t": "提多書",       "name_s": "提多书",       "chapters": 3},
    {"code": "PHM", "fhl_t": "門",   "fhl_s": "门",   "name_t": "腓利門書",     "name_s": "腓利门书",     "chapters": 1},
    {"code": "HEB", "fhl_t": "來",   "fhl_s": "来",   "name_t": "希伯來書",     "name_s": "希伯来书",     "chapters": 13},
    {"code": "JAS", "fhl_t": "雅",   "fhl_s": "雅",   "name_t": "雅各書",       "name_s": "雅各书",       "chapters": 5},
    {"code": "1PE", "fhl_t": "彼前", "fhl_s": "彼前", "name_t": "彼得前書",     "name_s": "彼得前书",     "chapters": 5},
    {"code": "2PE", "fhl_t": "彼後", "fhl_s": "彼后", "name_t": "彼得後書",     "name_s": "彼得后书",     "chapters": 3},
    {"code": "1JN", "fhl_t": "約一", "fhl_s": "约一", "name_t": "約翰一書",     "name_s": "约翰一书",     "chapters": 5},
    {"code": "2JN", "fhl_t": "約二", "fhl_s": "约二", "name_t": "約翰二書",     "name_s": "约翰二书",     "chapters": 1},
    {"code": "3JN", "fhl_t": "約三", "fhl_s": "约三", "name_t": "約翰三書",     "name_s": "约翰三书",     "chapters": 1},
    {"code": "JUD", "fhl_t": "猶",   "fhl_s": "犹",   "name_t": "猶大書",       "name_s": "犹大书",       "chapters": 1},
    {"code": "REV", "fhl_t": "啟",   "fhl_s": "启",   "name_t": "啟示錄",       "name_s": "启示录",       "chapters": 22},
]

BY_CODE = {b["code"]: b for b in BOOKS}
