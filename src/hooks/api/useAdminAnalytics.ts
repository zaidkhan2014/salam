import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type {
  AdminDayGenderCountsResponse,
  AdminDeletedApprovedByDayResponse,
  AdminGenderMonitoringResponse,
  AdminGeoByGenderResponse,
  AdminLifeTogetherOnboardingResponse,
  AdminLoginFunnelResponse,
  AdminMetricsResponse,
  AdminOnboardingDropoffWithMediaResponse,
  AdminOtpUnverifiedResponse,
  AnalyticsFilters,
  DayGenderCountsFilters,
  GenderMonitoringFilters,
  OnboardingDropoffFilters,
  OtpUnverifiedFilters,
  RetentionFilters,
} from '@/api/types'

/** Wide date-range metrics can exceed the default 20s client timeout. */
const ANALYTICS_REQUEST_TIMEOUT_MS = 5 * 60 * 1000

export function useOverviewMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'overview', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.overview, {
        params: cleanQueryParams(filters),
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
      })
      return response.data
    },
  })
}

export function useLifeTogetherOnboardingMetrics(filters: Pick<AnalyticsFilters, 'start' | 'end'>) {
  return useQuery({
    queryKey: ['analytics', 'life-together-onboarding', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminLifeTogetherOnboardingResponse>(
        adminEndpoints.analytics.lifeTogetherOnboarding,
        {
          params: cleanQueryParams(filters),
          timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
        },
      )
      return response.data
    },
  })
}

export function useLoginFunnelMetrics(filters: Pick<AnalyticsFilters, 'start' | 'end'>) {
  return useQuery({
    queryKey: ['analytics', 'login-funnel', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminLoginFunnelResponse>(adminEndpoints.analytics.loginFunnel, {
        params: cleanQueryParams(filters),
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
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
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
      })
      return response.data
    },
  })
}

export function useOtpUnverified(filters: OtpUnverifiedFilters) {
  return useQuery({
    queryKey: ['analytics', 'otp-unverified', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminOtpUnverifiedResponse>(
        adminEndpoints.analytics.otpUnverified,
        {
          params: cleanQueryParams(filters),
          timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
        },
      )
      return response.data
    },
  })
}

export function useDeletedApprovedByDay(filters: DayGenderCountsFilters | null) {
  return useQuery({
    queryKey: ['analytics', 'deleted-approved-by-day', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminDeletedApprovedByDayResponse>(
        adminEndpoints.analytics.deletedApprovedByDay,
        {
          params: cleanQueryParams(filters ?? {}),
          timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
        },
      )
      return response.data
    },
    enabled: Boolean(filters?.day),
  })
}

export function useOnboardedByDay(filters: DayGenderCountsFilters | null) {
  return useQuery({
    queryKey: ['analytics', 'onboarded-by-day', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminDayGenderCountsResponse>(
        adminEndpoints.analytics.onboardedByDay,
        {
          params: cleanQueryParams(filters ?? {}),
          timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
        },
      )
      return response.data
    },
    enabled: Boolean(filters?.day),
  })
}

export function useLikesMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'likes', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.likes, {
        params: cleanQueryParams(filters),
        timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
      })
      return response.data
    },
  })
}
