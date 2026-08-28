import { useMemo, useState } from 'react'
import { Calendar, MapPin, Pencil, Plus, Trash2, User } from 'lucide-react'
import {
  useCreateEvent,
  useCreateFestivalDay,
  useDeleteEvent,
  useDeleteFestivalDay,
  useEvents,
  useFestivalDays,
  useStats,
  useUpdateEvent,
  useUpdateFestivalDay,
} from '../api/hooks'
import {
  CategoryBadge,
  ErrorState,
  EventStatusBadge,
  LoadingState,
  Modal,
  PageHeader,
  StatCard,
} from '../components/ui'

const CATEGORIES = ['All', 'Ritual', 'Homa', 'Annadham', 'Cultural']
const EVENT_CATEGORIES = ['Ritual', 'Homa', 'Annadham', 'Cultural']
const EVENT_STATUSES = ['Scheduled', 'Confirmed']

const emptyForm = {
  title: '',
  category: 'Ritual',
  status: 'Scheduled',
  festivalDayId: '',
  time: '',
  location: '',
  person: '',
}

const emptyDayForm = {
  day: '',
  date_label: '',
}

export default function Events() {
  const [day, setDay] = useState(null)
  const [category, setCategory] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [daysModalOpen, setDaysModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editingDay, setEditingDay] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [dayForm, setDayForm] = useState(emptyDayForm)
  const [error, setError] = useState('')
  const [dayError, setDayError] = useState('')

  const params = useMemo(
    () => ({
      day: day ?? undefined,
      category: category === 'All' ? undefined : category,
    }),
    [day, category],
  )

  const { data: festivalDays = [], isLoading: daysLoading } = useFestivalDays()
  const { data: events = [], isLoading, error: queryError } = useEvents(params)
  const { data: stats } = useStats()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const createFestivalDay = useCreateFestivalDay()
  const updateFestivalDay = useUpdateFestivalDay()
  const deleteFestivalDay = useDeleteFestivalDay()

  const grouped = useMemo(() => {
    const map = new Map()
    for (const event of events) {
      const key = `Day ${event.day} — ${event.date_label}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(event)
    }
    return [...map.entries()]
  }, [events])

  const nextDayNumber = useMemo(() => {
    if (festivalDays.length === 0) return 1
    return Math.max(...festivalDays.map((d) => d.day)) + 1
  }, [festivalDays])

  function getFestivalDayById(id) {
    return festivalDays.find((d) => d.id === id)
  }

  function getFestivalDayForEvent(event) {
    return festivalDays.find(
      (d) => d.day === event.day && d.date_label === event.date_label,
    )
  }

  function openCreate() {
    if (festivalDays.length === 0) {
      setDaysModalOpen(true)
      setDayForm({ day: String(nextDayNumber), date_label: '' })
      return
    }
    setEditing(null)
    setForm({
      ...emptyForm,
      festivalDayId: festivalDays.find((d) => d.day === day)?.id || festivalDays[0].id,
    })
    setError('')
    setModalOpen(true)
  }

  function openEdit(event) {
    const fd = getFestivalDayForEvent(event)
    setEditing(event)
    setForm({
      title: event.title,
      category: event.category,
      status: event.status,
      festivalDayId: fd?.id || '',
      time: event.time,
      location: event.location,
      person: event.person || '',
    })
    setError('')
    setModalOpen(true)
  }

  function openDaysModal() {
    setEditingDay(null)
    setDayForm({ day: String(nextDayNumber), date_label: '' })
    setDayError('')
    setDaysModalOpen(true)
  }

  function openEditDay(fd) {
    setEditingDay(fd)
    setDayForm({ day: String(fd.day), date_label: fd.date_label })
    setDayError('')
    setDaysModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const selected = getFestivalDayById(form.festivalDayId)
    if (!selected) {
      setError('Please select a schedule day')
      return
    }
    const payload = {
      title: form.title.trim(),
      category: form.category,
      status: form.status,
      day: selected.day,
      date_label: selected.date_label,
      time: form.time.trim(),
      location: form.location.trim(),
      person: form.person.trim(),
    }
    try {
      if (editing) {
        await updateEvent.mutateAsync({ id: editing.id, data: payload })
      } else {
        await createEvent.mutateAsync(payload)
      }
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDaySubmit(e) {
    e.preventDefault()
    setDayError('')
    const payload = {
      day: Number(dayForm.day),
      date_label: dayForm.date_label.trim(),
    }
    try {
      if (editingDay) {
        await updateFestivalDay.mutateAsync({ id: editingDay.id, data: payload })
      } else {
        await createFestivalDay.mutateAsync(payload)
      }
      setDaysModalOpen(false)
    } catch (err) {
      setDayError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return
    await deleteEvent.mutateAsync(id)
  }

  async function handleDeleteDay(id) {
    if (!window.confirm('Delete this schedule day section?')) return
    await deleteFestivalDay.mutateAsync(id)
  }

  return (
    <div>
      <PageHeader
        title="04 Events & Schedule"
        subtitle="Rituals, Annadham sittings, homa, and cultural programmes"
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openDaysModal}
              className="inline-flex items-center gap-2 rounded-xl border border-sand bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-cream-dark"
            >
              <Calendar size={16} /> Manage Days
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              <Plus size={16} /> Add Event
            </button>
          </div>
        }
      />

      {stats && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setDay(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            day === null
              ? 'bg-ink text-cream'
              : 'bg-white text-ink-muted ring-1 ring-sand hover:bg-cream-dark'
          }`}
        >
          All Days
        </button>
        {festivalDays.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDay(d.day)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              day === d.day
                ? 'bg-ink text-cream'
                : 'bg-white text-ink-muted ring-1 ring-sand hover:bg-cream-dark'
            }`}
          >
            {d.label}
          </button>
        ))}
        {festivalDays.length === 0 && !daysLoading && (
          <button
            type="button"
            onClick={openDaysModal}
            className="rounded-full px-4 py-2 text-sm font-medium text-accent ring-1 ring-accent/30 hover:bg-orange-50"
          >
            + Add schedule days
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              category === c
                ? 'bg-ink text-cream'
                : c === 'Ritual'
                  ? 'bg-violet-100 text-violet-800'
                  : c === 'Homa'
                    ? 'bg-amber-100 text-amber-800'
                    : c === 'Annadham'
                      ? 'bg-orange-100 text-orange-800'
                      : c === 'Cultural'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-white text-ink-muted ring-1 ring-sand'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {queryError && <ErrorState message={queryError.message} />}
      {isLoading ? (
        <LoadingState />
      ) : grouped.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-ink-muted">No events found</p>
          {festivalDays.length === 0 ? (
            <button
              type="button"
              onClick={openDaysModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-sand bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-cream-dark"
            >
              <Calendar size={16} /> Set up schedule days first
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              <Plus size={16} /> Add your first event
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(([label, dayEvents]) => (
            <section key={label}>
              <div className="mb-5 flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold">{label}</h2>
                <span className="text-sm text-ink-muted">
                  {dayEvents.length} events
                </span>
              </div>

              <div className="relative space-y-0">
                {dayEvents.map((event, idx) => (
                  <div key={event.id} className="relative flex gap-4 pb-6 sm:gap-6">
                    <div className="w-20 shrink-0 pt-1 text-right sm:w-24">
                      <span className="text-sm font-semibold text-ink">
                        {event.time}
                      </span>
                    </div>

                    <div className="relative flex w-4 shrink-0 flex-col items-center">
                      <div
                        className={`z-10 mt-2 h-3 w-3 rounded-full border-2 ${
                          event.status === 'Confirmed'
                            ? 'border-cultural bg-cultural'
                            : 'border-accent bg-white'
                        }`}
                      />
                      {idx < dayEvents.length - 1 && (
                        <div className="absolute top-5 bottom-0 w-px bg-sand" />
                      )}
                    </div>

                    <div
                      className="group min-w-0 flex-1 cursor-pointer rounded-2xl border border-sand bg-white p-4 shadow-sm transition-colors hover:border-accent/40 sm:p-5"
                      onClick={() => openEdit(event)}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <CategoryBadge category={event.category} />
                        <EventStatusBadge status={event.status} />
                        <div className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEdit(event)
                            }}
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-cream-dark hover:text-ink"
                            aria-label="Edit event"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(event.id)
                            }}
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-ink sm:text-xl">
                        {event.title}
                      </h3>
                      <div className="mt-3 flex flex-col gap-1.5 text-sm text-ink-muted sm:flex-row sm:gap-5">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-accent" />
                          {event.location}
                        </span>
                        {event.person && (
                          <span className="inline-flex items-center gap-1.5">
                            <User size={14} className="text-ritual" />
                            {event.person}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Event modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Event' : 'Add Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <ErrorState message={error} />}

          <Field label="Title">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="field"
              placeholder="e.g. Suprabhatam & Thiruvanandal"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="field"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="field"
              >
                {EVENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Schedule Day">
              <select
                required
                value={form.festivalDayId}
                onChange={(e) =>
                  setForm({ ...form, festivalDayId: e.target.value })
                }
                className="field"
              >
                <option value="">Select day…</option>
                {festivalDays.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Time">
              <input
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="field"
                placeholder="05:30 AM"
              />
            </Field>
          </div>

          <Field label="Location">
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="field"
              placeholder="Main Sanctum"
            />
          </Field>

          <Field label="Person / Sponsor">
            <input
              value={form.person}
              onChange={(e) => setForm({ ...form, person: e.target.value })}
              className="field"
              placeholder="Pandit Sriramachandran"
            />
          </Field>

          <button
            type="submit"
            disabled={createEvent.isPending || updateEvent.isPending}
            className="mt-2 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {editing ? 'Save Changes' : 'Add Event'}
          </button>
        </form>
      </Modal>

      {/* Manage schedule days modal */}
      <Modal
        open={daysModalOpen}
        onClose={() => setDaysModalOpen(false)}
        title="Schedule Days"
      >
        <p className="mb-4 text-sm text-ink-muted">
          Define your festival day sections with custom dates (e.g. Day 1 — Oct 18,
          Day 2 — 15 Nov).
        </p>

        {festivalDays.length > 0 && (
          <ul className="mb-4 divide-y divide-sand rounded-xl border border-sand">
            {festivalDays.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="text-sm font-medium">{d.label}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEditDay(d)}
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-cream-dark"
                    aria-label="Edit day"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDay(d.id)}
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete day"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleDaySubmit} className="space-y-3 border-t border-sand pt-4">
          {dayError && <ErrorState message={dayError} />}
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {editingDay ? 'Edit day section' : 'Add day section'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Day #">
              <input
                required
                type="number"
                min="1"
                max="30"
                value={dayForm.day}
                onChange={(e) => setDayForm({ ...dayForm, day: e.target.value })}
                className="field"
              />
            </Field>
            <Field label="Date label">
              <input
                required
                value={dayForm.date_label}
                onChange={(e) =>
                  setDayForm({ ...dayForm, date_label: e.target.value })
                }
                className="field"
                placeholder="Oct 18, 15 Nov, Opening…"
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={createFestivalDay.isPending || updateFestivalDay.isPending}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {editingDay ? 'Save Day' : 'Add Day Section'}
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
