'use client'

/**
 * Viewer interativo do mapa de espaços da feira.
 *
 * Responsabilidade:
 * - Renderizar mapa SVG com slots interativos
 * - Suportar zoom/pan com touch no mobile
 * - Emitir evento ao clicar em um slot
 * - Exibir legenda integrada
 *
 * Componentização:
 * - Componente reutilizável: recebe dados do mapa via props
 * - Separado de qualquer lógica de página
 * - Pode ser reaproveitado em admin, público, etc.
 *
 * Decisão:
 * - SVG inline para controle total de interação
 * - Touch gestures nativos via CSS touch-action + state
 */

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SLOT_STATUS_COLORS, SLOT_STATUS_LABELS, type SlotStatus } from '../marketplace.types'
import type { FairSlot, MapElement, FairMapResponse } from '../marketplace.schemas'
import { FairMapLegend } from './fair-map-legend'

type FairMapViewerProps = {
  mapData: FairMapResponse
  selectedSlotId?: string | null
  onSlotClick?: (slot: FairSlot) => void
  className?: string
}

type ViewBox = {
  x: number
  y: number
  w: number
  h: number
}

type Size = {
  width: number
  height: number
}

type Bounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

function mergeBounds(current: Bounds | null, next: Bounds | null): Bounds | null {
  if (!current) return next
  if (!next) return current

  return {
    minX: Math.min(current.minX, next.minX),
    minY: Math.min(current.minY, next.minY),
    maxX: Math.max(current.maxX, next.maxX),
    maxY: Math.max(current.maxY, next.maxY),
  }
}

function rotatePoint(x: number, y: number, pivotX: number, pivotY: number, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180
  const dx = x - pivotX
  const dy = y - pivotY

  return {
    x: pivotX + dx * Math.cos(angle) - dy * Math.sin(angle),
    y: pivotY + dx * Math.sin(angle) + dy * Math.cos(angle),
  }
}

function getRotatedRectBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0,
): Bounds {
  if (!rotation) {
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
    }
  }

  const corners = [
    rotatePoint(x, y, x, y, rotation),
    rotatePoint(x + width, y, x, y, rotation),
    rotatePoint(x, y + height, x, y, rotation),
    rotatePoint(x + width, y + height, x, y, rotation),
  ]

  return {
    minX: Math.min(...corners.map((corner) => corner.x)),
    minY: Math.min(...corners.map((corner) => corner.y)),
    maxX: Math.max(...corners.map((corner) => corner.x)),
    maxY: Math.max(...corners.map((corner) => corner.y)),
  }
}

function getElementBounds(element: MapElement): Bounds | null {
  if (element.type === 'RECTANGLE') {
    return getRotatedRectBounds(
      element.x,
      element.y,
      element.width ?? 0,
      element.height ?? 0,
      element.rotation ?? 0,
    )
  }

  if (element.type === 'CIRCLE') {
    const radius = element.radius ?? 0
    return {
      minX: element.x,
      minY: element.y,
      maxX: element.x + radius * 2,
      maxY: element.y + radius * 2,
    }
  }

  if (element.type === 'TREE') {
    const radius = element.radius ?? 15
    return {
      minX: element.x - radius,
      minY: element.y - radius,
      maxX: element.x + radius,
      maxY: element.y + radius,
    }
  }

  if (element.type === 'TEXT') {
    const fontSize = element.fontSize ?? 14
    const text = element.text ?? ''
    const width = Math.max(fontSize, text.length * (fontSize * 0.62))
    const height = fontSize * 1.3

    return getRotatedRectBounds(
      element.x,
      element.y - fontSize * 0.65,
      width,
      height,
      element.rotation ?? 0,
    )
  }

  if (element.type === 'LINE') {
    const points = element.points ?? []
    if (points.length < 2) return null

    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    for (let i = 0; i < points.length; i += 2) {
      const x = points[i]
      const y = points[i + 1]
      if (typeof x !== 'number' || typeof y !== 'number') continue

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
      return null
    }

    const strokeInset = Math.max(2, element.strokeWidth ?? 2)
    return {
      minX: minX - strokeInset,
      minY: minY - strokeInset,
      maxX: maxX + strokeInset,
      maxY: maxY + strokeInset,
    }
  }

  return null
}

function getSlotBounds(slot: FairSlot): Bounds {
  return getRotatedRectBounds(slot.x, slot.y, slot.width, slot.height, slot.rotation ?? 0)
}

function getFittedViewBox(mapData: FairMapResponse, viewportSize: Size): ViewBox {
  const bounds = mapData.slots.reduce<Bounds | null>(
    (current, slot) => mergeBounds(current, getSlotBounds(slot)),
    mapData.elements.reduce<Bounds | null>(
      (current, element) => mergeBounds(current, getElementBounds(element)),
      null,
    ),
  )

  if (!bounds) {
    return { x: 0, y: 0, w: mapData.width, h: mapData.height }
  }

  const contentWidth = Math.max(1, bounds.maxX - bounds.minX)
  const contentHeight = Math.max(1, bounds.maxY - bounds.minY)
  const viewportWidth = Math.max(1, viewportSize.width || mapData.width)
  const viewportHeight = Math.max(1, viewportSize.height || mapData.height)
  const horizontalPadding = Math.min(24, viewportWidth * 0.04)
  const verticalPadding = Math.min(24, viewportHeight * 0.04)
  const availableWidth = Math.max(1, viewportWidth - horizontalPadding * 2)
  const availableHeight = Math.max(1, viewportHeight - verticalPadding * 2)
  const fit = Math.min(availableWidth / contentWidth, availableHeight / contentHeight)

  if (!Number.isFinite(fit) || fit <= 0) {
    return { x: 0, y: 0, w: mapData.width, h: mapData.height }
  }

  const w = viewportWidth / fit
  const h = viewportHeight / fit
  const centerX = bounds.minX + contentWidth / 2
  const centerY = bounds.minY + contentHeight / 2

  const fitted = {
    x: centerX - w / 2,
    y: centerY - h / 2,
    w,
    h,
  }

  // Abre um pouco mais aproximado para o mapa ganhar protagonismo logo na entrada.
  return zoomViewBoxFromCenter(fitted, 0.92)
}

function zoomViewBoxFromCenter(viewBox: ViewBox, factor: number): ViewBox {
  const nextW = viewBox.w * factor
  const nextH = viewBox.h * factor

  return {
    x: viewBox.x + (viewBox.w - nextW) / 2,
    y: viewBox.y + (viewBox.h - nextH) / 2,
    w: nextW,
    h: nextH,
  }
}

export function FairMapViewer({
  mapData,
  selectedSlotId,
  onSlotClick,
  className = '',
}: FairMapViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = React.useState<Size>({
    width: mapData.width,
    height: mapData.height,
  })
  const fittedViewBox = React.useMemo(() => getFittedViewBox(mapData, viewportSize), [mapData, viewportSize])
  const [viewBox, setViewBox] = React.useState<ViewBox>(fittedViewBox)
  const [isPanning, setIsPanning] = React.useState(false)
  const panStartRef = React.useRef({ x: 0, y: 0, vx: 0, vy: 0 })

  // Contagem de slots por status para a legenda
  const statusCounts = React.useMemo(() => {
    const counts: Partial<Record<SlotStatus, number>> = {}
    for (const slot of mapData.slots) {
      counts[slot.status] = (counts[slot.status] ?? 0) + 1
    }
    return counts
  }, [mapData.slots])
  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateSize = () => {
      const rect = node.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      setViewportSize({
        width: rect.width,
        height: rect.height,
      })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    setViewBox(fittedViewBox)
  }, [fittedViewBox])

  // ──────────────────────────────────────────
  // Zoom com scroll/pinch
  // ──────────────────────────────────────────

  function handleWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 1.1 : 0.9
    zoomBy(factor, e.clientX, e.clientY)
  }

  function zoomBy(factor: number, clientX: number, clientY: number) {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const px = ((clientX - rect.left) / rect.width) * viewBox.w + viewBox.x
    const py = ((clientY - rect.top) / rect.height) * viewBox.h + viewBox.y

    const minW = Math.max(140, fittedViewBox.w * 0.35)
    const minH = Math.max(140, fittedViewBox.h * 0.35)
    const maxW = fittedViewBox.w * 2
    const maxH = fittedViewBox.h * 2
    const newW = Math.max(minW, Math.min(maxW, viewBox.w * factor))
    const newH = Math.max(minH, Math.min(maxH, viewBox.h * factor))

    setViewBox({
      x: px - (px - viewBox.x) * (newW / viewBox.w),
      y: py - (py - viewBox.y) * (newH / viewBox.h),
      w: newW,
      h: newH,
    })
  }

  // ──────────────────────────────────────────
  // Pan via mouse/touch
  // ──────────────────────────────────────────

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    setIsPanning(true)
    panStartRef.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!isPanning) return
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const dx = ((e.clientX - panStartRef.current.x) / rect.width) * viewBox.w
    const dy = ((e.clientY - panStartRef.current.y) / rect.height) * viewBox.h

    setViewBox((v) => ({
      ...v,
      x: panStartRef.current.vx - dx,
      y: panStartRef.current.vy - dy,
    }))
  }

  function handlePointerUp() {
    setIsPanning(false)
  }

  // ──────────────────────────────────────────
  // Reset zoom
  // ──────────────────────────────────────────

  function resetZoom() {
    setViewBox(fittedViewBox)
  }

  function zoomFromCenter(factor: number) {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    zoomBy(factor, rect.left + rect.width / 2, rect.top + rect.height / 2)
  }

  return (
    <div className={className}>
      <div className="mb-4 rounded-3xl border bg-gradient-to-br from-white via-background to-orange-50/70 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Explore o mapa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique em um espaco para ver os detalhes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => zoomFromCenter(1.1)}
            >
              <Minus className="h-4 w-4" />
              Afastar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => zoomFromCenter(0.9)}
            >
              <Plus className="h-4 w-4" />
              Aproximar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={resetZoom}
            >
              Resetar zoom
            </Button>
          </div>
        </div>

        <FairMapLegend counts={statusCounts} className="mt-4" />
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-[30px] border bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_35%),linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)] shadow-sm"
        style={{ aspectRatio: `${mapData.width} / ${mapData.height}` }}
      >
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          style={{ touchAction: 'none', cursor: isPanning ? 'grabbing' : 'grab' }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Elementos decorativos (fundo, bordas, textos) */}
          {mapData.elements.map((el) => (
            <MapElementRenderer key={el.id} element={el} />
          ))}

          {/* Slots interativos */}
          {mapData.slots.map((slot) => (
            <SlotRenderer
              key={slot.id}
              slot={slot}
              isSelected={slot.id === selectedSlotId}
              onClick={() => onSlotClick?.(slot)}
            />
          ))}
        </svg>
      </div>

      {/* Dica de toque no mobile */}
      <p className="mt-2 text-center text-xs text-muted-foreground sm:hidden">
        Arraste, use zoom e toque em um espaco.
      </p>
    </div>
  )
}

// ──────────────────────────────────────────────
// Sub-componente: Renderizador de elementos decorativos
// ──────────────────────────────────────────────

function MapElementRenderer({ element }: { element: MapElement }) {
  switch (element.type) {
    case 'RECTANGLE': {
      return (
        <g
          transform={
            element.rotation ? `rotate(${element.rotation} ${element.x} ${element.y})` : undefined
          }
        >
          <rect
            x={element.x}
            y={element.y}
            width={element.width ?? 0}
            height={element.height ?? 0}
            fill={element.fill ?? 'transparent'}
            stroke={element.stroke ?? 'none'}
            strokeWidth={element.strokeWidth ?? 1}
            opacity={element.opacity ?? 1}
            rx={4}
          />
          {element.text && (
            <text
              x={element.x + (element.width ?? 0) / 2}
              y={element.y + (element.height ?? 0) / 2}
              fontSize={element.fontSize ?? 14}
              fontWeight="600"
              fill="#1e293b"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {element.text}
            </text>
          )}
        </g>
      )
    }
    case 'CIRCLE': {
      const cx = element.x + (element.radius ?? 0)
      const cy = element.y + (element.radius ?? 0)
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={element.radius ?? 0}
            fill={element.fill ?? 'transparent'}
            stroke={element.stroke ?? 'none'}
            strokeWidth={element.strokeWidth ?? 1}
            opacity={element.opacity ?? 1}
          />
          {element.text && (
            <text
              x={cx}
              y={cy}
              fontSize={element.fontSize ?? 14}
              fontWeight="600"
              fill="#1e293b"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {element.text}
            </text>
          )}
        </g>
      )
    }
    case 'TREE':
      return (
        <g opacity={element.opacity ?? 1}>
          <circle
            cx={element.x}
            cy={element.y}
            r={element.radius ?? 15}
            fill={element.fill ?? '#BBF7D0'}
            stroke={element.stroke ?? '#16A34A'}
            strokeWidth={element.strokeWidth ?? 2}
          />
          {/* Detalhe interno para parecer uma árvore vista de cima */}
          <circle
            cx={element.x}
            cy={element.y}
            r={(element.radius ?? 15) * 0.6}
            fill="none"
            stroke={element.stroke ?? '#16A34A'}
            strokeWidth={1}
            opacity={0.3}
          />
        </g>
      )
    case 'LINE':
      return (
        <polyline
          points={element.points?.join(',')}
          fill="none"
          stroke={element.stroke ?? '#0F172A'}
          strokeWidth={element.strokeWidth ?? 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={element.opacity ?? 1}
        />
      )
    case 'TEXT':
      return (
        <text
          x={element.x}
          y={element.y}
          fontSize={element.fontSize ?? 14}
          fill={element.fill ?? '#64748b'}
          opacity={element.opacity ?? 1}
          fontFamily="system-ui, sans-serif"
          dominantBaseline="middle"
        >
          {element.text ?? ''}
        </text>
      )
    default:
      return null
  }
}

// ──────────────────────────────────────────────
// Sub-componente: Renderizador de slot interativo
// ──────────────────────────────────────────────

function SlotRenderer({
  slot,
  isSelected,
  onClick,
}: {
  slot: FairSlot
  isSelected: boolean
  onClick: () => void
}) {
  const colors = SLOT_STATUS_COLORS[slot.status]
  const isClickable = slot.status === 'AVAILABLE' || slot.status === 'NEGOTIATING'
  const rotation = slot.rotation ?? 0

  return (
    <g
      onClick={isClickable ? onClick : undefined}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
      role={isClickable ? 'button' : undefined}
      aria-label={`Espaco ${slot.code} - ${SLOT_STATUS_LABELS[slot.status as SlotStatus]}`}
    >
      <g transform={rotation ? `rotate(${rotation} ${slot.x} ${slot.y})` : undefined}>
      {/* Fundo do slot */}
      <rect
        x={slot.x}
        y={slot.y}
        width={slot.width}
        height={slot.height}
        rx={6}
        fill={colors.fill}
        opacity={slot.status === 'UNAVAILABLE' ? 0.72 : 0.88}
        stroke={isSelected ? '#0EA5E9' : colors.stroke}
        strokeWidth={isSelected ? 3 : 2}
        className="transition-all duration-150"
      />

      {/* Número do booth */}
      <text
        x={slot.x + slot.width / 2}
        y={slot.y + slot.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.max(10, Math.min(14, Math.min(slot.width, slot.height) * 0.42))}
        fontWeight="700"
        fill="#0F172A"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {slot.boothNumber ?? slot.code}
      </text>

      {/* Highlight de seleção */}
      {isSelected && (
        <rect
          x={slot.x - 2}
          y={slot.y - 2}
          width={slot.width + 4}
          height={slot.height + 4}
          rx={8}
          fill="none"
          stroke="#0EA5E9"
          strokeWidth={2}
          opacity={0.55}
        />
      )}
      </g>
    </g>
  )
}
