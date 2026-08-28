import { useMemo, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import {
  useMembers,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
} from '../api/hooks'
import {
  Avatar,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
  StatusBadge,
} from '../components/ui'
import { formatINR } from '../utils/format'

const STATUSES = ['All', 'Paid', 'Pending']

const emptyForm = {
  name: '',
  phone_number: '',
  total_amount: '',
  paid: '',
  role: 'Member',
}

export default function Members() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status === 'All' ? undefined : status,
    }),
    [search, status],
  )

  const { data: members = [], isLoading, error: queryError } = useMembers(params)
  const createMember = useCreateMember()
  const updateMember = useUpdateMember()
  const deleteMember = useDeleteMember()

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(m) {
    setEditing(m)
    setForm({
      name: m.name,
      phone_number: m.phone_number,
      total_amount: String(m.total_amount),
      paid: String(m.paid),
      role: m.role || 'Member',
    })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      name: form.name.trim(),
      phone_number: form.phone_number.trim(),
      total_amount: Number(form.total_amount) || 0,
      paid: Number(form.paid) || 0,
      role: form.role.trim() || 'Member',
    }
    try {
      if (editing) {
        await updateMember.mutateAsync({ id: editing.id, data: payload })
      } else {
        await createMember.mutateAsync(payload)
      }
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this member?')) return
    await deleteMember.mutateAsync(id)
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle="Track pledges, payments, and outstanding balances"
      />

      <div className="mb-4 flex items-end justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
          Member Roster
        </p>
        <p className="text-sm text-ink-muted">{members.length} total</p>
      </div>
      <div className="mb-4 h-px bg-sand" />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-sand bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All Status' : s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {queryError && <ErrorState message={queryError.message} />}
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="bg-[#f0eadd] text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Phone Number</th>
                  <th className="px-5 py-3 font-semibold">Total Amount</th>
                  <th className="px-5 py-3 font-semibold">Paid</th>
                  <th className="px-5 py-3 font-semibold">Balance</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="cursor-pointer transition-colors hover:bg-cream/60"
                    onClick={() => openEdit(m)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} />
                        <span className="font-medium text-ink">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{m.phone_number}</td>
                    <td className="px-5 py-4 font-medium">
                      {formatINR(m.total_amount)}
                    </td>
                    <td className="px-5 py-4">{formatINR(m.paid)}</td>
                    <td className="px-5 py-4">{formatINR(m.balance)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(m.id)
                        }}
                        aria-label="Delete member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-ink-muted"
                    >
                      No members yet — add your first member
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
        title={editing ? 'Edit Member' : 'Add Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <ErrorState message={error} />}
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field"
            />
          </Field>
          <Field label="Phone Number">
            <input
              required
              value={form.phone_number}
              onChange={(e) =>
                setForm({ ...form, phone_number: e.target.value })
              }
              className="field"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total Amount">
              <input
                type="number"
                min="0"
                step="1"
                value={form.total_amount}
                onChange={(e) =>
                  setForm({ ...form, total_amount: e.target.value })
                }
                className="field"
              />
            </Field>
            <Field label="Paid">
              <input
                type="number"
                min="0"
                step="1"
                value={form.paid}
                onChange={(e) => setForm({ ...form, paid: e.target.value })}
                className="field"
              />
            </Field>
          </div>
          <Field label="Role">
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="field"
            />
          </Field>
          <p className="text-xs text-ink-muted">
            Status is <strong>Paid</strong> when paid ≥ total amount; otherwise{' '}
            <strong>Pending</strong>.
          </p>
          <button
            type="submit"
            disabled={createMember.isPending || updateMember.isPending}
            className="mt-2 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {editing ? 'Save Changes' : 'Add Member'}
          </button>
        </form>
      </Modal>

      <style>{`
        .field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e8dfd0;
          background: white;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .field:focus { border-color: #c45c26; }
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  )
}
