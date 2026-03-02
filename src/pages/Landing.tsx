import { Link } from 'react-router-dom'
import { Building2, CheckCircle, TrendingUp, Users, ArrowRight, Bell } from 'lucide-react'

/* Simple Buenos Aires–style skyline silhouette */
function Skyline() {
  return (
    <svg
      viewBox="0 0 1200 180"
      preserveAspectRatio="xMidYMax meet"
      className="w-full"
      aria-hidden="true"
    >
      {/* Buildings — filled with semi-transparent dark so they sit on the gradient */}
      <g fill="rgba(15,23,42,0.55)">
        {/* Far-left low block */}
        <rect x="0" y="110" width="60" height="70" />
        <rect x="18" y="90" width="25" height="90" />
        {/* Small tower */}
        <rect x="70" y="70" width="18" height="110" />
        <rect x="75" y="60" width="8" height="20" />
        {/* Mid-left cluster */}
        <rect x="100" y="95" width="50" height="85" />
        <rect x="120" y="75" width="18" height="105" />
        <rect x="155" y="100" width="35" height="80" />
        {/* Tall center-left */}
        <rect x="200" y="45" width="30" height="135" />
        <rect x="205" y="30" width="20" height="25" />
        <rect x="210" y="20" width="10" height="15" />
        {/* Wide office */}
        <rect x="240" y="80" width="70" height="100" />
        <rect x="260" y="60" width="30" height="100" />
        {/* Narrow spire */}
        <rect x="320" y="35" width="20" height="145" />
        <rect x="325" y="15" width="10" height="25" />
        {/* Center cluster */}
        <rect x="350" y="65" width="55" height="115" />
        <rect x="375" y="45" width="22" height="135" />
        {/* Wide low */}
        <rect x="415" y="90" width="80" height="90" />
        <rect x="440" y="70" width="30" height="110" />
        {/* Tall center-right tower */}
        <rect x="505" y="30" width="35" height="150" />
        <rect x="511" y="10" width="23" height="25" />
        <rect x="518" y="0" width="9" height="15" />
        {/* Office block */}
        <rect x="550" y="75" width="60" height="105" />
        <rect x="565" y="55" width="30" height="125" />
        {/* Right cluster */}
        <rect x="620" y="85" width="45" height="95" />
        <rect x="635" y="60" width="20" height="120" />
        <rect x="675" y="50" width="28" height="130" />
        <rect x="680" y="35" width="18" height="20" />
        {/* Far-right buildings */}
        <rect x="715" y="80" width="55" height="100" />
        <rect x="730" y="65" width="25" height="115" />
        <rect x="780" y="95" width="40" height="85" />
        <rect x="790" y="75" width="20" height="105" />
        <rect x="830" y="55" width="30" height="125" />
        <rect x="835" y="38" width="20" height="22" />
        <rect x="870" y="90" width="60" height="90" />
        <rect x="890" y="70" width="22" height="110" />
        <rect x="940" y="100" width="50" height="80" />
        <rect x="955" y="80" width="20" height="100" />
        <rect x="1000" y="85" width="45" height="95" />
        <rect x="1012" y="65" width="22" height="115" />
        <rect x="1055" y="75" width="35" height="105" />
        <rect x="1100" y="95" width="50" height="85" />
        <rect x="1118" y="75" width="18" height="105" />
        <rect x="1155" y="105" width="45" height="75" />
        {/* Ground fill */}
        <rect x="0" y="175" width="1200" height="10" />
      </g>
      {/* Window lights — tiny amber/white dots scattered on buildings */}
      <g fill="rgba(251,191,36,0.5)">
        <rect x="205" y="50" width="3" height="3" />
        <rect x="215" y="60" width="3" height="3" />
        <rect x="263" y="68" width="3" height="3" />
        <rect x="275" y="78" width="3" height="3" />
        <rect x="326" y="45" width="3" height="3" />
        <rect x="377" y="55" width="3" height="3" />
        <rect x="508" y="40" width="3" height="3" />
        <rect x="520" y="50" width="3" height="3" />
        <rect x="568" y="65" width="3" height="3" />
        <rect x="638" y="70" width="3" height="3" />
        <rect x="678" y="45" width="3" height="3" />
        <rect x="832" y="65" width="3" height="3" />
        <rect x="1015" y="75" width="3" height="3" />
      </g>
    </svg>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen text-white" style={{
      background: 'linear-gradient(160deg, #0f1535 0%, #1a1040 35%, #0d2040 65%, #0f1535 100%)',
    }}>

      {/* Nav */}
      <header className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(15,21,53,0.75)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Propertly</span>
          </div>
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
            Ingresar →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Colorful glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[130px]"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(59,130,246,0.15) 60%, transparent 100%)' }} />
          <div className="absolute top-[80px] right-[-100px] w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: 'rgba(139,92,246,0.18)' }} />
          <div className="absolute top-[100px] left-[-80px] w-[350px] h-[350px] rounded-full blur-[100px]"
            style={{ background: 'rgba(6,182,212,0.12)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-14 sm:pt-24 pb-0 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs text-slate-300 mb-6 sm:mb-8"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Aplicación para gestión de alquileres
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-5 sm:mb-6">
            Administrá tus alquileres{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              sin complicaciones
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Seguí cobros, calculá ajustes por ICL e IPC, y compartí el estado del contrato con tus inquilinos — todo en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-16">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm shadow-lg"
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

          {/* Skyline */}
          <div className="relative -mb-1">
            <Skyline />
            {/* Subtle ground gradient to blend into features section */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(15,21,53,0.9), transparent)' }} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-28">
        <div className="grid sm:grid-cols-3 gap-4">

          <div className="rounded-2xl p-6 hover:brightness-110 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Control de cobros</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Registrá pagos, extras y descuentos. Visualizá de un vistazo qué propiedades están al día y cuáles tienen cobros vencidos.
            </p>
          </div>

          <div className="rounded-2xl p-6 hover:brightness-110 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(99,102,241,0.1)' }}>
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Ajustes automáticos</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Calculá ajustes por ICL e IPC en tiempo real. El nuevo valor se muestra automáticamente cuando llega la fecha de ajuste.
            </p>
          </div>

          <div className="rounded-2xl p-6 hover:brightness-110 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(139,92,246,0.1)' }}>
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
          <div className="rounded-2xl p-6 hover:brightness-110 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(245,158,11,0.1)' }}>
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Panel de cobros centralizado</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Todos los cobros pendientes y vencidos en una sola pantalla. Registrá un pago con un click, sin ir propiedad por propiedad.
            </p>
          </div>

          <div className="rounded-2xl p-6 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}>
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
      <footer className="border-t py-8" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
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
