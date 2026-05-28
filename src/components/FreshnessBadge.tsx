import type { FreshnessStatus } from '../types'

const FRESHNESS_LABELS: Record<FreshnessStatus, string> = {
  valid: 'Valide',
  expiring: 'Expire bientôt',
  expired: 'Expiré',
}

const FRESHNESS_STYLES: Record<FreshnessStatus, string> = {
  valid: 'badge badge--valid',
  expiring: 'badge badge--expiring',
  expired: 'badge badge--expired',
}

interface Props {
  freshness: FreshnessStatus
}

export function FreshnessBadge({ freshness }: Props) {
  return <span className={FRESHNESS_STYLES[freshness]}>{FRESHNESS_LABELS[freshness]}</span>
}
