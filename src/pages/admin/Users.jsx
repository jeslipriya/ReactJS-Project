import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users as UsersIcon, 
  Shield, 
  UserCheck, 
  UserX,
  Filter,
  Download
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import UserTable from '../../components/UserTable'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { logUserDeleted, logBulkAction } from '../../services/auditLogService'
import toast from 'react-hot-toast'

const Users = () => {
  const [users, setUsers] = useState([])
  const [tenants, setTenants] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    tenants: 0,
    regular: 0,
    active: 0,
    inactive: 0
  })
  const [filters, setFilters] = useState({
    role: '',
    tenant: '',
    status: '',
    search: ''
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, tenantsRes] = await Promise.all([
        api.get('/users'),
        api.get('/tenants')
      ])

      setUsers(usersRes.data)
      setTenants(tenantsRes.data)

      // Calculate stats
      const stats = {
        total: usersRes.data.length,
        admins: usersRes.data.filter(u => u.role === 'admin').length,
        tenants: usersRes.data.filter(u => u.role === 'tenant').length,
        regular: usersRes.data.filter(u => u.role === 'user').length,
        active: usersRes.data.filter(u => u.status === 'active').length,
        inactive: usersRes.data.filter(u => u.status === 'inactive').length
      }
      setStats(stats)
    } catch (error) {
      toast.error('Failed to fetch users')
    }
  }

  const handleDeleteUser = async (userToDelete) => {
    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}?`)) {
      try {
        await api.delete(`/users/${userToDelete.id}`)
        
        // Update tenant users count if applicable
        if (userToDelete.tenantId) {
          const tenant = await api.get(`/tenants/${userToDelete.tenantId}`)
          await api.patch(`/tenants/${userToDelete.tenantId}`, {
            usersCount: tenant.data.usersCount - 1
          })
        }
        
        await logUserDeleted(user, userToDelete)
        
        toast.success('User deleted successfully')
        fetchData()
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  const handleEditUser = (user) => {
    toast.success('Edit user functionality coming soon')
  }

  const handleBulkDelete = async (userIds) => {
    if (window.confirm(`Delete ${userIds.length} users?`)) {
      try {
        const usersToDelete = users.filter(u => userIds.includes(u.id))
        
        await Promise.all(userIds.map(id => api.delete(`/users/${id}`)))
        
        // Update tenant counts
        const tenantUpdates = usersToDelete
          .filter(u => u.tenantId)
          .reduce((acc, u) => {
            acc[u.tenantId] = (acc[u.tenantId] || 0) + 1
            return acc
          }, {})

        await Promise.all(
          Object.entries(tenantUpdates).map(([tenantId, count]) =>
            api.get(`/tenants/${tenantId}`).then(tenant =>
              api.patch(`/tenants/${tenantId}`, {
                usersCount: tenant.data.usersCount - count
              })
            )
          )
        )

        await logBulkAction(user, userIds.length, 'DELETE')
        
        toast.success(`${userIds.length} users deleted successfully`)
        fetchData()
      } catch (error) {
        toast.error('Failed to delete users')
      }
    }
  }

  const handleExportCSV = () => {
    const filteredUsers = getFilteredUsers()
    
    const csv = [
      ['Name', 'Email', 'Role', 'Company', 'Status', 'Joined'],
      ...filteredUsers.map(u => [
        u.name,
        u.email,
        u.role,
        u.tenantId || '-',
        u.status,
        u.joinedAt
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
    
    toast.success('Users exported successfully')
  }

  const getFilteredUsers = () => {
    return users.filter(user => {
      if (filters.role && user.role !== filters.role) return false
      if (filters.tenant && user.tenantId !== filters.tenant) return false
      if (filters.status && user.status !== filters.status) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return user.name.toLowerCase().includes(searchLower) ||
               user.email.toLowerCase().includes(searchLower)
      }
      return true
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text">User Management</h1>
              <p className="text-textLight mt-1">Manage all users across the platform</p>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <motion.div
              whileHover={{ y: -2 }}
              className="stat-card"
            >
              <UsersIcon size={20} className="text-primary mb-2" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-textLight">Total Users</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="stat-card"
            >
              <Shield size={20} className="text-purple-600 mb-2" />
              <div className="text-2xl font-bold">{stats.admins}</div>
              <div className="text-xs text-textLight">Admins</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="stat-card"
            >
              <UsersIcon size={20} className="text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{stats.tenants}</div>
              <div className="text-xs text-textLight">Tenants</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="stat-card"
            >
              <UsersIcon size={20} className="text-green-600 mb-2" />
              <div className="text-2xl font-bold">{stats.regular}</div>
              <div className="text-xs text-textLight">Regular</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="stat-card"
            >
              <UserCheck size={20} className="text-green-600 mb-2" />
              <div className="text-2xl font-bold">{stats.active}</div>
              <div className="text-xs text-textLight">Active</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="stat-card"
            >
              <UserX size={20} className="text-red-600 mb-2" />
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <div className="text-xs text-textLight">Inactive</div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-primary" />
              <h2 className="font-medium">Filters</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search by name or email"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="input-field"
              />
              
              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="input-field"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="tenant">Tenant</option>
                <option value="user">User</option>
              </select>
              
              <select
                value={filters.tenant}
                onChange={(e) => setFilters({...filters, tenant: e.target.value})}
                className="input-field"
              >
                <option value="">All Companies</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <UserTable
            users={getFilteredUsers()}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onBulkAction={handleBulkDelete}
            showTenant={true}
          />
        </motion.div>
      </main>
    </div>
  )
}

export default Users