import MiniSearch from 'minisearch'

export interface SearchHit {
  id: number
  b: string
  c: number
  n: number
  t: string
  score: number
}

let indexPromise: Promise<MiniSearch> | null = null

// 与 build-search-index.mjs 完全一致的 bigram tokenizer
function bigramTokenize(text: string): string[] {
  const tokens: string[] = []
  const clean = text.replace(/[\s\p{P}\p{S}]+/gu, ' ').trim()
  for (const segment of clean.split(/\s+/)) {
    if (!segment) continue
    if (/^[a-zA-Z0-9]+$/.test(segment)) {
      tokens.push(segment.toLowerCase())
      continue
    }
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

function indexUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  return `${base}/search-index.json`
}

export function loadIndex(): Promise<MiniSearch> {
  if (!indexPromise) {
    indexPromise = fetch(indexUrl())
      .then((r) => {
        if (!r.ok) throw new Error(`load index failed: ${r.status}`)
        return r.text()
      })
      .then((text) =>
        MiniSearch.loadJSON(text, {
          fields: ['t'],
          storeFields: ['b', 'c', 'n', 't'],
          idField: 'id',
          tokenize: bigramTokenize,
          processTerm: (term) => term.toLowerCase(),
        }),
      )
  }
  return indexPromise
}

export async function search(query: string, limit = 50): Promise<SearchHit[]> {
  const q = query.trim()
  if (!q) return []
  const mini = await loadIndex()
  const results = mini.search(q, { combineWith: 'AND', prefix: false, fuzzy: false })
  return results.slice(0, limit).map((r) => ({
    id: r.id as number,
    b: r.b,
    c: r.c,
    n: r.n,
    t: r.t,
    score: r.score,
  }))
}
