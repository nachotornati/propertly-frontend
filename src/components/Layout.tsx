import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, LayoutDashboard, Bell, Settings, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAgencies } from '../services/api'
import { useState } from 'react'
import type { Agency } from '../types'

export const AgencyContext = {
  currentId: '',
}

interface LayoutProps {
  agencyId: string
  setAgencyId: (id: string) => void
}

export default function Layout({ agencyId, setAgencyId }: LayoutProps) {
  const { data: agencies = [] } = useQuery({ queryKey: ['agencies'], queryFn: getAgencies })
  const [showPicker, setShowPicker] = useState(false)
  const navigate = useNavigate()

  const currentAgency = agencies.find(a => a.id === agencyId)

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/properties', icon: Building2, label: 'Propiedades' },
    { to: '/reminders', icon: Bell, label: 'Recordatorios' },
    { to: '/settings', icon: Settings, label: 'Configuración' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Propertly</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Agency selector */}
          <div className="relative">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                {currentAgency?.name?.[0] ?? '?'}
              </div>
              <span className="max-w-[150px] truncate">{currentAgency?.name ?? 'Seleccionar inmobiliaria'}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showPicker && (
              <div className="absolute right-0 mt-2 w-64 card shadow-lg py-1 z-50">
                {agencies.map(agency => (
                  <button
                    key={agency.id}
                    onClick={() => { setAgencyId(agency.id); setShowPicker(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-3 ${
                      agency.id === agencyId ? 'text-brand-700 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {agency.name[0]}
                    </div>
                    <div>
                      <div className="font-medium">{agency.name}</div>
                      {agency.email && <div className="text-xs text-slate-400">{agency.email}</div>}
                    </div>
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => { setShowPicker(false); navigate('/settings') }}
                    className="w-full text-left px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 font-medium"
                  >
                    + Nueva inmobiliaria
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {agencyId ? (
          <Outlet />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Bienvenido a Propertly</h2>
            <p className="text-slate-500 mb-6 max-w-sm">Para comenzar, creá tu primera inmobiliaria en la sección de configuración.</p>
            <button className="btn-primary" onClick={() => navigate('/settings')}>
              Crear inmobiliaria
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
