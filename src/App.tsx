import { useState, useMemo, useEffect, useRef } from 'react'
import './App.scss'
import { useDataLoader } from './hooks/useDataLoader'
import { FilterPanel } from './components/FilterPanel'
import { DatasetList } from './components/DatasetList'
import { TableView } from './components/TableView'
import { StatsView } from './components/StatsView'
import { ViewSwitcher } from './components/ViewSwitcher'
import { ThemeToggle } from './components/ThemeToggle'
import { AboutModal } from './components/AboutModal'
import type { ViewMode } from './components/ViewSwitcher'
import { applyFilters, extractFilterOptions } from './utils/transform'
import type { Filters } from './types'

function formatFetchedAt(date: Date): string {
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  publishers: [],
  features: [],
  modes: [],
  has_gtfs_rt: null,
  has_vehicle_positions: null,
  has_trip_updates: null,
  has_service_alerts: null,
  has_shapes: null,
  trips_zero_only: false,
  covered_area_types: [],
}

function App() {
  const { state, datasets, error, progress, fetchedAt, isStale, reload } = useDataLoader()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [view, setView] = useState<ViewMode>('cards')
  const [isDark, setIsDark] = useState(true)
  const [aboutOpen, setAboutOpen] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark)
  }, [isDark])

  // Measure actual header height and set --header-h CSS var
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => {
      document.documentElement.style.setProperty('--c-header-h', `${el.offsetHeight}px`)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const options = useMemo(() => extractFilterOptions(datasets), [datasets])
  const filtered = useMemo(() => applyFilters(datasets, filters), [datasets, filters])

  const handleFilterChange = (f: Filters) => {
    setFilters(f)
    setPage(1)
  }

  const isDataVisible = state === 'success' || state === 'refreshing'

  return (
    <div className="app">
      <header className="app-header" ref={headerRef}>
        <div className="app-header__inner">
          <div className="app-header__title">
            <h1>🚌 Transport Open Data Explorer</h1>
            <p>
              Données GTFS —{' '}
              <a href="https://transport.data.gouv.fr" target="_blank" rel="noreferrer">
                transport.data.gouv.fr
              </a>
            </p>
          </div>

          {(state === 'idle' || state === 'loading') && (
            <div className="load-zone">
              <span className="spinner" />
              <span className="loading-label">
                {progress !== null ? `Téléchargement… ${progress}%` : 'Chargement…'}
              </span>
              {progress !== null && (
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}

          {state === 'error' && (
            <div className="load-zone">
              <span className="error-msg">❌ {error}</span>
              <button className="btn btn--primary btn--sm" onClick={reload} type="button">
                Réessayer
              </button>
            </div>
          )}

          {isDataVisible && (
            <div className="load-zone">
              <div className="cache-info">
                {fetchedAt && (
                  <span className={`source-badge${isStale ? ' source-badge--stale' : ''}`}>
                    {isStale ? '⚠️' : '✅'} Données du {formatFetchedAt(fetchedAt)}
                  </span>
                )}
                {state === 'refreshing' && (
                  <span className="refresh-indicator">
                    <span className="spinner spinner--xs" /> Mise à jour…
                  </span>
                )}
              </div>
              <ViewSwitcher view={view} onChange={setView} />
              <button className="btn btn--ghost btn--sm" onClick={reload} type="button">
                ↺ Recharger
              </button>
            </div>
          )}

          <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
          <button
            className="btn btn--ghost btn--sm about-btn"
            onClick={() => setAboutOpen(true)}
            type="button"
            aria-label="À propos"
            title="À propos"
          >
            ℹ︎
          </button>
        </div>
      </header>

      {isDataVisible && (
        <div className="app-body">
          <FilterPanel
            filters={filters}
            options={options}
            onChange={handleFilterChange}
            onReset={() => {
              setFilters(DEFAULT_FILTERS)
              setPage(1)
            }}
            activeCount={filtered.length}
            totalCount={datasets.length}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />
          <main className="app-main">
            <button
              className="filter-toggle-btn"
              onClick={() => setFilterOpen(true)}
              type="button"
            >
              ☰ Filtres ({filtered.length}/{datasets.length})
            </button>
            {view === 'cards' && (
              <DatasetList datasets={filtered} page={page} onPageChange={setPage} />
            )}
            {view === 'table' && <TableView datasets={filtered} />}
            {view === 'stats' && <StatsView datasets={filtered} isDark={isDark} />}
          </main>
        </div>
      )}

      {(state === 'idle' || state === 'loading') && (
        <div className="app-loading">
          <div className="loading-card">
            <div className="loading-card__icon">🚆</div>
            <h2>Chargement des données…</h2>
            {progress !== null ? (
              <>
                <div className="loading-card__progress-bar">
                  <div
                    className="loading-card__progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="loading-card__pct">{progress}%</p>
              </>
            ) : (
              <div className="loading-card__spinner">
                <span className="spinner spinner--lg" />
              </div>
            )}
          </div>
        </div>
      )}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  )
}

export default App
