import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProperties, createProperty, updateProperty, deleteProperty, getCobrosMesActual, getVencidosAnteriores } from '../services/api'
import PropertyCard from '../components/PropertyCard'
import PropertyForm from '../components/PropertyForm'
import PropertyDetailModal from '../components/PropertyDetailModal'
import { Plus, Search, Building2 } from 'lucide-react'
import type { Cobro, CobroVencidoAnterior, Property, PropertyFormData } from '../types'

interface PropertiesProps {
  agencyId: string
  reminderDays: number
}

export default function Properties({ agencyId, reminderDays }: PropertiesProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Property | undefined>()
  const [detail, setDetail] = useState<Property | undefined>()
  const [search, setSearch] = useState('')
  const [filterMoneda, setFilterMoneda] = useState<'ALL' | 'ARS' | 'USD'>('ALL')

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
  const cobrosMap = new Map(cobros.map((c: Cobro) => [c.propertyId, c]))

  const { data: vencidosAnteriores = [] } = useQuery<CobroVencidoAnterior[]>({
    queryKey: ['cobros-vencidos-anteriores', agencyId],
    queryFn: () => getVencidosAnteriores(agencyId),
    enabled: !!agencyId,
  })
  const vencidosAnterioresSet = new Set(vencidosAnteriores.map(v => v.property.id))

  const createMutation = useMutation({
    mutationFn: (data: PropertyFormData) => createProperty(agencyId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties', agencyId] }); setShowForm(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PropertyFormData }) => updateProperty(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties', agencyId] }); setEditing(undefined) },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties', agencyId] }),
  })

  const filtered = properties.filter(p => {
    const matchSearch = !search ||
      p.barrio.toLowerCase().includes(search.toLowerCase()) ||
      (p.address?.toLowerCase().includes(search.toLowerCase())) ||
      (p.tenantName?.toLowerCase().includes(search.toLowerCase()))
    const matchMoneda = filterMoneda === 'ALL' || p.moneda === filterMoneda
    return matchSearch && matchMoneda
  })

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta propiedad?')) deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Propiedades</h1>
          <p className="text-slate-500 mt-1">{properties.length} propiedades en total</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Nueva propiedad
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por barrio, dirección o inquilino..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {(['ALL', 'ARS', 'USD'] as const).map(m => (
            <button
              key={m}
              onClick={() => setFilterMoneda(m)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterMoneda === m ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m === 'ALL' ? 'Todas' : m}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          {properties.length === 0 ? (
            <>
              <h3 className="font-semibold text-slate-900 mb-1">Sin propiedades aún</h3>
              <p className="text-slate-500 text-sm mb-5">Agregá tu primera propiedad para comenzar</p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" /> Nueva propiedad
              </button>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-slate-900 mb-1">Sin resultados</h3>
              <p className="text-slate-500 text-sm">Probá con otro término de búsqueda</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              cobro={cobrosMap.get(prop.id)}
              hasVencidoAnterior={vencidosAnterioresSet.has(prop.id)}
              onClick={() => setDetail(prop)}
              onEdit={() => setEditing(prop)}
              onDelete={() => handleDelete(prop.id)}
              reminderDays={reminderDays}
            />
          ))}
        </div>
      )}

      {detail && (
        <PropertyDetailModal
          property={detail}
          reminderDays={reminderDays}
          onEdit={() => setEditing(detail)}
          onDelete={() => handleDelete(detail.id)}
          onClose={() => setDetail(undefined)}
        />
      )}

      {(showForm || editing) && (
        <PropertyForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(undefined) }}
          onSubmit={async (data) => {
            if (editing) await updateMutation.mutateAsync({ id: editing.id, data })
            else await createMutation.mutateAsync(data)
          }}
        />
      )}
    </div>
  )
}
