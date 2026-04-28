"use client"

import Link from "next/link"
import * as React from "react"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Accent = "blue" | "green" | "purple" | "orange" | "slate" | "teal" | "pink" | "yellow"

const accentClasses: Record<Accent, string> = {
  blue: "border-t-[#010077]",
  green: "border-t-[#196132]",
  purple: "border-t-[#6d28d9]",
  orange: "border-t-[#ea8291]", // changed to pink/orange from brand
  slate: "border-t-[#475569]",
  teal: "border-t-[#0f766e]",
  pink: "border-t-[#ea8291]",
  yellow: "border-t-[#f5bd2c]",
}

const accentDots: Record<Accent, string> = {
  blue: "bg-[#010077]",
  green: "bg-[#196132]",
  purple: "bg-[#6d28d9]",
  orange: "bg-[#ea8291]",
  slate: "bg-[#475569]",
  teal: "bg-[#0f766e]",
  pink: "bg-[#ea8291]",
  yellow: "bg-[#f5bd2c]",
}

type Props = {
  title: string
  subtitle: string
  icon: React.ReactNode
  href: string
  accent?: Accent
  disabled?: boolean
  badge?: string
  category?: string
  actionText?: string
  target?: string
  /** Slot extra renderizado abaixo do subtitle, apenas no desktop */
  extraContent?: React.ReactNode
}

export function DashboardCard({
  title,
  subtitle,
  icon,
  href,
  accent = "blue",
  disabled,
  badge,
  category = "Módulo",
  actionText = "Acessar",
  target,
  extraContent,
}: Props) {
  const content = (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[20px] bg-white shadow-[0_8px_30px_rgba(1,0,119,0.04)] transition-all",
        "border-t-4 border-b border-l border-r border-slate-100",
        accentClasses[accent],
        disabled
          ? "opacity-60 grayscale-[0.5]"
          : "hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(1,0,119,0.08)]"
      )}
    >
      <div className="flex flex-col p-5 pb-3">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100">
            <span className={cn("h-1.5 w-1.5 rounded-full", accentDots[accent])} />
            {category}
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-[#010077]/5 group-hover:text-[#010077] transition-colors">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-[#010077] border border-slate-100">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-[#010077]">{title}</h3>
              {badge && (
                <Badge variant="secondary" className="rounded-full bg-[#010077] text-white hover:bg-[#010077] border-none px-2 py-0 text-[10px] font-bold">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 min-h-[36px]">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-3 mt-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#010077] transition-colors group-hover:text-[#010077]/80">
          {actionText}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Absolute overlay slot (e.g. urgency badge) */}
      {extraContent}
    </Card>
  )

  if (disabled) {
    return <div className="cursor-not-allowed h-full">{content}</div>
  }

  return (
    <Link href={href} target={target} className="block h-full focus:outline-none">
      {content}
    </Link>
  )
}
