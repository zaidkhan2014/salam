import { describe, expect, it } from 'vitest'
import { buildGenderPieData, buildProfileStatusRows } from '@/components/genderMonitoring/genderMonitoringTransforms'

describe('genderMonitoringTransforms', () => {
  it('buildGenderPieData omits unknown when count is zero', () => {
    const data = buildGenderPieData({
      total: 10,
      male: 7,
      female: 3,
      unknown: 0,
      femalePercent: 30,
      malePercent: 70,
      maleToFemaleRatio: '2.3:1',
    })

    expect(data.map((item) => item.key)).toEqual(['male', 'female'])
  })

  it('buildGenderPieData includes unknown when present', () => {
    const data = buildGenderPieData({
      total: 10,
      male: 6,
      female: 3,
      unknown: 1,
      femalePercent: 30,
      malePercent: 60,
      maleToFemaleRatio: '2.0:1',
    })

    expect(data.map((item) => item.key)).toEqual(['male', 'female', 'unknown'])
  })

  it('buildProfileStatusRows keeps approved-pending-rejected order first', () => {
    const rows = buildProfileStatusRows({
      REJECTED: {
        total: 1,
        male: 1,
        female: 0,
        unknown: 0,
        femalePercent: 0,
        malePercent: 100,
        maleToFemaleRatio: 'N/A',
      },
      APPROVED: {
        total: 5,
        male: 4,
        female: 1,
        unknown: 0,
        femalePercent: 20,
        malePercent: 80,
        maleToFemaleRatio: '4.0:1',
      },
      PENDING: {
        total: 2,
        male: 1,
        female: 1,
        unknown: 0,
        femalePercent: 50,
        malePercent: 50,
        maleToFemaleRatio: '1.0:1',
      },
    })

    expect(rows.map((row) => row.status)).toEqual(['APPROVED', 'PENDING', 'REJECTED'])
  })
})
