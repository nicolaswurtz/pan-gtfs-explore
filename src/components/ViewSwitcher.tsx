type ViewMode = 'cards' | 'table' | 'stats'

interface Props {
  view: ViewMode
  onChange: (v: ViewMode) => void
}

const VIEWS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'cards', label: 'Cartes', icon: '▦' },
  { id: 'table', label: 'Tableau', icon: '≡' },
  { id: 'stats', label: 'Statistiques', icon: '◎' },
]

export function ViewSwitcher({ view, onChange }: Props) {
  return (
    <div className="view-switcher">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          className={`view-switcher__btn ${view === v.id ? 'view-switcher__btn--active' : ''}`}
          onClick={() => onChange(v.id)}
        >
          <span className="view-switcher__icon">{v.icon}</span>
          {v.label}
        </button>
      ))}
    </div>
  )
}

export type { ViewMode }
