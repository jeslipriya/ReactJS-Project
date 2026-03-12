import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  UserCircle,
  Mail,
  Calendar,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

const UserTable = ({ 
  users, 
  onEdit, 
  onDelete, 
  showTenant = true,
  onBulkAction 
}) => {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const usersPerPage = 10

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin':
        return 'badge-success'
      case 'tenant':
        return 'badge-warning'
      default:
        return 'badge'
    }
  }

  const getStatusBadgeColor = (status) => {
    return status === 'active' ? 'badge-success' : 'badge-error'
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(search.toLowerCase()))
  )

  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(currentUsers.map(u => u.id))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
      setSelectAll(false)
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleBulkDelete = () => {
    if (selectedUsers.length > 0) {
      onBulkAction?.(selectedUsers)
      setSelectedUsers([])
      setSelectAll(false)
    }
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm text-textLight">
              {selectedUsers.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="btn-secondary text-red-600 hover:bg-red-50"
            >
              Delete Selected
            </button>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
              </th>
              <th className="text-left pb-3 font-medium">User</th>
              <th className="text-left pb-3 font-medium">Role</th>
              {showTenant && <th className="text-left pb-3 font-medium">Company</th>}
              <th className="text-left pb-3 font-medium">Status</th>
              <th className="text-left pb-3 font-medium">Joined</th>
              <th className="text-right pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {currentUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-sidebar/30 transition-colors"
                >
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=7A5C4D&color=fff`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-textLight">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  {showTenant && (
                    <td className="py-3 text-textLight">
                      {user.tenantId || '-'}
                    </td>
                  )}
                  <td className="py-3">
                    <span className={`badge ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 text-textLight">
                    {user.joinedAt}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 hover:bg-border rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="p-2 hover:bg-border rounded-lg transition-colors text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCircle size={48} className="mx-auto text-textLight mb-4" />
            <p className="text-textLight">No users found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-textLight">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-border rounded-lg transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
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

export default UserTable