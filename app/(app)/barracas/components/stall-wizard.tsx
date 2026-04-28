/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo, useState } from 'react'
import { toast } from '@/components/ui/toast'

import { StepProgress } from './step-progress'

import {
  useStallsCreateMutation,
  useStallsUpdateMutation,
} from '@/app/modules/stalls/stalls.queries'
import { Stall, UpsertStallRequest } from '@/app/modules/stalls/stalls.schema'
import { getErrorMessage } from '@/app/modules/shared/utils/get-error-message'

import { StallStep1Basic } from './step/stall-step-basic'
import { StallStep2Menu } from './step/stall-step-menu'
import { StallStep3Infra } from './step/stall-step-infra'

/**
 * Wizard de criação/edição de Barraca no Portal do Expositor.
 *
 * Responsabilidade:
 * - Guiar o expositor pelos passos de cadastro (básico, cardápio, infra).
 * - Montar payload compatível com o backend (UpsertStallDto).
 *
 * Decisão importante (Carrinho):
 * - Quando stallType = CART, forçamos stallSize = CART no payload.
 * - Quando stallType = TRAILER, forçamos stallSize = TRAILER no payload.
 * - Para OPEN/CLOSED, exigimos tamanho (2x2/3x3/3x6).
 */
export function StallWizard({
  mode,
  initialStall,
  onCancel,
  onSaved,
}: {
  mode: 'create' | 'edit'
  initialStall?: Stall
  onCancel: () => void
  onSaved: () => void
}) {
  const steps = [
    { key: 'basic', label: 'Básico' },
    { key: 'menu', label: 'Cardápio' },
    { key: 'infra', label: 'Infra' },
  ] as const

  const [step, setStep] = useState(0)

  const createMutation = useStallsCreateMutation()
  const updateMutation = useStallsUpdateMutation()

  const isSubmitting = useMemo(
    () => createMutation.isPending || updateMutation.isPending,
    [createMutation.isPending, updateMutation.isPending],
  )

  /** ---------------------------
   * Estado local (UI-friendly)
   * --------------------------
   * Importante:
   * - Aqui o tipo precisa aceitar 'CART' para casar com o Step1.
   * - Mesmo que a gente "zere" o tamanho quando tipo=CART, o Step1 tem opção visual de CART.
   */
  const [basic, setBasic] = useState(() => {
    const stallType = (initialStall?.stallType ?? '') as
      | 'OPEN'
      | 'CLOSED'
      | 'TRAILER'
      | 'CART'
      | ''

    /**
     * UI:
     * - OPEN/CLOSED => permite SIZE_2X2 | SIZE_3X3 | SIZE_3X6
     * - TRAILER/CART => normalmente fica '' (payload resolve)
     *
     * Mesmo assim, tipamos incluindo 'CART' para evitar incompatibilidade
     * quando o Step1 emitir esse valor.
     */
    const stallSize =
      initialStall?.stallSize &&
      initialStall.stallSize !== 'TRAILER' &&
      initialStall.stallSize !== 'CART'
        ? (initialStall.stallSize as 'SIZE_2X2' | 'SIZE_3X3' | 'SIZE_3X6' | 'CART')
        : ('' as string)

    return {
      pdvName: initialStall?.pdvName ?? '',
      machinesQty: initialStall?.machinesQty ?? 0,
      bannerName: initialStall?.bannerName ?? '',
      mainCategory: initialStall?.mainCategory ?? '',
      mainCategoryOther: '',

      stallType,
      stallSize: stallSize as 'SIZE_2X2' | 'SIZE_3X3' | 'SIZE_3X6' | 'CART' | '',
      teamQty: initialStall?.teamQty ?? 1,
    }
  })

  const [menu, setMenu] = useState<
    Array<{ name: string; products: Array<{ name: string; price: string }> }>
  >(() => {
    if (!initialStall?.categories?.length) return []
    return initialStall.categories
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => ({
        name: c.name,
        products: (c.products ?? [])
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((p) => ({
            name: p.name,
            price: String((p.priceCents ?? 0) / 100).replace('.', ','),
          })),
      }))
  })

  const [infra, setInfra] = useState(() => ({
    outlets110: initialStall?.powerNeed?.outlets110 ?? 0,
    outlets220: initialStall?.powerNeed?.outlets220 ?? 0,
    outletsOther: initialStall?.powerNeed?.outletsOther ?? 0,
    needsGas: initialStall?.powerNeed?.needsGas ?? false,
    gasNotes: initialStall?.powerNeed?.gasNotes ?? '',
    notes: initialStall?.powerNeed?.notes ?? '',
    equipments: initialStall?.equipments?.length
      ? initialStall.equipments.map((e) => ({ name: e.name, qty: e.qty }))
      : [],
  }))

  function next() {
    setStep((s) => Math.min(steps.length - 1, s + 1))
  }

  function back() {
    if (step === 0) onCancel()
    else setStep((s) => Math.max(0, s - 1))
  }

  /** ---------------------------
   * Validações por step
   * -------------------------- */
  function validateStep0(): boolean {
    if (!basic.pdvName.trim()) {
      toast.warning({ title: 'Informe o nome interno (PDV)', subtitle: 'Esse campo é obrigatório.' })
      return false
    }

    if (!basic.bannerName.trim()) {
      toast.warning({ title: 'Informe o nome do banner', subtitle: 'Esse campo é obrigatório.' })
      return false
    }

    if (!basic.mainCategory?.trim()) {
      toast.warning({ title: 'Informe a categoria principal', subtitle: 'Esse campo é obrigatório.' })
      return false
    }

    if (basic.mainCategory === 'OTHER' && !basic.mainCategoryOther.trim()) {
      toast.warning({
        title: 'Informe a categoria',
        subtitle: 'Ao selecionar "Outro", você precisa digitar a categoria.',
      })
      return false
    }

    if (!basic.stallType) {
      toast.warning({
        title: 'Informe o tipo da barraca',
        subtitle: 'Selecione: Aberta, Fechada, Trailer ou Carrinho.',
      })
      return false
    }

    // ✅ Para OPEN/CLOSED, exige tamanho
    if (basic.stallType !== 'TRAILER' && basic.stallType !== 'CART' && !basic.stallSize) {
      toast.warning({ title: 'Informe o tamanho', subtitle: 'Selecione o tamanho da barraca.' })
      return false
    }

    if (!Number.isFinite(Number(basic.teamQty)) || Number(basic.teamQty) < 1) {
      toast.warning({ title: 'Informe pessoas na equipe', subtitle: 'Mínimo 1.' })
      return false
    }

    return true
  }

  function validateStep1(): boolean {
    if (!menu.length) {
      toast.warning({
        title: 'Adicione uma categoria',
        subtitle: 'Você precisa ter pelo menos 1 categoria no cardápio.',
      })
      return false
    }

    for (const c of menu) {
      if (!c.name?.trim()) {
        toast.warning({
          title: 'Categoria sem nome',
          subtitle: 'Preencha o nome de todas as categorias.',
        })
        return false
      }
      if (!c.products?.length) {
        toast.warning({
          title: 'Categoria sem produto',
          subtitle: `A categoria "${c.name}" precisa ter pelo menos 1 produto.`,
        })
        return false
      }
      for (const p of c.products) {
        if (!p.name?.trim()) {
          toast.warning({
            title: 'Produto sem nome',
            subtitle: `Preencha o nome dos produtos da categoria "${c.name}".`,
          })
          return false
        }
      }
    }

    return true
  }

  function validateStep2(): boolean {
    const totalOutlets =
      Number(infra.outlets110 || 0) +
      Number(infra.outlets220 || 0) +
      Number(infra.outletsOther || 0)

    const validEquipmentsCount = (infra.equipments ?? []).filter(
      (e) => (e.name ?? '').trim().length > 0,
    ).length

    const hasAnything =
      totalOutlets > 0 ||
      validEquipmentsCount > 0 ||
      Boolean(infra.needsGas) ||
      Boolean(infra.notes?.trim())

    if (!hasAnything) {
      toast.warning({
        title: 'Preencha as observações gerais',
        subtitle: 'Se não precisar de energia, escreva: "Não vou precisar de energia".',
      })
      return false
    }

    if (infra.needsGas && !infra.gasNotes?.trim()) {
      toast.warning({
        title: 'Observações sobre gás',
        subtitle: 'Você marcou que precisa de gás. Descreva rapidamente (ex.: botijão P13).',
      })
      return false
    }

    for (const e of infra.equipments ?? []) {
      if (!e.name?.trim()) {
        toast.warning({
          title: 'Equipamento sem nome',
          subtitle: 'Preencha o nome dos equipamentos ou remova o item.',
        })
        return false
      }
      const q = Number(e.qty)
      if (!Number.isFinite(q) || q < 1 || q > 99) {
        toast.warning({
          title: 'Quantidade inválida',
          subtitle: 'A quantidade do equipamento deve ser entre 1 e 99.',
        })
        return false
      }
    }

    return true
  }

  /** ---------------------------
   * Payload (contrato do BACK)
   * -------------------------- */
  function brlToCents(input: string): number {
    const s = (input ?? '').trim()
    if (!s) return 0
    const norm = s.replace(/\./g, '').replace(',', '.')
    const n = Number(norm)
    if (!Number.isFinite(n)) return 0
    return Math.round(n * 100)
  }

  function buildPayload(): UpsertStallRequest {
    const categories = (menu ?? [])
      .map((c, idx) => ({
        name: (c.name ?? '').trim(),
        order: idx,
        products: (c.products ?? [])
          .map((p, pIdx) => ({
            name: (p.name ?? '').trim(),
            priceCents: brlToCents(p.price),
            order: pIdx,
          }))
          .filter((p) => p.name.length > 0),
      }))
      .filter((c) => c.name.length > 0)

    const equipments = (infra.equipments ?? [])
      .map((e) => ({
        name: (e.name ?? '').trim(),
        qty: Math.min(99, Math.max(1, Number(e.qty || 1))),
      }))
      .filter((e) => e.name.length > 0)

    const resolvedMainCategory =
      basic.mainCategory === 'OTHER' ? basic.mainCategoryOther.trim() : basic.mainCategory.trim()

    /**
     * ✅ Resolução do tamanho conforme o tipo:
     * - TRAILER => stallSize = TRAILER
     * - CART    => stallSize = CART
     * - OPEN/CLOSED => usa o tamanho escolhido (fallback 3x3)
     */
    const resolvedStallSize =
      basic.stallType === 'TRAILER'
        ? 'TRAILER'
        : basic.stallType === 'CART'
          ? 'CART'
          : (basic.stallSize || 'SIZE_3X3')

    const power = {
      outlets110: Number(infra.outlets110 || 0),
      outlets220: Number(infra.outlets220 || 0),
      outletsOther: Number(infra.outletsOther || 0),
      needsGas: Boolean(infra.needsGas),
      gasNotes: infra.needsGas ? (infra.gasNotes?.trim() || '') : '',
      notes: infra.notes?.trim() || '',
    }

    return {
      pdvName: basic.pdvName.trim(),
      machinesQty: Math.min(5, Math.max(0, Number(basic.machinesQty || 0))),
      bannerName: basic.bannerName.trim(),
      mainCategory: resolvedMainCategory,
      stallType: basic.stallType as any,
      stallSize: resolvedStallSize as any,
      teamQty: Math.min(15, Math.max(1, Number(basic.teamQty || 1))),
      categories,
      equipments,
      power,
    }
  }

  async function submitFinal() {
    if (!validateStep0()) return
    if (!validateStep1()) return
    if (!validateStep2()) return

    try {
      const payload = buildPayload()

      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
        toast.success({ title: 'Barraca criada', subtitle: 'Cadastro salvo com sucesso.' })
        onSaved()
        return
      }

      if (!initialStall?.id) {
        toast.error({ title: 'Não foi possível editar', subtitle: 'ID da barraca não encontrado.' })
        return
      }

      await updateMutation.mutateAsync({ stallId: initialStall.id, input: payload })
      toast.success({ title: 'Barraca atualizada', subtitle: 'Alterações salvas com sucesso.' })
      onSaved()
    } catch (err) {
      toast.error({ title: 'Não foi possível salvar', subtitle: getErrorMessage(err) })
    }
  }

  return (
    <div className="space-y-4">
      <StepProgress steps={steps as any} currentIndex={step} />

      {step === 0 ? (
        <StallStep1Basic
          value={basic}
          onChange={setBasic}
          onNext={() => {
            if (!validateStep0()) return
            next()
          }}
          onBack={back}
        />
      ) : null}

      {step === 1 ? (
        <StallStep2Menu
          value={menu}
          onChange={setMenu}
          onNext={() => {
            if (!validateStep1()) return
            next()
          }}
          onBack={back}
        />
      ) : null}

      {step === 2 ? (
        <StallStep3Infra
          value={infra}
          onChange={setInfra}
          onBack={back}
          onSubmit={submitFinal}
          isSubmitting={isSubmitting}
          submitLabel={mode === 'create' ? 'Salvar' : 'Salvar'}
        />
      ) : null}
    </div>
  )
}
