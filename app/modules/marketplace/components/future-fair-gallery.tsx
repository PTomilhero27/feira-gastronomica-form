'use client'

/**
 * Galeria de imagens de uma feira futura.
 *
 * Responsabilidade:
 * - Exibir galeria com scroll horizontal no mobile
 * - Mostrar placeholder quando não há imagens
 *
 * Reutilização:
 * - Componente puro (recebe URLs via props)
 * - Funciona com qualquer lista de imagens
 */

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

type FutureFairGalleryProps = {
  imageUrls: string[]
  fairName: string
}

export function FutureFairGallery({ imageUrls, fairName }: FutureFairGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const selectedImageUrl = selectedImageIndex !== null ? imageUrls[selectedImageIndex] : null

  // Se não há imagens, mostra placeholder informativo
  if (!imageUrls?.length) {
    return (
      <Card className="rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Galeria</h2>
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">
            Em breve novas imagens do evento serão publicadas.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Galeria</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Veja fotos da feira</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Toque em qualquer imagem para abrir em tamanho maior e observar melhor os detalhes.
        </p>
      </div>

      {/* Scroll horizontal no mobile, grid no desktop */}
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {imageUrls.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedImageIndex(i)}
            className="group relative w-64 shrink-0 overflow-hidden rounded-xl text-left sm:w-auto"
            aria-label={`Ampliar foto ${i + 1} da feira ${fairName}`}
          >
            <img
              src={url}
              alt={`${fairName} - foto ${i + 1}`}
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Clique para ampliar
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedImageIndex(null)
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[min(92vw,1100px)] overflow-hidden border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">
            {selectedImageIndex !== null
              ? `Foto ${selectedImageIndex + 1} da feira ${fairName}`
              : `Galeria da feira ${fairName}`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visualização ampliada da imagem selecionada da galeria.
          </DialogDescription>

          {selectedImageUrl ? (
            <img
              src={selectedImageUrl}
              alt={
                selectedImageIndex !== null
                  ? `${fairName} - foto ${selectedImageIndex + 1}`
                  : `${fairName} - foto ampliada`
              }
              className="max-h-[90vh] w-full rounded-2xl object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
