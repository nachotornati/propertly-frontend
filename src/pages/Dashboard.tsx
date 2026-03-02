import { useQuery } from '@tanstack/react-query'
import { getProperties, getReminders } from '../services/api'
import { Building2, AlertTriangle, Clock, TrendingUp, DollarSign } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface DashboardProps {
  agencyId: string
  reminderDays: number
}

export default function Dashboard({ agencyId, reminderDays }: DashboardProps) {
  const { data: properties = [] } = useQuery({
    queryKey: ['properties', agencyId],
    queryFn: () => getProperties(agencyId),
    enabled: !!agencyId,
  })

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders', agencyId, reminderDays],
    queryFn: () => getReminders(agencyId, reminderDays),
    enabled: !!agencyId,
  })

  const arsProps = properties.filter(p => p.moneda === 'ARS')
  const usdProps = properties.filter(p => p.moneda === 'USD')
  const overdueProps = arsProps.filter(p => p.adjustmentDue)
  const soonProps = reminders.filter(p => !p.adjustmentDue)

  const stats = [
    { label: 'Total propiedades', value: properties.length, icon: Building2, color: 'brand' },
    { label: 'En pesos', value: arsProps.length, icon: TrendingUp, color: 'violet' },
    { label: 'En dólares', value: usdProps.length, icon: DollarSign, color: 'emerald' },
    { label: 'Ajuste vencido', value: overdueProps.length, icon: AlertTriangle, color: 'red' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen de tu cartera de alquileres</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming adjustments */}
      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-900">Próximos ajustes</h2>
            <span className="badge bg-amber-100 text-amber-700 ml-auto">
              {reminders.length} en los próximos {reminderDays} días
            </span>
          </div>
        </div>

        {reminders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Sin ajustes próximos</p>
            <p className="text-sm mt-1">No hay propiedades que ajusten en los próximos {reminderDays} días</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reminders.map(prop => (
              <div key={prop.id} className={`flex items-center justify-between px-6 py-4 ${prop.adjustmentDue ? 'bg-red-50/50' : ''}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{prop.barrio}</span>
                    {prop.address && <span className="text-slate-400 text-sm">· {prop.address}</span>}
                  </div>
                  {prop.tenantName && (
                    <p className="text-sm text-slate-500 mt-0.5">{prop.tenantName}</p>
                  )}
                </div>
                <div className="text-right">
                  {prop.adjustmentDue ? (
                    <span className="badge bg-red-100 text-red-700">
                      <AlertTriangle className="w-3 h-3" /> Vencido
                    </span>
                  ) : (
                    <div>
                      <span className="badge bg-amber-100 text-amber-700">
                        En {prop.daysUntilAdjustment} días
                      </span>
                      {prop.nextAdjustmentDate && (
                        <p className="text-xs text-slate-400 mt-1">
                          {format(parseISO(prop.nextAdjustmentDate), "d MMM", { locale: es })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overdue */}
      {overdueProps.length > 0 && (
        <div className="card border-red-200">
          <div className="p-6 border-b border-red-100 bg-red-50/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-red-900">Ajustes vencidos ({overdueProps.length})</h2>
            </div>
          </div>
          <div className="divide-y divide-red-50">
            {overdueProps.map(prop => (
              <div key={prop.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <span className="font-medium text-slate-900">{prop.barrio}</span>
                  {prop.address && <span className="text-slate-400 text-sm"> · {prop.address}</span>}
                </div>
                <div className="text-right text-sm">
                  <p className="text-red-600 font-medium">Ajuste {prop.indiceAjuste}</p>
                  <p className="text-slate-400">{prop.ajusteMeses} meses</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
