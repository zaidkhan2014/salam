import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminUserDetail } from '@/hooks/api/useAdminUsers'
import { routes } from '@/router/paths'
import { formatDateTime, formatNumber } from '@/utils/format'
import { getInitialsFromFullName, getPrimaryGalleryImageUrl } from '@/utils/profileMedia'

const numericFields = [
  'reportsAgainstUser',
  'blocksByUser',
  'blocksAgainstUser',
  'activeMatches',
  'initiatedChats',
  'interactionsSent',
] as const

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const query = useAdminUserDetail(userId)
  const profile = query.data?.profile
  const mainImageUrl = query.data ? getPrimaryGalleryImageUrl(query.data.profile) : null
  const photoAlt = query.data?.fullName?.trim() ? `Profile photo for ${query.data.fullName}` : 'Profile photo'

  return (
    <section className="space-y-4">
      <div className="flex gap-4">
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {query.isLoading ? (
            <Skeleton className="h-28 w-28 rounded-xl border-0" />
          ) : mainImageUrl ? (
            <img src={mainImageUrl} alt={photoAlt} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs font-medium text-slate-500">
              {query.data ? getInitialsFromFullName(query.data.fullName) ?? 'No photo' : 'No photo'}
            </div>
          )}
        </div>
        <PageHeader title="User Detail" description={`Profile details and activity for ${userId ?? '--'}.`} />
      </div>
      <Link to={routes.users} className="text-sm text-slate-700 underline">
        Back to users
      </Link>

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />

      {query.isLoading ? <Skeleton className="h-72 w-full" /> : null}

      {query.data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Full name" value={query.data.fullName} />
              <Row label="Member ID" value={query.data.memberId} />
              <Row label="Phone" value={query.data.phone} />
              <Row label="Gender" value={query.data.gender} />
              <Row label="Location" value={[query.data.city, query.data.state, query.data.country].filter(Boolean).join(', ')} />
              <Row label="Profile status" value={query.data.profileStatus} />
              <Row label="Account status" value={query.data.accountStatus} />
              <Row label="Subscribed" value={query.data.subscribed ? 'Yes' : 'No'} />
              <Row label="OTP Verified" value={query.data.otpVerified ? 'Yes' : 'No'} />
              <Row label="Profile Registered" value={query.data.profileRegistered ? 'Yes' : 'No'} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Signup at" value={formatDateTime(query.data.signupAt)} />
              <Row label="OTP verified at" value={formatDateTime(query.data.otpVerifiedAt)} />
              <Row label="Onboarding completed" value={formatDateTime(query.data.onboardingCompletedAt)} />
              <Row label="Profile completed" value={formatDateTime(query.data.profileCompletedAt)} />
              <Row label="Last login" value={formatDateTime(query.data.lastLoginAt)} />
              <Row label="Last activity" value={formatDateTime(query.data.lastActivityAt)} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Nested Profile Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ProfileSection
                title="Basic Details"
                rows={[
                  ['Bio', profile?.bio ?? '--'],
                  ['Created At', formatDateTime(profile?.createdAt)],
                  ['Verified Profile', profile?.verifiedProfile ? 'Yes' : 'No'],
                  ['Profile %', profile?.profileCreationPercentage?.toString() ?? '--'],
                  ['Bio Moderation', profile?.bioModerationStatus ?? '--'],
                  ['Bio Moderated At', formatDateTime(profile?.bioModeratedAt)],
                ]}
              />
              <ProfileSection
                title="Career & Family"
                rows={[
                  ['Profession', profile?.careerEducation?.profession ?? '--'],
                  ['Education', profile?.careerEducation?.education ?? '--'],
                  ['Industry', profile?.careerEducation?.industry ?? '--'],
                  ['Family Type', profile?.family?.familyType ?? '--'],
                  ['Family Status', profile?.family?.familyStatus ?? '--'],
                  ['Ethnicity', profile?.basicDetails?.ethnicity ?? '--'],
                ]}
              />
              <ProfileSection
                title="Faith & Lifestyle"
                rows={[
                  ['Sect', profile?.faithPractice?.sect ?? '--'],
                  ['Caste', profile?.faithPractice?.caste ?? '--'],
                  ['Religious Practice', profile?.faithPractice?.religiousPractice ?? '--'],
                  ['Islamic Dress', profile?.faithPractice?.islamicDress ?? '--'],
                  ['Smoke', profile?.health?.smoke ?? '--'],
                  ['Alcohol', profile?.health?.alcohol ?? '--'],
                ]}
              />
              <ProfileSection
                title="Media & Preferences"
                rows={[
                  ['Gallery Visibility', profile?.mediaGallery?.visibility ?? '--'],
                  ['Media Items', `${profile?.mediaGallery?.items?.length ?? 0}`],
                  ['Approved Photos', `${profile?.approvedPhotoCount ?? 0}`],
                  ['Partner Countries', (profile?.partnerPreferences?.country ?? []).join(', ') || '--'],
                  ['Partner Sect', (profile?.partnerPreferences?.sect ?? []).join(', ') || '--'],
                  ['Last Seen', formatDateTime(profile?.lastSeen)],
                ]}
              />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Engagement Counters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {numericFields.map((field) => (
                <div key={field} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-500">{field}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatNumber(query.data[field])}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value || '--'}</span>
    </div>
  )
}

function ProfileSection({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="mb-2 text-sm font-semibold text-slate-900">{title}</p>
      <div className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={`${title}-${label}`} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-1">
            <span className="text-slate-500">{label}</span>
            <span className="max-w-[60%] text-right font-medium text-slate-900">{value || '--'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
