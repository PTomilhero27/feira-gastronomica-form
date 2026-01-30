'use client'

import * as React from 'react'
import { toast } from '@/components/ui/toast'
import {
  Plus,
  MoreVertical,
  Trash2,
  Pencil,
  PackagePlus,
  X,
  AlertTriangle,
  GripVertical,
} from 'lucide-react'

/**
 * Step 2 — Cardápio (Portal do Expositor)
 *
 * Regras:
 * - Começa SEM nenhuma categoria
 * - Só deixa avançar se:
 *   - tiver >= 1 categoria
 *   - e cada categoria tiver >= 1 produto
 * - Drag and drop (sem libs)
 * - Nome do produto: máx 40 caracteres
 * - Preço: formato BR (ex.: 12,50)
 */
export function StallStep2Menu({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: Array<{ name: string; products: Array<{ name: string; price: string }> }>
  onChange: (next: typeof value) => void
  onNext: () => void
  onBack: () => void
}) {
  /* ------------------ Utils ------------------ */
  function required(v: string) {
    return (v ?? '').trim().length > 0
  }

  function max40(v: string) {
    const s = (v ?? '').trim()
    return s.length > 0 && s.length <= 40
  }

  function looksLikeMoneyBR(v: string) {
    const s = (v ?? '').trim()
    if (!s) return false
    const cleaned = s.replace(/\s/g, '')
    return /^[0-9]{1,3}(\.[0-9]{3})*(,[0-9]{1,2})?$|^[0-9]+(,[0-9]{1,2})?$/.test(cleaned)
  }

  function arrayMove<T>(arr: T[], from: number, to: number) {
    const copy = [...arr]
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    return copy
  }

  function getElFromPoint(x: number, y: number) {
    return document.elementFromPoint(x, y) as HTMLElement | null
  }

  /* ------------------ Estado ------------------ */
  const categories = value

  const [catMenuOpenIdx, setCatMenuOpenIdx] = React.useState<number | null>(null)

  const [drag, setDrag] = React.useState<
    | null
    | { type: 'category'; fromIndex: number; overIndex: number }
    | { type: 'product'; catIndex: number; fromIndex: number; overIndex: number }
  >(null)

  // Modais
  const [addCatOpen, setAddCatOpen] = React.useState(false)
  const [addCatName, setAddCatName] = React.useState('')

  const [editCatOpen, setEditCatOpen] = React.useState(false)
  const [editCatIdx, setEditCatIdx] = React.useState<number | null>(null)
  const [editCatName, setEditCatName] = React.useState('')

  const [deleteCatOpen, setDeleteCatOpen] = React.useState(false)
  const [deleteCatIdx, setDeleteCatIdx] = React.useState<number | null>(null)

  const [addProdOpen, setAddProdOpen] = React.useState(false)
  const [addProdCatIdx, setAddProdCatIdx] = React.useState<number | null>(null)
  const [prodDrafts, setProdDrafts] = React.useState<Array<{ name: string; price: string }>>([{ name: '', price: '' }])

  const [editProdOpen, setEditProdOpen] = React.useState(false)
  const [editProdCatIdx, setEditProdCatIdx] = React.useState<number | null>(null)
  const [editProdIdx, setEditProdIdx] = React.useState<number | null>(null)
  const [editProdName, setEditProdName] = React.useState('')
  const [editProdPrice, setEditProdPrice] = React.useState('')

  const [deleteProdOpen, setDeleteProdOpen] = React.useState(false)
  const [deleteProdCatIdx, setDeleteProdCatIdx] = React.useState<number | null>(null)
  const [deleteProdIdx, setDeleteProdIdx] = React.useState<number | null>(null)

  // fecha menu ao clicar fora
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.closest('[data-cat-menu-root]')) return
      setCatMenuOpenIdx(null)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  /* ------------------ Helpers ------------------ */
  function closeAllMenus() {
    setCatMenuOpenIdx(null)
  }

  // Category CRUD
  function openAddCategory() {
    closeAllMenus()
    setAddCatName('')
    setAddCatOpen(true)
  }

  function confirmAddCategory() {
    if (!required(addCatName)) {
      toast.warning({ title: 'Informe o nome da categoria', subtitle: 'Esse campo é obrigatório.' })
      return
    }
    const next = [...categories, { name: addCatName.trim(), products: [] }]
    onChange(next)
    setAddCatOpen(false)
  }

  function openEditCategory(catIdx: number) {
    closeAllMenus()
    const cat = categories[catIdx]
    if (!cat) return
    setEditCatIdx(catIdx)
    setEditCatName(cat.name ?? '')
    setEditCatOpen(true)
  }

  function confirmEditCategory() {
    if (editCatIdx === null) return
    if (!required(editCatName)) {
      toast.warning({ title: 'Informe o nome da categoria', subtitle: 'Esse campo é obrigatório.' })
      return
    }
    const next = categories.map((c, i) => (i === editCatIdx ? { ...c, name: editCatName.trim() } : c))
    onChange(next)
    setEditCatOpen(false)
  }

  function openDeleteCategory(catIdx: number) {
    closeAllMenus()
    setDeleteCatIdx(catIdx)
    setDeleteCatOpen(true)
  }

  function confirmDeleteCategory() {
    if (deleteCatIdx === null) return
    const next = categories.filter((_, i) => i !== deleteCatIdx)
    onChange(next)
    setDeleteCatOpen(false)
  }

  // Product CRUD
  function openAddProducts(catIdx: number) {
    closeAllMenus()
    setAddProdCatIdx(catIdx)
    setProdDrafts([{ name: '', price: '' }])
    setAddProdOpen(true)
  }

  function addMoreDraft() {
    setProdDrafts((prev) => [...prev, { name: '', price: '' }])
  }

  function updateDraft(i: number, key: 'name' | 'price', val: string) {
    setProdDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, [key]: val } : d)))
  }

  function confirmAddProducts() {
    if (addProdCatIdx === null) return

    for (const d of prodDrafts) {
      const name = (d.name || '').trim()
      if (!required(name)) {
        toast.warning({ title: 'Preencha o nome do produto', subtitle: 'Esse campo é obrigatório.' })
        return
      }
      if (!max40(name)) {
        toast.warning({ title: 'Nome do produto muito grande', subtitle: 'Máximo de 40 caracteres.' })
        return
      }
      if (!looksLikeMoneyBR(d.price)) {
        toast.warning({ title: 'Preço inválido', subtitle: 'Ex.: 12,50' })
        return
      }
    }

    const next = categories.map((c, i) => {
      if (i !== addProdCatIdx) return c
      return {
        ...c,
        products: [...(c.products ?? []), ...prodDrafts.map((d) => ({ name: d.name.trim(), price: d.price.trim() }))],
      }
    })

    onChange(next)
    setAddProdOpen(false)
  }

  function openEditProduct(catIdx: number, prodIdx: number) {
    closeAllMenus()
    const cat = categories[catIdx]
    const prod = cat?.products?.[prodIdx]
    if (!cat || !prod) return
    setEditProdCatIdx(catIdx)
    setEditProdIdx(prodIdx)
    setEditProdName(prod.name ?? '')
    setEditProdPrice(prod.price ?? '')
    setEditProdOpen(true)
  }

  function confirmEditProduct() {
    if (editProdCatIdx === null || editProdIdx === null) return

    const name = editProdName.trim()
    const price = editProdPrice.trim()

    if (!required(name)) {
      toast.warning({ title: 'Preencha o nome do produto', subtitle: 'Esse campo é obrigatório.' })
      return
    }
    if (!max40(name)) {
      toast.warning({ title: 'Nome do produto muito grande', subtitle: 'Máximo de 40 caracteres.' })
      return
    }
    if (!looksLikeMoneyBR(price)) {
      toast.warning({ title: 'Preço inválido', subtitle: 'Ex.: 12,50' })
      return
    }

    const next = categories.map((c, i) => {
      if (i !== editProdCatIdx) return c
      return { ...c, products: c.products.map((p, pi) => (pi === editProdIdx ? { ...p, name, price } : p)) }
    })

    onChange(next)
    setEditProdOpen(false)
  }

  function openDeleteProduct(catIdx: number, prodIdx: number) {
    closeAllMenus()
    setDeleteProdCatIdx(catIdx)
    setDeleteProdIdx(prodIdx)
    setDeleteProdOpen(true)
  }

  function confirmDeleteProduct() {
    if (deleteProdCatIdx === null || deleteProdIdx === null) return

    const next = categories.map((c, i) => {
      if (i !== deleteProdCatIdx) return c
      return { ...c, products: c.products.filter((_, pi) => pi !== deleteProdIdx) }
    })

    onChange(next)
    setDeleteProdOpen(false)
  }

  /* ------------------ Drag (categories) ------------------ */
  function startDragCategory(pointerId: number, fromIndex: number, target: HTMLElement) {
    closeAllMenus()
    target.setPointerCapture(pointerId)
    setDrag({ type: 'category', fromIndex, overIndex: fromIndex })
  }

  function moveDragCategory(clientX: number, clientY: number) {
    setDrag((d) => {
      if (!d || d.type !== 'category') return d
      const el = getElFromPoint(clientX, clientY)?.closest('[data-cat-index]') as HTMLElement | null
      if (!el) return d
      const over = Number(el.dataset.catIndex)
      if (!Number.isFinite(over)) return d
      if (over === d.overIndex) return d
      return { ...d, overIndex: over }
    })
  }

  function endDragCategory() {
    const d = drag
    if (!d || d.type !== 'category') return
    if (d.fromIndex !== d.overIndex) onChange(arrayMove(categories, d.fromIndex, d.overIndex))
    setDrag(null)
  }

  /* ------------------ Drag (products) ------------------ */
  function startDragProduct(pointerId: number, catIndex: number, fromIndex: number, target: HTMLElement) {
    closeAllMenus()
    target.setPointerCapture(pointerId)
    setDrag({ type: 'product', catIndex, fromIndex, overIndex: fromIndex })
  }

  function moveDragProduct(clientX: number, clientY: number, catIndex: number) {
    setDrag((d) => {
      if (!d || d.type !== 'product') return d
      if (d.catIndex !== catIndex) return d

      const row = getElFromPoint(clientX, clientY)?.closest('[data-prod-index]') as HTMLElement | null
      if (!row) return d
      if (Number(row.dataset.prodCatIndex) !== catIndex) return d

      const over = Number(row.dataset.prodIndex)
      if (!Number.isFinite(over)) return d
      if (over === d.overIndex) return d
      return { ...d, overIndex: over }
    })
  }

  function endDragProduct() {
    const d = drag
    if (!d || d.type !== 'product') return
    if (d.fromIndex === d.overIndex) {
      setDrag(null)
      return
    }

    const next = categories.map((c, i) => {
      if (i !== d.catIndex) return c
      return { ...c, products: arrayMove(c.products, d.fromIndex, d.overIndex) }
    })

    onChange(next)
    setDrag(null)
  }

  /* ------------------ Next validation ------------------ */
  function validateForNext(): { ok: true } | { ok: false; message: string } {
    if (!categories.length) return { ok: false, message: 'Adicione pelo menos 1 categoria para continuar.' }

    for (const c of categories) {
      const catName = (c.name ?? '').trim()
      if (!catName) return { ok: false, message: 'Existe uma categoria sem nome. Preencha para continuar.' }
      if (!c.products?.length) return { ok: false, message: `A categoria "${catName}" precisa ter pelo menos 1 produto.` }

      for (const p of c.products) {
        const n = (p.name ?? '').trim()
        if (!n) return { ok: false, message: `Existe produto sem nome na categoria "${catName}".` }
        if (!max40(n)) return { ok: false, message: `Um produto em "${catName}" excede 40 caracteres.` }
        if (!looksLikeMoneyBR(p.price)) return { ok: false, message: `Preço inválido em "${catName}". Ex.: 12,50` }
      }
    }

    return { ok: true }
  }

  function handleNext() {
    const v = validateForNext()
    if (!v.ok) {
      toast.warning({ title: 'Complete o cardápio', subtitle: v.message })
      return
    }
    onNext()
  }

  /* ------------------ Render ------------------ */
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
      {/* Header (igual Step 1) */}
      <div className="rounded-t-3xl bg-orange-50 px-6 py-5">
        <h3 className="text-lg font-bold text-zinc-900">Cardápio</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Cadastre categorias e produtos. Nome do produto: <b>máx. 40 caracteres</b>.
        </p>
      </div>

      <div className="h-px bg-zinc-200" />

      <div className="px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-900">
            Categorias <span className="text-red-600">*</span>
          </div>

          <button
            type="button"
            onClick={openAddCategory}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Adicionar categoria
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {!categories.length ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
              <div className="font-semibold text-zinc-900">Nenhuma categoria adicionada ainda.</div>
              <div className="mt-1 text-zinc-600">Clique em “Adicionar categoria” para começar.</div>
            </div>
          ) : null}

          {categories.map((cat, catIdx) => {
            const isOverCat = drag?.type === 'category' && drag.overIndex === catIdx

            return (
              <div
                key={catIdx}
                data-cat-index={catIdx}
                className={[
                  'rounded-2xl border bg-white transition',
                  isOverCat ? 'border-orange-400 ring-2 ring-orange-100' : 'border-zinc-200',
                ].join(' ')}
              >
                {/* Header categoria */}
                <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      type="button"
                      className="touch-none rounded-lg p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                      aria-label="Arrastar categoria"
                      onPointerDown={(e) => startDragCategory(e.pointerId, catIdx, e.currentTarget as HTMLElement)}
                      onPointerMove={(e) => {
                        if (!drag || drag.type !== 'category') return
                        moveDragCategory(e.clientX, e.clientY)
                      }}
                      onPointerUp={() => {
                        if (!drag || drag.type !== 'category') return
                        endDragCategory()
                      }}
                    >
                      <GripVertical className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-zinc-900">
                        {cat.name?.trim() ? cat.name : <span className="text-zinc-400">Sem nome</span>}
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-600">{(cat.products?.length ?? 0)} produto(s)</div>
                    </div>
                  </div>

                  {/* menu ... */}
                  <div className="relative" data-cat-menu-root>
                    <button
                      type="button"
                      onClick={() => setCatMenuOpenIdx((prev) => (prev === catIdx ? null : catIdx))}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                      aria-label="Abrir menu"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {catMenuOpenIdx === catIdx ? (
                      <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                        <MenuItem
                          icon={<Pencil className="h-4 w-4" />}
                          label="Editar categoria"
                          onClick={() => openEditCategory(catIdx)}
                        />
                        <MenuItem
                          icon={<PackagePlus className="h-4 w-4" />}
                          label="Adicionar produto"
                          onClick={() => openAddProducts(catIdx)}
                        />
                        <MenuItem
                          icon={<Trash2 className="h-4 w-4 text-red-600" />}
                          label={<span className="text-red-600">Excluir categoria</span>}
                          onClick={() => openDeleteCategory(catIdx)}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Conteúdo categoria */}
                <div className="px-4 py-3">
                  {/* Nome categoria + botão produto */}
                  <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-zinc-800">
                        Nome da categoria <span className="text-red-600">*</span>
                      </div>
                      <input
                        className={inputCls()}
                        value={cat.name ?? ''}
                        onChange={(e) => {
                          const next = categories.map((c, i) => (i === catIdx ? { ...c, name: e.target.value } : c))
                          onChange(next)
                        }}
                        placeholder="Ex.: Lanches"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => openAddProducts(catIdx)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                    >
                      <Plus className="h-4 w-4" />
                      Produto
                    </button>
                  </div>

                  {/* Produtos */}
                  {!cat.products?.length ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                      Nenhum produto ainda. Use “Produto” para adicionar.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cat.products.map((p, pIdx) => {
                        const isOverProd = drag?.type === 'product' && drag.catIndex === catIdx && drag.overIndex === pIdx

                        return (
                          <div
                            key={`${catIdx}-${pIdx}`}
                            data-prod-index={pIdx}
                            data-prod-cat-index={catIdx}
                            className={[
                              'flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition',
                              isOverProd ? 'border-orange-400 bg-orange-50/40' : 'border-zinc-200 bg-white',
                            ].join(' ')}
                          >
                            <div className="flex min-w-0 items-start gap-2">
                              <button
                                type="button"
                                className="touch-none rounded-lg p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                                aria-label="Arrastar produto"
                                onPointerDown={(e) => startDragProduct(e.pointerId, catIdx, pIdx, e.currentTarget as HTMLElement)}
                                onPointerMove={(e) => {
                                  if (!drag || drag.type !== 'product') return
                                  moveDragProduct(e.clientX, e.clientY, catIdx)
                                }}
                                onPointerUp={() => {
                                  if (!drag || drag.type !== 'product') return
                                  endDragProduct()
                                }}
                              >
                                <GripVertical className="h-4 w-4" />
                              </button>

                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-zinc-900">
                                  {p.name || <span className="text-zinc-400">Sem nome</span>}
                                  <span className="ml-2 text-xs font-semibold text-zinc-500">({(p.name ?? '').length}/40)</span>
                                </div>
                                <div className="mt-0.5 text-xs text-zinc-600">{p.price ? `R$ ${p.price}` : '—'}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditProduct(catIdx, pIdx)}
                                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteProduct(catIdx, pIdx)}
                                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-50 hover:text-red-600"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer (igual Step 1) */}
      <div className="flex items-center justify-between gap-3 rounded-b-3xl border-t border-zinc-200 bg-zinc-50 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          Continuar
        </button>
      </div>

      {/* ------------------ MODAIS ------------------ */}
      <Modal open={addCatOpen} onClose={() => setAddCatOpen(false)} title="Adicionar categoria">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-900">
            Nome da categoria <span className="text-red-600">*</span>
          </label>

          <input
            value={addCatName}
            onChange={(e) => setAddCatName(e.target.value)}
            placeholder="Ex.: Porções"
            className={inputCls()}
          />

          <div className="flex justify-end gap-2">
            <BtnGhost onClick={() => setAddCatOpen(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={confirmAddCategory}>Salvar</BtnPrimary>
          </div>
        </div>
      </Modal>

      <Modal open={editCatOpen} onClose={() => setEditCatOpen(false)} title="Editar categoria">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-900">
            Nome da categoria <span className="text-red-600">*</span>
          </label>

          <input
            value={editCatName}
            onChange={(e) => setEditCatName(e.target.value)}
            placeholder="Ex.: Lanches"
            className={inputCls()}
          />

          <div className="flex justify-end gap-2">
            <BtnGhost onClick={() => setEditCatOpen(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={confirmEditCategory}>Salvar</BtnPrimary>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteCatOpen}
        onClose={() => setDeleteCatOpen(false)}
        title="Excluir categoria"
        description="Essa ação é permanente. Não será possível voltar."
        confirmText="Excluir"
        onConfirm={confirmDeleteCategory}
      />

      <Modal open={addProdOpen} onClose={() => setAddProdOpen(false)} title="Adicionar produto(s)">
        <div className="space-y-3">
          <div className="text-sm text-zinc-600">
            Preencha os produtos e valores. Nome: <b>máx. 40</b>.
          </div>

          <div className="space-y-3">
            {prodDrafts.map((d, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-zinc-800">
                    Nome do produto <span className="text-red-600">*</span>
                  </label>

                  <input
                    value={d.name}
                    onChange={(e) => updateDraft(i, 'name', e.target.value)}
                    placeholder="Ex.: Batata com bacon"
                    className={inputCls('mt-1')}
                  />

                  <div className="mt-1 text-[11px] text-zinc-500">{(d.name ?? '').length}/40</div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-800">
                    Valor (R$) <span className="text-red-600">*</span>
                  </label>

                  <input
                    value={d.price}
                    onChange={(e) => updateDraft(i, 'price', e.target.value)}
                    placeholder="Ex.: 35,00"
                    className={inputCls('mt-1')}
                    inputMode="decimal"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={addMoreDraft}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              <Plus className="h-4 w-4" />
              Adicionar mais um produto
            </button>

            <div className="flex justify-end gap-2">
              <BtnGhost onClick={() => setAddProdOpen(false)}>Cancelar</BtnGhost>
              <BtnPrimary onClick={confirmAddProducts}>Salvar</BtnPrimary>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={editProdOpen} onClose={() => setEditProdOpen(false)} title="Editar produto">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-900">
            Nome do produto <span className="text-red-600">*</span>
          </label>

          <input
            value={editProdName}
            onChange={(e) => setEditProdName(e.target.value)}
            placeholder="Ex.: Refrigerante"
            className={inputCls()}
          />

          <div className="text-[11px] text-zinc-500">{editProdName.length}/40</div>

          <label className="text-sm font-semibold text-zinc-900">
            Valor (R$) <span className="text-red-600">*</span>
          </label>

          <input
            value={editProdPrice}
            onChange={(e) => setEditProdPrice(e.target.value)}
            placeholder="Ex.: 12,50"
            className={inputCls()}
            inputMode="decimal"
          />

          <div className="flex justify-end gap-2">
            <BtnGhost onClick={() => setEditProdOpen(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={confirmEditProduct}>Salvar</BtnPrimary>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteProdOpen}
        onClose={() => setDeleteProdOpen(false)}
        title="Excluir produto"
        description="Essa ação é permanente. Não será possível voltar."
        confirmText="Excluir"
        onConfirm={confirmDeleteProduct}
      />
    </section>
  )
}

/* ------------------ UI helpers ------------------ */

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-900 hover:bg-zinc-50"
    >
      <span className="text-zinc-500">{icon}</span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  )
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button className="absolute inset-0 bg-black/40" aria-label="Fechar modal" onClick={onClose} />

      <div className="relative z-10 w-[92vw] max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function ConfirmModal({
  open,
  onClose,
  title,
  description,
  confirmText,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  confirmText: string
  onConfirm: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button className="absolute inset-0 bg-black/40" aria-label="Fechar modal" onClick={onClose} />

      <div className="relative z-10 w-[92vw] max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-orange-50 p-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
            <p className="mt-1 text-sm text-zinc-600">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function BtnPrimary({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
    >
      {children}
    </button>
  )
}

function BtnGhost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
    >
      {children}
    </button>
  )
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
