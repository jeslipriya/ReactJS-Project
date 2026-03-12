import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Building2, Mail, Crown, Users, Phone, Globe, Briefcase } from 'lucide-react'
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
    status: 'active',
    phone: '',
    website: '',
    industry: '',
    address: ''
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
        logo: `https://ui-avatars.com/api/?name=${formData.name}&background=7A5C4D&color=fff&size=128`
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
        avatar: `https://ui-avatars.com/api/?name=${formData.name}+Admin&background=7A5C4D&color=fff&size=128`
      }

      await api.post('/users', adminUser)
      
      await logTenantCreated(user, newTenant)
      
      toast.success('Tenant created successfully!')
      onSuccess(response.data)
      
      setFormData({
        name: '',
        email: '',
        plan: 'Basic',
        status: 'active',
        phone: '',
        website: '',
        industry: '',
        address: ''
      })
    } catch (error) {
      toast.error('Failed to create tenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold">Create New Tenant</h2>
          <p className="text-sm text-textLight mt-1">Add a new company to the platform</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-border rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-textLight mb-1">
              Company Name <span className="text-red-500">*</span>
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

          {/* Contact Email */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-textLight mb-1">
              Contact Email <span className="text-red-500">*</span>
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

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-textLight mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input-field pl-10"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-textLight mb-1">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="input-field pl-10"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-textLight mb-1">
              Industry
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="input-field pl-10"
                placeholder="Technology"
              />
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-textLight mb-1">
              Plan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
              <select
                required
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

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-textLight mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="input-field"
              rows="2"
              placeholder="123 Business St, City, State 12345"
            />
          </div>
        </div>

        {/* Auto-created Admin Info */}
        <div className="bg-sidebar rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-primary" />
            <h3 className="font-medium">Auto-created Admin Account</h3>
          </div>
          <p className="text-sm text-textLight">
            A tenant admin user will be automatically created with:
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <p><span className="font-medium">Email:</span> admin@{formData.email.split('@')[1] || 'company.com'}</p>
            <p><span className="font-medium">Password:</span> <span className="font-mono">tenant123</span></p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Building2 size={18} />
                <span>Create Tenant</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TenantForm