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
const RetentionPage = lazy(() => import('@/pages/retention/RetentionPage'))
const LifeTogetherPage = lazy(() => import('@/pages/life-together/LifeTogetherPage'))
const SelfiePage = lazy(() => import('@/pages/selfie/SelfiePage'))
const SearchIndexPage = lazy(() => import('@/pages/search-index/SearchIndexPage'))
const OtpPage = lazy(() => import('@/pages/otp/OtpPage'))
const LikesPage = lazy(() => import('@/pages/likes/LikesPage'))
const UsersPage = lazy(() => import('@/pages/users/UsersPage'))
const UserDetailPage = lazy(() => import('@/pages/users/UserDetailPage'))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'))
const ReportDetailPage = lazy(() => import('@/pages/reports/ReportDetailPage'))
const SalesPage = lazy(() => import('@/pages/sales/SalesPage'))
const SalesLeadDetailPage = lazy(() => import('@/pages/sales/SalesLeadDetailPage'))

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
          { path: routes.retention.slice(1), element: <RetentionPage /> },
          { path: routes.lifeTogether.slice(1), element: <LifeTogetherPage /> },
          { path: routes.selfie.slice(1), element: <SelfiePage /> },
          { path: routes.searchIndex.slice(1), element: <SearchIndexPage /> },
          { path: routes.otp.slice(1), element: <OtpPage /> },
          { path: routes.likes.slice(1), element: <LikesPage /> },
          { path: routes.users.slice(1), element: <UsersPage /> },
          { path: 'users/:userId', element: <UserDetailPage /> },
          { path: routes.reports.slice(1), element: <ReportsPage /> },
          { path: 'reports/:reportId', element: <ReportDetailPage /> },
          { path: routes.sales.slice(1), element: <SalesPage /> },
          { path: 'sales/:userId', element: <SalesLeadDetailPage /> },
        ],
      },
    ],
  },
])
