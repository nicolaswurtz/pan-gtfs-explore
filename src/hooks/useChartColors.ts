import { useMemo } from 'react'

/**
 * Returns chart styling objects that adapt to the current theme
 * by reading CSS custom properties from :root.
 */
export function useChartColors(isDark: boolean) {
  return useMemo(() => {
    const chartText = isDark ? '#e2e4f0' : '#1f2937'
    const chartTextMuted = isDark ? '#8b91b0' : '#6b7280'
    const tooltipBg = isDark ? '#1a1d27' : '#ffffff'
    const tooltipBorder = isDark ? '#2e3248' : '#e5e7eb'
    const tooltipText = isDark ? '#e2e4f0' : '#1f2937'

    const tooltipStyle: React.CSSProperties = {
      backgroundColor: tooltipBg,
      border: `1px solid ${tooltipBorder}`,
      borderRadius: 6,
      color: tooltipText,
      fontSize: 12,
    }

    const axisTickText = { fill: chartText, fontSize: 11 }
    const axisTickMuted = { fill: chartTextMuted, fontSize: 11 }
    const legendStyle = { fontSize: 12, color: chartText }

    return { chartText, chartTextMuted, tooltipStyle, axisTickText, axisTickMuted, legendStyle }
  }, [isDark])
}
