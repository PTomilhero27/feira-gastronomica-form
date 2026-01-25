'use client'

import { StallsFormContext } from "../api/stalls-form.schemas"



/**
 * Banner que comunica o estado do formulário (UX).
 * Observação:
 * - Não decide regra de negócio; apenas traduz o contexto do backend.
 */
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function WindowStateBanner({ context }: { context: StallsFormContext }) {
  const now = Date.now()
  const startsAt = new Date(context.window.startsAt).getTime()
  const endsAt = new Date(context.window.endsAt).getTime()

  const isFairActive = context.fair.status === 'ATIVA'
  const isEnabled = context.window.enabled === true
  const isBefore = now < startsAt
  const isAfter = now > endsAt

  let title = 'Inscrições em andamento'
  let detail = `Período: ${formatDateTime(context.window.startsAt)} — ${formatDateTime(
    context.window.endsAt,
  )}`
  let tone: 'ok' | 'warn' | 'block' = 'ok'

  if (!isFairActive) {
    title = 'Feira não está ativa'
    detail = 'O cadastro de barracas está disponível apenas para feiras ativas.'
    tone = 'block'
  } else if (!isEnabled) {
    title = 'Cadastro não liberado'
    detail = 'O organizador ainda não habilitou este formulário para a feira.'
    tone = 'block'
  } else if (isBefore) {
    title = 'Cadastro ainda não liberado'
    detail = `As inscrições iniciam em ${formatDateTime(context.window.startsAt)}.`
    tone = 'warn'
  } else if (isAfter) {
    title = 'Inscrições encerradas'
    detail = `O prazo terminou em ${formatDateTime(context.window.endsAt)}.`
    tone = 'block'
  }

  const toneClasses =
    tone === 'ok'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'warn'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-red-200 bg-red-50 text-red-900'

  return (
    <section className={`rounded-2xl border p-4 ${toneClasses}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm opacity-90">{detail}</div>
      <div className="mt-2 text-xs opacity-80">
        Feira: <span className="font-medium">{context.fair.name}</span>
      </div>
    </section>
  )
}
