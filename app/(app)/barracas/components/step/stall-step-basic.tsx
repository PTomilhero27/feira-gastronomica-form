'use client'

import * as React from 'react'
import { toast } from '@/components/ui/toast'

export function StallStep1Basic({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: {
    pdvName: string
    machinesQty: number
    bannerName: string

    mainCategory: string
    mainCategoryOther: string

    stallSize: 'SIZE_2X2' | 'SIZE_3X3' | 'SIZE_3X6' | ''
    teamQty: number
    stallType: 'OPEN' | 'CLOSED' | 'TRAILER' | ''
  }
  onChange: (next: typeof value) => void
  onNext: () => void
  onBack: () => void
}) {
  const CATEGORIES: Array<{ value: string; label: string }> = [
    { value: 'PASTEL', label: 'Pastel' },
    { value: 'HAMBURGUER', label: 'Hambúrguer' },
    { value: 'PIZZA', label: 'Pizza' },
    { value: 'CHURROS', label: 'Churros' },
    { value: 'DOCES', label: 'Doces' },
    { value: 'BEBIDAS', label: 'Bebidas' },
    { value: 'SORVETE', label: 'Sorvete / Açaí' },
    { value: 'PORCOES', label: 'Porções' },
    { value: 'COMIDA_BRASILEIRA', label: 'Comida brasileira' },
    { value: 'COMIDA_ARABE', label: 'Comida árabe' },
    { value: 'COMIDA_JAPONESA', label: 'Comida japonesa' },
    { value: 'VEGANO', label: 'Vegano / Saudável' },
    { value: 'OTHER', label: 'Outro (digitar)' },
  ]

  const isOtherCategory = value.mainCategory === 'OTHER'
  const isTrailer = value.stallType === 'TRAILER'

  React.useEffect(() => {
    if (value.mainCategory !== 'OTHER' && (value.mainCategoryOther ?? '')) {
      onChange({ ...value, mainCategoryOther: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.mainCategory])

  React.useEffect(() => {
    if (isTrailer && value.stallSize) {
      onChange({ ...value, stallSize: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrailer])

  function setDigitsNumberClamped<K extends 'machinesQty' | 'teamQty'>(key: K, raw: string, min: number, max: number) {
    const digits = (raw ?? '').replace(/\D/g, '')
    if (digits === '') {
      onChange({ ...value, [key]: 0 } as any)
      return
    }
    const n = Number(digits)
    const clamped = Math.min(max, Math.max(min, Number.isFinite(n) ? n : min))
    onChange({ ...value, [key]: clamped } as any)
  }

  const machinesInputValue = value.machinesQty ? String(value.machinesQty) : ''
  const teamInputValue = value.teamQty ? String(value.teamQty) : ''

  function validateAndNext() {
    if (!value.pdvName.trim()) {
      toast.warning({ title: 'Informe o nome interno (PDV)', subtitle: 'Esse campo é obrigatório.' })
      return
    }
    if (!Number.isFinite(value.machinesQty) || value.machinesQty < 0) {
      toast.warning({ title: 'Quantidade de máquinas inválida', subtitle: 'Informe um número válido.' })
      return
    }
    if (!value.bannerName.trim()) {
      toast.warning({ title: 'Informe o nome do banner', subtitle: 'Esse campo é obrigatório.' })
      return
    }
    if (!value.mainCategory) {
      toast.warning({ title: 'Escolha uma categoria', subtitle: 'Selecione a categoria principal.' })
      return
    }
    if (isOtherCategory && !(value.mainCategoryOther ?? '').trim()) {
      toast.warning({ title: 'Informe a categoria', subtitle: 'Ao selecionar "Outro", você precisa digitar a categoria.' })
      return
    }
    if (!Number.isFinite(value.teamQty) || value.teamQty < 1) {
      toast.warning({ title: 'Equipe inválida', subtitle: 'Informe pelo menos 1 pessoa na equipe.' })
      return
    }
    if (!value.stallType) {
      toast.warning({ title: 'Informe o tipo da barraca', subtitle: 'Selecione se é aberta, fechada ou trailer.' })
      return
    }
    if (!isTrailer && !value.stallSize) {
      toast.warning({ title: 'Informe o tamanho', subtitle: 'Selecione o tamanho da barraca.' })
      return
    }
    onNext()
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="rounded-t-3xl bg-orange-50 px-6 py-5">
        <h3 className="text-lg font-bold text-zinc-900">Informações básicas</h3>
        <p className="mt-1 text-sm text-zinc-600">Preencha todos os campos para continuar.</p>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field className="md:col-span-1" label="Nome interno (PDV) *">
            <Input value={value.pdvName} onChange={(e) => onChange({ ...value, pdvName: e.target.value })} placeholder="Ex.: Pastel do Zé" />
          </Field>

          <Field className="md:col-span-1" label="Quantidade de máquinas *">
            <Input
              inputMode="numeric"
              value={machinesInputValue}
              onChange={(e) => setDigitsNumberClamped('machinesQty', e.target.value, 0, 5)}
              placeholder="Ex.: 2"
              max={5}
            />
            <Hint>Somente números (máx. 5).</Hint>
          </Field>

          <Field className="md:col-span-1" label="Nome do banner *">
            <Input value={value.bannerName} onChange={(e) => onChange({ ...value, bannerName: e.target.value })} placeholder="Ex.: Pastéis e Porções" />
          </Field>

          <Field className="md:col-span-1" label="Categoria principal *">
            <select
              className={selectCls()}
              value={value.mainCategory}
              onChange={(e) => {
                const nextCategory = e.target.value
                onChange({
                  ...value,
                  mainCategory: nextCategory,
                  mainCategoryOther: nextCategory === 'OTHER' ? (value.mainCategoryOther ?? '') : '',
                })
              }}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          {isOtherCategory ? (
            <Field className="md:col-span-2" label="Qual categoria? *">
              <Input
                value={value.mainCategoryOther ?? ''} // ✅ nunca undefined
                onChange={(e) => onChange({ ...value, mainCategoryOther: e.target.value })}
                placeholder="Ex.: Crepe"
              />
            </Field>
          ) : null}

          <Field className="md:col-span-2" label="Pessoas na equipe *">
            <Input
              inputMode="numeric"
              value={teamInputValue}
              onChange={(e) => setDigitsNumberClamped('teamQty', e.target.value, 1, 15)}
              placeholder="Ex.: 3"
              max={15}
            />
            <Hint>Somente números (mín. 1, máx. 15).</Hint>
          </Field>

          <Field className="md:col-span-2" label="Tipo da barraca *">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <PickCard title="Aberta" subtitle="Aberta e virada para o público." selected={value.stallType === 'OPEN'} onClick={() => onChange({ ...value, stallType: 'OPEN' })} />
              <PickCard title="Fechada" subtitle="Fechada, atendimento virado ao público." selected={value.stallType === 'CLOSED'} onClick={() => onChange({ ...value, stallType: 'CLOSED' })} />
              <PickCard title="Trailer" subtitle="Trailer/food truck (estrutura própria)." selected={value.stallType === 'TRAILER'} onClick={() => onChange({ ...value, stallType: 'TRAILER' })} />
            </div>
          </Field>

          <Field className="md:col-span-2" label="Tamanho da barraca *">
            <div className={['grid grid-cols-1 gap-3 sm:grid-cols-3', isTrailer ? 'pointer-events-none opacity-50' : ''].join(' ')}>
              <PickCard title="2m × 2m" subtitle="Compacta" selected={value.stallSize === 'SIZE_2X2'} onClick={() => onChange({ ...value, stallSize: 'SIZE_2X2' })} />
              <PickCard title="3m × 3m" subtitle="Padrão" selected={value.stallSize === 'SIZE_3X3'} onClick={() => onChange({ ...value, stallSize: 'SIZE_3X3' })} />
              <PickCard title="3m × 6m" subtitle="Maior" selected={value.stallSize === 'SIZE_3X6'} onClick={() => onChange({ ...value, stallSize: 'SIZE_3X6' })} />
            </div>

            {isTrailer ? (
              <p className="mt-2 text-xs text-zinc-500">
                Como você selecionou <b>Trailer</b>, o tamanho não é necessário.
              </p>
            ) : null}
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-b-3xl border-t border-zinc-200 bg-zinc-50 px-6 py-4">
        <button type="button" onClick={onBack} className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">
          Voltar
        </button>

        <button type="button" onClick={validateAndNext} className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600">
          Próximo
        </button>
      </div>
    </section>
  )
}

/* ---------------- UI helpers ---------------- */

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={['space-y-1.5', className ?? ''].join(' ')}>
      <label className="text-sm font-semibold text-zinc-800">{label}</label>
      {children}
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-zinc-500">{children}</p>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm',
        'placeholder:text-zinc-400 shadow-sm outline-none transition',
        'focus:border-orange-500 focus:ring-4 focus:ring-orange-100',
      ].join(' ')}
    />
  )
}

function selectCls() {
  return [
    'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm',
    'shadow-sm outline-none transition',
    'focus:border-orange-500 focus:ring-4 focus:ring-orange-100',
  ].join(' ')
}

function PickCard({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string
  subtitle: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-2xl border p-4 text-left transition',
        'hover:border-zinc-300 hover:bg-zinc-50',
        selected ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-100' : 'border-zinc-200 bg-white',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className={['mt-1 h-4 w-4 shrink-0 rounded-full border', selected ? 'border-orange-500 bg-orange-500' : 'border-zinc-300 bg-white'].join(' ')} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900">{title}</div>
          <p className="mt-1 text-xs text-zinc-600">{subtitle}</p>
        </div>
      </div>
    </button>
  )
}
