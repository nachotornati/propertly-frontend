import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAgencies, updateAgency } from '../services/api'
import { useForm } from 'react-hook-form'
import { Pencil, X, Check } from 'lucide-react'
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

export default function Settings({ agencyId, reminderDays, setReminderDays }: SettingsProps) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)

  const { data: agencies = [] } = useQuery({ queryKey: ['agencies'], queryFn: getAgencies })
  const agency = agencies.find(a => a.id === agencyId) ?? agencies[0]

  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<AgencyFormData>({
    values: agency ? { name: agency.name, email: agency.email ?? '', diasAntesRecordatorio: agency.diasAntesRecordatorio } : undefined,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Agency>) => updateAgency(agencyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] })
      setEditing(false)
    },
  })

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 mt-1">Ajustá los datos de tu inmobiliaria y preferencias</p>
      </div>

      {/* Agency */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Mi inmobiliaria</h2>
          {!editing && (
            <button className="btn-secondary py-1.5 px-3 text-xs" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(data => updateMutation.mutateAsync(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre *</label>
                <input className="input" placeholder="Inmobiliaria XYZ" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="label">Email de contacto</label>
                <input className="input" type="email" placeholder="info@inmobiliaria.com" {...register('email')} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => { setEditing(false); reset() }}>
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                <Check className="w-4 h-4" /> Guardar
              </button>
            </div>
          </form>
        ) : agency ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
              {agency.name[0]}
            </div>
            <div>
              <p className="font-medium text-slate-900">{agency.name}</p>
              {agency.email && <p className="text-sm text-slate-400">{agency.email}</p>}
            </div>
          </div>
        ) : null}
      </div>

      {/* Reminder days */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Preferencias</h2>
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
    </div>
  )
}
