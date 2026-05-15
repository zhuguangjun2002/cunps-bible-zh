import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface Verse {
  n: number
  t: string
}

export function getChapter(code: string, chapter: number): Verse[] {
  const nn = String(chapter).padStart(2, '0')
  const file = join(process.cwd(), 'public', 'bible', code.toUpperCase(), `${nn}.json`)
  const data = JSON.parse(readFileSync(file, 'utf8')) as { v: Verse[] }
  return data.v
}
