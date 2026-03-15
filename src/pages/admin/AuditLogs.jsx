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
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  AlertCircle,
  Menu
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [logToDelete, setLogToDelete] = useState(null)
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [logsPerPage] = useState(20)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
  }, [logs, filters, dateRange, sortConfig])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/auditLogs?_sort=timestamp&_order=desc')
      setLogs(response.data)
      calculateStats(response.data)
    } catch (error) {
      toast.error('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (logsData) => {
    const now = new Date()
    const today = now.toDateString()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(now)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

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

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(log =>
        log.user?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower) ||
        log.ip?.toLowerCase().includes(searchLower) ||
        log.device?.toLowerCase().includes(searchLower)
      )
    }

    // Apply action filter
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action)
    }

    // Apply user filter
    if (filters.user) {
      filtered = filtered.filter(log => log.user === filters.user)
    }

    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter(log => log.role === filters.role)
    }

    // Apply date range filter
    if (filters.dateRange === 'custom' && dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start)
      start.setHours(0, 0, 0, 0)
      const end = new Date(dateRange.end)
      end.setHours(23, 59, 59, 999)
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

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      if (sortConfig.key === 'timestamp') {
        aValue = new Date(a.timestamp || 0).getTime()
        bValue = new Date(b.timestamp || 0).getTime()
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredLogs(filtered)
    setCurrentPage(1)
  }

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const handleDeleteClick = (log) => {
    setLogToDelete(log)
    setShowDeleteConfirm(true)
  }

  const handleDeleteLog = async () => {
    if (!logToDelete) return

    try {
      setLoading(true)
      await api.delete(`/auditLogs/${logToDelete.id}`)
      toast.success('Log deleted successfully')
      setShowDeleteConfirm(false)
      setLogToDelete(null)
      fetchLogs()
    } catch (error) {
      toast.error('Failed to delete log')
    } finally {
      setLoading(false)
    }
  }

  const handleClearAllClick = () => {
    setShowClearAllConfirm(true)
  }

  const handleClearAll = async () => {
    try {
      setLoading(true)
      await Promise.all(logs.map(log => api.delete(`/auditLogs/${log.id}`)))
      toast.success('All logs cleared successfully')
      setShowClearAllConfirm(false)
      fetchLogs()
    } catch (error) {
      toast.error('Failed to clear logs')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ['Timestamp', 'User', 'Role', 'Action', 'Details', 'IP Address', 'Device'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.user,
        log.role,
        log.action,
        log.details,
        log.ip || 'N/A',
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
      case 'REGISTER': return <UserPlus size={16} className="text-purple-600" />
      default: return <Activity size={16} className="text-gray-600" />
    }
  }

  const getDeviceIcon = (device) => {
    if (!device) return <Monitor size={14} className="text-textLight" />
    if (device.includes('Mobile') || device.includes('Android') || device.includes('iPhone')) 
      return <Smartphone size={14} className="text-textLight" />
    if (device.includes('iPad') || device.includes('Tablet')) 
      return <Tablet size={14} className="text-textLight" />
    return <Monitor size={14} className="text-textLight" />
  }

  const uniqueUsers = [...new Set(logs.map(log => log.user).filter(Boolean))]

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)

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
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text">Audit Logs</h1>
                <p className="text-textLight mt-1">Complete activity tracking with real-time updates</p>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`btn-secondary flex items-center justify-center gap-2 px-4 ${
                    autoRefresh ? 'text-primary border-primary/30 bg-primary/5' : ''
                  }`}
                >
                  <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">{autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}</span>
                </button>
                
                <button
                  onClick={handleExportCSV}
                  className="btn-secondary flex items-center justify-center gap-2 px-4"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                
                <button
                  onClick={handleClearAllClick}
                  className="btn-secondary text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 px-4"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
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
            <div className="card mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={18} className="text-primary" />
                <h2 className="font-medium">Filters</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="input-field pl-10 w-full"
                  />
                </div>
                
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
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
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
                        <th 
                          className="text-left pb-3 font-medium cursor-pointer hover:text-primary"
                          onClick={() => handleSort('timestamp')}
                        >
                          <div className="flex items-center gap-2">
                            Timestamp
                            {sortConfig.key === 'timestamp' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="text-left pb-3 font-medium cursor-pointer hover:text-primary"
                          onClick={() => handleSort('user')}
                        >
                          <div className="flex items-center gap-2">
                            User
                            {sortConfig.key === 'user' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            )}
                          </div>
                        </th>
                        <th className="text-left pb-3 font-medium">Role</th>
                        <th 
                          className="text-left pb-3 font-medium cursor-pointer hover:text-primary"
                          onClick={() => handleSort('action')}
                        >
                          <div className="flex items-center gap-2">
                            Action
                            {sortConfig.key === 'action' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            )}
                          </div>
                        </th>
                        <th className="text-left pb-3 font-medium">Details</th>
                        <th className="text-left pb-3 font-medium">Device</th>
                        <th className="text-right pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {currentLogs.map((log, index) => (
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
                              <div className="text-xs text-textLight flex items-center gap-1">
                                <Clock size={10} />
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
                            <td className="py-3">
                              <div className="flex items-center gap-2 text-textLight">
                                {getDeviceIcon(log.device)}
                                <span className="text-xs truncate max-w-[100px]">
                                  {log.device ? log.device.split(' ')[0] : 'Unknown'}
                                </span>
                                {log.ip && (
                                  <>
                                    <Globe size={12} />
                                    <span className="text-xs">{log.ip}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClick(log)
                                }}
                                className="p-2 hover:bg-border rounded-lg transition-colors text-red-600"
                                title="Delete Log"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>

                      {currentLogs.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-12 text-center">
                            <History size={48} className="mx-auto text-textLight mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Logs Found</h3>
                            <p className="text-textLight">Try adjusting your filters</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredLogs.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <p className="text-sm text-textLight">
                      Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 btn-secondary disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 bg-sidebar rounded-lg text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 btn-secondary disabled:opacity-50"
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

      {/* Log Details Modal - Fixed Centering */}
      <AnimatePresence>
        {selectedLog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
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
                <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-soft overflow-hidden">
                  <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-semibold">Log Details</h2>
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="p-2 hover:bg-border rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-sm text-textLight">User</p>
                        <p className="font-medium mt-1">{selectedLog.user}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-sm text-textLight">Role</p>
                        <p className="mt-1">
                          <span className={`badge ${
                            selectedLog.role === 'admin' ? 'badge-success' :
                            selectedLog.role === 'tenant' ? 'badge-warning' : 'badge'
                          }`}>
                            {selectedLog.role}
                          </span>
                        </p>
                      </div>
                      
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-sm text-textLight">Action</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getActionIcon(selectedLog.action)}
                          <span className="font-medium">{selectedLog.action}</span>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-sm text-textLight">Timestamp</p>
                        <p className="font-medium mt-1">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <p className="text-sm text-textLight">Details</p>
                        <p className="font-medium mt-1 p-3 bg-sidebar rounded-lg">{selectedLog.details}</p>
                      </div>
                      
                      {selectedLog.device && (
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-sm text-textLight">Device</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getDeviceIcon(selectedLog.device)}
                            <p className="font-medium text-sm">{selectedLog.device}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedLog.ip && (
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-sm text-textLight">IP Address</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Globe size={14} className="text-textLight" />
                            <p className="font-medium">{selectedLog.ip}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end p-6 border-t border-border bg-sidebar/30">
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="btn-secondary px-6"
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

      {/* Delete Confirmation Modal - Fixed Centering */}
      <AnimatePresence>
        {showDeleteConfirm && logToDelete && (
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
                <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-soft overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                      <AlertCircle size={24} />
                      <h2 className="text-xl font-semibold">Delete Log Entry</h2>
                    </div>

                    <p className="text-textLight mb-2">
                      Are you sure you want to delete this log entry?
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
                        onClick={handleDeleteLog}
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation Modal - Fixed Centering */}
      <AnimatePresence>
        {showClearAllConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearAllConfirm(false)}
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
                <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-soft overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                      <AlertCircle size={24} />
                      <h2 className="text-xl font-semibold">Clear All Logs</h2>
                    </div>

                    <p className="text-textLight mb-2">
                      Are you sure you want to clear all audit logs?
                    </p>
                    <p className="text-sm text-red-600 mb-6">
                      This action cannot be undone. {logs.length} logs will be permanently deleted.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowClearAllConfirm(false)}
                        className="flex-1 btn-secondary py-3"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleClearAll}
                        disabled={loading}
                        className="flex-1 btn-primary bg-red-600 hover:bg-red-700 py-3 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            <span>Clearing...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={18} />
                            <span>Clear All</span>
                          </>
                        )}
                      </button>
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

const StatCard = ({ label, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="stat-card p-4"
  >
    <Icon size={20} className={`${color} mb-2`} />
    <div className="text-xl font-bold">{value}</div>
    <div className="text-xs text-textLight mt-1">{label}</div>
  </motion.div>
)

export default AuditLogs
