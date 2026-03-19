import { Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/AdminDashboard'
import Tenants from './pages/admin/Tenants'
import Users from './pages/admin/Users'
import AuditLogs from './pages/admin/AuditLogs'
import TenantDashboard from './pages/tenant/TenantDashboard'
import TenantUsers from './pages/tenant/TenantUsers'
import UserDashboard from './pages/user/UserDashboard'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/tenants" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <Tenants />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <Users />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/audit-logs" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AuditLogs />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/tenant" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['tenant']}>
              <TenantDashboard />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/tenant/users" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['tenant']}>
              <TenantUsers />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/user" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['user']}>
              <UserDashboard />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <Analytics />
    </AuthProvider>
  )
}

export default App
