'use client'

import * as React from 'react'
import { ChevronDown, CircleHelp } from 'lucide-react'

import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

type FaqItem = {
  question: string
  answer: string
}

type FutureFairFaqProps = {
  items: FaqItem[]
}

export function FutureFairFaq({ items }: FutureFairFaqProps) {
  if (!items?.length) return null

  return (
    <Card className="rounded-3xl p-4 shadow-sm sm:p-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
        <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          <CircleHelp className="h-5 w-5 text-primary" />
          Perguntas frequentes
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Toque nas perguntas abaixo para abrir as respostas e entender os pontos mais comuns antes
          de seguir para o mapa ou falar com a equipe.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <FaqAccordionItem key={index} item={item} defaultOpen={index === 0} index={index} />
        ))}
      </div>
    </Card>
  )
}

function FaqAccordionItem({
  item,
  defaultOpen = false,
  index,
}: {
  item: FaqItem
  defaultOpen?: boolean
  index: number
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full rounded-2xl border bg-gradient-to-br from-background to-muted/20 p-4 text-left transition-colors hover:bg-muted/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
              Pergunta {index + 1}
            </p>
            <span className="mt-2 block text-sm font-semibold leading-6 text-foreground">
              {item.question}
            </span>
          </div>
          <ChevronDown
            className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              open ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pb-4 pt-3 text-sm leading-6 text-muted-foreground">{item.answer}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
