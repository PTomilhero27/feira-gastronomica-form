'use client'

/**
 * Botão de WhatsApp reutilizável para contato com vendedor.
 *
 * Responsabilidade:
 * - Gerar link wa.me com mensagem contextual
 * - Exibir botão consistente em qualquer parte da feature
 *
 * Props:
 * - fairName: nome da feira (para mensagem)
 * - slotCode: código do slot (opcional, para mensagem mais específica)
 * - whatsappNumber: número de contato (opcional, usa padrão se omitido)
 * - variant: variante do botão (default | outline | ghost)
 * - size: tamanho do botão
 * - className: classes extras
 * - iconOnly: se true, mostra apenas o ícone (para espaços reduzidos)
 */

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  WHATSAPP_SALES_NUMBER,
  buildWhatsAppUrl,
  buildFairContactMessage,
} from '@/app/modules/shared/constants/whatsapp'

type WhatsAppButtonProps = {
  fairName: string
  slotCode?: string
  whatsappNumber?: string | null
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  iconOnly?: boolean
}

export function FutureFairWhatsAppButton({
  fairName,
  slotCode,
  whatsappNumber,
  variant = 'outline',
  size = 'default',
  className = '',
  iconOnly = false,
}: WhatsAppButtonProps) {
  const phone = whatsappNumber ?? WHATSAPP_SALES_NUMBER
  const message = buildFairContactMessage(fairName, slotCode)
  const url = buildWhatsAppUrl(phone, message)

  function handleClick() {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant={variant}
        size="icon"
        className={`rounded-xl ${className}`}
        onClick={handleClick}
        aria-label="Falar com vendedor via WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`gap-2 rounded-xl border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors ${className}`}
      onClick={handleClick}
    >
      <MessageCircle className="h-4 w-4" />
      <span>Falar no WhatsApp</span>
    </Button>
  )
}
