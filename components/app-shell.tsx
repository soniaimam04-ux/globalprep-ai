"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PenLine,
  GraduationCap,
  ListChecks,
  BookOpen,
  Menu,
  X,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/essay", label: "Essay Grader", icon: PenLine },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/practice", label: "Practice", icon: ListChecks },
  { href: "/vocabulary", label: "Vocabulary", icon: BookOpen },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
            {active && <span className="ml-auto size-1.5 rounded-full bg-brand" aria-hidden="true" />}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Globe className="size-4.5" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">GlobalPrep AI</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Study Abroad Coach
        </div>
      </div>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <div className="mt-8 px-1">
          <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
          <NavLinks />
        </div>
        <div className="mt-auto rounded-lg border border-border bg-secondary/60 p-3">
          <p className="text-xs font-medium text-foreground">Your data stays local</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Scores and quiz history are saved in your browser only.
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-sidebar px-4 lg:hidden">
        <Brand />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-14 z-20 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/20"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 border-b border-border bg-sidebar px-4 py-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 pt-14 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  )
}
