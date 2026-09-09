const API_BASE = import.meta.env.VITE_API_URL || '/api'

let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function request(path, options = {}) {
  const token = localStorage.getItem('utsav_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    onUnauthorized?.()
  }

  if (!res.ok) {
    let detail = 'Request failed'
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request('/auth/me'),

  register: (data) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStats: () => request('/dashboard/stats'),

  getMembers: (params = {}) => {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    if (params.status) q.set('status', params.status)
    if (params.zone) q.set('zone', params.zone)
    const qs = q.toString()
    return request(`/members${qs ? `?${qs}` : ''}`)
  },
  createMember: (data) =>
    request('/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) =>
    request(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),

  getContributions: (params = {}) => {
    const q = new URLSearchParams()
    if (params.member_id) q.set('member_id', params.member_id)
    if (params.type) q.set('type', params.type)
    const qs = q.toString()
    return request(`/contributions${qs ? `?${qs}` : ''}`)
  },
  createContribution: (data) =>
    request('/contributions', { method: 'POST', body: JSON.stringify(data) }),
  updateContribution: (id, data) =>
    request(`/contributions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteContribution: (id) =>
    request(`/contributions/${id}`, { method: 'DELETE' }),

  getEvents: (params = {}) => {
    const q = new URLSearchParams()
    if (params.day != null) q.set('day', params.day)
    if (params.category) q.set('category', params.category)
    const qs = q.toString()
    return request(`/events${qs ? `?${qs}` : ''}`)
  },
  createEvent: (data) =>
    request('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) =>
    request(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  getFestivalDays: () => request('/festival-days'),
  createFestivalDay: (data) =>
    request('/festival-days', { method: 'POST', body: JSON.stringify(data) }),
  updateFestivalDay: (id, data) =>
    request(`/festival-days/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteFestivalDay: (id) =>
    request(`/festival-days/${id}`, { method: 'DELETE' }),
}
