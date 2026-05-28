const MODE_LABELS: Record<string, string> = {
  bus: '🚌 Bus',
  rail: '🚆 Rail',
  tramway: '🚋 Tramway',
  subway: '🚇 Métro',
  ferry: '⛴ Ferry',
  air: '✈️ Aérien',
  cable_car: '🚡 Téléphérique',
  coach: '🚌 Car',
  funicular: '🚠 Funiculaire',
  gondola: '🚠 Gondole',
}

interface Props {
  mode: string
}

export function ModeChip({ mode }: Props) {
  return (
    <span className="chip chip--mode" title={mode}>
      {MODE_LABELS[mode] ?? mode}
    </span>
  )
}
