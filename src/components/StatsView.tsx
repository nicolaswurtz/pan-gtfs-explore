import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import type { ProcessedDataset } from '../types'
import { useChartColors } from '../hooks/useChartColors'

const PALETTE = [
  '#4f8ef7',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#818cf8',
  '#38bdf8',
  '#f472b6',
  '#a3e635',
  '#fb923c',
  '#34d399',
]

const FRESHNESS_COLORS = {
  Valide: '#22c55e',
  'Expire bientôt': '#f59e0b',
  Expiré: '#ef4444',
}

const MODE_LABELS: Record<string, string> = {
  bus: '🚌 Bus',
  rail: '🚆 Rail',
  tramway: '🚋 Tramway',
  subway: '🚇 Métro',
  ferry: '⛴ Ferry',
  air: '✈️ Air',
  cable_car: '🚡 Téléphérique',
  coach: '🚌 Car',
  funicular: '🚠 Funi',
  gondola: '🚠 Gondole',
}

const AREA_LABELS: Record<string, string> = {
  commune: 'Commune',
  departement: 'Département',
  epci: 'EPCI',
  region: 'Région',
  pays: 'Pays',
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
}

function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__value" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  )
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
  height?: number
}

function ChartCard({ title, children, height = 260 }: ChartCardProps) {
  return (
    <div className="chart-card">
      <div className="chart-card__title">{title}</div>
      <div style={{ height }}>{children}</div>
    </div>
  )
}

interface Props {
  datasets: ProcessedDataset[]
  isDark: boolean
}

export function StatsView({ datasets, isDark }: Props) {
  const { chartTextMuted, tooltipStyle, axisTickText, axisTickMuted, legendStyle } = useChartColors(isDark)
  if (datasets.length === 0) {
    return <div className="stats-empty">Aucune donnée à afficher — modifiez les filtres.</div>
  }

  const total = datasets.length
  const withRt = datasets.filter((d) => d.has_gtfs_rt).length
  const withPositions = datasets.filter((d) => d.has_vehicle_positions).length
  const withAlerts = datasets.filter((d) => d.has_service_alerts).length
  const withShapes = datasets.filter((d) => d.has_shapes).length
  const withTripsZero = datasets.filter((d) => d.has_trips_zero).length
  const expired = datasets.filter((d) => d.worst_freshness === 'expired').length
  const expiring = datasets.filter((d) => d.worst_freshness === 'expiring').length

  // Modes distribution
  const modeCounts: Record<string, number> = {}
  datasets.forEach((d) =>
    d.all_modes.forEach((m) => {
      modeCounts[m] = (modeCounts[m] ?? 0) + 1
    }),
  )
  const modeData = Object.entries(modeCounts)
    .map(([k, v]) => ({ name: MODE_LABELS[k] ?? k, value: v }))
    .sort((a, b) => b.value - a.value)

  // Features distribution
  const featureCounts: Record<string, number> = {}
  datasets.forEach((d) =>
    d.all_features.forEach((f) => {
      featureCounts[f] = (featureCounts[f] ?? 0) + 1
    }),
  )
  const featureData = Object.entries(featureCounts)
    .map(([k, v]) => ({ name: k, value: v, pct: Math.round((v / total) * 100) }))
    .sort((a, b) => b.value - a.value)

  // Freshness pie
  const freshnessData = [
    { name: 'Valide', value: total - expiring - expired },
    { name: 'Expire bientôt', value: expiring },
    { name: 'Expiré', value: expired },
  ].filter((d) => d.value > 0)

  // RT breakdown pie
  const rtData = [
    {
      name: '⚡ RT complet (3/3)',
      value: datasets.filter(
        (d) => d.has_trip_updates && d.has_service_alerts && d.has_vehicle_positions,
      ).length,
    },
    {
      name: '⚡ RT partiel',
      value: datasets.filter(
        (d) =>
          d.has_gtfs_rt && !(d.has_trip_updates && d.has_service_alerts && d.has_vehicle_positions),
      ).length,
    },
    { name: 'Pas de RT', value: total - withRt },
  ].filter((d) => d.value > 0)

  // Top publishers
  const pubCounts: Record<string, number> = {}
  datasets.forEach((d) => {
    pubCounts[d.publisher_name] = (pubCounts[d.publisher_name] ?? 0) + 1
  })
  const pubData = Object.entries(pubCounts)
    .map(([k, v]) => ({ name: k, value: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12)

  // Geographic distribution
  const areaCounts: Record<string, number> = {}
  datasets.forEach((d) =>
    d.covered_area.forEach((a) => {
      areaCounts[a.type] = (areaCounts[a.type] ?? 0) + 1
    }),
  )
  const areaData = Object.entries(areaCounts)
    .map(([k, v]) => ({ name: AREA_LABELS[k] ?? k, value: v }))
    .sort((a, b) => b.value - a.value)

  // GTFS resources count distribution
  const multiGtfsData = [
    { name: '1 flux', value: datasets.filter((d) => d.gtfs_resources.length === 1).length },
    { name: '2 flux', value: datasets.filter((d) => d.gtfs_resources.length === 2).length },
    { name: '3+ flux', value: datasets.filter((d) => d.gtfs_resources.length >= 3).length },
  ].filter((d) => d.value > 0)

  return (
    <div className="stats-view">
      {/* KPIs */}
      <div className="stats-kpis">
        <StatCard label="Transporteurs GTFS" value={total} />
        <StatCard
          label="Avec gtfs-rt"
          value={withRt}
          sub={`${Math.round((withRt / total) * 100)}%`}
          color="#818cf8"
        />
        <StatCard
          label="Positions temps réel"
          value={withPositions}
          sub={`${Math.round((withPositions / total) * 100)}%`}
          color="#38bdf8"
        />
        <StatCard
          label="Alertes service"
          value={withAlerts}
          sub={`${Math.round((withAlerts / total) * 100)}%`}
          color="#f472b6"
        />
        <StatCard
          label="has_shapes"
          value={withShapes}
          sub={`${Math.round((withShapes / total) * 100)}%`}
          color="#22c55e"
        />
        <StatCard
          label="Données expirées"
          value={expired}
          sub={`${Math.round((expired / total) * 100)}%`}
          color="#ef4444"
        />
        <StatCard label="⚠ trips_count=0" value={withTripsZero} color="#f59e0b" />
        <StatCard
          label="Flux GTFS total"
          value={datasets.reduce((s, d) => s + d.gtfs_resources.length, 0)}
        />
      </div>

      {/* Charts grid */}
      <div className="stats-grid">
        <ChartCard title="Répartition par mode de transport">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={modeData}
              layout="vertical"
              margin={{ left: 10, right: 30, top: 4, bottom: 4 }}
            >
              <XAxis type="number" tick={axisTickMuted} />
              <YAxis
                type="category"
                dataKey="name"
                tick={axisTickText}
                width={130}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" name="Datasets" radius={[0, 4, 4, 0]}>
                {modeData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fraîcheur des données">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={freshnessData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                label={({ percent }) => (percent != null ? `${Math.round(percent * 100)}%` : '')}
                labelLine={false}
              >
                {freshnessData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={FRESHNESS_COLORS[entry.name as keyof typeof FRESHNESS_COLORS] ?? '#888'}
                  />
                ))}
              </Pie>
              <Legend iconType="circle" wrapperStyle={legendStyle} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Couverture GTFS-RT">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rtData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {rtData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i]} />
                ))}
              </Pie>
              <Legend iconType="circle" wrapperStyle={legendStyle} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Présence des features GTFS"
          height={Math.max(260, featureData.length * 24 + 20)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={featureData}
              layout="vertical"
              margin={{ left: 10, right: 50, top: 4, bottom: 4 }}
            >
              <XAxis type="number" tick={axisTickMuted} domain={[0, total]} />
              <YAxis
                type="category"
                dataKey="name"
                tick={axisTickText}
                width={200}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v} (${Math.round((Number(v) / total) * 100)}%)`, 'Datasets']}
              />
              <Bar
                dataKey="value"
                name="Datasets"
                fill="#4f8ef7"
                radius={[0, 4, 4, 0]}
                label={{
                  position: 'right',
                  fill: chartTextMuted,
                  fontSize: 11,
                  formatter: (v: unknown) => `${Math.round((Number(v) / total) * 100)}%`,
                }}
              ></Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top éditeurs (par nombre de datasets)"
          height={Math.max(260, pubData.length * 26 + 20)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pubData}
              layout="vertical"
              margin={{ left: 10, right: 40, top: 4, bottom: 4 }}
            >
              <XAxis type="number" tick={axisTickMuted} />
              <YAxis
                type="category"
                dataKey="name"
                tick={axisTickText}
                width={200}
                tickFormatter={(s) => (s.length > 28 ? s.slice(0, 27) + '…' : s)}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                name="Datasets"
                fill="#818cf8"
                radius={[0, 4, 4, 0]}
                label={{ position: 'right', fill: chartTextMuted, fontSize: 11 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Répartition géographique">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={areaData} margin={{ left: 10, right: 30, top: 4, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ ...axisTickText, fontSize: 12 }} />
              <YAxis tick={axisTickMuted} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" name="Datasets" radius={[4, 4, 0, 0]}>
                {areaData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Nombre de flux GTFS par dataset">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={multiGtfsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {multiGtfsData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i]} />
                ))}
              </Pie>
              <Legend iconType="circle" wrapperStyle={legendStyle} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
