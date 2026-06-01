export const ADMIN_API_BASE = '/api/admin'

export const adminEndpoints = {
  authToken: `${ADMIN_API_BASE}/auth/token`,
  analytics: {
    overview: `${ADMIN_API_BASE}/analytics/overview`,
    funnel: `${ADMIN_API_BASE}/analytics/funnel`,
    revenue: `${ADMIN_API_BASE}/analytics/revenue`,
    matching: `${ADMIN_API_BASE}/analytics/matching`,
    chat: `${ADMIN_API_BASE}/analytics/chat`,
    safety: `${ADMIN_API_BASE}/analytics/safety`,
    demographics: `${ADMIN_API_BASE}/analytics/demographics`,
    retention: `${ADMIN_API_BASE}/analytics/retention`,
    lifeTogether: `${ADMIN_API_BASE}/analytics/life-together`,
    selfie: `${ADMIN_API_BASE}/analytics/selfie`,
    searchIndex: `${ADMIN_API_BASE}/analytics/search-index`,
    otp: `${ADMIN_API_BASE}/analytics/otp`,
    likes: `${ADMIN_API_BASE}/analytics/likes`,
  },
  users: {
    search: `${ADMIN_API_BASE}/users/search`,
    detail: (userId: string) => `${ADMIN_API_BASE}/users/${userId}`,
    newlyJoined: `${ADMIN_API_BASE}/users/newly-joined`,
    profileRejected: `${ADMIN_API_BASE}/users/profile-rejected`,
    bioRejected: `${ADMIN_API_BASE}/users/bio-rejected`,
    deleted: `${ADMIN_API_BASE}/users/deleted`,
  },
  reports: {
    list: `${ADMIN_API_BASE}/reports`,
    detail: (reportId: string) => `${ADMIN_API_BASE}/reports/${reportId}`,
  },
  sales: {
    leads: `${ADMIN_API_BASE}/sales/leads`,
    detail: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}`,
    updateStatus: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/status`,
    updateNote: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/note`,
    updateFollowUp: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/follow-up`,
    summary: `${ADMIN_API_BASE}/sales/summary`,
  },
} as const
