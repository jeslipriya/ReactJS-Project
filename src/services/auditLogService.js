import api from './api'

export const createAuditLog = async (logData) => {
  try {
    const response = await api.post('/auditLogs', {
      ...logData,
      id: Date.now().toString(),
      timestamp: logData.timestamp || new Date().toISOString(),
      device: navigator.userAgent,
      ip: '127.0.0.1' // In production, this would come from server
    })
    return response.data
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export const logUserLogin = (user) => {
  return createAuditLog({
    action: 'LOGIN',
    user: user.name,
    role: user.role,
    details: 'User logged in'
  })
}

export const logUserLogout = (user) => {
  return createAuditLog({
    action: 'LOGOUT',
    user: user.name,
    role: user.role,
    details: 'User logged out'
  })
}

export const logUserCreated = (admin, newUser) => {
  return createAuditLog({
    action: 'CREATE',
    user: admin.name,
    role: admin.role,
    details: `Created user: ${newUser.name} (${newUser.role})`
  })
}

export const logUserUpdated = (admin, updatedUser) => {
  return createAuditLog({
    action: 'UPDATE',
    user: admin.name,
    role: admin.role,
    details: `Updated user: ${updatedUser.name}`
  })
}

export const logUserDeleted = (admin, deletedUser) => {
  return createAuditLog({
    action: 'DELETE',
    user: admin.name,
    role: admin.role,
    details: `Deleted user: ${deletedUser.name}`
  })
}

export const logTenantCreated = (admin, tenant) => {
  return createAuditLog({
    action: 'CREATE',
    user: admin.name,
    role: admin.role,
    details: `Created tenant: ${tenant.name}`
  })
}

export const logTenantUpdated = (admin, tenant) => {
  return createAuditLog({
    action: 'UPDATE',
    user: admin.name,
    role: admin.role,
    details: `Updated tenant: ${tenant.name}`
  })
}

export const logTenantDeleted = (admin, tenant) => {
  return createAuditLog({
    action: 'DELETE',
    user: admin.name,
    role: admin.role,
    details: `Deleted tenant: ${tenant.name}`
  })
}

// Add this function to src/services/auditLogService.js
export const logBulkAction = async (admin, count, action) => {
  return createAuditLog({
    action: 'BULK_' + action,
    user: admin.name,
    role: admin.role,
    details: `Bulk ${action.toLowerCase()} performed on ${count} users`,
    timestamp: new Date().toISOString()
  })
}