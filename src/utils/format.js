export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

const AVATAR_COLORS = [
  'bg-[#e8c4a8] text-[#8b4513]',
  'bg-[#f5c6cb] text-[#8b2252]',
  'bg-[#c5e0d8] text-[#2d5a4a]',
  'bg-[#d4c4e8] text-[#5b3a7a]',
  'bg-[#c8d9e8] text-[#2a4a6a]',
  'bg-[#e8dcc4] text-[#6b5420]',
]

export function avatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
