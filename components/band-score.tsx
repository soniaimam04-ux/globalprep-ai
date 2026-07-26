import { cn } from "@/lib/utils"

export function bandLabel(band: number) {
  if (band >= 8) return "Expert"
  if (band >= 7) return "Good"
  if (band >= 6) return "Competent"
  if (band >= 5) return "Modest"
  return "Developing"
}

export function BandRing({ band, size = 120 }: { band: number; size?: number }) {
  const pct = Math.max(0, Math.min(1, band / 9))
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight">{band.toFixed(1)}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Band</span>
      </div>
    </div>
  )
}

export function CriterionBar({ label, score }: { label: string; score: number }) {
  const pct = Math.max(0, Math.min(100, (score / 9) * 100))
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">{score.toFixed(1)}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full bg-brand transition-all")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
