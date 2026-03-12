import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, Mail, Crown, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { logTenantCreated } from '../services/auditLogService'

const TenantForm = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'Basic',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newTenant = {
        ...formData,
        id: Date.now().toString(),
        usersCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        logo: `https://ui-avatars.com/api/?name=${formData.name}&background=7A5C4D&color=fff`
      }

      const response = await api.post('/tenants', newTenant)
      
      // Create tenant admin user
      const adminUser = {
        id: (Date.now() + 1).toString(),
        name: `${formData.name} Admin`,
        email: `admin@${formData.email.split('@')[1] || 'company.com'}`,
        password: 'tenant123',
        role: 'tenant',
        tenantId: response.data.id,
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
        avatar: `https://ui-avatars.com/api/?name=${formData.name}+Admin&background=7A5C4D&color=fff`
      }

      await api.post('/users', adminUser)
      
      await logTenantCreated(user, newTenant)
      
      toast.success('Tenant created successfully!')
      onSuccess(response.data)
      onClose()
      
      setFormData({
        name: '',
        email: '',
        plan: 'Basic',
        status: 'active'
      })
    } catch (error) {
      toast.error('Failed to create tenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-soft p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Create New Tenant</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-border rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textLight mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-field pl-10"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textLight mb-1">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-field pl-10"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textLight mb-1">
                    Plan
                  </label>
                  <div className="relative">
                    <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                    <select
                      value={formData.plan}
                      onChange={(e) => setFormData({...formData, plan: e.target.value})}
                      className="input-field pl-10 appearance-none cursor-pointer"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="bg-sidebar rounded-xl p-4 border border-border">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Users size={18} />
                    <span>Auto-created Admin</span>
                  </h3>
                  <p className="text-sm text-textLight">
                    A tenant admin user will be created with email: admin@{formData.email.split('@')[1] || 'company.com'} and password: tenant123
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Tenant'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TenantForm