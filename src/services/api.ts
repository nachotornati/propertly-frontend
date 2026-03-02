import axios from 'axios'
import type { Agency, Property, PropertyFormData } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE_URL })

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
