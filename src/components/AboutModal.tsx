interface Props {
  onClose: () => void
}

export function AboutModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal aria-label="À propos">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} type="button" aria-label="Fermer">
          ✕
        </button>

        <div className="modal__icon">🚌</div>
        <h2 className="modal__title">Transport Open Data Explorer</h2>
        <p className="modal__subtitle">
          Exploration des données GTFS publiées sur{' '}
          <a href="https://transport.data.gouv.fr" target="_blank" rel="noreferrer">
            transport.data.gouv.fr
          </a>
        </p>

        <ul className="modal__features">
          <li>✅ Filtres par mode, features, éditeur, zone géographique</li>
          <li>✅ Indicateur de fraîcheur (valide / expire bientôt / expiré)</li>
          <li>✅ Détection des flux gtfs-rt (positions, alertes, horaires TR)</li>
          <li>✅ Export CSV des résultats filtrés</li>
          <li>✅ Cache local automatique (mise à jour toutes les 24h)</li>
        </ul>

        <div className="modal__footer">
          <span className="modal__copyright">© Nicolas Wurtz</span>
          <a
            href="https://github.com/nicolaswurtz/pan-gtfs-explore"
            target="_blank"
            rel="noreferrer"
            className="modal__github"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
          <button className="btn btn--primary btn--sm modal__cta" onClick={onClose} type="button">
            Explorer les données →
          </button>
        </div>
      </div>
    </div>
  )
}
