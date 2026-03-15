import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Building2, 
  Users, 
  Mail,
  Crown,
  Calendar,
  Activity,
  Clock,
  Shield,
  Award,
  TrendingUp,
  Settings,
  Bell,
  MessageCircle,
  FileText,
  Briefcase,
  Menu,
  LogIn,
  LogOut
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import StatsCard from '../../components/StatsCard'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

const UserDashboard = () => {
  const { user } = useAuth()
  const [tenant, setTenant] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState({
    teamSize: 0,
    projects: 0,
    tasks: 0,
    meetings: 0
  })
  const [notifications, setNotifications] = useState([])

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
        
        setStats({
          teamSize: usersRes.data.length,
          projects: Math.floor(Math.random() * 10) + 5,
          tasks: Math.floor(Math.random() * 20) + 10,
          meetings: Math.floor(Math.random() * 8) + 2
        })
      }

      // Fetch user activity
      const logsRes = await api.get(`/auditLogs?user=${user.name}&_sort=timestamp&_order=desc&_limit=10`)
      setRecentActivity(logsRes.data)

      // Mock notifications
      setNotifications([
        { id: 1, message: 'Your profile was viewed 5 times today', time: '5 min ago', read: false },
        { id: 2, message: 'New team meeting scheduled', time: '1 hour ago', read: false },
        { id: 3, message: 'Task deadline approaching', time: '3 hours ago', read: true },
      ])
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-40 p-3 bg-primary text-white rounded-xl shadow-soft lg:hidden"
      >
        <Menu size={20} />
      </button>
      
      <main className="flex-1 p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Welcome Header with Notifications */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-textLight mt-1">
                Here's what's happening with your account today.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-border rounded-lg transition-colors">
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="p-2 hover:bg-border rounded-lg transition-colors">
                <Settings size={20} />
              </button>
              <button className="p-2 hover:bg-border rounded-lg transition-colors">
                <MessageCircle size={20} />
              </button>
            </div>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="relative">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=7A5C4D&color=fff&size=128`}
                    alt={user.name}
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl object-cover border-4 border-white shadow-soft"
                  />
                  <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-3">
                    <h2 className="text-2xl lg:text-3xl font-bold">{user.name}</h2>
                    <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'} self-start lg:self-auto`}>
                      {user.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-textLight">
                      <Mail size={16} />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-textLight">
                      <Calendar size={16} />
                      <span className="text-sm">Joined {user.joinedAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-textLight">
                      <Shield size={16} />
                      <span className="text-sm capitalize">{user.role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-textLight">
                      <Award size={16} />
                      <span className="text-sm">Member</span>
                    </div>
                  </div>
                </div>

                <button className="btn-primary self-start lg:self-center">
                  Edit Profile
                </button>
              </div>
            </div>
          </motion.div>

          {tenant ? (
            <>
              {/* Stats Grid for Company Users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Team Size"
                  value={stats.teamSize}
                  icon={Users}
                  color="primary"
                  trend={5}
                  subtitle="Active members"
                />
                <StatsCard
                  title="Active Projects"
                  value={stats.projects}
                  icon={Briefcase}
                  color="blue"
                  trend={2}
                  subtitle="In progress"
                />
                <StatsCard
                  title="Pending Tasks"
                  value={stats.tasks}
                  icon={FileText}
                  color="yellow"
                  trend={-3}
                  subtitle="Due this week"
                />
                <StatsCard
                  title="Meetings"
                  value={stats.meetings}
                  icon={Clock}
                  color="green"
                  trend={1}
                  subtitle="This month"
                />
              </div>

              {/* Company Info and Team Members */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Company Info Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card lg:col-span-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 size={24} className="text-primary" />
                    <h2 className="text-lg font-semibold">Your Company</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-sidebar rounded-xl">
                      <img
                        src={tenant.logo || `https://ui-avatars.com/api/?name=${tenant.name}&background=7A5C4D&color=fff`}
                        alt={tenant.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium">{tenant.name}</h3>
                        <p className="text-xs text-textLight">{tenant.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-sidebar rounded-xl">
                        <Crown size={18} className={
                          tenant.plan === 'Enterprise' ? 'text-yellow-600' :
                          tenant.plan === 'Professional' ? 'text-blue-600' : 'text-gray-600'
                        } />
                        <p className="text-sm font-medium mt-1">{tenant.plan}</p>
                        <p className="text-xs text-textLight">Plan</p>
                      </div>
                      <div className="p-3 bg-sidebar rounded-xl">
                        <Users size={18} className="text-primary" />
                        <p className="text-sm font-medium mt-1">{tenant.usersCount}</p>
                        <p className="text-xs text-textLight">Members</p>
                      </div>
                    </div>

                    <div className="p-3 bg-sidebar rounded-xl">
                      <p className="text-sm text-textLight">Member since</p>
                      <p className="font-medium">{tenant.createdAt}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Team Members Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card lg:col-span-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Users size={24} className="text-primary" />
                      <h2 className="text-lg font-semibold">Team Members</h2>
                    </div>
                    <button className="text-sm text-primary hover:underline">View All</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teamMembers.slice(0, 4).map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-sidebar rounded-xl border border-border hover:shadow-md transition-all"
                      >
                        <img
                          src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=7A5C4D&color=fff`}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{member.name}</div>
                          <div className="text-xs text-textLight truncate">{member.email}</div>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      </motion.div>
                    ))}
                  </div>

                  {teamMembers.length > 4 && (
                    <p className="text-sm text-textLight mt-3 text-center">
                      And {teamMembers.length - 4} more team members...
                    </p>
                  )}
                </motion.div>
              </div>
            </>
          ) : (
            // Independent User View
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card mb-8 text-center py-12"
            >
              <User size={64} className="mx-auto text-textLight mb-4" />
              <h3 className="text-xl font-medium mb-2">Independent User</h3>
              <p className="text-textLight mb-6 max-w-md mx-auto">
                You're currently not associated with any company. Connect with a company to access team features.
              </p>
              <button className="btn-primary">
                Browse Companies
              </button>
            </motion.div>
          )}

          {/* Recent Activity and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-4">
                <Activity size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Your Recent Activity</h2>
              </div>

              <div className="space-y-3">
                {recentActivity.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-sidebar rounded-xl border border-border hover:shadow-md transition-all"
                  >
                    <div className={`p-2 rounded-lg ${
                      log.action === 'LOGIN' ? 'bg-green-100' :
                      log.action === 'LOGOUT' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {log.action === 'LOGIN' && <LogIn size={14} className="text-green-600" />}
                      {log.action === 'LOGOUT' && <LogOut size={14} className="text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{log.details}</p>
                      <p className="text-xs text-textLight mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {recentActivity.length === 0 && (
                  <p className="text-textLight text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-primary" />
                  <h2 className="text-lg font-semibold">Notifications</h2>
                </div>
                <button className="text-sm text-primary hover:underline">Mark all as read</button>
              </div>

              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-xl border transition-all ${
                      notification.read 
                        ? 'bg-sidebar border-border' 
                        : 'bg-primary/5 border-primary/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.read ? 'bg-gray-100' : 'bg-primary/10'
                      }`}>
                        <Bell size={14} className={notification.read ? 'text-gray-600' : 'text-primary'} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-textLight mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default UserDashboard
