import type { Dataset } from '../types'

const DB_NAME = 'gtfs-explorer'
const DB_VERSION = 1
const STORE_NAME = 'datasets'
const CACHE_KEY = 'gtfs-datasets'

export interface CachedPayload {
  data: Dataset[]
  fetchedAt: number // Unix timestamp ms
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getCachedData(): Promise<CachedPayload | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(CACHE_KEY)
      req.onsuccess = () => resolve((req.result as CachedPayload) ?? null)
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => db.close()
    })
  } catch {
    return null
  }
}

export async function setCachedData(data: Dataset[], fetchedAt: number): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).put({ data, fetchedAt }, CACHE_KEY)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => db.close()
    })
  } catch {
    // Cache write failure is non-fatal — silently ignore
  }
}
