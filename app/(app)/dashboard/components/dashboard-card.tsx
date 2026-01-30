"use client"

import Link from "next/link"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Accent = "blue" | "green" | "purple" | "orange" | "slate"

const accentClasses: Record<Accent, string> = {
  blue: "border-l-blue-500",
  green: "border-l-emerald-500",
  purple: "border-l-violet-500",
  orange: "border-l-orange-500",
  slate: "border-l-slate-400",
}

type Props = {
  title: string
  subtitle: string
  icon: React.ReactNode
  href: string
  accent?: Accent
  disabled?: boolean
  badge?: string
}

export function DashboardCard({
  title,
  subtitle,
  icon,
  href,
  accent = "blue",
  disabled,
  badge,
}: Props) {
  const content = (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card shadow-sm",
        "border-l-4",
        accentClasses[accent],
        disabled
          ? "opacity-80"
          : "transition hover:shadow-md hover:bg-muted/10"
      )}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background shadow-sm">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-base font-semibold">{title}</div>
            {badge ? (
              <Badge variant="secondary" className="rounded-full">
                {badge}
              </Badge>
            ) : null}
          </div>

          <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </Card>
  )

  if (disabled) {
    return <div className="cursor-not-allowed">{content}</div>
  }

  return (
    <Link href={href} className="block focus:outline-none">
      {content}
    </Link>
  )
}
