import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Mail,
  Settings,
  AlertTriangle,
  Menu
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import UserTable from '../../components/UserTable'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TenantUsers = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [tenant, setTenant] = useState(null)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    password: 'user123'
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, tenantRes] = await Promise.all([
        api.get(`/users?tenantId=${user.tenantId}`),
        api.get(`/tenants/${user.tenantId}`)
      ])
      setUsers(usersRes.data)
      setTenant(tenantRes.data)
    } catch (error) {
      toast.error('Failed to fetch team data')
    }
  }

  const handleInviteUser = async (e) => {
    e.preventDefault()
    
    try {
      const newUser = {
        ...inviteData,
        id: Date.now().toString(),
        role: 'user',
        tenantId: user.tenantId,
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
        avatar: `https://ui-avatars.com/api/?name=${inviteData.name}&background=7A5C4D&color=fff`
      }

      await api.post('/users', newUser)
      
      // Update tenant users count
      await api.patch(`/tenants/${user.tenantId}`, {
        usersCount: tenant.usersCount + 1
      })
      
      toast.success('Team member invited successfully!')
      setShowInviteForm(false)
      setInviteData({ name: '', email: '', password: 'user123' })
      fetchData()
    } catch (error) {
      toast.error('Failed to invite user')
    }
  }

  const handleDeleteUser = async (userToDelete) => {
    if (window.confirm(`Remove ${userToDelete.name} from the team?`)) {
      try {
        await api.delete(`/users/${userToDelete.id}`)
        
        // Update tenant users count
        await api.patch(`/tenants/${user.tenantId}`, {
          usersCount: tenant.usersCount - 1
        })
        
        toast.success('User removed successfully')
        fetchData()
      } catch (error) {
        toast.error('Failed to remove user')
      }
    }
  }

  const handleEditUser = (user) => {
    toast.success('Edit user functionality coming soon')
  }

  const handleDeleteTenant = async () => {
    if (window.confirm('Are you sure you want to delete your entire company? This action cannot be undone and will remove all users.')) {
      try {
        // Delete all users
        await Promise.all(users.map(u => api.delete(`/users/${u.id}`)))
        
        // Delete tenant
        await api.delete(`/tenants/${user.tenantId}`)
        
        toast.success('Company deleted successfully')
        // Logout user
        localStorage.removeItem('user')
        window.location.href = '/login'
      } catch (error) {
        toast.error('Failed to delete company')
      }
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
      
      <main className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">Team Management</h1>
              <p className="text-textLight mt-1">Manage your company team members</p>
            </div>
            
            <button
              onClick={() => setShowInviteForm(true)}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <UserPlus size={18} />
              <span>Invite Member</span>
            </button>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <Users size={24} className="text-primary mb-2" />
              <h3 className="text-2xl font-bold">{users.length}</h3>
              <p className="text-textLight text-sm">Total Team Members</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <Mail size={24} className="text-green-600 mb-2" />
              <h3 className="text-2xl font-bold">
                {users.filter(u => u.status === 'active').length}
              </h3>
              <p className="text-textLight text-sm">Active Members</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <Settings size={24} className="text-blue-600 mb-2" />
              <h3 className="text-2xl font-bold">{tenant?.plan || 'Basic'}</h3>
              <p className="text-textLight text-sm">Current Plan</p>
            </motion.div>
          </div>

          {/* Users Table */}
          <UserTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            showTenant={false}
          />

          {/* Danger Zone */}
          <div className="mt-8 card border-red-200">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <AlertTriangle size={20} />
              <h2 className="text-lg font-semibold">Danger Zone</h2>
            </div>
            
            <p className="text-textLight mb-4">
              Once you delete your company, there is no going back. Please be certain.
            </p>
            
            <button
              onClick={handleDeleteTenant}
              className="btn-secondary text-red-600 hover:bg-red-50 border-red-200"
            >
              Delete Entire Company
            </button>
          </div>
        </motion.div>
      </main>

      {/* Invite User Modal */}
      {showInviteForm && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInviteForm(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold mb-6">Invite Team Member</h2>
              
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textLight mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteData.name}
                    onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textLight mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteData.email}
                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                    className="input-field"
                    placeholder="john@company.com"
                  />
                </div>

                <div className="bg-sidebar rounded-xl p-4 border border-border">
                  <p className="text-sm text-textLight">
                    Default password: <span className="font-mono">user123</span>
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default TenantUsers
