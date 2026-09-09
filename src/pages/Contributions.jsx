import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useContributions,
  useCreateContribution,
  useUpdateContribution,
  useDeleteContribution,
} from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
import {
  Avatar,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
} from '../components/ui'
import { formatDate } from '../utils/format'

const TYPES = ['All', 'Donation', 'Annadham', 'Sponsorship', 'Other']

const typeStyles = {
  Donation: 'bg-violet-100 text-violet-800',
  Annadham: 'bg-orange-100 text-orange-800',
  Sponsorship: 'bg-emerald-100 text-emerald-800',
  Other: 'bg-stone-100 text-stone-700',
}

const emptyForm = {
  member_name: '',
  type: 'Donation',
  notes: '',
}

export default function Contributions() {
  const { isAdmin } = useAuth()
  const [type, setType] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const params = useMemo(
    () => ({ type: type === 'All' ? undefined : type }),
    [type],
  )

  const { data: contributions = [], isLoading, error: queryError } =
    useContributions(params)
  const createContribution = useCreateContribution()
  const updateContribution = useUpdateContribution()
  const deleteContribution = useDeleteContribution()

  function openCreate() {
    if (!isAdmin) return
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(c) {
    if (!isAdmin) return
    setEditing(c)
    setForm({
      member_name: c.member_name || '',
      type: c.type || 'Donation',
      notes: c.notes || '',
    })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isAdmin) return
    setError('')
    const payload = {
      member_name: form.member_name.trim(),
      type: form.type,
      notes: form.notes,
    }
    try {
      if (editing) {
        await updateContribution.mutateAsync({ id: editing.id, data: payload })
      } else {
        await createContribution.mutateAsync(payload)
      }
      setModalOpen(false)
      setEditing(null)
      setForm(emptyForm)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) return
    if (!window.confirm('Delete this contribution?')) return
    await deleteContribution.mutateAsync(id)
  }

  return (
    <div>
      <PageHeader
        title="Contributions"
        subtitle="Donations, Annadham sponsorships, and other receipts"
        action={
          isAdmin ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              <Plus size={16} /> Record Contribution
            </button>
          ) : null
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
          <span className="font-semibold text-ink">{contributions.length}</span>{' '}
          {contributions.length === 1 ? 'record' : 'records'}
        </p>
      </div>

      {queryError && <ErrorState message={queryError.message} />}
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-[#f0eadd] text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Notes</th>
                  {isAdmin && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {contributions.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-cream/60 ${isAdmin ? 'cursor-pointer' : ''}`}
                    onClick={() => openEdit(c)}
                  >
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
                    <td className="px-5 py-4 text-ink-muted">
                      {formatDate(c.date)}
                    </td>
                    <td className="max-w-xs truncate px-5 py-4 text-ink-muted">
                      {c.notes || '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEdit(c)
                            }}
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-cream-dark hover:text-ink"
                            aria-label="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(c.id)
                            }}
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {contributions.length === 0 && (
                  <tr>
                    <td
                      colSpan={isAdmin ? 5 : 4}
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

      {isAdmin && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? 'Edit Contribution' : 'Record Contribution'}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <ErrorState message={error} />}
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Name
              </span>
              <input
                required
                type="text"
                placeholder="Enter name"
                value={form.member_name}
                onChange={(e) =>
                  setForm({ ...form, member_name: e.target.value })
                }
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
            <button
              type="submit"
              disabled={
                createContribution.isPending || updateContribution.isPending
              }
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {editing ? 'Save Changes' : 'Save Contribution'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
