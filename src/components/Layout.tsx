import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, LayoutDashboard, Bell, Settings, LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { logout, getAgencies } from '../services/api'

interface LayoutProps {
  agencyId: string
  onLogout: () => void
}

export default function Layout({ agencyId, onLogout }: LayoutProps) {
  const { data: agencies = [] } = useQuery({ queryKey: ['agencies'], queryFn: getAgencies })
  const agency = agencies.find(a => a.id === agencyId) ?? agencies[0]
  const navigate = useNavigate()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/properties', icon: Building2, label: 'Propiedades' },
    { to: '/reminders', icon: Bell, label: 'Cobros' },
    { to: '/settings', icon: Settings, label: 'Configuración' },
  ]

  const handleLogout = async () => {
    await logout()
    onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
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

          <div className="flex items-center gap-3">
            {agency && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  {agency.name[0]}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[160px] truncate">{agency.name}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
        <div className="flex items-center">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-brand-600' : 'text-slate-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
