import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type { AdminReportDetailResponse, AdminReportSearchResponse, ReportSearchFilters } from '@/api/types'

export function useAdminReportsSearch(filters: ReportSearchFilters) {
  return useQuery({
    queryKey: ['admin-reports-search', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminReportSearchResponse>(adminEndpoints.reports.list, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useAdminReportDetail(reportId: string | undefined) {
  return useQuery({
    queryKey: ['admin-report-detail', reportId],
    queryFn: async () => {
      const response = await adminClient.get<AdminReportDetailResponse>(
        adminEndpoints.reports.detail(reportId ?? ''),
      )
      return response.data
    },
    enabled: Boolean(reportId),
  })
}
