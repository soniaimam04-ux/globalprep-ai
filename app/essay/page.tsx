"use client"

import { useState } from "react"
import { Loader2, Sparkles, Check, ArrowRight, Lightbulb } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { BandRing, CriterionBar, bandLabel } from "@/components/band-score"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { addEssay } from "@/lib/storage"

type Criterion = { score: number; comment: string }
type Result = {
  overallBand: number
  summary: string
  breakdown: {
    taskResponse: Criterion
    coherenceCohesion: Criterion
    lexicalResource: Criterion
    grammar: Criterion
  }
  strengths: string[]
  corrections: { original: string; suggestion: string; explanation: string }[]
  tip: string
}

const CRITERIA: { key: keyof Result["breakdown"]; label: string }[] = [
  { key: "taskResponse", label: "Task Response" },
  { key: "coherenceCohesion", label: "Coherence & Cohesion" },
  { key: "lexicalResource", label: "Lexical Resource" },
  { key: "grammar", label: "Grammar" },
]

export default function EssayPage() {
  const [prompt, setPrompt] = useState("")
  const [essay, setEssay] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<Result | null>(null)

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0

  async function grade() {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/grade-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setResult(data)
      addEssay({
        overallBand: data.overallBand,
        breakdown: {
          taskResponse: data.breakdown.taskResponse.score,
          coherenceCohesion: data.breakdown.coherenceCohesion.score,
          lexicalResource: data.breakdown.lexicalResource.score,
          grammar: data.breakdown.grammar.score,
        },
        wordCount,
        excerpt: essay.trim().slice(0, 120),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to grade essay")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Essay Grader"
        title="Grade your writing on the IELTS band scale"
        description="Paste your essay and get an examiner-style band score (1-9) with a breakdown across all four criteria, plus corrections and a tip."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Your essay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Essay question (optional)</Label>
              <Input
                id="prompt"
                placeholder="e.g. Some people think universities should focus on job skills..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="essay">Essay text</Label>
                <span className="font-mono text-xs text-muted-foreground">{wordCount} words</span>
              </div>
              <Textarea
                id="essay"
                placeholder="Paste your full essay here..."
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                className="min-h-72 resize-y leading-relaxed"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={grade} disabled={loading || essay.trim().length < 40} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Grading...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Grade my essay
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {loading ? (
            <Card className="flex h-full min-h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-brand" />
                <p className="text-sm">Analyzing your writing...</p>
              </div>
            </Card>
          ) : result ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                <BandRing band={result.overallBand} />
                <Badge variant="secondary" className="font-mono uppercase tracking-wide">
                  {bandLabel(result.overallBand)} User
                </Badge>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex h-full min-h-64 items-center justify-center border-dashed">
              <p className="max-w-48 text-balance text-center text-sm text-muted-foreground">
                Your band score and feedback will appear here.
              </p>
            </Card>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Criteria breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {CRITERIA.map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <CriterionBar label={label} score={result.breakdown[key].score} />
                  <p className="text-xs leading-relaxed text-muted-foreground">{result.breakdown[key].comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-brand/40 bg-brand-muted/40">
              <CardContent className="flex gap-3 py-4">
                <Lightbulb className="mt-0.5 size-5 shrink-0 text-brand-foreground" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand-foreground">One tip</p>
                  <p className="mt-1 text-sm leading-relaxed">{result.tip}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Suggested corrections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.corrections.map((c, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="rounded bg-destructive/10 px-2 py-1 text-sm text-destructive line-through">
                      {c.original}
                    </span>
                    <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
                    <span className="rounded bg-brand-muted px-2 py-1 text-sm text-brand-foreground">
                      {c.suggestion}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.explanation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
