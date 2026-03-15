import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  const [minLoading, setMinLoading] = useState(true)

  useEffect(() => {
    // Ensure spinner shows for at least 300ms to prevent flicker
    const timer = setTimeout(() => setMinLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (loading || minLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    switch(user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />
      case 'tenant':
        return <Navigate to="/tenant" replace />
      case 'user':
        return <Navigate to="/user" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return children
}

export default RoleRoute
