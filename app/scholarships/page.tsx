"use client"

import { useState } from "react"
import { Loader2, Search, GraduationCap, MapPin, Award, CalendarClock, ExternalLink, Info } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Scholarship = {
  name: string
  provider: string
  country: string
  level: string
  coverage: string
  typicalDeadline: string
  matchStrength: "High" | "Medium" | "Emerging"
  eligibility: string
  matchReason: string
  officialSearchHint: string
}

const strengthStyles: Record<Scholarship["matchStrength"], string> = {
  High: "bg-brand text-primary-foreground",
  Medium: "bg-brand-muted text-brand-foreground",
  Emerging: "bg-secondary text-secondary-foreground",
}

export default function ScholarshipsPage() {
  const [form, setForm] = useState({
    field: "",
    level: "Master's",
    gpa: "",
    examType: "IELTS",
    examScore: "",
    country: "",
    financialNeed: "Medium",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<Scholarship[] | null>(null)

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function match(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResults(null)
    try {
      const res = await fetch("/api/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setResults(data.scholarships)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to match scholarships")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Scholarship Matchmaker"
        title="Find scholarships that fit your profile"
        description="Tell us about your goals and academics. We'll match you with real scholarship programs and explain why each one fits."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
          <CardHeader>
            <CardTitle className="text-base">Your profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={match} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="field">Field of study</Label>
                <Input
                  id="field"
                  required
                  placeholder="e.g. Computer Science"
                  value={form.field}
                  onChange={(e) => update("field", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Study level</Label>
                  <Select value={form.level} onValueChange={(v) => update("level", v ?? "")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="Master's">Master&apos;s</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    placeholder="e.g. 3.6 / 4.0"
                    value={form.gpa}
                    onChange={(e) => update("gpa", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>English exam</Label>
                  <Select value={form.examType} onValueChange={(v) => update("examType", v ?? "")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IELTS">IELTS</SelectItem>
                      <SelectItem value="TOEFL">TOEFL</SelectItem>
                      <SelectItem value="Not taken yet">Not taken yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="score">Exam score</Label>
                  <Input
                    id="score"
                    placeholder="e.g. 7.5 / 105"
                    value={form.examScore}
                    onChange={(e) => update("examScore", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Preferred country / region</Label>
                <Input
                  id="country"
                  placeholder="e.g. UK, Canada, or open to any"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Financial need</Label>
                <Select value={form.financialNeed} onValueChange={(v) => update("financialNeed", v ?? "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High — need full funding</SelectItem>
                    <SelectItem value="Medium">Medium — partial funding helps</SelectItem>
                    <SelectItem value="Low">Low — merit focus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading || !form.field} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Matching...
                  </>
                ) : (
                  <>
                    <Search className="size-4" /> Find scholarships
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="h-40 animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : results ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/50 p-3">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  These are AI-suggested matches to well-known programs. Always confirm current eligibility,
                  deadlines, and details on the official scholarship website before applying.
                </p>
              </div>
              {results.map((s, i) => (
                <Card key={i}>
                  <CardContent className="py-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight">{s.name}</h3>
                        <p className="text-sm text-muted-foreground">{s.provider}</p>
                      </div>
                      <Badge className={strengthStyles[s.matchStrength]}>{s.matchStrength} match</Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" /> {s.country}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <GraduationCap className="size-3.5" /> {s.level}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Award className="size-3.5" /> {s.coverage}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="size-3.5" /> {s.typicalDeadline}
                      </span>
                    </div>

                    <div className="mt-4 rounded-lg bg-brand-muted/40 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-brand-foreground">
                        Why it fits you
                      </p>
                      <p className="mt-1 text-sm leading-relaxed">{s.matchReason}</p>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">Eligibility: </span>
                      {s.eligibility}
                    </p>

                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(s.officialSearchHint)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-foreground hover:underline"
                    >
                      Find official page <ExternalLink className="size-3.5" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex h-full min-h-64 items-center justify-center border-dashed">
              <div className="max-w-64 text-center">
                <GraduationCap className="mx-auto size-8 text-muted-foreground/60" />
                <p className="mt-3 text-balance text-sm text-muted-foreground">
                  Fill in your profile and we&apos;ll suggest 5-8 matching scholarships with reasoning.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
