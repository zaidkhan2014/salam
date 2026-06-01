import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type {
  AdminMetricsResponse,
  AdminSalesLeadDetailResponse,
  AdminSalesLeadSearchResponse,
  SalesLeadsFilters,
  UpdateSalesFollowUpRequest,
  UpdateSalesNoteRequest,
  UpdateSalesStatusRequest,
} from '@/api/types'

export function useAdminSalesLeads(filters: SalesLeadsFilters) {
  return useQuery({
    queryKey: ['admin-sales-leads', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesLeadSearchResponse>(adminEndpoints.sales.leads, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useAdminSalesSummary(filters: Pick<SalesLeadsFilters, 'start' | 'end'>) {
  return useQuery({
    queryKey: ['admin-sales-summary', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.sales.summary, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useAdminSalesLeadDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-sales-lead-detail', userId],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.detail(userId ?? ''),
      )
      return response.data
    },
    enabled: Boolean(userId),
  })
}

export function useUpdateSalesStatus(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesStatusRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.updateStatus(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-leads'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-summary'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-lead-detail', userId] })
    },
  })
}

export function useUpdateSalesNote(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesNoteRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.updateNote(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-lead-detail', userId] })
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-leads'] })
    },
  })
}

export function useUpdateSalesFollowUp(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesFollowUpRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.updateFollowUp(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-lead-detail', userId] })
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-leads'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-summary'] })
    },
  })
}
