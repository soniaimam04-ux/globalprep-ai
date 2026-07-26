"use client"

import Link from "next/link"
import {
  PenLine,
  GraduationCap,
  ListChecks,
  BookOpen,
  TrendingUp,
  Trophy,
  Target,
  Sparkles,
  Trash2,
  ArrowUpRight,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore, clearAll } from "@/lib/storage"

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <Icon className="size-4 text-brand" />
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

const QUICK_ACTIONS = [
  { href: "/essay", label: "Grade an essay", icon: PenLine },
  { href: "/scholarships", label: "Match scholarships", icon: GraduationCap },
  { href: "/practice", label: "Practice questions", icon: ListChecks },
  { href: "/vocabulary", label: "Build vocabulary", icon: BookOpen },
]

export default function DashboardPage() {
  const { essays, quizzes, learnedWords } = useStore()

  const bestBand = essays.length ? Math.max(...essays.map((e) => e.overallBand)) : 0
  const latestBand = essays.length ? essays[0].overallBand : 0
  const quizzesTaken = quizzes.length
  const totalQ = quizzes.reduce((a, q) => a + q.total, 0)
  const totalCorrect = quizzes.reduce((a, q) => a + q.correct, 0)
  const accuracy = totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0

  // essay trend (oldest -> newest) for the mini chart
  const trend = [...essays].reverse().slice(-12)
  const maxBand = 9

  const activity = [
    ...essays.map((e) => ({
      kind: "essay" as const,
      date: e.date,
      title: `Essay graded — Band ${e.overallBand.toFixed(1)}`,
      sub: e.excerpt,
    })),
    ...quizzes.map((q) => ({
      kind: "quiz" as const,
      date: q.date,
      title: `${q.label}`,
      sub: `Scored ${q.correct}/${q.total}`,
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 8)

  const hasData = essays.length > 0 || quizzes.length > 0

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Track your progress to study abroad"
        description="Your essay band scores, quiz results, and vocabulary growth over time — all in one place."
        action={
          hasData ? (
            <Button variant="outline" size="sm" onClick={() => clearAll()}>
              <Trash2 className="size-4" /> Reset data
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Best band"
          value={bestBand ? bestBand.toFixed(1) : "—"}
          hint={latestBand ? `Latest: ${latestBand.toFixed(1)}` : "No essays yet"}
          icon={Trophy}
        />
        <StatCard
          label="Essays graded"
          value={String(essays.length)}
          hint={essays.length ? "Keep writing" : "Grade your first essay"}
          icon={PenLine}
        />
        <StatCard
          label="Quiz accuracy"
          value={quizzesTaken ? `${accuracy}%` : "—"}
          hint={`${quizzesTaken} ${quizzesTaken === 1 ? "quiz" : "quizzes"} taken`}
          icon={Target}
        />
        <StatCard
          label="Words learned"
          value={String(learnedWords.length)}
          hint={learnedWords.length ? "Growing daily" : "Start a word set"}
          icon={BookOpen}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-brand" /> Essay band history
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length ? (
              <div className="flex h-52 items-end gap-2">
                {trend.map((e) => (
                  <div key={e.id} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t bg-brand transition-all"
                        style={{ height: `${(e.overallBand / maxBand) * 100}%` }}
                        title={`Band ${e.overallBand.toFixed(1)}`}
                      />
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {e.overallBand.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-52 flex-col items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">No essay scores yet.</p>
                <Link href="/essay" className="mt-1 text-sm font-medium text-brand-foreground hover:underline">
                  Grade your first essay
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-brand" /> Jump back in
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  <span className="flex size-8 items-center justify-center rounded-md bg-brand-muted/60 text-brand-foreground">
                    <Icon className="size-4" />
                  </span>
                  {a.label}
                  <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length ? (
            <ul className="divide-y divide-border">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <Badge variant="secondary" className="mt-0.5 font-mono text-[10px] uppercase">
                    {a.kind}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.sub}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {new Date(a.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Your graded essays and quizzes will show up here.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
