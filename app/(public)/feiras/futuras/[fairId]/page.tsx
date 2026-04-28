'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Compass,
  Grid3X3,
  ImageIcon,
} from 'lucide-react'

import { AppBreadcrumb } from '@/components/breadcrumb/app-breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FutureFairFaq } from '@/app/modules/marketplace/components/future-fair-faq'
import { FutureFairGallery } from '@/app/modules/marketplace/components/future-fair-gallery'
import { FutureFairHero } from '@/app/modules/marketplace/components/future-fair-hero'
import { FutureFairMapPreview } from '@/app/modules/marketplace/components/future-fair-map-preview'
import {
  FairBenefitsSection,
  FairDescriptionSection,
  FairInfoSection,
} from '@/app/modules/marketplace/components/future-fair-sections'
import { FutureFairStickyActions } from '@/app/modules/marketplace/components/future-fair-sticky-actions'
import { FutureFairWhatsAppButton } from '@/app/modules/marketplace/components/future-fair-whatsapp-button'
import { FutureFairDetailSkeleton } from '@/app/modules/marketplace/components/marketplace-skeleton'
import { useFutureFairDetailQuery } from '@/app/modules/marketplace/marketplace.queries'
import type { FutureFair } from '@/app/modules/marketplace/marketplace.schemas'

export default function FairDetailPage() {
  const params = useParams<{ fairId: string }>()
  const fairId = params.fairId
  const { data: fair, isLoading, isError, refetch } = useFutureFairDetailQuery(fairId)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
      <AppBreadcrumb
        items={[
          { label: 'Feiras futuras', href: '/feiras/futuras' },
          { label: fair?.name ?? 'Detalhes' },
        ]}
      />

      <div className="mt-4">
        <Link href="/feiras/futuras">
          <Button variant="ghost" className="-ml-2 gap-2 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Voltar para feiras futuras
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="mt-4">
          <FutureFairDetailSkeleton />
        </div>
      )}

      {isError && (
        <Card className="mt-4 rounded-3xl border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base">Nao foi possivel carregar a feira</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Tente novamente em instantes ou volte para a listagem.</p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => refetch()}>
                Recarregar
              </Button>
              <Link href="/feiras/futuras">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  Voltar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && fair && (
        <div className="mt-4 space-y-6">
          <FutureFairHero fair={fair} />

          <PageGuideCard fair={fair} />

          <FairInfoSection fair={fair} />

          {fair.description && <FairDescriptionSection description={fair.description} />}

          <FutureFairMapPreview
            fairId={fair.id}
            availableCount={fair.availableSlotsCount}
            totalCount={fair.totalSlotsCount}
          />

          <FairBenefitsSection benefits={fair.benefits} />

          <FutureFairGallery imageUrls={fair.galleryImageUrls} fairName={fair.name} />

          <FutureFairFaq items={fair.faq} />

          <Card className="hidden overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/8 via-background to-emerald-50/80 p-0 sm:block">
            <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <div className="max-w-2xl">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                  Proximo passo
                </Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Visualize os espacos e avance com seguranca
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                  Abra o mapa para comparar disponibilidade, localizacao e tamanho de cada ponto.
                  Se preferir um atendimento guiado, fale com nossa equipe no WhatsApp.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <HintPill>Mapa interativo</HintPill>
                  <HintPill>Leitura simples de status</HintPill>
                  <HintPill>Contato rapido com a equipe</HintPill>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href={`/feiras/futuras/${fair.id}/mapa`} className="sm:min-w-52">
                  <Button className="h-12 w-full gap-2 rounded-2xl text-base">
                    <Grid3X3 className="h-5 w-5" />
                    Ver mapa de espacos
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <FutureFairWhatsAppButton
                  fairName={fair.name}
                  whatsappNumber={fair.whatsappNumber}
                  size="lg"
                  className="h-12 rounded-2xl px-5"
                />
              </div>
            </div>
          </Card>

          <FutureFairStickyActions
            fairId={fair.id}
            fairName={fair.name}
            whatsappNumber={fair.whatsappNumber}
          />
        </div>
      )}

      {!isLoading && !isError && !fair && (
        <Card className="mt-4 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base">Feira nao encontrada</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link href="/feiras/futuras" className="text-primary underline underline-offset-4">
              Voltar para feiras futuras
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PageGuideCard({ fair }: { fair: FutureFair }) {
  const helperBadges = [
    fair.availableSlotsCount > 0
      ? `${fair.availableSlotsCount} espacos disponiveis`
      : 'Sem espacos disponiveis no momento',
    fair.galleryImageUrls.length > 0
      ? `${fair.galleryImageUrls.length} foto${fair.galleryImageUrls.length > 1 ? 's' : ''} na galeria`
      : null,
    fair.faq.length > 0 ? `${fair.faq.length} duvidas respondidas` : null,
  ].filter(Boolean) as string[]

  return (
    <Card className="rounded-3xl border-primary/10 bg-gradient-to-br from-white via-background to-primary/5 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            Guia rapido
          </Badge>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">Como usar esta pagina</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Aqui voce consegue entender o evento, ver fotos, consultar as duvidas mais comuns e
            abrir o mapa para escolher um espaco com mais confianca.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[34rem]">
          <GuideStep
            icon={Compass}
            title="1. Entenda o evento"
            description="Confira local, datas, investimento e quantidade de espacos disponiveis."
          />
          <GuideStep
            icon={ImageIcon}
            title="2. Veja os detalhes"
            description="Explore as fotos e os beneficios para entender melhor a proposta da feira."
          />
          <GuideStep
            icon={CircleHelp}
            title="3. Tire duvidas e avance"
            description="Leia o FAQ, abra o mapa e fale com a equipe quando quiser seguir."
          />
        </div>
      </div>

      {helperBadges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {helperBadges.map((label) => (
            <HintPill key={label}>{label}</HintPill>
          ))}
        </div>
      )}
    </Card>
  )
}

function GuideStep({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
    </div>
  )
}

function HintPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  )
}
