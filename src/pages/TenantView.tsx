import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO, startOfMonth, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, Clock, AlertTriangle, MapPin, Home, TrendingUp } from 'lucide-react'
import { getTenantView } from '../services/api'
import type { AjusteRecord, Cobro } from '../types'

/** Returns the rent price that was valid for a given "YYYY-MM" key, based on adjustment history. */
function priceForMonth(key: string, historial: AjusteRecord[], precioActual: number): number {
  if (!historial || historial.length === 0) return precioActual
  // historial is sorted oldest-first; find the latest adj <= this month
  let price = historial[0].precioAntes // price before any adjustments
  for (const adj of historial) {
    if (adj.fecha.substring(0, 7) <= key) {
      price = adj.precioAhora
    }
  }
  return price
}

const formatARS = (n: number) => `$ ${Math.round(n).toLocaleString('es-AR')}`

function mesKey(mes: string) {
  return mes.substring(0, 7)
}
function nowKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function TenantView() {
  const { token } = useParams<{ token: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenant', token],
    queryFn: () => getTenantView(token!),
    enabled: !!token,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">Cargando...</div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Home className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Enlace no válido</h2>
          <p className="text-slate-500 text-sm">El link compartido no existe o expiró.</p>
        </div>
      </div>
    )
  }

  const cobroByMes = new Map(data.cobros.map((c: Cobro) => [mesKey(c.mes), c]))
  const adjKey = data.nextAdjustmentDate ? data.nextAdjustmentDate.substring(0, 7) : null
  // Map of "YYYY-MM" → coeficiente for months where an adjustment was applied
  const adjHistorial = new Map((data.historialAjustes ?? []).map(r => [r.fecha.substring(0, 7), r.coeficiente]))
  const currentKey = nowKey()
  const currentCobro = cobroByMes.get(currentKey)

  // Build all months to show: contract months (if duracionMeses set) or just cobros
  let monthsToShow: { key: string; date: Date; cobro: Cobro | undefined }[] = []
  // Next month key
  const nextMonthDate = addMonths(startOfMonth(new Date()), 1)
  const nextKey = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`

  if (data.duracionMeses && data.mesInicio) {
    const start = startOfMonth(parseISO(data.mesInicio))
    const registrationMonth = data.createdAt ? startOfMonth(parseISO(data.createdAt)) : start
    for (let i = 0; i < data.duracionMeses; i++) {
      const date = addMonths(start, i)
      if (date < registrationMonth) continue
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (key <= nextKey) monthsToShow.push({ key, date, cobro: cobroByMes.get(key) })
    }
    monthsToShow.reverse()
  } else {
    monthsToShow = data.cobros.map((c: Cobro) => {
      const d = parseISO(c.mes)
      return { key: mesKey(c.mes), date: d, cobro: c }
    })
  }

  // Split: future (next month) + current at top, rest as history
  const history = monthsToShow.filter(m => m.key < currentKey)
  const currentAndFuture = monthsToShow.filter(m => m.key >= currentKey)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">
                {data.address}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {data.barrio}{data.provincia && data.provincia !== data.barrio ? ` · ${data.provincia}` : ''}
              </p>
              {data.tenantName && (
                <p className="text-sm text-slate-600 mt-0.5 font-medium">{data.tenantName}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Current / upcoming months */}
        {currentAndFuture.length > 0 && (
          <div className="space-y-3">
            {currentAndFuture.map(({ key, date, cobro }) => {
              const isCurrent = key === currentKey
              return (
                <div
                  key={key}
                  className={`rounded-2xl p-5 ${
                    isCurrent
                      ? cobro?.pagado
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-white border-2 border-brand-200 shadow-sm'
                      : 'bg-white border border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        {isCurrent ? 'Mes actual' : format(date, 'MMMM yyyy', { locale: es })}
                      </p>
                      {isCurrent && (
                        <p className="font-semibold text-slate-700 capitalize mb-1">
                          {format(date, 'MMMM yyyy', { locale: es })}
                        </p>
                      )}
                      <p className="text-3xl font-bold text-slate-900">
                        {cobro
                          ? formatARS(cobro.montoTotal)
                          : formatARS(data.precioActual)}
                      </p>
                      {cobro && cobro.montoTotal !== cobro.montoBase && (
                        <p className="text-xs text-slate-400 mt-0.5">base {formatARS(cobro.montoBase)}</p>
                      )}
                      {cobro?.extras && cobro.extras.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {cobro.extras.map((e, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                              Number(e.monto) >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>
                              {e.descripcion}: {Number(e.monto) >= 0 ? '+' : ''}{formatARS(Number(e.monto))}
                            </span>
                          ))}
                        </div>
                      )}
                      {adjKey === key && (
                        <p className="text-xs text-violet-600 mt-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Mes de ajuste
                          {data.ajusteInfo && (
                            <span className="font-semibold">
                              +{((Number(data.ajusteInfo.coeficiente) - 1) * 100).toFixed(1)}%
                            </span>
                          )}
                        </p>
                      )}
                      {adjHistorial.has(key) && (
                        <p className="text-xs text-violet-600 mt-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Ajuste aplicado
                          <span className="font-semibold">+{((Number(adjHistorial.get(key)!) - 1) * 100).toFixed(1)}%</span>
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {cobro ? (
                        cobro.pagado ? (
                          <span className="badge bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" /> Pagado
                          </span>
                        ) : (
                          <span className="badge bg-amber-100 text-amber-700">
                            <Clock className="w-3.5 h-3.5" /> Pendiente
                          </span>
                        )
                      ) : isCurrent ? (
                        <span className="badge bg-slate-100 text-slate-500">
                          <Clock className="w-3.5 h-3.5" /> Por confirmar
                        </span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-400">Futuro</span>
                      )}
                    </div>
                  </div>
                  {cobro?.pagado && cobro.fechaPago && (
                    <p className="text-xs text-emerald-600 mt-2">
                      Pagado el {format(parseISO(cobro.fechaPago), "d 'de' MMMM yyyy", { locale: es })}
                    </p>
                  )}
                  {cobro?.notes && (
                    <p className="text-xs text-slate-400 mt-2 italic">{cobro.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Historial */}
        {history.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Historial</p>
            <div className="space-y-2">
              {history.map(({ key, date, cobro }) => {
                const isVencido = !cobro || !cobro.pagado
                return (
                <div key={key} className={`rounded-xl border px-4 py-3 ${isVencido ? 'bg-red-50/30 border-red-100' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-700 capitalize text-sm">
                          {format(date, 'MMMM yyyy', { locale: es })}
                        </span>
                        {cobro ? (
                          cobro.pagado ? (
                            <span className="badge bg-emerald-100 text-emerald-700 text-xs">
                              <CheckCircle className="w-3 h-3" /> Pagado
                            </span>
                          ) : (
                            <span className="badge bg-red-100 text-red-700 text-xs">
                              <AlertTriangle className="w-3 h-3" /> Vencido
                            </span>
                          )
                        ) : (
                          <span className="badge bg-red-100 text-red-700 text-xs">
                            <AlertTriangle className="w-3 h-3" /> Vencido
                          </span>
                        )}
                      </div>
                      {cobro?.extras && cobro.extras.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {cobro.extras.map((e, i) => (
                            <span key={i} className={`text-xs px-1.5 py-0.5 rounded-full ${
                              Number(e.monto) >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>
                              {e.descripcion}
                            </span>
                          ))}
                        </div>
                      )}
                      {adjHistorial.has(key) && (
                        <p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Ajuste aplicado
                          <span className="font-semibold">+{((Number(adjHistorial.get(key)!) - 1) * 100).toFixed(1)}%</span>
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {cobro ? (
                        <>
                          <p className="font-bold text-slate-900">{formatARS(cobro.montoTotal)}</p>
                          {cobro.pagado && cobro.fechaPago && (
                            <p className="text-xs text-slate-400">
                              {format(parseISO(cobro.fechaPago), "d MMM", { locale: es })}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="font-bold text-slate-400">{formatARS(priceForMonth(key, data.historialAjustes ?? [], data.precioActual))}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
              })}
            </div>
          </div>
        )}

        {monthsToShow.length === 0 && !currentCobro && (
          <div className="text-center py-12 text-slate-400">
            <p className="font-medium">Sin cobros registrados aún</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pb-4">Propertly</p>
      </div>
    </div>
  )
}
