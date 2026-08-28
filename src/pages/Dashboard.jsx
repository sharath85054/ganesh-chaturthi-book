import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, HandCoins, Users } from 'lucide-react'
import { useStats, useMembers, useEvents } from '../api/hooks'
import {
  StatCard,
  PageHeader,
  LoadingState,
  ErrorState,
  StatusBadge,
  Avatar,
  CategoryBadge,
} from '../components/ui'
import { formatINR } from '../utils/format'

export default function Dashboard() {
  const { data: stats, isLoading, error } = useStats()
  const { data: members = [] } = useMembers({})
  const { data: events = [] } = useEvents({})

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} />

  const recentMembers = members.slice(0, 5)
  const upcoming = events.slice(0, 4)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Sri Venkateshwara Utsav 2025 — overview of members, donations & schedule"
        action={
          <span className="rounded-full border border-sand bg-white px-3 py-1 text-xs font-medium text-ink-muted">
            Sri Venkateshwara Utsav 2025
          </span>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Members" value={stats.total_members} />
        <StatCard
          label="Collected"
          value={formatINR(stats.total_collected)}
          accent="text-cultural"
        />
        <StatCard
          label="Balance Due"
          value={formatINR(stats.total_balance)}
          accent="text-accent"
        />
        <StatCard
          label="Pending Members"
          value={stats.pending_members}
          accent="text-pending"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Events" value={stats.total_events} />
        <StatCard
          label="Ritual Events"
          value={stats.ritual_events}
          accent="text-ritual"
        />
        <StatCard
          label="Cultural Events"
          value={stats.cultural_events}
          accent="text-cultural"
        />
        <StatCard
          label="Annadham Sittings"
          value={stats.annadham_events}
          accent="text-annadham"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent members */}
        <section className="rounded-2xl border border-sand bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-sand px-5 py-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-ink-muted" />
              <h2 className="font-display text-lg font-semibold">Members</h2>
            </div>
            <Link
              to="/members"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="divide-y divide-sand">
            {recentMembers.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={m.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-ink-muted">{m.phone_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatINR(m.paid)}</p>
                  <StatusBadge status={m.status} />
                </div>
              </li>
            ))}
            {recentMembers.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-ink-muted">
                No members yet
              </li>
            )}
          </ul>
        </section>

        {/* Upcoming events */}
        <section className="rounded-2xl border border-sand bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-sand px-5 py-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-ink-muted" />
              <h2 className="font-display text-lg font-semibold">Schedule</h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="divide-y divide-sand">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap gap-1.5">
                    <CategoryBadge category={e.category} />
                  </div>
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-ink-muted">
                    Day {e.day} · {e.time} · {e.location}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-ink-muted">
                  {e.date_label}
                </span>
              </li>
            ))}
            {upcoming.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-ink-muted">
                No events yet
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/contributions"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          <HandCoins size={16} /> Record Contribution
        </Link>
        <Link
          to="/members"
          className="inline-flex items-center gap-2 rounded-xl border border-sand bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-cream-dark"
        >
          <Users size={16} /> Manage Members
        </Link>
      </div>
    </div>
  )
}
