"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Flame, TrendingUp } from "lucide-react"
import { useMyFairsQuery } from "@/app/modules/exhibitor-fairs/exhibitor-fairs.queries"
import { useFutureFairsQuery } from "@/app/modules/marketplace/marketplace.queries"
import type { FutureFair } from "@/app/modules/marketplace/marketplace.schemas"

const URGENCY_PHRASES = [
  "Vagas esgotando rápido",
  "Últimas categorias abertas",
  "Feiras lotando esta semana",
  "Não perca sua chance",
  "Alta procura este mês",
  "Categorias fechando rápido",
  "Mais de 80% das vagas tomadas",
  "Concorrentes já confirmados",
]

// ─── Hook exportado para reutilizar nos cards ─────────────────────────────────
export function useUpcomingFairsData() {
  const { data: myFairsData } = useMyFairsQuery()
  const { data: futureFairsData, isLoading } = useFutureFairsQuery()

  const myActiveFairIds = useMemo(() => {
    if (!myFairsData?.items) return new Set<string>()
    return new Set(
      myFairsData.items
        .filter((f) => f.fairStatus === "ATIVA")
        .map((f) => f.fairId)
    )
  }, [myFairsData])

  const fairsNotIn = useMemo(() => {
    if (!futureFairsData?.items) return []
    return futureFairsData.items.filter((f: FutureFair) => !myActiveFairIds.has(f.id))
  }, [futureFairsData, myActiveFairIds])

  return { fairsNotIn, isLoading }
}

// ─── Banner (mobile only — md:hidden) ────────────────────────────────────────
export function UpcomingFairsBanner() {
  const { fairsNotIn, isLoading } = useUpcomingFairsData()
  const [phrase, setPhrase] = useState("")
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setPhrase(URGENCY_PHRASES[Math.floor(Math.random() * URGENCY_PHRASES.length)])
    const id = setInterval(() => setTick((t) => t + 1), 3000)
    return () => clearInterval(id)
  }, [])

  // Troca a frase a cada 3 s
  useEffect(() => {
    setPhrase(URGENCY_PHRASES[Math.floor(Math.random() * URGENCY_PHRASES.length)])
  }, [tick])

  if (isLoading || fairsNotIn.length === 0) return null

  const pct = Math.min(98, 60 + fairsNotIn.length * 6)

  return (
    <Link
      href="/feiras/futuras"
      target="_blank"
      className="group block w-full focus:outline-none md:hidden"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(1,0,119,0.22)]">
        {/* gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#010077] via-[#0b0a9e] to-[#1a0064]" />

        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-[#f5bd2c]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

        {/* noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative flex flex-col gap-4 p-5">
          {/* top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* animated icon */}
              <div className="flex-shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5bd2c]/20 ring-1 ring-[#f5bd2c]/30">
                <Flame className="h-4.5 w-4.5 text-[#f5bd2c] animate-pulse" style={{ width: 18, height: 18 }} />
              </div>

              <div>
                {/* rotating phrase */}
                <p
                  key={phrase}
                  className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5bd2c] animate-in fade-in slide-in-from-bottom-1 duration-500"
                >
                  {phrase}
                </p>
                <p className="mt-0.5 text-[17px] font-extrabold leading-tight text-white">
                  {fairsNotIn.length === 1
                    ? "1 nova feira disponível"
                    : `${fairsNotIn.length} feiras disponíveis`}
                </p>
              </div>
            </div>

            {/* live dot */}
            <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5bd2c] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f5bd2c]" />
              </span>
              AO VIVO
            </div>
          </div>

          {/* progress bar */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-white/60">
              <span className="flex items-center gap-1">
                <TrendingUp style={{ width: 11, height: 11 }} />
                Demanda de vagas
              </span>
              <span className="font-black text-[#f5bd2c]">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f5bd2c] to-[#ffdd80] transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-white/50">Garanta sua vaga agora</p>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#f5bd2c] px-4 py-2 text-xs font-black text-[#010077] transition-all group-hover:gap-2.5 group-hover:brightness-110">
              Ver vagas
              <ArrowRight style={{ width: 13, height: 13 }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Overlay para o card "Futuras Feiras" no desktop (absolute, não afeta tamanho) ───
export function FutureFairsCardBadge() {
  const { fairsNotIn, isLoading } = useUpcomingFairsData()
  const [phrase, setPhrase] = useState("")
  const [visible, setVisible] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setPhrase(URGENCY_PHRASES[Math.floor(Math.random() * URGENCY_PHRASES.length)])
    const id = setInterval(() => setTick((t) => t + 1), 3200)
    return () => clearInterval(id)
  }, [])

  // Troca a frase com fade out/in
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => {
      setPhrase(URGENCY_PHRASES[Math.floor(Math.random() * URGENCY_PHRASES.length)])
      setVisible(true)
    }, 300)
    return () => clearTimeout(t)
  }, [tick])

  if (isLoading || fairsNotIn.length === 0) return null

  return (
    // Absolute: fica sobreposto no topo-direito do card, sem empurrar layout
    <div
      className="hidden md:flex absolute top-3 right-3 z-10 items-center gap-2
                 rounded-full px-3 py-1.5 shadow-md cursor-pointer
                 bg-red-50 border border-red-200"
      style={{ animation: "urgency-pulse 2s ease-in-out infinite" }}
    >
      {/* pulsing red dot */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>

      {/* count + rotating phrase inline */}
      <span className="flex items-baseline gap-1.5">
        <span className="text-[11px] font-black text-red-700 whitespace-nowrap">
          {fairsNotIn.length} {fairsNotIn.length === 1 ? "feira disponível" : "feiras disponíveis"}
        </span>
        <span className="text-[9px] text-red-400 font-semibold">·</span>
        <span
          className="text-[9px] font-bold uppercase tracking-wider text-red-500 transition-opacity duration-300 whitespace-nowrap"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {phrase}
        </span>
      </span>
    </div>
  )
}
