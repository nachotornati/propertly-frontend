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
  duracionMeses?: number
  tenantToken?: string
  indiceAjuste?: 'ICL' | 'IPC'
  tenantName?: string
  tenantPhone?: string
  tenantEmail?: string
  tenantFactura?: boolean
  tenantPersonaJuridica?: boolean
  tenantDocumento?: string
  notes?: string
  createdAt: string
  // Calculated by backend
  precioActual?: number
  nextAdjustmentDate?: string
  daysUntilAdjustment?: number
  adjustmentDue?: boolean
  ajusteInfo?: AjusteInfo
  historialAjustes?: AjusteRecord[]
}

export type PropertyFormData = Omit<Property, 'id' | 'agencyId' | 'createdAt' | 'nextAdjustmentDate' | 'daysUntilAdjustment' | 'adjustmentDue' | 'precioActual' | 'historialAjustes'>

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

export interface AjusteRecord {
  fecha: string
  precioAntes: number
  precioAhora: number
  coeficiente: number
}

export interface TenantViewData {
  address: string
  barrio: string
  provincia?: string
  tenantName?: string
  moneda: 'ARS' | 'USD'
  precioActual: number
  mesInicio: string
  duracionMeses?: number
  nextAdjustmentDate?: string
  ajusteInfo?: AjusteInfo
  historialAjustes?: AjusteRecord[]
  createdAt?: string
  cobros: Cobro[]
}

export interface CobroVencidoAnterior {
  property: Property
  mes: string // ISO date "2026-02-01"
  cobro: Cobro | null // null = no cobro registered; non-null = cobro exists but unpaid
}

export interface CobroExtra {
  id?: string
  descripcion: string
  monto: number
}

export interface Cobro {
  id: string
  propertyId: string
  mes: string
  montoBase: number
  montoTotal: number
  pagado: boolean
  fechaPago?: string
  notes?: string
  extras: CobroExtra[]
}
