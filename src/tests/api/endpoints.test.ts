import { describe, expect, it } from 'vitest'
import { adminEndpoints } from '@/api/endpoints'

describe('adminEndpoints', () => {
  it('exposes analytics endpoints', () => {
    expect(adminEndpoints.analytics.overview).toBe('/api/admin/analytics/overview')
    expect(adminEndpoints.analytics.genderMonitoring).toBe('/api/admin/analytics/gender-monitoring')
    expect(adminEndpoints.analytics.geoByGender).toBe('/api/admin/analytics/geo-by-gender')
    expect(adminEndpoints.analytics.onboardingDropoffWithMedia).toBe(
      '/api/admin/analytics/onboarding-dropoff-with-media',
    )
    expect(adminEndpoints.analytics.retention).toBe('/api/admin/analytics/retention')
    expect(adminEndpoints.analytics.lifeTogether).toBe('/api/admin/analytics/life-together')
    expect(adminEndpoints.analytics.lifeTogetherOnboarding).toBe(
      '/api/admin/analytics/life-together-onboarding',
    )
    expect(adminEndpoints.analytics.selfie).toBe('/api/admin/analytics/selfie')
    expect(adminEndpoints.analytics.searchIndex).toBe('/api/admin/analytics/search-index')
    expect(adminEndpoints.analytics.otp).toBe('/api/admin/analytics/otp')
    expect(adminEndpoints.analytics.loginFunnel).toBe('/api/admin/analytics/login-funnel')
    expect(adminEndpoints.analytics.otpUnverified).toBe('/api/admin/analytics/otp-unverified')
    expect(adminEndpoints.analytics.likes).toBe('/api/admin/analytics/likes')
  })

  it('exposes geo endpoints', () => {
    expect(adminEndpoints.geo.countries).toBe('/api/geo/countries')
    expect(adminEndpoints.geo.states).toBe('/api/geo/states')
    expect(adminEndpoints.geo.cities).toBe('/api/geo/cities')
  })

  it('creates user endpoints', () => {
    expect(adminEndpoints.users.detail('user-1')).toBe('/api/admin/users/user-1')
    expect(adminEndpoints.users.newlyJoined).toBe('/api/admin/users/newly-joined')
    expect(adminEndpoints.users.profileRejected).toBe('/api/admin/users/profile-rejected')
    expect(adminEndpoints.users.bioRejected).toBe('/api/admin/users/bio-rejected')
    expect(adminEndpoints.users.deleted).toBe('/api/admin/users/deleted')
    expect(adminEndpoints.users.reviewQueue).toBe('/api/admin/users/review-queue')
    expect(adminEndpoints.users.forceApproveReview('user-1')).toBe(
      '/api/admin/users/user-1/force-approve-review',
    )
  })

  it('creates report endpoints', () => {
    expect(adminEndpoints.reports.list).toBe('/api/admin/reports')
    expect(adminEndpoints.reports.detail('rep-1')).toBe('/api/admin/reports/rep-1')
  })

  it('creates chat conversation endpoints', () => {
    expect(adminEndpoints.chat.conversations).toBe('/api/admin/chat/conversations')
    expect(adminEndpoints.chat.messages('match-1')).toBe('/api/admin/chat/conversations/match-1/messages')
  })

  it('creates sales endpoints', () => {
    expect(adminEndpoints.sales.leads).toBe('/api/admin/sales/leads')
    expect(adminEndpoints.sales.detail('user-1')).toBe('/api/admin/sales/leads/user-1')
    expect(adminEndpoints.sales.updateStatus('user-1')).toBe('/api/admin/sales/leads/user-1/status')
    expect(adminEndpoints.sales.updateNote('user-1')).toBe('/api/admin/sales/leads/user-1/note')
    expect(adminEndpoints.sales.updateFollowUp('user-1')).toBe('/api/admin/sales/leads/user-1/follow-up')
    expect(adminEndpoints.sales.claim('user-1')).toBe('/api/admin/sales/leads/user-1/claim')
    expect(adminEndpoints.sales.release('user-1')).toBe('/api/admin/sales/leads/user-1/release')
    expect(adminEndpoints.sales.assign('user-1')).toBe('/api/admin/sales/leads/user-1/assign')
    expect(adminEndpoints.sales.followUps).toBe('/api/admin/sales/follow-ups')
    expect(adminEndpoints.sales.activities('user-1')).toBe('/api/admin/sales/leads/user-1/activities')
    expect(adminEndpoints.sales.communications('user-1')).toBe('/api/admin/sales/leads/user-1/communications')
    expect(adminEndpoints.sales.conversions).toBe('/api/admin/sales/conversions')
    expect(adminEndpoints.sales.agentPerformance).toBe('/api/admin/sales/agents/performance')
    expect(adminEndpoints.sales.savedViews).toBe('/api/admin/sales/saved-views')
    expect(adminEndpoints.sales.savedView('view-1')).toBe('/api/admin/sales/saved-views/view-1')
    expect(adminEndpoints.sales.summary).toBe('/api/admin/sales/summary')
  })

  it('creates deleted sales endpoints', () => {
    expect(adminEndpoints.salesDeleted.leads).toBe('/api/admin/sales/deleted/leads')
    expect(adminEndpoints.salesDeleted.detail('user-1')).toBe('/api/admin/sales/deleted/leads/user-1')
    expect(adminEndpoints.salesDeleted.updateStatus('user-1')).toBe(
      '/api/admin/sales/deleted/leads/user-1/status',
    )
    expect(adminEndpoints.salesDeleted.claim('user-1')).toBe('/api/admin/sales/deleted/leads/user-1/claim')
    expect(adminEndpoints.salesDeleted.followUps).toBe('/api/admin/sales/deleted/follow-ups')
    expect(adminEndpoints.salesDeleted.conversions).toBe('/api/admin/sales/deleted/conversions')
    expect(adminEndpoints.salesDeleted.agentPerformance).toBe(
      '/api/admin/sales/deleted/agents/performance',
    )
    expect(adminEndpoints.salesDeleted.savedViews).toBe('/api/admin/sales/deleted/saved-views')
    expect(adminEndpoints.salesDeleted.savedView('view-1')).toBe(
      '/api/admin/sales/deleted/saved-views/view-1',
    )
    expect(adminEndpoints.salesDeleted.summary).toBe('/api/admin/sales/deleted/summary')
  })

  it('creates vip endpoints', () => {
    expect(adminEndpoints.vip.leads).toBe('/api/admin/vip/leads')
    expect(adminEndpoints.vip.detail('user-1')).toBe('/api/admin/vip/leads/user-1')
    expect(adminEndpoints.vip.updateStatus('user-1')).toBe('/api/admin/vip/leads/user-1/status')
    expect(adminEndpoints.vip.updateNote('user-1')).toBe('/api/admin/vip/leads/user-1/note')
    expect(adminEndpoints.vip.updateFollowUp('user-1')).toBe('/api/admin/vip/leads/user-1/follow-up')
    expect(adminEndpoints.vip.claim('user-1')).toBe('/api/admin/vip/leads/user-1/claim')
    expect(adminEndpoints.vip.release('user-1')).toBe('/api/admin/vip/leads/user-1/release')
    expect(adminEndpoints.vip.assign('user-1')).toBe('/api/admin/vip/leads/user-1/assign')
    expect(adminEndpoints.vip.followUps).toBe('/api/admin/vip/follow-ups')
  })

  it('exposes auth login endpoint', () => {
    expect(adminEndpoints.authLogin).toBe('/api/admin/auth/login')
  })
})
