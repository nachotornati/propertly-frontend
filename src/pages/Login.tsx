import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowLeft } from 'lucide-react'
import { login, register, resetPassword } from '../services/api'

interface LoginProps {
  onAuth: (agencyId: string) => void
}

export default function Login({ onAuth }: LoginProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showReset, setShowReset] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = tab === 'login'
        ? await login(username, password)
        : await register(username, password, agencyName)

      localStorage.setItem('propertly_token', data.token)
      localStorage.setItem('propertly_agency', data.agencyId)
      onAuth(data.agencyId)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Ocurrió un error, intenta de nuevo')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await resetPassword(username, newPassword)
      setSuccess('Contraseña actualizada. Ya podés iniciar sesión.')
      setShowReset(false)
      setTab('login')
      setNewPassword('')
      setConfirmPassword('')
      setPassword('')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Ocurrió un error, intenta de nuevo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mb-3">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Propertly</h1>
          <p className="text-sm text-slate-500 mt-1">Administración de alquileres</p>
        </div>

        <div className="card p-6">
          {showReset ? (
            <>
              <button
                onClick={() => { setShowReset(false); setError(''); setSuccess('') }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              <h2 className="font-semibold text-slate-900 mb-1">Cambiar contraseña</h2>
              <p className="text-sm text-slate-500 mb-4">Ingresá tu usuario y tu nueva contraseña.</p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="label">Usuario</label>
                  <input
                    className="input"
                    placeholder="Tu nombre de usuario"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Nueva contraseña</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirmar contraseña</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Repetí la nueva contraseña"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
                {(['login', 'register'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(''); setSuccess('') }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                      tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Usuario</label>
                  <input
                    className="input"
                    placeholder="Tu nombre de usuario"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="label">Contraseña</label>
                  <input
                    className="input"
                    type="password"
                    placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                {tab === 'register' && (
                  <div>
                    <label className="label">Nombre de la inmobiliaria</label>
                    <input
                      className="input"
                      placeholder="Ej: Inmobiliaria López"
                      value={agencyName}
                      onChange={e => setAgencyName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    {success}
                  </p>
                )}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Cargando...' : tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
                </button>

                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setError(''); setSuccess('') }}
                    className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors text-center"
                  >
                    Olvidé mi contraseña
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
