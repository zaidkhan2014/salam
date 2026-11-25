import type { AdminSubscriptionRevenueBreakdownResponse } from '@/api/types'
import {
  formatCommissionRate,
  formatInr,
} from '@/components/revenue/subscriptionRevenueTransforms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactNumber } from '@/utils/format'

interface SubscriptionRevenueSummaryCardsProps {
  data: AdminSubscriptionRevenueBreakdownResponse
}

const cards: Array<{
  key: keyof Pick<
    AdminSubscriptionRevenueBreakdownResponse,
    | 'newSubscriptionCount'
    | 'renewalCount'
    | 'totalPaidEvents'
    | 'grossRevenue'
    | 'storeCommission'
    | 'netRevenue'
  >
  title: string
  money?: boolean
}> = [
  { key: 'newSubscriptionCount', title: 'New subscriptions' },
  { key: 'renewalCount', title: 'Renewals' },
  { key: 'totalPaidEvents', title: 'Paid events' },
  { key: 'grossRevenue', title: 'Gross revenue', money: true },
  { key: 'storeCommission', title: 'Store commission', money: true },
  { key: 'netRevenue', title: 'Net revenue', money: true },
]

export function SubscriptionRevenueSummaryCards({ data }: SubscriptionRevenueSummaryCardsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Currency {data.currency} · store commission {formatCommissionRate(data.storeCommissionRate)}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const value = data[card.key]
          return (
            <Card key={card.key}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-slate-900">
                  {card.money ? formatInr(value) : formatCompactNumber(value)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
