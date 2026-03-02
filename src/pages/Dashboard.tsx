import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getProperties, getCobrosMesActual, getVencidosAnteriores, bulkCreateCobros, bulkNotificarCobros, updateCobro, deleteCobro, notificarCobro } from '../services/api'
import { Building2, CheckCircle, Clock, AlertTriangle, TrendingUp, Plus, MessageCircle, Trash2 } from 'lucide-react'
import type { AjusteRecord, Cobro, CobroVencidoAnterior, Property } from '../types'

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

interface DashboardProps {
  agencyId: string
  reminderDays: number
}

const formatARS = (n: number) => `$ ${Math.round(n).toLocaleString('es-AR')}`

type CobroStatus = 'pagado' | 'pendiente' | 'vencido' | 'sin-cobro'

function getStatus(prop: Property, cobrosMap: Map<string, Cobro>, dayOfMonth: number): CobroStatus {
  const cobro = cobrosMap.get(prop.id)
  if (!cobro) return 'sin-cobro'
  if (cobro.pagado) return 'pagado'
  if (cobro.vencido || dayOfMonth > 10) return 'vencido'
  return 'pendiente'
}

export default function Dashboard({ agencyId }: DashboardProps) {
  const queryClient = useQueryClient()
  const [bulkCreating, setBulkCreating] = useState(false)
  const [bulkNotifying, setBulkNotifying] = useState(false)
  const [notifyingId, setNotifyingId] = useState<string | null>(null)

  const invalidateCobros = () => {
    queryClient.invalidateQueries({ queryKey: ['cobros-mes-actual'] })
    queryClient.invalidateQueries({ queryKey: ['cobros-vencidos-anteriores', agencyId] })
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cobro> }) => updateCobro(id, data),
    onSuccess: invalidateCobros,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCobro,
    onSuccess: invalidateCobros,
  })

  const markPagado = (cobro: Cobro) =>
    updateMutation.mutate({ id: cobro.id, data: { ...cobro, pagado: true, fechaPago: new Date().toISOString().split('T')[0] } })

  const markVencido = (cobro: Cobro) =>
    updateMutation.mutate({ id: cobro.id, data: { ...cobro, vencido: true } })

  const sendWhatsApp = async (cobro: Cobro) => {
    setNotifyingId(cobro.id)
    try {
      await notificarCobro(cobro.id)
      alert('Mensaje enviado por WhatsApp ✓')
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'Error al enviar WhatsApp')
    } finally {
      setNotifyingId(null)
    }
  }

  const handleBulkCreate = async () => {
    setBulkCreating(true)
    try {
      const res = await bulkCreateCobros(agencyId)
      queryClient.invalidateQueries({ queryKey: ['cobros-mes-actual'] })
      queryClient.invalidateQueries({ queryKey: ['cobros-vencidos-anteriores', agencyId] })
      alert(`✓ ${res.created} cobro${res.created !== 1 ? 's' : ''} creado${res.created !== 1 ? 's' : ''}. ${res.skipped} ya tenían cobro.`)
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'Error al crear cobros')
    } finally {
      setBulkCreating(false)
    }
  }

  const handleBulkNotificar = async () => {
    setBulkNotifying(true)
    try {
      const res = await bulkNotificarCobros(agencyId)
      let msg = `✓ ${res.sent} mensaje${res.sent !== 1 ? 's' : ''} enviado${res.sent !== 1 ? 's' : ''}.`
      if (res.skipped > 0) msg += ` ${res.skipped} omitido${res.skipped !== 1 ? 's' : ''} (pagado o sin teléfono).`
      if (res.errors.length > 0) msg += `\n\nErrores:\n${res.errors.join('\n')}`
      alert(msg)
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'Error al enviar recordatorios')
    } finally {
      setBulkNotifying(false)
    }
  }

  const { data: properties = [] } = useQuery({
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

  const today = new Date()
  const dayOfMonth = today.getDate()
  const cobrosMap = new Map(cobros.map((c: Cobro) => [c.propertyId, c]))
  const vencidosAnterioresIds = new Set(vencidosAnteriores.map(v => v.property.id))

  const pagados = properties.filter(p => getStatus(p, cobrosMap, dayOfMonth) === 'pagado' && !vencidosAnterioresIds.has(p.id))
  const pendientes = properties.filter(p => {
    const s = getStatus(p, cobrosMap, dayOfMonth)
    return s === 'pendiente' || s === 'sin-cobro'
  })
  const vencidos = properties.filter(p => getStatus(p, cobrosMap, dayOfMonth) === 'vencido' || vencidosAnterioresIds.has(p.id))

  const stats = [
    { label: 'Total propiedades', value: properties.length, icon: Building2, color: 'brand' },
    { label: 'Al día', value: pagados.length, icon: CheckCircle, color: 'emerald' },
    { label: 'Pendiente', value: pendientes.length, icon: Clock, color: 'amber' },
    { label: 'Vencido', value: vencidos.length, icon: AlertTriangle, color: 'red' },
  ]

  // Dedup: vencidos first, then any pendientes not already in the list
  const porCobrarMap = new Map<string, Property>()
  for (const p of vencidos) porCobrarMap.set(p.id, p)
  for (const p of pendientes) porCobrarMap.set(p.id, p)
  const porCobrar = [...porCobrarMap.values()]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen de cobros del mes actual</p>
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

      {/* Por cobrar */}
      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-900">Por cobrar este mes</h2>
            {porCobrar.length > 0 && (
              <span className="badge bg-amber-100 text-amber-700">{porCobrar.length}</span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleBulkCreate}
                disabled={bulkCreating}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-50"
                title="Crear cobro del mes actual para todas las propiedades sin cobro"
              >
                <Plus className="w-3.5 h-3.5" />
                {bulkCreating ? 'Creando...' : 'Crear cobros del mes'}
              </button>
              <button
                onClick={handleBulkNotificar}
                disabled={bulkNotifying}
                className="btn-secondary py-1.5 px-3 text-xs text-green-600 border-green-200 hover:bg-green-50 disabled:opacity-50"
                title="Enviar recordatorio por WhatsApp a todos los inquilinos con cobro pendiente"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {bulkNotifying ? 'Enviando...' : 'Notificar todos'}
              </button>
            </div>
          </div>
        </div>

        {porCobrar.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Todo al día</p>
            <p className="text-sm mt-1">Todos los cobros del mes están registrados y pagados</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {porCobrar.map(prop => {
              const cobro = cobrosMap.get(prop.id)
              const status = getStatus(prop, cobrosMap, dayOfMonth)
              const isVencido = status === 'vencido' || vencidosAnterioresIds.has(prop.id)
              const monto = cobro ? Number(cobro.montoTotal) : Number(prop.precioActual ?? prop.precio)
              return (
                <div key={prop.id} className={`flex items-center justify-between gap-3 px-6 py-4 ${isVencido ? 'bg-red-50/40' : ''}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{prop.address || prop.barrio}</span>
                      {prop.address && <span className="text-slate-400 text-sm">· {prop.barrio}</span>}
                    </div>
                    {prop.tenantName && (
                      <p className="text-sm text-slate-500 mt-0.5">{prop.tenantName}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-sm">{formatARS(monto)}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5 flex-wrap">
                      {isVencido ? (
                        <span className="badge bg-red-100 text-red-700 text-xs">
                          <AlertTriangle className="w-3 h-3" /> Vencido
                        </span>
                      ) : !cobro ? (
                        <span className="badge bg-slate-100 text-slate-500 text-xs">
                          Sin cobro
                        </span>
                      ) : (
                        <span className="badge bg-amber-100 text-amber-700 text-xs">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                      {prop.adjustmentDue && (
                        <span className="badge bg-violet-100 text-violet-700 text-xs">
                          <TrendingUp className="w-3 h-3" /> Ajuste
                        </span>
                      )}
                    </div>
                    {cobro && (
                      <div className="flex items-center gap-1 justify-end mt-1.5">
                        {!cobro.pagado && (
                          <>
                            <button onClick={() => markPagado(cobro)} className="btn-secondary py-0.5 px-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" title="Marcar como pagado">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            {!cobro.vencido && (
                              <button onClick={() => markVencido(cobro)} className="btn-secondary py-0.5 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50" title="Marcar como vencido">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {prop.tenantPhone && (
                              <button onClick={() => sendWhatsApp(cobro)} disabled={notifyingId === cobro.id} className="btn-secondary py-0.5 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50 disabled:opacity-50" title="Enviar WhatsApp">
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                        <button onClick={() => confirm('¿Eliminar este cobro?') && deleteMutation.mutate(cobro.id)} className="btn py-0.5 px-2 text-xs text-red-500 hover:bg-red-50 border border-red-200" title="Eliminar cobro">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cobros vencidos de meses anteriores */}
      {vencidosAnteriores.length > 0 && (
        <div className="card">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-slate-900">Cobros anteriores vencidos</h2>
              <span className="badge bg-red-100 text-red-700 ml-auto">{vencidosAnteriores.length}</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {vencidosAnteriores.map((item, i) => {
              const prop = item.property
              const mesKeyStr = item.mes.substring(0, 7)
              const monto = item.cobro
                ? Number(item.cobro.montoTotal)
                : priceForMonth(mesKeyStr, prop.historialAjustes ?? [], Number(prop.precioActual ?? prop.precio))
              return (
                <div key={i} className="flex items-center justify-between gap-3 px-6 py-4 bg-red-50/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{prop.address || prop.barrio}</span>
                      {prop.address && <span className="text-slate-400 text-sm">· {prop.barrio}</span>}
                    </div>
                    {prop.tenantName && (
                      <p className="text-sm text-slate-500 mt-0.5">{prop.tenantName}</p>
                    )}
                    <p className="text-xs text-red-600 mt-0.5 font-medium">{formatMes(item.mes)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-sm">{formatARS(monto)}</p>
                    <span className="badge bg-red-100 text-red-700 text-xs mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      {item.cobro ? 'Sin pagar' : 'Sin registrar'}
                    </span>
                    {item.cobro && (
                      <div className="flex items-center gap-1 justify-end mt-1.5">
                        {!item.cobro.pagado && (
                          <>
                            <button onClick={() => markPagado(item.cobro!)} className="btn-secondary py-0.5 px-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" title="Marcar como pagado">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            {prop.tenantPhone && (
                              <button onClick={() => sendWhatsApp(item.cobro!)} disabled={notifyingId === item.cobro.id} className="btn-secondary py-0.5 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50 disabled:opacity-50" title="Enviar WhatsApp">
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                        <button onClick={() => confirm('¿Eliminar este cobro?') && deleteMutation.mutate(item.cobro!.id)} className="btn py-0.5 px-2 text-xs text-red-500 hover:bg-red-50 border border-red-200" title="Eliminar cobro">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
