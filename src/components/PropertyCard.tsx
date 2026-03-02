import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Calendar, TrendingUp, User, Pencil, Trash2, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import type { Cobro, Property } from '../types'
import clsx from 'clsx'

interface PropertyCardProps {
  property: Property
  cobro: Cobro | undefined
  hasVencidoAnterior?: boolean
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
  reminderDays: number
}

export default function PropertyCard({ property, cobro, hasVencidoAnterior, onEdit, onDelete, onClick }: PropertyCardProps) {
  const isARS = property.moneda === 'ARS'
  const precioDisplay = isARS && property.precioActual != null ? property.precioActual : property.precio

  const formatCurrency = (n: number) =>
    `$ ${Math.round(n).toLocaleString('es-AR')}`

  const dayOfMonth = new Date().getDate()
  const cobroStatus = cobro?.pagado ? 'pagado' : dayOfMonth <= 10 ? 'pendiente' : 'vencido'
  const effectiveStatus = hasVencidoAnterior ? 'vencido' : cobroStatus

  const statusBadge = () => {
    if (effectiveStatus === 'pagado') return <span className="badge bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" /> Pagado</span>
    if (effectiveStatus === 'vencido') return <span className="badge bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3" /> Vencido</span>
    return <span className="badge bg-amber-100 text-amber-700"><Clock className="w-3 h-3" /> Pendiente</span>
  }

  return (
    <div
      className={clsx(
        'card p-5 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col',
        effectiveStatus === 'vencido' && 'border-red-200 bg-red-50/30',
        effectiveStatus === 'pendiente' && 'border-amber-200 bg-amber-50/20',
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-900 truncate">
              {property.address || `${property.barrio}${property.provincia ? `, ${property.provincia}` : ''}`}
            </span>
          </div>
          <p className="text-sm text-slate-500 ml-6 truncate">
            {property.unidadFuncional && <span className="font-medium text-slate-600">{property.unidadFuncional} · </span>}
            {property.barrio}
            {property.provincia && property.provincia !== property.barrio && ` · ${property.provincia}`}
          </p>
        </div>
        {statusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-0.5">Precio actual</p>
          <p className="font-bold text-slate-900">
            {property.moneda === 'USD'
              ? `USD ${property.precio.toLocaleString('es-AR')}`
              : formatCurrency(precioDisplay)}
          </p>
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

      <div className="mt-auto pt-3">
        {property.tenantName && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
            <User className="w-3.5 h-3.5" />
            <span>{property.tenantName}</span>
          </div>
        )}

        <div
          className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onEdit} className="btn-secondary py-1.5 px-3 text-xs">
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
          <button onClick={onDelete} className="btn text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 border border-red-200">
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
