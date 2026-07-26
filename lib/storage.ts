"use client"

import { useSyncExternalStore } from "react"

export type BandBreakdown = {
  taskResponse: number
  coherenceCohesion: number
  lexicalResource: number
  grammar: number
}

export type EssayRecord = {
  id: string
  date: string
  overallBand: number
  breakdown: BandBreakdown
  wordCount: number
  excerpt: string
}

export type QuizRecord = {
  id: string
  date: string
  type: "vocabulary" | "practice"
  label: string
  total: number
  correct: number
}

export type LearnedWord = {
  word: string
  date: string
}

type StoreShape = {
  essays: EssayRecord[]
  quizzes: QuizRecord[]
  learnedWords: LearnedWord[]
}

const KEY = "globalprep:data:v1"
const EVENT = "globalprep:update"

const empty: StoreShape = { essays: [], quizzes: [], learnedWords: [] }

function read(): StoreShape {
  if (typeof window === "undefined") return empty
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<StoreShape>
    return {
      essays: parsed.essays ?? [],
      quizzes: parsed.quizzes ?? [],
      learnedWords: parsed.learnedWords ?? [],
    }
  } catch {
    return empty
  }
}

function write(next: StoreShape) {
  window.localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(EVENT))
}

export function addEssay(record: Omit<EssayRecord, "id" | "date">) {
  const data = read()
  const entry: EssayRecord = { ...record, id: crypto.randomUUID(), date: new Date().toISOString() }
  write({ ...data, essays: [entry, ...data.essays].slice(0, 100) })
}

export function addQuiz(record: Omit<QuizRecord, "id" | "date">) {
  const data = read()
  const entry: QuizRecord = { ...record, id: crypto.randomUUID(), date: new Date().toISOString() }
  write({ ...data, quizzes: [entry, ...data.quizzes].slice(0, 100) })
}

export function markWordsLearned(words: string[]) {
  const data = read()
  const existing = new Set(data.learnedWords.map((w) => w.word.toLowerCase()))
  const now = new Date().toISOString()
  const additions = words
    .filter((w) => !existing.has(w.toLowerCase()))
    .map((w) => ({ word: w, date: now }))
  if (additions.length === 0) return
  write({ ...data, learnedWords: [...additions, ...data.learnedWords].slice(0, 500) })
}

export function clearAll() {
  write(empty)
}

// Reactive subscription

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

let cache: StoreShape = empty
let cacheRaw = ""

function getSnapshot(): StoreShape {
  const raw = typeof window === "undefined" ? "" : window.localStorage.getItem(KEY) ?? ""
  if (raw !== cacheRaw) {
    cacheRaw = raw
    cache = read()
  }
  return cache
}

function getServerSnapshot(): StoreShape {
  return empty
}

export function useStore(): StoreShape {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
