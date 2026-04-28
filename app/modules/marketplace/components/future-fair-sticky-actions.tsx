'use client'

import Link from 'next/link'
import { Grid3X3, Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FutureFairWhatsAppButton } from './future-fair-whatsapp-button'

type StickyActionsProps = {
  fairId: string
  fairName: string
  whatsappNumber?: string | null
  onExpressInterest?: () => void
  hidden?: boolean
}

export function FutureFairStickyActions({
  fairId,
  fairName,
  whatsappNumber,
  onExpressInterest,
  hidden = false,
}: StickyActionsProps) {
  if (hidden) return null

  return (
    <>
      <div className="h-28 sm:hidden" />

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/92 p-3 backdrop-blur-lg sm:hidden">
        <div className="mx-auto max-w-lg">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Proximo passo: abra o mapa ou fale com a equipe
          </p>

          <div className="flex items-center gap-2">
            {onExpressInterest ? (
              <Button onClick={onExpressInterest} className="h-12 flex-1 gap-2 rounded-2xl text-sm">
                <Heart className="h-4 w-4" />
                Tenho interesse
              </Button>
            ) : (
              <Link href={`/feiras/futuras/${fairId}/mapa`} className="flex-1">
                <Button className="h-12 w-full gap-2 rounded-2xl text-sm">
                  <Grid3X3 className="h-4 w-4" />
                  Ver mapa
                </Button>
              </Link>
            )}

            <FutureFairWhatsAppButton
              fairName={fairName}
              whatsappNumber={whatsappNumber}
              size="lg"
              className="h-12 min-w-[9.5rem] rounded-2xl px-4 text-sm"
            />
          </div>
        </div>
      </div>
    </>
  )
}
