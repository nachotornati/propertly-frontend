import axios from 'axios'
import type { Agency, Property, PropertyFormData, Cobro, CobroVencidoAnterior, TenantViewData } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE_URL })

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('propertly_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('propertly_token')
      localStorage.removeItem('propertly_agency')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const login = (username: string, password: string) =>
  api.post<{ token: string; agencyId: string }>('/api/auth/login', { username, password }).then(r => r.data)

export const register = (username: string, password: string, agencyName: string) =>
  api.post<{ token: string; agencyId: string }>('/api/auth/register', { username, password, agencyName }).then(r => r.data)

export const resetPassword = (username: string, newPassword: string) =>
  api.post('/api/auth/reset-password', { username, newPassword }).then(r => r.data)

export const logout = () =>
  api.post('/api/auth/logout').catch(() => {}).finally(() => {
    localStorage.removeItem('propertly_token')
    localStorage.removeItem('propertly_agency')
  })

// Agencies
export const getAgencies = () =>
  api.get<Agency[]>('/api/agencies').then(r => r.data)

export const createAgency = (data: Partial<Agency>) =>
  api.post<Agency>('/api/agencies', data).then(r => r.data)

export const updateAgency = (id: string, data: Partial<Agency>) =>
  api.put<Agency>(`/api/agencies/${id}`, data).then(r => r.data)

export const deleteAgency = (id: string) =>
  api.delete(`/api/agencies/${id}`)

// Properties
export const getProperties = (agencyId: string) =>
  api.get<Property[]>(`/api/agencies/${agencyId}/properties`).then(r => r.data)

export const createProperty = (agencyId: string, data: PropertyFormData) =>
  api.post<Property>(`/api/agencies/${agencyId}/properties`, data).then(r => r.data)

export const updateProperty = (id: string, data: PropertyFormData) =>
  api.put<Property>(`/api/properties/${id}`, data).then(r => r.data)

export const deleteProperty = (id: string) =>
  api.delete(`/api/properties/${id}`)

// Reminders
export const getReminders = (agencyId: string, days = 30) =>
  api.get<Property[]>(`/api/agencies/${agencyId}/reminders?days=${days}`).then(r => r.data)

// Cobros
export const getCobros = (propertyId: string) =>
  api.get<Cobro[]>(`/api/properties/${propertyId}/cobros`).then(r => r.data)

export const createCobro = (propertyId: string, data: Partial<Cobro>) =>
  api.post<Cobro>(`/api/properties/${propertyId}/cobros`, data).then(r => r.data)

export const updateCobro = (id: string, data: Partial<Cobro>) =>
  api.put<Cobro>(`/api/cobros/${id}`, data).then(r => r.data)

export const deleteCobro = (id: string) =>
  api.delete(`/api/cobros/${id}`)

export const getCobrosMesActual = (agencyId: string) =>
  api.get<Cobro[]>(`/api/agencies/${agencyId}/cobros-mes-actual`).then(r => r.data)

export const getVencidosAnteriores = (agencyId: string) =>
  api.get<CobroVencidoAnterior[]>(`/api/agencies/${agencyId}/cobros-vencidos-anteriores`).then(r => r.data)

export const notificarCobro = (id: string) =>
  api.post(`/api/cobros/${id}/notificar`).then(r => r.data)

export const bulkCreateCobros = (agencyId: string) =>
  api.post<{ created: number; skipped: number }>(`/api/agencies/${agencyId}/cobros-bulk-create`).then(r => r.data)

export const bulkNotificarCobros = (agencyId: string) =>
  api.post<{ sent: number; skipped: number; errors: string[] }>(`/api/agencies/${agencyId}/cobros-bulk-notificar`).then(r => r.data)

// Public tenant view (no auth)
export const getTenantView = (token: string) =>
  axios.get<TenantViewData>(`${BASE_URL}/api/public/tenant/${token}`).then(r => r.data)
