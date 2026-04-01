import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GrowDB extends DBSchema {
  offline_logs: {
    key: string;
    value: {
      id: string;
      plantId: string;
      eventType: string;
      diagnosis: string;
      amount: string | null;
      notes: string;
      createdAt: string;
      synced: boolean;
    };
    indexes: { 'by-plant': string };
  };
}

let dbPromise: Promise<IDBPDatabase<GrowDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<GrowDB>('growmaster-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('offline_logs', {
        keyPath: 'id',
      });
      store.createIndex('by-plant', 'plantId');
    },
  });
}

export async function saveOfflineLog(log: any) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('offline_logs', {
    ...log,
    id: log.id || Date.now().toString(),
    synced: false,
  });
}

export async function getUnsyncedLogs() {
  if (!dbPromise) return [];
  const db = await dbPromise;
  const allLogs = await db.getAll('offline_logs');
  return allLogs.filter(log => !log.synced);
}

export async function markLogAsSynced(id: string) {
  if (!dbPromise) return;
  const db = await dbPromise;
  const log = await db.get('offline_logs', id);
  if (log) {
    log.synced = true;
    await db.put('offline_logs', log);
    // Opcionalmente, eliminarlo una vez sincronizado
    await db.delete('offline_logs', id);
  }
}

export async function cleanOldLogs() {
  if (!dbPromise) return;
  const db = await dbPromise;
  const allLogs = await db.getAll('offline_logs');
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  for (const log of allLogs) {
    const logDate = new Date(log.createdAt);
    if (log.synced && logDate < sevenDaysAgo) {
      await db.delete('offline_logs', log.id);
    }
  }
}

export async function getOfflineLogsForPlant(plantId: string) {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return await db.getAllFromIndex('offline_logs', 'by-plant', plantId);
}