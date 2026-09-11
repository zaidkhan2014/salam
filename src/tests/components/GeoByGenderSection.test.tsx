import type { UseQueryResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminGeoByGenderResponse } from '@/api/types'
import { GeoByGenderSection } from '@/components/geoByGender/GeoByGenderSection'

vi.mock('recharts', () => {
  const Mock = ({ children }: { children?: ReactNode }) => <div>{children}</div>
  return {
    ResponsiveContainer: Mock,
    BarChart: Mock,
    Bar: Mock,
    LabelList: Mock,
    CartesianGrid: Mock,
    XAxis: Mock,
    YAxis: Mock,
    Tooltip: Mock,
  }
})

function makeSuccessQuery(data: AdminGeoByGenderResponse): UseQueryResult<AdminGeoByGenderResponse, Error> {
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
  } as unknown as UseQueryResult<AdminGeoByGenderResponse, Error>
}

describe('GeoByGenderSection', () => {
  it('renders KPI cards and four geo chart titles', () => {
    const data: AdminGeoByGenderResponse = {
      maleTotal: 410,
      femaleTotal: 38,
      cities: {
        male: [{ name: 'Mumbai', count: 90 }],
        female: [{ name: 'Bangalore', count: 8 }],
      },
      states: {
        male: [{ name: 'Maharashtra', count: 120 }],
        female: [{ name: 'Karnataka', count: 10 }],
      },
    }

    render(<GeoByGenderSection query={makeSuccessQuery(data)} />)

    expect(screen.getByText('Female total')).toBeInTheDocument()
    expect(screen.getByText('Male total')).toBeInTheDocument()
    expect(screen.getByText('Top cities — Female')).toBeInTheDocument()
    expect(screen.getByText('Top cities — Male')).toBeInTheDocument()
    expect(screen.getByText('Top states — Female')).toBeInTheDocument()
    expect(screen.getByText('Top states — Male')).toBeInTheDocument()
  })
})
