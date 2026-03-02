import { useState } from 'react'
import { format, parseISO, startOfMonth, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, MapPin, Calendar, TrendingUp, User, Phone, Pencil, Trash2, AlertTriangle, Clock, ArrowRight, Info, FileText, Share2, Check } from 'lucide-react'
import type { Property } from '../types'
import clsx from 'clsx'
import CobrosTab from './CobrosTab'

interface Props {
  property: Property
  reminderDays: number
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

/** Builds a month-by-month list of rent prices from contract start to today, plus
 *  future months where the price is already known (before the next adjustment date). */
function buildMonthlyHistory(property: Property): { date: Date; precio: number; isAdjustment: boolean; isFuture: boolean }[] {
  const start = startOfMonth(parseISO(property.mesInicio))
  const today = startOfMonth(new Date())

  // Build a map: "YYYY-MM" → new price (only adjustment months)
  const adjByMonth = new Map<string, number>()
  for (const rec of property.historialAjustes ?? []) {
    adjByMonth.set(rec.fecha.substring(0, 7), rec.precioAhora)
  }

  // Months at/after nextAdjustmentDate have an unknown price (index not published yet)
  const cutoffDate = property.nextAdjustmentDate
    ? startOfMonth(parseISO(property.nextAdjustmentDate))
    : null

  // Don't exceed end of contract
  const contractEnd = property.duracionMeses
    ? addMonths(start, property.duracionMeses - 1)
    : null

  const rows: { date: Date; precio: number; isAdjustment: boolean; isFuture: boolean }[] = []
  let currentPrice = property.precio
  let cursor = start

  while (cursor <= today || (cutoffDate && cursor < cutoffDate)) {
    if (contractEnd && cursor > contractEnd) break
    const ym = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    const isAdjustment = adjByMonth.has(ym)
    if (isAdjustment) currentPrice = adjByMonth.get(ym)!
    const isFuture = cursor > today
    rows.push({ date: new Date(cursor), precio: currentPrice, isAdjustment, isFuture })
    cursor = addMonths(cursor, 1)
  }

  return rows
}

export default function PropertyDetailModal({ property, reminderDays, onEdit, onDelete, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'detalle' | 'cobros' | 'historial'>('detalle')
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    if (!property.tenantToken) return
    const url = `${window.location.origin}/t/${property.tenantToken}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  const isARS = property.moneda === 'ARS'
  const due = property.adjustmentDue
  const soon = isARS && !due && (property.daysUntilAdjustment ?? 999) <= reminderDays
  const precioDisplay = isARS && property.precioActual != null ? property.precioActual : property.precio

  const formatCurrency = (n: number) => `$ ${Math.round(n).toLocaleString('es-AR')}`

  const monthlyHistory = isARS && property.historialAjustes ? buildMonthlyHistory(property) : []
  const isCurrentMonth = (d: Date) => {
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={clsx(
          'shrink-0 px-6 py-5 border-b border-slate-100 bg-white rounded-t-2xl',
          due && 'bg-red-50 border-red-100',
          soon && !due && 'bg-amber-50 border-amber-100',
        )}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <h2 className="font-bold text-slate-900 text-lg leading-tight truncate">
                  {property.address || `${property.barrio}${property.provincia ? `, ${property.provincia}` : ''}`}
                </h2>
              </div>
              <p className="text-sm text-slate-500 ml-6">
                {property.barrio}
                {property.provincia && property.provincia !== property.barrio && ` · ${property.provincia}`}
              </p>
            </div>
            <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status */}
          <div className="mt-3 flex items-center gap-2">
            {!isARS && <span className="badge bg-slate-100 text-slate-600">Sin ajuste (USD)</span>}
            {isARS && due && <span className="badge bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3" /> Ajuste vencido</span>}
            {isARS && soon && <span className="badge bg-amber-100 text-amber-700"><Clock className="w-3 h-3" /> En {property.daysUntilAdjustment} días</span>}
            {isARS && !due && !soon && <span className="badge bg-emerald-100 text-emerald-700">Al día</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 px-6 pt-4 border-b border-slate-100">
          <div className="flex rounded-lg bg-slate-100 p-1">
            {(['detalle', 'cobros', ...(isARS && monthlyHistory.length > 0 ? ['historial'] : [])] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t as typeof activeTab)}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                  activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}>
                {t === 'detalle' ? 'Detalle' : t === 'cobros' ? 'Cobros' : 'Historial'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
        {activeTab === 'cobros' ? (
          <div className="px-6 py-5"><CobrosTab property={property} /></div>
        ) : activeTab === 'historial' ? (
          <div className="px-6 py-5">
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Mes</th>
                    <th className="px-4 py-2.5 text-right font-medium">Alquiler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...monthlyHistory].reverse().map((row, i) => (
                    <tr
                      key={i}
                      className={clsx(
                        isCurrentMonth(row.date) && 'bg-brand-50',
                        row.isAdjustment && !isCurrentMonth(row.date) && !row.isFuture && 'bg-emerald-50/40',
                        row.isFuture && !isCurrentMonth(row.date) && 'opacity-50',
                      )}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-700 flex items-center gap-2">
                        {format(row.date, "MMMM yyyy", { locale: es })}
                        {row.isAdjustment && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            ajuste
                          </span>
                        )}
                        {isCurrentMonth(row.date) && (
                          <span className="text-[10px] font-semibold text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded-full">
                            hoy
                          </span>
                        )}
                        {row.isFuture && !isCurrentMonth(row.date) && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                            próximo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                        {formatCurrency(row.precio)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
        <div className="px-6 py-5 space-y-5">

          {/* Price */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Precio actual</p>
            <p className="text-3xl font-bold text-slate-900">
              {property.moneda === 'USD'
                ? `USD ${property.precio.toLocaleString('es-AR')}`
                : formatCurrency(precioDisplay)}
            </p>
            {isARS && property.precioActual != null && property.precioActual !== property.precio && (
              <p className="text-xs text-slate-400 mt-0.5">
                Precio inicial: {formatCurrency(property.precio)}
              </p>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-0.5">Inicio del contrato</p>
              <p className="font-medium text-slate-700">
                {format(parseISO(property.mesInicio), "MMMM yyyy", { locale: es })}
              </p>
            </div>

            {property.duracionMeses && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Vencimiento del contrato
                </p>
                <p className="font-medium text-slate-700">
                  {format(addMonths(parseISO(property.mesInicio), property.duracionMeses - 1), "MMMM yyyy", { locale: es })}
                </p>
              </div>
            )}

            {isARS && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Ajuste
                </p>
                <p className="font-medium text-slate-700">
                  Cada {property.ajusteMeses} mes{property.ajusteMeses > 1 ? 'es' : ''} · {property.indiceAjuste}
                </p>
              </div>
            )}

            {isARS && property.nextAdjustmentDate && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Próximo ajuste
                </p>
                <p className="font-medium text-slate-700">
                  {format(parseISO(property.nextAdjustmentDate), "d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>
            )}

            {property.tenantName && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                  <User className="w-3 h-3" /> Inquilino
                </p>
                <p className="font-medium text-slate-700">{property.tenantName}</p>
                {property.tenantPhone && (
                  <a
                    href={`tel:${property.tenantPhone}`}
                    className="flex items-center gap-1 text-xs text-brand-600 mt-0.5 hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    <Phone className="w-3 h-3" /> {property.tenantPhone}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {property.notes && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Notas
              </p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{property.notes}</p>
            </div>
          )}

          {/* Next adjustment estimate */}
          {isARS && (due || soon) && property.ajusteInfo && (
            <div className={clsx(
              'rounded-xl p-4 border',
              due ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Nuevo valor ({property.indiceAjuste})
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  +{((Number(property.ajusteInfo.coeficiente) - 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 line-through">{formatCurrency(precioDisplay)}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-xl font-bold text-slate-900">{formatCurrency(property.ajusteInfo.nuevoPrecio)}</span>
              </div>
              {property.ajusteInfo.estimado && property.ajusteInfo.disclaimer && (
                <p className="text-xs text-slate-400 mt-2 flex items-start gap-1">
                  <Info className="w-3 h-3 shrink-0 mt-0.5" />
                  {property.ajusteInfo.disclaimer}
                </p>
              )}
            </div>
          )}

        </div>
        )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex items-center justify-between gap-2">
          <div>
            {property.tenantToken && (
              <button
                onClick={handleShare}
                className={`btn-secondary text-sm transition-all ${copied ? 'text-emerald-600 border-emerald-300 bg-emerald-50' : ''}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? '¡Link copiado!' : 'Compartir con inquilino'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { onEdit(); onClose() }}
              className="btn-secondary"
            >
              <Pencil className="w-4 h-4" /> Editar
            </button>
            <button
              onClick={() => { onDelete(); onClose() }}
              className="btn text-red-600 hover:bg-red-50 border border-red-200"
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
