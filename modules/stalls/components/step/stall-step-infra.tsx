'use client'

import * as React from 'react'
import { Plus, Trash2, Zap, Package, ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from '@/components/ui/toast'

/**
 * Step 3 — Infraestrutura.
 *
 * Regras (ajustadas):
 * - NÃO deixa salvar se:
 *   - needsGas=true e gasNotes vazio
 *   - houver equipamentos e algum estiver sem nome ou qty inválida
 * - Observações gerais (notes) só é OBRIGATÓRIA quando o usuário NÃO informou NADA de infra:
 *   - sem tomadas (totalOutlets === 0)
 *   - e sem equipamentos válidos (0 itens com nome)
 *   - e sem gás marcado
 *   => nesse caso, pedir para escrever “Não vou precisar de energia”
 *
 * - Tomadas: não são obrigatórias se houver equipamentos OU notes preenchido (ou gás marcado).
 *   (Ou seja: o usuário pode cadastrar só equipamentos/tomadas/notes, etc.)
 *
 * - Equipamentos: não são obrigatórios. Mas se existir item, valida.
 *
 * - Qty equipamento: 1..99, mas permite apagar o campo (fica vazio) e só força 1 no blur.
 */

const EQUIP_SUGGESTIONS = [
  'Fritadeira',
  'Geladeira',
  'Freezer',
  'Chapa',
  'Forno elétrico',
  'Forno a gás',
  'Estufa',
  'Micro-ondas',
  'Liquidificador',
  'Batedeira',
  'Máquina de açaí',
  'Máquina de sorvete',
  'Cafeteira',
  'Moedor de café',
  'Expositor térmico',
  'Balcão refrigerado',
  'Exaustor',
  'Caixa de som',
] as const

function onlyInt(v: string) {
  const s = (v || '').replace(/[^\d]/g, '')
  return s.length ? Number(s) : 0
}

function required(v: string) {
  return (v ?? '').trim().length > 0
}

function inputCls(extra?: string) {
  return [
    extra ?? '',
    'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900',
    'placeholder:text-zinc-500 shadow-sm outline-none transition',
    'focus:border-orange-500 focus:ring-4 focus:ring-orange-100',
  ]
    .join(' ')
    .trim()
}

function chipCls(active?: boolean) {
  return [
    'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition',
    active
      ? 'border-orange-500 bg-orange-50 text-orange-700'
      : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50',
  ].join(' ')
}

type InfraValue = {
  outlets110: number
  outlets220: number
  outletsOther: number
  needsGas: boolean
  gasNotes: string
  notes: string
  equipments: Array<{ name: string; qty: number }>
}

export function StallStep3Infra({
  value,
  onChange,
  onBack,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  value: InfraValue
  onChange: (next: InfraValue) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
  submitLabel: string
}) {
  const totalEquipQty = React.useMemo(() => {
    return (value.equipments ?? []).reduce((acc, it) => acc + (Number.isFinite(it.qty) ? it.qty : 0), 0)
  }, [value.equipments])

  const totalOutlets = React.useMemo(() => {
    return Number(value.outlets110 || 0) + Number(value.outlets220 || 0) + Number(value.outletsOther || 0)
  }, [value.outlets110, value.outlets220, value.outletsOther])

  const validEquipmentsCount = React.useMemo(() => {
    return (value.equipments ?? []).filter((e) => required(e.name)).length
  }, [value.equipments])

  function addEquipment(preset?: string) {
    onChange({
      ...value,
      equipments: [...(value.equipments ?? []), { name: preset ?? '', qty: 1 }],
    })
  }

  function removeEquipment(idx: number) {
    const next = (value.equipments ?? []).filter((_, i) => i !== idx)
    onChange({ ...value, equipments: next })
  }

  function updateEquipment(idx: number, patch: Partial<{ name: string; qty: number }>) {
    onChange({
      ...value,
      equipments: (value.equipments ?? []).map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    })
  }

  function validate(): string | null {
    const notesTrim = (value.notes ?? '').trim()
    const hasNotes = notesTrim.length > 0
    const hasOutlets = totalOutlets > 0
    const hasEquipments = validEquipmentsCount > 0
    const hasGas = Boolean(value.needsGas)

    // 1) Se marcou gás, gasNotes obrigatório
    if (value.needsGas && !required(value.gasNotes)) {
      return 'Você marcou que precisa de gás. Preencha as observações sobre gás (ex.: 1 botijão P13).'
    }

    // 2) Se tem equipamentos, valida todos
    for (const it of value.equipments ?? []) {
      if (!required(it.name)) return 'Preencha o nome de todos os equipamentos (ou remova os itens vazios).'
      if (!Number.isFinite(it.qty) || it.qty < 1 || it.qty > 99) return 'A quantidade do equipamento deve ser entre 1 e 99.'
    }

    // 3) Observações gerais: só obrigatória quando NÃO informou nada de infra
    //    (sem tomadas, sem equipamentos, sem gás e sem notes)
    if (!hasNotes && !hasOutlets && !hasEquipments && !hasGas) {
      return 'Preencha as observações gerais. Se não precisar de energia, escreva: "Não vou precisar de energia".'
    }

    return null
  }

  function handleSubmit() {
    const err = validate()
    if (err) {
      toast.warning({ title: 'Complete a infraestrutura', subtitle: err })
      return
    }
    onSubmit()
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="bg-orange-50 px-6 py-5">
        <h3 className="text-lg font-semibold text-zinc-900">Infraestrutura</h3>
        <p className="mt-1 text-sm text-zinc-700">Informe necessidades de energia, gás e equipamentos.</p>
      </div>

      <div className="h-px bg-zinc-200" />

      <div className="px-6 py-6">
        {/* Métricas */}
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-zinc-900">
              <Package className="h-4 w-4 text-orange-600" />
              Total de equipamentos: {totalEquipQty}
            </span>

            <span className="inline-flex items-center gap-2 font-semibold text-zinc-900">
              <Zap className="h-4 w-4 text-orange-600" />
              Tomadas: 110={value.outlets110 || 0} • 220={value.outlets220 || 0} • outras={value.outletsOther || 0} (Total:{' '}
              {totalOutlets})
            </span>
          </div>
        </div>

        {/* Sugestões */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-zinc-900">Sugestões rápidas</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {EQUIP_SUGGESTIONS.slice(0, 10).map((s) => (
              <button key={s} type="button" className={chipCls(false)} onClick={() => addEquipment(s)}>
                <Plus className="h-4 w-4 text-orange-600" />
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Equipamentos */}
        <div className="rounded-2xl border border-zinc-200 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900">Equipamentos</div>

            <button
              type="button"
              onClick={() => addEquipment('')}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              Adicionar equipamento
            </button>
          </div>

          <div className="space-y-3">
            {(value.equipments ?? []).map((it, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-2 rounded-2xl border border-zinc-200 bg-white p-3 sm:grid-cols-6 sm:items-end"
              >
                <div className="sm:col-span-4">
                  <label className="text-xs font-semibold text-zinc-800">Nome do equipamento</label>
                  <input
                    value={it.name}
                    onChange={(e) => updateEquipment(idx, { name: e.target.value })}
                    placeholder='Ex: "Fritadeira", "Chapa"...'
                    className={inputCls('mt-1')}
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-zinc-800">Qtde</label>
                  <input
                    inputMode="numeric"
                    placeholder="1"
                    value={it.qty === 0 ? '' : String(it.qty)}
                    onChange={(e) => {
                      const raw = e.target.value

                      // permite apagar tudo (fica vazio)
                      if (raw === '') {
                        updateEquipment(idx, { qty: 0 })
                        return
                      }

                      const n = onlyInt(raw)
                      updateEquipment(idx, { qty: Math.min(99, Math.max(0, n)) })
                    }}
                    onBlur={() => {
                      // ao sair, garante mínimo 1
                      if (!it.qty || it.qty < 1) updateEquipment(idx, { qty: 1 })
                      if (it.qty > 99) updateEquipment(idx, { qty: 99 })
                    }}
                    className={inputCls('mt-1')}
                  />
                </div>

                {/* botão remover (só ícone) */}
                <div className="sm:col-span-1 sm:flex sm:justify-end">
                  <button
                    type="button"
                    onClick={() => removeEquipment(idx)}
                    className="mt-1 inline-flex h-[46px] w-full items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-red-600 sm:w-[46px]"
                    title="Remover"
                    aria-label="Remover equipamento"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            {!value.equipments?.length ? <p className="text-sm text-zinc-600">Nenhum equipamento informado.</p> : null}
          </div>
        </div>

        {/* Tomadas */}
        <div className="mt-5 rounded-2xl border border-zinc-200 p-4">
          <div className="mb-3 text-sm font-semibold text-zinc-900">
            Tomadas necessárias <span className="text-red-600">*</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-zinc-800">Tomadas 110V</label>
              <input
                value={String(value.outlets110 ?? 0)}
                onChange={(e) => onChange({ ...value, outlets110: Math.max(0, onlyInt(e.target.value)) })}
                inputMode="numeric"
                placeholder="0"
                className={inputCls('mt-1')}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-800">Tomadas 220V</label>
              <input
                value={String(value.outlets220 ?? 0)}
                onChange={(e) => onChange({ ...value, outlets220: Math.max(0, onlyInt(e.target.value)) })}
                inputMode="numeric"
                placeholder="0"
                className={inputCls('mt-1')}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-800">Outras</label>
              <input
                value={String(value.outletsOther ?? 0)}
                onChange={(e) => onChange({ ...value, outletsOther: Math.max(0, onlyInt(e.target.value)) })}
                inputMode="numeric"
                placeholder="0"
                className={inputCls('mt-1')}
              />
            </div>
          </div>

          <div className="mt-3 text-xs text-zinc-500">Se não precisar de energia, escreva isso nas observações gerais.</div>
        </div>

        {/* Gás (opcional) */}
        <div className="mt-5 rounded-2xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-zinc-900">Precisa de gás (GLP)?</div>
              <div className="text-xs text-zinc-600">Opcional. Marque caso use botijão/GLP.</div>
            </div>

            <input
              type="checkbox"
              checked={Boolean(value.needsGas)}
              onChange={(e) => onChange({ ...value, needsGas: e.target.checked })}
              className="h-5 w-5"
            />
          </div>

          {value.needsGas ? (
            <div className="mt-3">
              <label className="text-xs font-semibold text-zinc-800">
                Observações sobre gás <span className="text-red-600">*</span>
              </label>
              <textarea
                className={[inputCls('mt-1'), 'min-h-[96px] resize-none'].join(' ')}
                rows={3}
                value={value.gasNotes}
                onChange={(e) => onChange({ ...value, gasNotes: e.target.value })}
                placeholder="Ex.: 1 botijão P13, fogão 2 bocas..."
              />
            </div>
          ) : null}
        </div>

        {/* Observações gerais (condicional) */}
        <div className="mt-5">
          <label className="text-sm font-semibold text-zinc-900">
            Observações gerais{' '}
            {totalOutlets === 0 && validEquipmentsCount === 0 && !value.needsGas ? (
              <span className="text-red-600">*</span>
            ) : null}
          </label>

          <textarea
            value={value.notes}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            placeholder='Ex.: "Não vou precisar de energia" ou "Preciso de ponto de água próximo"...'
            className={[inputCls('mt-2'), 'min-h-[96px] resize-none'].join(' ')}
          />

          <div className="mt-2 text-xs text-zinc-500">
            Se você não precisar de energia, escreva: <b>“Não vou precisar de energia”</b>.
          </div>
        </div>

        {/* Ações */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : submitLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
