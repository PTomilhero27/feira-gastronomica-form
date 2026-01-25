'use client'

import { CheckCircle } from 'lucide-react'

export function StallSuccess({
  onFinish,
}: {
  onFinish: () => void
}) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <CheckCircle className="h-16 w-16 text-emerald-600" />

        <h2 className="mt-4 text-xl font-bold text-emerald-900">
          Barraca cadastrada com sucesso!
        </h2>

        <p className="mt-2 max-w-md text-sm text-emerald-800">
          Todas as informações foram salvas corretamente.
          Você já pode editar a barraca ou continuar o cadastro.
        </p>

        <button
          type="button"
          onClick={onFinish}
          className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Concluir
        </button>
      </div>
    </section>
  )
}
