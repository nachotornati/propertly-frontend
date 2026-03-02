export interface Agency {
  id: string
  name: string
  email: string
  diasAntesRecordatorio: number
  createdAt: string
}

export interface Property {
  id: string
  agencyId: string
  address: string
  provincia: string
  barrio: string
  moneda: 'ARS' | 'USD'
  precio: number
  mesInicio: string // ISO date string
  ajusteMeses: number
  indiceAjuste?: 'ICL' | 'IPC'
  tenantName?: string
  notes?: string
  createdAt: string
  // Calculated by backend
  nextAdjustmentDate?: string
  daysUntilAdjustment?: number
  adjustmentDue?: boolean
  ajusteInfo?: AjusteInfo
}

export type PropertyFormData = Omit<Property, 'id' | 'agencyId' | 'createdAt' | 'nextAdjustmentDate' | 'daysUntilAdjustment' | 'adjustmentDue'>

export interface AjusteInfo {
  coeficiente: number
  nuevoPrecio: number
  valorDesde: number
  fechaDesde: string
  valorHasta: number
  fechaHasta: string
  estimado: boolean
  disclaimer: string | null
}
