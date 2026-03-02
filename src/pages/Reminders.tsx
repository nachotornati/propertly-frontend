import { useQuery } from '@tanstack/react-query'
import { getReminders } from '../services/api'
import { Bell, AlertTriangle, Clock, Calendar, ArrowRight, Info } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

interface RemindersProps {
  agencyId: string
  reminderDays: number
}

export default function Reminders({ agencyId, reminderDays }: RemindersProps) {
  const [daysAhead, setDaysAhead] = useState(reminderDays)

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders', agencyId, daysAhead],
    queryFn: () => getReminders(agencyId, daysAhead),
    enabled: !!agencyId,
  })

  const overdue = reminders.filter(p => p.adjustmentDue)
  const upcoming = reminders.filter(p => !p.adjustmentDue)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recordatorios</h1>
          <p className="text-slate-500 mt-1">Ajustes pendientes y próximos</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 font-medium">Ver próximos</label>
          <select
            className="input w-auto"
            value={daysAhead}
            onChange={e => setDaysAhead(Number(e.target.value))}
          >
            <option value={15}>15 días</option>
            <option value={30}>30 días</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-slate-400">Cargando...</div>
      ) : (
        <>
          {overdue.length > 0 && (
            <div className="card border-red-200">
              <div className="p-5 bg-red-50 rounded-t-xl border-b border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-semibold text-red-900">Ajustes vencidos ({overdue.length})</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {overdue.map(prop => (
                  <div key={prop.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{prop.address || prop.barrio}</p>
                        {prop.address && <p className="text-sm text-slate-500">{prop.barrio}{prop.provincia ? ` · ${prop.provincia}` : ''}</p>}
                        {prop.tenantName && <p className="text-sm text-slate-400">Inquilino: {prop.tenantName}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="badge bg-red-100 text-red-700">Vencido</span>
                        <p className="text-xs text-slate-400 mt-1">{prop.indiceAjuste} · c/{prop.ajusteMeses} meses</p>
                      </div>
                    </div>
                    {prop.ajusteInfo && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-slate-500 line-through">$ {Math.round(prop.precio).toLocaleString('es-AR')}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-900">$ {Math.round(prop.ajusteInfo.nuevoPrecio).toLocaleString('es-AR')}</span>
                          <span className="text-xs text-slate-500">(×{Number(prop.ajusteInfo.coeficiente).toFixed(4)})</span>
                        </div>
                        {prop.ajusteInfo.estimado && prop.ajusteInfo.disclaimer && (
                          <p className="text-xs text-slate-400 mt-1.5 flex items-start gap-1">
                            <Info className="w-3 h-3 shrink-0 mt-0.5" />{prop.ajusteInfo.disclaimer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 ? (
            <div className="card">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-slate-900">Próximos ({upcoming.length})</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {upcoming.map(prop => (
                  <div key={prop.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{prop.address || prop.barrio}</p>
                        {prop.address && <p className="text-sm text-slate-500">{prop.barrio}{prop.provincia ? ` · ${prop.provincia}` : ''}</p>}
                        {prop.tenantName && <p className="text-sm text-slate-400">Inquilino: {prop.tenantName}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`badge ${(prop.daysUntilAdjustment ?? 999) <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          <Clock className="w-3 h-3" /> En {prop.daysUntilAdjustment} días
                        </span>
                        {prop.nextAdjustmentDate && (
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 justify-end">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(prop.nextAdjustmentDate), "d 'de' MMMM yyyy", { locale: es })}
                          </p>
                        )}
                        <p className="text-xs text-slate-400">{prop.indiceAjuste} · c/{prop.ajusteMeses} meses</p>
                      </div>
                    </div>
                    {prop.ajusteInfo && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-slate-500 line-through">$ {Math.round(prop.precio).toLocaleString('es-AR')}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-900">$ {Math.round(prop.ajusteInfo.nuevoPrecio).toLocaleString('es-AR')}</span>
                          <span className="text-xs text-slate-500">(×{Number(prop.ajusteInfo.coeficiente).toFixed(4)})</span>
                        </div>
                        {prop.ajusteInfo.estimado && prop.ajusteInfo.disclaimer && (
                          <p className="text-xs text-slate-400 mt-1.5 flex items-start gap-1">
                            <Info className="w-3 h-3 shrink-0 mt-0.5" />{prop.ajusteInfo.disclaimer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : overdue.length === 0 ? (
            <div className="card p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-semibold text-slate-900 mb-1">Sin recordatorios</h3>
              <p className="text-slate-500 text-sm">No hay ajustes en los próximos {daysAhead} días</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
