// 用 MiniSearch 对 31,103 节建索引，中文用 bigram 分词（每两字一 token）。
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import MiniSearch from 'minisearch'
import { BOOKS } from './books-meta.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const BIBLE_DIR = resolve(ROOT, 'public', 'bible')
const OUT = resolve(ROOT, 'public', 'search-index.json')

function bigramTokenize(text) {
  // 把非中文按空白／标点切，再把每段中文转成 bigram tokens
  const tokens = []
  // 拆掉所有标点（保留中英数字）
  const clean = text.replace(/[\s\p{P}\p{S}]+/gu, ' ').trim()
  for (const segment of clean.split(/\s+/)) {
    if (!segment) continue
    // 全英文/数字段：直接收
    if (/^[a-zA-Z0-9]+$/.test(segment)) {
      tokens.push(segment.toLowerCase())
      continue
    }
    // 中文段：bigram + 单字 fallback
    const chars = [...segment]
    if (chars.length === 1) {
      tokens.push(chars[0])
    } else {
      for (let i = 0; i < chars.length - 1; i++) {
        tokens.push(chars[i] + chars[i + 1])
      }
    }
  }
  return tokens
}

const mini = new MiniSearch({
  fields: ['t'],
  storeFields: ['b', 'c', 'n', 't'],
  idField: 'id',
  tokenize: bigramTokenize,
  processTerm: (term) => term.toLowerCase(),
  searchOptions: {
    prefix: false,
    fuzzy: false,
  },
})

const docs = []
let id = 0
for (const meta of BOOKS) {
  for (let chapter = 1; chapter <= meta.chapters; chapter++) {
    const nn = String(chapter).padStart(2, '0')
    const file = join(BIBLE_DIR, meta.code, `${nn}.json`)
    const { v } = JSON.parse(readFileSync(file, 'utf8'))
    for (const verse of v) {
      docs.push({
        id: id++,
        b: meta.code,
        c: chapter,
        n: verse.n,
        t: verse.t,
      })
    }
  }
}

mini.addAll(docs)
writeFileSync(OUT, JSON.stringify(mini.toJSON()))
console.log(`[build-search-index] ${docs.length} verses → ${OUT}`)
