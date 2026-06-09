import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  BarChart3,
  Database,
  Funnel,
  HandCoins,
  ShieldAlert,
  Users,
  MessageSquare,
  HeartHandshake,
  IndianRupee,
  PieChart,
  Repeat,
  LogOut,
  ScanSearch,
  Smartphone,
  ThumbsUp,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/cn'
import { routes } from '@/router/paths'

const links = [
  { to: routes.overview, label: 'Overview', icon: BarChart3 },
  { to: routes.funnel, label: 'Funnel', icon: Funnel },
  { to: routes.revenue, label: 'Revenue', icon: IndianRupee },
  { to: routes.matching, label: 'Matching', icon: HeartHandshake },
  { to: routes.chat, label: 'Chat', icon: MessageSquare },
  { to: routes.safety, label: 'Safety', icon: ShieldAlert },
  { to: routes.demographics, label: 'Demographics', icon: PieChart },
  { to: routes.retention, label: 'Retention', icon: Repeat },
  { to: routes.lifeTogether, label: 'Life Together', icon: HandCoins },
  { to: routes.selfie, label: 'Selfie', icon: BadgeCheck },
  { to: routes.searchIndex, label: 'Search Index', icon: ScanSearch },
  { to: routes.otp, label: 'OTP', icon: Smartphone },
  { to: routes.likes, label: 'Likes', icon: ThumbsUp },
  { to: routes.users, label: 'Users', icon: Users },
  { to: routes.reports, label: 'Reports', icon: ClipboardList },
  { to: routes.sales, label: 'Sales', icon: Database },
]

export function AppShell() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen min-w-0 bg-slate-50 md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-10 flex h-fit min-w-0 items-center justify-between border-b border-slate-200 bg-white p-3 md:h-screen md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:p-4">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Admin Panel</h2>
          <nav className="hidden space-y-1 md:block">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100',
                    isActive && 'bg-slate-900 text-white hover:bg-slate-900',
                  )
                }
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate(routes.login)
          }}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>
      <main className="min-w-0 p-4 md:p-6">
        <div className="mx-auto w-full min-w-0 max-w-7xl">
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {links.map((item) => (
              <NavLink
                key={`mobile-${item.to}`}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600',
                    isActive && 'border-slate-900 bg-slate-900 text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
