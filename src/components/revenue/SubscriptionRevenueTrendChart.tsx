import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AdminSubscriptionRevenuePoint } from '@/api/types'
import {
  formatInr,
  hasSubscriptionRevenueSeries,
} from '@/components/revenue/subscriptionRevenueTransforms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SubscriptionRevenueTrendChartProps {
  series: AdminSubscriptionRevenuePoint[]
}

export function SubscriptionRevenueTrendChart({ series }: SubscriptionRevenueTrendChartProps) {
  if (!hasSubscriptionRevenueSeries(series)) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gross vs net revenue</CardTitle>
        <p className="text-xs text-slate-500">INR only (non-INR purchases contribute 0 to revenue)</p>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => formatInr(value)} width={72} />
            <Tooltip formatter={(value) => formatInr(typeof value === 'number' ? value : Number(value))} />
            <Legend />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="grossRevenue"
              name="Gross"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
            />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="netRevenue"
              name="Net"
              stroke="#059669"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
