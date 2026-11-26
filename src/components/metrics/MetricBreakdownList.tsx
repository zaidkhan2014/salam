import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminMetricCard } from '@/api/types'
import { formatNumber } from '@/utils/format'
import { formatBreakdownKey, formatMetricTitle, isPlatformBreakdown } from '@/utils/metricLabels'

export function MetricBreakdownList({ metric }: { metric: AdminMetricCard }) {
  if (!metric.breakdown.length) {
    return null
  }

  const chartData = metric.breakdown.map((item) => ({
    key: item.key,
    label: formatBreakdownKey(item.key),
    value: item.value,
  }))
  const showPlatformBar = isPlatformBreakdown(metric.breakdown.map((item) => item.key))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{`${formatMetricTitle(metric.key)} breakdown`}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPlatformBar ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={72} />
                <Tooltip
                  formatter={(value) => formatNumber(typeof value === 'number' ? value : Number(value))}
                />
                <Bar dataKey="value" fill="#0f172a" name="Count" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
        <ul className="space-y-2">
          {chartData.map((item) => (
            <li key={`${metric.key}-${item.key}`} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-medium text-slate-900">{formatNumber(item.value)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
