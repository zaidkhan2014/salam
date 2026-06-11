import type { AccountStatus, AdminSalesStatus, ProfileStatus } from '@/api/types'

/** sessionStorage key for last Sales list query string (no leading `?`). */
export const SALES_LIST_SEARCH_STORAGE_KEY = 'qalbi.admin.salesListSearch'

const SALES_STATUSES = new Set<string>([
  'ALL',
  'CALL_REMAINING',
  'ALREADY_CALLED',
  'CALL_NOT_PICKED',
  'CALL_BACK_LATER',
  'INTERESTED',
  'NOT_INTERESTED',
])

const ACCOUNT = new Set<string>(['ACTIVE', 'ANY', 'DELETED', 'BANNED'])
const PROFILE = new Set<string>(['APPROVED', 'ANY', 'PENDING', 'REJECTED'])

export interface SalesListUrlState {
  start: string
  end: string
  followUpStart: string
  followUpEnd: string
  status: 'ALL' | AdminSalesStatus
  query: string
  accountStatus: AccountStatus | 'ANY'
  profileStatus: ProfileStatus | 'ANY'
  gender: string
  /** Raw string from URL; API only receives 1900–2100 integer when valid digits */
  birthYear: string
  maritalStatus: string
  subscribedTri: '' | 'true' | 'false'
  verifiedTri: '' | 'true' | 'false'
  page: number
}

export const defaultSalesListUrlState = (): SalesListUrlState => ({
  start: '',
  end: '',
  followUpStart: '',
  followUpEnd: '',
  status: 'ALL',
  query: '',
  accountStatus: 'ACTIVE',
  profileStatus: 'APPROVED',
  gender: '',
  birthYear: '',
  maritalStatus: '',
  subscribedTri: '',
  verifiedTri: '',
  page: 0,
})

function parsePage(raw: string | null): number {
  const n = parseInt(raw ?? '0', 10)
  if (Number.isNaN(n) || n < 0) return 0
  return n
}

export function parseSalesListSearchParams(searchParams: URLSearchParams): SalesListUrlState {
  const defaults = defaultSalesListUrlState()
  const statusRaw = searchParams.get('status') ?? 'ALL'
  const status = SALES_STATUSES.has(statusRaw) ? (statusRaw as SalesListUrlState['status']) : defaults.status

  const accountRaw = searchParams.get('accountStatus') ?? defaults.accountStatus
  const accountStatus = ACCOUNT.has(accountRaw) ? (accountRaw as SalesListUrlState['accountStatus']) : defaults.accountStatus

  const profileRaw = searchParams.get('profileStatus') ?? defaults.profileStatus
  const profileStatus = PROFILE.has(profileRaw) ? (profileRaw as SalesListUrlState['profileStatus']) : defaults.profileStatus

  const sub = searchParams.get('subscribed')
  const subscribedTri: SalesListUrlState['subscribedTri'] =
    sub === 'true' || sub === 'false' ? sub : ''

  const ver = searchParams.get('verifiedProfile')
  const verifiedTri: SalesListUrlState['verifiedTri'] =
    ver === 'true' || ver === 'false' ? ver : ''

  return {
    start: searchParams.get('start') ?? '',
    end: searchParams.get('end') ?? '',
    followUpStart: searchParams.get('followUpStart') ?? '',
    followUpEnd: searchParams.get('followUpEnd') ?? '',
    status,
    query: searchParams.get('query') ?? '',
    accountStatus,
    profileStatus,
    gender: searchParams.get('gender') ?? '',
    birthYear: searchParams.get('birthYear') ?? '',
    maritalStatus: searchParams.get('maritalStatus') ?? '',
    subscribedTri,
    verifiedTri,
    page: parsePage(searchParams.get('page')),
  }
}

/** Build query string object for React Router `setSearchParams`. Omits default-valued keys. */
export function toSalesListSearchParams(state: SalesListUrlState): URLSearchParams {
  const defaults = defaultSalesListUrlState()
  const p = new URLSearchParams()

  if (state.start) p.set('start', state.start)
  if (state.end) p.set('end', state.end)
  if (state.followUpStart) p.set('followUpStart', state.followUpStart)
  if (state.followUpEnd) p.set('followUpEnd', state.followUpEnd)
  if (state.status !== defaults.status) p.set('status', state.status)
  if (state.query) p.set('query', state.query)
  if (state.accountStatus !== defaults.accountStatus) p.set('accountStatus', state.accountStatus)
  if (state.profileStatus !== defaults.profileStatus) p.set('profileStatus', state.profileStatus)
  if (state.gender.trim()) p.set('gender', state.gender.trim())
  if (state.birthYear.trim()) p.set('birthYear', state.birthYear.trim())
  if (state.maritalStatus.trim()) p.set('maritalStatus', state.maritalStatus.trim())
  if (state.subscribedTri) p.set('subscribed', state.subscribedTri)
  if (state.verifiedTri) p.set('verifiedProfile', state.verifiedTri)
  if (state.page > 0) p.set('page', String(state.page))

  return p
}

/** Serialize filters for URL or sessionStorage (empty string when all defaults). */
export function serializeSalesListFiltersForStorage(state: SalesListUrlState): string {
  return toSalesListSearchParams(state).toString()
}
