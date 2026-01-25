'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from '@/components/ui/toast'
import { getErrorMessage } from '@/modules/shared/utils/get-error-message'
import { useStallsCreateMutation, useStallsUpdateMutation } from '../api/stalls.queries'
import { CreateStallRequest, Stall, UpdateStallRequest } from '../api/stalls.schema'
import { brlToCents } from '../api/utils/formatters'
import { StallStep1Basic } from './step/stall-step-basic'
import { StallStep2Menu } from './step/stall-step-menu'
import { StallStep3Infra } from './step/stall-step-infra'
import { StallSuccess } from './stall-success'
import { StepProgress } from './step-progress'

export function StallWizard({
  fairId,
  document,
  mode,
  initialStall,
  onCancel,
  onSaved,
}: {
  fairId: string
  document: string
  mode: 'create' | 'edit'
  initialStall?: Stall
  onCancel: () => void
  onSaved: () => void
}) {
  const steps = [
    { key: 'basic', label: 'Básico' },
    { key: 'menu', label: 'Cardápio' },
    { key: 'infra', label: 'Infra' },
  ]

  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)

  const createMutation = useStallsCreateMutation(fairId)
  const updateMutation = useStallsUpdateMutation(fairId)

  const isSubmitting = useMemo(
    () => createMutation.isPending || updateMutation.isPending,
    [createMutation.isPending, updateMutation.isPending],
  )

  /** ---------------------------
   * Estado local (UI-friendly)
   * -------------------------- */
  const [basic, setBasic] = useState(() => ({
    pdvName: initialStall?.pdvName ?? '',
    machinesQty: initialStall?.machinesQty ?? 0,
    bannerName: initialStall?.bannerName ?? '',
    mainCategory: initialStall?.mainCategory ?? '',
    stallType: (initialStall?.stallType ?? 'OPEN') as 'OPEN' | 'CLOSED' | 'TRAILER' | '',
    stallSize: (initialStall?.stallSize ?? 'SIZE_3X3') as
      | 'SIZE_2X2'
      | 'SIZE_3X3'
      | 'SIZE_3X6'
      | 'TRAILER'
      | '',
    teamQty: initialStall?.teamQty ?? 1,
  }))

  // ✅ se escolher TRAILER, força stallSize=TRAILER
  useEffect(() => {
    if (basic.stallType === 'TRAILER' && basic.stallSize !== 'TRAILER') {
      setBasic((prev) => ({ ...prev, stallSize: 'TRAILER' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basic.stallType])

  const [menu, setMenu] = useState<Array<{ name: string; products: Array<{ name: string; price: string }> }>>(() => {
    if (!initialStall?.menuCategories?.length) return []
    return initialStall.menuCategories
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
      setStep(0)
      return false
    }

    if (!basic.bannerName.trim()) {
      toast.warning({ title: 'Informe o nome do banner', subtitle: 'Esse campo é obrigatório.' })
      setStep(0)
      return false
    }

    if (!basic.mainCategory?.trim()) {
      toast.warning({ title: 'Selecione a categoria principal', subtitle: 'Esse campo é obrigatório.' })
      setStep(0)
      return false
    }

    if (!basic.stallType) {
      toast.warning({ title: 'Informe o tipo da barraca', subtitle: 'Selecione: Aberta, Fechada ou Trailer.' })
      setStep(0)
      return false
    }

    if (basic.stallType !== 'TRAILER' && !basic.stallSize) {
      toast.warning({ title: 'Informe o tamanho', subtitle: 'Selecione o tamanho da barraca.' })
      setStep(0)
      return false
    }

    if (!Number.isFinite(Number(basic.teamQty)) || Number(basic.teamQty) < 1) {
      toast.warning({ title: 'Informe pessoas na equipe', subtitle: 'Mínimo 1.' })
      setStep(0)
      return false
    }

    return true
  }

  function validateStep1(): boolean {
    if (!menu.length) {
      toast.warning({ title: 'Adicione uma categoria', subtitle: 'Você precisa ter pelo menos 1 categoria no cardápio.' })
      setStep(1)
      return false
    }

    for (const c of menu) {
      if (!c.name?.trim()) {
        toast.warning({ title: 'Categoria sem nome', subtitle: 'Preencha o nome de todas as categorias.' })
        setStep(1)
        return false
      }
      if (!c.products?.length) {
        toast.warning({
          title: 'Categoria sem produto',
          subtitle: `A categoria "${c.name}" precisa ter pelo menos 1 produto.`,
        })
        setStep(1)
        return false
      }
      for (const p of c.products) {
        if (!p.name?.trim()) {
          toast.warning({ title: 'Produto sem nome', subtitle: `Preencha o nome dos produtos da categoria "${c.name}".` })
          setStep(1)
          return false
        }
      }
    }

    return true
  }

  function validateStep2(): boolean {
    const totalOutlets = Number(infra.outlets110 || 0) + Number(infra.outlets220 || 0) + Number(infra.outletsOther || 0)
    const validEquipmentsCount = (infra.equipments ?? []).filter((e) => (e.name ?? '').trim().length > 0).length
    const hasAnything = totalOutlets > 0 || validEquipmentsCount > 0 || Boolean(infra.needsGas) || Boolean(infra.notes?.trim())

    if (!hasAnything) {
      toast.warning({
        title: 'Preencha as observações gerais',
        subtitle: 'Se não precisar de energia, escreva: "Não vou precisar de energia".',
      })
      setStep(2)
      return false
    }

    if (infra.needsGas && !infra.gasNotes?.trim()) {
      toast.warning({
        title: 'Observações sobre gás',
        subtitle: 'Você marcou que precisa de gás. Descreva rapidamente (ex.: botijão P13).',
      })
      setStep(2)
      return false
    }

    for (const e of infra.equipments ?? []) {
      if (!e.name?.trim()) {
        toast.warning({ title: 'Equipamento sem nome', subtitle: 'Preencha o nome dos equipamentos ou remova o item.' })
        setStep(2)
        return false
      }
      const q = Number(e.qty)
      if (!Number.isFinite(q) || q < 1 || q > 99) {
        toast.warning({ title: 'Quantidade inválida', subtitle: 'A quantidade do equipamento deve ser entre 1 e 99.' })
        setStep(2)
        return false
      }
    }

    return true
  }

  /** ---------------------------
   * Payload (contrato do BACK)
   * -------------------------- */
  function buildPayload(): CreateStallRequest {
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

    const resolvedStallSize =
      basic.stallType === 'TRAILER' ? 'TRAILER' : (basic.stallSize || 'SIZE_3X3')

    return {
      document,
      stall: {
        pdvName: basic.pdvName.trim(),
        machinesQty: Math.min(5, Math.max(0, Number(basic.machinesQty || 0))),
        bannerName: basic.bannerName.trim(),
        mainCategory: basic.mainCategory?.trim() || '',
        stallType: basic.stallType as any,
        stallSize: resolvedStallSize as any,
        teamQty: Math.min(15, Math.max(1, Number(basic.teamQty || 1))),
        categories,
        equipments,
        power: {
          outlets110: Number(infra.outlets110 || 0),
          outlets220: Number(infra.outlets220 || 0),
          outletsOther: Number(infra.outletsOther || 0),
          needsGas: Boolean(infra.needsGas),
          gasNotes: infra.needsGas ? (infra.gasNotes?.trim() || '') : '',
          notes: infra.notes?.trim() || '',
        },
      },
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
        setFinished(true)
        return
      }

      if (!initialStall?.id) {
        toast.error({ title: 'Não foi possível editar', subtitle: 'ID da barraca não encontrado.' })
        return
      }

      const updatedPayload: UpdateStallRequest = payload
      await updateMutation.mutateAsync({ stallId: initialStall.id, input: updatedPayload })

      toast.success({ title: 'Barraca atualizada', subtitle: 'Alterações salvas com sucesso.' })
      setFinished(true)
    } catch (err) {
      toast.error({ title: 'Não foi possível salvar', subtitle: getErrorMessage(err) })
    }
  }

  // ✅ SUCESSO: renderiza só o card verde (sem steps e sem resto)
  if (finished) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="w-full max-w-2xl">
          <StallSuccess onFinish={async () => onSaved()} />
        </div>
      </div>
    )
  }

  // ✅ Wizard normal
  return (
    <div className="space-y-4">
      <StepProgress steps={steps} currentIndex={step} />

      {step === 0 ? (
        <StallStep1Basic
          value={basic as any}
          onChange={setBasic as any}
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
          value={infra as any}
          onChange={setInfra as any}
          onBack={back}
          onSubmit={submitFinal}
          isSubmitting={isSubmitting}
          submitLabel={mode === 'create' ? 'Salvar barraca' : 'Salvar alterações'}
        />
      ) : null}
    </div>
  )
}
