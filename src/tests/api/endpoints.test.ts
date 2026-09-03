import { describe, expect, it } from 'vitest'
import { adminEndpoints } from '@/api/endpoints'

describe('adminEndpoints', () => {
  it('exposes analytics endpoints', () => {
    expect(adminEndpoints.analytics.overview).toBe('/api/admin/analytics/overview')
    expect(adminEndpoints.analytics.genderMonitoring).toBe('/api/admin/analytics/gender-monitoring')
    expect(adminEndpoints.analytics.retention).toBe('/api/admin/analytics/retention')
    expect(adminEndpoints.analytics.lifeTogether).toBe('/api/admin/analytics/life-together')
    expect(adminEndpoints.analytics.selfie).toBe('/api/admin/analytics/selfie')
    expect(adminEndpoints.analytics.searchIndex).toBe('/api/admin/analytics/search-index')
    expect(adminEndpoints.analytics.otp).toBe('/api/admin/analytics/otp')
    expect(adminEndpoints.analytics.likes).toBe('/api/admin/analytics/likes')
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

  it('exposes auth login endpoint', () => {
    expect(adminEndpoints.authLogin).toBe('/api/admin/auth/login')
  })
})
