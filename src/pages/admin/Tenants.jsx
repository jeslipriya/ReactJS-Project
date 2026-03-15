import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Mail, 
  Crown,
  Building2,
  Eye,
  X,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  UserPlus,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Globe,
  Shield,
  Settings,
  Save,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  BarChart3,
  Activity,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Key,
  Menu
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TenantForm from '../../components/TenantForm'
import UserTable from '../../components/UserTable'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { logTenantDeleted, logTenantUpdated, logUserUpdated, logUserDeleted } from '../../services/auditLogService'
import toast from 'react-hot-toast'

const Tenants = () => {
  const [tenants, setTenants] = useState([])
  const [search, setSearch] = useState('')
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [tenantUsers, setTenantUsers] = useState([])
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState(null)
  const [userToEdit, setUserToEdit] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    totalUsers: 0
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    plan: 'Basic',
    status: 'active',
    phone: '',
    address: '',
    website: '',
    industry: '',
    logo: ''
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: 'user123',
    role: 'user',
    status: 'active'
  })
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')
  
  const { user } = useAuth()

  useEffect(() => {
    fetchTenants()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [tenants])

  const fetchTenants = async () => {
    try {
      setLoading(true)
      const response = await api.get('/tenants')
      setTenants(response.data)
    } catch (error) {
      toast.error('Failed to fetch tenants')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const active = tenants.filter(t => t.status === 'active').length
    const suspended = tenants.filter(t => t.status === 'suspended').length
    const totalUsers = tenants.reduce((acc, t) => acc + (t.usersCount || 0), 0)
    
    setStats({
      total: tenants.length,
      active,
      suspended,
      totalUsers
    })
  }

  const fetchTenantUsers = async (tenantId) => {
    try {
      const response = await api.get(`/users?tenantId=${tenantId}`)
      setTenantUsers(response.data)
    } catch (error) {
      toast.error('Failed to fetch tenant users')
    }
  }

  const handleViewUsers = (tenant) => {
    setSelectedTenant(tenant)
    fetchTenantUsers(tenant.id)
    setShowUsersModal(true)
  }

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant)
    setEditFormData({
      name: tenant.name || '',
      email: tenant.email || '',
      plan: tenant.plan || 'Basic',
      status: tenant.status || 'active',
      phone: tenant.phone || '',
      address: tenant.address || '',
      website: tenant.website || '',
      industry: tenant.industry || '',
      logo: tenant.logo || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateTenant = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const updatedTenant = {
        ...selectedTenant,
        ...editFormData,
        logo: editFormData.logo || `https://ui-avatars.com/api/?name=${editFormData.name}&background=7A5C4D&color=fff`
      }

      await api.patch(`/tenants/${selectedTenant.id}`, updatedTenant)
      await logTenantUpdated(user, updatedTenant)
      
      toast.success('Tenant updated successfully')
      setShowEditModal(false)
      fetchTenants()
    } catch (error) {
      toast.error('Failed to update tenant')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (tenant) => {
    try {
      const newStatus = tenant.status === 'active' ? 'suspended' : 'active'
      await api.patch(`/tenants/${tenant.id}`, { status: newStatus })
      
      toast.success(`Tenant ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`)
      fetchTenants()
    } catch (error) {
      toast.error('Failed to update tenant status')
    }
  }

  const handleDeleteClick = (tenant) => {
    setTenantToDelete(tenant)
    setShowDeleteConfirm(true)
  }

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return
    
    try {
      setLoading(true)
      // Delete all users under this tenant
      const users = await api.get(`/users?tenantId=${tenantToDelete.id}`)
      await Promise.all(users.data.map(u => api.delete(`/users/${u.id}`)))
      
      // Delete the tenant
      await api.delete(`/tenants/${tenantToDelete.id}`)
      
      await logTenantDeleted(user, tenantToDelete)
      
      toast.success('Tenant deleted successfully')
      setShowDeleteConfirm(false)
      setTenantToDelete(null)
      fetchTenants()
    } catch (error) {
      toast.error('Failed to delete tenant')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    if (!selectedTenant) return

    try {
      setLoading(true)
      const newUser = {
        ...newUserData,
        id: Date.now().toString(),
        tenantId: selectedTenant.id,
        joinedAt: new Date().toISOString().split('T')[0],
        avatar: `https://ui-avatars.com/api/?name=${newUserData.name}&background=7A5C4D&color=fff`
      }

      await api.post('/users', newUser)
      
      // Update tenant users count
      await api.patch(`/tenants/${selectedTenant.id}`, {
        usersCount: (selectedTenant.usersCount || 0) + 1
      })

      toast.success('User added successfully')
      setShowAddUserModal(false)
      setNewUserData({
        name: '',
        email: '',
        password: 'user123',
        role: 'user',
        status: 'active'
      })
      
      // Refresh tenant users if modal is open
      if (showUsersModal) {
        fetchTenantUsers(selectedTenant.id)
      }
      fetchTenants()
    } catch (error) {
      toast.error('Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (userToEdit) => {
    setUserToEdit(userToEdit)
    setEditUserData({
      name: userToEdit.name || '',
      email: userToEdit.email || '',
      role: userToEdit.role || 'user',
      status: userToEdit.status || 'active'
    })
    setShowEditUserModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    if (!userToEdit || !selectedTenant) return

    try {
      setLoading(true)
      const updatedUser = {
        ...userToEdit,
        ...editUserData,
        avatar: `https://ui-avatars.com/api/?name=${editUserData.name}&background=7A5C4D&color=fff`
      }

      await api.patch(`/users/${userToEdit.id}`, updatedUser)
      await logUserUpdated(user, updatedUser)
      
      toast.success('User updated successfully')
      setShowEditUserModal(false)
      setUserToEdit(null)
      
      // Refresh tenant users
      fetchTenantUsers(selectedTenant.id)
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userToDelete) => {
    if (window.confirm(`Delete user ${userToDelete.name}?`)) {
      try {
        await api.delete(`/users/${userToDelete.id}`)
        await logUserDeleted(user, userToDelete)
        
        // Update tenant users count
        const tenant = await api.get(`/tenants/${selectedTenant.id}`)
        await api.patch(`/tenants/${selectedTenant.id}`, {
          usersCount: Math.max(0, (tenant.data.usersCount || 0) - 1)
        })
        
        fetchTenantUsers(selectedTenant.id)
        fetchTenants()
        toast.success('User deleted successfully')
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  const handleToggleUserStatus = async (userToToggle) => {
    try {
      const newStatus = userToToggle.status === 'active' ? 'inactive' : 'active'
      const updatedUser = { ...userToToggle, status: newStatus }
      
      await api.patch(`/users/${userToToggle.id}`, { status: newStatus })
      await logUserUpdated(user, updatedUser)
      
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      fetchTenantUsers(selectedTenant.id)
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleExportData = () => {
    let data = []
    let filename = ''

    const filteredData = getFilteredAndSortedTenants()

    if (exportFormat === 'csv') {
      data = [
        ['Company', 'Email', 'Plan', 'Users', 'Status', 'Created', 'Phone', 'Industry'],
        ...filteredData.map(t => [
          t.name,
          t.email,
          t.plan,
          t.usersCount,
          t.status,
          t.createdAt,
          t.phone || 'N/A',
          t.industry || 'N/A'
        ])
      ]
      filename = 'tenants-export.csv'
      
      const csv = data.map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
    } else {
      // JSON export
      const json = JSON.stringify(filteredData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'tenants-export.json'
      a.click()
    }
    
    toast.success(`Tenants exported as ${exportFormat.toUpperCase()}`)
  }

  const getFilteredAndSortedTenants = () => {
    let filtered = [...tenants]

    // Apply search
    if (search) {
      filtered = filtered.filter(tenant =>
        tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        tenant.email.toLowerCase().includes(search.toLowerCase()) ||
        tenant.industry?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tenant => tenant.status === filterStatus)
    }

    // Apply plan filter
    if (filterPlan !== 'all') {
      filtered = filtered.filter(tenant => tenant.plan === filterPlan)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'usersCount') {
        aValue = a.usersCount || 0
        bValue = b.usersCount || 0
      }

      if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }

  const filteredTenants = getFilteredAndSortedTenants()

  const getPlanIcon = (plan) => {
    switch(plan) {
      case 'Enterprise':
        return <Crown className="text-yellow-600" size={16} />
      case 'Professional':
        return <Crown className="text-blue-600" size={16} />
      default:
        return <Crown className="text-gray-600" size={16} />
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle size={12} /> Active</span>
      case 'suspended':
        return <span className="badge badge-error flex items-center gap-1"><Ban size={12} /> Suspended</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-40 p-3 bg-primary text-white rounded-xl shadow-soft"
      >
        <Menu size={20} />
      </button>
      
      <main className="flex-1 w-full min-h-screen overflow-y-auto">
        <div className="p-4 lg:p-8 w-full max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text">Tenants</h1>
                <p className="text-textLight mt-1">Manage all companies and their users</p>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowTenantForm(true)}
                  className="btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none px-6"
                >
                  <Plus size={18} />
                  <span>New Tenant</span>
                </button>
                <button
                  onClick={handleExportData}
                  className="btn-secondary flex items-center justify-center gap-2 flex-1 md:flex-none px-6"
                >
                  <Download size={18} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="stat-card">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-textLight">Total Tenants</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-textLight">Active</p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Ban size={24} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-textLight">Suspended</p>
                    <p className="text-2xl font-bold">{stats.suspended}</p>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-textLight">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="card mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                  <input
                    type="text"
                    placeholder="Search tenants by name, email or industry..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>

                {/* Plan Filter */}
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="input-field min-w-[140px]"
                >
                  <option value="all">All Plans</option>
                  <option value="Basic">Basic</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field min-w-[140px]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="plan">Sort by Plan</option>
                  <option value="usersCount">Sort by Users</option>
                  <option value="status">Sort by Status</option>
                  <option value="createdAt">Sort by Date</option>
                </select>

                {/* Sort Order */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn-secondary flex items-center gap-2 px-4"
                >
                  {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                </button>
              </div>

              {/* Export Format Selector */}
              <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-textLight">Export as:</span>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="text-sm border border-border rounded-lg px-2 py-1 bg-card"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tenants Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw size={32} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                <AnimatePresence mode="popLayout">
                  {filteredTenants.map((tenant, index) => (
                    <motion.div
                      key={tenant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="card hover:shadow-lg transition-all group relative overflow-hidden h-full flex flex-col"
                    >
                      {/* Status Indicator Bar */}
                      <div className={`absolute top-0 left-0 w-full h-1 ${
                        tenant.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`} />

                      <div className="pt-2 flex-1 flex flex-col">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={tenant.logo || `https://ui-avatars.com/api/?name=${tenant.name}&background=7A5C4D&color=fff`}
                              alt={tenant.name}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-border flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-lg truncate">{tenant.name}</h3>
                              <div className="flex items-center gap-1 text-sm text-textLight">
                                <Mail size={14} className="flex-shrink-0" />
                                <span className="truncate">{tenant.email}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getStatusBadge(tenant.status)}
                          </div>
                        </div>

                        {/* Details Grid - Flexible based on content */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 p-2 bg-sidebar rounded-lg min-w-0">
                            {getPlanIcon(tenant.plan)}
                            <span className="text-sm font-medium truncate">{tenant.plan}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 p-2 bg-sidebar rounded-lg min-w-0">
                            <Users size={16} className="text-textLight flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{tenant.usersCount} users</span>
                          </div>

                          {tenant.industry && (
                            <div className="flex items-center gap-2 p-2 bg-sidebar rounded-lg col-span-2 min-w-0">
                              <Briefcase size={16} className="text-textLight flex-shrink-0" />
                              <span className="text-sm truncate">{tenant.industry}</span>
                            </div>
                          )}

                          {tenant.phone && (
                            <div className="flex items-center gap-2 p-2 bg-sidebar rounded-lg col-span-2 min-w-0">
                              <Phone size={16} className="text-textLight flex-shrink-0" />
                              <span className="text-sm truncate">{tenant.phone}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 p-2 bg-sidebar rounded-lg col-span-2 min-w-0">
                            <Calendar size={16} className="text-textLight flex-shrink-0" />
                            <span className="text-sm truncate">Created: {tenant.createdAt}</span>
                          </div>
                        </div>

                        {/* Action Buttons - Always at bottom */}
                        <div className="flex gap-2 pt-3 border-t border-border mt-auto">
                          <button
                            onClick={() => handleViewUsers(tenant)}
                            className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2 min-w-0"
                            title="View Users"
                          >
                            <Eye size={16} className="flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Users</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedTenant(tenant)
                              setShowAddUserModal(true)
                            }}
                            className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2 bg-green-50 hover:bg-green-100 text-green-700 min-w-0"
                            title="Add User"
                          >
                            <UserPlus size={16} className="flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Add</span>
                          </button>
                          
                          <button
                            onClick={() => handleEditTenant(tenant)}
                            className="p-2 btn-secondary flex-shrink-0"
                            title="Edit Tenant"
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(tenant)}
                            className={`p-2 btn-secondary flex-shrink-0 ${
                              tenant.status === 'active' 
                                ? 'text-orange-600 hover:bg-orange-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={tenant.status === 'active' ? 'Suspend' : 'Activate'}
                          >
                            {tenant.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClick(tenant)}
                            className="p-2 btn-secondary text-red-600 hover:bg-red-50 flex-shrink-0"
                            title="Delete Tenant"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredTenants.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Building2 size={64} className="mx-auto text-textLight mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Tenants Found</h3>
                    <p className="text-textLight mb-6">Try adjusting your filters or create a new tenant</p>
                    <button
                      onClick={() => setShowTenantForm(true)}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Plus size={18} />
                      <span>Create New Tenant</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Create Tenant Modal */}
      <AnimatePresence>
        {showTenantForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTenantForm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] overflow-y-auto"
            >
              <div className="min-h-screen px-4 text-center">
                <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block w-full max-w-md my-8 text-left align-middle">
                  <TenantForm
                    isOpen={showTenantForm}
                    onClose={() => setShowTenantForm(false)}
                    onSuccess={() => {
                      fetchTenants()
                      setShowTenantForm(false)
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Tenant Modal */}
      <AnimatePresence>
        {showEditModal && selectedTenant && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] overflow-y-auto"
            >
              <div className="min-h-screen px-4 text-center">
                <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle bg-card border border-border rounded-xl shadow-soft">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Edit Tenant</h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="p-2 hover:bg-border rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateTenant} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          className="input-field"
                          placeholder="Acme Inc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                          className="input-field"
                          placeholder="contact@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                          className="input-field"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Website
                        </label>
                        <input
                          type="url"
                          value={editFormData.website}
                          onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                          className="input-field"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Industry
                        </label>
                        <input
                          type="text"
                          value={editFormData.industry}
                          onChange={(e) => setEditFormData({...editFormData, industry: e.target.value})}
                          className="input-field"
                          placeholder="Technology"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Plan
                        </label>
                        <select
                          value={editFormData.plan}
                          onChange={(e) => setEditFormData({...editFormData, plan: e.target.value})}
                          className="input-field"
                        >
                          <option value="Basic">Basic</option>
                          <option value="Professional">Professional</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Status
                        </label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                          className="input-field"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Address
                        </label>
                        <textarea
                          value={editFormData.address}
                          onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                          className="input-field"
                          rows="2"
                          placeholder="123 Business St, City, State 12345"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && selectedTenant && (
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
              <div className="min-h-screen px-4 text-center">
                <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle bg-card border border-border rounded-xl shadow-soft">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Add User to {selectedTenant.name}</h2>
                      <p className="text-sm text-textLight mt-1">Create a new user for this tenant</p>
                    </div>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="p-2 hover:bg-border rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-textLight mb-1">
                        Full Name *
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

                    <div>
                      <label className="block text-sm font-medium text-textLight mb-1">
                        Email Address *
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
                        Role
                      </label>
                      <select
                        value={newUserData.role}
                        onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                        className="input-field"
                      >
                        <option value="user">User</option>
                        <option value="tenant">Tenant Admin</option>
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

                    <div className="bg-sidebar rounded-xl p-4 border border-border">
                      <p className="text-sm text-textLight">
                        Default password: <span className="font-mono">user123</span>
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : <UserPlus size={18} />}
                        <span>{loading ? 'Adding...' : 'Add User'}</span>
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
        {showEditUserModal && userToEdit && selectedTenant && (
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
              <div className="min-h-screen px-4 text-center">
                <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle bg-card border border-border rounded-xl shadow-soft">
                  <div className="flex justify-between items-center mb-6">
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

                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-textLight mb-1">
                        Full Name *
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

                    <div>
                      <label className="block text-sm font-medium text-textLight mb-1">
                        Email Address *
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
                        Role
                      </label>
                      <select
                        value={editUserData.role}
                        onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                        className="input-field"
                      >
                        <option value="user">User</option>
                        <option value="tenant">Tenant Admin</option>
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

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEditUserModal(false)}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{loading ? 'Updating...' : 'Update User'}</span>
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
        {showDeleteConfirm && tenantToDelete && (
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
              <div className="min-h-screen px-4 text-center">
                <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle bg-card border border-border rounded-xl shadow-soft">
                  <div className="flex items-center gap-3 mb-4 text-red-600">
                    <AlertCircle size={24} />
                    <h2 className="text-xl font-semibold">Delete Tenant</h2>
                  </div>

                  <p className="text-textLight mb-2">
                    Are you sure you want to delete <span className="font-semibold text-text">{tenantToDelete.name}</span>?
                  </p>
                  <p className="text-sm text-red-600 mb-6">
                    This action cannot be undone. All users associated with this tenant will also be permanently deleted.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteTenant}
                      disabled={loading}
                      className="flex-1 btn-primary bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      <span>{loading ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tenant Users Modal */}
      <AnimatePresence>
        {showUsersModal && selectedTenant && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUsersModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] overflow-y-auto"
            >
              <div className="min-h-screen px-4 text-center">
                <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block w-full max-w-4xl p-6 my-8 text-left align-middle bg-card border border-border rounded-xl shadow-soft">
                  <div className="flex justify-between items-center mb-6 sticky top-0 bg-card pt-2 pb-4 border-b border-border">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedTenant.name} - Users</h2>
                      <p className="text-textLight text-sm mt-1">Managing {tenantUsers.length} users</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowUsersModal(false)
                          setShowAddUserModal(true)
                        }}
                        className="btn-primary flex items-center gap-2 px-4 py-2"
                      >
                        <UserPlus size={16} />
                        <span>Add User</span>
                      </button>
                      <button
                        onClick={() => setShowUsersModal(false)}
                        className="p-2 hover:bg-border rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left pb-3 font-medium">User</th>
                          <th className="text-left pb-3 font-medium">Role</th>
                          <th className="text-left pb-3 font-medium">Status</th>
                          <th className="text-left pb-3 font-medium">Joined</th>
                          <th className="text-right pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenantUsers.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-border last:border-0 hover:bg-sidebar/30 transition-colors"
                          >
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=7A5C4D&color=fff`}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-textLight">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`badge ${
                                user.role === 'admin' ? 'badge-success' :
                                user.role === 'tenant' ? 'badge-warning' : 'badge'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3 text-textLight">
                              {user.joinedAt}
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
                                  onClick={() => handleToggleUserStatus(user)}
                                  className={`p-2 hover:bg-border rounded-lg transition-colors ${
                                    user.status === 'active' ? 'text-orange-600' : 'text-green-600'
                                  }`}
                                  title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                >
                                  {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-2 hover:bg-border rounded-lg transition-colors text-red-600"
                                  title="Delete User"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                        {tenantUsers.length === 0 && (
                          <tr>
                            <td colSpan="5" className="py-12 text-center">
                              <Users size={48} className="mx-auto text-textLight mb-4" />
                              <p className="text-textLight">No users found for this tenant</p>
                              <button
                                onClick={() => {
                                  setShowUsersModal(false)
                                  setShowAddUserModal(true)
                                }}
                                className="btn-primary mt-4 inline-flex items-center gap-2"
                              >
                                <UserPlus size={16} />
                                <span>Add First User</span>
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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

export default Tenants
