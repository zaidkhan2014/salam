import type { UseQueryResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminMetricsResponse } from '@/api/types'
import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'

function makeSuccessQuery(metrics: AdminMetricsResponse['metrics']): UseQueryResult<AdminMetricsResponse, Error> {
  return {
    data: {
      start: '2026-01-01T00:00:00.000Z',
      end: '2026-01-08T00:00:00.000Z',
      granularity: 'DAILY',
      metrics,
    },
    error: null,
    isError: false,
    isLoading: false,
    isPending: false,
    isSuccess: true,
    status: 'success',
    refetch: vi.fn(),
    fetchStatus: 'idle',
  } as unknown as UseQueryResult<AdminMetricsResponse, Error>
}

const emptyMetric = { key: 'test_metric', total: 0, series: [], breakdown: [] }

describe('AnalyticsPageTemplate', () => {
  it('renders primary and extra metric section titles', () => {
    const filters = {
      start: '2026-01-01T00:00:00.000Z',
      end: '2026-01-08T00:00:00.000Z',
      granularity: 'daily' as const,
    }

    render(
      <AnalyticsPageTemplate
        title="Overview"
        description="Key product and activity metrics."
        filters={filters}
        onFiltersChange={vi.fn()}
        query={makeSuccessQuery([emptyMetric])}
        extraQueries={[
          {
            title: 'Search index health',
            description: 'Mongo vs Elasticsearch profile counts.',
            query: makeSuccessQuery([{ ...emptyMetric, key: 'mongo_profile_count' }]),
          },
        ]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Search index health' })).toBeInTheDocument()
    expect(screen.getByText('Mongo vs Elasticsearch profile counts.')).toBeInTheDocument()
  })

  it('renders optional details below the description', () => {
    const filters = {
      start: '2026-01-01T00:00:00.000Z',
      end: '2026-01-08T00:00:00.000Z',
      granularity: 'daily' as const,
    }

    render(
      <AnalyticsPageTemplate
        title="OTP Analytics"
        description="Short subtitle."
        details={<p data-testid="otp-details">Semantics block</p>}
        filters={filters}
        onFiltersChange={vi.fn()}
        query={makeSuccessQuery([emptyMetric])}
      />,
    )

    expect(screen.getByText('Short subtitle.')).toBeInTheDocument()
    expect(screen.getByTestId('otp-details')).toHaveTextContent('Semantics block')
  })
})
