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
import type { AdminPlanPaidEventsResponse } from '@/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactNumber, formatNumber } from '@/utils/format'

const LINE_COLORS = ['#0f172a', '#1d4ed8', '#0f766e', '#b45309', '#be123c', '#7c3aed']
const TOP_N = 6

interface PlanPaidEventsChartProps {
  data: AdminPlanPaidEventsResponse
}

function productLabel(plan: AdminPlanPaidEventsResponse['plans'][number]): string {
  if (plan.iosProductId || plan.androidProductId) {
    return [plan.iosProductId, plan.androidProductId].filter(Boolean).join(' / ')
  }
  if (plan.productId) return plan.productId
  return plan.planId
}

export function PlanPaidEventsChart({ data }: PlanPaidEventsChartProps) {
  const plans = [...(data.plans ?? [])]
    .sort((a, b) => b.initialPurchaseCount - a.initialPurchaseCount || b.renewalCount - a.renewalCount)
    .slice(0, TOP_N)
  const buckets = plans[0]?.series?.map((point) => point.bucket) ?? []
  const chartData = buckets.map((bucket, index) => {
    const row: Record<string, string | number> = { bucket }
    for (const plan of plans) {
      row[plan.planId] = plan.series[index]?.initialPurchaseCount ?? 0
    }
    return row
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paid events by plan</CardTitle>
        <p className="text-xs text-slate-500">
          Source {data.source} · initial purchases over time (top {TOP_N}) ·{' '}
          {data.granularity?.toLowerCase?.() ?? 'daily'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Initial</p>
            <p className="text-xl font-semibold text-slate-900">
              {formatCompactNumber(data.totalInitialPurchases)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Renewals</p>
            <p className="text-xl font-semibold text-slate-900">{formatCompactNumber(data.totalRenewals)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Paid events</p>
            <p className="text-xl font-semibold text-slate-900">{formatCompactNumber(data.totalPaidEvents)}</p>
          </div>
        </div>
        {!chartData.length ? (
          <p className="text-sm text-slate-500">No PRODUCTION paid events in this range.</p>
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
                <span className="shrink-0 text-right font-medium text-slate-900">
                  {formatNumber(plan.initialPurchaseCount)} init · {formatNumber(plan.renewalCount)}{' '}
                  renew
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
