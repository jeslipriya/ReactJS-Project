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
  MoreVertical,
  Building2,
  Eye,
  X
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TenantForm from '../../components/TenantForm'
import UserTable from '../../components/UserTable'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { logTenantDeleted } from '../../services/auditLogService'
import toast from 'react-hot-toast'

const Tenants = () => {
  const [tenants, setTenants] = useState([])
  const [search, setSearch] = useState('')
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [tenantUsers, setTenantUsers] = useState([])
  const [showUsersModal, setShowUsersModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants')
      setTenants(response.data)
    } catch (error) {
      toast.error('Failed to fetch tenants')
    }
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

  const handleDeleteTenant = async (tenant) => {
    if (window.confirm(`Are you sure you want to delete ${tenant.name}? This will also delete all associated users.`)) {
      try {
        // Delete all users under this tenant
        const users = await api.get(`/users?tenantId=${tenant.id}`)
        await Promise.all(users.data.map(u => api.delete(`/users/${u.id}`)))
        
        // Delete the tenant
        await api.delete(`/tenants/${tenant.id}`)
        
        await logTenantDeleted(user, tenant)
        
        toast.success('Tenant deleted successfully')
        fetchTenants()
      } catch (error) {
        toast.error('Failed to delete tenant')
      }
    }
  }

  const handleEditTenant = (tenant) => {
    // Implement edit functionality
    toast.success('Edit functionality coming soon')
  }

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Delete user ${user.name}?`)) {
      try {
        await api.delete(`/users/${user.id}`)
        
        // Update tenant users count
        await api.patch(`/tenants/${selectedTenant.id}`, {
          usersCount: selectedTenant.usersCount - 1
        })
        
        fetchTenantUsers(selectedTenant.id)
        fetchTenants()
        toast.success('User deleted successfully')
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  const handleEditUser = (user) => {
    toast.success('Edit user functionality coming soon')
  }

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(search.toLowerCase()) ||
    tenant.email.toLowerCase().includes(search.toLowerCase())
  )

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
              <h1 className="text-3xl font-bold text-text">Tenants</h1>
              <p className="text-textLight mt-1">Manage all companies and their users</p>
            </div>
            
            <button
              onClick={() => setShowTenantForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              <span>New Tenant</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
            <input
              type="text"
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 max-w-md"
            />
          </div>

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTenants.map((tenant, index) => (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="card hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={tenant.logo || `https://ui-avatars.com/api/?name=${tenant.name}&background=7A5C4D&color=fff`}
                        alt={tenant.name}
                        className="w-12 h-12 rounded-xl"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{tenant.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-textLight">
                          <Mail size={14} />
                          <span>{tenant.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className={`badge ${tenant.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                        {tenant.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Users size={16} className="text-textLight" />
                      <span className="text-sm">{tenant.usersCount} users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getPlanIcon(tenant.plan)}
                      <span className="text-sm">{tenant.plan}</span>
                    </div>
                  </div>

                  <div className="text-xs text-textLight mb-4">
                    Created: {tenant.createdAt}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border">
                    <button
                      onClick={() => handleViewUsers(tenant)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2"
                    >
                      <Eye size={16} />
                      <span>View Users</span>
                    </button>
                    <button
                      onClick={() => handleEditTenant(tenant)}
                      className="p-2 btn-secondary"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(tenant)}
                      className="p-2 btn-secondary text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredTenants.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Building2 size={48} className="mx-auto text-textLight mb-4" />
                <p className="text-textLight">No tenants found</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Tenant Form Modal */}
      <TenantForm
        isOpen={showTenantForm}
        onClose={() => setShowTenantForm(false)}
        onSuccess={() => {
          fetchTenants()
          setShowTenantForm(false)
        }}
      />

      {/* Tenant Users Modal */}
      <AnimatePresence>
        {showUsersModal && selectedTenant && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUsersModal(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl z-50"
            >
              <div className="bg-card border border-border rounded-xl shadow-soft p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedTenant.name} - Users</h2>
                    <p className="text-textLight text-sm mt-1">Managing {tenantUsers.length} users</p>
                  </div>
                  <button
                    onClick={() => setShowUsersModal(false)}
                    className="p-2 hover:bg-border rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <UserTable
                  users={tenantUsers}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  showTenant={false}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Tenants