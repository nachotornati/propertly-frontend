import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'
import Login from './pages/Login'
import TenantView from './pages/TenantView'
import Landing from './pages/Landing'

export default function App() {
  const [agencyId, setAgencyId] = useState<string>(() => localStorage.getItem('propertly_agency') ?? '')
  const [reminderDays, setReminderDays] = useState<number>(() => {
    const saved = localStorage.getItem('propertly_reminder_days')
    return saved ? Number(saved) : 30
  })

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('propertly_token'))

  const handleAuth = (id: string) => {
    setAgencyId(id)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setAgencyId('')
    setIsLoggedIn(false)
  }

  const handleSetReminderDays = (days: number) => {
    setReminderDays(days)
    localStorage.setItem('propertly_reminder_days', String(days))
  }

  // Public tenant view — always accessible regardless of auth state
  return (
    <Routes>
      <Route path="/t/:token" element={<TenantView />} />

      {isLoggedIn ? (
        <>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/"
            element={<Layout agencyId={agencyId} onLogout={handleLogout} />}
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard agencyId={agencyId} reminderDays={reminderDays} />} />
            <Route path="properties" element={<Properties agencyId={agencyId} reminderDays={reminderDays} />} />
            <Route path="reminders" element={<Reminders agencyId={agencyId} reminderDays={reminderDays} />} />
            <Route path="settings" element={<Settings agencyId={agencyId} setAgencyId={setAgencyId} reminderDays={reminderDays} setReminderDays={handleSetReminderDays} />} />
          </Route>
        </>
      ) : (
        <>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onAuth={handleAuth} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )
}
