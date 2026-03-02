import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAgencies, createAgency, updateAgency, deleteAgency } from '../services/api'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import type { Agency } from '../types'

interface SettingsProps {
  agencyId: string
  setAgencyId: (id: string) => void
  reminderDays: number
  setReminderDays: (days: number) => void
}

interface AgencyFormData {
  name: string
  email: string
  diasAntesRecordatorio: number
}

export default function Settings({ agencyId, setAgencyId, reminderDays, setReminderDays }: SettingsProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingAgency, setEditingAgency] = useState<Agency | undefined>()

  const { data: agencies = [] } = useQuery({ queryKey: ['agencies'], queryFn: getAgencies })

  const createMutation = useMutation({
    mutationFn: createAgency,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] })
      setAgencyId(data.id)
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agency> }) => updateAgency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] })
      setEditingAgency(undefined)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAgency,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] })
      if (agencyId === id) setAgencyId('')
    },
  })

  const AgencyForm = ({ agency, onClose }: { agency?: Agency; onClose: () => void }) => {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm<AgencyFormData>({
      defaultValues: agency
        ? { name: agency.name, email: agency.email, diasAntesRecordatorio: agency.diasAntesRecordatorio }
        : { diasAntesRecordatorio: 30 },
    })

    const onSubmit = async (data: AgencyFormData) => {
      if (agency) await updateMutation.mutateAsync({ id: agency.id, data })
      else await createMutation.mutateAsync(data)
    }

    return (
      <div className="card p-5 border-brand-200 bg-brand-50/30">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" placeholder="Inmobiliaria XYZ" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="label">Email de contacto</label>
              <input className="input" type="email" placeholder="info@inmobiliaria.com" {...register('email')} />
            </div>
            <div>
              <label className="label">Avisar con X días de anticipación</label>
              <input className="input" type="number" min={1} max={90} {...register('diasAntesRecordatorio')} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={onClose}><X className="w-4 h-4" /> Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Check className="w-4 h-4" /> {agency ? 'Guardar' : 'Crear inmobiliaria'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 mt-1">Administrá las inmobiliarias y ajustá tus preferencias</p>
      </div>

      {/* Global settings */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Preferencias globales</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="label">Días de anticipación para recordatorios</label>
            <input
              className="input"
              type="number"
              min={1}
              max={90}
              value={reminderDays}
              onChange={e => setReminderDays(Number(e.target.value))}
            />
            <p className="text-xs text-slate-400 mt-1">Te avisamos con esta anticipación antes de cada ajuste</p>
          </div>
        </div>
      </div>

      {/* Agencies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Inmobiliarias</h2>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Nueva
          </button>
        </div>

        {showForm && !editingAgency && (
          <AgencyForm onClose={() => setShowForm(false)} />
        )}

        {agencies.length === 0 && !showForm ? (
          <div className="card p-8 text-center text-slate-400">
            <p className="font-medium mb-2">Sin inmobiliarias</p>
            <p className="text-sm">Creá tu primera inmobiliaria para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agencies.map(agency => (
              <div key={agency.id}>
                {editingAgency?.id === agency.id ? (
                  <AgencyForm agency={agency} onClose={() => setEditingAgency(undefined)} />
                ) : (
                  <div
                    className={`card p-4 flex items-center justify-between cursor-pointer hover:border-brand-200 transition-colors ${
                      agencyId === agency.id ? 'border-brand-300 bg-brand-50/30' : ''
                    }`}
                    onClick={() => setAgencyId(agency.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                        {agency.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{agency.name}</p>
                        {agency.email && <p className="text-sm text-slate-400">{agency.email}</p>}
                      </div>
                      {agencyId === agency.id && (
                        <span className="badge bg-brand-100 text-brand-700 ml-2">Activa</span>
                      )}
                    </div>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button className="btn-secondary py-1.5 px-3 text-xs" onClick={() => setEditingAgency(agency)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="btn text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 border border-red-200"
                        onClick={() => confirm('¿Eliminar esta inmobiliaria y todas sus propiedades?') && deleteMutation.mutate(agency.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
