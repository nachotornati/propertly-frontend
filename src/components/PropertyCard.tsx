import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Calendar, TrendingUp, User, Pencil, Trash2, AlertTriangle, Clock } from 'lucide-react'
import type { Property } from '../types'
import clsx from 'clsx'

interface PropertyCardProps {
  property: Property
  onEdit: () => void
  onDelete: () => void
  reminderDays: number
}

export default function PropertyCard({ property, onEdit, onDelete, reminderDays }: PropertyCardProps) {
  const isARS = property.moneda === 'ARS'
  const due = property.adjustmentDue
  const soon = isARS && !due && (property.daysUntilAdjustment ?? 999) <= reminderDays

  const formatCurrency = (n: number, currency: string) => {
    if (currency === 'USD') return `USD ${n.toLocaleString('es-AR')}`
    return `$ ${n.toLocaleString('es-AR')}`
  }

  const statusBadge = () => {
    if (!isARS) return <span className="badge bg-slate-100 text-slate-600">Sin ajuste</span>
    if (due) return <span className="badge bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3" /> Ajuste vencido</span>
    if (soon) return <span className="badge bg-amber-100 text-amber-700"><Clock className="w-3 h-3" /> En {property.daysUntilAdjustment} días</span>
    return <span className="badge bg-emerald-100 text-emerald-700">Al día</span>
  }

  return (
    <div className={clsx(
      'card p-5 hover:shadow-md transition-all duration-200 group',
      due && 'border-red-200 bg-red-50/30',
      soon && !due && 'border-amber-200 bg-amber-50/20',
    )}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-900 truncate">{property.barrio}</span>
          </div>
          {property.address && (
            <p className="text-sm text-slate-500 ml-6 truncate">{property.address}</p>
          )}
        </div>
        {statusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-0.5">Precio</p>
          <p className="font-bold text-slate-900">{formatCurrency(property.precio, property.moneda)}</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-0.5">Inicio</p>
          <p className="font-medium text-slate-700">
            {format(parseISO(property.mesInicio), 'MMM yyyy', { locale: es })}
          </p>
        </div>

        {isARS && (
          <>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Ajuste
              </p>
              <p className="font-medium text-slate-700">
                Cada {property.ajusteMeses} mes{property.ajusteMeses > 1 ? 'es' : ''} · {property.indiceAjuste}
              </p>
            </div>

            {property.nextAdjustmentDate && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Próximo ajuste
                </p>
                <p className="font-medium text-slate-700">
                  {format(parseISO(property.nextAdjustmentDate), "d 'de' MMM yyyy", { locale: es })}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {property.tenantName && (
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
          <User className="w-3.5 h-3.5" />
          <span>{property.tenantName}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="btn-secondary py-1.5 px-3 text-xs"
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
        <button
          onClick={onDelete}
          className="btn text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 border border-red-200"
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
      </div>
    </div>
  )
}
