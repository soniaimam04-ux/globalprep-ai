import type React from "react"

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-widest text-brand-foreground">{eyebrow}</p>
        <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
