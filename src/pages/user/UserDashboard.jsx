import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Building2, 
  Users, 
  Mail,
  Crown,
  Calendar,
  Activity
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

const UserDashboard = () => {
  const { user } = useAuth()
  const [tenant, setTenant] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (user.tenantId) {
        const [tenantRes, usersRes] = await Promise.all([
          api.get(`/tenants/${user.tenantId}`),
          api.get(`/users?tenantId=${user.tenantId}`)
        ])
        setTenant(tenantRes.data)
        setTeamMembers(usersRes.data.filter(u => u.id !== user.id))
      }

      // Fetch user activity
      const logsRes = await api.get(`/auditLogs?user=${user.name}&_sort=timestamp&_order=desc&_limit=5`)
      setRecentActivity(logsRes.data)
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
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-textLight mt-1">Here's your personal dashboard</p>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex items-center gap-6">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=7A5C4D&color=fff`}
                alt={user.name}
                className="w-20 h-20 rounded-xl"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-textLight">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-textLight">
                    <Calendar size={16} />
                    <span>Joined {user.joinedAt}</span>
                  </div>
                </div>
              </div>
              <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                {user.status}
              </span>
            </div>
          </motion.div>

          {tenant ? (
            <>
              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card mb-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Building2 size={24} className="text-primary" />
                  <h2 className="text-xl font-semibold">Your Company</h2>
                </div>
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{tenant.name}</h3>
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
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span className="text-sm">{tenant.usersCount} team members</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Team Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card mb-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Users size={24} className="text-primary" />
                  <h2 className="text-xl font-semibold">Your Teammates</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teamMembers.slice(0, 4).map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-sidebar rounded-xl border border-border"
                    >
                      <img
                        src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=7A5C4D&color=fff`}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-textLight">{member.email}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {teamMembers.length > 4 && (
                  <p className="text-sm text-textLight mt-3">
                    And {teamMembers.length - 4} more team members...
                  </p>
                )}
              </motion.div>
            </>
          ) : (
            // Independent User
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card mb-8"
            >
              <div className="text-center py-8">
                <User size={48} className="mx-auto text-textLight mb-4" />
                <h3 className="text-lg font-medium mb-2">Independent User</h3>
                <p className="text-textLight">
                  You're not associated with any company yet.
                </p>
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-4 mb-4">
              <Activity size={24} className="text-primary" />
              <h2 className="text-xl font-semibold">Your Recent Activity</h2>
            </div>

            <div className="space-y-3">
              {recentActivity.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-sidebar rounded-xl border border-border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{log.action}</span>
                    <span className="text-xs text-textLight">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-textLight">{log.details}</p>
                </motion.div>
              ))}

              {recentActivity.length === 0 && (
                <p className="text-textLight text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default UserDashboard