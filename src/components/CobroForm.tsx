import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Cobro, CobroExtra } from '../types'

interface CobroFormProps {
  initial?: Cobro
  montoBase: number
  defaultMes?: string  // "YYYY-MM-01" pre-fill from contract view
  onSubmit: (data: Partial<Cobro>) => Promise<void>
  onClose: () => void
}

const formatARS = (n: number) => `$ ${Math.round(n).toLocaleString('es-AR')}`

export default function CobroForm({ initial, montoBase, defaultMes: defaultMesProp, onSubmit, onClose }: CobroFormProps) {
  const today = new Date()
  const todayMes = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const fallbackMes = defaultMesProp ? defaultMesProp.substring(0, 7) : todayMes

  const [mes, setMes] = useState(initial?.mes?.substring(0, 7) ?? fallbackMes)
  const [base, setBase] = useState(initial?.montoBase ?? montoBase)
  const [pagado, setPagado] = useState(initial?.pagado ?? true)
  const [fechaPago, setFechaPago] = useState(
    initial?.fechaPago ?? new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [extras, setExtras] = useState<Array<{ id?: string; descripcion: string; monto: string }>>(
    (initial?.extras ?? []).map(e => ({ ...e, monto: String(e.monto) }))
  )
  const [loading, setLoading] = useState(false)

  const parseMonto = (v: string) => parseFloat(v) || 0
  const total = base + extras.reduce((sum, e) => sum + parseMonto(e.monto), 0)

  const addExtra = () => setExtras(ex => [...ex, { descripcion: '', monto: '' }])
  const removeExtra = (i: number) => setExtras(ex => ex.filter((_, idx) => idx !== i))
  const updateExtra = (i: number, field: 'descripcion' | 'monto', value: string) =>
    setExtras(ex => ex.map((e, idx) => idx === i ? { ...e, [field]: value } : e))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        mes: `${mes}-01`,
        montoBase: Number(base),
        montoTotal: total,
        pagado,
        fechaPago: pagado && fechaPago ? fechaPago : undefined,
        notes: notes || undefined,
        extras: extras.filter(e => e.descripcion.trim()).map(e => ({ ...e, monto: parseMonto(e.monto) })),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {initial ? 'Editar cobro' : 'Nuevo cobro'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mes *</label>
              <input
                className="input"
                type="month"
                value={mes}
                onChange={e => setMes(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Monto base *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  className="input pl-7"
                  type="number"
                  min="0"
                  value={base}
                  onChange={e => setBase(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Extras */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Recargos / descuentos</label>
              <button type="button" onClick={addExtra} className="btn-secondary py-1 px-2 text-xs">
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>
            {extras.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Sin extras</p>
            ) : (
              <div className="space-y-2">
                {extras.map((extra, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="input flex-1 text-sm"
                      placeholder="Descripción (ej: expensas)"
                      value={extra.descripcion}
                      onChange={e => updateExtra(i, 'descripcion', e.target.value)}
                    />
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <input
                        className="input pl-6 text-sm"
                        type="number"
                        placeholder="0"
                        value={extra.monto}
                        onChange={e => updateExtra(i, 'monto', e.target.value)}
                        title="Positivo = recargo, negativo = descuento"
                      />
                    </div>
                    <button type="button" onClick={() => removeExtra(i)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Total</span>
            <span className="text-lg font-bold text-slate-900">{formatARS(total)}</span>
          </div>

          {/* Pagado */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pagado}
                onChange={e => setPagado(e.target.checked)}
                className="accent-brand-600 w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-700">Marcar como pagado</span>
            </label>
            {pagado && (
              <div>
                <label className="label">Fecha de pago</label>
                <input
                  className="input"
                  type="date"
                  value={fechaPago}
                  onChange={e => setFechaPago(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="label">Notas</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Observaciones opcionales..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Registrar cobro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
