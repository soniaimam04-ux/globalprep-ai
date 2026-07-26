"use client"

import { useMemo, useState } from "react"
import { Loader2, BookOpen, RefreshCw, Check, X, GraduationCap, Trophy } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { addQuiz, markWordsLearned } from "@/lib/storage"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Word = {
  word: string
  partOfSpeech: string
  definition: string
  example: string
  synonyms: string[]
}

type QuizItem = { word: Word; options: string[]; answer: string }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function VocabularyPage() {
  const [level, setLevel] = useState("Intermediate")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [words, setWords] = useState<Word[] | null>(null)
  const [mode, setMode] = useState<"learn" | "quiz">("learn")

  // quiz state
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const quiz: QuizItem[] = useMemo(() => {
    if (!words) return []
    return words.map((w) => {
      const distractors = shuffle(words.filter((x) => x.word !== w.word))
        .slice(0, 3)
        .map((x) => x.definition)
      return { word: w, options: shuffle([w.definition, ...distractors]), answer: w.definition }
    })
  }, [words])

  const score = quiz.reduce((acc, item, i) => acc + (answers[i] === item.answer ? 1 : 0), 0)

  async function generate() {
    setLoading(true)
    setError("")
    setWords(null)
    setAnswers({})
    setSubmitted(false)
    setMode("learn")
    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, count: 6, seed: Date.now() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setWords(data.words)
      markWordsLearned(data.words.map((w: Word) => w.word))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate vocabulary")
    } finally {
      setLoading(false)
    }
  }

  function submitQuiz() {
    setSubmitted(true)
    addQuiz({
      type: "vocabulary",
      label: `${level} vocabulary quiz`,
      total: quiz.length,
      correct: quiz.reduce((acc, item, i) => acc + (answers[i] === item.answer ? 1 : 0), 0),
    })
  }

  const allAnswered = quiz.length > 0 && quiz.every((_, i) => answers[i] !== undefined)
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })

  return (
    <>
      <PageHeader
        eyebrow="Vocabulary Builder"
        title="Your daily vocabulary set"
        description="Learn a fresh set of exam-ready words, then switch to quiz mode to test your recall."
        action={
          <Button onClick={generate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Loading...
              </>
            ) : (
              <>
                <RefreshCw className="size-4" /> {words ? "New set" : "Start today's set"}
              </>
            )}
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Level</Label>
          <Select value={level} onValueChange={(v) => setLevel(v ?? "")}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{today}</span>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted/40" />
          ))}
        </div>
      )}

      {words && !loading && (
        <>
          <div className="mb-6 inline-flex rounded-lg border border-border bg-secondary/50 p-1">
            <button
              onClick={() => setMode("learn")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                mode === "learn" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              <BookOpen className="size-4" /> Learn
            </button>
            <button
              onClick={() => {
                setMode("quiz")
                setSubmitted(false)
                setAnswers({})
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                mode === "quiz" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              <GraduationCap className="size-4" /> Quiz
            </button>
          </div>

          {mode === "learn" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {words.map((w) => (
                <Card key={w.word}>
                  <CardContent className="py-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-semibold tracking-tight">{w.word}</h3>
                      <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                        {w.partOfSpeech}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{w.definition}</p>
                    <p className="mt-2 border-l-2 border-brand/50 pl-3 text-sm italic leading-relaxed text-muted-foreground">
                      &ldquo;{w.example}&rdquo;
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {w.synonyms.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-brand-muted/50 px-2.5 py-0.5 text-xs text-brand-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {submitted && (
                <Card className="border-brand/40 bg-brand-muted/40">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="size-6 text-brand-foreground" />
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-brand-foreground">
                          Quiz complete
                        </p>
                        <p className="text-2xl font-semibold">
                          {score} / {quiz.length}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={generate}>
                      <RefreshCw className="size-4" /> New set
                    </Button>
                  </CardContent>
                </Card>
              )}

              {quiz.map((item, qi) => (
                <Card key={qi}>
                  <CardContent className="py-5">
                    <p className="font-medium">
                      <span className="font-mono text-sm text-muted-foreground">{qi + 1}. </span>
                      What does <span className="font-semibold">{item.word.word}</span> mean?
                    </p>
                    <div className="mt-3 grid gap-2">
                      {item.options.map((opt) => {
                        const selected = answers[qi] === opt
                        const isCorrect = item.answer === opt
                        return (
                          <button
                            key={opt}
                            disabled={submitted}
                            onClick={() => setAnswers((a) => ({ ...a, [qi]: opt }))}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                              !submitted && selected && "border-brand bg-brand-muted/50",
                              !submitted && !selected && "border-border hover:bg-secondary",
                              submitted && isCorrect && "border-brand bg-brand-muted/60",
                              submitted && selected && !isCorrect && "border-destructive/50 bg-destructive/5",
                              submitted && !isCorrect && !selected && "border-border opacity-70",
                            )}
                          >
                            <span>{opt}</span>
                            {submitted && isCorrect && <Check className="size-4 shrink-0 text-brand-foreground" />}
                            {submitted && selected && !isCorrect && <X className="size-4 shrink-0 text-destructive" />}
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!submitted && (
                <div className="flex items-center gap-3">
                  <Button onClick={submitQuiz} disabled={!allAnswered}>
                    Submit quiz
                  </Button>
                  {!allAnswered && (
                    <span className="text-sm text-muted-foreground">Answer all questions to submit.</span>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!words && !loading && (
        <Card className="flex min-h-48 items-center justify-center border-dashed">
          <div className="max-w-64 text-center">
            <BookOpen className="mx-auto size-8 text-muted-foreground/60" />
            <p className="mt-3 text-balance text-sm text-muted-foreground">
              Generate today&apos;s word set to start learning and quizzing.
            </p>
          </div>
        </Card>
      )}
    </>
  )
}
