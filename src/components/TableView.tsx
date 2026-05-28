import { useState, useMemo } from 'react'
import type { ProcessedDataset, FreshnessStatus } from '../types'
import { exportToCsv } from '../utils/transform'

type SortKey =
  | 'title'
  | 'publisher'
  | 'modes'
  | 'features_count'
  | 'freshness'
  | 'end_date'
  | 'validity_days'
  | 'gtfs_rt'
  | 'has_shapes'

type SortDir = 'asc' | 'desc'

const FRESHNESS_ORDER: Record<FreshnessStatus, number> = { expired: 0, expiring: 1, valid: 2 }
const FRESHNESS_ICON: Record<FreshnessStatus, string> = {
  valid: '🟢',
  expiring: '🟡',
  expired: '🔴',
}

const MODE_EMOJI: Record<string, string> = {
  bus: '🚌',
  rail: '🚆',
  tramway: '🚋',
  subway: '🚇',
  ferry: '⛴',
  air: '✈️',
  cable_car: '🚡',
  coach: '🚌',
  funicular: '🚠',
  gondola: '🚠',
}

function formatDateShort(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

interface ColProps {
  label: string
  col: SortKey
  current: SortKey
  dir: SortDir
  onClick: (k: SortKey) => void
  title?: string
}

function Th({ label, col, current, dir, onClick, title }: ColProps) {
  const active = current === col
  return (
    <th
      className={`th-sortable ${active ? 'th-sortable--active' : ''}`}
      onClick={() => onClick(col)}
      title={title}
    >
      {label}
      <span className="sort-arrow">{active ? (dir === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}</span>
    </th>
  )
}

interface Props {
  datasets: ProcessedDataset[]
}

export function TableView({ datasets }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    const mult = sortDir === 'asc' ? 1 : -1
    return [...datasets].sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return mult * a.title.localeCompare(b.title, 'fr')
        case 'publisher':
          return mult * a.publisher_name.localeCompare(b.publisher_name, 'fr')
        case 'modes':
          return mult * a.all_modes.length - mult * b.all_modes.length
        case 'features_count':
          return mult * a.all_features.length - mult * b.all_features.length
        case 'freshness': {
          const aw = FRESHNESS_ORDER[a.worst_freshness]
          const bw = FRESHNESS_ORDER[b.worst_freshness]
          return mult * (aw - bw)
        }
        case 'end_date': {
          const ae =
            a.gtfs_resources
              .map((r) => r.end_date ?? '')
              .sort()
              .pop() ?? ''
          const be =
            b.gtfs_resources
              .map((r) => r.end_date ?? '')
              .sort()
              .pop() ?? ''
          return mult * ae.localeCompare(be)
        }
        case 'validity_days': {
          const av = Math.max(...a.gtfs_resources.map((r) => r.validity_days ?? 0))
          const bv = Math.max(...b.gtfs_resources.map((r) => r.validity_days ?? 0))
          return mult * (av - bv)
        }
        case 'gtfs_rt':
          return mult * (Number(a.has_gtfs_rt) - Number(b.has_gtfs_rt))
        case 'has_shapes':
          return mult * (Number(a.has_shapes) - Number(b.has_shapes))
        default:
          return 0
      }
    })
  }, [datasets, sortKey, sortDir])

  const thProps = { current: sortKey, dir: sortDir, onClick: handleSort }

  return (
    <div className="table-view">
      <div className="dataset-list__toolbar">
        <span className="dataset-list__info">
          {datasets.length} transporteur{datasets.length > 1 ? 's' : ''}
        </span>
        {datasets.length > 0 && (
          <button className="btn btn--outline" onClick={() => exportToCsv(datasets)} type="button">
            ⬇ Export CSV
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="condensed-table">
          <thead>
            <tr>
              <Th label="Transporteur" col="title" {...thProps} />
              <Th label="Éditeur" col="publisher" {...thProps} />
              <Th label="Modes" col="modes" {...thProps} title="Triez par nombre de modes" />
              <Th
                label="Features"
                col="features_count"
                {...thProps}
                title="Nombre de features GTFS"
              />
              <Th label="Shapes" col="has_shapes" {...thProps} />
              <Th label="RT" col="gtfs_rt" {...thProps} title="GTFS-RT disponible" />
              <Th label="État" col="freshness" {...thProps} title="Fraîcheur des données" />
              <Th label="Fin validité" col="end_date" {...thProps} />
              <Th label="Jours" col="validity_days" {...thProps} title="Durée de validité max" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => {
              const maxValidity = Math.max(...d.gtfs_resources.map((r) => r.validity_days ?? 0))
              const latestEnd =
                d.gtfs_resources
                  .map((r) => r.end_date)
                  .filter(Boolean)
                  .sort()
                  .pop() ?? null
              const hasTripsZero = d.has_trips_zero

              return (
                <tr
                  key={d.id}
                  className={`condensed-row ${hasTripsZero ? 'condensed-row--warn' : ''}`}
                >
                  <td className="td-title">
                    <a href={d.page_url} target="_blank" rel="noreferrer" title={d.title}>
                      {d.title}
                    </a>
                    {hasTripsZero && (
                      <span className="inline-warn" title="trips_count = 0">
                        {' '}
                        ⚠
                      </span>
                    )}
                    {d.gtfs_resources.length > 1 && (
                      <span className="multi-badge" title={`${d.gtfs_resources.length} flux GTFS`}>
                        ×{d.gtfs_resources.length}
                      </span>
                    )}
                  </td>
                  <td className="td-publisher" title={d.publisher_name}>
                    {d.publisher_name}
                  </td>
                  <td className="td-modes">
                    {d.all_modes.map((m) => (
                      <span key={m} title={m}>
                        {MODE_EMOJI[m] ?? m}
                      </span>
                    ))}
                  </td>
                  <td className="td-features">
                    <span className="features-count">{d.all_features.length}</span>
                    <span className="features-list" title={d.all_features.join(', ')}>
                      {d.all_features.slice(0, 3).map((f) => (
                        <span key={f} className="chip chip--feature chip--xs">
                          {f}
                        </span>
                      ))}
                      {d.all_features.length > 3 && (
                        <span className="chip chip--feature chip--xs">
                          +{d.all_features.length - 3}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="td-bool">
                    {d.has_shapes ? (
                      <span className="bool-yes">✓</span>
                    ) : (
                      <span className="bool-no">—</span>
                    )}
                  </td>
                  <td className="td-rt">
                    {d.has_gtfs_rt ? (
                      <span className="rt-icons">
                        <span
                          title="Horaires TR"
                          className={d.has_trip_updates ? 'rt-icon--on' : 'rt-icon--off'}
                        >
                          🕒
                        </span>
                        <span
                          title="Alertes"
                          className={d.has_service_alerts ? 'rt-icon--on' : 'rt-icon--off'}
                        >
                          📢
                        </span>
                        <span
                          title="Positions"
                          className={d.has_vehicle_positions ? 'rt-icon--on' : 'rt-icon--off'}
                        >
                          📍
                        </span>
                      </span>
                    ) : (
                      <span className="bool-no">—</span>
                    )}
                  </td>
                  <td className="td-freshness">{FRESHNESS_ICON[d.worst_freshness]}</td>
                  <td className="td-date">{formatDateShort(latestEnd)}</td>
                  <td className="td-days">
                    {maxValidity > 0 ? (
                      <span className={maxValidity < 30 ? 'days-warn' : ''}>{maxValidity}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
