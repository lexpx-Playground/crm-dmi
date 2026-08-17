-- Coil-to-Quote CRM POC Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'sales', 'warehouse')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (single row for system config)
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  currency_code TEXT NOT NULL DEFAULT 'SGD',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  tax_name TEXT NOT NULL DEFAULT 'GST',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 9.00,
  tax_inclusive BOOLEAN NOT NULL DEFAULT FALSE,
  min_ton_value NUMERIC(12,2) NOT NULL DEFAULT 12000.00,
  min_ton_mode TEXT NOT NULL DEFAULT 'warn' CHECK (min_ton_mode IN ('warn', 'block')),
  quote_validity_days INTEGER NOT NULL DEFAULT 7,
  materials JSONB NOT NULL DEFAULT '[{"name": "steel", "density": 7.85}, {"name": "aluminium", "density": 2.70}]',
  terms_text TEXT DEFAULT '',
  company_name TEXT NOT NULL DEFAULT 'Your Company Name',
  company_address TEXT,
  company_contact TEXT,
  brand_logo_url TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_name ON clients(name);

-- Suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product types table
CREATE TABLE product_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  material TEXT NOT NULL,
  requires_size BOOLEAN NOT NULL DEFAULT FALSE,
  size_options TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product prices table (price book)
CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_type_id UUID REFERENCES product_types(id),
  thickness_mm NUMERIC(5,2) NOT NULL,
  price_per_m2 NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SGD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_prices_type ON product_prices(product_type_id);

-- Accessory types table
CREATE TABLE accessory_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  requires_size BOOLEAN NOT NULL DEFAULT FALSE,
  size_options TEXT[] DEFAULT ARRAY[]::TEXT[],
  price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase orders table
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  price NUMERIC(12,2),
  price_unit TEXT CHECK (price_unit IN ('per_ton', 'per_m2')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_transit', 'received', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  price_set_at TIMESTAMPTZ
);

CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_status ON purchase_orders(status);

-- Coils table
CREATE TABLE coils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coil_code TEXT NOT NULL,
  po_id UUID REFERENCES purchase_orders(id),
  material TEXT NOT NULL,
  thickness_mm NUMERIC(5,2) NOT NULL,
  width_mm NUMERIC(6,2) NOT NULL,
  weight_kg NUMERIC(10,2) NOT NULL,
  length_m NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_transit' CHECK (status IN ('in_transit', 'arrived', 'in_use', 'balance', 'finished')),
  arrival_date TIMESTAMPTZ,
  remaining_weight_kg NUMERIC(10,2),
  remaining_length_m NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coil_code ON coils(coil_code);
CREATE INDEX idx_coil_status ON coils(status);
CREATE INDEX idx_coil_po ON coils(po_id);

-- Coil movements ledger (append-only)
CREATE TABLE coil_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coil_id UUID REFERENCES coils(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('arrival', 'usage', 'balance', 'adjustment')),
  quantity_kg NUMERIC(10,2),
  quantity_m NUMERIC(10,2),
  batch_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  offline_created BOOLEAN NOT NULL DEFAULT FALSE,
  client_generated_uuid TEXT UNIQUE
);

CREATE INDEX idx_movements_coil ON coil_movements(coil_id);
CREATE INDEX idx_movements_batch ON coil_movements(batch_id);
CREATE INDEX idx_movements_timestamp ON coil_movements(timestamp);

-- Production batches table
CREATE TABLE production_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_qr TEXT UNIQUE NOT NULL,
  coil_ids UUID[] NOT NULL,
  client_id UUID REFERENCES clients(id),
  project_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_m2 NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_batch_qr ON production_batches(batch_qr);
CREATE INDEX idx_batch_client ON production_batches(client_id);

-- Quotations table
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_no TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id),
  project_name TEXT,
  lines JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SGD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  issue_date TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id),
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  snapshot_prices BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_no ON quotations(quote_no);
CREATE INDEX idx_quote_client ON quotations(client_id);
CREATE INDEX idx_quote_status ON quotations(status);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessory_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coils ENABLE ROW LEVEL SECURITY;
ALTER TABLE coil_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Superadmin has full access to all tables
CREATE POLICY "Superadmin full access" ON settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Sales can view settings but not edit
CREATE POLICY "Sales view settings" ON settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'sales'))
  );

-- All authenticated users can read clients
CREATE POLICY "Auth users view clients" ON clients
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Sales can create/edit clients
CREATE POLICY "Sales manage clients" ON clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'sales'))
  );

-- Similar policies for other tables...
-- (Add more granular policies as needed for your security model)

-- Seed data
INSERT INTO settings (id, currency_code, currency_symbol, tax_name, tax_rate, tax_inclusive, min_ton_value, min_ton_mode, quote_validity_days, company_name, terms_text)
VALUES (1, 'SGD', '$', 'GST', 9.00, FALSE, 12000.00, 'warn', 7, 'Coil Forming Co.', 'Payment due within 30 days. Prices valid for 7 days.');

-- Sample product types
INSERT INTO product_types (name, material, requires_size, size_options) VALUES
('Weathertip 200', 'steel', FALSE, ARRAY[]::TEXT[]),
('Weathertip 200', 'aluminium', FALSE, ARRAY[]::TEXT[]),
('Flashing', 'steel', TRUE, ARRAY['300', '400', '450']),
('Capping', 'steel', TRUE, ARRAY['300', '400', '450']),
('Clip', 'steel', FALSE, ARRAY[]::TEXT[]),
('Zip', 'steel', FALSE, ARRAY[]::TEXT[]);

-- Sample prices
INSERT INTO product_prices (product_type_id, thickness_mm, price_per_m2)
SELECT id, 0.45, 45.00 FROM product_types WHERE name = 'Weathertip 200' AND material = 'steel' LIMIT 1;

INSERT INTO product_prices (product_type_id, thickness_mm, price_per_m2)
SELECT id, 0.60, 55.00 FROM product_types WHERE name = 'Weathertip 200' AND material = 'steel' LIMIT 1;

-- Sample accessories
INSERT INTO accessory_types (name, requires_size, size_options, price) VALUES
('Flashing 300', TRUE, ARRAY['300'], 15.00),
('Flashing 400', TRUE, ARRAY['400'], 18.00),
('Flashing 450', TRUE, ARRAY['450'], 20.00),
('Clip', FALSE, ARRAY[]::TEXT[], 2.50),
('Zip', FALSE, ARRAY[]::TEXT[], 3.00);

