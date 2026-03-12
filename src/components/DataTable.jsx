import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  X
} from 'lucide-react'

const DataTable = ({ 
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  onBulkAction,
  actions = ['view', 'edit', 'delete'],
  searchable = true,
  filterable = true,
  exportable = true,
  title = "Data Table"
}) => {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({})
  const rowsPerPage = 10

  // Sorting function
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Filtering function
  const filteredData = sortedData.filter(item => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const match = Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchLower)
      )
      if (!match) return false
    }

    // Column filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && item[key] !== value) return false
    }
    return true
  })

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage)

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedData.map(item => item.id))
    }
  }

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const handleExport = () => {
    const exportData = filteredData.map(item => {
      const row = {}
      columns.forEach(col => {
        row[col.header] = item[col.accessor]
      })
      return row
    })

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-export.csv`
    a.click()
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-textLight mt-1">
            {filteredData.length} records found
          </p>
        </div>

        <div className="flex gap-2">
          {exportable && (
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {filterable && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${
                showFilters ? 'bg-primary text-white' : ''
              }`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {searchable && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        )}

        {selectedRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-primary/10 p-2 rounded-lg"
          >
            <span className="text-sm font-medium">
              {selectedRows.length} selected
            </span>
            <button
              onClick={() => onBulkAction?.(selectedRows)}
              className="btn-secondary text-sm py-1"
            >
              Bulk Action
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="p-1 hover:bg-border rounded"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-sidebar rounded-xl p-4 border border-border">
              <h3 className="font-medium mb-3">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {columns.map(col => (
                  col.filterable !== false && (
                    <div key={col.accessor}>
                      <label className="block text-xs text-textLight mb-1">
                        {col.header}
                      </label>
                      <input
                        type="text"
                        placeholder={`Filter by ${col.header}`}
                        value={filters[col.accessor] || ''}
                        onChange={(e) => setFilters({
                          ...filters,
                          [col.accessor]: e.target.value
                        })}
                        className="input-field text-sm"
                      />
                    </div>
                  )
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
              </th>
              {columns.map(col => (
                <th
                  key={col.accessor}
                  className="text-left pb-3 font-medium cursor-pointer hover:text-primary"
                  onClick={() => handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {sortConfig.key === col.accessor && (
                      sortConfig.direction === 'asc' 
                        ? <SortAsc size={14} />
                        : <SortDesc size={14} />
                    )}
                  </div>
                </th>
              ))}
              <th className="text-right pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginatedData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-sidebar/30 transition-colors"
                >
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => handleSelectRow(item.id)}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                  </td>
                  {columns.map(col => (
                    <td key={col.accessor} className="py-3">
                      {col.cell ? col.cell(item) : item[col.accessor]}
                    </td>
                  ))}
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions.includes('view') && (
                        <button
                          onClick={() => onView?.(item)}
                          className="p-2 hover:bg-border rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {actions.includes('edit') && (
                        <button
                          onClick={() => onEdit?.(item)}
                          className="p-2 hover:bg-border rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {actions.includes('delete') && (
                        <button
                          onClick={() => onDelete?.(item)}
                          className="p-2 hover:bg-border rounded-lg transition-colors text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center">
                  <div className="text-textLight">
                    <p>No data found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <p className="text-sm text-textLight">
            Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} records
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-border rounded-lg transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 bg-sidebar rounded-lg text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-border rounded-lg transition-colors disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable