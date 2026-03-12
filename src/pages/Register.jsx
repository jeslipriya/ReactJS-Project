import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Building2, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    tenantId: ''
  })
  const [tenants, setTenants] = useState([])
  const { register } = useAuth()

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.get('/tenants')
        setTenants(response.data)
      } catch (error) {
        console.error('Failed to fetch tenants')
      }
    }
    fetchTenants()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    register(formData)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
            <p className="text-textLight">Join MultiTenant today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textLight mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textLight mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textLight mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textLight mb-1">
                Role
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="input-field pl-10 appearance-none cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="tenant">Tenant Admin</option>
                </select>
              </div>
            </div>

            {formData.role === 'user' && (
              <div>
                <label className="block text-sm font-medium text-textLight mb-1">
                  Company (Optional)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                  <select
                    value={formData.tenantId}
                    onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                    className="input-field pl-10 appearance-none cursor-pointer"
                  >
                    <option value="">No Company</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              <span>Register</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-textLight">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register