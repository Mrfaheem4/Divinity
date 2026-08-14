// src/main/bookmarks.ts
import fs from 'fs'
import { join } from 'path'

export interface Bookmark {
  label: string
  url: string
}

const DATA_DIR = join(process.cwd(), 'data')
const BOOKMARKS_PATH = join(DATA_DIR, 'bookmarks.json')

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function loadBookmarks(): Bookmark[] {
  ensureDataDir()
  try {
    const raw = fs.readFileSync(BOOKMARKS_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  ensureDataDir()
  fs.writeFileSync(BOOKMARKS_PATH, JSON.stringify(bookmarks, null, 2))
}
