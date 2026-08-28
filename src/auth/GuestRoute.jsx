import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { LoadingState } from '../components/ui'

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <LoadingState />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}
