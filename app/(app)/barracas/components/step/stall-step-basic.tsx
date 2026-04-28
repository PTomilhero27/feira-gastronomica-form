/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import * as React from 'react'
import { toast } from '@/components/ui/toast'

/**
 * Step 1 (Básico) do cadastro de barracas no Portal.
 *
 * Responsabilidade:
 * - Capturar dados principais da barraca (PDV, banner, categoria, equipe, tipo e tamanho).
 *
 * Decisão (Carrinho):
 * - Incluímos "Carrinho" como tipo (stallType=CART).
 * - Quando tipo = CART, não exigimos tamanho 2x2/3x3/3x6.
 * - Ainda assim mostramos o card "Carrinho" no bloco de tamanho para consistência visual,
 *   mas a regra de negócio final é resolvida no payload (stallSize=CART).
 */
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

    stallSize: 'SIZE_2X2' | 'SIZE_3X3' | 'SIZE_3X6' | 'CART' | ''
    teamQty: number
    stallType: 'OPEN' | 'CLOSED' | 'TRAILER' | 'CART' | ''
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
  const isCart = value.stallType === 'CART'

  React.useEffect(() => {
    if (value.mainCategory !== 'OTHER' && (value.mainCategoryOther ?? '')) {
      onChange({ ...value, mainCategoryOther: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.mainCategory])

  /**
   * ✅ Se tipo for TRAILER ou CART, não faz sentido manter um tamanho 2x2/3x3/3x6 selecionado.
   * Mantemos o estado como '' para simplificar validação/UX.
   */
  React.useEffect(() => {
    if ((isTrailer || isCart) && value.stallSize) {
      onChange({ ...value, stallSize: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrailer, isCart])

  function setDigitsNumberClamped<K extends 'machinesQty' | 'teamQty'>(
    key: K,
    raw: string,
    min: number,
    max: number,
  ) {
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
      toast.warning({
        title: 'Informe o tipo da barraca',
        subtitle: 'Selecione se é aberta, fechada, trailer ou carrinho.',
      })
      return
    }

    // ✅ OPEN/CLOSED exigem tamanho; TRAILER/CART não.
    if (!isTrailer && !isCart && !value.stallSize) {
      toast.warning({ title: 'Informe o tamanho', subtitle: 'Selecione o tamanho da barraca.' })
      return
    }

    onNext()
  }

  const sizeDisabled = isTrailer || isCart

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-50/80 px-5 py-5 sm:px-6 border-b border-slate-100 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#010077] to-[#254cc9]" />
        <h3 className="text-lg font-bold text-[#010077]">Informações básicas</h3>
        <p className="mt-1 text-sm text-slate-500 font-medium">Preencha todos os campos obrigatórios para continuar.</p>
      </div>

      <div className="px-5 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field className="md:col-span-1" label="Nome interno (PDV) *">
            <Input
              value={value.pdvName}
              onChange={(e) => onChange({ ...value, pdvName: e.target.value })}
              placeholder="Ex.: Pastel do Zé"
            />
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
            <Input
              value={value.bannerName}
              onChange={(e) => onChange({ ...value, bannerName: e.target.value })}
              placeholder="Ex.: Pastéis e Porções"
            />
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <PickCard
                title="Aberta"
                subtitle="Virada para o público."
                selected={value.stallType === 'OPEN'}
                onClick={() => onChange({ ...value, stallType: 'OPEN' })}
              />
              <PickCard
                title="Fechada"
                subtitle="Atendimento no balcão."
                selected={value.stallType === 'CLOSED'}
                onClick={() => onChange({ ...value, stallType: 'CLOSED' })}
              />
              <PickCard
                title="Trailer"
                subtitle="Trailer/food truck (estrutura própria)."
                selected={value.stallType === 'TRAILER'}
                onClick={() => onChange({ ...value, stallType: 'TRAILER' })}
              />
              <PickCard
                title="Carrinho"
                subtitle="Carrinho (estrutura compacta)."
                selected={value.stallType === 'CART'}
                onClick={() => onChange({ ...value, stallType: 'CART' })}
              />
            </div>
          </Field>

          <Field className="md:col-span-2" label="Tamanho da barraca *">
            <div
              className={[
                'grid grid-cols-2 gap-3 sm:grid-cols-3',
                sizeDisabled ? 'pointer-events-none opacity-40 grayscale-[0.5]' : '',
              ].join(' ')}
            >
              <PickCard
                title="2m × 2m"
                subtitle="Compacta"
                selected={value.stallSize === 'SIZE_2X2'}
                onClick={() => onChange({ ...value, stallSize: 'SIZE_2X2' })}
              />
              <PickCard
                title="3m × 3m"
                subtitle="Padrão"
                selected={value.stallSize === 'SIZE_3X3'}
                onClick={() => onChange({ ...value, stallSize: 'SIZE_3X3' })}
              />
              <PickCard
                title="3m × 6m"
                subtitle="Maior"
                selected={value.stallSize === 'SIZE_3X6'}
                onClick={() => onChange({ ...value, stallSize: 'SIZE_3X6' })}
              />
            </div>

            {isTrailer ? (
              <p className="mt-2 text-xs text-zinc-500">
                Como você selecionou <b>Trailer</b>, o tamanho não é necessário.
              </p>
            ) : null}

            {isCart ? (
              <p className="mt-2 text-xs text-zinc-500">
                Como você selecionou <b>Carrinho</b>,  o tamanho não é necessário.
              </p>
            ) : null}
          </Field>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={validateAndNext}
          className="w-full sm:w-auto rounded-xl bg-[#010077] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#010077]/90 transition-colors"
        >
          Próximo
        </button>
      </div>
    </section>
  )
}

/* ---------------- UI helpers ---------------- */

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={['space-y-2', className ?? ''].join(' ')}>
      <label className="text-sm font-bold text-slate-800">{label}</label>
      {children}
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-medium text-slate-500">{children}</p>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium',
        'placeholder:text-slate-400 shadow-sm outline-none transition-all',
        'focus:border-[#010077] focus:ring-4 focus:ring-[#010077]/10',
      ].join(' ')}
    />
  )
}

function selectCls() {
  return [
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700',
    'shadow-sm outline-none transition-all',
    'focus:border-[#010077] focus:ring-4 focus:ring-[#010077]/10',
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
        'w-full rounded-2xl border p-3 sm:p-4 text-left transition-all',
        'hover:border-slate-300 hover:bg-slate-50',
        selected ? 'border-[#010077] bg-[#010077]/5 ring-2 ring-[#010077]/20 shadow-sm' : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
        <div
          className={[
            'h-4 w-4 shrink-0 rounded-full border',
            selected ? 'border-[#010077] bg-[#010077]' : 'border-slate-300 bg-white',
          ].join(' ')}
        />
        <div className="min-w-0">
          <div className={`truncate text-sm font-bold ${selected ? 'text-[#010077]' : 'text-slate-900'}`}>{title}</div>
          <p className="mt-0.5 text-xs font-medium text-slate-500 line-clamp-2">{subtitle}</p>
        </div>
      </div>
    </button>
  )
}
