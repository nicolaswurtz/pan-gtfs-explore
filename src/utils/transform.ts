import type {
  Dataset,
  Resource,
  ProcessedDataset,
  ProcessedGtfsResource,
  ProcessedGtfsRtResource,
  FreshnessStatus,
  Filters,
} from '../types'

const EXPIRING_THRESHOLD_DAYS = 30

function getFreshness(endDate: string | null): FreshnessStatus {
  if (!endDate) return 'valid'
  const end = new Date(endDate)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffDays < 0) return 'expired'
  if (diffDays < EXPIRING_THRESHOLD_DAYS) return 'expiring'
  return 'valid'
}

function calcValidityDays(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  const s = new Date(start)
  const e = new Date(end)
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}

function processGtfsResource(r: Resource): ProcessedGtfsResource | null {
  if (r.format !== 'GTFS') return null
  if (!r.is_available) return null
  if (!r.features || r.features.length === 0) return null

  const meta = r.metadata ?? {}
  const start_date = meta.start_date ?? null
  const end_date = meta.end_date ?? null
  const trips_count = meta.stats?.trips_count ?? -1

  return {
    id: r.id,
    title: r.title,
    features: r.features,
    has_shapes: meta.has_shapes ?? false,
    modes: meta.modes ?? [],
    start_date,
    end_date,
    validity_days: calcValidityDays(start_date, end_date),
    trips_count,
    trips_count_zero: trips_count === 0,
    freshness: getFreshness(end_date),
    page_url: r.page_url,
    url: r.url,
    updated: r.updated,
  }
}

function processGtfsRtResource(r: Resource): ProcessedGtfsRtResource | null {
  if (r.format !== 'gtfs-rt') return null
  if (!r.is_available) return null
  if (!r.features || r.features.length === 0) return null

  const features = r.features
  return {
    id: r.id,
    title: r.title,
    has_trip_updates: features.includes('trip_updates'),
    has_service_alerts: features.includes('service_alerts'),
    has_vehicle_positions: features.includes('vehicle_positions'),
    page_url: r.page_url,
    updated: r.updated,
  }
}

function worstFreshness(gtfs: ProcessedGtfsResource[]): FreshnessStatus {
  if (gtfs.some((r) => r.freshness === 'expired')) return 'expired'
  if (gtfs.some((r) => r.freshness === 'expiring')) return 'expiring'
  return 'valid'
}

export function processDatasets(raw: Dataset[]): ProcessedDataset[] {
  const results: ProcessedDataset[] = []

  for (const d of raw) {
    const gtfs = d.resources
      .map(processGtfsResource)
      .filter((r): r is ProcessedGtfsResource => r !== null)

    if (gtfs.length === 0) continue

    const gtfs_rt = d.resources
      .map(processGtfsRtResource)
      .filter((r): r is ProcessedGtfsRtResource => r !== null)

    const all_modes = [...new Set(gtfs.flatMap((r) => r.modes))]
    const all_features = [...new Set(gtfs.flatMap((r) => r.features))]

    results.push({
      id: d.id,
      title: d.title,
      publisher_name: d.publisher?.name ?? 'Inconnu',
      licence: d.licence,
      covered_area: d.covered_area ?? [],
      page_url: d.page_url,
      gtfs_resources: gtfs,
      gtfs_rt_resources: gtfs_rt,
      all_modes,
      all_features,
      has_gtfs_rt: gtfs_rt.length > 0,
      has_vehicle_positions: gtfs_rt.some((r) => r.has_vehicle_positions),
      has_trip_updates: gtfs_rt.some((r) => r.has_trip_updates),
      has_service_alerts: gtfs_rt.some((r) => r.has_service_alerts),
      has_shapes: gtfs.some((r) => r.has_shapes),
      has_trips_zero: gtfs.some((r) => r.trips_count_zero),
      worst_freshness: worstFreshness(gtfs),
    })
  }

  return results
}

export function extractFilterOptions(datasets: ProcessedDataset[]) {
  const publishers = [...new Set(datasets.map((d) => d.publisher_name))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  )
  const features = [...new Set(datasets.flatMap((d) => d.all_features))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  )
  const modes = [...new Set(datasets.flatMap((d) => d.all_modes))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  )
  const area_types = [...new Set(datasets.flatMap((d) => d.covered_area.map((a) => a.type)))].sort()

  return { publishers, features, modes, area_types }
}

const normalizeSearch = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export function applyFilters(datasets: ProcessedDataset[], filters: Filters): ProcessedDataset[] {
  const search = normalizeSearch(filters.search)

  return datasets.filter((d) => {
    if (search) {
      const haystack = normalizeSearch(d.title + ' ' + d.publisher_name)
      if (!haystack.includes(search)) return false
    }

    if (filters.publishers.length > 0 && !filters.publishers.includes(d.publisher_name))
      return false

    if (filters.features.length > 0) {
      const hasAll = filters.features.every((f) => d.all_features.includes(f))
      if (!hasAll) return false
    }

    if (filters.modes.length > 0) {
      const hasAny = filters.modes.some((m) => d.all_modes.includes(m))
      if (!hasAny) return false
    }

    if (filters.has_gtfs_rt === true && !d.has_gtfs_rt) return false
    if (filters.has_vehicle_positions === true && !d.has_vehicle_positions) return false
    if (filters.has_trip_updates === true && !d.has_trip_updates) return false
    if (filters.has_service_alerts === true && !d.has_service_alerts) return false
    if (filters.has_shapes === true && !d.has_shapes) return false
    if (filters.trips_zero_only && !d.has_trips_zero) return false

    if (filters.covered_area_types.length > 0) {
      const hasType = d.covered_area.some((a) => filters.covered_area_types.includes(a.type))
      if (!hasType) return false
    }

    return true
  })
}

export function exportToCsv(datasets: ProcessedDataset[]): void {
  const header = [
    'Titre',
    'Éditeur',
    'Licence',
    'Modes',
    'Features',
    'has_shapes',
    'start_date',
    'end_date',
    'Jours validité',
    'trips_count',
    'gtfs-rt',
    'trip_updates',
    'service_alerts',
    'vehicle_positions',
    'Zones',
    'URL',
  ]

  const rows = datasets.flatMap((d) =>
    d.gtfs_resources.map((g) => [
      d.title,
      d.publisher_name,
      d.licence,
      d.all_modes.join('|'),
      g.features.join('|'),
      String(g.has_shapes),
      g.start_date ?? '',
      g.end_date ?? '',
      g.validity_days != null ? String(g.validity_days) : '',
      g.trips_count >= 0 ? String(g.trips_count) : '',
      String(d.has_gtfs_rt),
      String(d.has_trip_updates),
      String(d.has_service_alerts),
      String(d.has_vehicle_positions),
      d.covered_area.map((a) => a.nom).join('|'),
      d.page_url,
    ]),
  )

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transport-gtfs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
