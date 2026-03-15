import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user's role is not allowed, redirect to their appropriate dashboard
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

  // All checks passed, render the protected component
  return children
}

export default RoleRoute
