import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AdminPlanHoldersResponse } from '@/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactNumber, formatNumber } from '@/utils/format'

interface PlanHoldersChartProps {
  data: AdminPlanHoldersResponse
}

export function PlanHoldersChart({ data }: PlanHoldersChartProps) {
  const plans = data.plans ?? []
  const chartData = plans.map((plan) => ({
    name: plan.planName || plan.planId,
    count: plan.count,
    sharePercent: plan.sharePercent,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan holders</CardTitle>
        <p className="text-xs text-slate-500">
          Source {data.source} · {formatCompactNumber(data.totalUsers)} users · ranked by holder count
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(data.totalUsers)} holders</p>
        {!chartData.length ? (
          <p className="text-sm text-slate-500">No plan holders in this range.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <Tooltip
                  formatter={(value, name) => {
                    const n = typeof value === 'number' ? value : Number(value)
                    if (name === 'count') return [formatNumber(n), 'Holders']
                    return [`${formatNumber(n)}%`, 'Share']
                  }}
                />
                <Bar dataKey="count" fill="#0f172a" name="count" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {plans.length ? (
          <ul className="space-y-2 border-t border-slate-100 pt-3">
            {plans.map((plan) => (
              <li key={plan.planId} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-slate-600">
                  {plan.planName || plan.planId}
                  {plan.billingPeriod ? (
                    <span className="text-slate-400"> · {plan.billingPeriod}</span>
                  ) : null}
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
