export function StatusBadge({ status }) {
  const paid = status === 'Paid'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        paid
          ? 'bg-paid-bg text-paid'
          : 'bg-pending-bg text-pending'
      }`}
    >
      {status}
    </span>
  )
}

export function CategoryBadge({ category }) {
  const styles = {
    Ritual: 'bg-violet-100 text-violet-800',
    Homa: 'bg-amber-100 text-amber-800',
    Annadham: 'bg-orange-100 text-orange-800',
    Cultural: 'bg-emerald-100 text-emerald-800',
  }
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        styles[category] || 'bg-stone-100 text-stone-700'
      }`}
    >
      {category}
    </span>
  )
}

export function EventStatusBadge({ status }) {
  const confirmed = status === 'Confirmed'
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        confirmed
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-orange-100 text-orange-800'
      }`}
    >
      {status}
    </span>
  )
}

export function Avatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const colors = [
    'bg-[#e8c4a8] text-[#8b4513]',
    'bg-[#f5c6cb] text-[#8b2252]',
    'bg-[#c5e0d8] text-[#2d5a4a]',
    'bg-[#d4c4e8] text-[#5b3a7a]',
    'bg-[#c8d9e8] text-[#2a4a6a]',
    'bg-[#e8dcc4] text-[#6b5420]',
  ]
  const color = colors[Math.abs(hash) % colors.length]

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${color}`}
    >
      {initials}
    </div>
  )
}

export function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-sand bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-3xl font-semibold tracking-tight ${
          accent || 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-sand bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-ink-muted hover:bg-cream"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20 text-sm text-ink-muted">
      Loading…
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message || 'Something went wrong'}
    </div>
  )
}
