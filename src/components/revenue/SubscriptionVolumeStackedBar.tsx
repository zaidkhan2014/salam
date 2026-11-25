import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AdminSubscriptionRevenuePoint } from '@/api/types'
import { hasSubscriptionRevenueSeries } from '@/components/revenue/subscriptionRevenueTransforms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SubscriptionVolumeStackedBarProps {
  series: AdminSubscriptionRevenuePoint[]
}

export function SubscriptionVolumeStackedBar({ series }: SubscriptionVolumeStackedBarProps) {
  if (!hasSubscriptionRevenueSeries(series)) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New vs renewals</CardTitle>
        <p className="text-xs text-slate-500">Paid store events by bucket (INITIAL_PURCHASE vs RENEWAL)</p>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="newSubscriptions"
              stackId="volume"
              fill="#0f172a"
              name="New subscriptions"
              isAnimationActive={false}
            />
            <Bar
              dataKey="renewals"
              stackId="volume"
              fill="#64748b"
              name="Renewals"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
