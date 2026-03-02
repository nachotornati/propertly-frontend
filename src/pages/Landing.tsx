import { Link } from 'react-router-dom'
import { Building2, CheckCircle, TrendingUp, Users, ArrowRight, Bell } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Nav */}
      <header className="border-b border-white/5 sticky top-0 z-50 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Propertly</span>
          </div>
          <Link
            to="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Ingresar →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gestión de alquileres para inmobiliarias argentinas
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Administrá tus alquileres{' '}
            <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
              sin complicaciones
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Seguí cobros, calculá ajustes por ICL e IPC, y compartí el estado del contrato con tus inquilinos — todo en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm"
            >
              Empezar gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-white transition-colors text-sm"
            >
              Ya tengo cuenta →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="grid sm:grid-cols-3 gap-4">

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Control de cobros</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Registrá pagos, extras y descuentos. Visualizá de un vistazo qué propiedades están al día y cuáles tienen cobros vencidos.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-brand-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Ajustes automáticos</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Calculá ajustes por ICL e IPC en tiempo real. El nuevo valor se muestra automáticamente cuando llega la fecha de ajuste.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Vista del inquilino</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Compartí un link único con cada inquilino para que pueda ver el estado de su contrato, cobros y próximos ajustes.
            </p>
          </div>
        </div>

        {/* Second row */}
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Panel de cobros centralizado</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Todos los cobros pendientes y vencidos en una sola pantalla. Registrá un pago con un click, sin ir propiedad por propiedad.
            </p>
          </div>

          <div className="bg-gradient-to-br from-brand-600/20 to-violet-600/20 border border-brand-500/20 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-white mb-2">Empezá hoy, gratis</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Creá tu cuenta en segundos y cargá tus propiedades. Sin tarjeta de crédito, sin límite de propiedades.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm w-fit"
            >
              Crear cuenta gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Propertly</span>
          </div>
          <p className="text-xs text-slate-500">© 2026 Propertly</p>
        </div>
      </footer>

    </div>
  )
}
