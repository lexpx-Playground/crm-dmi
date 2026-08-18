// Types for Coil-to-Quote CRM POC

export type UserRole = 'superadmin' | 'sales' | 'warehouse';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface Material {
  id: string;
  name: string;
  density: number; // g/cm³
}

export interface ProductType {
  id: string;
  name: string;
  material_id: string;
  requires_size: boolean; // flashing/capping require size (300/400/450)
  size_options?: ('300' | '400' | '450')[];
}

export interface ProductPrice {
  id: string;
  product_type_id: string;
  thickness_mm: number;
  price_per_m2: number;
  currency: string;
}

export interface AccessoryType {
  id: string;
  name: string;
  requires_size: boolean;
  size_options?: ('300' | '400' | '450')[];
  price: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  price?: number;
  price_unit?: 'per_ton' | 'per_m2';
  status: 'draft' | 'in_transit' | 'received' | 'cancelled';
  created_at: string;
  price_set_at?: string;
}

export interface Coil {
  id: string;
  coil_code: string; // supplier barcode
  po_id: string;
  material: string;
  thickness_mm: number;
  width_mm: number;
  weight_kg: number;
  length_m: number;
  status: 'in_transit' | 'arrived' | 'in_use' | 'balance' | 'finished';
  arrival_date?: string;
  remaining_weight_kg?: number;
  remaining_length_m?: number;
}

export interface CoilMovement {
  id: string;
  coil_id: string;
  movement_type: 'arrival' | 'usage' | 'balance' | 'adjustment';
  quantity_kg?: number;
  quantity_m?: number;
  batch_id?: string;
  timestamp: string;
  user_id: string;
  offline_created?: boolean;
}

export interface ProductionBatch {
  id: string;
  batch_qr: string;
  coil_ids: string[];
  client_id?: string;
  project_name?: string;
  created_at: string;
  total_m2: number;
}

export interface QuotationStatus {
  id: string;
  quote_no: string;
  client_id: string;
  project_name?: string;
  lines: QuotationLine[];
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  issue_date: string;
  valid_until: string;
  created_by: string;
  pdf_url?: string;
  pdf_generated_at?: string;
  snapshot_prices: boolean;
}

export interface QuotationLine {
  id: string;
  type: 'product' | 'accessory';
  description: string;
  qty: number;
  unit: 'm²' | 'm' | 'pc';
  unit_price: number;
  total: number;
  // Product-specific
  product_type_id?: string;
  material?: string;
  thickness_mm?: number;
  size?: string;
  // Override tracking
  override_reason?: string;
}

export interface Settings {
  id: string;
  currency_code: string;
  currency_symbol: string;
  tax_name: string;
  tax_rate: number;
  tax_inclusive: boolean;
  min_ton_value: number;
  min_ton_mode: 'warn' | 'block';
  quote_validity_days: number;
  materials: { name: string; density: number }[];
  terms_text: string;
  company_name: string;
  company_address?: string;
  company_contact?: string;
  brand_logo_url?: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'coil_arrival' | 'coil_usage' | 'batch_create' | 'movement';
  data: any;
  created_at: string;
  synced: boolean;
  sync_attempts: number;
}
