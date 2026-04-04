/**
 * IndexedDB storage for pre-aggregated FOCUS cost data.
 * Persists uploaded/processed data in the browser across page refreshes.
 *
 * Since pre-aggregated data is small (~5 MB vs ~500 MB raw),
 * we store it as a single object — no chunking needed.
 */

import { PreAggregatedData } from "@/lib/types/aggregated";

const DB_NAME = "finops-cost-data";
const DB_VERSION = 3; // Bumped from 2 to migrate from raw record chunks
const DATA_STORE = "aggregated";
const META_STORE = "metadata";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      // Clean up old stores from v1/v2
      if (db.objectStoreNames.contains("records")) {
        db.deleteObjectStore("records");
      }
      if (db.objectStoreNames.contains("chunks")) {
        db.deleteObjectStore("chunks");
      }
      if (!db.objectStoreNames.contains(DATA_STORE)) {
        db.createObjectStore(DATA_STORE);
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredDataMeta {
  files: string[];
  recordCount: number;
  uploadedAt: string;
}

/**
 * Save pre-aggregated data to IndexedDB.
 */
export async function saveAggregatedData(
  data: PreAggregatedData,
  meta: StoredDataMeta
): Promise<void> {
  const db = await openDB();

  const tx = db.transaction([DATA_STORE, META_STORE], "readwrite");
  tx.objectStore(DATA_STORE).put(data, "current");
  tx.objectStore(META_STORE).put(meta, "current");

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

/**
 * Load pre-aggregated data from IndexedDB.
 * Returns null if no data is stored.
 */
export async function loadAggregatedData(): Promise<{
  data: PreAggregatedData;
  meta: StoredDataMeta;
} | null> {
  try {
    const db = await openDB();

    const meta = await new Promise<StoredDataMeta | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(META_STORE, "readonly");
        const request = tx.objectStore(META_STORE).get("current");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }
    );

    if (!meta) {
      db.close();
      return null;
    }

    const data = await new Promise<PreAggregatedData | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(DATA_STORE, "readonly");
        const request = tx.objectStore(DATA_STORE).get("current");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }
    );

    db.close();

    if (!data || !data.factTable) return null;
    return { data, meta };
  } catch {
    return null;
  }
}

/**
 * Clear all stored data from IndexedDB.
 */
export async function clearStoredData(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([DATA_STORE, META_STORE], "readwrite");
    tx.objectStore(DATA_STORE).clear();
    tx.objectStore(META_STORE).clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore errors on clear
  }
}
