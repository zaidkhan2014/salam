const METRIC_TITLE_OVERRIDES: Record<string, string> = {
  otp_requested: 'OTP requested',
  otp_success: 'OTP success',
  otp_failed: 'OTP failed',
  onboarding_completed_approved: 'Onboarding completed (approved)',
}

const BREAKDOWN_KEY_OVERRIDES: Record<string, string> = {
  IOS: 'iOS',
  ANDROID: 'Android',
  UNKNOWN: 'Unknown',
}

function titleCaseFromSnakeCase(key: string): string {
  return key
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** Human-readable chart/card titles; known keys (e.g. OTP) use product acronyms. */
export function formatMetricTitle(key: string): string {
  const override = METRIC_TITLE_OVERRIDES[key]
  if (override) return override
  return titleCaseFromSnakeCase(key)
}

/** Human-readable metric breakdown keys (e.g. platform IOS → iOS). */
export function formatBreakdownKey(key: string): string {
  const upper = key.trim().toUpperCase()
  const override = BREAKDOWN_KEY_OVERRIDES[upper]
  if (override) return override
  return key
}

const PLATFORM_BREAKDOWN_KEYS = new Set(['IOS', 'ANDROID', 'UNKNOWN'])

export function isPlatformBreakdown(keys: string[]): boolean {
  if (keys.length === 0) return false
  return keys.every((key) => PLATFORM_BREAKDOWN_KEYS.has(key.trim().toUpperCase()))
}
