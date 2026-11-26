import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AdminPlanPaidEventsResponse } from '@/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactNumber, formatNumber } from '@/utils/format'

interface PlanPaidEventsChartProps {
  data: AdminPlanPaidEventsResponse
}

export function PlanPaidEventsChart({ data }: PlanPaidEventsChartProps) {
  const plans = [...(data.plans ?? [])].sort(
    (a, b) => b.initialPurchaseCount - a.initialPurchaseCount || b.renewalCount - a.renewalCount,
  )
  const chartData = plans.map((plan) => ({
    name: plan.planName || plan.planId,
    initialPurchaseCount: plan.initialPurchaseCount,
    renewalCount: plan.renewalCount,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paid events by plan</CardTitle>
        <p className="text-xs text-slate-500">
          Source {data.source} · ranked by initial purchases (not total events)
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
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <Tooltip formatter={(value) => formatNumber(typeof value === 'number' ? value : Number(value))} />
                <Legend />
                <Bar
                  dataKey="initialPurchaseCount"
                  fill="#0f172a"
                  name="Initial purchases"
                  isAnimationActive={false}
                />
                <Bar dataKey="renewalCount" fill="#64748b" name="Renewals" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
