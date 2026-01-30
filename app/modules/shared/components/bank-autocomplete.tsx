'use client'

import * as React from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BankItem, BANKS_BR } from '../constants/banks-br'

function normalize(str: string) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function highlightParts(text: string, query: string) {
  const q = normalize(query.trim())
  if (!q) return [text]

  const normalizedText = normalize(text)
  const idx = normalizedText.indexOf(q)
  if (idx < 0) return [text]

  // Renderiza no texto original (não perfeito para todos os acentos, mas suficiente pra UI)
  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + query.length)
  const after = text.slice(idx + query.length)
  return [before, { match }, after] as const
}

/**
 * Autocomplete simples (sem depender de Command do shadcn).
 * Responsabilidade:
 * - Permitir buscar banco por código ou nome
 *
 * Decisão:
 * - Mantém "entrada livre": se não achar, usuário pode digitar e seguir
 */
export function BankAutocomplete({
  value,
  onChange,
  disabled,
  placeholder = 'Digite nome ou código (ex: 341, itau)...',
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState(value || '')
  const wrapRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => setQuery(value || ''), [value])

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const filtered = React.useMemo(() => {
    const qRaw = query.trim()
    const q = normalize(qRaw)
    const qIsCode = /^\d{1,4}$/.test(qRaw)

    let list = BANKS_BR

    if (q) {
      list = list.filter((b) => {
        const nameN = normalize(b.name)
        const codeN = normalize(b.code)
        if (qIsCode) return codeN.startsWith(q)
        return nameN.includes(q) || codeN.includes(q)
      })
    }

    const ranked = [...list].sort((a, b) => {
      if (qIsCode) {
        const as = a.code.startsWith(qRaw) ? 0 : 1
        const bs = b.code.startsWith(qRaw) ? 0 : 1
        if (as !== bs) return as - bs
      }
      const ai = normalize(a.name).indexOf(q)
      const bi = normalize(b.name).indexOf(q)
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi)
    })

    return ranked.slice(0, 12)
  }, [query])

  function choose(b: BankItem) {
    const display = `${b.code} - ${b.name}`
    onChange(display)
    setQuery(display)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          value={query}
          disabled={disabled}
          onChange={(e: any) => {
            const v = e.target.value
            setQuery(v)
            onChange(v)
            setOpen(true)
          }}
          onFocus={() => !disabled && setOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border bg-background px-10 py-3 text-sm outline-none transition',
            disabled
              ? 'border-border bg-muted text-muted-foreground'
              : 'border-input focus:border-primary',
          )}
        />

        <button
          type="button"
          onClick={() => !disabled && setOpen((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Abrir lista de bancos"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-background shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Nenhum banco encontrado. Você pode continuar digitando.
            </div>
          ) : (
            <ul className="max-h-72 overflow-auto py-1">
              {filtered.map((b) => {
                const label = `${b.code} - ${b.name}`
                const parts = highlightParts(label, query)

                return (
                  <li key={`${b.code}-${b.name}`}>
                    <button
                      type="button"
                      onClick={() => choose(b)}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted/40"
                    >
                      {parts.map((p, idx) =>
                        typeof p === 'string' ? (
                          <span key={idx}>{p}</span>
                        ) : (
                          <span key={idx} className="font-semibold text-primary">
                            {p.match}
                          </span>
                        ),
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            Pesquise por <b>código</b> (ex: 001, 341) ou <b>nome</b> (ex: itau, santander).
          </div>
        </div>
      )}
    </div>
  )
}
