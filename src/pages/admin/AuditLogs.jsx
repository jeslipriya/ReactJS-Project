import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  Search, 
  Filter, 
  Download,
  Trash2,
  Calendar,
  User,
  Shield,
  Activity,
  LogIn,
  LogOut,
  UserPlus,
  Edit,
  Trash,
  Plus,
  RefreshCw,
  X
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    logins: 0,
    creations: 0,
    updates: 0,
    deletions: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    user: '',
    role: '',
    dateRange: 'all'
  })
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchLogs()
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000)
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    applyFilters()
  }, [logs, filters, dateRange])

  const fetchLogs = async () => {
    try {
      const response = await api.get('/auditLogs?_sort=timestamp&_order=desc')
      setLogs(response.data)
      calculateStats(response.data)
    } catch (error) {
      toast.error('Failed to fetch audit logs')
    }
  }

  const calculateStats = (logsData) => {
    const now = new Date()
    const today = now.toDateString()
    const weekAgo = new Date(now.setDate(now.getDate() - 7))
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1))

    const stats = {
      total: logsData.length,
      today: logsData.filter(log => new Date(log.timestamp).toDateString() === today).length,
      week: logsData.filter(log => new Date(log.timestamp) >= weekAgo).length,
      month: logsData.filter(log => new Date(log.timestamp) >= monthAgo).length,
      logins: logsData.filter(log => log.action === 'LOGIN').length,
      creations: logsData.filter(log => log.action === 'CREATE').length,
      updates: logsData.filter(log => log.action === 'UPDATE').length,
      deletions: logsData.filter(log => log.action === 'DELETE').length
    }
    setStats(stats)
  }

  const applyFilters = () => {
    let filtered = [...logs]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(log =>
        log.user?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower)
      )
    }

    // Action filter
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action)
    }

    // User filter
    if (filters.user) {
      filtered = filtered.filter(log => log.user === filters.user)
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(log => log.role === filters.role)
    }

    // Date range filter
    if (filters.dateRange === 'custom' && dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start)
      const end = new Date(dateRange.end)
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate >= start && logDate <= end
      })
    } else if (filters.dateRange !== 'all' && filters.dateRange !== 'custom') {
      const now = new Date()
      let cutoff
      switch(filters.dateRange) {
        case 'today':
          cutoff = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          cutoff = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          cutoff = new Date(now.setMonth(now.getMonth() - 1))
          break
      }
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoff)
    }

    setFilteredLogs(filtered)
  }

  const handleDeleteLog = async (logId) => {
    if (window.confirm('Delete this log entry?')) {
      try {
        await api.delete(`/auditLogs/${logId}`)
        toast.success('Log deleted')
        fetchLogs()
      } catch (error) {
        toast.error('Failed to delete log')
      }
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('Clear all audit logs? This action cannot be undone.')) {
      try {
        await Promise.all(logs.map(log => api.delete(`/auditLogs/${log.id}`)))
        toast.success('All logs cleared')
        fetchLogs()
      } catch (error) {
        toast.error('Failed to clear logs')
      }
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ['Timestamp', 'User', 'Role', 'Action', 'Details', 'Device'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.user,
        log.role,
        log.action,
        log.details,
        log.device || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    toast.success('Logs exported successfully')
  }

  const getActionIcon = (action) => {
    switch(action) {
      case 'LOGIN': return <LogIn size={16} className="text-green-600" />
      case 'LOGOUT': return <LogOut size={16} className="text-orange-600" />
      case 'CREATE': return <Plus size={16} className="text-blue-600" />
      case 'UPDATE': return <Edit size={16} className="text-yellow-600" />
      case 'DELETE': return <Trash size={16} className="text-red-600" />
      default: return <Activity size={16} className="text-gray-600" />
    }
  }

  const uniqueUsers = [...new Set(logs.map(log => log.user).filter(Boolean))]

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
              <h1 className="text-3xl font-bold text-text">Audit Logs</h1>
              <p className="text-textLight mt-1">Complete activity tracking with real-time updates</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`btn-secondary flex items-center gap-2 ${autoRefresh ? 'text-primary' : ''}`}
              >
                <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
                <span>{autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}</span>
              </button>
              
              <button
                onClick={handleExportCSV}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
              
              <button
                onClick={handleClearAll}
                className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={18} />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <StatCard label="Total" value={stats.total} icon={History} color="text-primary" />
            <StatCard label="Today" value={stats.today} icon={Calendar} color="text-green-600" />
            <StatCard label="Week" value={stats.week} icon={Calendar} color="text-blue-600" />
            <StatCard label="Month" value={stats.month} icon={Calendar} color="text-purple-600" />
            <StatCard label="Logins" value={stats.logins} icon={LogIn} color="text-green-600" />
            <StatCard label="Creations" value={stats.creations} icon={Plus} color="text-blue-600" />
            <StatCard label="Updates" value={stats.updates} icon={Edit} color="text-yellow-600" />
            <StatCard label="Deletions" value={stats.deletions} icon={Trash} color="text-red-600" />
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-primary" />
              <h2 className="font-medium">Filters</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="input-field"
              />
              
              <select
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
                className="input-field"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="REGISTER">Register</option>
              </select>
              
              <select
                value={filters.user}
                onChange={(e) => setFilters({...filters, user: e.target.value})}
                className="input-field"
              >
                <option value="">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
              
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
                value={filters.dateRange}
                onChange={(e) => {
                  setFilters({...filters, dateRange: e.target.value})
                  setShowDatePicker(e.target.value === 'custom')
                }}
                className="input-field"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4 mt-4"
              >
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="input-field"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="input-field"
                />
              </motion.div>
            )}
          </div>

          {/* Logs Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 font-medium">Timestamp</th>
                    <th className="text-left pb-3 font-medium">User</th>
                    <th className="text-left pb-3 font-medium">Role</th>
                    <th className="text-left pb-3 font-medium">Action</th>
                    <th className="text-left pb-3 font-medium">Details</th>
                    <th className="text-right pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-border last:border-0 hover:bg-sidebar/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="py-3 text-sm">
                          <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="text-xs text-textLight">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="font-medium">{log.user}</div>
                        </td>
                        <td className="py-3">
                          <span className={`badge ${
                            log.role === 'admin' ? 'badge-success' :
                            log.role === 'tenant' ? 'badge-warning' : 'badge'
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span>{log.action}</span>
                          </div>
                        </td>
                        <td className="py-3 text-textLight text-sm max-w-xs truncate">
                          {log.details}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteLog(log.id)
                            }}
                            className="p-2 hover:bg-border rounded-lg transition-colors text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <History size={48} className="mx-auto text-textLight mb-4" />
                  <p className="text-textLight">No logs found</p>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-textLight">
              Showing {filteredLogs.length} of {logs.length} logs
            </div>
          </div>
        </motion.div>
      </main>

      {/* Log Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-card border border-border rounded-xl shadow-soft p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Log Details</h2>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 hover:bg-border rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <DetailRow label="User" value={selectedLog.user} />
                  <DetailRow label="Role" value={selectedLog.role} />
                  <DetailRow label="Action" value={selectedLog.action} />
                  <DetailRow label="Timestamp" value={new Date(selectedLog.timestamp).toLocaleString()} />
                  <DetailRow label="Details" value={selectedLog.details} />
                  {selectedLog.device && <DetailRow label="Device" value={selectedLog.device} />}
                  {selectedLog.ip && <DetailRow label="IP Address" value={selectedLog.ip} />}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="stat-card p-3"
  >
    <Icon size={18} className={`${color} mb-1`} />
    <div className="text-lg font-bold">{value}</div>
    <div className="text-xs text-textLight">{label}</div>
  </motion.div>
)

const DetailRow = ({ label, value }) => (
  <div>
    <span className="text-sm text-textLight">{label}:</span>
    <p className="font-medium">{value}</p>
  </div>
)

export default AuditLogs