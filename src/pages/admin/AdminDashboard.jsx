import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Users, 
  UserCheck, 
  TrendingUp,
  Plus,
  Download,
  BarChart3,
  Activity,
  DollarSign,
  Clock,
  AlertCircle,
  Mail,
  Calendar,
  Globe,
  Shield,
  Trash2,
  Edit,
  Eye,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Settings,
  Bell,
  MessageCircle,
  FileText,
  Briefcase,
  Award,
  Crown,
  Star,
  Gift,
  Zap,
  Target,
  Menu,
  UserPlus,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts'
import Sidebar from '../../components/Sidebar'
import StatsCard from '../../components/StatsCard'
import TenantForm from '../../components/TenantForm'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalUsers: 0,
    activeUsers: 0,
    avgUsersPerTenant: 0,
    revenue: 0,
    growth: 0
  })
  const [tenants, setTenants] = useState([])
  const [users, setUsers] = useState([])
  const [recentLogs, setRecentLogs] = useState([])
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showViewReports, setShowViewReports] = useState(false)
  const [timeRange, setTimeRange] = useState('week')
  const [activityData, setActivityData] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: 'user123',
    role: 'user',
    tenantId: '',
    status: 'active'
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [tenantsRes, usersRes, logsRes] = await Promise.all([
        api.get('/tenants'),
        api.get('/users'),
        api.get('/auditLogs?_limit=20&_sort=timestamp&_order=desc')
      ])

      setTenants(tenantsRes.data)
      setUsers(usersRes.data)
      setRecentLogs(logsRes.data)

      const totalUsers = usersRes.data.length
      const activeUsers = usersRes.data.filter(u => u.status === 'active').length
      const avgUsersPerTenant = tenantsRes.data.length > 0 
        ? (totalUsers / tenantsRes.data.length).toFixed(1)
        : 0

      // Calculate revenue (mock data)
      const revenue = tenantsRes.data.reduce((acc, t) => {
        const planPrices = { Basic: 100, Professional: 300, Enterprise: 1000 }
        return acc + (planPrices[t.plan] || 0)
      }, 0)

      setStats({
        totalTenants: tenantsRes.data.length,
        totalUsers,
        activeUsers,
        avgUsersPerTenant,
        revenue,
        growth: 12.5
      })

      // Generate activity data
      generateActivityData(logsRes.data)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    }
  }

  const generateActivityData = (logs) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const data = last7Days.map(date => {
      const dayLogs = logs.filter(log => log.timestamp.startsWith(date))
      return {
        date,
        logins: dayLogs.filter(l => l.action === 'LOGIN').length,
        creations: dayLogs.filter(l => l.action === 'CREATE').length,
        updates: dayLogs.filter(l => l.action === 'UPDATE').length,
        deletions: dayLogs.filter(l => l.action === 'DELETE').length
      }
    })

    setActivityData(data)
  }

  const fetchLogs = async () => {
    try {
      const response = await api.get('/auditLogs?_limit=10&_sort=timestamp&_order=desc')
      setRecentLogs(response.data)
    } catch (error) {
      console.error('Failed to fetch logs')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const newUser = {
        ...newUserData,
        id: Date.now().toString(),
        joinedAt: new Date().toISOString().split('T')[0],
        avatar: `https://ui-avatars.com/api/?name=${newUserData.name}&background=7A5C4D&color=fff`
      }

      await api.post('/users', newUser)

      // Update tenant users count if tenantId is provided
      if (newUserData.tenantId) {
        const tenant = await api.get(`/tenants/${newUserData.tenantId}`)
        await api.patch(`/tenants/${newUserData.tenantId}`, {
          usersCount: tenant.data.usersCount + 1
        })
      }

      toast.success('User created successfully!')
      setShowUserForm(false)
      setNewUserData({
        name: '',
        email: '',
        password: 'user123',
        role: 'user',
        tenantId: '',
        status: 'active'
      })
      fetchData()
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  const chartData = tenants.slice(0, 5).map(tenant => ({
    name: tenant.name.split(' ')[0],
    users: tenant.usersCount,
    plan: tenant.plan
  }))

  const pieData = [
    { name: 'Active', value: stats.activeUsers, color: '#10B981' },
    { name: 'Inactive', value: stats.totalUsers - stats.activeUsers, color: '#EF4444' }
  ]

  const planDistribution = tenants.reduce((acc, t) => {
    acc[t.plan] = (acc[t.plan] || 0) + 1
    return acc
  }, {})

  const planChartData = Object.entries(planDistribution).map(([name, value]) => ({
    name,
    value,
    color: name === 'Enterprise' ? '#F59E0B' : name === 'Professional' ? '#3B82F6' : '#6B7280'
  }))

  const roleDistribution = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {})

  const roleChartData = Object.entries(roleDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: name === 'admin' ? '#EF4444' : name === 'tenant' ? '#F59E0B' : '#10B981'
  }))

  const handleExportReport = (type) => {
    let data = []
    let filename = ''

    switch(type) {
      case 'comprehensive':
        data = [
          ['Report Type', 'Value'],
          ['Total Tenants', stats.totalTenants],
          ['Total Users', stats.totalUsers],
          ['Active Users', stats.activeUsers],
          ['Monthly Revenue', `$${stats.revenue}`],
          ['Growth Rate', `${stats.growth}%`],
          ['Avg Users/Tenant', stats.avgUsersPerTenant]
        ]
        filename = 'comprehensive-report.csv'
        break
      case 'users':
        data = [
          ['Name', 'Email', 'Role', 'Status', 'Joined'],
          ...users.map(u => [u.name, u.email, u.role, u.status, u.joinedAt])
        ]
        filename = 'users-report.csv'
        break
      case 'tenants':
        data = [
          ['Company', 'Plan', 'Users', 'Status', 'Created'],
          ...tenants.map(t => [t.name, t.plan, t.usersCount, t.status, t.createdAt])
        ]
        filename = 'tenants-report.csv'
        break
      case 'activity':
        data = [
          ['Action', 'User', 'Role', 'Timestamp', 'Details'],
          ...recentLogs.map(l => [l.action, l.user, l.role, l.timestamp, l.details])
        ]
        filename = 'activity-report.csv'
        break
    }

    const csv = data.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    
    toast.success(`${type} report exported successfully!`)
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

      {/* Main Content */}
      <main className="flex-1 w-full min-h-screen overflow-y-auto">
        <div className="p-4 lg:p-8 w-full max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* Header with Welcome and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 w-full">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text">Dashboard</h1>
                <p className="text-textLight mt-1">
                  Welcome back, {user?.name}! Here's what's happening with your platform.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowTenantForm(true)}
                  className="btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none px-6"
                >
                  <Building2 size={18} />
                  <span>New Tenant</span>
                </button>
                <button
                  onClick={() => setShowUserForm(true)}
                  className="btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none px-6 bg-green-600 hover:bg-green-700"
                >
                  <UserPlus size={18} />
                  <span>New User</span>
                </button>
                <button
                  onClick={() => setShowReports(true)}
                  className="btn-secondary flex items-center justify-center gap-2 flex-1 md:flex-none px-6"
                >
                  <Download size={18} />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setShowViewReports(true)}
                  className="btn-secondary flex items-center justify-center gap-2 flex-1 md:flex-none px-6"
                >
                  <BarChart3 size={18} />
                  <span>View Reports</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 w-full">
              <StatsCard
                title="Total Tenants"
                value={stats.totalTenants}
                icon={Building2}
                color="primary"
                trend={8.2}
                subtitle="+2 this month"
              />
              <StatsCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                color="blue"
                trend={12.5}
                subtitle="+28 this week"
              />
              <StatsCard
                title="Active Users"
                value={stats.activeUsers}
                icon={UserCheck}
                color="green"
                trend={15.3}
                subtitle={`${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% active rate`}
              />
              <StatsCard
                title="Monthly Revenue"
                value={`$${stats.revenue}`}
                icon={DollarSign}
                color="yellow"
                trend={5.8}
                subtitle="Avg $2,450 per tenant"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 w-full">
              {/* Users per Tenant Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="card w-full h-[400px]"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h2 className="text-lg font-semibold">Users per Tenant</h2>
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-2 bg-card w-full sm:w-32"
                  >
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6E1DC" />
                      <XAxis dataKey="name" stroke="#7B746E" />
                      <YAxis stroke="#7B746E" />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#FFFFFF', 
                          border: '1px solid #E6E1DC',
                          borderRadius: '14px'
                        }}
                      />
                      <Bar dataKey="users" fill="#7A5C4D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Activity Timeline */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="card w-full h-[400px]"
              >
                <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6E1DC" />
                      <XAxis dataKey="date" stroke="#7B746E" />
                      <YAxis stroke="#7B746E" />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#FFFFFF', 
                          border: '1px solid #E6E1DC',
                          borderRadius: '14px'
                        }}
                      />
                      <Line type="monotone" dataKey="logins" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="creations" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="deletions" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* User Distribution Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card w-full h-[400px]"
              >
                <h2 className="text-lg font-semibold mb-4">User Distribution</h2>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: '#FFFFFF', 
                          border: '1px solid #E6E1DC',
                          borderRadius: '14px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Plan Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card w-full h-[400px]"
              >
                <h2 className="text-lg font-semibold mb-4">Plan Distribution</h2>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <Pie
                        data={planChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {planChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: '#FFFFFF', 
                          border: '1px solid #E6E1DC',
                          borderRadius: '14px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {planChartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              {/* Recent Activity Feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card lg:col-span-2 w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                  </div>
                  <button className="text-sm text-primary hover:underline">View All</button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {recentLogs.slice(0, 5).map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-sidebar rounded-xl border border-border hover:shadow-md transition-all"
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        log.action === 'LOGIN' ? 'bg-green-100' :
                        log.action === 'CREATE' ? 'bg-blue-100' :
                        log.action === 'DELETE' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {log.action === 'LOGIN' && <LogIn size={16} className="text-green-600" />}
                        {log.action === 'CREATE' && <Plus size={16} className="text-blue-600" />}
                        {log.action === 'DELETE' && <Trash2 size={16} className="text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">{log.user}</span>
                          <span className="text-xs text-textLight flex-shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-textLight mt-1 line-clamp-2">{log.details}</p>
                        <span className="text-xs text-primary mt-1 inline-block">
                          {log.action}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card w-full"
              >
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowTenantForm(true)}
                    className="w-full p-3 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all">
                        <Building2 size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Create New Tenant</p>
                        <p className="text-xs text-textLight">Add a new company</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowUserForm(true)}
                    className="w-full p-3 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-all">
                        <UserPlus size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Create New User</p>
                        <p className="text-xs text-textLight">Add a new user to platform</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowReports(true)}
                    className="w-full p-3 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-all">
                        <Download size={18} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Export Reports</p>
                        <p className="text-xs text-textLight">Download data as CSV</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowViewReports(true)}
                    className="w-full p-3 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-all">
                        <BarChart3 size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">View Analytics</p>
                        <p className="text-xs text-textLight">See detailed reports</p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Create Tenant Modal - FIXED: Properly centered */}
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
                {/* This element is to trick the browser into centering the modal contents. */}
                <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block w-full max-w-md p-0 my-8 text-left align-middle transition-all transform bg-card border border-border rounded-xl shadow-soft">
                  <TenantForm
                    isOpen={showTenantForm}
                    onClose={() => setShowTenantForm(false)}
                    onSuccess={() => {
                      fetchData()
                      setShowTenantForm(false)
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create User Modal - FIXED: Properly centered */}
      <AnimatePresence>
        {showUserForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserForm(false)}
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
                
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-card border border-border rounded-xl shadow-soft">
                  <h2 className="text-xl font-semibold mb-6">Create New User</h2>
                  
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-textLight mb-1">
                        Full Name
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
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={newUserData.email}
                        onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                        className="input-field"
                        placeholder="john@example.com"
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
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {newUserData.role === 'user' && (
                      <div>
                        <label className="block text-sm font-medium text-textLight mb-1">
                          Company (Optional)
                        </label>
                        <select
                          value={newUserData.tenantId}
                          onChange={(e) => setNewUserData({...newUserData, tenantId: e.target.value})}
                          className="input-field"
                        >
                          <option value="">No Company</option>
                          {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="bg-sidebar rounded-xl p-4 border border-border">
                      <p className="text-sm text-textLight">
                        Default password: <span className="font-mono">user123</span>
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowUserForm(false)}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 btn-primary"
                      >
                        Create User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Export Reports Modal - FIXED: Properly centered */}
      <AnimatePresence>
        {showReports && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReports(false)}
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
                
                <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-card border border-border rounded-xl shadow-soft">
                  <h2 className="text-xl font-semibold mb-6">Export Reports</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => handleExportReport('comprehensive')}
                      className="p-4 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left"
                    >
                      <BarChart3 size={24} className="text-primary mb-2" />
                      <h3 className="font-medium">Comprehensive Report</h3>
                      <p className="text-sm text-textLight mt-1">Complete platform overview</p>
                    </button>

                    <button
                      onClick={() => handleExportReport('users')}
                      className="p-4 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left"
                    >
                      <Users size={24} className="text-blue-600 mb-2" />
                      <h3 className="font-medium">Users Report</h3>
                      <p className="text-sm text-textLight mt-1">All users data</p>
                    </button>

                    <button
                      onClick={() => handleExportReport('tenants')}
                      className="p-4 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left"
                    >
                      <Building2 size={24} className="text-green-600 mb-2" />
                      <h3 className="font-medium">Tenants Report</h3>
                      <p className="text-sm text-textLight mt-1">Companies data</p>
                    </button>

                    <button
                      onClick={() => handleExportReport('activity')}
                      className="p-4 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left"
                    >
                      <Activity size={24} className="text-purple-600 mb-2" />
                      <h3 className="font-medium">Activity Report</h3>
                      <p className="text-sm text-textLight mt-1">Audit logs data</p>
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowReports(false)}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Reports Modal - FIXED: Properly centered */}
      <AnimatePresence>
        {showViewReports && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowViewReports(false)}
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
                
                <div className="inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform bg-card border border-border rounded-xl shadow-soft max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6 sticky top-0 bg-card pt-2 pb-4 border-b border-border">
                    <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
                    <button
                      onClick={() => setShowViewReports(false)}
                      className="p-2 hover:bg-border rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-sidebar rounded-xl border border-border">
                        <p className="text-sm text-textLight">Total Tenants</p>
                        <p className="text-2xl font-bold mt-1">{stats.totalTenants}</p>
                      </div>
                      <div className="p-4 bg-sidebar rounded-xl border border-border">
                        <p className="text-sm text-textLight">Total Users</p>
                        <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                      </div>
                      <div className="p-4 bg-sidebar rounded-xl border border-border">
                        <p className="text-sm text-textLight">Active Users</p>
                        <p className="text-2xl font-bold mt-1">{stats.activeUsers}</p>
                      </div>
                      <div className="p-4 bg-sidebar rounded-xl border border-border">
                        <p className="text-sm text-textLight">Monthly Revenue</p>
                        <p className="text-2xl font-bold mt-1">${stats.revenue}</p>
                      </div>
                    </div>

                    {/* Role Distribution Chart */}
                    <div className="card p-4">
                      <h3 className="font-medium mb-4">User Role Distribution</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={roleChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label
                            >
                              {roleChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {roleChartData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tenants Table */}
                    <div className="card p-4">
                      <h3 className="font-medium mb-4">Recent Tenants</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left pb-2">Company</th>
                              <th className="text-left pb-2">Plan</th>
                              <th className="text-left pb-2">Users</th>
                              <th className="text-left pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tenants.slice(0, 5).map(tenant => (
                              <tr key={tenant.id} className="border-b border-border last:border-0">
                                <td className="py-2">{tenant.name}</td>
                                <td className="py-2">
                                  <span className={`badge ${
                                    tenant.plan === 'Enterprise' ? 'badge-success' :
                                    tenant.plan === 'Professional' ? 'badge-warning' : 'badge'
                                  }`}>
                                    {tenant.plan}
                                  </span>
                                </td>
                                <td className="py-2">{tenant.usersCount}</td>
                                <td className="py-2">
                                  <span className={`badge ${tenant.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                    {tenant.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Users Table */}
                    <div className="card p-4">
                      <h3 className="font-medium mb-4">Recent Users</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left pb-2">Name</th>
                              <th className="text-left pb-2">Email</th>
                              <th className="text-left pb-2">Role</th>
                              <th className="text-left pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.slice(0, 5).map(user => (
                              <tr key={user.id} className="border-b border-border last:border-0">
                                <td className="py-2">{user.name}</td>
                                <td className="py-2">{user.email}</td>
                                <td className="py-2">
                                  <span className={`badge ${
                                    user.role === 'admin' ? 'badge-success' :
                                    user.role === 'tenant' ? 'badge-warning' : 'badge'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="py-2">
                                  <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                    {user.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
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

export default AdminDashboard
