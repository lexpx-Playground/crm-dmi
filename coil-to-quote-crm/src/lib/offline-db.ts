// Offline-first database using Dexie (IndexedDB wrapper)
import Dexie, { type Table } from 'dexie';
import type { CoilMovement, ProductionBatch, SyncQueueItem, QuotationStatus } from '../types';

class OfflineDatabase extends Dexie {
  movements!: Table<CoilMovement>;
  batches!: Table<ProductionBatch>;
  syncQueue!: Table<SyncQueueItem>;
  quotations!: Table<QuotationStatus>;
  coils!: Table<any>;

  constructor() {
    super('CoilToQuoteDB');
    
    this.version(1).stores({
      movements: 'id, coil_id, movement_type, timestamp, offline_created',
      batches: 'id, batch_qr, created_at, client_id',
      syncQueue: 'id, type, synced, created_at',
      quotations: 'id, quote_no, client_id, status, pdf_generated_at',
      coils: 'id, coil_code, po_id, status',
    });
  }
}

export const db = new OfflineDatabase();

// Sync queue operations
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'created_at' | 'synced' | 'sync_attempts'>) {
  const id = crypto.randomUUID();
  await db.syncQueue.add({
    ...item,
    id,
    created_at: new Date().toISOString(),
    synced: false,
    sync_attempts: 0,
  });
  return id;
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return await db.syncQueue.where('synced').equals(false).toArray();
}

export async function markSynced(id: string) {
  await db.syncQueue.update(id, { synced: true });
}

export async function incrementSyncAttempts(id: string) {
  const item = await db.syncQueue.get(id);
  if (item) {
    await db.syncQueue.update(id, { sync_attempts: item.sync_attempts + 1 });
  }
}

export async function clearSyncedItems() {
  await db.syncQueue.where('synced').equals(true).delete();
}

// Movement operations (offline)
export async function addOfflineMovement(movement: Omit<CoilMovement, 'id' | 'offline_created'>) {
  const id = crypto.randomUUID();
  const fullMovement: CoilMovement = {
    ...movement,
    id,
    offline_created: true,
  };
  await db.movements.add(fullMovement);
  
  // Also add to sync queue
  await addToSyncQueue({
    type: 'movement',
    data: fullMovement,
  });
  
  return id;
}

export async function getOfflineMovements(): Promise<CoilMovement[]> {
  return await db.movements.where('offline_created').equals(true).toArray();
}

// Batch operations (offline)
export async function addOfflineBatch(batch: Omit<ProductionBatch, 'id'>) {
  const id = crypto.randomUUID();
  const fullBatch: ProductionBatch = {
    ...batch,
    id,
  };
  await db.batches.add(fullBatch);
  
  // Also add to sync queue
  await addToSyncQueue({
    type: 'batch_create',
    data: fullBatch,
  });
  
  return id;
}

export async function getOfflineBatches(): Promise<ProductionBatch[]> {
  return await db.batches.toArray();
}

// Quotation operations (offline drafts)
export async function saveOfflineQuotation(quote: QuotationStatus) {
  await db.quotations.put(quote);
}

export async function getOfflineQuotations(): Promise<QuotationStatus[]> {
  return await db.quotations.where('pdf_generated_at').isUndefined().toArray();
}

export async function updateQuotationPdf(quoteNo: string, pdfUrl: string) {
  const quote = await db.quotations.where('quote_no').equals(quoteNo).first();
  if (quote) {
    await db.quotations.update(quote.id, {
      pdf_url: pdfUrl,
      pdf_generated_at: new Date().toISOString(),
    });
  }
}

// Coil cache for offline
export async function cacheCoils(coils: any[]) {
  for (const coil of coils) {
    await db.coils.put(coil);
  }
}

export async function getCachedCoil(coilCode: string) {
  return await db.coils.where('coil_code').equals(coilCode).first();
}

export async function updateCachedCoilStatus(coilCode: string, status: string, remaining?: { weight?: number; length?: number }) {
  const coil = await db.coils.where('coil_code').equals(coilCode).first();
  if (coil) {
    const updates: any = { status };
    if (remaining?.weight !== undefined) updates.remaining_weight_kg = remaining.weight;
    if (remaining?.length !== undefined) updates.remaining_length_m = remaining.length;
    await db.coils.update(coil.id, updates);
  }
}
