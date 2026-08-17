// Utility functions for Coil-to-Quote CRM
import { format } from 'date-fns';

// Format date according to settings (DD/MM/YYYY default)
export function formatDate(date: Date | string, pattern = 'dd/MM/yyyy'): string {
  return format(new Date(date), pattern);
}

// Calculate kg/m² from thickness and density
export function calculateKgPerM2(thicknessMm: number, density: number): number {
  // kg/m² = thickness_mm × density
  return thicknessMm * density;
}

// Calculate effective $/ton from price/m²
export function calculateEffectiveTonPrice(pricePerM2: number, thicknessMm: number, density: number): number {
  // eff $/ton = (price/m² ÷ kg/m²) × 1000
  const kgPerM2 = calculateKgPerM2(thicknessMm, density);
  if (kgPerM2 === 0) return 0;
  return (pricePerM2 / kgPerM2) * 1000;
}

// Check if price meets minimum $/ton guardrail
export function checkMinTonGuardrail(
  pricePerM2: number,
  thicknessMm: number,
  density: number,
  minTonValue: number
): { passes: boolean; effectivePrice: number } {
  const effectivePrice = calculateEffectiveTonPrice(pricePerM2, thicknessMm, density);
  return {
    passes: effectivePrice >= minTonValue,
    effectivePrice,
  };
}

// Round to 2 decimal places
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

// Calculate tax amount
export function calculateTax(subtotal: number, taxRate: number, inclusive: boolean): number {
  if (taxRate === 0) return 0;
  
  if (inclusive) {
    // Tax-inclusive: tax = total × rate ÷ (100 + rate)
    return roundCurrency(subtotal * taxRate / (100 + taxRate));
  } else {
    // Tax-exclusive: tax = subtotal × rate ÷ 100
    return roundCurrency(subtotal * taxRate / 100);
  }
}

// Calculate total with tax
export function calculateTotal(subtotal: number, taxRate: number, inclusive: boolean): number {
  const tax = calculateTax(subtotal, taxRate, inclusive);
  return inclusive ? subtotal : roundCurrency(subtotal + tax);
}

// Generate quote number
export function generateQuoteNumber(sequence: number): string {
  return `Q-${String(sequence).padStart(5, '0')}`;
}

// Generate batch QR code value
export function generateBatchQR(): string {
  return `BATCH-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

// Validate coil dimensions consistency
export function validateCoilDimensions(
  weightKg: number,
  lengthM: number,
  widthMm: number,
  thicknessMm: number,
  density: number
): { valid: boolean; variance: number } {
  // Expected length = weight ÷ (width_m × thickness × density)
  const widthM = widthMm / 1000;
  const thicknessM = thicknessMm / 1000;
  const expectedLength = weightKg / (widthM * thicknessM * density * 1000);
  const variance = Math.abs(lengthM - expectedLength) / expectedLength * 100;
  
  return {
    valid: variance <= 2, // 2% tolerance
    variance,
  };
}

// Format currency
export function formatCurrency(amount: number, symbol: string, code: string): string {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${code})`;
}

// Parse CSV content
export function parseCSV(content: string): { headers: string[]; rows: any[]; errors: string[] } {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ['Empty file'] };
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: any[] = [];
  const errors: string[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      errors.push(`Line ${i + 1}: Column count mismatch`);
      continue;
    }
    
    const row: any = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }
    rows.push(row);
  }
  
  return { headers, rows, errors };
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Get connectivity status
export function getConnectivityStatus(): 'online' | 'offline' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  return navigator.onLine ? 'online' : 'offline';
}
