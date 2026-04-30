import { openDB, type IDBPDatabase } from 'idb';
import type { ProcessedData, CategoryKey } from './types';

const DB_NAME = 'investment-dashboard';
const DB_VERSION = 2;
const STORE = 'processed-data';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 2) {
          if (db.objectStoreNames.contains(STORE)) {
            db.deleteObjectStore(STORE);
          }
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('category', 'category');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveToCache(data: ProcessedData): Promise<void> {
  const db = await getDB();
  await db.put(STORE, data);
}

export async function loadFromCache(id: string): Promise<ProcessedData | undefined> {
  const db = await getDB();
  return db.get(STORE, id);
}

export async function loadByCategory(category: CategoryKey): Promise<ProcessedData[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE, 'category', category);
}

export async function loadAllFromCache(): Promise<ProcessedData[]> {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function deleteFromCache(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function clearCache(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE);
}

export async function isCached(id: string): Promise<boolean> {
  const item = await loadFromCache(id);
  return !!item;
}
