import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import type { Property, PropertyFormData } from '../types'

interface PropertyFormProps {
  initial?: Property
  onSubmit: (data: PropertyFormData) => Promise<void>
  onClose: () => void
}

const PROVINCIAS = [
  'CABA','Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes',
  'Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones',
  'Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe',
  'Santiago del Estero','Tierra del Fuego','Tucumán',
]

const BARRIOS_CABA = [
  'Almagro','Balvanera','Barracas','Belgrano','Boedo','Caballito','Chacarita',
  'Coghlan','Colegiales','Constitución','Flores','Floresta','La Boca','La Paternal',
  'Liniers','Mataderos','Monte Castro','Montserrat','Nueva Pompeya','Núñez',
  'Palermo','Parque Avellaneda','Parque Chacabuco','Parque Chas','Parque Patricios',
  'Puerto Madero','Recoleta','Retiro','Saavedra','San Cristóbal','San Nicolás',
  'San Telmo','Tribunales','Versalles','Villa Crespo','Villa del Parque',
  'Villa Devoto','Villa Gral. Mitre','Villa Lugano','Villa Luro','Villa Ortúzar',
  'Villa Pueyrredón','Villa Real','Villa Riachuelo','Villa Santa Rita','Villa Soldati',
  'Villa Urquiza','Otro',
]

export default function PropertyForm({ initial, onSubmit, onClose }: PropertyFormProps) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<PropertyFormData>({
    defaultValues: initial
      ? {
          address: initial.address,
          provincia: initial.provincia ?? 'CABA',
          barrio: initial.barrio,
          moneda: initial.moneda,
          precio: initial.precio,
          mesInicio: initial.mesInicio?.slice(0, 7),
          ajusteMeses: initial.ajusteMeses,
          indiceAjuste: initial.indiceAjuste,
          tenantName: initial.tenantName,
          notes: initial.notes,
        }
      : { moneda: 'ARS', provincia: 'CABA', ajusteMeses: 3, indiceAjuste: 'ICL' },
  })

  const moneda = watch('moneda')
  const provincia = watch('provincia')
  const isCABA = provincia === 'CABA'

  const handleFormSubmit = async (data: PropertyFormData) => {
    const mesInicio = data.mesInicio.length === 7 ? `${data.mesInicio}-01` : data.mesInicio
    await onSubmit({ ...data, mesInicio, precio: Number(data.precio), ajusteMeses: Number(data.ajusteMeses) })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {initial ? 'Editar propiedad' : 'Nueva propiedad'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-2">
              <label className="label">Dirección <span className="text-red-500">*</span></label>
              <input
                className="input"
                placeholder="Ej: Av. Corrientes 1234, Piso 3A"
                {...register('address', { required: 'Requerido' })}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="label">Provincia <span className="text-red-500">*</span></label>
              <select className="input" {...register('provincia', { required: 'Requerido' })}>
                <option value="">Seleccioná una provincia</option>
                {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.provincia && <p className="text-red-500 text-xs mt-1">{errors.provincia.message}</p>}
            </div>

            <div>
              <label className="label">Barrio <span className="text-red-500">*</span></label>
              {isCABA ? (
                <select className="input" {...register('barrio', { required: 'Requerido' })}>
                  <option value="">Seleccioná un barrio</option>
                  {BARRIOS_CABA.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : (
                <input
                  className="input"
                  placeholder="Ej: Centro, Palermo, etc."
                  {...register('barrio', { required: 'Requerido' })}
                />
              )}
              {errors.barrio && <p className="text-red-500 text-xs mt-1">{errors.barrio.message}</p>}
            </div>

            <div>
              <label className="label">Inquilino</label>
              <input className="input" placeholder="Nombre del inquilino" {...register('tenantName')} />
            </div>

            <div className="flex flex-col justify-center">
              <label className="label">Moneda <span className="text-red-500">*</span></label>
              <div className="flex gap-4">
                {['ARS', 'USD'].map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={m} {...register('moneda', { required: true })} className="accent-brand-600" />
                    <span className="text-sm font-medium">{m === 'ARS' ? '🇦🇷 Pesos' : '🇺🇸 Dólares'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Precio <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  {moneda === 'USD' ? 'USD' : '$'}
                </span>
                <input
                  className="input pl-10"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  {...register('precio', { required: 'Requerido', min: { value: 0, message: 'Debe ser positivo' } })}
                />
              </div>
              {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio.message}</p>}
            </div>

            <div>
              <label className="label">Mes de inicio <span className="text-red-500">*</span></label>
              <input
                className="input"
                type="month"
                {...register('mesInicio', { required: 'Requerido' })}
              />
              {errors.mesInicio && <p className="text-red-500 text-xs mt-1">{errors.mesInicio.message}</p>}
            </div>

            {moneda === 'ARS' && (
              <>
                <div>
                  <label className="label">Ajusta cada (meses) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      className="input pr-16"
                      type="number"
                      min="1"
                      max="60"
                      placeholder="3"
                      {...register('ajusteMeses', {
                        required: 'Requerido',
                        min: { value: 1, message: 'Mínimo 1 mes' },
                      })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">meses</span>
                  </div>
                  {errors.ajusteMeses && <p className="text-red-500 text-xs mt-1">{errors.ajusteMeses.message}</p>}
                </div>

                <div className="flex flex-col justify-center">
                  <label className="label">Índice de ajuste <span className="text-red-500">*</span></label>
                  <div className="flex gap-4">
                    {['ICL', 'IPC'].map(i => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value={i} {...register('indiceAjuste', { required: true })} className="accent-brand-600" />
                        <span className="text-sm font-medium">{i}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="label">Notas</label>
              <textarea className="input resize-none" rows={2} placeholder="Observaciones opcionales..." {...register('notes')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : initial ? 'Guardar cambios' : 'Agregar propiedad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
