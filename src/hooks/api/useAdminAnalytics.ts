import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type {
  AdminGenderMonitoringResponse,
  AdminGeoByGenderResponse,
  AdminMetricsResponse,
  AdminOnboardingDropoffWithMediaResponse,
  AnalyticsFilters,
  GenderMonitoringFilters,
  OnboardingDropoffFilters,
  RetentionFilters,
} from '@/api/types'

export function useOverviewMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'overview', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.overview, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useFunnelMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'funnel', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.funnel, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useRevenueMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'revenue', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.revenue, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useMatchingMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'matching', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.matching, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useChatMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'chat', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.chat, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useSafetyMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'safety', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.safety, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useDemographicsMetrics(filters: Omit<AnalyticsFilters, 'granularity'>) {
  return useQuery({
    queryKey: ['analytics', 'demographics', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.demographics, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useGenderMonitoringMetrics(filters: GenderMonitoringFilters) {
  return useQuery({
    queryKey: ['analytics', 'gender-monitoring', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminGenderMonitoringResponse>(adminEndpoints.analytics.genderMonitoring, {
        params: cleanQueryParams({
          start: filters.start,
          end: filters.end,
          granularity: filters.granularity,
          cityLimit: filters.cityLimit,
        }),
      })
      return response.data
    },
  })
}

export function useGeoByGenderMetrics(limit = 20) {
  return useQuery({
    queryKey: ['analytics', 'geo-by-gender', limit],
    queryFn: async () => {
      const response = await adminClient.get<AdminGeoByGenderResponse>(adminEndpoints.analytics.geoByGender, {
        params: cleanQueryParams({ limit }),
      })
      return response.data
    },
  })
}

/** Gated: only fetches when filters.day is set (admin clicked Check). */
export function useAdminOnboardingDropoff(filters: OnboardingDropoffFilters | null) {
  return useQuery({
    queryKey: ['admin-onboarding-dropoff', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminOnboardingDropoffWithMediaResponse>(
        adminEndpoints.analytics.onboardingDropoffWithMedia,
        {
          params: cleanQueryParams(filters ?? {}),
          // Rekognition-backed day Check can take several minutes on busy days.
          timeout: 10 * 60 * 1000,
        },
      )
      return response.data
    },
    enabled: Boolean(filters?.day),
    staleTime: 30_000,
  })
}

export function useRetentionMetrics(filters: RetentionFilters) {
  return useQuery({
    queryKey: ['analytics', 'retention', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.retention, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useLifeTogetherMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'life-together', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.lifeTogether, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useSelfieMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'selfie', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.selfie, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useSearchIndexMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'search-index', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.searchIndex, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

/**
 * Loads admin OTP analytics. The API should return metrics with keys
 * `otp_requested` (lastOtpRequestedAt), `otp_success` (otpVerifiedAt), `otp_failed` (lastOtpFailedAt);
 * see `OtpAnalyticsMetricKey` in api types. Each counts auth_info rows in `[start, end)` per bucket.
 */
export function useOtpMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'otp', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.otp, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useLikesMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'likes', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.likes, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}
