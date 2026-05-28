interface Props {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: Props) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      <span>{isDark ? '🌙' : '☀️'}</span>
      <div className={`theme-toggle__track ${isDark ? '' : 'theme-toggle__track--on'}`}>
        <div className="theme-toggle__thumb" />
      </div>
      <span>{isDark ? 'Sombre' : 'Clair'}</span>
    </button>
  )
}
