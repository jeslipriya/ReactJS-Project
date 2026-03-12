import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    switch(user?.role) {
      case 'admin':
        return <Navigate to="/admin" />
      case 'tenant':
        return <Navigate to="/tenant" />
      case 'user':
        return <Navigate to="/user" />
      default:
        return <Navigate to="/login" />
    }
  }

  return children
}

export default RoleRoute