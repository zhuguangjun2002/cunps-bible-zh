import { BOOKS } from './generated/books'

export interface Reference {
  book: string
  chapter: number
  verseStart?: number
  verseEnd?: number
}

// 别名 → code 映射表（简体全名、简称、英文简称、USFM code 都小写化做 key）
const ALIAS: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  for (const b of BOOKS) {
    const keys = new Set<string>([b.code, b.name, b.abbr, ...b.en])
    for (const k of keys) {
      m[normalize(k)] = b.code
    }
  }
  return m
})()

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '').replace(/[.．]/g, '')
}

// 把书卷名（可能有 1/2/3 前缀或汉字前缀）和章节数字部分分开
function splitBookFromRest(raw: string): { bookKey: string; rest: string } | null {
  // 形如 "PSA.23.1" 或 "PSA 23:1"：用 . / 空白 切第一段
  const dotSplit = raw.match(/^([1-3]?\s?[A-Za-z一-鿿]+)[\s.:．：]+(.+)$/)
  if (dotSplit) return { bookKey: dotSplit[1].trim(), rest: dotSplit[2].trim() }
  // 形如 "诗23:1"、"1Co13:1"（无分隔）
  const stuck = raw.match(/^([1-3]?[一-鿿]+|[1-3]?[A-Za-z]+)(\d.*)$/)
  if (stuck) return { bookKey: stuck[1].trim(), rest: stuck[2].trim() }
  return null
}

export function parseReference(input: string): Reference | null {
  const raw = input.trim()
  if (!raw) return null
  const split = splitBookFromRest(raw)
  if (!split) return null
  const code = ALIAS[normalize(split.bookKey)]
  if (!code) return null
  // rest: "23:1" / "23:1-3" / "23.1" / "23 1" / "23"
  const m = split.rest.match(/^(\d+)(?:[\s:.：．](\d+)(?:[-–](\d+))?)?$/)
  if (!m) return null
  const chapter = parseInt(m[1], 10)
  const verseStart = m[2] ? parseInt(m[2], 10) : undefined
  const verseEnd = m[3] ? parseInt(m[3], 10) : undefined
  return { book: code, chapter, verseStart, verseEnd }
}
