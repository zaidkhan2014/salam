/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from '@/router/guards'
import { routes } from '@/router/paths'

const LoginPage = lazy(() => import('@/pages/login/LoginPage'))
const OverviewPage = lazy(() => import('@/pages/overview/OverviewPage'))
const FunnelPage = lazy(() => import('@/pages/funnel/FunnelPage'))
const RevenuePage = lazy(() => import('@/pages/revenue/RevenuePage'))
const MatchingPage = lazy(() => import('@/pages/matching/MatchingPage'))
const ChatPage = lazy(() => import('@/pages/chat/ChatPage'))
const SafetyPage = lazy(() => import('@/pages/safety/SafetyPage'))
const DemographicsPage = lazy(() => import('@/pages/demographics/DemographicsPage'))
const OnboardingDropoffPage = lazy(() => import('@/pages/onboarding-dropoff/OnboardingDropoffPage'))
const RetentionPage = lazy(() => import('@/pages/retention/RetentionPage'))
const LifeTogetherPage = lazy(() => import('@/pages/life-together/LifeTogetherPage'))
const SelfiePage = lazy(() => import('@/pages/selfie/SelfiePage'))
const SearchIndexPage = lazy(() => import('@/pages/search-index/SearchIndexPage'))
const OtpPage = lazy(() => import('@/pages/otp/OtpPage'))
const LoginFunnelPage = lazy(() => import('@/pages/login-funnel/LoginFunnelPage'))
const OtpUnverifiedPage = lazy(() => import('@/pages/otp-unverified/OtpUnverifiedPage'))
const LikesPage = lazy(() => import('@/pages/likes/LikesPage'))
const UsersPage = lazy(() => import('@/pages/users/UsersPage'))
const UserDetailPage = lazy(() => import('@/pages/users/UserDetailPage'))
const ReviewQueuePage = lazy(() => import('@/pages/review-queue/ReviewQueuePage'))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'))
const ReportDetailPage = lazy(() => import('@/pages/reports/ReportDetailPage'))
const SalesPage = lazy(() => import('@/pages/sales/SalesPage'))
const SalesFollowUpsPage = lazy(() => import('@/pages/sales/SalesFollowUpsPage'))
const SalesConversionsPage = lazy(() => import('@/pages/sales/SalesConversionsPage'))
const SalesPerformancePage = lazy(() => import('@/pages/sales/SalesPerformancePage'))
const SalesLeadDetailPage = lazy(() => import('@/pages/sales/SalesLeadDetailPage'))
const VipCustomersPage = lazy(() => import('@/pages/vip/VipCustomersPage'))
const VipFollowUpsPage = lazy(() => import('@/pages/vip/VipFollowUpsPage'))
const VipLeadDetailPage = lazy(() => import('@/pages/vip/VipLeadDetailPage'))
const DeletedAccountsPage = lazy(() => import('@/pages/deleted-accounts/DeletedAccountsPage'))
const DeletedAccountsFollowUpsPage = lazy(() => import('@/pages/deleted-accounts/DeletedAccountsFollowUpsPage'))
const DeletedAccountsConversionsPage = lazy(
  () => import('@/pages/deleted-accounts/DeletedAccountsConversionsPage'),
)
const DeletedAccountsPerformancePage = lazy(
  () => import('@/pages/deleted-accounts/DeletedAccountsPerformancePage'),
)
const DeletedAccountsLeadDetailPage = lazy(
  () => import('@/pages/deleted-accounts/DeletedAccountsLeadDetailPage'),
)

function LoadingRoute() {
  return <div className="p-6 text-sm text-slate-500">Loading page...</div>
}

function RouteBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingRoute />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RouteBoundary>
        <PublicOnlyRoute />
      </RouteBoundary>
    ),
    children: [
      {
        path: routes.login.slice(1),
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <RouteBoundary>
        <ProtectedRoute />
      </RouteBoundary>
    ),
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to={routes.overview} replace />,
          },
          { path: routes.overview.slice(1), element: <OverviewPage /> },
          { path: routes.funnel.slice(1), element: <FunnelPage /> },
          { path: routes.revenue.slice(1), element: <RevenuePage /> },
          { path: routes.matching.slice(1), element: <MatchingPage /> },
          { path: routes.chat.slice(1), element: <ChatPage /> },
          { path: routes.safety.slice(1), element: <SafetyPage /> },
          { path: routes.demographics.slice(1), element: <DemographicsPage /> },
          { path: routes.onboardingDropoff.slice(1), element: <OnboardingDropoffPage /> },
          { path: routes.retention.slice(1), element: <RetentionPage /> },
          { path: routes.lifeTogether.slice(1), element: <LifeTogetherPage /> },
          { path: routes.selfie.slice(1), element: <SelfiePage /> },
          { path: routes.searchIndex.slice(1), element: <SearchIndexPage /> },
          { path: routes.otp.slice(1), element: <OtpPage /> },
          { path: routes.loginFunnel.slice(1), element: <LoginFunnelPage /> },
          { path: routes.otpUnverified.slice(1), element: <OtpUnverifiedPage /> },
          { path: routes.likes.slice(1), element: <LikesPage /> },
          { path: routes.users.slice(1), element: <UsersPage /> },
          { path: 'users/:userId', element: <UserDetailPage /> },
          { path: routes.reviewQueue.slice(1), element: <ReviewQueuePage /> },
          { path: routes.reports.slice(1), element: <ReportsPage /> },
          { path: 'reports/:reportId', element: <ReportDetailPage /> },
          { path: routes.sales.slice(1), element: <SalesPage /> },
          { path: 'sales/follow-ups', element: <SalesFollowUpsPage /> },
          { path: 'sales/conversions', element: <SalesConversionsPage /> },
          { path: 'sales/performance', element: <SalesPerformancePage /> },
          { path: 'sales/:userId', element: <SalesLeadDetailPage /> },
          { path: routes.vip.slice(1), element: <VipCustomersPage /> },
          { path: 'vip/follow-ups', element: <VipFollowUpsPage /> },
          { path: 'vip/:userId', element: <VipLeadDetailPage /> },
          { path: routes.deletedAccounts.slice(1), element: <DeletedAccountsPage /> },
          { path: 'deleted-accounts/follow-ups', element: <DeletedAccountsFollowUpsPage /> },
          { path: 'deleted-accounts/conversions', element: <DeletedAccountsConversionsPage /> },
          { path: 'deleted-accounts/performance', element: <DeletedAccountsPerformancePage /> },
          { path: 'deleted-accounts/:userId', element: <DeletedAccountsLeadDetailPage /> },
        ],
      },
    ],
  },
])
