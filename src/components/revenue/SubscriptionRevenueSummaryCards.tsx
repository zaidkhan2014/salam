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

const volumeCards: Array<{
  key: keyof Pick<
    AdminSubscriptionRevenueBreakdownResponse,
    'newSubscriptionCount' | 'renewalCount' | 'totalPaidEvents'
  >
  title: string
}> = [
  { key: 'newSubscriptionCount', title: 'New subscriptions' },
  { key: 'renewalCount', title: 'Renewals' },
  { key: 'totalPaidEvents', title: 'Paid events' },
]

const moneyCards: Array<{
  key: keyof Pick<
    AdminSubscriptionRevenueBreakdownResponse,
    | 'grossRevenue'
    | 'storeCommission'
    | 'netRevenue'
    | 'iosGrossRevenue'
    | 'iosNetRevenue'
    | 'androidGrossRevenue'
    | 'androidNetRevenue'
  >
  title: string
}> = [
  { key: 'grossRevenue', title: 'Gross revenue' },
  { key: 'storeCommission', title: 'Store commission' },
  { key: 'netRevenue', title: 'Net revenue' },
  { key: 'iosGrossRevenue', title: 'iOS gross' },
  { key: 'iosNetRevenue', title: 'iOS net (flat 15%)' },
  { key: 'androidGrossRevenue', title: 'Android gross' },
  { key: 'androidNetRevenue', title: 'Android net (flat 15%)' },
]

const partnerCards: Array<{
  key: keyof Pick<
    AdminSubscriptionRevenueBreakdownResponse,
    | 'iosPartnerNetRevenue'
    | 'iosAmountExGst'
    | 'iosAppleCommission'
    | 'androidAmountExGst'
    | 'partnerNetTotal'
  >
  title: string
}> = [
  { key: 'iosPartnerNetRevenue', title: 'iOS partner net' },
  { key: 'iosAmountExGst', title: 'iOS amount ex-GST' },
  { key: 'iosAppleCommission', title: 'Apple commission' },
  { key: 'androidAmountExGst', title: 'Android ex-GST' },
  { key: 'partnerNetTotal', title: 'Partner net total' },
]

export function SubscriptionRevenueSummaryCards({ data }: SubscriptionRevenueSummaryCardsProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Currency {data.currency} · store commission {formatCommissionRate(data.storeCommissionRate)} ·
        GST {formatCommissionRate(data.gstRate)} · iOS = App Store, Android = Play Store
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {volumeCards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">
                {formatCompactNumber(data[card.key])}
              </p>
            </CardContent>
          </Card>
        ))}
        {moneyCards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{formatInr(data[card.key])}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {partnerCards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{formatInr(data[card.key])}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Partner math: iOS = gross ÷ 1.18 × 0.85 (GST out, then Apple 15%); Play = gross ÷ 1.18 only
        (GST out, no store commission in partner total). Flat 15% cards above remain gross × 0.85.
      </p>
      {data.unknownStoreGrossRevenue > 0 ? (
        <p className="text-xs text-slate-500">
          Unknown store gross {formatInr(data.unknownStoreGrossRevenue)} (net{' '}
          {formatInr(data.unknownStoreNetRevenue)})
        </p>
      ) : null}
    </div>
  )
}
