import type { Filters } from '../types'

const AREA_TYPE_LABELS: Record<string, string> = {
  commune: 'Commune',
  departement: 'Département',
  epci: 'EPCI',
  region: 'Région',
  pays: 'Pays',
}

const MODE_LABELS: Record<string, string> = {
  air: '✈️ Aérien',
  bus: '🚌 Bus',
  cable_car: '🚡 Téléphérique',
  coach: '🚌 Car',
  ferry: '⛴ Ferry',
  funicular: '🚠 Funiculaire',
  gondola: '🚠 Gondole',
  rail: '🚆 Rail',
  subway: '🚇 Métro',
  tramway: '🚋 Tramway',
}

interface FilterOptions {
  publishers: string[]
  features: string[]
  modes: string[]
  area_types: string[]
}

interface Props {
  filters: Filters
  options: FilterOptions
  onChange: (f: Filters) => void
  onReset: () => void
  activeCount: number
  totalCount: number
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (v: boolean | null) => void
}) {
  return (
    <label className="toggle-row">
      <span className="toggle-label">{label}</span>
      <button
        className={`toggle-btn ${value === true ? 'toggle-btn--on' : ''}`}
        onClick={() => onChange(value === true ? null : true)}
        type="button"
      >
        {value === true ? 'Oui ✓' : 'Tous'}
      </button>
    </label>
  )
}

function MultiCheck({
  label,
  options,
  selected,
  onChange,
  renderLabel,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  renderLabel?: (v: string) => string
}) {
  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
  }
  return (
    <div className="filter-group">
      <div className="filter-group__label">{label}</div>
      <div className="filter-group__options">
        {options.map((o) => (
          <label key={o} className="checkbox-row">
            <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} />
            <span>{renderLabel ? renderLabel(o) : o}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function FilterPanel({
  filters,
  options,
  onChange,
  onReset,
  activeCount,
  totalCount,
}: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <aside className="filter-panel">
      <div className="filter-panel__header">
        <span className="filter-panel__count">
          {activeCount} / {totalCount} résultats
        </span>
        <button className="btn btn--ghost" onClick={onReset} type="button">
          Réinitialiser
        </button>
      </div>

      {/* Recherche texte */}
      <div className="filter-group">
        <div className="filter-group__label">Recherche</div>
        <input
          className="filter-input"
          type="search"
          placeholder="Titre ou éditeur…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>

      {/* Toggles */}
      <div className="filter-group">
        <div className="filter-group__label">Données temps réel</div>
        <Toggle
          label="gtfs-rt disponible"
          value={filters.has_gtfs_rt}
          onChange={(v) => set('has_gtfs_rt', v)}
        />
        <Toggle
          label="Positions véhicules"
          value={filters.has_vehicle_positions}
          onChange={(v) => set('has_vehicle_positions', v)}
        />
        <Toggle
          label="has_shapes"
          value={filters.has_shapes}
          onChange={(v) => set('has_shapes', v)}
        />
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={filters.trips_zero_only}
            onChange={(e) => set('trips_zero_only', e.target.checked)}
          />
          <span>⚠ trips=0 uniquement</span>
        </label>
      </div>

      {/* Modes */}
      <MultiCheck
        label="Modes de transport"
        options={options.modes}
        selected={filters.modes}
        onChange={(v) => set('modes', v)}
        renderLabel={(m) => MODE_LABELS[m] ?? m}
      />

      {/* Features */}
      <MultiCheck
        label="Features GTFS"
        options={options.features}
        selected={filters.features}
        onChange={(v) => set('features', v)}
      />

      {/* Zone géographique */}
      <MultiCheck
        label="Échelon géographique"
        options={options.area_types}
        selected={filters.covered_area_types}
        onChange={(v) => set('covered_area_types', v)}
        renderLabel={(t) => AREA_TYPE_LABELS[t] ?? t}
      />

      {/* Publishers */}
      <div className="filter-group">
        <div className="filter-group__label">
          Éditeurs
          {filters.publishers.length > 0 && (
            <button className="btn btn--micro" onClick={() => set('publishers', [])} type="button">
              ✕ effacer
            </button>
          )}
        </div>
        <div className="filter-group__options filter-group__options--scroll">
          {options.publishers.map((p) => (
            <label key={p} className="checkbox-row">
              <input
                type="checkbox"
                checked={filters.publishers.includes(p)}
                onChange={() =>
                  set(
                    'publishers',
                    filters.publishers.includes(p)
                      ? filters.publishers.filter((x) => x !== p)
                      : [...filters.publishers, p],
                  )
                }
              />
              <span title={p}>{p}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}
