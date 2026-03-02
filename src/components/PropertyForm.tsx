import { useForm } from 'react-hook-form'
import { X, Info } from 'lucide-react'
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

type FormValues = PropertyFormData & {
  precioActualInput?: number
  proximoMesAjusteInput?: string
}

export default function PropertyForm({ initial, onSubmit, onClose }: PropertyFormProps) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: initial
      ? {
          address: initial.address,
          provincia: initial.provincia ?? 'CABA',
          barrio: initial.barrio,
          moneda: initial.moneda,
          precio: initial.precio,
          mesInicio: initial.mesInicio?.slice(0, 7),
          ajusteMeses: initial.ajusteMeses,
          duracionMeses: initial.duracionMeses,
          indiceAjuste: initial.indiceAjuste,
          tenantName: initial.tenantName,
          tenantPhone: initial.tenantPhone,
          tenantEmail: initial.tenantEmail,
          tenantFactura: initial.tenantFactura,
          tenantPersonaJuridica: initial.tenantPersonaJuridica,
          tenantDocumento: initial.tenantDocumento,
          unidadFuncional: initial.unidadFuncional,
          notes: initial.notes,
        }
      : { moneda: 'ARS', provincia: 'CABA', ajusteMeses: 3, indiceAjuste: 'ICL' },
  })

  // Disabled radio/inputs may return undefined from RHF; fall back to the initial value.
  const moneda = watch('moneda') ?? initial?.moneda
  const provincia = watch('provincia')
  const mesInicio = watch('mesInicio')
  const personaJuridicaRaw = watch('tenantPersonaJuridica')
  const personaJuridica = String(personaJuridicaRaw)
  const isCABA = provincia === 'CABA'

  const currentMonth = new Date().toISOString().slice(0, 7)
  const contractAlreadyStarted = !initial && mesInicio && mesInicio < currentMonth

  const handleFormSubmit = async (data: FormValues) => {
    // Disabled inputs may come back as undefined; fall back to the locked initial values.
    const mesInicio = data.mesInicio ?? initial?.mesInicio?.slice(0, 7) ?? ''
    const mesInicioFull = mesInicio.length === 7 ? `${mesInicio}-01` : mesInicio
    await onSubmit({
      ...data,
      moneda: (data.moneda ?? initial?.moneda) as 'ARS' | 'USD',
      mesInicio: mesInicioFull,
      precio: Number(data.precio ?? initial?.precio),
      ajusteMeses: Number(data.ajusteMeses),
      duracionMeses: data.duracionMeses ? Number(data.duracionMeses) : undefined,
      precioActualInput: data.precioActualInput ? Number(data.precioActualInput) : undefined,
    })
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
                placeholder="Ej: Av. Corrientes 1234"
                {...register('address', { required: 'Requerido' })}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="label">Unidad funcional</label>
              <input
                className="input"
                placeholder="Ej: Piso 3 Depto A, UF 42, Local 5"
                {...register('unidadFuncional')}
              />
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

            {/* Tenant info */}
            <div>
              <label className="label">Inquilino</label>
              <input className="input" placeholder="Nombre del inquilino" {...register('tenantName')} />
            </div>

            <div>
              <label className="label">Teléfono</label>
              <input className="input" placeholder="Ej: +54 11 1234-5678" {...register('tenantPhone')} />
            </div>

            <div className="col-span-2">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="inquilino@ejemplo.com" {...register('tenantEmail')} />
            </div>

            <div className="col-span-2">
              <label className="label mb-2">Tipo de persona</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="false" {...register('tenantPersonaJuridica')} className="accent-brand-600" />
                  <span className="text-sm font-medium">Persona física</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="true" {...register('tenantPersonaJuridica')} className="accent-brand-600" />
                  <span className="text-sm font-medium">Persona jurídica</span>
                </label>
              </div>
            </div>

            <div>
              <label className="label">{personaJuridica === 'true' ? 'CUIT' : 'DNI'}</label>
              <input
                className="input"
                placeholder={personaJuridica === 'true' ? 'Ej: 30-12345678-9' : 'Ej: 12345678'}
                {...register('tenantDocumento')}
              />
            </div>

            <div className="flex items-center gap-3 pt-5">
              <input id="factura" type="checkbox" className="w-4 h-4 accent-brand-600" {...register('tenantFactura')} />
              <label htmlFor="factura" className="text-sm font-medium text-slate-700 cursor-pointer">Emite factura</label>
            </div>

            {/* Contract settings */}
            <div className="flex flex-col justify-center">
              <label className="label">Moneda <span className="text-red-500">*</span></label>
              <div className={`flex gap-4 ${initial ? 'opacity-60 pointer-events-none' : ''}`}>
                {['ARS', 'USD'].map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={m} {...register('moneda', { required: !initial, disabled: !!initial })} className="accent-brand-600" disabled={!!initial} />
                    <span className="text-sm font-medium">{m === 'ARS' ? '🇦🇷 Pesos' : '🇺🇸 Dólares'}</span>
                  </label>
                ))}
              </div>
              {initial && <p className="text-xs text-slate-400 mt-1">No se puede modificar una vez creada</p>}
            </div>

            <div>
              <label className="label">Precio inicial <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  {moneda === 'USD' ? 'USD' : '$'}
                </span>
                <input
                  className={`input pl-10 ${initial ? 'opacity-60 cursor-not-allowed' : ''}`}
                  type="number" min="0" step="0.01" placeholder="0"
                  disabled={!!initial}
                  {...register('precio', { required: !initial && 'Requerido', min: { value: 0, message: 'Debe ser positivo' } })}
                />
              </div>
              {initial && <p className="text-xs text-slate-400 mt-1">No se puede modificar una vez creada</p>}
              {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio.message}</p>}
            </div>

            <div>
              <label className="label">Mes de inicio <span className="text-red-500">*</span></label>
              <input
                className={`input ${initial ? 'opacity-60 cursor-not-allowed' : ''}`}
                type="month"
                max={currentMonth}
                disabled={!!initial}
                {...register('mesInicio', {
                  required: !initial && 'Requerido',
                  validate: v => !v || v <= currentMonth || 'El mes de inicio no puede ser futuro',
                })}
              />
              {initial && <p className="text-xs text-slate-400 mt-1">No se puede modificar una vez creada</p>}
              {errors.mesInicio && <p className="text-red-500 text-xs mt-1">{errors.mesInicio.message}</p>}
            </div>

            <div>
              <label className="label">Duración del contrato</label>
              <div className="relative">
                <input
                  className="input pr-16" type="number"
                  min={initial?.duracionMeses ?? 1} max="120" placeholder="Ej: 24"
                  {...register('duracionMeses', { min: { value: initial?.duracionMeses ?? 1, message: initial?.duracionMeses ? `Mínimo ${initial.duracionMeses} meses` : 'Mínimo 1 mes' } })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">meses</span>
              </div>
              {errors.duracionMeses && <p className="text-red-500 text-xs mt-1">{errors.duracionMeses.message}</p>}
            </div>

            {moneda === 'ARS' && (
              <>
                <div>
                  <label className="label">Ajusta cada (meses) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      className="input pr-16" type="number" min="1" max="60" placeholder="3"
                      {...register('ajusteMeses', { required: 'Requerido', min: { value: 1, message: 'Mínimo 1 mes' } })}
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

            {/* Contract already started */}
            {contractAlreadyStarted && moneda === 'ARS' && (
              <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Este contrato ya inició. El historial de ajustes se calcula automáticamente desde el mes de inicio.
                  </p>
                </div>
                <div>
                  <label className="label">Próximo mes de ajuste</label>
                  <input
                    className="input"
                    type="month"
                    {...register('proximoMesAjusteInput')}
                  />
                  <p className="text-xs text-slate-500 mt-1">Indicá cuándo corresponde el próximo ajuste para calibrar el ciclo correctamente.</p>
                </div>
              </div>
            )}

            {/* Price correction for existing ARS properties */}
            {initial && moneda === 'ARS' && (
              <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">Corregir precio actual</p>
                <p className="text-xs text-slate-500">Si el precio calculado no coincide con el real, ingresalo acá. Los ajustes futuros se calcularán desde este valor.</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                  <input
                    className="input pl-7"
                    type="number" min="0" step="0.01" placeholder="Dejar vacío para no modificar"
                    {...register('precioActualInput')}
                  />
                </div>
              </div>
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
