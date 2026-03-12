import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users as UsersIcon, 
  Shield, 
  UserCheck, 
  UserX,
  Filter,
  Download,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Save,
  RefreshCw,
  Ban,
  CheckCircle,
  AlertCircle,
  Mail,
  Building2,
  Crown,
  Calendar,
  Phone,
  Briefcase,
  UserPlus,
  Eye,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Settings,
  Lock,
  Unlock,
  Key,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { logUserDeleted, logBulkAction, logUserCreated, logUserUpdated } from '../../services/auditLogService'
import toast from 'react-hot-toast'

const Users = () => {
  const [users, setUsers] = useState([])
  const [tenants, setTenants] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
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
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: 'user123',
    role: 'user',
    tenantId: '',
    status: 'active',
    phone: '',
    position: '',
    avatar: ''
  })

  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: '',
    tenantId: '',
    status: 'active',
    phone: '',
    position: ''
  })

  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, filters, sortConfig])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, tenantsRes] = await Promise.all([
        api.get('/users'),
        api.get('/tenants')
      ])

      setUsers(usersRes.data)
      setTenants(tenantsRes.data)
      calculateStats(usersRes.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (usersData) => {
    const stats = {
      total: usersData.length,
      admins: usersData.filter(u => u.role === 'admin').length,
      tenants: usersData.filter(u => u.role === 'tenant').length,
      regular: usersData.filter(u => u.role === 'user').length,
      active: usersData.filter(u => u.status === 'active').length,
      inactive: usersData.filter(u => u.status === 'inactive').length
    }
    setStats(stats)
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        user.position?.toLowerCase().includes(searchLower)
      )
    }

    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role)
    }

    // Apply tenant filter
    if (filters.tenant) {
      filtered = filtered.filter(user => user.tenantId === filters.tenant)
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      if (sortConfig.key === 'joinedAt') {
        aValue = new Date(a.joinedAt || 0)
        bValue = new Date(b.joinedAt || 0)
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredUsers(filtered)
  }

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const newUser = {
        ...newUserData,
        id: Date.now().toString(),
        joinedAt: new Date().toISOString().split('T')[0],
        avatar: newUserData.avatar || `https://ui-avatars.com/api/?name=${newUserData.name}&background=7A5C4D&color=fff&size=128`
      }

      await api.post('/users', newUser)
      await logUserCreated(user, newUser)

      // Update tenant users count if tenantId is provided
      if (newUserData.tenantId) {
        const tenant = await api.get(`/tenants/${newUserData.tenantId}`)
        await api.patch(`/tenants/${newUserData.tenantId}`, {
          usersCount: (tenant.data.usersCount || 0) + 1
        })
      }

      toast.success('User added successfully!')
      setShowAddUserModal(false)
      setNewUserData({
        name: '',
        email: '',
        password: 'user123',
        role: 'user',
        tenantId: '',
        status: 'active',
        phone: '',
        position: '',
        avatar: ''
      })
      fetchData()
    } catch (error) {
      toast.error('Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditUserData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      tenantId: user.tenantId || '',
      status: user.status || 'active',
      phone: user.phone || '',
      position: user.position || ''
    })
    setShowEditUserModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      setLoading(true)
      const updatedUser = {
        ...selectedUser,
        ...editUserData,
        avatar: `https://ui-avatars.com/api/?name=${editUserData.name}&background=7A5C4D&color=fff&size=128`
      }

      // Check if tenant changed
      if (selectedUser.tenantId !== editUserData.tenantId) {
        // Decrease count from old tenant
        if (selectedUser.tenantId) {
          const oldTenant = await api.get(`/tenants/${selectedUser.tenantId}`)
          await api.patch(`/tenants/${selectedUser.tenantId}`, {
            usersCount: Math.max(0, (oldTenant.data.usersCount || 0) - 1)
          })
        }

        // Increase count for new tenant
        if (editUserData.tenantId) {
          const newTenant = await api.get(`/tenants/${editUserData.tenantId}`)
          await api.patch(`/tenants/${editUserData.tenantId}`, {
            usersCount: (newTenant.data.usersCount || 0) + 1
          })
        }
      }

      await api.patch(`/users/${selectedUser.id}`, updatedUser)
      await logUserUpdated(user, updatedUser)

      toast.success('User updated successfully')
      setShowEditUserModal(false)
      setSelectedUser(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    setShowDeleteConfirm(true)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      await api.delete(`/users/${selectedUser.id}`)
      await logUserDeleted(user, selectedUser)

      // Update tenant users count if applicable
      if (selectedUser.tenantId) {
        const tenant = await api.get(`/tenants/${selectedUser.tenantId}`)
        await api.patch(`/tenants/${selectedUser.tenantId}`, {
          usersCount: Math.max(0, (tenant.data.usersCount || 0) - 1)
        })
      }

      toast.success('User deleted successfully')
      setShowDeleteConfirm(false)
      setSelectedUser(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return

    try {
      setLoading(true)
      const usersToDelete = users.filter(u => selectedUsers.includes(u.id))

      await Promise.all(selectedUsers.map(id => api.delete(`/users/${id}`)))

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
              usersCount: Math.max(0, (tenant.data.usersCount || 0) - count)
            })
          )
        )
      )

      await logBulkAction(user, selectedUsers.length, 'DELETE')

      toast.success(`${selectedUsers.length} users deleted successfully`)
      setShowBulkDeleteConfirm(false)
      setSelectedUsers([])
      fetchData()
    } catch (error) {
      toast.error('Failed to delete users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userToToggle) => {
    try {
      const newStatus = userToToggle.status === 'active' ? 'inactive' : 'active'
      const updatedUser = { ...userToToggle, status: newStatus }

      await api.patch(`/users/${userToToggle.id}`, { status: newStatus })
      await logUserUpdated(user, updatedUser)

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      fetchData()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleExportData = () => {
    let data = []
    let filename = ''

    if (exportFormat === 'csv') {
      data = [
        ['Name', 'Email', 'Role', 'Company', 'Status', 'Joined', 'Phone', 'Position'],
        ...filteredUsers.map(u => [
          u.name,
          u.email,
          u.role,
          tenants.find(t => t.id === u.tenantId)?.name || 'No Company',
          u.status,
          u.joinedAt,
          u.phone || 'N/A',
          u.position || 'N/A'
        ])
      ]
      filename = 'users-export.csv'

      const csv = data.map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
    } else {
      const json = JSON.stringify(filteredUsers, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'users-export.json'
      a.click()
    }

    toast.success(`Users exported as ${exportFormat.toUpperCase()}`)
  }

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin':
        return <span className="badge badge-success flex items-center gap-1"><Shield size={12} /> Admin</span>
      case 'tenant':
        return <span className="badge badge-warning flex items-center gap-1"><Building2 size={12} /> Tenant</span>
      default:
        return <span className="badge flex items-center gap-1"><UsersIcon size={12} /> User</span>
    }
  }

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="badge badge-success flex items-center gap-1"><CheckCircle size={12} /> Active</span>
      : <span className="badge badge-error flex items-center gap-1"><Ban size={12} /> Inactive</span>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 w-full min-h-screen overflow-y-auto">
        <div className="p-4 lg:p-8 w-full max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* Header with Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text">User Management</h1>
                <p className="text-textLight mt-1">Manage all users across the platform</p>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="btn-primary flex items-center justify-center gap-2 flex-1 lg:flex-none px-6"
                >
                  <UserPlus size={18} />
                  <span>Add User</span>
                </button>
                
                <div className="flex gap-2">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-2 bg-card"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                  <button
                    onClick={handleExportData}
                    className="btn-secondary flex items-center gap-2 px-4"
                  >
                    <Download size={18} />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <motion.div whileHover={{ y: -2 }} className="stat-card">
                <UsersIcon size={20} className="text-primary mb-2" />
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-textLight">Total Users</div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="stat-card">
                <Shield size={20} className="text-purple-600 mb-2" />
                <div className="text-2xl font-bold">{stats.admins}</div>
                <div className="text-xs text-textLight">Admins</div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="stat-card">
                <Building2 size={20} className="text-blue-600 mb-2" />
                <div className="text-2xl font-bold">{stats.tenants}</div>
                <div className="text-xs text-textLight">Tenants</div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="stat-card">
                <UsersIcon size={20} className="text-green-600 mb-2" />
                <div className="text-2xl font-bold">{stats.regular}</div>
                <div className="text-xs text-textLight">Regular</div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="stat-card">
                <UserCheck size={20} className="text-green-600 mb-2" />
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-xs text-textLight">Active</div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="stat-card">
                <UserX size={20} className="text-red-600 mb-2" />
                <div className="text-2xl font-bold">{stats.inactive}</div>
                <div className="text-xs text-textLight">Inactive</div>
              </motion.div>
            </div>

            {/* Filters and Search */}
            <div className="card mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone or position..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="input-field pl-10 w-full"
                  />
                </div>

                <select
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="input-field min-w-[140px]"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="tenant">Tenant</option>
                  <option value="user">User</option>
                </select>

                <select
                  value={filters.tenant}
                  onChange={(e) => setFilters({...filters, tenant: e.target.value})}
                  className="input-field min-w-[140px]"
                >
                  <option value="">All Companies</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="input-field min-w-[140px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  onClick={() => setFilters({ role: '', tenant: '', status: '', search: '' })}
                  className="btn-secondary px-4"
                >
                  Clear Filters
                </button>
              </div>

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <span className="text-sm font-medium">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="btn-secondary text-sm py-1 px-3"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowBulkDeleteConfirm(true)}
                      className="btn-secondary text-red-600 hover:bg-red-50 text-sm py-1 px-3"
                    >
                      Delete Selected
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw size={32} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 w-12">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(currentUsers.map(u => u.id))
                              } else {
                                setSelectedUsers([])
                              }
                            }}
                            className="rounded border-border text-primary focus:ring-primary/20"
                          />
                        </th>
                        <th className="text-left pb-3 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-2">
                            User
                            {sortConfig.key === 'name' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            )}
                          </div>
                        </th>
                        <th className="text-left pb-3 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort('role')}>
                          <div className="flex items-center gap-2">
                            Role
                            {sortConfig.key === 'role' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            )}
                          </div>
                        </th>
                        <th className="text-left pb-3 font-medium">Company</th>
                        <th className="text-left pb-3 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort('status')}>
                          <div className="flex items-center gap-2">
                            Status
                            {sortConfig.key === 'status' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            )}
                          </div>
                        </th>
                        <th className="text-left pb-3 font-medium">Position</th>
                        <th className="text-left pb-3 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort('joinedAt')}>
                          <div className="flex items-center gap-2">
                            Joined
                            {sortConfig.key === 'joinedAt' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            )}
                          </div>
                        </th>
                        <th className="text-right pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {currentUsers.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-border last:border-0 hover:bg-sidebar/30 transition-colors"
                          >
                            <td className="py-3">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers([...selectedUsers, user.id])
                                  } else {
                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                  }
                                }}
                                className="rounded border-border text-primary focus:ring-primary/20"
                              />
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=7A5C4D&color=fff&size=128`}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-textLight">{user.email}</div>
                                  {user.phone && <div className="text-xs text-textLight">{user.phone}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              {getRoleBadge(user.role)}
                            </td>
                            <td className="py-3 text-textLight">
                              {user.tenantId ? (
                                <div className="flex items-center gap-1">
                                  <Building2 size={14} />
                                  <span>{tenants.find(t => t.id === user.tenantId)?.name || 'Unknown'}</span>
                                </div>
                              ) : (
                                <span className="text-textLight">—</span>
                              )}
                            </td>
                            <td className="py-3">
                              {getStatusBadge(user.status)}
                            </td>
                            <td className="py-3 text-textLight">
                              {user.position || '—'}
                            </td>
                            <td className="py-3 text-textLight">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{user.joinedAt}</span>
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="p-2 hover:bg-border rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className={`p-2 hover:bg-border rounded-lg transition-colors ${
                                    user.status === 'active' ? 'text-orange-600' : 'text-green-600'
                                  }`}
                                  title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                >
                                  {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(user)}
                                  className="p-2 hover:bg-border rounded-lg transition-colors text-red-600"
                                  title="Delete User"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>

                      {currentUsers.length === 0 && (
                        <tr>
                          <td colSpan="8" className="py-12 text-center">
                            <UsersIcon size={48} className="mx-auto text-textLight mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Users Found</h3>
                            <p className="text-textLight mb-6">Try adjusting your filters or add a new user</p>
                            <button
                              onClick={() => setShowAddUserModal(true)}
                              className="btn-primary inline-flex items-center gap-2"
                            >
                              <UserPlus size={18} />
                              <span>Add New User</span>
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <p className="text-sm text-textLight">
                      Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 hover:bg-border rounded-lg transition-colors disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 bg-sidebar rounded-lg text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 hover:bg-border rounded-lg transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddUserModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] overflow-y-auto"
            >
              <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-soft">
                  <div className="flex justify-between items-center p-6 border-b border-border">
                    <div>
                      <h2 className="text-xl font-semibold">Add New User</h2>
                      <p className="text-sm text-textLight mt-1">Create a new user account</p>
                    </div>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="p-2 hover:bg-border rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleAddUser} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newUserData.name}
                          onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                          className="input-field"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={newUserData.email}
                          onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                          className="input-field"
                          placeholder="john@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={newUserData.phone}
                          onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                          className="input-field"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={newUserData.position}
                          onChange={(e) => setNewUserData({...newUserData, position: e.target.value})}
                          className="input-field"
                          placeholder="Software Engineer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={newUserData.role}
                          onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                          className="input-field"
                        >
                          <option value="user">User</option>
                          <option value="tenant">Tenant Admin</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Status
                        </label>
                        <select
                          value={newUserData.status}
                          onChange={(e) => setNewUserData({...newUserData, status: e.target.value})}
                          className="input-field"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {newUserData.role !== 'admin' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-textLight mb-1">
                            Company
                          </label>
                          <select
                            value={newUserData.tenantId}
                            onChange={(e) => setNewUserData({...newUserData, tenantId: e.target.value})}
                            className="input-field"
                          >
                            <option value="">No Company</option>
                            {tenants.map(tenant => (
                              <option key={tenant.id} value={tenant.id}>
                                {tenant.name} ({tenant.plan})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="md:col-span-2 bg-sidebar rounded-xl p-4 border border-border">
                        <p className="text-sm text-textLight">
                          Default password: <span className="font-mono">user123</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="flex-1 btn-secondary py-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} />
                            <span>Add User</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUserModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditUserModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] overflow-y-auto"
            >
              <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-soft">
                  <div className="flex justify-between items-center p-6 border-b border-border">
                    <div>
                      <h2 className="text-xl font-semibold">Edit User</h2>
                      <p className="text-sm text-textLight mt-1">Update user information</p>
                    </div>
                    <button
                      onClick={() => setShowEditUserModal(false)}
                      className="p-2 hover:bg-border rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateUser} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editUserData.name}
                          onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                          className="input-field"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={editUserData.email}
                          onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                          className="input-field"
                          placeholder="john@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={editUserData.phone}
                          onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                          className="input-field"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={editUserData.position}
                          onChange={(e) => setEditUserData({...editUserData, position: e.target.value})}
                          className="input-field"
                          placeholder="Software Engineer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={editUserData.role}
                          onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                          className="input-field"
                        >
                          <option value="user">User</option>
                          <option value="tenant">Tenant Admin</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Status
                        </label>
                        <select
                          value={editUserData.status}
                          onChange={(e) => setEditUserData({...editUserData, status: e.target.value})}
                          className="input-field"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {editUserData.role !== 'admin' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-textLight mb-1">
                            Company
                          </label>
                          <select
                            value={editUserData.tenantId}
                            onChange={(e) => setEditUserData({...editUserData, tenantId: e.target.value})}
                            className="input-field"
                          >
                            <option value="">No Company</option>
                            {tenants.map(tenant => (
                              <option key={tenant.id} value={tenant.id}>
                                {tenant.name} ({tenant.plan})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setShowEditUserModal(false)}
                        className="flex-1 btn-secondary py-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] overflow-y-auto"
            >
              <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-soft p-6">
                  <div className="flex items-center gap-3 mb-4 text-red-600">
                    <AlertCircle size={24} />
                    <h2 className="text-xl font-semibold">Delete User</h2>
                  </div>

                  <p className="text-textLight mb-2">
                    Are you sure you want to delete <span className="font-semibold text-text">{selectedUser.name}</span>?
                  </p>
                  <p className="text-sm text-red-600 mb-6">
                    This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 btn-secondary py-3"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      disabled={loading}
                      className="flex-1 btn-primary bg-red-600 hover:bg-red-700 py-3 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={18} />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkDeleteConfirm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] overflow-y-auto"
            >
              <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-soft p-6">
                  <div className="flex items-center gap-3 mb-4 text-red-600">
                    <AlertCircle size={24} />
                    <h2 className="text-xl font-semibold">Delete Multiple Users</h2>
                  </div>

                  <p className="text-textLight mb-2">
                    Are you sure you want to delete {selectedUsers.length} users?
                  </p>
                  <p className="text-sm text-red-600 mb-6">
                    This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBulkDeleteConfirm(false)}
                      className="flex-1 btn-secondary py-3"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={loading}
                      className="flex-1 btn-primary bg-red-600 hover:bg-red-700 py-3 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={18} />
                          <span>Delete All</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Users