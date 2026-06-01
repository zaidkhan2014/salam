/** ISO-8601 instant from server JSON */
export type IsoInstant = string

export interface ErrorResponse {
  timestamp: IsoInstant
  status: number
  error: string
  message: string
}

// --- Auth ---

export interface AdminTokenRequest {
  adminUserId: string
}

export interface AdminTokenResponse {
  accessToken: string
  expiresAt: IsoInstant
  scope: string
  roles: string[]
  sessionId: string
}

// --- Analytics ---

export type Granularity = 'DAILY' | 'WEEKLY' | 'MONTHLY'
export type GranularityInput = 'daily' | 'weekly' | 'monthly'

export interface AdminMetricPoint {
  bucket: string
  value: number
}

export interface AdminBreakdownItem {
  key: string
  value: number
}

export interface AdminMetricCard {
  key: string
  total: number
  series: AdminMetricPoint[]
  breakdown: AdminBreakdownItem[]
}

export interface AdminMetricsResponse {
  start: IsoInstant
  end: IsoInstant
  granularity: Granularity
  metrics: AdminMetricCard[]
}

/** Expected metric keys from `GET …/analytics/otp` (each backed by auth_info timestamps). */
export type OtpAnalyticsMetricKey = 'otp_requested' | 'otp_success' | 'otp_failed'

// --- User profile (nested on user detail + sales detail) ---

export type ProfileStatus = 'APPROVED' | 'PENDING' | 'REJECTED'
export type BioModerationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
export type AccountStatus = 'ACTIVE' | 'DELETED' | 'BANNED'
export type ContactPrivacy = 'PREMIUM' | 'PREFERENCE'
export type MediaModerationState = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
export type GalleryVisibility = 'OPEN' | 'BLUR_ALL' | 'SHOW_TO_LIKED'

export interface BasicDetails {
  profileCreatedFor?: string | null
  fullName?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  maritalStatus?: string | null
  height?: number | null
  city?: string | null
  state?: string | null
  country?: string | null
  ethnicity?: string | null
}

export interface Location {
  latitude: number
  longitude: number
  updatedAt?: IsoInstant | null
}

export interface CareerEducation {
  education?: string | null
  profession?: string | null
  industry?: string | null
  incomeBandId?: string | null
  incomeLabel?: string | null
  incomePerYearUsd?: number | null
  incomeCurrency?: string | null
  savingAssetsBandId?: string | null
  savingAssetsLabel?: string | null
  savingAssetsCurrency?: string | null
  savingAssetsUsd?: number | null
}

export interface FaithPractice {
  sect?: string | null
  caste?: string | null
  islamicDress?: string | null
  religiousPractice?: string | null
  bornMuslim?: string | null
  faithPoints?: string[] | null
}

export interface Personality {
  personalityPoints?: string[] | null
}

export interface Health {
  smoke?: string | null
  alcohol?: string | null
  emotionalWellBeing?: string | null
  therapyStatus?: string | null
  physicalHealth?: string | null
  marryingWithHealthChallenges?: string | null
  halalFood?: string | null
}

export interface Family {
  familyType?: string | null
  familyStatus?: string | null
  fatherOccupation?: string | null
  motherOccupation?: string | null
  brothers?: string | null
  sisters?: string | null
}

export interface Media {
  publicId?: string | null
  url?: string | null
  type?: string | null
  orderIndex?: number
  createdAt?: IsoInstant | null
  accessMode?: string | null
  format?: string | null
  moderationState?: MediaModerationState | null
  moderationReasons?: string[] | null
  moderationQueuedAt?: IsoInstant | null
  moderationAttemptCount?: number
  lastModerationError?: string | null
  decidedAt?: IsoInstant | null
}

export interface MediaGallery {
  items?: Media[] | null
  visibility?: GalleryVisibility | null
}

export interface Age {
  minAge?: number | null
  maxAge?: number | null
}

export interface Height {
  minHeight?: number | null
  maxHeight?: number | null
}

export interface FilterField<T> {
  values?: T | null
  isStrict?: boolean
}

export interface PartnerPreferences {
  age?: Age | null
  country?: string[] | null
  sect?: string[] | null
  height?: FilterField<Height> | null
  maritalStatus?: FilterField<string[]> | null
  state?: FilterField<string[]> | null
  city?: FilterField<string[]> | null
  caste?: FilterField<string[]> | null
  ethnicity?: FilterField<string[]> | null
  education?: FilterField<string[]> | null
  profession?: FilterField<string[]> | null
  savingAssets?: FilterField<string | null> | null
  income?: FilterField<string | null> | null
  religiousPractice?: FilterField<string[]> | null
  bornMuslim?: FilterField<string | null> | null
  smoke?: FilterField<string | null> | null
  alcohol?: FilterField<string | null> | null
  islamicDress?: FilterField<string[]> | null
}

export interface UserProfile {
  id?: string | null
  userId?: string | null
  phone?: string | null
  memberId?: string | null
  onboardingComplete?: boolean
  onboardingCompletedAt?: IsoInstant | null
  profileComplete?: boolean
  profileCompletedAt?: IsoInstant | null
  firstProfileCompletedAt?: IsoInstant | null
  profileCreationPercentage?: number
  basicDetails?: BasicDetails | null
  careerEducation?: CareerEducation | null
  faithPractice?: FaithPractice | null
  personality?: Personality | null
  health?: Health | null
  family?: Family | null
  mediaGallery?: MediaGallery | null
  partnerPreferences?: PartnerPreferences | null
  bio?: string | null
  bioModerationStatus?: BioModerationStatus | null
  bioModerationReasons?: string[] | null
  bioModeratedAt?: IsoInstant | null
  subscribed?: boolean
  lastSeen?: IsoInstant | null
  verifiedProfile?: boolean
  createdAt?: IsoInstant | null
  location?: Location | null
  approvedPhotoCount?: number
  profileStatus?: ProfileStatus | null
  photoFirstApprovedAt?: IsoInstant | null
  contactPrivacy?: ContactPrivacy | null
  accountStatus?: AccountStatus | null
  deletedAt?: IsoInstant | null
  purgeAt?: IsoInstant | null
}

// --- Users ---

export interface AdminUserSummary {
  userId: string
  memberId: string | null
  phone: string | null
  fullName: string | null
  gender: string | null
  city: string | null
  state: string | null
  country: string | null
  subscribed: boolean
  profileStatus: string | null
  accountStatus: string | null
  createdAt: IsoInstant | null
  lastLoginAt: IsoInstant | null
  lastActivityAt: IsoInstant | null
}

export interface AdminUserSearchResponse {
  items: AdminUserSummary[]
  page: number
  size: number
  total: number
}

export interface AdminUserDetailResponse {
  userId: string
  memberId: string | null
  phone: string | null
  fullName: string | null
  gender: string | null
  city: string | null
  state: string | null
  country: string | null
  profileStatus: string | null
  accountStatus: string | null
  subscribed: boolean
  otpVerified: boolean
  profileRegistered: boolean
  signupAt: IsoInstant | null
  otpVerifiedAt: IsoInstant | null
  onboardingCompletedAt: IsoInstant | null
  profileCompletedAt: IsoInstant | null
  lastLoginAt: IsoInstant | null
  lastActivityAt: IsoInstant | null
  reportsAgainstUser: number
  blocksByUser: number
  blocksAgainstUser: number
  activeMatches: number
  initiatedChats: number
  interactionsSent: number
  profile: UserProfile
}

// --- Reports ---

export type ReportReason =
  | 'HARASSMENT'
  | 'FAKE_PROFILE'
  | 'INAPPROPRIATE_CONTENT'
  | 'SPAM_OR_SCAM'
  | 'NOT_INTERESTED_IN_THIS_PERSON'
  | 'UNDERAGE_OR_MINOR'
  | 'NUDITY'
  | 'PERSONAL'
  | 'HATE_SPEECH'
  | 'OTHER'

export type ReportTargetType = 'PROFILE' | 'PHOTO' | 'BIO' | 'NAME'

export interface AdminReportSummary {
  reportId: string
  reporterUserId: string
  reportedUserId: string
  reason: ReportReason
  reportTargetType: ReportTargetType
  details: string
  createdAt: IsoInstant
}

export type AdminReportDetailResponse = AdminReportSummary

export interface AdminReportSearchResponse {
  items: AdminReportSummary[]
  page: number
  size: number
  total: number
}

// --- Sales ---

export type AdminSalesStatus =
  | 'CALL_REMAINING'
  | 'ALREADY_CALLED'
  | 'CALL_NOT_PICKED'
  | 'CALL_BACK_LATER'
  | 'INTERESTED'
  | 'NOT_INTERESTED'

export interface AdminSalesNoteEntry {
  text: string
  adminUserId: string | null
  createdAt: IsoInstant
}

export interface AdminSalesLeadSummary {
  userId: string
  memberId: string | null
  phone: string | null
  fullName: string | null
  gender: string | null
  city: string | null
  state: string | null
  country: string | null
  createdAt: IsoInstant | null
  profileStatus: string | null
  accountStatus: string | null
  subscribed: boolean
  salesStatus: string
  note: string | null
  followUpAt: IsoInstant | null
  lastCalledAt: IsoInstant | null
  assignedToAdminId: string | null
  updatedAt: IsoInstant | null
}

export interface AdminSalesLeadSearchResponse {
  items: AdminSalesLeadSummary[]
  page: number
  size: number
  total: number
}

export interface AdminSalesLeadDetailResponse {
  profile: UserProfile
  otpVerified: boolean
  profileRegistered: boolean
  signupAt: IsoInstant | null
  otpVerifiedAt: IsoInstant | null
  lastLoginAt: IsoInstant | null
  lastActivityAt: IsoInstant | null
  reportsAgainstUser: number
  blocksByUser: number
  blocksAgainstUser: number
  activeMatches: number
  initiatedChats: number
  interactionsSent: number
  salesStatus: string
  note: string | null
  notes: AdminSalesNoteEntry[]
  followUpAt: IsoInstant | null
  lastCalledAt: IsoInstant | null
  assignedToAdminId: string | null
  salesCreatedAt: IsoInstant | null
  salesUpdatedAt: IsoInstant | null
}

export interface UpdateSalesStatusRequest {
  status: AdminSalesStatus
  lastCalledAt?: IsoInstant | null
}

export interface UpdateSalesNoteRequest {
  note: string
  adminUserId: string | null
}

export interface UpdateSalesFollowUpRequest {
  followUpAt?: IsoInstant | null
}

// --- Filters ---

export interface AnalyticsFilters {
  start?: IsoInstant
  end?: IsoInstant
  granularity?: GranularityInput
}

export interface RetentionFilters {
  cohortStart?: IsoInstant
  cohortEnd?: IsoInstant
}

export interface UserSearchFilters {
  query?: string
  profileStatus?: ProfileStatus
  bioModerationStatus?: BioModerationStatus
  accountStatus?: AccountStatus
  gender?: string
  subscribed?: boolean
  createdStart?: IsoInstant
  createdEnd?: IsoInstant
  page?: number
  size?: number
}

export interface ReportSearchFilters {
  start?: IsoInstant
  end?: IsoInstant
  reason?: ReportReason
  fromUserId?: string
  toUserId?: string
  page?: number
  size?: number
}

export interface SalesLeadsFilters {
  start?: IsoInstant
  end?: IsoInstant
  status?: AdminSalesStatus | 'ALL'
  followUpStart?: IsoInstant
  followUpEnd?: IsoInstant
  query?: string
  /** Same semantics as GET /users/search on user_profiles */
  profileStatus?: ProfileStatus
  accountStatus?: AccountStatus
  /** Exact match on basicDetails.gender (trimmed) */
  gender?: string
  subscribed?: boolean
  verifiedProfile?: boolean
  page?: number
  size?: number
}
