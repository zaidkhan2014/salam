import { describe, expect, it } from 'vitest'
import type { UserProfile } from '@/api/types'
import { getInitialsFromFullName, getPrimaryGalleryImageUrl } from '@/utils/profileMedia'

describe('getPrimaryGalleryImageUrl', () => {
  it('returns null when profile or items missing', () => {
    expect(getPrimaryGalleryImageUrl(undefined)).toBeNull()
    expect(getPrimaryGalleryImageUrl(null)).toBeNull()
    expect(getPrimaryGalleryImageUrl({} as UserProfile)).toBeNull()
    expect(getPrimaryGalleryImageUrl({ mediaGallery: { items: [] } } as UserProfile)).toBeNull()
  })

  it('ignores non-image types and missing url', () => {
    const profile = {
      mediaGallery: {
        items: [
          { type: 'video', url: 'https://example.com/v.mp4', orderIndex: 0 },
          { type: 'image', orderIndex: 1 },
        ],
      },
    } as UserProfile
    expect(getPrimaryGalleryImageUrl(profile)).toBeNull()
  })

  it('picks lowest orderIndex among images', () => {
    const profile = {
      mediaGallery: {
        items: [
          { type: 'image', url: 'https://example.com/b.jpg', orderIndex: 2 },
          { type: 'image', url: 'https://example.com/a.jpg', orderIndex: 0 },
          { type: 'image', url: 'https://example.com/c.jpg', orderIndex: 1 },
        ],
      },
    } as UserProfile
    expect(getPrimaryGalleryImageUrl(profile)).toBe('https://example.com/a.jpg')
  })

  it('treats missing orderIndex as last', () => {
    const profile = {
      mediaGallery: {
        items: [
          { type: 'image', url: 'https://example.com/no-index.jpg' },
          { type: 'image', url: 'https://example.com/zero.jpg', orderIndex: 0 },
        ],
      },
    } as UserProfile
    expect(getPrimaryGalleryImageUrl(profile)).toBe('https://example.com/zero.jpg')
  })

  it('matches image type case-insensitively', () => {
    const profile = {
      mediaGallery: {
        items: [{ type: 'IMAGE', url: 'https://example.com/x.jpg', orderIndex: 0 }],
      },
    } as UserProfile
    expect(getPrimaryGalleryImageUrl(profile)).toBe('https://example.com/x.jpg')
  })
})

describe('getInitialsFromFullName', () => {
  it('returns null for empty input', () => {
    expect(getInitialsFromFullName(undefined)).toBeNull()
    expect(getInitialsFromFullName(null)).toBeNull()
    expect(getInitialsFromFullName('   ')).toBeNull()
  })

  it('uses first two letters for single word longer than 2 chars', () => {
    expect(getInitialsFromFullName('John')).toBe('JO')
  })

  it('uses whole short single word uppercase', () => {
    expect(getInitialsFromFullName('Jo')).toBe('JO')
    expect(getInitialsFromFullName('J')).toBe('J')
  })

  it('uses first and last word initials', () => {
    expect(getInitialsFromFullName('John Middle Doe')).toBe('JD')
  })
})
