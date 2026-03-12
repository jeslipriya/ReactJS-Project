import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  TrendingUp,
  Mail,
  Building2,
  Crown,
  Activity
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TenantDashboard = () => {
  const { user } = useAuth()
  const [tenant, setTenant] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  })

  useEffect(() => {
    fetchTenantData()
  }, [])

  const fetchTenantData = async () => {
    try {
      // Fetch tenant details
      const tenantRes = await api.get(`/tenants/${user.tenantId}`)
      setTenant(tenantRes.data)

      // Fetch team members
      const usersRes = await api.get(`/users?tenantId=${user.tenantId}`)
      setTeamMembers(usersRes.data)

      // Calculate stats
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      setStats({
        total: usersRes.data.length,
        active: usersRes.data.filter(u => u.status === 'active').length,
        newThisMonth: usersRes.data.filter(u => new Date(u.joinedAt) >= firstDayOfMonth).length
      })
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text">Tenant Dashboard</h1>
            <p className="text-textLight mt-1">Welcome back, {user?.name}</p>
          </div>

          {/* Company Info Card */}
          {tenant && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card mb-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={tenant.logo || `https://ui-avatars.com/api/?name=${tenant.name}&background=7A5C4D&color=fff`}
                    alt={tenant.name}
                    className="w-16 h-16 rounded-xl"
                  />
                  <div>
                    <h2 className="text-2xl font-semibold">{tenant.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-textLight">
                        <Mail size={16} />
                        <span>{tenant.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Crown size={16} className={
                          tenant.plan === 'Enterprise' ? 'text-yellow-600' :
                          tenant.plan === 'Professional' ? 'text-blue-600' : 'text-gray-600'
                        } />
                        <span className="text-sm">{tenant.plan} Plan</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`badge ${tenant.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                  {tenant.status}
                </span>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="text-primary" size={24} />
                <span className="text-xs font-medium text-textLight bg-sidebar px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
              <p className="text-textLight text-sm">Team Members</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="text-green-600" size={24} />
                <span className="text-xs font-medium text-textLight bg-sidebar px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.active}</h3>
              <p className="text-textLight text-sm">Active Users</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <UserPlus className="text-blue-600" size={24} />
                <span className="text-xs font-medium text-textLight bg-sidebar px-2 py-1 rounded-full">
                  New
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.newThisMonth}</h3>
              <p className="text-textLight text-sm">Joined This Month</p>
            </motion.div>
          </div>

          {/* Team Members Preview */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Recent Team Members</h2>
            
            <div className="space-y-3">
              {teamMembers.slice(0, 5).map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-sidebar rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=7A5C4D&color=fff`}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-textLight">{member.email}</div>
                    </div>
                  </div>
                  <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                    {member.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default TenantDashboard