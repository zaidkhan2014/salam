import { describe, expect, it } from 'vitest'
import { adminEndpoints } from '@/api/endpoints'

describe('adminEndpoints', () => {
  it('exposes analytics endpoints', () => {
    expect(adminEndpoints.analytics.overview).toBe('/api/admin/analytics/overview')
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
    expect(adminEndpoints.sales.summary).toBe('/api/admin/sales/summary')
  })
})
