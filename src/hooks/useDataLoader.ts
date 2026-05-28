import { useState, useCallback, useEffect } from 'react'
import type { Dataset, ProcessedDataset } from '../types'
import { processDatasets } from '../utils/transform'
import { getCachedData, setCachedData } from '../utils/dataCache'

export type LoadingState = 'idle' | 'loading' | 'refreshing' | 'error' | 'success'

const API_URL = 'https://transport.data.gouv.fr/api/datasets'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h

export function useDataLoader() {
  const [state, setState] = useState<LoadingState>('idle')
  const [datasets, setDatasets] = useState<ProcessedDataset[]>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)
  const [isStale, setIsStale] = useState(false)

  const fetchFromNetwork = useCallback(async (background = false) => {
    if (!background) {
      setState('loading')
      setProgress(0)
      setError(null)
    } else {
      setState('refreshing')
    }

    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`)

      const contentLength = res.headers.get('Content-Length')
      const total = contentLength ? parseInt(contentLength, 10) : null
      const reader = res.body!.getReader()
      let received = 0
      const chunks: Uint8Array[] = []

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        received += value.length
        if (total !== null && !background) {
          setProgress(Math.round((received / total) * 100))
        }
      }

      const combined = new Uint8Array(received)
      let pos = 0
      for (const chunk of chunks) {
        combined.set(chunk, pos)
        pos += chunk.length
      }
      const raw: Dataset[] = JSON.parse(new TextDecoder().decode(combined))
      const now = Date.now()

      await setCachedData(raw, now)

      setDatasets(processDatasets(raw))
      setFetchedAt(new Date(now))
      setIsStale(false)
      setState('success')
      setProgress(null)
    } catch (err) {
      if (!background) {
        setError(String(err))
        setState('error')
        setProgress(null)
      }
      // Background refresh failure is silent — stale data stays visible
    }
  }, [])

  const load = useCallback(async () => {
    const cached = await getCachedData()

    if (!cached) {
      await fetchFromNetwork(false)
      return
    }

    const stale = Date.now() - cached.fetchedAt > CACHE_TTL_MS
    setDatasets(processDatasets(cached.data))
    setFetchedAt(new Date(cached.fetchedAt))
    setIsStale(stale)
    setState('success')

    if (stale) {
      fetchFromNetwork(true)
    }
  }, [fetchFromNetwork])

  const reload = useCallback(() => fetchFromNetwork(false), [fetchFromNetwork])

  // Auto-load on mount
  useEffect(() => {
    load()
  }, [load])

  return { state, datasets, error, progress, fetchedAt, isStale, reload }
}
