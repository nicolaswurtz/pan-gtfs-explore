import type { ProcessedGtfsResource, ProcessedGtfsRtResource } from '../types'
import { FreshnessBadge } from './FreshnessBadge'
import { ModeChip } from './ModeChip'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface GtfsResourceRowProps {
  resource: ProcessedGtfsResource
}

function GtfsResourceRow({ resource: r }: GtfsResourceRowProps) {
  return (
    <div className="gtfs-resource">
      <div className="gtfs-resource__header">
        <a href={r.page_url} target="_blank" rel="noreferrer" className="gtfs-resource__title">
          {r.title}
        </a>
        <FreshnessBadge freshness={r.freshness} />
        {r.trips_count_zero && (
          <span className="badge badge--warning" title="Aucun trajet dans ce fichier GTFS">
            ⚠ trips=0
          </span>
        )}
        {r.has_shapes && <span className="badge badge--info">🗺 shapes</span>}
      </div>

      <div className="gtfs-resource__modes">
        {r.modes.map((m) => (
          <ModeChip key={m} mode={m} />
        ))}
      </div>

      <div className="gtfs-resource__dates">
        <span className="date-range">
          {formatDate(r.start_date)} → {formatDate(r.end_date)}
          {r.validity_days != null && <span className="validity-days"> ({r.validity_days} j)</span>}
        </span>
      </div>

      <div className="gtfs-resource__features">
        {r.features.map((f) => (
          <span key={f} className="chip chip--feature">
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

interface GtfsRtRowProps {
  resource: ProcessedGtfsRtResource
}

function GtfsRtRow({ resource: r }: GtfsRtRowProps) {
  return (
    <div className="gtfsrt-resource">
      <a href={r.page_url} target="_blank" rel="noreferrer" className="gtfsrt-resource__title">
        {r.title}
      </a>
      <div className="gtfsrt-resource__features">
        <span className={`rtbadge ${r.has_trip_updates ? 'rtbadge--on' : 'rtbadge--off'}`}>
          🕒 Horaires TR
        </span>
        <span className={`rtbadge ${r.has_service_alerts ? 'rtbadge--on' : 'rtbadge--off'}`}>
          📢 Alertes
        </span>
        <span className={`rtbadge ${r.has_vehicle_positions ? 'rtbadge--on' : 'rtbadge--off'}`}>
          📍 Positions
        </span>
      </div>
    </div>
  )
}

interface Props {
  title: string
  publisher_name: string
  page_url: string
  gtfs_resources: ProcessedGtfsResource[]
  gtfs_rt_resources: ProcessedGtfsRtResource[]
}

export function DatasetCard({
  title,
  publisher_name,
  page_url,
  gtfs_resources,
  gtfs_rt_resources,
}: Props) {
  return (
    <div className="dataset-card">
      <div className="dataset-card__header">
        <div className="dataset-card__title-block">
          <a href={page_url} target="_blank" rel="noreferrer" className="dataset-card__title">
            {title}
          </a>
          <span className="dataset-card__publisher">{publisher_name}</span>
        </div>
        <div className="dataset-card__badges">
          {gtfs_resources.some((r) => r.trips_count_zero) && (
            <span className="badge badge--warning">⚠ trips=0</span>
          )}
          {gtfs_rt_resources.length > 0 && <span className="badge badge--rt">⚡ gtfs-rt</span>}
        </div>
      </div>

      <div className="dataset-card__gtfs">
        {gtfs_resources.map((r) => (
          <GtfsResourceRow key={r.id} resource={r} />
        ))}
      </div>

      {gtfs_rt_resources.length > 0 && (
        <div className="dataset-card__gtfs-rt">
          <div className="section-label">Temps réel</div>
          {gtfs_rt_resources.map((r) => (
            <GtfsRtRow key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  )
}
