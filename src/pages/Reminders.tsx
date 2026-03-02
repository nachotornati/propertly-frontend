import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProperties, getCobrosMesActual, getVencidosAnteriores, createCobro, updateCobro } from '../services/api'
import { CheckCircle, Clock, AlertTriangle, TrendingUp, ArrowRight, Info, Plus, Pencil } from 'lucide-react'
import type { AjusteRecord, Cobro, CobroVencidoAnterior, Property } from '../types'
import CobroForm from '../components/CobroForm'

interface RemindersProps {
  agencyId: string
  reminderDays: number
}

const formatARS = (n: number) => `$ ${Math.round(n).toLocaleString('es-AR')}`

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
function formatMes(isoDate: string) {
  const [year, month] = isoDate.split('-')
  return `${MESES[parseInt(month) - 1]} ${year}`
}

function priceForMonth(key: string, historial: AjusteRecord[], precioActual: number): number {
  if (!historial || historial.length === 0) return precioActual
  let price = historial[0].precioAntes
  for (const adj of historial) {
    if (adj.fecha.substring(0, 7) <= key) price = adj.precioAhora
  }
  return price
}

type FormTarget = {
  property: Property
  mes: string       // "YYYY-MM-01"
  montoBase: number
  cobro: Cobro | null  // null = create, non-null = edit
}

export default function Reminders({ agencyId }: RemindersProps) {
  const queryClient = useQueryClient()
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', agencyId],
    queryFn: () => getProperties(agencyId),
    enabled: !!agencyId,
  })

  const { data: cobros = [] } = useQuery({
    queryKey: ['cobros-mes-actual'],
    queryFn: () => getCobrosMesActual(agencyId),
    enabled: !!agencyId,
  })

  const { data: vencidosAnteriores = [] } = useQuery<CobroVencidoAnterior[]>({
    queryKey: ['cobros-vencidos-anteriores', agencyId],
    queryFn: () => getVencidosAnteriores(agencyId),
    enabled: !!agencyId,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['cobros-vencidos-anteriores'] })
    queryClient.invalidateQueries({ queryKey: ['cobros-mes-actual'] })
    queryClient.invalidateQueries({ queryKey: ['cobros'] })
    queryClient.invalidateQueries({ queryKey: ['properties', agencyId] })
  }

  const markPagadoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cobro> }) => updateCobro(id, data),
    onSuccess: invalidate,
  })

  const createMutation = useMutation({
    mutationFn: ({ propertyId, data }: { propertyId: string; data: Partial<Cobro> }) => createCobro(propertyId, data),
    onSuccess: () => { invalidate(); setFormTarget(null) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cobro> }) => updateCobro(id, data),
    onSuccess: () => { invalidate(); setFormTarget(null) },
  })

  const handleMarkPagado = (cobro: Cobro) => {
    markPagadoMutation.mutate({
      id: cobro.id,
      data: { ...cobro, pagado: true, fechaPago: new Date().toISOString().split('T')[0] },
    })
  }

  const handleQuickPay = (propertyId: string, mes: string, monto: number) => {
    createMutation.mutate({
      propertyId,
      data: {
        mes,
        montoBase: monto,
        montoTotal: monto,
        pagado: true,
        fechaPago: new Date().toISOString().split('T')[0],
        extras: [],
      },
    })
  }

  const today = new Date()
  const dayOfMonth = today.getDate()
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const currentMesIso = `${currentMonthKey}-01`

  const cobrosMap = new Map(cobros.map((c: Cobro) => [c.propertyId, c]))
  const vencidosAnterioresIds = new Set(vencidosAnteriores.map(v => v.property.id))

  // Current month: not paid (regardless of past overdue status)
  const currentUnpaid = properties.filter(p => {
    const cobro = cobrosMap.get(p.id)
    return !cobro?.pagado
  })
  const currentVencidos = currentUnpaid.filter(() => dayOfMonth > 10)
  const currentPendientes = currentUnpaid.filter(() => dayOfMonth <= 10)

  const pagados = properties.filter(p => cobrosMap.get(p.id)?.pagado && !vencidosAnterioresIds.has(p.id))
  const allGood = vencidosAnteriores.length === 0 && currentUnpaid.length === 0 && properties.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cobros</h1>
        <p className="text-slate-500 mt-1">Estado de cobros del mes actual y anteriores</p>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-slate-400">Cargando...</div>
      ) : (
        <>
          {/* Vencidos de meses anteriores */}
          {vencidosAnteriores.length > 0 && (
            <div className="card border-red-200 overflow-hidden">
              <div className="p-5 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-semibold text-red-900">Meses anteriores vencidos</h2>
                <span className="badge bg-red-100 text-red-700 ml-auto">{vencidosAnteriores.length}</span>
              </div>
              <div className="divide-y divide-red-50">
                {vencidosAnteriores.map((item, i) => {
                  const prop = item.property
                  const mesKeyStr = item.mes.substring(0, 7)
                  const monto = item.cobro
                    ? Number(item.cobro.montoTotal)
                    : priceForMonth(mesKeyStr, prop.historialAjustes ?? [], Number(prop.precioActual ?? prop.precio))
                  return (
                    <div key={i} className="px-5 py-4 bg-red-50/30 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{prop.address || prop.barrio}</p>
                        {prop.address && <p className="text-sm text-slate-500 truncate">{prop.barrio}{prop.provincia ? ` · ${prop.provincia}` : ''}</p>}
                        {prop.tenantName && <p className="text-sm text-slate-400">{prop.tenantName}</p>}
                        <p className="text-xs text-red-600 font-medium mt-0.5">{formatMes(item.mes)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900">{formatARS(monto)}</p>
                        <span className="badge bg-red-100 text-red-700 text-xs mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          {item.cobro ? 'Sin pagar' : 'Sin registrar'}
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => item.cobro ? handleMarkPagado(item.cobro) : handleQuickPay(prop.id, item.mes, monto)}
                          disabled={markPagadoMutation.isPending || createMutation.isPending}
                          className="btn-secondary py-1 px-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          title="Marcar como pagado"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFormTarget({ property: prop, mes: item.mes, montoBase: monto, cobro: item.cobro })}
                          className="btn-secondary py-1 px-2 text-xs"
                          title={item.cobro ? 'Editar cobro' : 'Registrar cobro'}
                        >
                          {item.cobro ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Vencidos este mes (after day 10) */}
          {currentVencidos.length > 0 && (
            <div className="card border-red-200 overflow-hidden">
              <div className="p-5 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-semibold text-red-900">Vencidos este mes</h2>
                <span className="badge bg-red-100 text-red-700 ml-auto">{currentVencidos.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {currentVencidos.map(prop => {
                  const cobro = cobrosMap.get(prop.id)
                  const monto = cobro ? Number(cobro.montoTotal) : Number(prop.precioActual ?? prop.precio)
                  return (
                    <CurrentMonthRow
                      key={prop.id}
                      prop={prop}
                      cobro={cobro}
                      monto={monto}
                      onOpenForm={() => setFormTarget({ property: prop, mes: currentMesIso, montoBase: monto, cobro: cobro ?? null })}
                      onQuickPay={() => cobro ? handleMarkPagado(cobro) : handleQuickPay(prop.id, currentMesIso, monto)}
                      isPending={markPagadoMutation.isPending || createMutation.isPending}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Pendientes este mes (days 1–10) */}
          {currentPendientes.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-slate-900">Pendientes este mes</h2>
                <span className="badge bg-amber-100 text-amber-700 ml-auto">{currentPendientes.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {currentPendientes.map(prop => {
                  const cobro = cobrosMap.get(prop.id)
                  const monto = cobro ? Number(cobro.montoTotal) : Number(prop.precioActual ?? prop.precio)
                  return (
                    <CurrentMonthRow
                      key={prop.id}
                      prop={prop}
                      cobro={cobro}
                      monto={monto}
                      onOpenForm={() => setFormTarget({ property: prop, mes: currentMesIso, montoBase: monto, cobro: cobro ?? null })}
                      onQuickPay={() => cobro ? handleMarkPagado(cobro) : handleQuickPay(prop.id, currentMesIso, monto)}
                      isPending={markPagadoMutation.isPending || createMutation.isPending}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* All good */}
          {allGood && (
            <div className="card p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
              <h3 className="font-semibold text-slate-900 mb-1">Todo al día</h3>
              <p className="text-slate-500 text-sm">
                {pagados.length > 0
                  ? `${pagados.length} cobro${pagados.length !== 1 ? 's' : ''} registrado${pagados.length !== 1 ? 's' : ''} y pagado${pagados.length !== 1 ? 's' : ''} este mes`
                  : 'No hay propiedades registradas'}
              </p>
            </div>
          )}
        </>
      )}

      {/* CobroForm modal */}
      {formTarget && (
        <CobroForm
          initial={formTarget.cobro ?? undefined}
          montoBase={formTarget.montoBase}
          defaultMes={formTarget.mes}
          onClose={() => setFormTarget(null)}
          onSubmit={async (data) => {
            if (formTarget.cobro) {
              await updateMutation.mutateAsync({ id: formTarget.cobro.id, data })
            } else {
              await createMutation.mutateAsync({ propertyId: formTarget.property.id, data })
            }
          }}
        />
      )}
    </div>
  )
}

interface CurrentMonthRowProps {
  prop: Property
  cobro: Cobro | undefined
  monto: number
  onOpenForm: () => void
  onQuickPay: () => void
  isPending: boolean
}

function CurrentMonthRow({ prop, cobro, monto, onOpenForm, onQuickPay, isPending }: CurrentMonthRowProps) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{prop.address || prop.barrio}</p>
          {prop.address && <p className="text-sm text-slate-500 truncate">{prop.barrio}{prop.provincia ? ` · ${prop.provincia}` : ''}</p>}
          {prop.tenantName && <p className="text-sm text-slate-400 mt-0.5">{prop.tenantName}</p>}

          {/* Adjustment info if due */}
          {prop.adjustmentDue && prop.ajusteInfo && (
            <div className="mt-2 bg-violet-50 border border-violet-200 rounded-lg p-2.5 inline-flex flex-wrap items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span className="text-xs font-medium text-violet-700">Ajuste {prop.indiceAjuste}</span>
              <span className="text-sm text-slate-500 line-through">{formatARS(Number(prop.precioActual ?? prop.precio))}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900 text-sm">{formatARS(Number(prop.ajusteInfo.nuevoPrecio))}</span>
              {prop.ajusteInfo.estimado && prop.ajusteInfo.disclaimer && (
                <span className="text-xs text-slate-400 flex items-center gap-1 w-full mt-0.5">
                  <Info className="w-3 h-3 shrink-0" />{prop.ajusteInfo.disclaimer}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="font-bold text-slate-900">{formatARS(monto)}</p>
            {cobro ? (
              <p className="text-xs text-slate-400 mt-0.5">registrado · sin pagar</p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">sin registrar</p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onQuickPay}
              disabled={isPending}
              className="btn-secondary py-1 px-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              title="Marcar como pagado"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenForm}
              className="btn-secondary py-1 px-2 text-xs"
              title={cobro ? 'Editar cobro' : 'Registrar cobro'}
            >
              {cobro ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
