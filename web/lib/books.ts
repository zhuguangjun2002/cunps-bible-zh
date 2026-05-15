import { BOOKS, BOOKS_BY_CODE, type BookMeta, type Testament } from './generated/books'

export type { BookMeta, Testament }

export function getAllBooks(): BookMeta[] {
  return BOOKS
}

export function getBook(code: string): BookMeta | undefined {
  return BOOKS_BY_CODE[code.toUpperCase()]
}

export function getOldTestament(): BookMeta[] {
  return BOOKS.filter((b) => b.testament === 'OT')
}

export function getNewTestament(): BookMeta[] {
  return BOOKS.filter((b) => b.testament === 'NT')
}
