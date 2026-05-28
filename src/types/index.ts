export interface Publisher {
  id: string
  name: string
  type: string
}

export interface CoveredArea {
  type: 'commune' | 'departement' | 'epci' | 'region' | 'pays'
  nom: string
  insee?: string
}

export interface ResourceStats {
  trips_count: number
  routes_count?: number
  stop_points_count?: number
  stops_count?: number
  routes_with_custom_color_count?: number
  trips_with_shape_count?: number
  [key: string]: number | undefined
}

export interface Metadata {
  start_date?: string
  end_date?: string
  has_shapes?: boolean
  has_fares?: boolean
  modes?: string[]
  networks?: string[]
  stats?: ResourceStats
  validator_version?: string
  [key: string]: unknown
}

export interface Resource {
  id: number
  datagouv_id: string
  format: string
  title: string
  is_available: boolean
  features?: string[]
  metadata?: Metadata
  modes?: string[]
  original_url: string
  page_url: string
  url: string
  updated: string
  type: string
}

export interface Dataset {
  id: string
  datagouv_id: string
  title: string
  publisher: Publisher
  resources: Resource[]
  covered_area: CoveredArea[]
  licence: string
  created_at: string
  updated: string
  page_url: string
  slug: string
  type: string
}

// Processed types
export type FreshnessStatus = 'valid' | 'expiring' | 'expired'

export interface ProcessedGtfsResource {
  id: number
  title: string
  features: string[]
  has_shapes: boolean
  modes: string[]
  start_date: string | null
  end_date: string | null
  validity_days: number | null
  trips_count: number
  trips_count_zero: boolean
  freshness: FreshnessStatus
  page_url: string
  url: string
  updated: string
}

export interface ProcessedGtfsRtResource {
  id: number
  title: string
  has_trip_updates: boolean
  has_service_alerts: boolean
  has_vehicle_positions: boolean
  page_url: string
  updated: string
}

export interface ProcessedDataset {
  id: string
  title: string
  publisher_name: string
  licence: string
  covered_area: CoveredArea[]
  page_url: string
  gtfs_resources: ProcessedGtfsResource[]
  gtfs_rt_resources: ProcessedGtfsRtResource[]
  all_modes: string[]
  all_features: string[]
  has_gtfs_rt: boolean
  has_vehicle_positions: boolean
  has_trip_updates: boolean
  has_service_alerts: boolean
  has_shapes: boolean
  has_trips_zero: boolean
  worst_freshness: FreshnessStatus
}

export interface Filters {
  search: string
  publishers: string[]
  features: string[]
  modes: string[]
  has_gtfs_rt: boolean | null
  has_vehicle_positions: boolean | null
  has_trip_updates: boolean | null
  has_service_alerts: boolean | null
  has_shapes: boolean | null
  trips_zero_only: boolean
  covered_area_types: string[]
}
