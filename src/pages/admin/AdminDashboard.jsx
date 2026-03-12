import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Users, 
  UserCheck, 
  TrendingUp,
  Plus,
  Download,
  BarChart3,
  Activity
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import Sidebar from '../../components/Sidebar'
import TenantForm from '../../components/TenantForm'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalUsers: 0,
    activeUsers: 0,
    avgUsersPerTenant: 0
  })
  const [tenants, setTenants] = useState([])
  const [recentLogs, setRecentLogs] = useState([])
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [showReports, setShowReports] = useState(false)
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
        api.get('/auditLogs?_limit=10&_sort=timestamp&_order=desc')
      ])

      setTenants(tenantsRes.data)
      setRecentLogs(logsRes.data)

      const totalUsers = usersRes.data.length
      const activeUsers = usersRes.data.filter(u => u.status === 'active').length
      const avgUsersPerTenant = tenantsRes.data.length > 0 
        ? (totalUsers / tenantsRes.data.length).toFixed(1)
        : 0

      setStats({
        totalTenants: tenantsRes.data.length,
        totalUsers,
        activeUsers,
        avgUsersPerTenant
      })
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await api.get('/auditLogs?_limit=10&_sort=timestamp&_order=desc')
      setRecentLogs(response.data)
    } catch (error) {
      console.error('Failed to fetch logs')
    }
  }

  const chartData = tenants.slice(0, 5).map(tenant => ({
    name: tenant.name.split(' ')[0],
    users: tenant.usersCount
  }))

  const handleExportCSV = (type) => {
    let data = []
    let filename = ''

    switch(type) {
      case 'users':
        data = [
          ['Name', 'Email', 'Role', 'Status', 'Joined'],
          ...users.map(u => [u.name, u.email, u.role, u.status, u.joinedAt])
        ]
        filename = 'users-report.csv'
        break
      case 'tenants':
        data = [
          ['Company', 'Email', 'Plan', 'Users', 'Status', 'Created'],
          ...tenants.map(t => [t.name, t.email, t.plan, t.usersCount, t.status, t.createdAt])
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
              <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
              <p className="text-textLight mt-1">Welcome back, {user?.name}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowTenantForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                <span>New Tenant</span>
              </button>
              <button
                onClick={() => setShowReports(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <BarChart3 size={18} />
                <span>Reports</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <Building2 className="text-primary" size={24} />
                <span className="text-xs font-medium text-textLight bg-sidebar px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.totalTenants}</h3>
              <p className="text-textLight text-sm">Total Tenants</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="text-primary" size={24} />
                <span className="text-xs font-medium text-textLight bg-sidebar px-2 py-1 rounded-full">
                  All Users
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              <p className="text-textLight text-sm">Total Users</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="text-primary" size={24} />
                <span className="text-xs font-medium text-textLight bg-sidebar px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
              <p className="text-textLight text-sm">Active Users</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-primary" size={24} />
                <span className="text-xs font-medium text-textLight bg-sidebar px-2 py-1 rounded-full">
                  Average
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.avgUsersPerTenant}</h3>
              <p className="text-textLight text-sm">Avg Users/Tenant</p>
            </motion.div>
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card lg:col-span-2"
            >
              <h2 className="text-lg font-semibold mb-4">Users per Tenant (Top 5)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
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

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Recent Activity</h2>
              </div>
              
              <div className="space-y-3">
                {recentLogs.slice(0, 5).map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-sidebar rounded-xl border border-border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{log.user}</span>
                      <span className="text-xs text-textLight">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-textLight">{log.details}</p>
                    <span className="text-xs text-primary mt-1 inline-block">
                      {log.action}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Tenant Form Modal */}
      <TenantForm
        isOpen={showTenantForm}
        onClose={() => setShowTenantForm(false)}
        onSuccess={() => {
          fetchData()
          setShowTenantForm(false)
        }}
      />

      {/* Reports Modal */}
      {showReports && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReports(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold mb-6">Export Reports</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleExportCSV('users')}
                  className="p-4 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left"
                >
                  <Users size={24} className="text-primary mb-2" />
                  <h3 className="font-medium">Users Report</h3>
                  <p className="text-sm text-textLight mt-1">Export all users data</p>
                </button>

                <button
                  onClick={() => handleExportCSV('tenants')}
                  className="p-4 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left"
                >
                  <Building2 size={24} className="text-primary mb-2" />
                  <h3 className="font-medium">Tenants Report</h3>
                  <p className="text-sm text-textLight mt-1">Export companies data</p>
                </button>

                <button
                  onClick={() => handleExportCSV('activity')}
                  className="p-4 bg-sidebar rounded-xl border border-border hover:border-primary/30 transition-all text-left"
                >
                  <Activity size={24} className="text-primary mb-2" />
                  <h3 className="font-medium">Activity Report</h3>
                  <p className="text-sm text-textLight mt-1">Export audit logs</p>
                </button>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowReports(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard