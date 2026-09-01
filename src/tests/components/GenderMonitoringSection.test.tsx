import type { UseQueryResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminGenderMonitoringResponse } from '@/api/types'
import { GenderMonitoringSection } from '@/components/genderMonitoring/GenderMonitoringSection'

vi.mock('recharts', () => {
  const Mock = ({ children }: { children?: ReactNode }) => <div>{children}</div>
  return {
    ResponsiveContainer: Mock,
    PieChart: Mock,
    Pie: Mock,
    Cell: Mock,
    Tooltip: Mock,
    CartesianGrid: Mock,
    XAxis: Mock,
    YAxis: Mock,
    Legend: Mock,
    LineChart: Mock,
    Line: Mock,
    BarChart: Mock,
    Bar: Mock,
  }
})

function makeSuccessQuery(data: AdminGenderMonitoringResponse): UseQueryResult<AdminGenderMonitoringResponse, Error> {
  return {
    data,
    error: null,
    isError: false,
    isLoading: false,
    isPending: false,
    isSuccess: true,
    status: 'success',
    refetch: vi.fn(),
    fetchStatus: 'idle',
  } as unknown as UseQueryResult<AdminGenderMonitoringResponse, Error>
}

describe('GenderMonitoringSection', () => {
  it('renders KPI cards and chart sections from gender monitoring response', () => {
    const data: AdminGenderMonitoringResponse = {
      start: '2026-08-01T00:00:00.000Z',
      end: '2026-09-01T00:00:00.000Z',
      granularity: 'DAILY',
      approved: {
        snapshot: {
          total: 450,
          male: 410,
          female: 38,
          unknown: 2,
          femalePercent: 8.4,
          malePercent: 91.1,
          maleToFemaleRatio: '10.8:1',
        },
        cumulativeTrend: [
          {
            bucket: '2026-08-01',
            male: 400,
            female: 35,
            unknown: 2,
            total: 437,
            femalePercent: 8.0,
          },
        ],
        inflowTrend: [
          {
            bucket: '2026-08-01',
            male: 3,
            female: 1,
            unknown: 0,
            total: 4,
            femalePercent: 25,
          },
        ],
        byProfileStatus: {},
      },
      onboardingComplete: {
        snapshot: {
          total: 520,
          male: 460,
          female: 55,
          unknown: 5,
          femalePercent: 10.6,
          malePercent: 88.5,
          maleToFemaleRatio: '8.4:1',
        },
        cumulativeTrend: [
          {
            bucket: '2026-08-01',
            male: 450,
            female: 52,
            unknown: 4,
            total: 506,
            femalePercent: 10.3,
          },
        ],
        inflowTrend: [],
        byProfileStatus: {
          APPROVED: {
            total: 450,
            male: 410,
            female: 38,
            unknown: 2,
            femalePercent: 8.4,
            malePercent: 91.1,
            maleToFemaleRatio: '10.8:1',
          },
        },
      },
      cityDistribution: {
        total: 62,
        cities: [
          {
            city: 'Mumbai',
            total: 12,
            male: 10,
            female: 2,
            unknown: 0,
            femalePercent: 16.7,
          },
        ],
      },
    }

    render(<GenderMonitoringSection query={makeSuccessQuery(data)} />)

    expect(screen.getByText('Total approved users')).toBeInTheDocument()
    expect(screen.getByText('Female %')).toBeInTheDocument()
    expect(screen.getByText('Male:Female ratio')).toBeInTheDocument()
    expect(screen.getByText('Female count')).toBeInTheDocument()
    expect(screen.getByText('Approved pool gender split')).toBeInTheDocument()
    expect(screen.getByText('All onboarded gender split')).toBeInTheDocument()
    expect(screen.getByText('Female % trend')).toBeInTheDocument()
    expect(screen.getByText('Daily new onboarding completions')).toBeInTheDocument()
    expect(screen.getByText('Status breakdown by gender')).toBeInTheDocument()
    expect(screen.getByText('Approved signups by city')).toBeInTheDocument()
  })
})
