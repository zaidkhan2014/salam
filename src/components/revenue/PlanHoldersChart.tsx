import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AdminPlanHoldersResponse } from '@/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactNumber, formatNumber } from '@/utils/format'

const LINE_COLORS = ['#0f172a', '#1d4ed8', '#0f766e', '#b45309', '#be123c', '#7c3aed']
const TOP_N = 6

interface PlanHoldersChartProps {
  data: AdminPlanHoldersResponse
}

function productLabel(plan: AdminPlanHoldersResponse['plans'][number]): string {
  if (plan.iosProductId || plan.androidProductId) {
    return [plan.iosProductId, plan.androidProductId].filter(Boolean).join(' / ')
  }
  if (plan.productId) return plan.productId
  return plan.planId
}

export function PlanHoldersChart({ data }: PlanHoldersChartProps) {
  const plans = [...(data.plans ?? [])].sort((a, b) => b.count - a.count).slice(0, TOP_N)
  const buckets = plans[0]?.series?.map((point) => point.bucket) ?? []
  const chartData = buckets.map((bucket, index) => {
    const row: Record<string, string | number> = { bucket }
    for (const plan of plans) {
      const key = plan.planId
      row[key] = plan.series[index]?.count ?? 0
    }
    return row
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan holders</CardTitle>
        <p className="text-xs text-slate-500">
          Source {data.source} · {formatCompactNumber(data.totalUsers)} users · top {TOP_N} by holder
          count · {data.granularity?.toLowerCase?.() ?? 'daily'} series
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(data.totalUsers)} holders</p>
        {!chartData.length ? (
          <p className="text-sm text-slate-500">
            No plan-holder time series in this range (all-time mode has empty series).
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(value) => formatNumber(typeof value === 'number' ? value : Number(value))} />
                <Legend />
                {plans.map((plan, index) => (
                  <Line
                    key={plan.planId}
                    type="monotone"
                    dataKey={plan.planId}
                    name={plan.planName || plan.planId}
                    stroke={LINE_COLORS[index % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {data.plans?.length ? (
          <ul className="space-y-2 border-t border-slate-100 pt-3">
            {data.plans.map((plan) => (
              <li key={plan.planId} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 text-slate-600">
                  <span className="font-medium text-slate-800">{plan.planName || plan.planId}</span>
                  {plan.billingPeriod ? (
                    <span className="text-slate-400"> · {plan.billingPeriod}</span>
                  ) : null}
                  <span className="mt-0.5 block truncate text-xs text-slate-400">
                    {productLabel(plan)}
                  </span>
                </span>
                <span className="shrink-0 font-medium text-slate-900">
                  {formatNumber(plan.count)} ({formatNumber(plan.sharePercent)}%)
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
