import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO, startOfMonth, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Pencil, Trash2, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { getCobros, createCobro, updateCobro, deleteCobro, getVencidosAnteriores } from '../services/api'
import CobroForm from './CobroForm'
import type { AjusteRecord, Cobro, CobroVencidoAnterior, Property } from '../types'

function priceForMonth(key: string, historial: AjusteRecord[], precioActual: number): number {
  if (!historial || historial.length === 0) return precioActual
  let price = historial[0].precioAntes
  for (const adj of historial) {
    if (adj.fecha.substring(0, 7) <= key) price = adj.precioAhora
  }
  return price
}

interface CobrosTabProps {
  property: Property
}

const formatARS = (n: number) => `$ ${Math.round(n).toLocaleString('es-AR')}`

/** Returns all months from mesInicio to mesInicio + duracionMeses - 1, in reverse order (newest first),
 *  with the computed rent price for each month based on historialAjustes. */
function buildContractMonths(property: Property): { date: Date; precio: number }[] {
  if (!property.duracionMeses) return []
  const start = startOfMonth(parseISO(property.mesInicio))

  // Build adjustment map: "YYYY-MM" → new price
  const adjByMonth = new Map<string, number>()
  for (const rec of property.historialAjustes ?? []) {
    adjByMonth.set(rec.fecha.substring(0, 7), rec.precioAhora)
  }

  const months: { date: Date; precio: number }[] = []
  let currentPrice = property.precio
  for (let i = 0; i < property.duracionMeses; i++) {
    const date = addMonths(start, i)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (adjByMonth.has(key)) currentPrice = adjByMonth.get(key)!
    months.push({ date, precio: currentPrice })
  }
  return months.reverse()
}

/** "YYYY-MM-01" → "YYYY-MM" key */
const mesKey = (mes: string) => mes.substring(0, 7)
/** Date → "YYYY-MM" key */
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export default function CobrosTab({ property }: CobrosTabProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Cobro | undefined>()
  const [newMes, setNewMes] = useState<string | undefined>()
  const [newMonto, setNewMonto] = useState<number | undefined>()

  const { data: cobros = [], isLoading } = useQuery({
    queryKey: ['cobros', property.id],
    queryFn: () => getCobros(property.id),
  })

  const { data: vencidosAnteriores = [] } = useQuery<CobroVencidoAnterior[]>({
    queryKey: ['cobros-vencidos-anteriores', property.agencyId],
    queryFn: () => getVencidosAnteriores(property.agencyId),
  })
  // Missing months (no cobro registered) for this property in the lookback window
  const missingMonths = vencidosAnteriores.filter(v => v.property.id === property.id && v.cobro === null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['cobros', property.id] })
    queryClient.invalidateQueries({ queryKey: ['cobros-mes-actual'] })
    queryClient.invalidateQueries({ queryKey: ['cobros-vencidos-anteriores'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: Partial<Cobro>) => createCobro(property.id, data),
    onSuccess: () => { invalidate(); setShowForm(false); setNewMes(undefined); setNewMonto(undefined) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cobro> }) => updateCobro(id, data),
    onSuccess: () => { invalidate(); setEditing(undefined) },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCobro,
    onSuccess: invalidate,
  })

  const markPagado = (cobro: Cobro) => {
    updateMutation.mutate({
      id: cobro.id,
      data: { ...cobro, pagado: true, fechaPago: new Date().toISOString().split('T')[0] },
    })
  }

  const contractMonths = buildContractMonths(property)
  const cobroByMes = new Map(cobros.map(c => [mesKey(c.mes), c]))
  const adjCoefByMonth = new Map((property.historialAjustes ?? []).map(r => [r.fecha.substring(0, 7), r.coeficiente]))
  const todayMonthStart = startOfMonth(new Date())

  // If property has duracionMeses, show all contract months; otherwise show existing cobros
  const hasContract = contractMonths.length > 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {hasContract
            ? `${property.duracionMeses} meses · ${cobros.length} registrado${cobros.length !== 1 ? 's' : ''}`
            : `${cobros.length} cobro${cobros.length !== 1 ? 's' : ''} registrado${cobros.length !== 1 ? 's' : ''}`}
        </p>
        {!hasContract && (
          <button className="btn-primary py-1.5 px-3 text-sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Nuevo cobro
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      ) : hasContract ? (
        /* Contract view: one row per month */
        <div className="space-y-2">
          {contractMonths.map(({ date: month, precio: monthPrecio }) => {
            const key = dateKey(month)
            const cobro = cobroByMes.get(key)
            const mesValue = `${key}-01`
            const isPast = month < todayMonthStart
            const isOverdue = isPast && (!cobro || !cobro.pagado)
            return (
              <div key={key} className={`rounded-xl border p-3 ${cobro ? 'bg-slate-50 border-slate-100' : isOverdue ? 'bg-red-50/30 border-dashed border-red-200' : 'bg-white border-dashed border-slate-200'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-800 capitalize text-sm">
                        {format(month, 'MMMM yyyy', { locale: es })}
                      </span>
                      {adjCoefByMonth.has(key) && (
                        <span className="badge bg-violet-100 text-violet-700 text-xs">
                          <TrendingUp className="w-3 h-3" /> +{((Number(adjCoefByMonth.get(key)!) - 1) * 100).toFixed(1)}%
                        </span>
                      )}
                      {cobro ? (
                        cobro.pagado ? (
                          <span className="badge bg-emerald-100 text-emerald-700 text-xs">
                            <CheckCircle className="w-3 h-3" /> Pagado
                          </span>
                        ) : isPast ? (
                          <span className="badge bg-red-100 text-red-700 text-xs">
                            <AlertTriangle className="w-3 h-3" /> Vencido
                          </span>
                        ) : (
                          <span className="badge bg-amber-100 text-amber-700 text-xs">
                            <Clock className="w-3 h-3" /> Pendiente
                          </span>
                        )
                      ) : isPast ? (
                        <>
                          <span className="badge bg-red-100 text-red-700 text-xs">
                            <AlertTriangle className="w-3 h-3" /> Vencido
                          </span>
                          <span className="text-sm font-semibold text-slate-400">{formatARS(monthPrecio)}</span>
                        </>
                      ) : (
                        <>
                          <span className="badge bg-slate-100 text-slate-400 text-xs">Sin registrar</span>
                          <span className="text-sm font-semibold text-slate-400">{formatARS(monthPrecio)}</span>
                        </>
                      )}
                    </div>

                    {cobro && (
                      <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                        <span className="font-bold text-slate-900">{formatARS(cobro.montoTotal)}</span>
                        {cobro.montoTotal !== cobro.montoBase && (
                          <span className="text-xs text-slate-400">base {formatARS(cobro.montoBase)}</span>
                        )}
                        {cobro.extras.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cobro.extras.map((e, i) => (
                              <span key={i} className={`text-xs px-1.5 py-0.5 rounded-full ${Number(e.monto) >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {e.descripcion}: {Number(e.monto) >= 0 ? '+' : ''}{formatARS(Number(e.monto))}
                              </span>
                            ))}
                          </div>
                        )}
                        {cobro.pagado && cobro.fechaPago && (
                          <span className="text-xs text-slate-400">
                            · pagado {format(parseISO(cobro.fechaPago), "d MMM yyyy", { locale: es })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {cobro ? (
                      <>
                        {!cobro.pagado && (
                          <button
                            onClick={() => markPagado(cobro)}
                            className="btn-secondary py-1 px-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            title="Marcar como pagado"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => setEditing(cobro)} className="btn-secondary py-1 px-2 text-xs">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => confirm('¿Eliminar este cobro?') && deleteMutation.mutate(cobro.id)}
                          className="btn text-xs py-1 px-2 text-red-500 hover:bg-red-50 border border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setNewMes(mesValue); setNewMonto(monthPrecio); setShowForm(true) }}
                        className="btn-secondary py-1 px-2 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Registrar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : cobros.length === 0 && missingMonths.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <p className="font-medium mb-1">Sin cobros registrados</p>
          <p className="text-sm">Registrá el primer cobro con el botón de arriba</p>
        </div>
      ) : (
        /* Free-form list when no duracionMeses */
        <div className="space-y-2">
          {missingMonths.map(v => {
            const mesIso = v.mes // "2026-02-01"
            const mesDate = parseISO(mesIso)
            const key = mesIso.substring(0, 7)
            const precio = priceForMonth(key, property.historialAjustes ?? [], Number(property.precioActual ?? property.precio))
            return (
              <div key={`missing-${key}`} className="bg-red-50/30 rounded-xl border border-dashed border-red-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 capitalize">
                        {format(mesDate, 'MMMM yyyy', { locale: es })}
                      </span>
                      <span className="badge bg-red-100 text-red-700 text-xs">
                        <AlertTriangle className="w-3 h-3" /> Vencido
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-400">{formatARS(precio)}</span>
                  </div>
                  <button
                    onClick={() => { setNewMes(mesIso); setNewMonto(precio); setShowForm(true) }}
                    className="btn-secondary py-1 px-2 text-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar
                  </button>
                </div>
              </div>
            )
          })}
          {cobros.map(cobro => {
            const isPastCobro = parseISO(cobro.mes) < todayMonthStart
            return (
            <div key={cobro.id} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 capitalize">
                      {format(parseISO(cobro.mes), 'MMMM yyyy', { locale: es })}
                    </span>
                    {cobro.pagado ? (
                      <span className="badge bg-emerald-100 text-emerald-700 text-xs">
                        <CheckCircle className="w-3 h-3" /> Pagado
                      </span>
                    ) : isPastCobro ? (
                      <span className="badge bg-red-100 text-red-700 text-xs">
                        <AlertTriangle className="w-3 h-3" /> Vencido
                      </span>
                    ) : (
                      <span className="badge bg-amber-100 text-amber-700 text-xs">
                        <Clock className="w-3 h-3" /> Pendiente
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-lg font-bold text-slate-900">{formatARS(cobro.montoTotal)}</span>
                    {cobro.montoTotal !== cobro.montoBase && (
                      <span className="text-xs text-slate-400">base {formatARS(cobro.montoBase)}</span>
                    )}
                  </div>
                  {cobro.extras.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {cobro.extras.map((e, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${Number(e.monto) >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {e.descripcion}: {Number(e.monto) >= 0 ? '+' : ''}{formatARS(Number(e.monto))}
                        </span>
                      ))}
                    </div>
                  )}
                  {cobro.pagado && cobro.fechaPago && (
                    <p className="text-xs text-slate-400 mt-1">
                      Pagado el {format(parseISO(cobro.fechaPago), "d 'de' MMM yyyy", { locale: es })}
                    </p>
                  )}
                  {cobro.notes && <p className="text-xs text-slate-400 mt-1 italic">{cobro.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {!cobro.pagado && (
                    <button
                      onClick={() => markPagado(cobro)}
                      className="btn-secondary py-1 px-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      title="Marcar como pagado"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => setEditing(cobro)} className="btn-secondary py-1 px-2 text-xs">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => confirm('¿Eliminar este cobro?') && deleteMutation.mutate(cobro.id)}
                    className="btn text-xs py-1 px-2 text-red-500 hover:bg-red-50 border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {(showForm || editing) && (
        <CobroForm
          initial={editing}
          montoBase={newMonto ?? (property.precioActual ?? property.precio)}
          defaultMes={newMes}
          onClose={() => { setShowForm(false); setEditing(undefined); setNewMes(undefined); setNewMonto(undefined) }}
          onSubmit={async (data) => {
            if (editing) await updateMutation.mutateAsync({ id: editing.id, data })
            else await createMutation.mutateAsync(data)
          }}
        />
      )}
    </div>
  )
}
