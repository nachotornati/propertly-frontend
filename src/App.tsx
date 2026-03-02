import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'

export default function App() {
  const [agencyId, setAgencyId] = useState<string>(() => localStorage.getItem('propertly_agency') ?? '')
  const [reminderDays, setReminderDays] = useState<number>(() => {
    const saved = localStorage.getItem('propertly_reminder_days')
    return saved ? Number(saved) : 30
  })

  const handleSetAgencyId = (id: string) => {
    setAgencyId(id)
    localStorage.setItem('propertly_agency', id)
  }

  const handleSetReminderDays = (days: number) => {
    setReminderDays(days)
    localStorage.setItem('propertly_reminder_days', String(days))
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Layout agencyId={agencyId} setAgencyId={handleSetAgencyId} />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard agencyId={agencyId} reminderDays={reminderDays} />} />
        <Route path="properties" element={<Properties agencyId={agencyId} reminderDays={reminderDays} />} />
        <Route path="reminders" element={<Reminders agencyId={agencyId} reminderDays={reminderDays} />} />
        <Route path="settings" element={<Settings agencyId={agencyId} setAgencyId={handleSetAgencyId} reminderDays={reminderDays} setReminderDays={handleSetReminderDays} />} />
      </Route>
    </Routes>
  )
}
