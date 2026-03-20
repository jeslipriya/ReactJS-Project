import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Lock, Building2, UserPlus, Sparkles, 
  Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight,
  Shield, Users, Briefcase
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    tenantId: ''
  })
  const [tenants, setTenants] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
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

  // Password strength calculator
  useEffect(() => {
    calculatePasswordStrength(formData.password)
  }, [formData.password])

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(Math.min(strength, 4))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (formData.role === 'user' && !formData.tenantId) {
      newErrors.tenantId = 'Please select a company'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
      setRegistrationSuccess(true)
      // Reset form after successful registration
      setTimeout(() => {
        setRegistrationSuccess(false)
      }, 3000)
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500']
    return colors[passwordStrength] || 'bg-gray-300'
  }

  const getPasswordStrengthText = () => {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    return texts[passwordStrength]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-sidebar flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/5 via-transparent to-primary/5 rounded-full blur-3xl"
        />
      </div>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {registrationSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            <span>Registration successful! Redirecting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <motion.div 
          className="card p-8 backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl"
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-textLight">Join MultiTenant and start your journey</p>
          </motion.div>

          {/* Submit Error */}
          <AnimatePresence>
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm"
              >
                <AlertCircle size={16} />
                <span>{errors.submit}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-textLight mb-2">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight group-focus-within:text-primary transition-colors duration-200" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`input-field pl-10 transition-all duration-200 focus:shadow-lg ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-medium text-textLight mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight group-focus-within:text-primary transition-colors duration-200" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`input-field pl-10 transition-all duration-200 focus:shadow-lg ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-textLight mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight group-focus-within:text-primary transition-colors duration-200" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`input-field pl-10 pr-10 transition-all duration-200 focus:shadow-lg ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textLight hover:text-primary transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-textLight">
                    Strength: <span className={passwordStrength >= 3 ? 'text-green-500' : 'text-orange-500'}>
                      {getPasswordStrengthText()}
                    </span>
                  </p>
                </div>
              )}
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <label className="block text-sm font-medium text-textLight mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight group-focus-within:text-primary transition-colors duration-200" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className={`input-field pl-10 pr-10 transition-all duration-200 focus:shadow-lg ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textLight hover:text-primary transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </motion.div>

            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-textLight mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'user'})}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                    formData.role === 'user'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-textLight'
                  }`}
                >
                  <Users size={18} />
                  <span className="text-sm font-medium">User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'tenant'})}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                    formData.role === 'tenant'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-textLight'
                  }`}
                >
                  <Briefcase size={18} />
                  <span className="text-sm font-medium">Tenant Admin</span>
                </button>
              </div>
            </motion.div>

            {/* Company Selection (for users) */}
            <AnimatePresence>
              {formData.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-textLight mb-2">
                    Select Company
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight group-focus-within:text-primary transition-colors duration-200" size={18} />
                    <select
                      value={formData.tenantId}
                      onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                      className={`input-field pl-10 appearance-none cursor-pointer transition-all duration-200 focus:shadow-lg ${errors.tenantId ? 'border-red-500 focus:border-red-500' : ''}`}
                    >
                      <option value="">Select a company</option>
                      {tenants.map(tenant => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.tenantId && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 mt-1"
                    >
                      {errors.tenantId}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              >
                <UserPlus size={18} />
              </motion.div>
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>
          </form>

          {/* Login Link */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-textLight">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1 group">
                Login here
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  →
                </motion.span>
              </Link>
            </p>
          </motion.div>

          {/* Features Section */}
          <motion.div 
            className="mt-8 p-4 bg-sidebar rounded-xl border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary" />
              <h3 className="font-bold text-sm">Why join MultiTenant?</h3>
            </div>
            <div className="space-y-2 text-xs text-textLight">
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                <span>Multi-tenant architecture support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                <span>Role-based access control</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                <span>Secure authentication system</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                <span>Enterprise-grade features</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="text-center text-textLight/60 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Register
