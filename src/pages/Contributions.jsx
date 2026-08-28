import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  useContributions,
  useCreateContribution,
  useDeleteContribution,
} from '../api/hooks'
import {
  Avatar,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
} from '../components/ui'
import { formatDate, formatINR } from '../utils/format'

const TYPES = ['All', 'Donation', 'Annadham', 'Sponsorship', 'Other']

const typeStyles = {
  Donation: 'bg-violet-100 text-violet-800',
  Annadham: 'bg-orange-100 text-orange-800',
  Sponsorship: 'bg-emerald-100 text-emerald-800',
  Other: 'bg-stone-100 text-stone-700',
}

export default function Contributions() {
  const [type, setType] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    member_name: '',
    amount: '',
    type: 'Donation',
    notes: '',
  })
  const [error, setError] = useState('')

  const params = useMemo(
    () => ({ type: type === 'All' ? undefined : type }),
    [type],
  )

  const { data: contributions = [], isLoading, error: queryError } =
    useContributions(params)
  const createContribution = useCreateContribution()
  const deleteContribution = useDeleteContribution()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await createContribution.mutateAsync({
        member_name: form.member_name.trim(),
        amount: Number(form.amount),
        type: form.type,
        notes: form.notes,
      })
      setModalOpen(false)
      setForm({ member_name: '', amount: '', type: 'Donation', notes: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this contribution?')) return
    await deleteContribution.mutateAsync(id)
  }

  const total = contributions.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div>
      <PageHeader
        title="Contributions"
        subtitle="Donations, Annadham sponsorships, and other receipts"
        action={
          <button
            type="button"
            onClick={() => {
              setError('')
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            <Plus size={16} /> Record Contribution
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                type === t
                  ? 'bg-ink text-cream'
                  : 'bg-white text-ink-muted ring-1 ring-sand hover:bg-cream-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{formatINR(total)}</span>{' '}
          across {contributions.length} records
        </p>
      </div>

      {queryError && <ErrorState message={queryError.message} />}
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="bg-[#f0eadd] text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {contributions.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.member_name || 'U'} />
                        <span className="font-medium">
                          {c.member_name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          typeStyles[c.type] || typeStyles.Other
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {formatINR(c.amount)}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {formatDate(c.date)}
                    </td>
                    <td className="max-w-xs truncate px-5 py-4 text-ink-muted">
                      {c.notes || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {contributions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-ink-muted"
                    >
                      No contributions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Contribution"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <ErrorState message={error} />}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Member
            </span>
            <input
              required
              type="text"
              placeholder="Enter member name"
              value={form.member_name}
              onChange={(e) =>
                setForm({ ...form, member_name: e.target.value })
              }
              className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Amount
              </span>
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Type
              </span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
              >
                {TYPES.filter((t) => t !== 'All').map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Notes
            </span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <p className="text-xs text-ink-muted">
            Type a member name — existing members are matched automatically, or
            a new member is created. Their paid amount is updated too.
          </p>
          <button
            type="submit"
            disabled={createContribution.isPending}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
          >
            Save Contribution
          </button>
        </form>
      </Modal>
    </div>
  )
}
