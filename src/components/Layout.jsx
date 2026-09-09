import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  HandCoins,
  CalendarDays,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { initials } from '../utils/format'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/contributions', label: 'Contributions', icon: HandCoins },
  { to: '/events', label: 'Events & Schedule', icon: CalendarDays },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const userInitials = user ? initials(user.name) : 'U'

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-sand bg-[#faf7f2] transition-transform lg:static lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-sand px-5">
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-ink">
                Ganesh Chaturthi
              </p>
              <p className="text-[11px] uppercase tracking-[0.15em] text-ink-muted">
                Festival Manager
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-ink-muted hover:bg-sand lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1 p-3">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-ink text-cream'
                      : 'text-ink-muted hover:bg-cream-dark hover:text-ink'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-sand p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-ink-muted">
                  {user?.role === 'admin' ? 'Admin' : 'View only'} · {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-ink-muted hover:bg-cream-dark hover:text-ink"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close overlay"
          />
        )}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-sand bg-cream/90 px-4 backdrop-blur-sm lg:hidden">
            <button
              type="button"
              className="rounded-lg p-2 text-ink hover:bg-cream-dark"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="font-display text-lg font-semibold">Ganesh Chaturthi</span>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
