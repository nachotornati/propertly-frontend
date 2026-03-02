import { format, parseISO, startOfMonth, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, MapPin, Calendar, TrendingUp, User, Phone, Pencil, Trash2, AlertTriangle, Clock, ArrowRight, Info, FileText } from 'lucide-react'
import type { Property } from '../types'
import clsx from 'clsx'

interface Props {
  property: Property
  reminderDays: number
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

/** Builds a month-by-month list of what the rent should have been from contract start to today. */
function buildMonthlyHistory(property: Property): { date: Date; precio: number; isAdjustment: boolean }[] {
  const start = startOfMonth(parseISO(property.mesInicio))
  const today = startOfMonth(new Date())

  // Build a map: "YYYY-MM" → new price (only adjustment months)
  const adjByMonth = new Map<string, number>()
  for (const rec of property.historialAjustes ?? []) {
    adjByMonth.set(rec.fecha.substring(0, 7), rec.precioAhora)
  }

  const rows: { date: Date; precio: number; isAdjustment: boolean }[] = []
  let currentPrice = property.precio
  let cursor = start

  while (cursor <= today) {
    const ym = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    const isAdjustment = adjByMonth.has(ym)
    if (isAdjustment) currentPrice = adjByMonth.get(ym)!
    rows.push({ date: new Date(cursor), precio: currentPrice, isAdjustment })
    cursor = addMonths(cursor, 1)
  }

  return rows
}

export default function PropertyDetailModal({ property, reminderDays, onEdit, onDelete, onClose }: Props) {
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
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={clsx(
          'sticky top-0 z-10 px-6 py-5 border-b border-slate-100 bg-white rounded-t-2xl',
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

        {/* Body */}
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

          {/* Monthly rent history */}
          {monthlyHistory.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Historial mensual</p>
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
                          row.isAdjustment && !isCurrentMonth(row.date) && 'bg-emerald-50/40',
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
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex justify-end gap-2">
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
  )
}
