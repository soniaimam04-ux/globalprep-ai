"use client"

import { useState } from "react"
import { Loader2, ListChecks, Check, X, RotateCcw } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { addQuiz } from "@/lib/storage"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Question = {
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

const CATEGORIES = [
  { value: "vocabulary", label: "Vocabulary" },
  { value: "grammar", label: "Grammar" },
  { value: "reading", label: "Reading comprehension" },
]

export default function PracticePage() {
  const [examType, setExamType] = useState("IELTS")
  const [category, setCategory] = useState("vocabulary")
  const [difficulty, setDifficulty] = useState("Intermediate")
  const [count, setCount] = useState("5")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passage, setPassage] = useState("")
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const score = questions
    ? questions.reduce((acc, q, i) => acc + (answers[i] === q.answerIndex ? 1 : 0), 0)
    : 0

  async function generate() {
    setLoading(true)
    setError("")
    setQuestions(null)
    setAnswers({})
    setSubmitted(false)
    setPassage("")
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType, category, difficulty, count: Number(count) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setQuestions(data.questions)
      setPassage(data.passage || "")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate questions")
    } finally {
      setLoading(false)
    }
  }

  function submit() {
    if (!questions) return
    setSubmitted(true)
    addQuiz({
      type: "practice",
      label: `${examType} ${CATEGORIES.find((c) => c.value === category)?.label} (${difficulty})`,
      total: questions.length,
      correct: questions.reduce((acc, q, i) => acc + (answers[i] === q.answerIndex ? 1 : 0), 0),
    })
  }

  const allAnswered = questions ? questions.every((_, i) => answers[i] !== undefined) : false

  return (
    <>
      <PageHeader
        eyebrow="Practice Generator"
        title="Generate targeted practice questions"
        description="Create fresh multiple-choice questions for vocabulary, grammar, or reading — matched to your exam and difficulty."
      />

      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Exam type</Label>
              <Select value={examType} onValueChange={(v) => setExamType(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IELTS">IELTS</SelectItem>
                  <SelectItem value="TOEFL">TOEFL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Questions</Label>
              <Select value={count} onValueChange={(v) => setCount(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 questions</SelectItem>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="8">8 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <Button onClick={generate} disabled={loading} className="mt-4 w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <ListChecks className="size-4" /> Generate questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted/40" />
          ))}
        </div>
      )}

      {questions && !loading && (
        <div className="space-y-4">
          {submitted && (
            <Card className="border-brand/40 bg-brand-muted/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand-foreground">Your score</p>
                  <p className="text-2xl font-semibold">
                    {score} / {questions.length}
                  </p>
                </div>
                <Button variant="outline" onClick={generate}>
                  <RotateCcw className="size-4" /> New set
                </Button>
              </CardContent>
            </Card>
          )}

          {passage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reading passage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{passage}</p>
              </CardContent>
            </Card>
          )}

          {questions.map((q, qi) => (
            <Card key={qi}>
              <CardContent className="py-5">
                <p className="font-medium leading-relaxed">
                  <span className="font-mono text-sm text-muted-foreground">{qi + 1}. </span>
                  {q.question}
                </p>
                <div className="mt-3 grid gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi
                    const isCorrect = q.answerIndex === oi
                    const showState = submitted
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          !showState && selected && "border-brand bg-brand-muted/50",
                          !showState && !selected && "border-border hover:bg-secondary",
                          showState && isCorrect && "border-brand bg-brand-muted/60",
                          showState && selected && !isCorrect && "border-destructive/50 bg-destructive/5",
                          showState && !isCorrect && !selected && "border-border opacity-70",
                        )}
                      >
                        <span>{opt}</span>
                        {showState && isCorrect && <Check className="size-4 text-brand-foreground" />}
                        {showState && selected && !isCorrect && <X className="size-4 text-destructive" />}
                      </button>
                    )
                  })}
                </div>
                {submitted && (
                  <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Explanation: </span>
                    {q.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {!submitted && (
            <div className="flex items-center gap-3">
              <Button onClick={submit} disabled={!allAnswered}>
                Submit answers
              </Button>
              {!allAnswered && (
                <span className="text-sm text-muted-foreground">Answer all questions to submit.</span>
              )}
            </div>
          )}
        </div>
      )}

      {!questions && !loading && (
        <Card className="flex min-h-48 items-center justify-center border-dashed">
          <p className="text-sm text-muted-foreground">Choose your settings and generate a question set.</p>
        </Card>
      )}
    </>
  )
}
